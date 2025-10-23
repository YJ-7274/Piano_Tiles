import {ANodeModel3D} from "../../nodeModel";
import {Mat4} from "../../../math";
import {VertexArray3D} from "../../../geometry";
import {ASerializable} from "../../../base";

import type {TransformationInterface} from "../../../math";

@ASerializable("ATriangleMeshModel")
export class ATriangleMeshModel extends ANodeModel3D{
    constructor(verts?:VertexArray3D, transform?:TransformationInterface) {
        super();
        // this.transform = transform?transform.getMat4():new Mat4();
        // this.transform = transform?
        if(transform){
            this.setTransform(transform);
        }
        if(verts === undefined){
            verts = new VertexArray3D();
        }
        this._setVerts(verts);
    }


    static Create(hasNormals: boolean,
                  hasTextureCoords: boolean,
                  hasColors: boolean, ...args:any[]){
        let verts = VertexArray3D.CreateForRendering(hasNormals, hasTextureCoords, hasColors);
        return new this(verts);
    }
}


