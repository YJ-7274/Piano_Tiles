import {AModel, AModelInterface} from "../base/amvc/AModel";
import {AObject, AObjectNode, AObjectNodeEvents, AObjectState} from "../base/aobject";
import {ASerializable} from "../base/aserial";
import {ANodeModel} from "./nodeModel";
import {HasModelMap, MVMModelMap} from "../base/amvc/AModelViewMap";
import {ACameraModel} from "./camera";
import {BezierTween} from "../geometry";
import {AMaterialManager} from "../rendering/material";
import {ACallbackSwitch} from "../base";
import {AInteraction,
    AInteractionMode,
    AInteractionModeMap,
    BasicInteractionModes} from "../interaction";
import {
    CallbackType
} from "../basictypes";
import {AClock} from "../time/AClock";
import {v4 as uuidv4} from "uuid";
import {HasInteractions} from "../base/amvc/HasInteractions";

import {Mutex} from 'async-mutex';
import {ConfirmInitialized} from "./ConfirmInitialized";
import {GetAppState} from "../appstate";
import {AGLContext} from "../rendering";

export enum SceneEvents{
    NodeAdded="NodeAdded", // This does not directly trigger the creation of a view
    NodeRemoved="NodeRemoved",
    NodeReleased="NodeReleased",
    NodeMoved="NodeMoved",
    UpdateComponent="UpdateComponent"
}

enum ASCENEMODEL_EVENT_HANDLES{
    SCENE_NODE_ADDED="SCENE_NODE_ADDED",
    SCENE_NODE_REMOVED="SCENE_NODE_REMOVED",
    SCENE_NODE_RELEASED="SCENE_NODE_RELEASED",
    SCENE_CHILD_REMOVED="SCENE_CHILD_REMOVED"
}

// HasInteractions
@ASerializable("ASceneModel")
export abstract class ASceneModel extends AModel implements HasModelMap, ConfirmInitialized{
    static SceneEvents=SceneEvents;
    @AObjectState protected _isInitialized!:boolean;
    cameraModel!:ACameraModel;
    // protected _materials!:AMaterialManager;
    // get materials(){
    //     return this._materials;
    // }
    protected _clock: AClock;
    protected _interactionDOMElement:EventTarget;
    protected _initMutex:Mutex;
    get initMutex(){
        return this._initMutex;
    }

    get camera(){
        return this.cameraModel.camera;
    }

    get eventTarget(){
        return this._interactionDOMElement;
    }

    // /**
    //  * Interaction mode map. Has a .modes property that maps mode names to AInteractionModes.
    //  * @type {AInteractionModeMap}
    //  * @protected
    //  */
    // protected _interactions!: AInteractionModeMap;

    /**
     * Right now, controllers are restricted to having one or zero active modes at a time. The name of the current mode, which can be active or inactive, is stored here.
     * @type {string}
     * @protected
     */
    protected _currentInteractionModeName: string;

    get clock() {
        return this._clock;
    }

    /**
     * Args can be customized in subclass.
     * By default, can optionally be given an AGLContext
     * @param args
     */
    protected abstract initScene(...args:any[]):void;

    // protected abstract asyncInitScene(...args:any[]):Promise<void>;

    /**
     * Can be customized in subclass. Optionally given an AGLContext.
     * @param args
     */
    abstract initCamera(...args: any[]):void;
    onContextResize(context:AGLContext){
        let shape = context.getShape();
        this.cameraModel.onCanvasResize(shape.x, shape.y);
    }

    abstract timeUpdate(...args:any[]): void;

    /**
     * # Initialization:
     * Main models are initialized asynchronously, and initialization may be triggered lazily by the first controller
     * that tries to access the model (it can also be triggered more proactively, depending on the application).
     * The scene model has a state variable `isInitialized` that is set to false in the constructor, but flipped to true
     * after initialization is performed.
     *
     * To trigger initialization, the function `confirmInitialized` must be called at least once.
     *
     *
     */
    async confirmInitialized(...args:any[]){
        const self = this;
        await this.initMutex.runExclusive(async () => {
            if(!self._isInitialized){
                self._isInitialized = await self._asyncInitScene(...args);
                self._isInitialized = true;
                self._clock.play();
            }
        });
    }

    /**
     * Args can be customized for subclasses.
     * Can be given an AGLContext here.
     * @param args
     * @returns {Promise<boolean>}
     * @private
     */
    protected async _asyncInitScene(...args:any[]):Promise<boolean>{
        await this.PreloadAssets()

        this.initCamera(...args);
        this.addChild(this.cameraModel);
        this.initScene(...args)
        //     .catch(err => {
        //     console.log('Oh noooo!!');
        //     console.log(err);
        // });
        return true;
    }

    async loadStandardShaders(){
        let appState = GetAppState();
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.RGBA_SHADER);
        // await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.TEXTURED_SHADER)
        // await super.PreloadAssets();
        // this.initCamera()
    }


    async PreloadAssets(){
        // await this.materials.materialsLoadedPromise;
    }


    protected _modelMap:MVMModelMap={};
    get modelMap(){
        return this._modelMap;
    }


    get isInitialized(){
        return this._isInitialized;
    }

    addIsInitializedListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch{
        return this.addStateKeyListener('_isInitialized', callback, handle, synchronous);
    }

    addComponentUpdateListener(callback:(self:AObject)=>void, handle?:string):ACallbackSwitch{
        return this.addEventListener(ASceneModel.SceneEvents.UpdateComponent, callback, handle);
    }

    signalComponentUpdate(){
        this.signalEvent(ASceneModel.SceneEvents.UpdateComponent);
    }

    /**
     * Adds the model to the model map if it isn't already in there, then signals that a node has been added.
     * @param model
     * @private
     */
    protected _addModel(model:AModelInterface, ...args:any[]){
        if(!this.hasModel(model)){
            this.modelMap[model.uid]=model;
        }
        this.signalEvent(SceneEvents.NodeAdded, model, ...args);
    }
    protected _removeModel(model:AModelInterface){
        // delete this._modelMap[model.uid];
        this.signalEvent(SceneEvents.NodeRemoved, model);
    }

    protected _releaseModel(model:AModelInterface){
        delete this._modelMap[model.uid];
        this.signalEvent(SceneEvents.NodeReleased, model);
    }

    hasModel(model:AModelInterface){
        return (model.uid in this.modelMap);
    }

    hasModelID(modelID:string){
        return (modelID in this.modelMap);
    }

    constructor(name?:string) {
        super(name);
        this._initMutex = new Mutex();
        this._isInitialized = false;
        this._clock = new AClock();
        this._interactionDOMElement = document;
        // this._interactions = new AInteractionModeMap(this);
        this._currentInteractionModeName = BasicInteractionModes.default;

        this._initSceneGraphSubscriptions();
    }


    initPerspectiveCameraNearPlane(left: number, right: number, bottom: number, top: number, near?: number, far?: number){
        // this.camera = APerspectiveCameraModel.CreatePerspectiveFOV(90, 2, 0.001,100.0);
        this.cameraModel = ACameraModel.CreatePerspectiveNearPlane(left, right, bottom, top, near, far);
    }

    initPerspectiveCameraFOV(fovy: number, aspect: number, near?: number, far?: number){
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(fovy, aspect, near, far);
    }

    initOrthographicCamera(left:number, right:number, bottom:number, top:number, near?:number, far?:number){
        this.cameraModel =ACameraModel.CreateOrthographic(left, right, bottom, top, near, far);
            // AOrthoCameraModel.Create(-1, 1, -1, 1) as AOrthoCameraModel;
        // (this.camera as AOrthoCameraModel).normalized = normalized;
    }

    initNormalizedOrthographicCamera(){
        this.cameraModel = ACameraModel.CreateOrthographic(-1, 1, -1, 1);
        // this.cameraModel = AOrthoCameraModel.Create(-1, 1, -1, 1);
    }

    initUniformOrthographicCamera(scale?:number, near?:number, far?:number){
        scale = scale??1.0;
        this.cameraModel = ACameraModel.CreateOrthographic(-scale, scale, -scale, scale, near, far);
        // this.cameraModel = AOrthoCameraModel.Create(-1, 1, -1, 1);
    }

    init2DOrthoCamera(scale?:number, near:number=-1, far:number=1, aspect:number=1){
        scale = scale??1.0;
        this.cameraModel = ACameraModel.CreateOrthographic(-scale*aspect, scale*aspect, -scale, scale, near, far);
    }

    protected _initSceneGraphSubscriptions(){
        const self = this;
        this.subscribe(this.addEventListener(AObjectNodeEvents.DescendantAdded, (descendant:ANodeModel, ...args:any[])=>{
            this._addModel(descendant, ...args)
            // self._addModel(descendant);
        }), ASCENEMODEL_EVENT_HANDLES.SCENE_NODE_ADDED);

        this.subscribe(this.addEventListener(AObjectNodeEvents.DescendantRemoved, (descendant:ANodeModel)=>{
            self._removeModel(descendant);
        }), ASCENEMODEL_EVENT_HANDLES.SCENE_NODE_REMOVED);

        // this.subscribe(this.addEventListener(AObjectNodeEvents.ChildRemoved, (child:ANodeModel)=>{
        //     self._removeModel(child);
        // }), ASCENEMODEL_EVENT_HANDLES.SCENE_CHILD_REMOVED);

        this.subscribe(this.addEventListener(AObjectNodeEvents.DescendantReleased, (descendant:ANodeModel)=>{
            self._releaseModel(descendant);
        }), ASCENEMODEL_EVENT_HANDLES.SCENE_NODE_RELEASED);
        // this.subscribe(this.addChildRemovedListener( (child:AObjectNode)=>{
        //     self._removeModel(child as ANodeModel);
        // }), ASCENEMODEL_EVENT_HANDLES.SCENE_CHILD_REMOVED);
    }

    getSceneModelControlSpec(){
        let self = this;
        return {
            Name: {
                value: self.name,
                onChange: (v: string) => {
                    self.name = v;
                }
            },
        }
    }



    getDescendantList(){
        return super.getDescendantList() as ANodeModel[];
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

    // addTimedAction(callback: (actionProgress: number) => any, duration: number, actionOverCallback?: CallbackType, tween?: BezierTween, handle?: string) {
    //     if (handle && (handle in this._subscriptions)) {
    //         return;
    //     }
    //     const self = this;
    //     const subscriptionHandle = handle ?? uuidv4();
    //     this.subscribe(this._clock.CreateTimedAction(callback, duration, () => {
    //             self.unsubscribe(subscriptionHandle);
    //             if (actionOverCallback) {
    //                 actionOverCallback();
    //             }
    //         }, tween),
    //         subscriptionHandle);
    // }

    //
    // /**
    //  * Getter for the current interaction mode.
    //  * @returns {AInteractionMode}
    //  */
    // get interactionMode() {
    //     return this._interactions.modes[this._currentInteractionModeName];
    // }


    // /**
    //  * Add an interaction to the current mode.
    //  * @param interaction
    //  */
    // addInteraction(interaction: AInteraction) {
    //     this.interactionMode.addInteraction(interaction);
    //     // interaction.owner = this;
    //     return interaction;
    // }

    // activateInteractions() {
    //     this.interactionMode.activate();
    // }
    //
    // setCurrentInteractionMode(name?: string) {
    //     this.interactionMode.deactivate();
    //     let activeMode = name ? name : BasicInteractionModes.default;
    //     this._interactions.setActiveMode(activeMode);
    //     this._currentInteractionModeName = activeMode;
    // }

    // defineInteractionMode(name: string, mode?: AInteractionMode) {
    //     this._interactions.defineMode(name, mode);
    // }
    //
    // clearInteractionMode(name: string) {
    //     this._interactions.undefineMode(name)
    // }
    //
    // isInteractionModeDefined(name: string):boolean {
    //     return this._interactions.modeIsDefined(name);
    // }
}





