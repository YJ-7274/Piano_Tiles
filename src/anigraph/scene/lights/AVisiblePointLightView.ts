import {APointLightView} from "./APointLightView";
import ASphereGraphic from "../../rendering/graphicelements/ASphereGraphic";
import {AVisiblePointLightModel} from "./AVisiblePointLightModel";

export class AVisiblePointLightView extends APointLightView{

    get model():AVisiblePointLightModel{
        return this._model as AVisiblePointLightModel;
    }

    init() {
        super.init();
        let sphere = new ASphereGraphic(this.model.radius,this.model.color)
        this.registerAndAddGraphic(sphere);
        this.setTransform(this.model.transform);
    }
}
