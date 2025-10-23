import {NodeTransform2D} from "../../math";
import {ANodeModel2D} from "./ANodeModel2D";

export interface PRSA2DModelInterface extends ANodeModel2D{
    get transform():NodeTransform2D;
}
