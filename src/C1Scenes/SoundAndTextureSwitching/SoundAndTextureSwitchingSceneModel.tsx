import {
    AGroupNodeModel2D, AGroupNodePRSAModel2D,
    AMaterialManager, ANodeModel2D,
    AppState, AShaderMaterial, ATexture, BezierTween,
    Color,
    GetAppState,
    NodeTransform2D,
    Polygon2D, V2, Vec2,
    VertexArray2D
} from "../../anigraph";
import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {MyCustomModel, MyCustomPRSAModel} from "./nodes";
import {AudioManager} from "../../anigraph/audio/AAudioManager";


let nErrors = 0;

const enum Assets{
    POP_SOUND = "./sounds/Pop1.wav",
    DIGITS = "./images/sequences/digits/",
}

/**
 * This is your Scene Model class. The scene model is the main data model for your application. It is the root for a
 * hierarchy of models that make up your scene/
 */
export class SoundAndTextureSwitchingSceneModel extends App2DSceneModel{
    myCustomModel!:MyCustomPRSAModel;
    digitTextures :ATexture[] = [];
    currentDigit=0;

    /**
     * Loading assets
     * @returns {Promise<void>}
     * @constructor
     */
    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();

        // loading a sound...
        // First argument is a string name for the sound, second argument is a path.
        await AudioManager.LoadSound(Assets.POP_SOUND, Assets.POP_SOUND)

        for(let i=0;i<10;i++){
            // Load textures for the digits 0-9
            this.digitTextures.push(await ATexture.LoadAsync(Assets.DIGITS+`${i}.png`, `${i}`));
        }
    }

    /**
     * This will add variables to the control pannel
     * @param appState
     */
    initAppState(appState:AppState){
        super.initAppState(appState);
    }

    initScene(){
        let appState = GetAppState();
        let textureMaterial = appState.Create2DTextureMaterial(this.digitTextures[0]);
        let meshGeometry = VertexArray2D.SquareXYUV(1.0);
        this.myCustomModel = new MyCustomPRSAModel(meshGeometry, textureMaterial, new NodeTransform2D(undefined, undefined,V2(5,5)));
        this.addChild(this.myCustomModel);
    }

    /**
     * Play the sound we loaded
     */
    playPopSound(){
        AudioManager.playSound(Assets.POP_SOUND);
    }

    /**
     * Increments the current digit texture and replaces the texture of myCustomModel's material with the new texture in the sequence.
     */
    incrementDigitTexture(){
        this.currentDigit++;
        let nextTexture = this.digitTextures[(this.currentDigit)%10];
        this.myCustomModel.material.setDiffuseTexture(nextTexture);
    }


    /**
     * Here we define a function that will add a timed action to our model.
     * The timed action is one that happens over a specified duration (in seconds).
     * In this case, we spin the groupNode in our scene by setting its rotation according to a bezier curve in time.
     */
    spin(){
        const self = this;

        this.playPopSound();
        this.incrementDigitTexture();

        /**
         * Add the timed action
         * Check out the definition of addTimedAction for more details
         */
        this.addTimedAction((actionProgress) => {
            self.myCustomModel.transform.rotation = actionProgress*4*Math.PI;
            },
            2,
            () => {
                self.myCustomModel.transform.rotation = 0;
            },
            /**
             * The cubic bezier tween is defined by the x and y coordinates of its second and third control points in canonical form. That is, where the first control point is [0,0], and the last is [1,1]. The x coordinate represents progress along the specified duration, and the y coordinate represents the corresponding actionProgress value.
             */
            new BezierTween(0.33, -0.6, 0.66, 1.6)
        )

    }



    timeUpdate(t: number) {
        let appState = GetAppState();

        try {
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }
    }
}
