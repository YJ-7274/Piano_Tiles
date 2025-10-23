import * as THREE from "three";
import {PixelData} from "./PixelData";

export class PixelDataFloat4D extends PixelData<Float32Array>{

    get _threeformat(){
        return THREE.RGBAFormat;
    }
    get _threetype(){
        return THREE.FloatType;
    }


    get nChannels(){return 4;}
    constructor(width?:number, height?:number, data?:Float32Array, ...args:any[]) {
        super(width, height, 4, data);
    }
    static CreateBlock(width:number, height:number, data:Float32Array, ...args:any[]){
        return new this(width, height, data, ...args);
    }
}
