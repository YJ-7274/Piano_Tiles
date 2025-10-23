import {ALightView} from "./ALightView";
import * as THREE from "three";
import {APointLightModel} from "./APointLightModel";

export class APointLightView extends ALightView{

    get light():THREE.PointLight{
        return this._light as THREE.PointLight;
    }

    get model():APointLightModel{
        return this._model as APointLightModel;
    }

    setModelListeners() {
        super.setModelListeners();
    }

    init(): void {
        this._light = new THREE.PointLight(this.model.color.asThreeJS(), this.model.intensity, this.model.distance, this.model.decay);
        this.threejs.add(this.light);
    }

    update(...args: any[]): void {
        super.update();
        this.light.decay = this.model.decay;
        this.light.distance = this.model.distance;
    }

}
