import {PixelDataFloat1D} from "./pixeldata";
import {ADataTexture} from "./ADataTexture";

export class ADataTextureFloat1D extends ADataTexture<PixelDataFloat1D>{
    static CreateSolid(width:number, height:number, fill?:number){
        let imdata = new Float32Array(width*height);
        if(fill !== undefined){
            imdata.fill(fill);
        }
        let newDTex = new ADataTextureFloat1D(PixelDataFloat1D.CreateBlock(width, height, imdata));
        return newDTex;
    }

    setPixelNN(x: number, y: number, value: number) {
        // @ts-ignore
        this.pixelData.setPixelNN(x,y,[value]);
    }

    static Create(width:number, height:number, dataArray?:Float32Array, ...args:any[]){
        dataArray = dataArray?dataArray:new Float32Array(width*height*4);
        let newDTex = new ADataTextureFloat1D(PixelDataFloat1D.CreateBlock(width, height, dataArray));
        return newDTex;
    }

    init(data:PixelDataFloat1D, ...args:any[]){
        this.setPixelData(data);
    }

}
