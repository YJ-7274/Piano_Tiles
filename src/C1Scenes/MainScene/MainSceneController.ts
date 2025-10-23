import {App2DSceneController} from "../../anigraph/starter/App2D/App2DSceneController";
import {MainSceneModel} from "./MainSceneModel";
import {
    ADragInteraction,
    AGLContext,
    AInteractionEvent,
    AKeyboardInteraction, ANodeModel, ANodeView,
    Color,
    GetAppState
} from "../../anigraph";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {
    MyCustomModel, 
    MyCustomView, 
    PianoKeyModel, 
    PianoKeyView,
    HitBandModel,
    HitBandView
} from "./nodes";
import {ASceneInteractionMode} from "../../anigraph/starter";
import {addExampleControlPanelControls} from "../../ExampleBasicAniGraphUsage/AddingDifferentControlPanelControls";
import { DIFFICULTY_OPTIONS } from "./MainSceneModel";

/**
 * This is your Scene Controller class. The scene controller is responsible for managing user input with the keyboard
 * and mouse, as well as making sure that the view hierarchy matches the model heirarchy.
 */
export class MainSceneController extends App2DSceneController{
    get model():MainSceneModel{
        return this._model as MainSceneModel;
    }

    /**
     * The main customization you might do here would be to set the background color or set a background image.
     * Check out Lab Cat's helpful Example2 scene for example code that sets the background to an image.
     * @returns {Promise<void>}
     */
    async initScene() {
        // You can set the clear color for the rendering context (fallback if no texture)
        this.setClearColor(Color.White());

        // Initialize base scene (sets up Interaction control)
        super.initScene();

        // Add our controls after Interaction so it appears below
        this.initControlPanelControls();

        // Load and apply background texture
        await this.model.loadTexture(`./images/background2.jpg`, "Purple");
        this.view.setBackgroundTexture(this.model.getTexture("Purple"));

        // Subscribe to stuff if desired...
        // const self = this;
    }

    initControlPanelControls(){
        const appState = GetAppState();
        const defaultIndex = Math.max(0, DIFFICULTY_OPTIONS.findIndex(o => o.label === "Medium"));
        const clampedIndex = defaultIndex >= 0 ? defaultIndex : 1;
        // Horizontal slider with 3 discrete points (0,1,2)
        appState.addSliderControl("DifficultyIndex", clampedIndex, 0, DIFFICULTY_OPTIONS.length-1, 1);
        // Apply initial value
        this.model.setTileTravelBeats(DIFFICULTY_OPTIONS[clampedIndex].beats);
        // React to slider changes
        this.subscribeToAppState("DifficultyIndex", (value: number) => {
            const idx = Math.min(DIFFICULTY_OPTIONS.length-1, Math.max(0, Math.round(value)));
            this.model.setTileTravelBeats(DIFFICULTY_OPTIONS[idx].beats);
        }, "DifficultyIndexSubscription");
    }

    /**
     * Specifies what view classes to use for different model class.
     * If you create custom models and views, you will need to link them here by calling `addModelViewSpec` with the
     * model class as the first argument and the view class as the second. Check out Example2 and Example3 for examples
     * with custom nodes added.
     */
    initModelViewSpecs() {
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(PianoKeyModel, PianoKeyView);
        this.addModelViewSpec(MyCustomModel, MyCustomView);
        this.addModelViewSpec(HitBandModel, HitBandView);
    }

    createViewForNodeModel(nodeModel: ANodeModel): ANodeView {
        return super.createViewForNodeModel(nodeModel);
    }

    initInteractions() {
        super.initInteractions();
        const self = this;

        this.createNewInteractionMode(
            "Main",
            {
                onKeyDown: (event: AInteractionEvent, interaction: AKeyboardInteraction) => {
                    const keyboardEvent = event.DOMEvent as KeyboardEvent;
                    if (keyboardEvent?.repeat) {
                        return;
                    }
                    const raw = keyboardEvent?.key ?? event.key;
                    const key = keyboardEvent.code === "Semicolon" ? ";" : raw;

                    const isSpaceHeld = this.getKeysDownState()[" "];

                    if (key && this.model.handleKeyDown(key, keyboardEvent.shiftKey, isSpaceHeld)) {
                        keyboardEvent?.preventDefault?.();
                    }

                    if (keyboardEvent.code === "Space") {
                        keyboardEvent.preventDefault();
                    }
                },

                onKeyUp:(event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    const keyboardEvent = event.DOMEvent as KeyboardEvent;
                    const raw = keyboardEvent?.key ?? event.key;
                    const key = keyboardEvent.code === "Semicolon" ? ";" : raw;
                    const isSpaceHeld = this.getKeysDownState()[" "];

                    if (key && this.model.handleKeyUp(key, keyboardEvent.shiftKey, isSpaceHeld)) {
                        keyboardEvent?.preventDefault?.();
                    }
                },
                onDragStart:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let ndcCursor = event.ndcCursor;
                    if(ndcCursor) {
                        interaction.cursorStartPosition = this.model.worldPointFromNDCCursor(ndcCursor);
                    }
                },
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
                onDragEnd:(event:AInteractionEvent, interaction:ADragInteraction)=>{},
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

    onAnimationFrameCallback(context:AGLContext) {
        this.model.timeUpdate(this.model.clock.time)
        super.onAnimationFrameCallback(context);
    }
}
