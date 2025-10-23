import {ANodeModel2D} from "./ANodeModel2D";
import {ASerializable} from "../../base";
import {Mat3, NodeTransform2D, type TransformationInterface} from "../../math";

@ASerializable("AGroupNodeModel2D")
export class AGroupNodeModel2D extends ANodeModel2D{
}

/**
 * If you don't define a new ASerializable label, then the class will inherit its parent's
 */
export class AGroupNodePRSAModel2D extends AGroupNodeModel2D{
    get transform(): NodeTransform2D {
        return this._transform as NodeTransform2D;
    }
    setTransformToIdentity(){
        this._transform = new NodeTransform2D();
    }
    setTransform(transform:TransformationInterface){
        return this.setTransformPRSA(transform);
    }
}

/**
 * If you don't define a new ASerializable label, then the class will inherit its parent's
 */
export class AGroupNodeMat3Model2D extends AGroupNodeModel2D{
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
