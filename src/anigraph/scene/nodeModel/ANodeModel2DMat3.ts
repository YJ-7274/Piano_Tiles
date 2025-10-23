import {Mat3, NodeTransform2D, TransformationInterface} from "../../math";
import {ANodeModel2D} from "./ANodeModel2D";


export class ANodeModel2DMat3 extends ANodeModel2D{
    get transform(): Mat3 {
        return this._transform as Mat3;
    }
    setTransformToIdentity(){
        this._transform = new Mat3();
    }
    setTransform(transform:TransformationInterface){
        return this.setTransformMat3(transform);
    }
}
