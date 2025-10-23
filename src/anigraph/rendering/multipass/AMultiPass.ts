import {v4 as uuidv4} from 'uuid';
import * as THREE from "three";
import {AObject} from "../../base";
import {ASerializable} from "../../base";
import {AMaterialManager, AShaderMaterial} from "../material";
import {WebGLRenderTargetOptions} from "three/src/renderers/WebGLRenderTarget";
import {ASceneElement} from "../graphicobject/ASceneElement";
import {ACameraElement} from "../ACameraElement";

interface RenderPassInterface{
    target?:THREE.WebGLRenderTarget|null,
    dispose():void
}

@ASerializable("AMultiPass")
export class AMultiPass extends AObject{
    renderer!:THREE.WebGLRenderer;
    materialManager:AMaterialManager;
    camera!:ACameraElement;
    _targets:{[name:string]:THREE.WebGLRenderTarget}={};
    _scenes:{[name:string]:ASceneElement}={};
    _cameras:{[name:string]:ACameraElement}={};

    passes:RenderPassInterface[]=[];

    constructor(renderer?:THREE.WebGLRenderer, ...args:any[]) {
        super();
        if(renderer){this.renderer=renderer};
        this.materialManager = new AMaterialManager();
    }

    CreateMaterial(modelName:string, ...args:any[]){
        return this.materialManager.getMaterialModel(modelName).CreateMaterial(...args) as AShaderMaterial;
    }


    // AddNewPass(scene?:ASceneElement|THREE.Main, camera?:ACamera|THREE.Camera, target?:THREE.WebGLRenderTarget){
    //     let newPass = new ARenderPassData(scene, camera, target);
    //     // newPass.setScene(scene??new ASceneElement());
    //     // newPass.setCamera(camera);
    //     // newPass.target = target;
    //     this.AddPass(newPass);
    // }
    //
    // AddPass(pass:ARenderPassData){
    //     this.passes.push(pass);
    // }

    static _CheckVarString(name:string){
        if(name.substr(0,1)=="_"){
            throw new Error(`Name ${name} is no allowed! Strings that begin with "_" are reserved for render pass defaults!`);
        }
    }

    setTarget(name:string, target:THREE.WebGLRenderTarget){
        AMultiPass._CheckVarString(name);
        this._setTarget(name, target);
    }

    _setTarget(name:string, target:THREE.WebGLRenderTarget){
        if(this._targets[name]===target){return;}
        if(!!this._targets[name]){this.disposeTarget(name);}
        this._targets[name]=target;
    }

    _CreateTargetForPassFloat(width:number, height:number){
        return this._CreateTargetFloat(`_pass${this.passes.length}`, width, height);
    }

    CreateTargetFloat(width:number, height:number, name?:string, options?:WebGLRenderTargetOptions){
        if(name){
            AMultiPass._CheckVarString(name);
        }else{
            name = uuidv4();
        }
        return this._CreateTargetFloat(name, width, height, options);
    }

    _CreateTargetFloat(name:string, width:number, height:number, options?:WebGLRenderTargetOptions){
        if(this.getTarget(name)){
            throw new Error(`Target "${name} already created!"`);
        }
        let defaultOptions = {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        }
        let op = defaultOptions;
        if(options){
            op = {...op, ...options};
        }
        this._setTarget(name, new THREE.WebGLRenderTarget(width,height,{
            ...op,
        }))

        return this.getTarget(name);
    }

    createTargetUByte(name:string, width:number, height:number, options?:WebGLRenderTargetOptions){
        AMultiPass._CheckVarString(name);
        let defaultOptions = {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
        }
        let op = defaultOptions;
        if(options){
            op = {...op, ...options};
        }
        this.setTarget(name, new THREE.WebGLRenderTarget(width,height,{
            ...op,
        }))
    }

    getTarget(name:string){
        return this._targets[name];
    }

    setScene(name:string, scene:THREE.Scene|ASceneElement){
        AMultiPass._CheckVarString(name);
        if(this._scenes[name]===scene){return;}
        let sceneElement = (scene instanceof ASceneElement)?scene:new ASceneElement(scene);
        this._scenes[name]=sceneElement;
    }

    getScene(name:string){
        return this._scenes[name];
    }

    setCamera(name:string, camera:THREE.Camera|ACameraElement){
        AMultiPass._CheckVarString(name);
        if(this._cameras[name]===camera||this._cameras[name].threejs===camera){return;}
        if(camera instanceof THREE.Camera) {
            this._cameras[name] = new ACameraElement(camera);
        }else if(camera instanceof ACameraElement){
            this._cameras[name]= camera;
        }else{
            throw new Error("unrecognized camera type");
        }
    }

    getCamera(name:string){
        return this._cameras[name];
    }

    getTHREECamera(name:string):THREE.Camera{
        let cam = this.getCamera(name);
        return cam.threejs;
    }

    // getACamera(name:string) {
    //     let cam = this.getCamera(name);
    //     return (cam instanceof ACamera) ? cam : ((cam instanceof THREE.OrthographicCamera) ? new AOrthoCamera(cam) : new APerspectiveCamera(cam));
    // }

    disposeTarget(name:string){
        this._targets[name].dispose();
        delete this._targets[name];
    }

    _disposeTargets(){
        for(let targetName in this._targets) {
            this.disposeTarget(targetName);
        }
    }

    dispose(){
        this._disposeTargets();
        for(let p of this.passes){
            p.dispose();
        }
        this.passes = [];
    }

}
