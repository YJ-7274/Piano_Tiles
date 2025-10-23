import * as THREE from "three";
import {PixelData} from "./pixeldata";
import {ATexture} from "../ATexture";
import {Color} from "../../math";


export class ADataTexture<T extends PixelData<any>> extends ATexture{
    static _support_checked:boolean=false;
    static _TextureFloatSupport:any;
    pixelData!:T;
    get width(){
        return this.pixelData.width;
    }
    get height(){
        return this.pixelData.height;
    }
    get nChannels(){
        return this.pixelData.nChannels;
    }


    /** Get set threejs */
    set threejs(value:THREE.DataTexture){this._threejs = value;}
    get threejs(){return this._threejs as THREE.DataTexture;}


    setTextureNeedsUpdate(v:boolean=true){
        this.threejs.needsUpdate=true;
    }

    static CheckWebGLSupport(renderer:THREE.WebGLRenderer){
        if(!ADataTexture._support_checked) {
            ADataTexture._TextureFloatSupport = renderer.getContext().getExtension('OES_texture_float') &&
                renderer.context.getExtension('OES_texture_float_linear');
            ADataTexture._support_checked = true;
        }
    }

    setPixelData(data:T){
        this.pixelData=data;
        this._CreateThreeJSTexture();
    }

    constructor(data?:T, ...args:any[]) {
        super();
        if(data){
            this.setPixelData(data);
        }
    }

    _CreateThreeJSTexture(){
        if(this.threejs){
            throw new Error("Tried to create data texture but already have one!")
        }
        this._setTHREETexture(this.pixelData.GetTHREEDataTexture());
        this.setTextureNeedsUpdate();
    }

    setPixelNN(x: number, y: number, value: ArrayLike<number> & ArrayLike<bigint> | number | Color) {
        if (value instanceof Color) {
            this.pixelData.setPixelNN(x, y, [value.r, value.g, value.b, value.a]);
        } else {
            // @ts-ignore
            this.pixelData.setPixelNN(x, y, value);
            // this.setTextureNeedsUpdate();
        }
    }

    getPixelNN(x:number,y:number){
        return this.pixelData.getPixelNN(x,y);
    }
}







