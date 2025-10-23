import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {
    AMaterial,
    AMaterialManager,
    AppState,
    DefaultMaterials,
    GetAppState,
    NodeTransform2D,
    Polygon2D,
    V2
} from "../../anigraph";
import {CustomPolygonModel} from "./nodes";
import {TriangleAtVerticesModel} from "./nodes/TriangleAtVerticesModel";

let nErrors = 0;
export class Example3SceneModel extends App2DSceneModel{

    /**
     * This will add variables to the control pannel
     * @param appState
     */
    initAppState(appState:AppState){
        CustomPolygonModel.initAppState(appState);
    }


    /**
     * This function is a good place to preload files that the scene uses; things like textures and shaders.
     * In the final project, we will use a similar function to load 3D meshes.
     * @returns {Promise<void>}
     * @constructor
     */
    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();
        let appState = GetAppState();
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
        let appState = GetAppState();

        // Now let's create a custom polygon
        let newPolygon = new CustomPolygonModel(Polygon2D.Square());

        // We set its material to be the simple RGB material
        let basicMaterial = appState.CreateBasicMaterial();
        newPolygon.setMaterial(basicMaterial);

        // Now we add it as a child of our scene model
        this.addChild(newPolygon);


        let trianglesAsVerticesModel = new TriangleAtVerticesModel(new NodeTransform2D(V2(-5, 0)));
        this.addChild(trianglesAsVerticesModel);
    }





    timeUpdate(t: number) {
        try {
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }
    }
}
