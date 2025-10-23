import {Mat3, NodeTransform2D, TransformationInterface} from "../../math";
import {ANodeModel2D} from "./ANodeModel2D";
import {PRSA2DModelInterface} from "./PRSA2DModelInterface";
import {ASerializable} from "../../base";

@ASerializable("ANodeModel2DPRSA")
export class ANodeModel2DPRSA extends ANodeModel2D implements PRSA2DModelInterface{
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
