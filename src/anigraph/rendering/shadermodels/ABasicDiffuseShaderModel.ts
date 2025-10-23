import {AShaderMaterial, AShaderModel} from "../material";
import {GetAAppState} from "../../appstate/AAppState";
import {BasicDiffuseShaderAppState} from "../../basictypes";
import {GUISpecs} from "../../GUISpecs";
import {BlinnPhongDefaults} from "../../defines";

export class DiffuseMaterial extends AShaderMaterial{
    setDiffuse(v:number){
        this.setUniform(BasicDiffuseShaderAppState.Diffuse, v)
    }
    getDiffuse(){
        return this.getUniformValue(BasicDiffuseShaderAppState.Diffuse)
    }
    setAmbient(v:number){
        this.setUniform(BasicDiffuseShaderAppState.Ambient, v)
    }
    getAmbient(){
        return this.getUniformValue(BasicDiffuseShaderAppState.Ambient)
    }
}

export class ABasicDiffuseShaderModel extends AShaderModel{
    static ShaderAppState = BasicDiffuseShaderAppState;
    static _basicAppStateAdded:boolean=false;
    static ControlSpecFolderName:string="Basic"

    static AddAppState(...args:any[]){
        let appState = GetAAppState();
        this._basicAppStateAdded = true;
        appState.addControlSpecGroup(
            ABasicDiffuseShaderModel.ControlSpecFolderName,
            {
                Ambient : appState.CreateControlPanelSliderSpec(ABasicDiffuseShaderModel.ShaderAppState.Ambient, BlinnPhongDefaults.Ambient, 0.0, 1.0, 0.001),
                Diffuse : appState.CreateControlPanelSliderSpec(ABasicDiffuseShaderModel.ShaderAppState.Diffuse, BlinnPhongDefaults.Diffuse, 0.0, 1.0, 0.001),
            }
        )
    }

    static async CreateModel(shaderName?:string, addAppState=true,...args:any[]){
        if(shaderName === undefined){
            shaderName = "basic";
        }
        if(addAppState && !this._basicAppStateAdded){
            this.AddAppState();
        }
        await AShaderModel.ShaderSourceLoaded(shaderName);
        return new this(shaderName, ...args);
    }

    static attachMaterialUniformsToAppState(mat:AShaderMaterial){
        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABasicDiffuseShaderModel.ShaderAppState.Diffuse, ABasicDiffuseShaderModel.ControlSpecFolderName))
        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABasicDiffuseShaderModel.ShaderAppState.Diffuse, ABasicDiffuseShaderModel.ControlSpecFolderName))
        mat.attachUniformToAppState(ABasicDiffuseShaderModel.ShaderAppState.Ambient)
        mat.attachUniformToAppState(ABasicDiffuseShaderModel.ShaderAppState.Diffuse)
    }


    CreateMaterial(uniforms:{[name:string]:any}={}, ...args:any[]){
        let defaults = {
            diffuse: BlinnPhongDefaults.Diffuse,
            ambient: BlinnPhongDefaults.Ambient
        };
        return super.CreateMaterial(Object.assign(defaults, uniforms), ...args);
    }
}



