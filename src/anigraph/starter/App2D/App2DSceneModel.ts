/**
 * @file Main scene model
 * @description Main model for your application
 */

import {AppState, Vec2} from "../../index";
import {ABasicSceneModel} from "../index";

/**
 * This is your Main Model class. The scene model is the main data model for your application. It is the root for a
 * hierarchy of models that make up your scene/
 */
export abstract class App2DSceneModel extends ABasicSceneModel{

    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();
    }

    initCamera(scale?:number) {
        this.initUniformOrthographicCamera(scale??this.sceneScale);
    }

    /**
     * This will add variables to the control pannel
     * @param appState
     */
    initAppState(appState:AppState){
        /**
         * The function below shows exampled of very general ways to use app state and the control panel.
         */
        // AddExampleControlPanelSpecs(this);

        /**
         * Optionally, you can add functions that will tell what should be displayed in the React portion of the GUI. Note that the functions must return JSX code, which means they need to be written in a .tsx file. That's why we've put them in a separate file.
         */
        // appState.setReactGUIContentFunction(UpdateGUIJSX);
        // appState.setReactGUIBottomContentFunction(UpdateGUIJSXWithCameraPosition);
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
    // abstract initScene():Promise<void>;

    worldPointFromNDCCursor(ndcCursor:Vec2){
        return ndcCursor.times(this.sceneScale);
    }

    /**
     * Update the model with time here.
     * If no t is provided, use the model's time.
     * If t is provided, use that time.
     * You can decide whether to couple the controller's clock and the model's. It's usually good practice to have the model run on a separate clock.
     * @param t
     */
    timeUpdate(t?: number):void;
    timeUpdate(...args:any[])
    {
        let t = this.clock.time;
        if(args != undefined && args.length>0){
            t = args[0];
        }

        /**
         * If you want to update the react GUI components
         */
        // GetAppState().updateComponents();
    }
};
