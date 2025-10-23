import {ATexture} from "../ATexture";
import {ABlinnPhongShaderModel} from "./ABlinnPhongShaderModel";

export class ABasicTexturedShaderModel extends ABlinnPhongShaderModel{
    CreateMaterial(diffuseTexture?:ATexture, ...args:any[]){
        let mat = super.CreateMaterial(...args);
        if(diffuseTexture !== undefined) {
            mat.setTexture('diffuse', diffuseTexture);
        }
        return mat;
    }
}



