

// const TEXSCALE = 0.6;
import {
    ASceneModel,
    ASerializable,
    GetAppState,
    Mat3,
    Mat4,
    Point2DH,
    Polygon2D, Random,
    V2,
    Vec2,
    Vec2DH
} from "../../../../anigraph";
import {TexturedPolygon2DModel} from "../../../../anigraph/starter/nodes/textured";
import {GameConfigs} from "../../CatamariGameConfigs";
import {GameChatacter2DModel} from "../GameChatacter2DModel";

const TEXSCALE = 0.1;
// const DefaultTextureMatrix =Mat4.From2DMat3(Mat3.Translation2D(V2(0.5*TEXSCALE,0.5*TEXSCALE)).times(Mat3.Scale2D(TEXSCALE)));

const DefaultTextureMatrix = Mat3.Translation2D(V2(0.5,0.5)).times(
    Mat3.Scale2D(5.2)
)

// const DefaultTextureMatrix =Mat4.From2DMat3(Mat3.Translation2D(V2(0.5,0.5)).times(Mat3.Scale2D(TEXSCALE)));

@ASerializable("CatModel")
export class CatModel extends GameChatacter2DModel{
    // _textureMatrix:Mat4 = DefaultTextureMatrix;
    _currentDestination:Vec2;
    _orientation:Vec2;
    speed = 0.1;
    isCaptured:boolean=false;

    constructor(verts?:Polygon2D, transform?:Mat3, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix??DefaultTextureMatrix, ...args);
        this._currentDestination = new Vec2();
        this._orientation = new Vec2();
        this.reWander();
    }

    reWander(scale?:number){
        scale = scale??GameConfigs.GameWorldScale;
        let currentposition = this.transform.getPosition().Point2D;
        this._currentDestination = currentposition.plus(Vec2.Random([-0.5,0.5]).times(scale*0.2));
        if(this._currentDestination.L2()>scale){
            this._currentDestination = Vec2.Random([-0.5,0.5]).times(scale)
        }
    }

    timeUpdate(t:number){
        let delta_t = t-this.lastUpdateTime;
        if(delta_t>1 || delta_t<0){
            delta_t=0;
        }
        super.timeUpdate(t);

        if(! (this.parent instanceof ASceneModel)){
            this.signalGeometryUpdate();
        }else {
            if(GameConfigs.WanderingCats) {
                let mat3Transform = this.transform.getMatrix();
                let currentposition = mat3Transform.c2.xy;
                let accel = this._currentDestination.minus(currentposition);
                if(accel.L2()<1){
                    this.reWander()
                }
                let accelnorm = accel.getNormalized();
                this._orientation = this._orientation.plus(accelnorm.times(0.3)).getNormalized();

                let vnorm = accel.getNormalized();
                let xnorm = Mat3.Rotation(-Math.PI*0.5).times(vnorm);
                let placement = Mat3.FromColumns(Vec2DH(xnorm), Vec2DH(this._orientation), Point2DH(currentposition.plus(vnorm.times(this.speed*delta_t))));
                this.setTransform(placement);
            }else{
                this.signalGeometryUpdate();
            }
        }
    }

    static RandomShapeCat(transform:Mat3){
        let v:Vec2[]=[];
        let nVerts = Random.randInt([4,8]);
        for(let i=0;i<nVerts;i++){
            v.push(
                V2(
                    Math.cos(2*Math.PI*i/(nVerts)),
                    Math.sin(2*Math.PI*i/(nVerts))
                ).times(0.9+Math.random()*0.2)
            );
        }
        let verts = Polygon2D.FromLists(
            v
        )
        return new CatModel(verts, transform,
            Mat4.From2DMat3(
                Mat3.Translation2D(V2(0.5,0.5)).times(
                    Mat3.Scale2D(0.5)
                )
            ))
    }

    static SquareCat(transform:Mat3, scale:number=1){
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
        return new CatModel(
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

