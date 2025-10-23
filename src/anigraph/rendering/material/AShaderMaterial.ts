import {AMaterial} from "./AMaterial";
import {ATexture} from "../ATexture";
import {AAppState, AObjectState} from "../../base";
import {AppState} from "../../appstate/AppState";
import {AShaderModel} from "./AShaderModel";
import type {ShaderUniformDict} from "./AShaderModel";
import * as THREE from "three";
import {Color, V2, Vec2, Vec3, Vec4} from "../../math";
import {TextureKeyForName, TextureProvidedKeyForName, TextureSizeKeyForName} from "../../defines";
import {GetAppState} from "../../appstate";
import {GUISpecs} from "../../GUISpecs";

export class AShaderMaterial extends AMaterial{
    @AObjectState uniforms!:ShaderUniformDict;
    get threejs():THREE.ShaderMaterial{
        return this._material as THREE.ShaderMaterial;
    }

    getUniformValue(name:string) {
        let uniform = this.uniforms[name];
        return uniform?.value;
    }

    // setModelColor(v:Color|THREE.Color){
    //     this.setUniformColor('modelColor', v);
    // }

    setValue(name:string, value:any){
        let vals:{[name:string]:any}={};
        vals[name]=value;
        this.setValues(vals);
    }


    // getModelColor(){
    //     let c = this.getUniformValue('modelColor');
    //     if(c){
    //         return Color.FromThreeJS(c);
    //     }else{
    //         return Color.FromString("#77bb77");
    //     }
    // }

    getUniformColorValue(name:string){
        let v4 = this.getUniformValue(name);
        return Color.FromTHREEVector4(v4);
    }


    public textures:{[name:string]:ATexture|undefined}={};
    get model():AShaderModel{
        return this._model as AShaderModel;
    }

    constructor(...args:any[]) {
        super(...args);
        this.uniforms = {};
    }

    setModel(model: AShaderModel) {
        super.setModel(model);
        this.loadTexturesFromShaderModel(model);
    }


    loadTexturesFromShaderModel(model?:AShaderModel){
        let shader = model??this.model;
        for(let t in shader.textures){
            this.textures[t]=shader.textures[t];
        }
    }

    //##################//--Uniforms--\\##################
    //<editor-fold desc="Uniforms">
    setUniformsDict(uniforms:ShaderUniformDict){
        this.uniforms = uniforms;
    }

    setUniforms(uniforms:ShaderUniformDict){
        if(!this.uniforms){
            this.uniforms = {};
        }
        for (let u in uniforms){
            // @ts-ignore
            this.setUniform(u, uniforms[u].value, uniforms[u].type);
        }
    }

    setDiffuseTexture(texture?:ATexture|string):void{
        return this.setTexture("diffuse", texture);
    }

    setTexture(name:string, texture?:ATexture|string){
        if(texture) {
            if (texture instanceof ATexture) {
                this.textures[name] = texture;
            } else {
                this.textures[name] = new ATexture(texture);
            }
            let tex = this.getTexture(name);
            this.setUniform(TextureKeyForName(name), tex?.threejs, 't');
            this.setUniform(TextureProvidedKeyForName(name), !!tex, 'bool');
            this.setUniform(TextureSizeKeyForName(name), tex?new Vec2(tex.width, tex.height):V2());
        }else if(texture===undefined){
            this.textures[name] = texture;
            this.setUniform(TextureKeyForName(name), null, 't');
            this.setUniform(TextureProvidedKeyForName(name), false, 'bool');
            this.setUniform(TextureSizeKeyForName(name), new Vec2(0,0));
        }
    }

    /**
     * Set the diffuse texture
     * @param value
     */
    set diffuseTexture(value:ATexture|undefined){this.setTexture("diffuse", value);}

    /**
     *
     * @returns {ATexture | undefined}
     */
    get diffuseTexture(){return this.getTexture("diffuse");}




    getTexture(name:string){
        return this.textures[name];
    }

    setUniform(name:string, value:any, type?:string) {
        if(value instanceof Vec3){
            this.setUniform(name, value.asThreeJS(), 'vec3');
            return;
        }
        if(value instanceof Vec4){
            this.setUniform(name, value.asThreeJS(), 'vec4');
            return;
        }
        if(value instanceof Vec2){
            this.setUniform(name, new THREE.Vector2(value.x, value.y), 'vec2');
            return;
        }

        if(value instanceof Color){
            this.setUniform(name, value.Vec4, 'vec4');
            return;
        }

        if(typeof value == "boolean" && type==undefined){
            this.setUniform(name, value, 'bool');
            return;
        }

        // if(Array.isArray(value) && !isNaN(value[0]) && !type){
        //     type = 'fv';
        // }

        let uval: { [name: string]: any } = {value:value};
        if (type !== undefined) {
            uval['type'] = type;
        }
        // @ts-ignore
        this.uniforms[name] = uval;
        if(this.threejs){
            // @ts-ignore
            this.threejs.uniforms[name] = uval;
        }
    }

    setUniform2fv(name:string, value:Vec2){
        this.setUniform(name, new THREE.Vector2(value.x, value.y), 'vec2');
    }

    setUniform3fv(name:string, value:Vec3) {
        this.setUniform(name, value.asThreeJS(), 'vec3');
    }

    setUniform4fv(name:string, value:Vec4) {
        this.setUniform(name, value.asThreeJS(), 'vec4');
    }



    setUniformColor(name:string, value:Color|THREE.Color, alpha:number=1){
        if(value instanceof THREE.Color){
            console.warn("Ambiguous when setting uniform color with three.color: do you want a vec3 or vec4? Setting with AniGraph Color is safer...");
            this.setUniform(name, value, 'vec4');
        }else{
            this.setUniform(name, value.Vec4.asThreeJS(), 'vec4');
        }

    }


    CreateUniformColorControl(uniformName:string, defaultValue?:Color){
        const self = this;
        defaultValue=defaultValue??Color.Green();
        return GUISpecs.ColorControl(
            (c:Color)=>{
                self.setUniformColor(uniformName, c);
            },
            this.getUniformValue(uniformName)??defaultValue
        )
    }

    CreateUniformSliderControl(uniformName:string, initialValue:any, min:number, max:number, step?:number){
        const self = this;
        this.setUniform(uniformName, initialValue);
        return GUISpecs.SliderControl(
            (v:number)=>{
                self.setUniform(uniformName, v);
            },
            initialValue,
            min, max, step
        )
    }

    /**
     *
     * @param uniformName
     * @param stateName
     * @param onChange can be of form (value)=>{self.setUniform(uniformName, value*10.0)}
     */
    attachUniformToAppState(uniformName:string, stateName?:string, onChange?:(value:any)=>void){
        let appState = GetAppState();
        let name = uniformName;
        stateName = stateName??uniformName;
        const self=this;

        onChange = onChange?onChange:(value:any) =>{
            self.setUniform(name, value);
        }

        onChange(appState.getState(stateName));
        self.subscribe(appState.addStateValueListener(stateName, (value:any)=>{
            if(onChange) {
                onChange(value);
            }
        }), `${stateName}_update`);
    }




    //</editor-fold>
    //##################\\--Uniforms--//##################

    // initMaterial(parameters?:MaterialParameters){
    //     let params = {uniforms:this.uniforms};
    //     if(parameters!==undefined){
    //         params = {...params, ...parameters};
    //     }
    //     // this._shaderSource.sourcesLoadedPromise;
    //     this._material = new THREE.ShaderMaterial({
    //             vertexShader:this.model.vertexSource,
    //             fragmentShader:this.model.fragSource,
    //             transparent: true,
    //             lights:true,
    //             ...parameters
    //         }
    //     )
    // }

    // async initMaterialAsync(parameters?:MaterialParameters){
    //     const self = this;
    //     this.model.sourcesLoadedPromise.then(()=>{self.initMaterial();});
    // }

}
