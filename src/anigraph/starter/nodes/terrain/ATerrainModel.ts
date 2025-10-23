import {SeededRandom, Vec2, Vec3} from "../../../math";
import {ANodeModel3D} from "../../../scene";
import {AObjectState, ASerializable} from "../../../base";
import type {TransformationInterface} from "../../../math";
import {AShaderMaterial, AShaderModel, CreatesShaderModels} from "../../../rendering";
import {PlaneGeometryParameters} from "../../../rendering/graphicelements/APlaneGraphic";
import {ATerrainShaderModel} from "../../../rendering/shadermodels/ATerrainShaderModel";
import {ATexture} from "../../../rendering/ATexture";
import {ADataTextureFloat1D} from "../../../rendering/image";


@ASerializable("ATerrainModel")
export abstract class ATerrainModel extends ANodeModel3D implements PlaneGeometryParameters{
    static ShaderModel:ATerrainShaderModel;

    static async LoadShader(...args:any[]){
        this.ShaderModel = await ATerrainShaderModel.CreateModel("terrain")
    }

    width:number=1;
    height:number=1;
    widthSegments:number=128;
    heightSegments:number=128;
    diffuseMap!:ATexture;
    heightMap!:ADataTextureFloat1D;

    get material():AShaderMaterial{
        return this._material as AShaderMaterial;
    }



    constructor(
        width?:number,
        height?:number,
        widthSegments?:number,
        heightSegments?:number,
        transform?:TransformationInterface) {
        super();
        if(width!==undefined){this.width=width};
        if(height!==undefined){this.height=height;}
        if(widthSegments!==undefined){this.widthSegments=widthSegments;}
        if(heightSegments!==undefined){this.heightSegments=heightSegments;}
        if(transform){
            this.setTransform(transform);
        }
    }

    abstract getTerrainHeightAtPoint(xy:Vec2):number;
}






