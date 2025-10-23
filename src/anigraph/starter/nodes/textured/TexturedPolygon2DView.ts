import {Polygon2DView} from "../polygon2D";
import {APolygon2DGraphic} from "../../../rendering";
import {TexturedPolygon2DModel} from "./TexturedPolygon2DModel";
import {Color} from "../../../math";

export const enum TexturePoly2DSettings{
    USE_TEXTURES=1
}


export class TexturedPolygon2DView extends Polygon2DView{
    element!: APolygon2DGraphic;
    get model(): TexturedPolygon2DModel {
        return this._model as TexturedPolygon2DModel;
    }

    // updateTexCoords(){
    //     this.element.setTextureMatrix(this.model.textureMatrix);
    // }

    init(): void {
        super.init();
        if(!TexturePoly2DSettings.USE_TEXTURES) {
            this.element.setMaterial(Color.Random())
        }
        // this.updateTexCoords();

        // const self = this;
        // this.subscribe(
        //     this.model.addTextureUpdateListener(
        //         ()=>{
        //             self.updateTexCoords();
        //         }
        //     )
        // )
    }

    update(...args:any[]): void {
        super.update();
    }
}




