import {ANodeView} from "../../nodeView";
import {ATriangleMeshGraphic} from "../../../rendering";
import {ANodeModel} from "../../nodeModel";
import {ATriangleMeshModel} from "./ATriangleMeshModel";

export class ATriangleMeshView extends ANodeView{
    meshGraphic!:ATriangleMeshGraphic;
    get model():ATriangleMeshModel{
        return this._model as ATriangleMeshModel;
    }

    static Create(model:ANodeModel, ...args:any[]){
        let view = new this();
        view.setModel(model);
        return view;
    }

    init(){
        this.meshGraphic = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.registerAndAddGraphic(this.meshGraphic);
        this.update();
    }

    update(): void {
        this.meshGraphic.setVerts(this.model.verts);
        this.setTransform(this.model.transform);
    }
}
