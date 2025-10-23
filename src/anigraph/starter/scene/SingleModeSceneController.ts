// import {
//     AGLContext, Color,
//     AClickInteraction, ADragInteraction,
//     AInteractionEvent, AKeyboardInteraction,
//     V3
// } from "../../index";
import {AGLContext} from "../../rendering";
import {Color, V3} from "../../math";
import {AClickInteraction, ADragInteraction, AInteractionEvent, AKeyboardInteraction} from "../../interaction";
import {ABasicSceneController} from "./ABasicSceneController";

/**
 * Mostly students will just write the scene controller subclass.
 * The Component things for them to write are
 * - initRendering(renderWindow:AGLRenderWindow) | sets things up
 * - onAnimationFrameCallback(context:AGLContext) | renders the current frame
 * - createViewForNodeModel(nodeModel: ANodeModel): ANodeView | creates a view for a newly added model
 *
 */
export abstract class SingleModeSceneController extends ABasicSceneController{
    static ModeName:string="Default"
    keyboardInteraction!:AKeyboardInteraction;

    abstract onClick(event:AInteractionEvent):void;
    abstract onKeyDown(event:AInteractionEvent, interaction:AKeyboardInteraction):void;
    abstract onKeyUp(event:AInteractionEvent, interaction:AKeyboardInteraction):void;
    // abstract onMouseMove(event?:AInteractionEvent, interaction?: ADOMPointerMoveInteraction):void;

    abstract dragStartCallback(event:AInteractionEvent, interaction?:ADragInteraction):void;
    abstract dragMoveCallback(event:AInteractionEvent, interaction?:ADragInteraction):void;
    abstract dragEndCallback(event:AInteractionEvent, interaction?:ADragInteraction):void;


    initInteractions() {
        super.initInteractions();
        const self = this;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onClick = this.onClick.bind(this);
        this.dragStartCallback = this.dragStartCallback.bind(this);
        this.dragMoveCallback = this.dragMoveCallback.bind(this);
        this.dragEndCallback = this.dragEndCallback.bind(this);
        // this.onMouseMove = this.onMouseMove.bind(this);
        this.eventTarget.tabIndex = this.tabIndex;

        this.keyboardInteraction = AKeyboardInteraction.Create(
            this.eventTarget,
            // this.eventTarget.ownerDocument,
            this.onKeyDown,
            this.onKeyUp,
        );
        this.addInteraction(this.keyboardInteraction);

        this.addInteraction(AClickInteraction.Create(this.eventTarget, this.onClick))

        this.addInteraction(ADragInteraction.Create(
            this.eventTarget,
            this.dragStartCallback,
            this.dragMoveCallback,
            this.dragEndCallback
        ))
    }

    _beforeInitScene(){
        if(this.renderWindow) {
            this.onWindowResize(this.renderWindow);
        }
        // this.camera.setPerspectiveFOV(75, this.renderWindow.aspect)
        this.cameraModel.setPosition(V3(0,0,10));

    }

    // async initScene() {
    //     super.initScene();
    // }




}
