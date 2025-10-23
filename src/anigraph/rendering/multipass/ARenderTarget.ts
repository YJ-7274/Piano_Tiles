import {AObject, ASerializable} from "../../base";
import * as THREE from "three";
import {ATexture} from "../ATexture";
import type {WebGLRenderTargetOptions} from "three/src/renderers/WebGLRenderTarget";
import {RenderTargetInterface} from "../../scene";


@ASerializable("ARenderTarget")
export class ARenderTarget extends AObject implements RenderTargetInterface{
    name!: string;
    _target: THREE.WebGLRenderTarget | null = null;
    _targetTexture!:ATexture;


    useAsRenderTarget(renderer: THREE.WebGLRenderer){
        renderer.setRenderTarget(this.target);
    }

    render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.useAsRenderTarget(renderer);
        renderer.render(scene, camera);
    }

    get target() {
        return this._target;
    }

    get targetTexture(){
        return this._targetTexture;
    }

    set target(target: THREE.WebGLRenderTarget | null) {
        this._target = target;
        if (this._target) {
            this._targetTexture = new ATexture(this._target.texture);
        }
    }

    static CreateFloatRGBATarget(width:number, height:number){
        return new ARenderTarget(width, height, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        })
    }

    constructor(width:number, height:number, options?:WebGLRenderTargetOptions) {
        super();
        let defaultOptions = {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearMipmapLinearFilter
        }
        let op = defaultOptions;
        if(options){
            op = {...op, ...options};
        }
        this.target = new THREE.WebGLRenderTarget(width, height, {...op});
        this.targetTexture.setMinFilter(op["minFilter"])
        this.targetTexture.setMagFilter(op["magFilter"]);
    }

    GetTargetPixels(renderer: THREE.WebGLRenderer) {
        let target = this.target;
        if (target === null) {
            return;
        }
        // let pixels = new Uint8Array(target.width * target.height * 4);
        let pixels = new Float32Array(target.width * target.height * 4)
        renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, pixels);
        return pixels;
    }

    dispose() {
        if (this.target) {
            this.target.dispose();
        }
        super.release();
    }





}
