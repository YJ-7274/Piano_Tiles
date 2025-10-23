import {AObjectState, ASerializable, Mat3, Mat4, Polygon2D, Random, V2, Vec2} from "../../../../anigraph";
import {CatModel} from "../Cat";

const HEADWIDTH = 0.7;
const HEADHEIGHT = 0.4;
const TURNSPEED=0.1;
const MOVESPEED = 0.1;


@ASerializable("LabCatModel")
export class LabCatModel extends CatModel {

    @AObjectState labCatScale;
    @AObjectState isActive:boolean;
    constructor(verts?:Polygon2D, transform?:Mat3, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix, ...args);
        this.labCatScale=4;
        this.isActive=false;

    }

    static RandomShapeLabCat(transform:Mat3){
        let v:Vec2[]=[];
        let nVerts = Random.randInt([4,8]);
        for(let i=0;i<nVerts;i++){
            v.push(V2(Math.cos(2*Math.PI*i/(nVerts)), Math.sin(2*Math.PI*i/(nVerts))).times(0.9+Math.random()*0.2));
        }
        let verts = Polygon2D.FromLists(
            v
        )
        return new LabCatModel(verts, transform)
    }

    static SquareLabCat(transform?:Mat3, scale:number=1){
        transform = transform??Mat3.Identity();
        let v:Vec2[]=[];
        let nVerts = 4;
        v.push(
            V2(-1,-1).times(scale),
            V2(-1,1).times(scale),
            V2(1,1).times(scale),
            V2(1,-1).times(scale),
        )
        let verts = Polygon2D.FromLists(
            v
        )
        return new LabCatModel(
            verts,
            transform,
            Mat4.From2DMat3(
                Mat3.Translation2D(V2(0.5,0.5)).times(
                    Mat3.Scale2D(0.5)
                )
            )
        );
    }

}
