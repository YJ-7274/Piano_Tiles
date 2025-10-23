/**
 * Player Controls. An InteractionMode that activates interactions with a given DOM element.
 * You can create custom controls by subclassing to define your own:
 * onMouseMove: callback for mouse movement
 * onKeyDown & onKeyUp: callbacks for when keys are pressed and released
 */

import {
    ADragInteraction,
    AKeyboardInteraction,
    SetInteractionCallbacks,
    AInteractionEvent,
    AInteractionMode,
    ADOMPointerMoveInteraction, AClickInteraction
} from "../../interaction";
import {ACamera} from "../../math";
import {ACameraModel} from "../../scene/camera";
import {ASerializable} from "../../base";
import {Vec2, V2} from "../../math";
import {AWheelInteraction, AWheelInteractionCallback} from "../../interaction/AWheelInteraction";
import {ASceneController} from "../../scene/ASceneController";
import type {HasInteractionModeCallbacks} from "../../interaction";
import {ASceneInteractionMode} from "./ASceneInteractionMode";
import {CallbackType} from "../../basictypes";

export enum PointerLockEvents{
    Lock="PointerLock_Lock",
    Unlock="PointerLock_Unlock",
}

@ASerializable("AScenePointerLockInteractionMode")
export class AScenePointerLockInteractionMode extends ASceneInteractionMode implements HasInteractionModeCallbacks {
    isLocked: boolean=false;
    static LockEvents=PointerLockEvents;
    _onLock!:CallbackType;
    _onUnlock!:CallbackType;
    onLock(...args:any[]){if(this._onLock){this._onLock(...args);}}
    onUnlock(...args:any[]){if(this._onUnlock){this._onUnlock(...args);}}


    init(owner: ASceneController, ...args: any[]){
        super.init(owner, ...args);
        this._initPointerLock();
        this.onPointerlockChange = this.onPointerlockChange.bind(this);
        this.onPointerlockError = this.onPointerlockError.bind(this);
    }

    _initPointerLock(){
        const self = this;
        this.addInteraction(AClickInteraction.Create(this.domElement, ()=>{
            self.lockPointer();
        }))
    }

    beforeActivate(...args:any[]) {
        this.connect();
    }
    beforeDeactivate(...args:any[]) {
        this.onUnlock();
        this.disconnect();
    }

    connect(){
        const self = this;
        // self.domElement.ownerDocument.addEventListener( 'mousemove', self.onMouseMove );
        self.domElement.ownerDocument.addEventListener( 'pointerlockchange', self.onPointerlockChange );
        self.domElement.ownerDocument.addEventListener( 'pointerlockerror', self.onPointerlockError );
    }

    disconnect(){
        const self = this;
        // self.domElement.ownerDocument.removeEventListener( 'mousemove', self.onMouseMove );
        self.domElement.ownerDocument.removeEventListener( 'pointerlockchange', self.onPointerlockChange );
        self.domElement.ownerDocument.removeEventListener( 'pointerlockerror', self.onPointerlockError );

    }
    lockPointer(){
        this.domElement.requestPointerLock();
        this.onLock();
    }

    unlockPointer(){
        this.domElement.ownerDocument.exitPointerLock();
        this.onUnlock();
    }

    dispose(){
        this.disconnect();
    };


    onPointerlockChange() {
        const self = this;
        if ( self.domElement.ownerDocument.pointerLockElement === self.domElement ) {
            self.owner.signalEvent(AScenePointerLockInteractionMode.LockEvents.Lock);
            self.isLocked = true;
        } else {
            self.owner.signalEvent(AScenePointerLockInteractionMode.LockEvents.Unlock);
            self.isLocked = false;
        }
    }

    onPointerlockError(){
        console.error( 'Unable to use Pointer Lock API' );
    }

    onMouseMove(event:AInteractionEvent, interaction:ADOMPointerMoveInteraction ) {
        // console.log(event);
        if ( this.isLocked === false ) return;

        let webEvent = (event.DOMEvent as MouseEvent);
        // @ts-ignore
        const movementX = webEvent.movementX || webEvent.mozMovementX || webEvent.webkitMovementX || 0;
        // @ts-ignore
        const movementY = webEvent.movementY || webEvent.mozMovementY || webEvent.webkitMovementY || 0;
    }
}




