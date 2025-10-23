import {App2DSceneController} from "../../anigraph/starter/App2D/App2DSceneController";
import {TutorialSceneModel} from "./TutorialSceneModel";
import {
    ADragInteraction,
    AGLContext,
    AInteractionEvent,
    AKeyboardInteraction, AMaterialManager, ANodeModel, ANodeView,
    Color,
    GetAppState, Polygon2D
} from "../../anigraph";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {MyCustomModel, MyCustomPolygonModel, MyCustomPolygonView, MyCustomView} from "./nodes";
import {ASceneInteractionMode} from "../../anigraph/starter";

/**
 * This is your Scene Controller class. The scene controller is responsible for managing user input with the keyboard
 * and mouse, as well as making sure that the view hierarchy matches the model heirarchy.
 */
export class TutorialSceneController extends App2DSceneController{
    get model():TutorialSceneModel{
        return this._model as TutorialSceneModel;
    }


    /**
     * The main customization you might do here would be to set the background color or set a background image.
     * Check out Lab Cat's helpful Example2 scene for example code that sets the background to an image.
     * @returns {Promise<void>}
     */
    async initScene() {
        // You can set the clear color for the rendering context
        this.setClearColor(Color.White());
        this.initControlPanelControls();
        super.initScene();

        // Subscribe to stuff if desired...
        // const self = this;
        // this.subscribe()
    }

    initControlPanelControls(){
        const appState = GetAppState();
        const self = this;
        /**
         * Add a button. Our button will call self.model.spin()
         */
        appState.addButton("Spin!", ()=>{
            console.log("Spin!")
            console.log(self)
            self.model.spin();
        })

    }

    /**
     * Specifies what view classes to use for different model class.
     * If you create custom models and views, you will need to link them here by calling `addModelViewSpec` with the
     * model class as the first argument and the view class as the second. Check out Example2 and Example3 for examples
     * with custom nodes added.
     */
    initModelViewSpecs() {
        super.initModelViewSpecs()
        // This line tells the controller that whenever a Polygon2DModel is added to the model hierarchy, we should
        // create and add a corresponding Polygon2DView and connect it to the new model
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(MyCustomModel, MyCustomView);
        this.addModelViewSpec(MyCustomPolygonModel, MyCustomPolygonView);
    }

    /**
     * This will create any view specified by an addModelViewSpec call by default.
     * Only use this function if you want to do something custom / unusual that can't be contelled with a spec.
     * @param {ANodeModel} nodeModel
     * @returns {ANodeView}
     */
    // createViewForNodeModel(nodeModel: ANodeModel): ANodeView {
    //     return super.createViewForNodeModel(nodeModel);
    // }

    /**
     * Initialize interactions. This is where you will define different interaction modes.
     * Interaction modes define how the program responds to mouse and keyboard inputs.
     */
    initInteractions() {
        super.initInteractions();
        const self = this;

        /**
         * Here we will create an interaction mode, which defines one set of controls
         * At any point, there is an active interaction mode.
         */
        this.createNewInteractionMode(
            "Main",
            {
                /**
                 * Called when a keyboard key is pressed while the application window is in focus
                 * @param {AInteractionEvent} event
                 * @param {AKeyboardInteraction} interaction
                 */
                onKeyDown: (event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    // For now we will just log what key was pressed
                    console.log(event.key)

                    /**
                     * This is how you handle arrow keys
                     */
                    if (event.key === "ArrowRight") {
                    }
                    if (event.key === "ArrowLeft") {
                    }
                    if (event.key === "ArrowUp") {
                    }
                    if (event.key === "ArrowDown") {
                    }
                    if(event.key == "C"){
                    }
                },

                /**
                 * Called when a keyboard key is released while the application window is in focus
                 * @param {AInteractionEvent} event
                 * @param {AKeyboardInteraction} interaction
                 */
                onKeyUp:(event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    /**
                     * Respond to key up events
                     */
                    if (event.key === "ArrowRight") {
                    }
                    if (event.key === "ArrowLeft") {
                    }
                    if (event.key === "ArrowUp") {
                    }
                    if (event.key === "ArrowDown") {
                    }
                },

                /**
                 * Called when mouse drag begins
                 * @param {AInteractionEvent} event
                 * @param {ADragInteraction} interaction
                 */
                onDragStart:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let ndcCursor = event.ndcCursor;
                    if(ndcCursor) {
                        interaction.cursorStartPosition = this.model.worldPointFromNDCCursor(ndcCursor);
                    }
                },

                /**
                 * Called when mouse moves while mouse button is pressed
                 * @param {AInteractionEvent} event
                 * @param {ADragInteraction} interaction
                 */
                onDragMove:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let cursorPosition = event.ndcCursor?.times(this.model.sceneScale);
                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if(event.shiftKey){
                        }
                        if (keysDownState['x']) {
                        } else if (keysDownState['y']) {
                        } else {
                        }
                    }
                },

                /**
                 * Called when mouse button is released after a drag action
                 * @param {AInteractionEvent} event
                 * @param {ADragInteraction} interaction
                 */
                onDragEnd:(event:AInteractionEvent, interaction:ADragInteraction)=>{},

                /**
                 * Called when mouse is clicked without dragging
                 * @param {AInteractionEvent} event
                 */
                onClick:(event:AInteractionEvent)=>{
                    this.eventTarget.focus();
                    let cursorPosition = event.ndcCursor?.times(this.model.sceneScale);
                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if (keysDownState['x']) {
                            console.log(`Click with "x" key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        } else {
                            console.log(`Click at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                        if(event.shiftKey){
                            console.log(`Click with shift key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                    }
                    this.model.signalComponentUpdate();
                },
            }
        )
        this.setCurrentInteractionMode("Main");
    }

    /**
     * This is what the browser calls every time a frame is rendered to render the next frame. Probably don't mess with this for now...
     * @param {AGLContext} context
     */
    onAnimationFrameCallback(context:AGLContext) {
        // call the model's time update function
        this.model.timeUpdate(this.model.clock.time)

        // render the scene view
        super.onAnimationFrameCallback(context);
    }



}
