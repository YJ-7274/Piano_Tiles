import {ASerializable} from "../../base";
import {AGraphicElementBase} from "../graphicobject";
import * as THREE from "three";
import {Color} from "../../math";
import {AMaterial} from "../material";
import {AThreeJSMeshGraphicBase} from "./AThreeJSMeshGraphic";



export interface PlaneGeometryParameters {
    width?:number|undefined;
    height?:number|undefined;
    widthSegments?:number|undefined;
    heightSegments?:number|undefined;
}


@ASerializable("APlaneGraphic")
export class APlaneGraphic extends AThreeJSMeshGraphicBase {
    get geometry(): THREE.PlaneBufferGeometry {
        return this._geometry as THREE.PlaneBufferGeometry;
    }

    setMaterial(material:Color|THREE.Color|THREE.Material|THREE.Material[]|AMaterial){
        this._material = AGraphicElementBase._GetMaterialFromParam(material);
        if(this._element){
            this.threejs.material=this._material;
        }
    }

    /**
     * call with, e.g.,
     * ```
     * APlaneGraphic.Create({width: 2, height: 5}, material);
     * ```
     * @param geometryParams
     * @param material
     * @param args
     * @constructor
     */
    static Create(
        geometryParams?:PlaneGeometryParameters,
        material?:Color|THREE.Color|THREE.Material|THREE.Material[]|AMaterial,
        ...args:any[]
    ){
        let planeGraphic = new APlaneGraphic();
        if(geometryParams){
            planeGraphic._geometry = new THREE.PlaneBufferGeometry(
                geometryParams.width ?? 1,
                geometryParams.height ?? 1,
                geometryParams.widthSegments ?? 1,
                geometryParams.heightSegments ?? 1);
        }else{
            planeGraphic._geometry = new THREE.PlaneBufferGeometry();
        }
        planeGraphic._material = AGraphicElementBase._GetMaterialFromParam(material??Color.FromString("#30ee30"));
        planeGraphic.init();
        return planeGraphic;
    }
}
