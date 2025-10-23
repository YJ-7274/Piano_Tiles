import {TexturedPolygon2DView} from "../../../../anigraph/starter/nodes/textured";
import {
    ALineGraphic,
    ALineMaterialModel,
    ASceneView,
    AView,
    Color,
    Mat3,
    V2,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {CatModel} from "./CatModel";

export class CatView extends TexturedPolygon2DView{
    tailElement!:ALineGraphic;
    tailPhase!:number;
    tailFreq:number=1.6;
    tailSpan:number=0.75;
    tailPhaseSpan:number=0.5;
    tailBase!:Vec2;
    tailVerts!:VertexArray2D;
    nTailVerts = 12;

    get model():CatModel{
        return this._model as CatModel;
    }

    init(): void {
        super.init()
        this.tailElement = new ALineGraphic();
        this.tailBase = V2();
        this.tailPhase = Math.random();
        for(let vi=0;vi<this.nTailVerts;vi++){
            let vr = this.model.verts.vertexAt(vi).clone();
            if(vr.y<this.tailBase.y){
                this.tailBase =vr;
            }
        }
        this.initTailVerts(0)
        let material = ALineMaterialModel.GlobalInstance.CreateMaterial();
        this.tailElement.init(this.tailVerts, material)
        this.registerAndAddGraphic(this.tailElement);


    }


    initTailVerts(t:number){
        let tailverts = new VertexArray2D();
        tailverts.initColorAttribute();
        for(let tvi=0;tvi<this.nTailVerts;tvi++){
            let tfrac = tvi/(this.nTailVerts-1);
            let vcolor = 0.1+Math.random()*0.7;
            tailverts.addVertex(
                V2(tfrac*Math.sin(tfrac*this.tailPhaseSpan*this.tailFreq+this.tailPhase*Math.PI*2+t)*this.tailSpan, -tfrac*this.tailSpan),

                Color.FromRGBA(vcolor,vcolor,vcolor,1)
            );
        }
        this.tailVerts = tailverts.GetTransformedBy(Mat3.Translation2D(this.tailBase.minus(tailverts.position.getAt(0).xy)).Mat4From2DH());
    }

    updateTailVerts(t:number){
        let m = Mat3.Translation2D(this.tailBase);
        for(let tvi=0;tvi<this.nTailVerts;tvi++){
            let tfrac = tvi/(this.nTailVerts-1);
            this.tailVerts.position.setAt(tvi, m.times(
                V2(tfrac*Math.sin(tfrac*this.tailPhaseSpan*this.tailFreq+this.tailPhase*Math.PI*2+t)*this.tailSpan, -tfrac*this.tailSpan),
                )
            );
        }
    }


    updateTail(){
        this.updateTailVerts(this.model.lastUpdateTime)
        this.tailElement.setVerts2D(this.tailVerts);
    }

    update() {
        super.update();
        if(this.tailElement){
            this.updateTail();
        }
    }

    setParentView(newParent?:AView){
        if(this.threejs.parent){
            throw new Error("Tried to parent view that already had parent");
        }
        // newParent.
        if(newParent !== undefined){
            newParent.threejs.add(this.threejs);
            // newParent._threejs.add(this.threejs);
        }
    }

}


