import {AShaderMaterial, AShaderModel} from "../material";
import {GetAAppState} from "../../appstate/AAppState";
import {ABasicDiffuseShaderModel, DiffuseMaterial} from "./ABasicDiffuseShaderModel";
import {BlinnPhongShaderAppState, ClassInterface} from "../../basictypes";
import {GUISpecs} from "../../GUISpecs";
import {BlinnPhongDefaults} from "../../defines";

export class BlinnPhongMaterial extends DiffuseMaterial{
    setSpecular(v:number){
        this.setUniform(BlinnPhongShaderAppState.Specular, v)
    }
    setSpecularExp(v:number){
        this.setUniform(BlinnPhongShaderAppState.SpecularExp, v)
    }
    getSpecular(){
        return this.getUniformValue(BlinnPhongShaderAppState.Specular)
    }
    getSpecularExp(){
        return this.getUniformValue(BlinnPhongShaderAppState.SpecularExp)
    }
}




export class ABlinnPhongShaderModel extends ABasicDiffuseShaderModel{
    ShaderMaterialClass:ClassInterface<AShaderMaterial>=BlinnPhongMaterial;
    static ShaderAppState = BlinnPhongShaderAppState;
    static _blinnPhongAppStateAdded:boolean=false;
    static ControlSpecFolderName:string="BlinnPhong"

    static AddAppState(...args:any[]){
        let appState = GetAAppState();
        this._blinnPhongAppStateAdded = true;
        appState.addControlSpecGroup(
            ABlinnPhongShaderModel.ControlSpecFolderName,
            {
                Ambient : appState.CreateControlPanelSliderSpec(ABlinnPhongShaderModel.ShaderAppState.Ambient, BlinnPhongDefaults.Ambient, 0.0, 1.0, 0.001),
                Diffuse : appState.CreateControlPanelSliderSpec(ABlinnPhongShaderModel.ShaderAppState.Diffuse, BlinnPhongDefaults.Diffuse, 0.0, 1.0, 0.001),
                Specular: appState.CreateControlPanelSliderSpec(ABlinnPhongShaderModel.ShaderAppState.Specular, BlinnPhongDefaults.Specular, 0.0, 1.0, 0.001),
                SpecularExp: appState.CreateControlPanelSliderSpec(ABlinnPhongShaderModel.ShaderAppState.SpecularExp, BlinnPhongDefaults.SpecularExp, 0.0, 20.0, 0.01),
            }
        )
    }

    static async CreateModel(shaderName?:string, addAppState=false,...args:any[]){
        if(shaderName === undefined){
            console.log(`No shader name given!`);
            shaderName = "basic";
        }
        if(addAppState && !this._blinnPhongAppStateAdded){
            this.AddAppState();
        }
        await AShaderModel.ShaderSourceLoaded(shaderName);
        return new this(shaderName, ...args);
    }


    static attachMaterialUniformsToAppState(mat:AShaderMaterial){
        super.attachMaterialUniformsToAppState(mat);
        mat.attachUniformToAppState(ABlinnPhongShaderModel.ShaderAppState.Specular)
        mat.attachUniformToAppState(ABlinnPhongShaderModel.ShaderAppState.SpecularExp)

        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABlinnPhongShaderModel.ShaderAppState.Ambient, ABlinnPhongShaderModel.ControlSpecFolderName))
        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABlinnPhongShaderModel.ShaderAppState.Diffuse, ABlinnPhongShaderModel.ControlSpecFolderName))
        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABlinnPhongShaderModel.ShaderAppState.Specular, ABlinnPhongShaderModel.ControlSpecFolderName))
        // mat.attachUniformToAppState(GUISpecs.KeyNameInFolder(ABlinnPhongShaderModel.ShaderAppState.SpecularExp, ABlinnPhongShaderModel.ControlSpecFolderName))

    }

    CreateMaterial(uniforms:{[name:string]:any}={}, ...args:any[]){
        let defaults = {
            specular: BlinnPhongDefaults.Specular,
            specularExp:BlinnPhongDefaults.SpecularExp
        };
        return super.CreateMaterial(Object.assign(defaults, uniforms), ...args);
    }


}



