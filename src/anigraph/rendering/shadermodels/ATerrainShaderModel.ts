import {AShaderMaterial, AShaderModel, AShaderModelBase, ShaderManager} from "../material";
import {ATexture} from "../ATexture";
import * as THREE from "three";
import {ABasicTexturedShaderModel} from "./ABasicTexturedShaderModel";


export class ATerrainShaderModel extends ABasicTexturedShaderModel{
    CreateMaterial(
        diffuseTexture:ATexture,
        heightTexture?:ATexture,
        texCoordScale:number=10.0,
        ...args:any[]){
        let mat = super.CreateMaterial();
        mat.setTexture('diffuse', diffuseTexture);
        mat.setUniform("texCoordScale", texCoordScale)
        if(heightTexture){
            mat.setTexture('height', heightTexture)
        }
        return mat;
    }
}
