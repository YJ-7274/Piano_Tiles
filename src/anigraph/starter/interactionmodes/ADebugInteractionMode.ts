import {
    ASerializable
} from "../../base";
import {ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent,
    AKeyboardInteraction
} from "../../interaction";
import {ASceneController} from "../../scene/ASceneController";
import {AWheelInteraction} from "../../interaction/AWheelInteraction";
import {ASceneInteractionMode} from "./ASceneInteractionMode";
import {NodeTransform3D, Quaternion, Vec2, Vec3} from "../../math";

import type {HasInteractionModeCallbacks} from "../../interaction";

@ASerializable("ADebugInteractionMode")
export class ADebugInteractionMode extends ASceneInteractionMode{
    cameraMovementSpeed:number=0.2;
    cameraOrbitSpeed:number=1;
    cameraOrbitCenter:Vec3;
    static NameInGUI:string = "Debug";

    constructor(owner?:ASceneController,
                name?:string,
                interactionCallbacks?:HasInteractionModeCallbacks,
                ...args:any[]) {
        super(name, owner, interactionCallbacks, ...args);
        this.cameraOrbitCenter = new Vec3();
    }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: ASceneController, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        let cameraPose = this.camera.getPoseAsNodeTransform();
        let movedir = cameraPose.rotation.getLocalZ();
        this.camera.setPosition(cameraPose.position.plus( movedir.times(0.0005 * zoom)));
    }

    onMouseMove(event:AInteractionEvent, interaction: ADOMPointerMoveInteraction){

    }

    onKeyDown(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(interaction.keysDownState['w']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.forward.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['a']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.right.times(-this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['s']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.forward.times(-this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['d']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.right.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['r']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.up.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['f']){
            this.camera.nodeTransform.position = this.camera.nodeTransform.position.plus(this.camera.up.times(-this.cameraMovementSpeed));
        }
        if(event.key == "P"){
            console.log(this.cameraModel.transform)
        }
    }

    onKeyUp(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(!interaction.keysDownState['w']){
        }
        if(!interaction.keysDownState['a']){
        }
        if(!interaction.keysDownState['s']){
        }
        if(!interaction.keysDownState['d']){
        }
        if(!interaction.keysDownState['r']){
        }
        if(!interaction.keysDownState['f']){
        }
    }

    onDragStart(event: AInteractionEvent, interaction: ADragInteraction): void {
        interaction.setInteractionState('lastCursor', event.ndcCursor);
    }
    onDragMove(event: AInteractionEvent, interaction: ADragInteraction): void {
        if(!event.ndcCursor){
            return;
        }
        let mouseMovement = event.ndcCursor.minus(interaction.getInteractionState('lastCursor'));
        interaction.setInteractionState('lastCursor', event.ndcCursor);
        let rotationX = -mouseMovement.x*this.cameraOrbitSpeed;
        let rotationY = mouseMovement.y*this.cameraOrbitSpeed;
        let qX = Quaternion.FromAxisAngle(this.camera.up, rotationX);
        let qY = Quaternion.FromAxisAngle(this.camera.right, rotationY);
        let newPose = this.camera.nodeTransform.clone();
        newPose = new NodeTransform3D(qX.appliedTo(newPose.position), newPose.rotation.times(qX));
        newPose = new NodeTransform3D(qY.appliedTo(newPose.position), newPose.rotation.times(qY));
        this.cameraModel.setPose(newPose);
        this.cameraModel.signalTransformUpdate();
    }
    onDragEnd(event: AInteractionEvent, interaction: ADragInteraction): void {
        let cursorWorldCoordinates:Vec2|null = event.ndcCursor;
        let dragStartWorldCoordinates:Vec2|null = interaction.dragStartEvent.ndcCursor;
    }
}
