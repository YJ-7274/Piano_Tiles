import {Color} from "../../math";
import {AObject3DModelWrapper} from "../../geometry";
import {ATriangleMeshGraphic} from "../graphicelements";
import {ALoadedElementInterface} from "./ALoadedElement";
import {AMaterial} from "../material";
import * as THREE from "three";


export class ALoadedBoundsElement extends ATriangleMeshGraphic implements ALoadedElementInterface{
    public _sourceObject:AObject3DModelWrapper
    constructor(object:AObject3DModelWrapper) {
        super();
        // this.setVerts(object.getBoundingBoxVertexArray());
        this._sourceObject=object;
        let verts = this._sourceObject.getBoundingBoxVertexArray()
        this.setGeometry(verts);
        this.setMaterial(Color.Random());
    }

    onModelColorChange(color:Color){
        this.setMaterial(color);
    }

    onMaterialChange(newMaterial:AMaterial){
        // this.setMaterial(newMaterial.threejs);
    }
    onMaterialUpdate(newMaterial: AMaterial, ...args:any[]) {
        // super.onMaterialUpdate(newMaterial, ...args);
        // if('color' in this._element.material){
        //     // @ts-ignore
        //     this._element.material.color = newMaterial.getColor();
        // }
    }

    updateSourceTransform(){
        this.setVerts(this._sourceObject.getBoundingBoxVertexArray());
    }
}

