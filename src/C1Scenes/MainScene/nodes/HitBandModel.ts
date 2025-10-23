import {ASerializable, Color, Polygon2D} from "../../../anigraph";
import {Polygon2DModelPRSA} from "../../../anigraph/starter/nodes/polygon2D/Polygon2DModelPRSA";

@ASerializable("HitBandModel")
export class HitBandModel extends Polygon2DModelPRSA {
    constructor(width: number, height: number) {
        const bandColor = new Color(0.3, 0.6, 1.0, 0.2);
        super(Polygon2D.ColoredRectangle(width, height, bandColor));
    }
}