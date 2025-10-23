import {Mat4, Matrix, TransformationInterface} from "../../math";
import {VertexArray} from "../../geometry";
import {ANodeModel} from "./ANodeModel";



export abstract class ANodeModelSubclass<TransformType extends TransformationInterface, VertexArrayType extends VertexArray<any>> extends ANodeModel{
    get transform():TransformType{
        return this._transform as TransformType;
    };
    abstract setTransform(transform:TransformType):void;
    abstract setTransformToIdentity():void;
    abstract getWorldTransform():TransformationInterface;

    protected set transform(t:TransformType){
        this.setTransform(t);
    }

    get verts(): VertexArrayType{
        return this._geometry.verts as VertexArrayType;
    }

    _setVerts(verts: VertexArrayType) {
        this._geometry.verts=verts;
    }
    setVerts(verts: VertexArrayType) {
        this._setVerts(verts);
        this.signalGeometryUpdate();
    }

    constructor(verts?:VertexArrayType, transform?:TransformType) {
        super();
        if(transform !== undefined){
            this.setTransform(transform);
            // this._transform = transform;
        }else{
            //setTransform can always take a TransformationInterface, so we can use it here regardless of TransformType
            // this.setTransform();
            this.setTransformToIdentity();
        }
        if(verts !== undefined){
            this._setVerts(verts);
        }
    }

    // /**
    //  * Returns the transform from object coordinates (the coordinate system where this.verts is
    //  * defined) to world coordinates
    //  * @returns {TransformType}
    //  */
    // getWorldTransform():Matrix{
    //     let parent = this.parent;
    //     if(parent && parent instanceof ANodeModelSubclass){
    //         // return parent.getWorldTransform().getMat4().times(this.transform.getMat4());
    //         return parent.getWorldTransform().times(this.transform.getMatrix());
    //
    //     }else{
    //         return this.transform.getMatrix();
    //     }
    // }



}
