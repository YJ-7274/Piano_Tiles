import {PixelDataFloat4D} from "./pixeldata";
import {ADataTexture} from "./ADataTexture";

export class ADataTextureFloat4D extends ADataTexture<PixelDataFloat4D>{

    static CreateSolid(width:number, height:number, fill?:number|number[]){
        let imdata = new Float32Array(width*height*4);
        if(Array.isArray(fill)){
            for(let p=0;p<width*height;p++){
                imdata.set(fill, p*4)
            }
        }else if(fill !== undefined){
            imdata.fill(fill);
        }
        let newDTex = new ADataTextureFloat4D(PixelDataFloat4D.CreateBlock(width, height, imdata));
        return newDTex;
    }

    // setPixelNN(x: number, y: number, value: number) {
    //     super.setPixelNN(x, y, value);
    // }

    static Create(width:number, height:number, dataArray?:Float32Array, ...args:any[]){
        dataArray = dataArray?dataArray:new Float32Array(width*height*4);
        let newDTex = new ADataTextureFloat4D(PixelDataFloat4D.CreateBlock(width, height, dataArray));
        return newDTex;
    }

    init(data:PixelDataFloat4D, ...args:any[]){
        this.setPixelData(data);
    }

}
