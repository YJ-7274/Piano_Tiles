import {ANodeModel, ANodeView} from "../../../scene";
import {ATriangleMeshGraphic} from "../../../rendering";
import {RGBATestMeshModel} from "./RGBATestMeshModel";

export class RGBATestMeshView extends ANodeView{
    meshGraphic!:ATriangleMeshGraphic;
    get model():RGBATestMeshModel{
        return this._model as RGBATestMeshModel;
    }

    static Create(model:ANodeModel, ...args:any[]){
        let view = new this();
        view.setModel(model);
        return view;
    }

    init(){
        this.meshGraphic = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.registerAndAddGraphic(this.meshGraphic);
    }

    update(): void {
        this.meshGraphic.setVerts(this.model.verts);
        this.setTransform(this.model.transform);
    }
}
