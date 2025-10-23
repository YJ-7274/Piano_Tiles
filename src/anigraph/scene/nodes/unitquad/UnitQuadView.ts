import {AGraphicElement} from "../../../rendering";
import {ANodeView} from "../../nodeView";
import {UnitQuadModel} from "./UnitQuadModel";

export class UnitQuadView extends ANodeView{
    quad!:AGraphicElement
    get model():UnitQuadModel{
        return this._model as UnitQuadModel;
    }
    init(){
        this.quad = AGraphicElement.CreateSimpleQuad(this.model.material);
        this.registerAndAddGraphic(this.quad);
        this.update();
    }

    update(): void {
        this.setTransform(this.model.matrix.times(this.model.transform.getMat4()));
    }
}
