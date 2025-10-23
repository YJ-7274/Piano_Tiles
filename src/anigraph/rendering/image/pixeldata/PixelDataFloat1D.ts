import * as THREE from "three";
import {PixelData} from "./PixelData";

export class PixelDataFloat1D extends PixelData<Float32Array>{

    get _threeformat(){
        return THREE.RedFormat;
    }
    get _threetype(){
        return THREE.FloatType;
    }

    getPixelNN(x:number,y:number){
        let hi = Math.round(y);
        let wi = Math.round(x);
        // @ts-ignore
        // return this.data.slice((hi*(this.width)+wi)*this.nChannels, (hi*(this.width)+wi+1)*this.nChannels);
        // let rval:number[]=[];
        return this.data[(hi*(this.width)+wi)*this.nChannels];
        // return this.data[(hi*(this.width)+wi)*this.nChannels];
    }

    setPixelNN(x:number,y:number, value:number){
        let hi = Math.round(y);
        let wi = Math.round(x);
        // this.data.set([value], (hi*(this.width)+wi)*this.nChannels)
        this.data[(hi*(this.width)+wi)*this.nChannels]=value;
        // this.data[(xi*(this.width)+yi)*this.nChannels]=value;
    }

    get nChannels(){return 1;}
    constructor(width?:number, height?:number, data?:Float32Array, ...args:any[]) {
        super(width, height, 1, data);
    }
    static CreateBlock(width:number, height:number, data:Float32Array, ...args:any[]){
        return new this(width, height, data, ...args);
    }
}
