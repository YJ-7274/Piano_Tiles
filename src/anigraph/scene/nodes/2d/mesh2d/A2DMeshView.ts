import {ANodeView, ANodeView2D} from "../../../nodeView";
import {ATriangleMeshGraphic} from "../../../../rendering";
import {ANodeModel} from "../../../nodeModel";
import {A2DMeshModel} from "./A2DMeshModel";
import {Mat4} from "../../../../math";

export class A2DMeshView extends ANodeView2D{
    meshGraphic!:ATriangleMeshGraphic;
    get model():A2DMeshModel{
        return this._model as A2DMeshModel;
    }

    static Create(model:ANodeModel, ...args:any[]){
        let view = new this();
        view.setModel(model);
        return view;
    }

    init(){
        this.meshGraphic = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.registerAndAddGraphic(this.meshGraphic);
        const self = this;
        this.subscribe(this.model.addGeometryListener(
            ()=>{
                self.updateGeometry();
            }
        ))
    }

    update(): void {
        // this.meshGraphic.setVerts2D(this.model.verts);
        this.setTransform(this.model.transform);
    }

    updateGeometry(){
        this.meshGraphic.setVerts2D(this.model.verts);
    }
}
