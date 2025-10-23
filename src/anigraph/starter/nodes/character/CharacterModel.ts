import {ANodeModel3D, AShaderModel, Color, V3, Vec3} from "../../../index";
import {CharacterInterface} from "./CharacterInterface";
import {CharacterMaterial, CharacterShaderModel} from "./CharacterShaderModel";



export class CharacterModel extends ANodeModel3D implements CharacterInterface{
    static ShaderModelClass:(typeof AShaderModel)=CharacterShaderModel;
    static ShaderModel:AShaderModel;
    static async LoadShaderModel(name?:string, ...args:any[]){
        if(this.ShaderModel == undefined) {
            this.ShaderModel = await this.ShaderModelClass.CreateModel(name??"charactershader", ...args)
        }
    }
    static CreateMaterial(...args:any[]):CharacterMaterial{
        return (this.ShaderModel.CreateMaterial(...args) as CharacterMaterial);
    }

    _characterColor!:Color;
    /** Get set characterColor */
    getCharacterColor(){
        return this._characterColor;
    }
    setCharacterColor(c:Color){
        this._characterColor = c;
        (this.material as CharacterMaterial).setCharacterColor(c);
    }

    mass:number=1;
    velocity:Vec3 = V3();

    get worldPosition(){
        return this.getWorldTransform().getPosition();
    }

    get position(){
        return this.transform.getPosition();
    }
    set position(value:Vec3){
        this.transform.setPosition(value);
    }
}

export interface CharacterModelInterface extends CharacterModel{
}
