import {ANodeView, ANodeView2D, APolygon2DGraphic, ATriangleMeshGraphic, Color, Mat3, V2} from "../../../../anigraph";
import {MyCustomModel} from "./MyCustomModel";
import {TexturePoly2DSettings} from "../../../../anigraph/starter/nodes/textured";

export class MyCustomView extends ANodeView2D{
    element!:ATriangleMeshGraphic;

    get model(): MyCustomModel {
        return this._model as MyCustomModel;
    }


    init(){
        this.element = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.registerAndAddGraphic(this.element);


        // Optionally add a listener to update if geometry changes
        const self = this;
        this.subscribe(this.model.addGeometryListener(
            ()=>{
                self.updateGeometry();
            }
        ))
    }

    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }

    updateGeometry(){
        this.element.setVerts2D(this.model.verts);
    }
}
