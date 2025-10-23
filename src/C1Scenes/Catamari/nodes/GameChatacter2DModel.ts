import {TexturedPolygon2DModel} from "../../../anigraph/starter/nodes/textured";
import {Mat3, NodeTransform2D, TransformationInterface} from "../../../anigraph";
import {Polygon2DModel} from "../../../anigraph/starter/nodes/polygon2D";

export class GameChatacter2DModel extends TexturedPolygon2DModel{
    lastUpdateTime:number=0;

    /**
     * You could optionally force the class to use Mat3 or NodeTransform2D
     */

    // get transform(): Mat3 {
    //     return this._transform as Mat3;
    // }
    // setTransformToIdentity(){
    //     this._transform = new Mat3();
    // }
    //
    // setTransform(transform:TransformationInterface){
    //     if(transform instanceof NodeTransform2D){
    //         this._transform = transform.getMatrix();
    //         return;
    //     }else if(transform instanceof Mat3) {
    //         this._transform = transform;
    //     }else{
    //         let m3 = new Mat3();
    //         let m4 = transform.getMat4()
    //         m3.m00 = m4.m00;
    //         m3.m10 = m4.m10;
    //         m3.m01 = m4.m01;
    //         m3.m11 = m4.m11;
    //         m3.c2 = m4.c3.Point3D;
    //         this._transform = m3;
    //     }
    // }


    timeUpdate(t:number){
        this.lastUpdateTime = t;
    }

    /**
     * Adds the provided Polygon2DModel as a child, and sets the child's parent to be this.
     * @param newChild
     */
    adoptChild(newChild:Polygon2DModel){
        // newChild.reparent(this, false);
        newChild.reparent(this);
    }

    /**
     * Should:
     * - Test for intersection,
     * - Use adoptChild to make the target a new child if there is an intersection,
     * - Update the target's transform so that adopting it does not change its world transform
     * - Return true if target gets rolled up, false otherwise
     * @param target
     * @returns {boolean}
     */
    rollItUp(target:Polygon2DModel):boolean{
        let intersection = this.getIntersectionsWith(target);
        if(intersection.length == 0){
            return false;
        }

        let targetTransform = target.getWorldTransform2D();
        let myTransform = this.getWorldTransform2D();
        let newTransform = myTransform.getInverse().times(targetTransform);
        this.adoptChild(target);
        target.setTransform(newTransform);
        target.zValue=0;
        return true;
    }

    getWorldTransform(): Mat3 {
        return this.getWorldTransform2D();
    }

}
