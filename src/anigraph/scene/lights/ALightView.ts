import * as THREE from "three";
import {ANodeView} from "../nodeView";
import {ALightModel} from "./ALightModel";

export abstract class ALightView extends ANodeView{
    _light!:THREE.Light;
    get light():THREE.Light{
        return this._light;
    }
    get model():ALightModel{
        return this._model as ALightModel;
    }

    update() {
        this.light.intensity = this.model.intensity
        this.setTransform(this.model.transform);
    }

    setModelListeners() {
        super.setModelListeners();
        const self = this;
        this.subscribe(this.model.addStateKeyListener("intensity", ()=>{
            self.light.intensity = self.model.intensity;
        }), "LIGHT_INTENSITY");
        this.subscribe(this.model.addStateKeyListener("color", ()=>{
            self.light.color = self.model.color.asThreeJS();
        }), "LIGHT_COLOR");
    }
}
