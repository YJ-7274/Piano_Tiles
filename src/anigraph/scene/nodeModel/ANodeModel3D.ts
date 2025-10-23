import {Mat3, Mat4, NodeTransform3D, TransformationInterface} from "../../math";
import {VertexArray3D, BoundingBox2D, BoundingBox3D, HasBounds} from "../../geometry";
import {ANodeModelSubclass} from "./NodeModelSubclass";
import {ASerializable} from "../../base";
import {ANodeModel2DPRSA} from "./ANodeModel2DPRSA";
import type {Transformation3DInterface}  from "../../math";

@ASerializable("ANodeModel3D")
export class ANodeModel3D extends ANodeModelSubclass<Transformation3DInterface, VertexArray3D> implements HasBounds {
    constructor(verts?:VertexArray3D, transform?:Transformation3DInterface, ...args:any) {
        super(verts, transform);
        this._setVerts(new VertexArray3D());
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds(): BoundingBox3D {
        return this.getBounds3D();
    }

    get zValue(){
        return this.transform.getPosition().z;
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox2D}
     */
    getBounds2D(): BoundingBox2D {
        let tpoint = new VertexArray3D()
        tpoint.position = this.verts.position.GetTransformedByMatrix(this.transform.getMat4());
        return tpoint.getBounds().getBoundsXY();
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds3D(): BoundingBox3D {
        // let b = this.verts.getBounds();
        let b = this.geometry.getBounds()
        b.transform = this.transform.getMat4();
        return b;
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBoundsXY(): BoundingBox2D {
        return this.getBounds3D().getBoundsXY();
    }

    setTransformToIdentity(){
        // this._transform = Mat4.Identity();
        this._transform = new NodeTransform3D();
    }

    setTransform(transform: TransformationInterface): void {
        this._transform = transform;
        // if(transform instanceof NodeTransform3D){
        //     this._transform = transform;
        // }else {
        //     this._transform = NodeTransform3D.FromPoseMatrix(transform.getMat4())
        // }
    }

    /**
     * Projects the current transform to a PRSA node transformation.
     * If it is currently a Mat4, this may change the pose of the model
     * @private
     */
    _projectTransformToPRSA(){
        if(this.transform instanceof NodeTransform3D){
            return
        }else{
            this.transform = NodeTransform3D.FromMatrix(this.transform as Mat4);
        }
    }

    /**
     * Gets a NodeTransform3D representing the model's transform. Warning: this may be a projection if the current transform is defined as a Mat4!
     * @returns {NodeTransform3D | (TransformType & NodeTransform3D)}
     */
    getTransformAsPRSA():NodeTransform3D{
        if(this.transform instanceof NodeTransform3D){
            return this.transform;
        }else{
            return NodeTransform3D.FromMatrix(this.transform as Mat4);
        }
    }

    /**
     * If the current transform is defined as a NodeTransform3D, it converts it to a Mat4.
     */
    setTransformToMat4(){
        if(this.transform instanceof Mat4){
            return;
        }else{
            this.transform = this.transform.getMat4();
        }
    }

    /**
     * Returns the transform from object coordinates (the coordinate system where this.verts is
     * defined) to world coordinates
     * @returns {TransformType}
     */
    getWorldTransform():Mat4{
        let parent = this.parent;
        if(parent && parent instanceof ANodeModelSubclass){
            return parent.getWorldTransform().getMat4().times(this.transform.getMat4());
        }else{
            return this.transform.getMat4();
        }
    }

}



