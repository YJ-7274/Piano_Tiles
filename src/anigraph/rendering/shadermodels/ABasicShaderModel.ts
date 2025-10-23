import {AShaderModel} from "../material";
import {BasicDiffuseShaderAppState} from "../../basictypes";
import {GetAAppState} from "../../appstate/AAppState";

export class ABasicDiffuseShaderModel extends AShaderModel{
    static async CreateModel(shaderName?:string, addAppState=true,...args:any[]){
        if(shaderName === undefined){
            shaderName = "basic";
        }
        await AShaderModel.ShaderSourceLoaded(shaderName);
        return new this(shaderName, ...args);
    }

    CreateMaterial(...args:any[]){
        super.CreateMaterial()
        let appState = GetAAppState();
        let mat = super.CreateMaterial();
        return mat;
    }
}



