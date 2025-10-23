import * as THREE from "three";
import {AObject} from "../../base";
import {PixelData} from "./pixeldata";

// type AImageDataArray=Float32Array|Float64Array|Uint8Array|Uint16Array;



export abstract class AImageData<PixelType extends PixelData<any>> extends AObject{
    pixels!:PixelType;
    start_x!:number;
    start_y!:number;
    width!:number;
    height!:number;
    // abstract initPixels(width:number, height:number, channels?:number, data?:T, ...args:any[]):void;
    // getRegion(x:number,y:number, width?:number,height?:number){
    //     let cfunc:any=(this.constructor as any);
    //     var copy:this = new cfunc();
    //     return
    // }
    //
    //
    // constructor() {
    //     super();
    // }
    //
    //
    // initData(){
    //
    // }
    //
    //
    // init(){
    //
    //
    //     var texture = new THREE.DataTexture(data, w, h, THREE.RGBFormat, THREE.FloatType);
    //     texture.minFilter = THREE.NearestFilter;
    //     texture.magFilter = THREE.NearestFilter;
    //     texture.needsUpdate = true;
    // }

}



