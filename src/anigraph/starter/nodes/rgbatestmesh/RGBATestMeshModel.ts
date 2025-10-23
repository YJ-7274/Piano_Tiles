import {ATriangleMeshModel} from "../../../scene";
import {VertexArray3D} from "../../../geometry";
import type {TransformationInterface} from "../../../math";
import {ASerializable} from "../../../base";


@ASerializable("RGBATestMeshModel")
export class RGBATestMeshModel extends ATriangleMeshModel{
    constructor(verts?:VertexArray3D, transform?:TransformationInterface) {
        super(verts, transform);
    }


    static Create(...args:any[]){
        let verts = VertexArray3D.CreateForRendering(false, false, true);
        return new this(verts);
    }
}


