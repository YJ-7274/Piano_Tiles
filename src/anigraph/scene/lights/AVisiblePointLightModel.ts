import {APointLightModel} from "./APointLightModel";
import {ASerializable} from "../../base";

@ASerializable("AVisiblePointLightModel")
export class AVisiblePointLightModel extends APointLightModel{
    radius:number=0.01;
}
