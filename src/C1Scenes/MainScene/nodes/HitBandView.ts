import {ASerializable} from "../../../anigraph";
import {Polygon2DView} from "../../../anigraph/starter/nodes/polygon2D/Polygon2DView";
import {HitBandModel} from "./HitBandModel";

@ASerializable("HitBandView")
export class HitBandView extends Polygon2DView {
    get model(): HitBandModel {
        return this._model as HitBandModel;
    }
}