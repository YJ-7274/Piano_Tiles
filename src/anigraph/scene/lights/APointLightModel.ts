import {ALightModel} from "./ALightModel";
import {AObjectState, ASerializable} from "../../base";
import {Color} from "../../math";

import type {TransformationInterface} from "../../math";
import {GetAppState} from "../../appstate";

@ASerializable("APointLightModel")
export class APointLightModel extends ALightModel{

    /**
     * For meaning of these parameters, check out https://threejs.org/docs/#api/en/lights/PointLight
     */

    /**
     * Controls the range of the light.
     */
    @AObjectState distance!:number;
    /**
     * Controls the rate of falloff
     */
    @AObjectState decay!:number;

    constructor(transform?:TransformationInterface, color?:Color, intensity?:number, distance?:number, decay?:number) {
        let appState = GetAppState();
        super(color, intensity);
        if(transform) {
            this.setTransform(transform);
        }
        this.distance = distance??appState.globalScale*5;
        this.decay = decay??1;
        // this.decay = decay??2;
    }


}

