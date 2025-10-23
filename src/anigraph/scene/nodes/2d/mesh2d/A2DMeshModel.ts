import {ASerializable} from "../../../../base";
import {ANodeModel2D, ANodeModel2DPRSA} from "../../../nodeModel";
import {VertexArray2D, VertexArray3D} from "../../../../geometry";
import {NodeTransform2D} from "../../../../math";
import type {Transformation2DInterface} from "../../../../math";

@ASerializable("A2DMeshModel")
export class A2DMeshModel extends ANodeModel2D{
    constructor(verts?:VertexArray2D, transform?:Transformation2DInterface) {
        super();
        if(transform){
            this.setTransform(transform);
        }
        if(verts === undefined){
            verts = new VertexArray2D();
        }
        this._setVerts(verts);
    }

    static Create2DMeshModel(hasColors: boolean = true,
                  hasTextureCoords: boolean = true,
                  hasNormals: boolean = false, ...args:any[]){
        let verts = VertexArray2D.CreateForRendering(hasColors, hasTextureCoords, hasNormals);
        return new this(verts);
    }
}


@ASerializable("A2DMeshModelPRSA")
export class A2DMeshModelPRSA extends ANodeModel2DPRSA{
    constructor(verts?:VertexArray2D, transform?:NodeTransform2D) {
        super();
        if(transform){
            this.setTransform(transform);
        }
        if(verts === undefined){
            verts = new VertexArray2D();
        }
        this._setVerts(verts);
    }


    static Create2DMeshModel(hasColors: boolean = true,
                             hasTextureCoords: boolean = true,
                             hasNormals: boolean = false, ...args:any[]){
        let verts = VertexArray2D.CreateForRendering(hasColors, hasTextureCoords, hasNormals);
        return new this(verts);
    }
}


