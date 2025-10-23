import {AInteraction} from "./AInteraction";
import {HasInteractions} from "../base/amvc/HasInteractions";
import {CallbackType} from "../basictypes";
import {AWheelInteractionCallback} from "./AWheelInteraction";
import {ADragInteractionCallback} from "./ADragInteraction";
import {AClickInteraction} from "./AClickInteraction";
import {AKeyboardInteraction, KeyDownStateMap} from "./DOM";

export interface AInteractionModeInterface{
    interactions:AInteraction;
}

export enum BasicInteractionModes{
    default='default'
}


export enum PointerLockEvents{
    Lock="PointerLock_Lock",
    Unlock="PointerLock_Unlock",
}

/**
 * An interface for objects that have standard interaction callbacks for things like mouse and keyboard
 */
export interface HasInteractionModeCallbacks {
    onKeyDown?:CallbackType|undefined;
    onKeyUp?:CallbackType|undefined;
    onMouseMove?:CallbackType|undefined;
    onWheelMove?:AWheelInteractionCallback|undefined;
    onDragStart?:ADragInteractionCallback|undefined;
    onDragMove?:ADragInteractionCallback|undefined;
    onDragEnd?:ADragInteractionCallback|undefined;
    onClick?:CallbackType|undefined;
    afterActivate?:CallbackType|undefined;
    afterDeactivate?:CallbackType|undefined;
    beforeActivate?:CallbackType|undefined;
    beforeDeactivate?:CallbackType|undefined;
    dispose?:CallbackType|undefined;
}

/**
 * A helper function for setting the interaction callbacks of an object by giving it a dictionary of interaction callbacks
 * @param owner
 * @param interactionCallbacks
 * @param bind
 * @constructor
 */
export function SetInteractionCallbacks(owner:HasInteractionModeCallbacks, interactionCallbacks:HasInteractionModeCallbacks, bind:boolean){
    if ('onKeyDown' in interactionCallbacks && interactionCallbacks.onKeyDown) {
        owner.onKeyDown = interactionCallbacks.onKeyDown;
        if(bind) {
            owner.onKeyDown = owner.onKeyDown.bind(owner);
        }
    }
    if ('onKeyUp' in interactionCallbacks && interactionCallbacks.onKeyUp) {
        owner.onKeyUp = interactionCallbacks.onKeyUp;
        if(bind) {
            owner.onKeyUp = owner.onKeyUp.bind(owner);
        }
    }
    if ('onMouseMove' in interactionCallbacks && interactionCallbacks.onMouseMove) {
        owner.onMouseMove = interactionCallbacks.onMouseMove;
        if(bind) {
            owner.onMouseMove = owner.onMouseMove.bind(owner);
        }
    }
    if ('onWheelMove' in interactionCallbacks && interactionCallbacks.onWheelMove) {
        owner.onWheelMove = interactionCallbacks.onWheelMove;
        if(bind){
            owner.onWheelMove = owner.onWheelMove.bind(owner);
        }
    }
    if ('onDragStart' in interactionCallbacks && interactionCallbacks.onDragStart) {
        owner.onDragStart = interactionCallbacks.onDragStart;
        if(bind){
            owner.onDragStart = owner.onDragStart.bind(owner);
        }
    }
    if ('onDragMove' in interactionCallbacks && interactionCallbacks.onDragMove) {
        owner.onDragMove = interactionCallbacks.onDragMove;
        if(bind){
            owner.onDragMove = owner.onDragMove.bind(owner);
        }
    }
    if ('onDragEnd' in interactionCallbacks && interactionCallbacks.onDragEnd) {
        owner.onDragEnd = interactionCallbacks.onDragEnd;
        if(bind){
            owner.onDragEnd = owner.onDragEnd.bind(owner);
        }
    }

    if('onClick' in interactionCallbacks && interactionCallbacks.onClick){
        owner.onClick = interactionCallbacks.onClick;
        if(bind){
            owner.onClick = owner.onClick.bind(owner);
        }
    }


    if ('afterActivate' in interactionCallbacks && interactionCallbacks.afterActivate) {
        owner.afterActivate = interactionCallbacks.afterActivate;
        if(bind){
            owner.afterActivate = owner.afterActivate.bind(owner);
        }
    }
    if ('afterDeactivate' in interactionCallbacks && interactionCallbacks.afterDeactivate) {
        owner.afterDeactivate = interactionCallbacks.afterDeactivate;
        if(bind){
            owner.afterDeactivate = owner.afterDeactivate.bind(owner);
        }
    }

    if ('beforeActivate' in interactionCallbacks && interactionCallbacks.beforeActivate) {
        owner.beforeActivate = interactionCallbacks.beforeActivate;
        if(bind){
            owner.beforeActivate = owner.beforeActivate.bind(owner);
        }
    }

    if ('beforeDeactivate' in interactionCallbacks && interactionCallbacks.beforeDeactivate) {
        owner.beforeDeactivate = interactionCallbacks.beforeDeactivate;
        if(bind){
            owner.beforeDeactivate = owner.beforeDeactivate.bind(owner);
        }
    }

    if ('dispose' in interactionCallbacks && interactionCallbacks.dispose) {
        owner.dispose = interactionCallbacks.dispose;
        if(bind){
            owner.dispose = owner.dispose.bind(owner);
        }
    }

}

/**
 * The interaction mode class
 * An interaction mode encapsulates a set of callbacks used for a common mode of interaction.
 */
export class AInteractionMode{
    public name!:string;
    public _owner!:HasInteractions;

    get owner(){
        return this._owner;
    }


    protected interactions:AInteraction[]=[];

    /**
     * Protected function pointers to call before and after a mode is activated, if you need to do any setup or teardown.
     * These are atually called in their non-private counterparts.
     * Defining them like this lets you set them more dynamically if desired.
     * So the functions below should be thought of as defaults that can be changed during execution.
     * @type {(...args: any[]) => any}
     * @private
     */
    protected _afterActivate!:(...args:any[])=>any;
    protected _afterDeactivate!:(...args:any[])=>any
    protected _beforeActivate!:(...args:any[])=>any;
    protected _beforeDeactivate!:(...args:any[])=>any

    /**
     * A dictionary you can use to store arbitrary state associated with the interaction mode
     * @type {{[p: string]: any}}
     */
    public modeState:{[name:string]:any}={};
    setModeState(name:string, value:any){this.modeState[name]=value;}
    getModeState(name:string){return this.modeState[name];}
    clearModeState(){this.modeState={};}

    /**
     * Called before and after activating the mode. Uses the protected counterparts by default.
     * @param args
     */
    afterActivate(...args:any[]){if(this._afterActivate) {this._afterActivate(...args);}}
    afterDeactivate(...args:any[]){if(this._afterDeactivate) {this._afterDeactivate(...args);}}
    beforeActivate(...args:any[]){if(this._beforeActivate) {this._beforeActivate(...args);}}
    beforeDeactivate(...args:any[]){if(this._beforeDeactivate) {this._beforeDeactivate(...args);}}

    bindMethods(){
        this.afterActivate = this.afterActivate.bind(this);
        this.afterDeactivate = this.afterDeactivate.bind(this);
        this.beforeActivate = this.beforeActivate.bind(this);
        this.beforeDeactivate = this.beforeDeactivate.bind(this);
    }

    /**
     * Whether the mode is currently active, i.e., in use.
     * @type {boolean}
     */
    public active:boolean=false;

    /**
     * Should you be able to select it in the control panel GUI
     * @type {boolean}
     */
    public isGUISelectable:boolean=true;

    /**
     *
     * @param name The name of the mode
     * @param owner The controller that is using this mode
     * @param args
     */
    constructor(name?:string, owner?:HasInteractions, ...args:any[]){
        if(name) this.name = name;
        if(owner) this._owner = owner;
        this.bindMethods();
    }

    /**
     * Gets a list of keyboard interactions in the mode
     * @returns {AKeyboardInteraction[]}
     */
    getKeyboardInteractions():AKeyboardInteraction[]{
        let keyboardInteractions:AKeyboardInteraction[]=[];
        for(let i of this.interactions){
            if(i instanceof AKeyboardInteraction){
                keyboardInteractions.push(i);
            }
        }
        return keyboardInteractions;
    }

    /**
     * Gets the current keydown state.
     * If you have multiple keyboard interactions it will warn you and map over them.
     * The recommendation is to just use one keyboard interaction, though.
     * @returns {KeyDownStateMap}
     */
    getKeyDownState():KeyDownStateMap{
        let keyboardInteractions = this.getKeyboardInteractions();
        if(keyboardInteractions.length==1){
            return keyboardInteractions[0].keysDownState;
        }else if(keyboardInteractions.length>1){
            console.warn("THERE WERE MULTIPLE KEYBOARD INTERACTIONS!")
            console.warn(keyboardInteractions);
            return keyboardInteractions[0].keysDownState;
        }else{
            return {};
        }
    }

    /**
     * adds interaction, and sets its owner to be this owner
     * @param interaction
     */
    addInteraction(interaction:AInteraction){
        // if(this.active){
        //     throw new Error("Cannot add interactions to an active interaction mode!");
        // }
        this.interactions.push(interaction);
        if(this.active && !interaction.active){
            interaction.activate();
        }
        if(!this.active && interaction.active){
            interaction.deactivate();
        }
        if(interaction.owner){
            throw new Error('interaction already has owner!');
        }
        interaction.owner = this.owner;
    }

    /**
     * Deactivate the interaction mode, so the callbacks will stop triggering.
     */
    deactivate(){
        this.beforeDeactivate();
        for (let interaction of this.interactions) {
            interaction.deactivate();
        }
        this.clearModeState();
        this.afterDeactivate();
        this.active=false;
    }

    /**
     * Activate the interaction mode, so the callbacks will start triggering.
     */
    activate(){
        this.beforeActivate();
        for (let interaction of this.interactions) {
            interaction.activate();
        }
        this.afterActivate();
        this.active=true;
    }

    /**
     * Set the callback that gets triggered after activating the mode
     * @param callback
     */
    setAfterActivateCallback(callback:(...args:any[])=>any){
        this._afterActivate = callback;
    }

    /**
     * Set the callback that gets triggered before activating the mode
     * @param {(...args: any[]) => any} callback
     */
    setBeforeActivateCallback(callback:(...args:any[])=>any){
        this._beforeActivate = callback;
    }

    /**
     * Set the callback that gets triggered after deactivating the mode
     * @param callback
     */
    setAfterDeactivateCallback(callback:(...args:any[])=>any){
        this._afterDeactivate = callback;
    }

    /**
     * Set the callback that gets triggered before deactivating the mode
     * @param callback
     */
    setBeforeDeactivateCallback(callback:(...args:any[])=>any){
        this._beforeDeactivate = callback;
    }

    /**
     * Time update function
     * @param t
     * @param args
     */
    timeUpdate(t:number, ...args:any[]){
    }
}


