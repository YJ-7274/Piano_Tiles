import {ASerializable} from "../../base";
import {AGraphicElementBase} from "../graphicobject";
import * as THREE from "three";
import {Color} from "../../math";
import {AMaterial} from "../material";

@ASerializable("AThreeJSMeshGraphicBase")
export class AThreeJSMeshGraphicBase extends AGraphicElementBase {
    _geometry!: THREE.BufferGeometry;
    _material!: THREE.Material | THREE.Material[];
    _element!: THREE.Mesh;

    get mesh() {
        return this._element;
    }

    get geometry(): THREE.BufferGeometry {
        return this._geometry;
    }

    get material(): THREE.Material | THREE.Material[] {
        return this._material;
    }

    get threejs(): THREE.Mesh {
        return this._element;
    }

    setMaterial(material: Color | THREE.Color | THREE.Material | THREE.Material[] | AMaterial) {
        this._material = AGraphicElementBase._GetMaterialFromParam(material);
        if (this._element) {
            this.threejs.material = this._material;
        }
    }

    init(geometry?: THREE.BufferGeometry, material?: Color | THREE.Color | THREE.Material | THREE.Material[] | AMaterial) {
        if(geometry) {
            this._geometry = geometry;
        }
        if(material) {
            this._material = AGraphicElementBase._GetMaterialFromParam(material);
        }
        if (this._element) {
            throw new Error("Tried calling init on graphic that already has an _element! Are you calling this twice?");
        }
        this._element = new THREE.Mesh(this._geometry, this._material);
        this._element.matrixAutoUpdate=false;
    }
}

@ASerializable("AThreeJSMeshGraphic")
export class AThreeJSMeshGraphic extends AThreeJSMeshGraphicBase {

    static Create(
        geometry:THREE.BufferGeometry|any,
        material:Color|THREE.Color|THREE.Material|THREE.Material[]|AMaterial,
        ...args:any[]
    ){
        let graphic = new this();
        graphic.init(geometry, material);
        return graphic;
    }
}
