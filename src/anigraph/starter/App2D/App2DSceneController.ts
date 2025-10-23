/**
 * @file Main scene controller for your application
 * @description This is where you connect models to views.
 * This is done mainly by defining your model view spec and interaction modes.
 */
import {App2DSceneModel} from "./App2DSceneModel";
import {AGLContext, AInteractionEvent, Color} from "../../index"
import {ABasicSceneController, ADebugInteractionMode} from "../index";

/**
 * This is your Main Controller class. The scene controller is responsible for managing user input with the keyboard
 * and mouse, as well as making sure that the view hierarchy matches the model heirarchy.
 */
export class App2DSceneController extends ABasicSceneController{
    getKeysDownState(){
        return this.interactionMode.getKeyDownState();
    }
    get model():App2DSceneModel{
        return this._model as App2DSceneModel;
    }


    /**
     * The main customization you might do here would be to set the background color or set a background image.
     * @returns {Promise<void>}
     */
    async initScene(): Promise<void> {
        this.setClearColor(Color.White());
        this.renderer.sortObjects = true;
        await super.initScene();
    }

    /**
     * Specifies what view classes to use for different model class.
     * If you create custom models and views, you will need to link them here by calling `addModelViewSpec` with the
     * model class as the first argument and the view class as the second.
     */
    initModelViewSpecs() {
        super.initModelViewSpecs();

        // Example:
        // this.addModelViewSpec(SplineModel, SplineView);
    }

    onAnimationFrameCallback(context:AGLContext) {
        /**
         * let's update the model...
         */
        // this.model.timeUpdate(this.model.clock.time);

        /**
         * and let's update the controller...
         * This will mostly update any interactions that depend on time.
         * Keep in mind that the model and controller run on separate clocks for this, since we may
         * want to pause our model's clock and continue interacting with the scene (e.g., moving the camera around).
         */
        this.timeUpdate();

        /**
         * Clear the rendering context.
         * you can also specify which buffers to clear: clear(color?: boolean, depth?: boolean, stencil?: boolean)
         * ``` this.renderer.clear(false, true); ```
         */
        context.renderer.clear();

        // render the scene view
        context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());
    }

    initInteractions() {
        super.initInteractions();

        /**
         * Add an instance of our custom interaction mode
         */
        // this.defineInteractionMode(InteractionModeClass.MODE_NAME, InteractionModeClass.Create(this));
        this.setCurrentInteractionMode(ADebugInteractionMode.NameInGUI);
    }

    getWorldCoordinatesOfCursorEvent(event:AInteractionEvent){
        if(event.ndcCursor) {
            return this.model.worldPointFromNDCCursor(event.ndcCursor);
        }else{
            return undefined;
        }
    }

}
