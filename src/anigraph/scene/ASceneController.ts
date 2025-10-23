import * as THREE from "three";
import {
    AController,
    AModelInterface, AObjectNode, AObjectState,
    AView,
    HasModelViewMap,
    SceneControllerInterface
} from "../base";
import {ClassInterface} from "../basictypes";
import {AGLContext, AGLRenderWindow} from "../rendering";
import {ASceneModel, SceneEvents} from "./ASceneModel";
import {ASceneView} from "./ASceneView";
import {ACameraModel, ACameraView} from "./camera";
import {ANodeModel} from "./nodeModel";
import {ANodeView} from "./nodeView";
import {AModelViewClassMap, AMVClassSpec, AMVClassSpecDetails} from "../base/amvc/AModelViewClassSpec";
import {Mutex} from "async-mutex";
import {Color, Quaternion} from "../math";
import {ALoadedModel} from "./nodes/loaded/ALoadedModel";
import {ALoadedView} from "./nodes/loaded/ALoadedView";
import {RGBATestMeshModel, RGBATestMeshView} from "../starter/nodes";
import {ATriangleMeshModel, ATriangleMeshView, UnitQuadModel, UnitQuadView} from "./nodes";

export enum SceneControllerSubscriptions {
    ModelNodeAdded = "ModelNodeAdded",
    // ModelNewNodeCreated="ModelNewNodeCreated",
    ModelNodeRemoved = "ModelNodeRemoved",
    ModelNodeReleased = "ModelNodeReleased"
}

export interface RenderTargetInterface{
    target:THREE.WebGLRenderTarget|null
}

export abstract class ASceneController extends AController implements HasModelViewMap, SceneControllerInterface{
    @AObjectState protected readyToRender:boolean;
    @AObjectState protected _isInitialized!:boolean;
    private _clearColor!:Color;
    _renderWindow!: AGLRenderWindow;
    protected _model!: ASceneModel;
    protected _view!: ASceneView;
    protected _cameraView!: ACameraView;
    protected _initMutex:Mutex;
    protected _tabIndex:number=0;

    get isInitialized(){
        return this._isInitialized;
    }

    get clearColor(){return this._clearColor;}

    get tabIndex(){
        return this._tabIndex;
    }

    // setRenderTarget(renderTarget?:RenderTargetInterface){
    //     if(renderTarget) {
    //         this.renderer.setRenderTarget(renderTarget.target)
    //     }else{
    //         this.renderer.setRenderTarget(null);
    //     }
    // }

    get initMutex(){
        return this._initMutex;
    }
    // protected _modelSubscriptionsAdded

    get context(){
        return this._renderWindow.context;
    }

    classMap:AModelViewClassMap;


    abstract initModelViewSpecs():void;
    abstract onAnimationFrameCallback(context: AGLContext): void

    _beforeInitScene(...args:any[]){
        //  if(this.renderWindow) {
        //     this.onWindowResize(this.renderWindow);
        // }
    }

    abstract initInteractions():void;


    setClearColor(color:Color){
        this._clearColor = color;
        this.renderer.setClearColor(this.clearColor.asThreeJS());
        this.renderer.clear();
    }




    async initScene(){
        // You can set the clear color for the rendering context
        this.renderer.setClearColor(this.clearColor.asThreeJS());
        this.renderer.clear();
        this.initInteractions();
    }

    get isReadyToRender(): boolean {
        return this.readyToRender;
    }

    get renderWindow(): AGLRenderWindow {
        return this._renderWindow;
    }

    get renderer(): THREE.WebGLRenderer {
        return this.context.renderer;
    }

    get sceneController(){
        return this;
    }

    get eventTarget(): HTMLElement {
        return this.context.renderer.domElement;
    }

    constructor(model: ASceneModel) {
        super();
        this._clearColor = new Color(0.0, 0.0, 0.0);
        this._initMutex = new Mutex();
        this._isInitialized = false;
        this.readyToRender=false;
        this.classMap = new AModelViewClassMap();
        this.onModelNodeAdded = this.onModelNodeAdded.bind(this);
        this.onModelNodeRemoved = this.onModelNodeRemoved.bind(this);

        // this.addModelViewSpec(ACameraModel, ACameraView);
        this.addModelViewSpec(ACameraModel, ACameraView);
        this.initModelViewSpecs();
        if (model) {
            this.setModel(model)
        }
    }




    setRenderWindow(renderWindow:AGLRenderWindow){
        this._renderWindow = renderWindow;
        this.clearAllInteractionModes();
        // this.initInteractions();
    }

    async confirmInitialized(){
        const self = this;
        self.model.confirmInitialized().then(():Promise<void>=>{
            return self.initMutex.runExclusive(async () => {
                await self.initRendering();
                self._isInitialized = true;
                self._clock.play();
            });
        });

    }

    async initRendering(...args:[]) {
        if(this.view){
            console.warn("Re-initializing scene controller that already has view. Killing view... Will try to release resources, but this has not been extensively unit tested!");
            this.view.disposeViews();
        }
        // this._renderWindow = renderWindow;
        this._view = new ASceneView(this);
        this.renderer.autoClear = false;
        this.renderer.clear()
        await this.model.confirmInitialized();
        this._cameraView = ACameraView.Create(this.model.cameraModel);
        this.view.threejs.add(this._cameraView.threejs);
        this._beforeInitScene(this.context);
        await this.initScene();
        this.addModelSubscriptions();
        this.readyToRender = true;
    }

    createViewForNodeModel(nodeModel: ANodeModel, ...args:any[]){
        let spec = this.classMap.getSpecForModel(nodeModel);
        if(spec){
            let view = new (spec.viewClass)();
            view.setController(this);
            view.setModel(nodeModel);
            return view;
        } else{
            throw new Error(`Unsure how to create view for ${nodeModel} with class ${nodeModel.constructor.name}`)
        }
    }

    addModelViewSpec(modelClass:ClassInterface<ANodeModel>, viewClass:ClassInterface<ANodeView>, details?:AMVClassSpecDetails){
        this.classMap.addSpec(new AMVClassSpec(modelClass, viewClass, details))
    }

    setModel(model: ASceneModel) {
        if (this._model && this._model !== model) {
            this._unSetModel();
        }
        this._model = model;
        // this._view = new ASceneView(this);
    }

    protected addModelSubscriptions() {
        const self = this;
        this.subscribe(this.model.addEventListener(SceneEvents.NodeAdded, (node: ANodeModel, ...args:any[]) => {
            self.onModelNodeAdded(node, ...args);
        }), SceneControllerSubscriptions.ModelNodeAdded);
        // this.subscribe(this.model.addEventListener(SceneEvents.NewNodeAdded, (node: ANodeModel) => {
        //     self.onNewModelNodeAdded(node);
        // }), SceneControllerSubscriptions.ModelNewNodeCreated);
        this.subscribe(this.model.addEventListener(SceneEvents.NodeRemoved, (node: ANodeModel) => {
            self.onModelNodeRemoved(node);
        }), SceneControllerSubscriptions.ModelNodeRemoved);

        this.subscribe(this.model.addEventListener(SceneEvents.NodeReleased, (node: ANodeModel) => {
            self.onModelNodeReleased(node);
        }), SceneControllerSubscriptions.ModelNodeReleased);

        this.model.mapOverDescendants((descendant:AObjectNode)=>{
            self.onModelNodeAdded(descendant as ANodeModel);
        })

    }

    protected _unSetModel() {
        this.clearSubscriptions();
        this.view.release();
    }

    get model(): ASceneModel {
        return this._model as ASceneModel;
    }

    get view(): ASceneView {
        return this._view as ASceneView;
    }

    get cameraModel() {
        return this._cameraView.model;
    }

    // get clock() {
    //     return this._clock;
    // }

    get cameraView(){
        return this._cameraView;
    }

    getThreeJSCamera(cameraModel?:ACameraModel){
        if(cameraModel === undefined) {
            return this.cameraView.threeJSCamera;
        }else{
            let camview = this.getViewListForModel(cameraModel);
            return (camview[0] as ACameraView).threeJSCamera;
        }
    }

    getThreeJSScene(){
        return this.view.threeJSScene;
    }

    get modelMap() {
        return this.model.modelMap
    };

    get viewMap() {
        return this.view.viewMap;
    }

    hasModel(model: AModelInterface) {
        return this.model.hasModel(model);
    };

    hasView(view: AView) {
        return this.view.hasView(view);
        // return (this.model.hasModelID(view.modelID) && view.uid in this.viewMap[view.modelID]);
    }

    addView(view: ANodeView) {
        this.view.addView(view);
    }

    removeView(view: AView) {
        this.view.removeView(view);
    }

    disposeViews() {
        this.view.disposeViews();
    }

    getViewListForModel(model: AModelInterface) {
        return this.view.getViewListForModel(model);
    }

    onModelNodeAdded(nodeModel: ANodeModel, ...args:any[]) {
        let modelViewList = this.getViewListForModel(nodeModel);
        if(modelViewList.length<1){
            this._onNewModelNodeAdded(nodeModel, ...args);
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
            }else{
                console.warn("Adding node model with unknown parent type:")
                console.warn(nodeModel);
            }
        }
    }

    /**
     * Creates a new view for a newly added model that does not have a view yet.
     * @param nodeModel
     * @private
     */
    protected _onNewModelNodeAdded(nodeModel:ANodeModel, ...args:any[]){
        let newView = this.createViewForNodeModel(nodeModel, ...args);
        this.view.addView(newView);
    }

    onModelNodeRemoved(nodeModel: ANodeModel) {
        let viewList = this.getViewListForModel(nodeModel);
        if(viewList.length !== 1){
            throw new Error(`invalid number of views for node ${nodeModel}. ViewList ${viewList}`);
        }
        viewList[0].threejs.removeFromParent();
    }

    onModelNodeReleased(nodeModel:ANodeModel){
        let views = this.view.getViewListForModel(nodeModel);
        for (let v of views) {
            v.release();
        }
        delete this.viewMap[nodeModel.uid];
    }

    onWindowResize(renderWindow?: AGLRenderWindow): void {
        if(renderWindow && renderWindow.container !== undefined) {
            this.renderer.setSize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
            /**
             * This will call `cameraModel.onCanvasResize(width, height)` unless overridden
             */
            this.model.onContextResize(this.context);
            // this.cameraModel.onCanvasResize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
        }
    }

}
