import {Polygon2DModel} from "./Polygon2DModel";
import {Mat3, NodeTransform2D, TransformationInterface} from "../../../math";
import {ASerializable} from "../../../base";
import {PRSA2DModelInterface} from "../../../scene/nodeModel/PRSA2DModelInterface";

@ASerializable("Polygon2DPRSAModel")
export class Polygon2DModelPRSA extends Polygon2DModel implements PRSA2DModelInterface{
    get transform(): NodeTransform2D {
        return this._transform as NodeTransform2D;
    }
    setTransformToIdentity(){
        this._transform = new NodeTransform2D();
    }

    setTransform(transform:TransformationInterface){
        if(transform instanceof NodeTransform2D){
            this._transform = transform;
            return;
        }else if(transform instanceof Mat3) {
            this._transform = NodeTransform2D.FromMatrix(transform);
        }else{
            let m3 = new Mat3();
            let m4 = transform.getMat4()
            m3.m00 = m4.m00;
            m3.m10 = m4.m10;
            m3.m01 = m4.m01;
            m3.m11 = m4.m11;
            m3.c2 = m4.c3.Point3D;
            this._transform = NodeTransform2D.FromMatrix(m3);
        }
    }
}

