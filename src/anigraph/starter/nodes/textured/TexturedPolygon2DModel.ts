import {Polygon2DModel} from "../polygon2D";
import {Mat3, Mat4, TransformationInterface, V2, Vec2} from "../../../math";
import {AShaderMaterial, ATexture} from "../../../rendering";
import {AObject} from "../../../base";
import {Polygon2D} from "../../../geometry";

const DefaultTextureMatrix =Mat4.From2DMat3(Mat3.Scale2D(0.5).times(Mat3.Translation2D(1.0, 1.0)));
// Mat4.From2DMat3(
//     Mat3.Translation2D(V2(0.5,0.5)).times(
//         Mat3.Scale2D(0.5)
//     )
// )
// const DefaultTextureMatrix =Mat4.From2DMat3(
//     Mat3.Translation2D(1.0, 1.0).times(Mat3.Scale2D(0.5))
// );

export class TexturedPolygon2DModel extends Polygon2DModel{
    texture?:ATexture;
    _textureMatrix:Mat4 = DefaultTextureMatrix;
    /** Get set textureMatrix */
    get textureMatrix(){return this._textureMatrix;}

    setTextureMatrix(mat:Mat4){
        this._textureMatrix=mat;
        this.verts.initUVAttribute();
        let uvVals:Vec2[] = [];
        for (let i=0;i<this.verts.length;i++) {
            let position = this.verts.position.getAt(i);
            let p4t = mat.times(position.Point3DH).getHomogenized();
            uvVals.push(V2(p4t.x, p4t.y));
            // uvVals.push(V2(1, 1));
        }
        this.verts.uv.pushArray(uvVals);
        this.signalGeometryUpdate()
    }

    get material():AShaderMaterial{
        return this._material as AShaderMaterial;
    }


    addTextureUpdateListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(TexturedPolygon2DModel.NodeModelEvents.TEXTURE_UPDATE, callback, handle);
    }

    constructor(verts?:Polygon2D, transform?:TransformationInterface, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform);
        if(textureMatrix){
            if(textureMatrix instanceof Mat3){
                this.setTextureMatrix(textureMatrix.Mat4From2DH());
            }else{
                this.setTextureMatrix(textureMatrix);
            }
        }else{
            this.setTextureMatrix(DefaultTextureMatrix);
        }
    }

    setTexture(texture:ATexture){
        this.material.setTexture('diffuse', texture);
    }
}

