import {ASerializable} from "../../../base";
import {ANodeModel2D} from "../../../scene";
import {SVGAsset} from "../../../fileio";
import {BoundingBox2D} from "../../../geometry";

export enum SVGModelEnums{
    SelfSVGScaleListener = 'SelfSVGScaleListener'
}

@ASerializable("SVG2DModel")
export class SVG2DModel extends ANodeModel2D {
    svgAsset!:SVGAsset;
    get children():ANodeModel2D[]{
        return this._children as ANodeModel2D[];
    }

    constructor(svgAsset?:SVGAsset, ...args:any[]) {
        super();
        if(svgAsset !== undefined){
            this._setAsset(svgAsset);
        }
    }

    _setAsset(svgAsset:SVGAsset){
        this.svgAsset=svgAsset;
        this.geometry.addMember(this.svgAsset);
    }

    static CreateFromAsset(svgAsset:SVGAsset, ...args:any[]){
        return new this(svgAsset, ...args);
    }

    static async LoadFromSVG(svgURL:string){
        let svgAsset:SVGAsset = await SVGAsset.Load(svgURL);
        return new this(svgAsset);
    }

    getBounds():BoundingBox2D{
        return this.getBounds2D();
    }

    getBounds2D():BoundingBox2D{
        let b = new BoundingBox2D();
        b.boundVertexPositionArrray(this.verts.position);
        for(let c of this.children){
            b.boundBounds(c.getBoundsXY());
        }
        return b;
    }
}
