// import {ANodeModel2D} from "../../../../index";
// import {
//     AObjectState,
//     ASerializable,
//     Color,
//     Vec2, Vec3, Vec4
// } from "../../../../index";


import {AObjectState} from "../../../../base";
import {ASerializable} from "../../../../base";
import {Color, Vec2, Vec3, Vec4} from "../../../../math";
import {ANodeModel2D} from "../../../nodeModel";

@ASerializable("LineModel2D")
export class LineModel2D extends ANodeModel2D{
    @AObjectState lineWidth!:number;
    constructor(){
        super();
        // this.verts.initColor3DAttribute();
        this.verts.initColorAttribute()
        this.lineWidth = 0.02;
    }

    addVertices(positions: Vec2[] | Vec3[], colors?: Color[] | Vec3[] | Vec4[]){
        this.verts.addVertices(positions, colors);
    }
}
