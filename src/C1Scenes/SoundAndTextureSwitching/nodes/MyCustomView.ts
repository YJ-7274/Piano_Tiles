import {ANodeView, ANodeView2D, APolygon2DGraphic, ATriangleMeshGraphic} from "../../../anigraph";
import {MyCustomModel} from "./MyCustomModel";

export class MyCustomView extends ANodeView2D{
    element!:ATriangleMeshGraphic;

    get model(): MyCustomModel {
        return this._model as MyCustomModel;
    }


    init(){
        this.element = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.registerAndAddGraphic(this.element);

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
