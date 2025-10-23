import * as THREE from "three";
import {AObject} from "../../base";
import {ASerializable} from "../../base";
import {AMultiPass} from "./AMultiPass";
import {ACamera} from "../../math";
import {ASceneElement} from "../graphicobject";
import {ACameraElement} from "../ACameraElement";

export type ARenderPassCallFunc = (multipass?:AMultiPass, ...args:any[])=>any;

@ASerializable("ARenderPassData")
export class ARenderPassData extends AObject{
    name!:string;
    // public passVars:{[name:string]:any}={};
    _scene!:ASceneElement;
    _camera!:ACameraElement|undefined;
    _target:THREE.WebGLRenderTarget|null=null;

    get target(){
        return this._target;
    }

    set target(target:THREE.WebGLRenderTarget|null){
        this._target = target;
    }

    constructor(scene?:ASceneElement|THREE.Scene, camera?:ACameraElement|THREE.Camera, target?:THREE.WebGLRenderTarget){
        super();
        if(scene){this.setScene(scene)};
        this.setCamera(camera);
        this._target = target??null;
    }

    setScene(scene:ASceneElement|THREE.Scene){
        if(scene instanceof ASceneElement){
            this._scene = scene;
        }else{
            this._scene = new ASceneElement(scene);
        }
    }

    get scene(){
        return this._scene;
    }

    get camera(){
        if(!this._camera){
            return undefined;
        } else{
            return this._camera;
        }
    }

    setCamera(camera?:THREE.Camera|ACameraElement){
        if(camera instanceof THREE.Camera){
            this._camera = new ACameraElement(camera);
        }else if(camera instanceof ACameraElement){
            this._camera = camera;
        }else{
            this._camera = undefined;
        }
    }

    get threeCamera(){
        if(!this._camera){return undefined;}
        return (this._camera instanceof ACamera)?this._camera.CreateThreeJSCamera():this._camera;
    }

    // protected _beforePass!:ARenderPassCallFunc;
    // protected _afterPass!:ARenderPassCallFunc;
    // protected _renderFunc!:ARenderPassCallFunc;
    // render(multipass:AMultiPass, ...args:any[]){
    //     if(this._beforePass){this._beforePass(multipass, ...args)};
    //     this._renderFunc(multipass, ...args);
    //     if(this._afterPass){this._afterPass(multipass, ...args)};
    // }
    // Create(renderFunc:ARenderPassCallFunc, name?:string, beforePass?:ARenderPassCallFunc, afterPass?:ARenderPassCallFunc){
    //     let rpass = new ARenderPassData();
    //     rpass._renderFunc=renderFunc;
    //     if(name){rpass.name=name;}
    //     if(beforePass){rpass._beforePass=beforePass;}
    //     if(afterPass){rpass._afterPass=afterPass};
    // }

}


