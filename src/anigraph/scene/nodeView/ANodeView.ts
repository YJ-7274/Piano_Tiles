/**
 * Base class for views in the Anigraph MVC scheme.
 * The primary responsibility for each view subclass is to specify how a model translates into Three.js rendering calls. The view itself should hold Three.js objects and make them available to controllers for specifying interactions.
 * Views should always be initialize
 */
import * as THREE from "three";
import {ANodeModel} from "../nodeModel";
import {AModel, AObjectNode, AView} from "../../base";
import {AGraphicObject} from "../../rendering";
import {Mat3, Mat4, NodeTransform2D, TransformationInterface} from "../../math";
import {AObject} from "../../base";
import {AMaterial} from "../../rendering";
import {ASceneController} from "../ASceneController";
import {AObject3DModelWrapper} from "../../geometry";
import {ALoadedElement, ALoadedElementInterface} from "../../rendering/loaded/ALoadedElement";

export enum BASIC_VIEW_SUBSCRIPTIONS{
    MODEL_STATE_LISTENER='VIEW_MODEL_STATE_LISTENER',
    MODEL_RELEASE_LISTENER='VIEW_MODEL_RELEASE_LISTENER',
    MODEL_GEOMETRY_LISTENER='VIEW_MODEL_GEOMETRY_LISTENER',
    MODEL_PARENT_CHANGED="MODEL_PARENT_CHANGED",
    MODEL_VISIBLE="MODEL_VISIBLE",
    MODEL_RENDER_ORDER = "MODEL_RENDER_ORDER"
    // MODEL_TRANSFORM_LISTENER="MODEL_TRANSFORM_LISTENER"
}

export type NodeViewCallback = (view:ANodeView, ...args: any[]) => any;
enum ANODEVIEW_MATERIAL_EVENTS{
    UPDATE="AVIEW_MATERIAL_UPDATE",
    CHANGE="AVIEW_MATERIAL_CHANGE",
    COLOR="AVIEW_MATERIAL_COLOR"

}

/**
 * Base View Class
 */
export abstract class _ANodeView extends AView{
    abstract init():void;
    abstract update(...args:any[]):void;
    // abstract updateTransform():void;
    protected abstract _initializeThreeJSObject():void;

    protected _model!:ANodeModel;
    get model(){
        return this._model;
    }


    get controller():ASceneController{return this._controller as ASceneController;}

    setModelListeners(){
        const self=this;
        this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_RELEASE_LISTENER, false);
        this.subscribe(this.model.addEventListener(ANodeModel.AModelEvents.RELEASE, ()=>{self.dispose()}), BASIC_VIEW_SUBSCRIPTIONS.MODEL_RELEASE_LISTENER);
        this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_STATE_LISTENER, false);
        this.subscribe(this.model.addStateListener(()=>{self.update()}), BASIC_VIEW_SUBSCRIPTIONS.MODEL_STATE_LISTENER);
        this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_GEOMETRY_LISTENER, false);
        this.subscribe(this.model.addGeometryListener(()=>{self.update()}), BASIC_VIEW_SUBSCRIPTIONS.MODEL_GEOMETRY_LISTENER);

        this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_RENDER_ORDER, false);
        this.subscribe(this.model.addRenderOrderListener( ()=>{self.updateRenderOrder()},), BASIC_VIEW_SUBSCRIPTIONS.MODEL_RENDER_ORDER);

        // this.subscribe(this.model.addTransformListener(()=>{self.updateTransform();}))

        // this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_PARENT_CHANGED, false);
        // this.subscribe(this.model.addNewParentListener((newParent?:AModel, oldParent?:AModel)=>{
        //     if(self.threejs.parent){
        //         self.threejs.removeFromParent();
        //     }
        //     if(newParent !== undefined && newParent!==this.model) {
        //         let newParentView = self.controller.getViewListForModel(newParent)[0];
        //         newParentView.threejs.add(self.threejs);
        //     }
        // }), BASIC_VIEW_SUBSCRIPTIONS.MODEL_PARENT_CHANGED)

        // this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_TRANSFORM_LISTENER, false);
        // this.subscribe(this.model.addTransformListener((model:AObject)=>{
        //     self.updateTransform(self.model.transform);
        // }),
        //     BASIC_VIEW_SUBSCRIPTIONS.MODEL_TRANSFORM_LISTENER
        // )

        this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_VISIBLE, false);
        this.subscribe(this.model.addVisibilityListener(()=>{
                self.threejs.visible=this.model.visible;
            }),
            BASIC_VIEW_SUBSCRIPTIONS.MODEL_VISIBLE);
    }


    updateRenderOrder(){
        this.threejs.renderOrder = this.model.renderOrder;
    }

    setParentView(newParent?:AView){
        // console.log(this);
        if(this.threejs.parent){
            throw new Error("Tried to parent view that already had parent");
        }
        if(newParent !== undefined){
            newParent.threejs.add(this.threejs);
        }
    }

    /**
     * The three.js object for this view. Should be a subclass of THREE.Object3D
     * @type {THREE.Object3D}
     */
    _threejs!:THREE.Object3D;
    get threejs():THREE.Object3D{
        return this._threejs;
    }

    /**
     * This gets called by the ASceneController in createViewForNodeModel(nodeModel: ANodeModel)
     * @param model
     */
    setModel(model:ANodeModel){
        this._model = model;
        this._initializeThreeJSObject();
        this._threejs.matrixAutoUpdate=false;
        this.init();
        this.update();
        this.updateRenderOrder();
        this.setModelListeners()
    }

    get modelID():string{
        return this.model.uid;
    }

    abstract dispose():void;

    release() {
        this.dispose();
        super.release();
    }
}

export abstract class ANodeView extends _ANodeView{
    protected _loadedElements:{[uid:string]:ALoadedElementInterface}= {};
    protected _initializeThreeJSObject(){
        this._threejs = new THREE.Group() as THREE.Object3D;
    }

    static MaterialUpdates = ANODEVIEW_MATERIAL_EVENTS;

    get threejs():THREE.Object3D{
        return this._threejs as THREE.Object3D;
    }

    setTransform2D(transform:TransformationInterface){
        if(transform instanceof Mat3){
            let t = transform.Mat4From2DH();
            t.m23=this.model.zValue;
            t.assignTo(this.threejs.matrix);
        }else if (transform instanceof NodeTransform2D) {
            let t = transform.getMatrix().Mat4From2DH();
            t.m23=this.model.zValue;
            t.assignTo(this.threejs.matrix);
        }else{
            (transform.getMatrix() as Mat4).assignTo(this.threejs.matrix);
        }
    }


    initLoadedObjects(){
        const self = this;
        for(let mname in this.model.geometry.members){
            let m = this.model.geometry.members[mname];
            if (m instanceof AObject3DModelWrapper){
                let obj = new ALoadedElement(m);
                if(this.model.material) {
                    obj.setMaterial(this.model.material.threejs);
                }else{
                    obj.setMaterial(new THREE.MeshBasicMaterial())
                }
                this.addLoadedElement(obj);
            }
        }
    }

    addLoadedElement(element:ALoadedElement){
        this.registerAndAddGraphic(element);
        this._loadedElements[element.uid]=element;
    }

    //##################//--Graphic Objects--\\##################
    //<editor-fold desc="Graphic Objects">

    /*
    ToDo: should write docs for this
     */
    protected graphics:{[uid:string]:AGraphicObject}={};
    registerAndAddGraphic(graphic:AGraphicObject){
        this.registerGraphic(graphic);
        this.add(graphic);
    }

    add(graphic:AGraphicObject){
        this.threejs.add(graphic.threejs);
    }

    disposeGraphic(graphic:AGraphicObject){
        this._removeGraphic(graphic);
        graphic.dispose();
    }

    registerGraphic(graphic:AGraphicObject){
        this.graphics[graphic.uid]=graphic;
    }

    _removeGraphic(graphic:AGraphicObject){
        this.threejs.remove(graphic.threejs);
        delete this.graphics[graphic.uid];
    }

    moveGraphicToBack(graphic:AGraphicObject){
        this._removeGraphic(graphic);
        this.registerAndAddGraphic(graphic);
        // addGraphicToRoot(graphic);
    }

    getGraphicList(){
        return Object.values(this.graphics);
    }
    mapOverGraphics(fn:(graphic:AGraphicObject)=>any[]|void){
        return this.getGraphicList().map(fn);
    }

    disposeGraphics(){
        let graphicKeys = Object.keys(this.graphics);
        for(let e of graphicKeys){
            let graphic = this.graphics[e];
            this._removeGraphic(graphic);
            graphic.dispose();
        }
    }

    dispose(){
        this.disposeGraphics();
        this.threejs.removeFromParent();
    }

    //</editor-fold>
    //##################\\--Graphic Objects--//##################

    setTransform(transform:TransformationInterface){
        (transform.getMatrix() as Mat4).assignTo(this.threejs.matrix);
    }

    // updateTransform() {
    //     this.setTransform(this.model.transform)
    // }

    setModelListeners(){
        super.setModelListeners();
        this._initMaterialListener();
    }

    _initMaterialListener(){
        const self=this;
        this.addMaterialUpdateCallback((...args:any[])=>{
                self.onMaterialUpdate(...args);
            },
            AMaterial.Events.UPDATE)
        this.addMaterialChangeCallback(()=>{
                self.onMaterialChange();
            },
            AMaterial.Events.CHANGE)

        // this.addModelColorCallback((...args:any[])=>{
        //         self.onModelColorChange();
        //     },
        //     "Material Color Change")
    }

    onMaterialUpdate(...args:any[]){
        const self = this;
        this.mapOverGraphics((element:AGraphicObject)=>{
            element.onMaterialUpdate(self.model.material, ...args);
        })
    }

    onMaterialChange(){
        const self = this;
        this.mapOverGraphics((element:AGraphicObject)=>{
            element.onMaterialChange(self.model.material);
        })
    }

    // onModelColorChange(){
    //     const self = this;
    //     this.mapOverGraphics((element:AGraphicObject)=>{
    //         if('setColor' in element){
    //             element.setColor(self.model.color);
    //         }
    //     })
    // }

    addMaterialUpdateCallback(callback:(self?:AObject)=>void, handle?:string){
        const self = this;
        this.subscribe(
            self.model.addMaterialUpdateListener( ()=>{
                callback();
            }),
            handle
        );
    }

    addMaterialChangeCallback(callback:(self?:AObject)=>void, handle?:string){
        const self = this;
        this.subscribe(
            self.model.addMaterialChangeListener( ()=>{
                callback();
            }),
            handle
        );
    }



    // addModelColorCallback(callback:(self?:AObject)=>void, handle?:string){
    //     const self = this;
    //     this.subscribe(
    //         self.model.addColorListener( ()=>{
    //             callback();
    //         }),
    //         handle
    //     );
    // }
}


export abstract class ANodeView2D extends ANodeView{
    setTransform(transform:TransformationInterface){
        this.setTransform2D(transform);
    }
}


