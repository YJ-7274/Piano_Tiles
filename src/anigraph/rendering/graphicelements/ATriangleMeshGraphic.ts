import {AGraphicElement} from "../graphicobject";
import * as THREE from "three";
import {VertexArray2D, VertexArray3D} from "../../geometry";
import {ASerializable} from "../../base";

@ASerializable("ATriangleMeshGraphic")
export class ATriangleMeshGraphic extends AGraphicElement{
    protected verts!:VertexArray3D|VertexArray2D;

    get mesh(){
        return this._element;
    }

    // static CreateMeshGraphic(geometry?:THREE.BufferGeometry|VertexArray<any>,
    //                   material?:Color|THREE.Color|THREE.Material|THREE.Material[],
    //                   ...args:any[]){
    //     return new this(geometry, material, ...args);
    // }

    initGeometry(verts?:VertexArray3D){
        if(!this._geometry){
            if(verts){
                this.verts = verts;
            }
            this.setGeometry(this.verts);
        }else{
            throw new Error("Tried to re-init geometry in ATriangleMeshElements");
        }
    }

    _createDefaultMaterial(){
        return new THREE.MeshBasicMaterial({
            color: 0x22aa22,
            transparent: true,
            side: THREE.DoubleSide,
            opacity: 1.0,
        });
    }

    setVerts(verts:VertexArray3D){
        this.verts = verts;
        // console.log({ indices: this.verts.indices });
        this.setGeometry(this.verts);
    }

    setVerts2D(verts:VertexArray2D){
        this.verts = verts;
        // console.log({ indices: this.verts.indices });
        this._setGeometry2D(verts);
    }

}
