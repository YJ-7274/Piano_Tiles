import {ANodeModel3D} from "../../nodeModel";
import {Mat4} from "../../../math";
import {ASerializable} from "../../../base";
import {AMaterial} from "../../../rendering";
import {NodeTransform3D} from "../../../math";

@ASerializable("AUnitQuadModel")
export class UnitQuadModel extends ANodeModel3D{
    matrix!:Mat4;
    constructor(material:AMaterial, transform?:NodeTransform3D, ...args:any) {
        super(undefined, transform);
        this.setMaterial(material);
        this.matrix = new Mat4();
    }
}

