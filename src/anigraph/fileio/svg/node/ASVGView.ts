import {ANodeModel, ANodeView} from "../../../scene";
import {ThreeJSObjectFromParsedSVG} from "../SvgToThreeJsObject";
import {ATriangleMeshGraphic} from "../../../rendering";
import {ASVGModel3D} from "./ASVGModel3D";
import {ASVGGraphic} from "./ASVGGraphic";
import {Object3D} from "three";
import * as THREE from "three";

export class ASVGView extends ANodeView{
    protected _model!:ASVGModel3D;
    svgGraphic!:ASVGGraphic;
    get model():ASVGModel3D{
        return this._model;
    }


    static Create(model:ASVGModel3D){
        let view = new this();
        view.setModel(model);
        return view;
    }

    init(){
        this.svgGraphic = ASVGGraphic.Create(this.model.svgAsset);
        this.registerAndAddGraphic(this.svgGraphic);
        this.svgGraphic.visible = this.model.visible;
    }

    update(): void {
        this.setTransform2D(this.model.transform);
        // this.svgGraphic.setTransform(this.model.transform); // This was for A2 behavior only
    }
}
