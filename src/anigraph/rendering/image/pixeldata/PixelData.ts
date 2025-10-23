import * as THREE from "three";

export class PixelData<T extends ArrayBufferView>{
    data!:T;
    width!:number;
    height!:number;
    get nChannels(){return this._nChannels;}
    _nChannels:number=1;

    get _threeformat(){
        return THREE.LuminanceFormat;
    }
    get _threetype(){
        return THREE.UnsignedByteType;
    }


    // abstract getPixel(x:number,y:number):number[];
    constructor(width?:number, height?:number, nChannels?:number, data?:T, ...args:any[]) {
        if(width){this.width = width};
        if(height){this.height = height};
        if(data){this.data =data;}
        if(nChannels){this._nChannels=nChannels};
    }

    getPixelNN(x:number,y:number){
        let hi = Math.round(y);
        let wi = Math.round(x);
        // @ts-ignore
        return this.data.slice((hi*(this.width)+wi)*this.nChannels, (hi*(this.width)+wi+1)*this.nChannels);
        // let rval:number[]=[];
        // return this.data[(hi*(this.width)+wi)*this.nChannels];
    }

    setPixelNN(x:number,y:number, value:ArrayLike<number>|number){
        let hi = Math.round(y);
        let wi = Math.round(x);
        // @ts-ignore
        this.data.set(value, (hi*(this.width)+wi)*this.nChannels)
        // this.data[(hi*(this.width)+wi)*this.nChannels]=value;
    }

    static CreateBlock(width:number, height:number, data:any, ...args:any[]){
        return new this(width, height, data, ...args);
    }

    GetTHREEDataTexture(...args:any[]){
        return new THREE.DataTexture(this.data, this.width, this.height, this._threeformat, this._threetype, ...args);
    }

    // static CreateBlock<T>(width:number, height:number, nChannels:number, data:T, ...args:any[]){
    //     return new this(width, height, nChannels, data, ...args);
    // }
}



