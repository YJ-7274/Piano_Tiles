import {AModel} from "./AModel";
import {AObjectNode} from "../aobject";
import {AClock} from "../../time";
import {AInteraction, AInteractionMode, AInteractionModeMap, BasicInteractionModes} from "../../interaction";
import {CallbackType} from "../../basictypes";
import {BezierTween} from "../../geometry";
import {AGLContext, AGLRenderWindow} from "../../rendering";
import { v4 as uuidv4 } from "uuid";
import {HasInteractions} from "./HasInteractions";

export interface AControllerInterface{
    sceneController:SceneControllerInterface;
    get eventTarget():HTMLElement;
}

export interface SceneControllerInterface extends AControllerInterface{
    get isReadyToRender():boolean;
    initRendering(contextView:AGLRenderWindow):Promise<void>;
    onAnimationFrameCallback(context:AGLContext):void;
    onWindowResize(renderWindow:AGLRenderWindow):void;
    get renderWindow():AGLRenderWindow;
    get context():AGLContext;
}

export abstract class AController extends AObjectNode implements AControllerInterface, HasInteractions{
    protected _model!:AModel;
    protected _clock: AClock;
    get time(){
        return this._clock.time;
    }
    abstract get sceneController():SceneControllerInterface;
    abstract get eventTarget():HTMLElement;

    /**
     * Interaction mode map. Has a .modes property that maps mode names to AInteractionModes.
     * @type {AInteractionModeMap}
     * @protected
     */
    protected _interactions!: AInteractionModeMap;
    /**
     * Right now, controllers are restricted to having one or zero active modes at a time. The name of the current mode, which can be active or inactive, is stored here.
     * @type {string}
     * @protected
     */
    protected _currentInteractionModeName: string;

    get interactionModes(){
        return this._interactions.modes;
    }


    /**
     * Getter for the current interaction mode.
     * @returns {AInteractionMode}
     */
    get interactionMode() {
        return this._interactions.modes[this._currentInteractionModeName];
    }

    constructor() {
        super();
        this._clock = new AClock();
        this._clock.play();
        this._interactions = new AInteractionModeMap(this);
        this._currentInteractionModeName = BasicInteractionModes.default;
    }

    getContextDOMElement(){
        return this.sceneController.context.renderer.domElement;
    }

    /**
     * Add an interaction to the current mode.
     * @param interaction
     */
    addInteraction(interaction: AInteraction) {
        this.interactionMode.addInteraction(interaction);
        // interaction.owner = this;
        return interaction;
    }

    activateInteractions() {
        this.interactionMode.activate();
    }

    setCurrentInteractionMode(name?: string) {
        this.interactionMode.deactivate();
        let activeMode = name ? name : BasicInteractionModes.default;
        this._interactions.setActiveMode(activeMode);
        this._currentInteractionModeName = activeMode;
    }

    defineInteractionMode(name: string, mode?: AInteractionMode) {
        this._interactions.defineMode(name, mode);
    }

    clearInteractionMode(name: string) {
        this._interactions.undefineMode(name)
    }

    clearAllInteractionModes(){
        this._interactions.clearAllModes();
        this._interactions = new AInteractionModeMap(this);
    }

    isInteractionModeDefined(name: string):boolean {
        return this._interactions.modeIsDefined(name);
    }


    /**
     * If you provide a handle, then the action will not call so long as an existing subscription by that handle exists.
     * This means that you won't duplicate the action before one has finished previously.
     * @param callback  what should be called at each update
     * @param duration  how long it will take in total
     * @param tween  an optional tween curve
     * @param actionOverCallback  what to run when completed
     * @param handle  a handle to identify the timed action
     */
    addTimedAction(callback: (actionProgress: number) => any, duration: number, actionOverCallback?: CallbackType, tween?: BezierTween, handle?: string) {
        if (handle && (handle in this._subscriptions)) {
            return;
        }
        const self = this;
        const subscriptionHandle = handle ?? uuidv4();
        this.subscribe(this._clock.CreateTimedAction(callback, duration, () => {
                self.unsubscribe(subscriptionHandle);
                if (actionOverCallback) {
                    actionOverCallback();
                }
            }, tween),
            subscriptionHandle);
    }

    release(...args: undefined[]) {
        this.dispose();
        super.release(...args);
    }

    dispose() {
        this._interactions.dispose();
    }
}
