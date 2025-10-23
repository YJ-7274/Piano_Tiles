import {
    ANodeModel2D, ANodeModel2DPRSA, ANodeModel3D, ANodeModel,
} from "../../../scene";
import type {TransformationInterface} from "../../../math";
import {ASerializable} from "../../../base";
import {BoundingBox2D, HasBounds2D, Polygon2D, VertexArray} from "../../../geometry";
import {Color, Mat3, Transformation2DInterface, Vec2} from "../../../math";

@ASerializable("Polygon2DModel")
export class Polygon2DModel extends ANodeModel2D{
    _zValue: number = 0;
    set zValue(value) {
        this._zValue = value;
        this.signalGeometryUpdate();
    }

    get verts(): Polygon2D{
        return this._geometry.verts as Polygon2D;
    }

    get zValue() {
        return this._zValue;
    }


    /**
     * Adds the provided Polygon2DModel as a child, and sets the child's parent to be this.
     * @param newChild
     */
    adoptChild(newChild:Polygon2DModel){
        // newChild.reparent(this, false);
        newChild.reparent(this);
    }

    constructor(verts?: Polygon2D, transform?: TransformationInterface, ...args: any[]) {
        super(...args);
        this.setTransform(transform??Mat3.Identity());
        this.setVerts(
            verts??Polygon2D.CreateForRendering(true, true, false)
        )
    }

    getTransform3D() {
        return this.transform.getMat4();
    }

    /**
     * Iterate through vertices and set their colors
     * @param color
     */
    setUniformColor(color:Color){
        this.verts.FillColor(color);
    }


//     ///////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Returns the transform from object coordinates (the coordinate system where this.verts is
     * defined) to world coordinates
     * @returns {Mat3}
     */
    getWorldTransform2D():Mat3{
        let parent = this.parent;
        if(parent instanceof ANodeModel3D){
            throw new Error("3D Node models not supported in C1!")
        }
        if(parent && (parent instanceof ANodeModel2D || parent instanceof ANodeModel2DPRSA)){
            return parent.getWorldTransform().times(this.transform.getMatrix());
        }else{
            return this.transform.getMatrix();
        }
    }

    /**
     * Should return a list of all intersections with provided other polygon in world coordinates.
     * @param other
     * @returns {Vec2[]}
     */
    getIntersectionsWith(other: Polygon2DModel): Vec2[] {
        let thisGeometry = this.verts.GetTransformedBy(this.getWorldTransform2D());
        let otherGeometry = other.verts.GetTransformedBy(other.getWorldTransform2D());
        return thisGeometry.getIntersectionsWithPolygon(otherGeometry);
    }


}


