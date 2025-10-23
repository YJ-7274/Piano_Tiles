import {ATexture} from "../../index";
import {ASerializable, AShaderMaterial, AShaderModelBase, GetAppState} from "../../index";
import { ABlinnPhongShaderModel} from "../../rendering/shadermodels";

@ASerializable("StandardTexturedShaderModel")
export class StandardTexturedShaderModel extends ABlinnPhongShaderModel{
    /**
     * When you create a material model, you can provide additional arguments.
     * Here, if the caller provides diffuseTexture, the 'diffuse' texture of the material will automatically be set
     * @param diffuseTexture
     * @param args
     * @constructor
     */
    CreateMaterial(diffuseTexture?:ATexture, ...args:any[]){
        let mat = super.CreateMaterial(...args);
        if(diffuseTexture !== undefined) {
            mat.setTexture('diffuse', diffuseTexture);
        }
        return mat;
    }
}
