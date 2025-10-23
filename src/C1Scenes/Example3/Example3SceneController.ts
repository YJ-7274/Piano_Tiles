import {App2DSceneController} from "../../anigraph/starter/App2D/App2DSceneController";
import {Example3SceneModel} from "./Example3SceneModel";
import {
    ADragInteraction,
    AGLContext,
    AInteractionEvent,
    AKeyboardInteraction,
    ASVGView,
    Color,
    Vec2
} from "../../anigraph";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {CustomPolygonModel, CustomPolygonView} from "./nodes";
import {TriangleAtVerticesModel} from "./nodes/TriangleAtVerticesModel";
import {TrianglesAtVerticesView} from "./nodes/TrianglesAtVerticesView";

export class Example3SceneController extends App2DSceneController{
    get model():Example3SceneModel{
        return this._model as Example3SceneModel;
    }


    async initScene() {
        // You can set the clear color for the rendering context
        this.setClearColor(new Color(1.0,1.0, 1.0));
        super.initScene();
    }

    /**
     * Specifies what view classes to use for different model class.
     */
    initModelViewSpecs() {
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(CustomPolygonModel, CustomPolygonView);
        this.addModelViewSpec(TriangleAtVerticesModel, TrianglesAtVerticesView);
    }

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
                onKeyDown: (event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    console.log(event.key)
                    /**
                     * Respond to key down events
                     */

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
                onDragStart:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    interaction.cursorStartPosition = this.getWorldCoordinatesOfCursorEvent(event);
                },
                onDragMove:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let cursorPosition = this.getWorldCoordinatesOfCursorEvent(event) as Vec2;
                    let cursorStartPosition = interaction.cursorStartPosition;
                    let cursorVector = cursorPosition.minus(cursorStartPosition);
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
                onDragEnd:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                },
                onClick:(event:AInteractionEvent)=>{
                    this.eventTarget.focus();
                    let cursorPosition = this.getWorldCoordinatesOfCursorEvent(event);
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

    onAnimationFrameCallback(context:AGLContext) {
        // call the model's time update function
        this.model.timeUpdate(this.model.clock.time)

        // render the scene view
        super.onAnimationFrameCallback(context);
    }



}
