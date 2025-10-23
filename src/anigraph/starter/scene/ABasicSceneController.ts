import {HasInteractionModeCallbacks} from "../../interaction";
import {GetAppState} from "../../appstate";
import {AInteractionMode} from "../../interaction";
import {ASceneController, RenderTargetInterface} from "../../scene/ASceneController";
import {ADebugInteractionMode, ASceneInteractionMode} from "../interactionmodes";
import {AGLContext} from "../../rendering";
import {ALoadedModel} from "../../scene/nodes/loaded/ALoadedModel";
import {ALoadedView} from "../../scene/nodes/loaded/ALoadedView";
import {RGBATestMeshModel, RGBATestMeshView} from "../nodes";
import {
    AGroupNodeModel2D, AGroupNodeModel3D,
    ANodeView,
    ATriangleMeshModel,
    ATriangleMeshView,
    UnitQuadModel,
    UnitQuadView
} from "../../scene";
import {APointLightModel, APointLightView} from "../../scene/lights";
import * as THREE from "three";
import {AVisiblePointLightModel} from "../../scene/lights/AVisiblePointLightModel";
import { AVisiblePointLightView} from "../../scene";
import {Mat3, Quaternion} from "../../math";
import {ARenderTarget} from "../../rendering/multipass/ARenderTarget";
import {AGroupNodeView2D, AGroupNodeView3D, AGroupNodeView} from "../../scene/nodeView/AGroupNodeView";
const INTERACTION_MODE_APP_STATE = "InteractionMode";

export abstract class ABasicSceneController extends ASceneController {
    //#############################//--Render Targets--\\#############################
    //<editor-fold desc="Render Targets">
    _renderTargets:ARenderTarget[]=[];
    get renderTargets(){
        return this._renderTargets;
    }

    _currentRenderTarget:ARenderTarget|null=null;
    get currentRenderTarget(){
        return this._currentRenderTarget;
    }
    set currentRenderTarget(renderTarget:ARenderTarget|null){
        this.setCurrentRenderTarget((renderTarget==undefined)?null:renderTarget);
    }

    addRenderTarget(width:number, height:number){
        this.renderTargets.push(ARenderTarget.CreateFloatRGBATarget(width, height));
    }

    setCurrentRenderTarget(renderTarget?:ARenderTarget|null){
        if(renderTarget !== undefined && renderTarget !== null) {
            this.renderer.setRenderTarget(renderTarget.target)
            this._currentRenderTarget=renderTarget;
        }else{
            this.renderer.setRenderTarget(null);
        }
    }



    //</editor-fold>


    //###############################################//--Defining Interaction Modes--\\###############################################
    //<editor-fold desc="Defining Interaction Modes">
    _silentSetCurrentInteractionMode(name?:string){
        super.setCurrentInteractionMode(name);
    }

    setCurrentInteractionMode(name?: string) {
        this._silentSetCurrentInteractionMode(name)
        this._updateInteractionModeOptions();
    }

    initModelViewSpecs() {
        // This line tells the controller that whenever a _modelclass_ is added to the model hierarchy, we should
        // create and add a corresponding _viewclass_ and connect it to the new model
        // this.addModelViewSpec(_modelclass_, _viewclass_);
        this._addDefaultModelViewSpecs();
    }

    _addDefaultModelViewSpecs(){
        this.addModelViewSpec(ALoadedModel, ALoadedView);
        this.addModelViewSpec(RGBATestMeshModel, RGBATestMeshView);
        this.addModelViewSpec(ATriangleMeshModel, ATriangleMeshView);
        this.addModelViewSpec(UnitQuadModel, UnitQuadView);
        this.addModelViewSpec(APointLightModel, APointLightView);
        this.addModelViewSpec(AVisiblePointLightModel, AVisiblePointLightView);
        this.addModelViewSpec(AGroupNodeModel2D, AGroupNodeView2D);
        this.addModelViewSpec(AGroupNodeModel3D, AGroupNodeView3D);
    }

    initSkyBoxCubeMap(path?:string, format?:string, transform?:Mat3, ...args:any[]):void;
    initSkyBoxCubeMap(uls?:string[], transform?:Quaternion, ...args:any[]):void;
    initSkyBoxCubeMap(...args:any[]){
        let urls=[];
        let DefaultPath = './images/cube/MilkyWay/dark-s_';
        let DefaultFormat = '.jpg';
        let transform:Quaternion|undefined;
        let urlDict = {
            left:"px",
            right:"nx",
            top:"py",
            bottom:"ny",
            back:"pz",
            front:"nz"
        }

        if(args.length>0){
            if(Array.isArray(args[0])){
                urls = args[0];
            }else{
                let path = args[0]??DefaultPath;
                let format = '.jpg';
                if(args.length>1){
                    format = args[1]??format;
                }
                if(args.length>2){
                    transform = args[2];
                }
                urls = [
                    path + 'px' + format,
                    path + 'nx' + format,
                    path + 'py' + format,
                    path + 'ny' + format,
                    path + 'pz' + format,
                    path + 'nz' + format
                ];

            }
        }else {
            let path = DefaultPath;
            let format = DefaultFormat;
            transform = Quaternion.RotationX(Math.PI*0.5);
            urls = [
                path + 'px' + format,
                path + 'nx' + format,
                path + 'py' + format,
                path + 'ny' + format,
                path + 'pz' + format,
                path + 'nz' + format
            ];
        }

        /**
         * If you want to change the skybox, you will need to provide the appropriate urls to the corresponding textures
         * from a cube map
         */
        if(transform!==undefined) {
            this.view.setBackgroundTransform(transform);
        }
        const reflectionCube = new THREE.CubeTextureLoader().load( urls );
        this.getThreeJSScene().background = reflectionCube;
    }

    addDebugInteractionMode(){
        let debugInteractionMode = new ADebugInteractionMode(this);
        this.defineInteractionMode(ADebugInteractionMode.NameInGUI, debugInteractionMode);
        this.setCurrentInteractionMode(ADebugInteractionMode.NameInGUI);
    }

    switchToDebugInteractionMode(){
        if(!this._interactions.modeIsDefined(ADebugInteractionMode.NameInGUI)){
            this.addDebugInteractionMode();
        }else{
            this.setCurrentInteractionMode(ADebugInteractionMode.NameInGUI);
        }

    }

    addInteractionModeAppState(){
        const self = this;
        this.subscribeToAppState(INTERACTION_MODE_APP_STATE, (v:string)=>{
            /**
             * Call _setCurrentInteractionMode here, which just calls the parent version of the function.
             * This is to avoid an infinite loop caused by calling _updateInteractionModeOptions
             */
            self._silentSetCurrentInteractionMode(v);
        }, INTERACTION_MODE_APP_STATE)
    }

    _beforeInitScene(...args:any[]){
        super._beforeInitScene(...args)
        this.addInteractionModeAppState();
    }

    initInteractions(){
        this.setCurrentInteractionMode();
        this.addDebugInteractionMode();
    }

    defineInteractionMode(name: string, mode?: AInteractionMode) {
        super.defineInteractionMode(name, mode);
        this._updateInteractionModeOptions();
    }

    deleteInteractionMode(name: string){
        this._interactions.undefineMode(name);
        this._updateInteractionModeOptions();
    }

    _updateInteractionModeOptions(){
        let appState = GetAppState();
        appState.setSelectionControl(
            INTERACTION_MODE_APP_STATE,
            this._currentInteractionModeName,
            this._interactions.getGUISelectableModesList()
        )
        appState.updateControlPanel();
    }

    createNewInteractionMode(
        name:string,
        interactionCallbacks?:HasInteractionModeCallbacks
    ){
        if(this._interactions.modes[name]){
            throw new Error(`Tried to create interaction mode "${name}", but mode with this name is already defined!`)
        }
        let newInteractionMode = new ASceneInteractionMode(name, this, interactionCallbacks);
        this.defineInteractionMode(name, newInteractionMode);
    }

    /**
     * The default timeUpdate just updates the current interaction mode. This uses the controller's clock, which is separate from the model's clock.
     */
    timeUpdate(){
        /**
         *Interactions use our controller's clock, which is separate from our model's clock because we don't want pausing the model's clock to break all of our interactions!
         */
        this.interactionMode.timeUpdate(this.time);
    }

    onAnimationFrameCallback(context:AGLContext) {
        this._basicAnimationFrameCallback(context);
    }

    _basicAnimationFrameCallback(context:AGLContext){
        /**
         * let's update the model...
         */
        this.model.timeUpdate();
        this.timeUpdate()



        // clear the rendering context
        context.renderer.clear();

        // you can also specify which buffers to clear: clear(color?: boolean, depth?: boolean, stencil?: boolean)
        // this.renderer.clear(false, true);

        // render the scene view
        context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());
    }

}
