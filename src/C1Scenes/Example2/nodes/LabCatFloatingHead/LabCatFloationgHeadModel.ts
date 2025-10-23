import {
    A2DMeshModelPRSA,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState,
    NodeTransform2D,
    V2,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";

@ASerializable("LabCatFloationgHeadModel")
export class LabCatFloationgHeadModel extends A2DMeshModelPRSA {
    static LabCatFloatingHeadMaterial:AShaderMaterial|undefined=undefined;
    static LabCatFloatingHeadTexture:ATexture;

    velocity:Vec2;
    speed:number=0.1;


    constructor(verts?:VertexArray2D, transform?:NodeTransform2D, ...args:any[]) {
        if(LabCatFloationgHeadModel.LabCatFloatingHeadMaterial === undefined){
            throw new Error("Use LabCatFloationgHeadModel.CreateLabCatFloatingHead(...) instead of constructor")
        }
        super(verts, transform);
        this.velocity = V2();
    }

    static async PreloadAssets(){
        if(LabCatFloationgHeadModel.LabCatFloatingHeadMaterial === undefined){
            LabCatFloationgHeadModel.LabCatFloatingHeadTexture = await ATexture.LoadAsync("./images/LabCatFloatingHeadSmall.png");
        }
    }


    /**
     * Here since all instances will use the same texture, we save it as a class attribute.
     * This function will be used instead of the constructor to create instances of this class.
     * @param transform
     * @param scale
     * @returns {Promise<LabCatFloationgHeadModel>}
     * @constructor
     */
    static Create(transform?:NodeTransform2D, scale:number=1){
        transform = transform??NodeTransform2D.Identity();
        if(!LabCatFloationgHeadModel.LabCatFloatingHeadMaterial){
            LabCatFloationgHeadModel.LabCatFloatingHeadMaterial= GetAppState().CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
            LabCatFloationgHeadModel.LabCatFloatingHeadMaterial.setTexture("diffuse", this.LabCatFloatingHeadTexture);
        }
        let rval =  new LabCatFloationgHeadModel(
            VertexArray2D.SquareXYUV(),
            transform,
        );
        rval.setMaterial(LabCatFloationgHeadModel.LabCatFloatingHeadMaterial);
        return rval;
    }


    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
        let appState = GetAppState();
        appState.setState("LabCatScale", 5+Math.sin(t));

        // Update the react component that displays this value
        appState.updateComponents()

        this.transform.scale = appState.getState("LabCatScale");
        this.transform.position = this.transform.position.plus(this.velocity);
    }

}
