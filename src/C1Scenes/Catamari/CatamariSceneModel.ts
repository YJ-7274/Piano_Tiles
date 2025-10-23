import {
    AMaterialManager, ANodeModel2D, AObjectNode,
    ASerializable,
    ATexture,
    GetAppState,
    Mat3,
    Mat4,
    Polygon2D,
    Random,
    V2, Vec2
} from "../../anigraph";
import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {CatModel, createLabCat, LabCatModel, PlayerModel} from "./nodes";
import {Polygon2DModel} from "../../anigraph/starter/nodes/polygon2D";
import {GameConfigs} from "./CatamariGameConfigs";
import {GameChatacter2DModel} from "./nodes/GameChatacter2DModel";

let nErrors = 0;

@ASerializable("CatamariSceneModel")
export class CatamariSceneModel extends App2DSceneModel{
    /**
     * Declaring instance attributes for a class:
     * In Typescript you will declare a class's attributes up front as you see below.
     * Each attribute is declared with a name, followed by its type.
     *
     * Initializing attributes:
     * You can set initial values for some types of attributes, but be careful with this.
     * Don't do this for complicated objects or for decorated attributes (e.g., AObjectState)
     *
     * ```typescript
     * myVar:number=123;
     * ```
     *
     * You can simply declare the attribute, but if you do this you will have to be sure to initialize its value in your constructor.
     *
     * ```typescript
     * myVar:number;
     * constructor(){
     *     this.myVar = ...
     * }
     * ```
     *
     * Finally, you can use an exclamation mark `!` like below to tell the compiler to that you plan to initialize the value later on (e.g., in an init() function that gets called later):
     * ```typescript
     * myVar!:number;
     * ```
     */

    catTextures:ATexture[]=[];
    labCatTextures:ATexture[]=[];
    princeTextures:ATexture[]=[];
    player!: PlayerModel;
    labCat!: LabCatModel;
    cats: CatModel[] = [];

    get children():Polygon2DModel[]{
        return this._children as Polygon2DModel[];
    }

    constructor(...args:any[]) {
        super(...args);
        this._sceneScale = GameConfigs.GameWorldScale;

    }


    async PreloadAssets(){
        await super.PreloadAssets();

        let appState = GetAppState();
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.RGBA_SHADER);
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER)

        this.initCamera(GameConfigs.GameWorldScale);

        for(let i=1;i<=7;i++){
            this.catTextures.push(await ATexture.LoadAsync(`./images/catfaces/catface0${i}.jpeg`));
        }

        this.princeTextures.push(await ATexture.LoadAsync(`./images/catamariPrince.jpg`))
        this.labCatTextures.push(await ATexture.LoadAsync(`./images/LabCatWatching.png`))
        // this.labCatTextures.push(await ATexture.LoadAsync(`./images/LabCatLookRight.jpg`))
        // this.labCatTextures.push(await ATexture.LoadAsync(`./images/LabCatSitsSquareSmall.jpg`))

    }

    initCamera(scale?:number) {
        this.initUniformOrthographicCamera(scale??this.sceneScale);
    }

    createPlayer() {
        this.player = new PlayerModel();
        this.player.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
        this.player.material.setTexture('diffuse', this.princeTextures[0]);
        this.player.zValue = 0.001;
        this.addChild(this.player);
    }

    createCats(){
        if(GameConfigs.CustomCatPlacement){
            this.initializeCustomCats2();
        }else {
            for (let i = 0; i < GameConfigs.nCats; i++) {
                this.addCat();
            }
        }
    }


    /**
     * To activate this, set GameConfigs.CustomCatPlacement to true
     */
    initializeCustomCats(){
        // You can change this for debugging
        for(let cat=0;cat<5;cat++)
            this.addCat(
                Mat3.Translation2D((5-(cat+0.5)*2)*1.1,5),
                Polygon2D.Square(),
                this.catTextures[cat]
            )
    }

    initializeCustomCats2(){
        // You can change this for debugging

        for(let cat=0;cat<5;cat++)
            this.addCat(
                Mat3.Translation2D((5-(cat+0.5)*2)*0.5,5+cat*0.1),
                Polygon2D.Square(),
                this.catTextures[cat]
            )

        for(let cat=0;cat<5;cat++)
            this.addCat(
                Mat3.Translation2D((5-(cat+0.5)*2)*0.5,4+cat*0.1),
                Polygon2D.Square(),
                this.catTextures[cat]
            )
    }

    async addCat(transform?: Mat3, verts?: Polygon2D, texture?:ATexture) {
        if(!texture) {
            let tindex = Random.randInt([0, this.catTextures.length-1]);
            // console.log(`using texture ${tindex}`)
            texture = this.catTextures[tindex];
        }
        let newCat:CatModel;
        if(verts){
            newCat = new CatModel(verts, transform,
                // Texture matrix
                Mat4.From2DMat3(
                    Mat3.Translation2D(V2(0.5,0.5)).times(
                        Mat3.Scale2D(0.5)
                    )
                )
            );
        }else{
            let buffer = 0.2;
            let rvec = Vec2.Random().minus(V2(0.5,0.5)).times(this.sceneScale*(1-buffer));
            let rvecn = rvec.getNormalized();
            newCat = CatModel.RandomShapeCat(transform??Mat3.Translation2D(
                rvec.plus(rvecn.times(buffer*this.sceneScale))
                )
            );
        }

        newCat.zValue = -0.001;
        newCat.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
        newCat.setTexture(texture);
        this.cats.push(newCat);

        this.addChild(newCat)
        if (transform) {
            newCat.setTransform(transform);
        }
    }


    /**
     * Use this function to initialize the content of the scene.
     * Generally, this will involve creating instances of ANodeModel subclasses and adding them as children of the scene:
     * ```
     * let myNewModel = new MyModelClass(...);
     * this.addChild(myNewModel);
     * ```
     *
     * You may also want to add tags to your models, which provide an additional way to control how they are rendered
     * by the scene controller. See example code below.
     */
    initScene(){
        createLabCat(this);
        this.createPlayer();
        this.createCats();
        this.signalComponentUpdate();
    }


    updateLabCat(){
        if(!this.labCat){
            return;
        }
        let labCatLocation = this.labCat.transform.getPosition();
        let playerLocation = this.player.transform.getPosition();
        let coldStareDirection = playerLocation.minus(labCatLocation).getNormalized();
        let theta = Math.atan2(coldStareDirection.x, coldStareDirection.y);
        this.labCat.setTransform(
            Mat3.Translation2D(labCatLocation.xy)
                .times(Mat3.Rotation(-theta+Math.PI*0.5))
                .times(Mat3.Scale2D(this.labCat.labCatScale)))
    }

    timeUpdate(t: number) {
        try {
            const self = this;
            // We are going to iterate over ALL of the cats.
            let allCatsCaptured = true;
            for(let c of this.cats){
                // We are running this as the scene graph root object,
                // so if c.parent is `this` then it is a loose cat...
                if(c.parent === this){
                    // Test for intersection with the player
                    if(this.player.rollItUp(c)) {
                        c.isCaptured = true;
                        console.log("Cat captured by Prince!")
                    }else{
                        self.player.mapOverDescendants((descendant)=>{
                            let capturedCat = descendant as CatModel;
                            if((!c.isCaptured) && (capturedCat as CatModel).rollItUp(c)){
                                c.isCaptured = true;
                                console.log("Cat captured by another cat!")
                            }
                        })
                    }
                }
                if(!c.isCaptured){
                    allCatsCaptured = false;
                }
            }
            if(allCatsCaptured){
                if(!this.labCat.isActive && GameConfigs.LabCatIsWatching){
                    this.labCat.isActive=true;
                }
            }
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }

        this.player.timeUpdate(t);
        for(let c of this.cats){
            c.timeUpdate(t)
        }

        this.updateLabCat();

    }


}

