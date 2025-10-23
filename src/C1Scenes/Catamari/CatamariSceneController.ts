import * as THREE from "three";
import {
    ADragInteraction, AGLContext,
    AGLRenderWindow,
    AInteractionEvent,
    AKeyboardInteraction,
    ANodeModel,
    ANodeView, AObjectNode,
    Color, GetAppState,
} from "../../anigraph";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {CatamariSceneModel} from "./CatamariSceneModel";
import {CatModel, CatView, PlayerModel, PlayerView} from "./nodes";
import {callLabCatForth, labCatGoesIntoHiding, LabCatModel, LabCatView} from "./nodes/LabCat";
import {App2DSceneController} from "../../anigraph/starter/App2D/App2DSceneController";
import {ASceneInteractionMode} from "../../anigraph/starter";
import {GameChatacter2DModel} from "./nodes/GameChatacter2DModel";

export class CatamariSceneController extends App2DSceneController{
    mainInteractionMode!:ASceneInteractionMode;
    get model():CatamariSceneModel{
        return this._model as CatamariSceneModel;
    }

    /**
     * If you want a custom camera for this window you can specify it here.
     * If you are just using the model's camera, then that should be part of the scene hierarchy already.
     */
    // initCamera(){
    //     if(this.renderWindow) {
    //         this.onResize(this.renderWindow);
    //     }
    // }

    async initScene() {
        // You can set the clear color for the rendering context
        this.setClearColor(Color.White());
        this.initControlPanelControls();
        super.initScene();

        // Subscribe to the call Lab Cat forth...
        const self = this;
        this.subscribe(this.model.labCat.addStateKeyListener("isActive", ()=>{
            callLabCatForth(self);
        }))
    }

    initControlPanelControls(){
        const appState = GetAppState();
        // appState.addSliderControl(newCarSpeedStateName, 1, 0, 2, 0.001);
        const self = this;
        appState.addButton("LAB CAT!", ()=>{
            callLabCatForth(self);
        })
    }


    /**
     * Specifies what view classes to use for different model class.
     */
    initModelViewSpecs() {
        super.initModelViewSpecs();
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(PlayerModel, PlayerView);
        this.addModelViewSpec(CatModel,CatView);
        this.addModelViewSpec(LabCatModel,LabCatView);
    }

    /**
     * This will create any view specified by an addModelViewSpec call by default.
     * Only use this function if you want to do something custom / unusual that can't be contelled with a spec.
     * @param {ANodeModel} nodeModel
     * @returns {ANodeView}
     */
    createViewForNodeModel(nodeModel: ANodeModel): ANodeView {
        return super.createViewForNodeModel(nodeModel);
    }


    onModelNodeAdded(nodeModel: ANodeModel) {
        // super.onModelNodeAdded(nodeModel);
        let modelViewList = this.getViewListForModel(nodeModel);
        if(modelViewList.length<1){
            this._onNewModelNodeAdded(nodeModel);
            modelViewList = this.getViewListForModel(nodeModel);
        }
        if(modelViewList.length>0) {
            if(modelViewList.length>1){
                throw new Error("Have not implemented multiple views for a given model in one scene controller yet!")
            }
            let view = modelViewList[0];
            // let newView = this.createViewForNodeModel(nodeModel);
            // this.view.addView(newView);
            if (nodeModel.parent instanceof ANodeModel) {
                let parentView = this.getViewListForModel(nodeModel.parent)[0];
                view.setParentView(parentView);
            }else if(nodeModel.parent === this.model){
                view.setParentView(this.view);
            }
        }
    }


    initInteractions() {
        super.initInteractions();
        const self = this;
        this.mainInteractionMode = new ASceneInteractionMode(
            "A2InteractionMode",
            this,
            {
                onKeyDown: (event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    console.log(event.key)
                    if (event.key === "ArrowRight" || event.key === "d") {
                        this.model.player.onRightTurn();
                    }
                    if (event.key === "ArrowLeft" || event.key === "a") {
                        this.model.player.onLeftTurn();
                    }
                    if (event.key === "ArrowUp" || event.key === "w") {
                        this.model.player.onMoveForward()
                    }
                    if (event.key === "ArrowDown" || event.key === "s") {
                        this.model.player.onMoveBackward()
                    }

                    if(event.key == "C"){
                        this.model.addCat();
                    }
                },
                onKeyUp:(event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    if (event.key === "ArrowRight" || event.key === "d") {
                        this.model.player.onHaltRight();
                    }
                    if (event.key === "ArrowLeft" || event.key === "a") {
                        this.model.player.onHaltLeft();
                    }
                    if (event.key === "ArrowUp" || event.key === "w") {
                        this.model.player.onHaltForward();
                    }
                    if (event.key === "ArrowDown" || event.key === "s") {
                        this.model.player.onHaltBackward();
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
        this.defineInteractionMode("MainInteractionMode", this.mainInteractionMode);
        this.setCurrentInteractionMode("MainInteractionMode");
    }

    onResize(renderWindow?: AGLRenderWindow): void {
        if(renderWindow && renderWindow.container !== undefined) {
            this.renderer.setSize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
            this.cameraModel.onCanvasResize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
            // this.cameraModel.onCanvasResize(500,500);
        }
    }


    onAnimationFrameCallback(context:AGLContext) {
        // render the scene view
        this.model.timeUpdate(this.model.clock.time)
        super.onAnimationFrameCallback(context);
    }

}
