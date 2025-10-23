import {AObjectState, AObject, ACallbackSwitch, HasTags} from "../../base";
import {AModel} from "../../base";
import {AGeometrySet,
    VertexArray
} from "../../geometry";
import type {TransformationInterface} from "../../math";
import {AMaterial, AShaderMaterial} from "../../rendering";


const MATERIAL_UPDATE_SUBSCRIPTION_HANDLE = 'MATERIAL_UPDATE_SUBSCRIPTION_NodeModel';
const NODE_TRANSFORM_UPDATE_HANDLE = "NODE_TRANSFORM_UPDATE";
enum ANodeModelEvents{
    GEOMETRY_UPDATE = "GEOMETRY_UPDATE",
    TRANSFORM_UPDATE = "TRANSFORM_UPDATE",
    TEXTURE_UPDATE="TEXTURE_UPDATE",
    COLOR_UPDATE="COLOR_UPDATE",
    RENDER_ORDER_UPDATE="RENDER_ORDER_UPDATE"
}

export abstract class ANodeModel extends AModel implements HasTags{
    static NodeModelEvents = ANodeModelEvents;
    /**
     * Transform of the node model. This is generally its model matrix in the scene graph.
     */
    @AObjectState protected _transform!:TransformationInterface;

    abstract get zValue():number;

    @AObjectState _visible!:boolean;

    _autoTransformUpdate:boolean=false;

    /** Get set visible */
    set visible(value:boolean){this._visible = value;}
    get visible(){return this._visible;}
    abstract get transform():TransformationInterface;
    abstract setTransform(transform:TransformationInterface):void;

    protected _renderOrder:number=0;

    get autoTransformUpdate():boolean{
        return this._autoTransformUpdate;
    }

    set autoTransformUpdate(value:boolean){
        const self = this;
        if(!value){
            if(this._autoTransformUpdate){
                this.unsubscribe(NODE_TRANSFORM_UPDATE_HANDLE, false);
                this._autoTransformUpdate = value;
            }
            return;
        }else{
            if(!this._autoTransformUpdate){
                this.subscribe(this.addStateKeyListener("_transform", ()=>{
                    self.signalTransformUpdate();
                }), NODE_TRANSFORM_UPDATE_HANDLE,);
                this._autoTransformUpdate = value;
            }
        }
    }


    /** Get set renderOrder */
    set renderOrder(value){
        this._renderOrder = value;
        this.signalRenderOrderUpdate();
    }
    get renderOrder(){return this._renderOrder;}


    protected _geometry!:AGeometrySet;
    get geometry(){return this._geometry;}
    abstract get verts():VertexArray<any>;
    abstract setVerts(verts:VertexArray<any>):void;
    protected _material!:AMaterial;
    get material():AShaderMaterial{return this._material as AShaderMaterial;}

    //###############################################//--Tags--\\###############################################
    //<editor-fold desc="Tags">
    @AObjectState _nodeTags!:{[tagName:string]:any};
    protected getNodeTags(){return this._nodeTags;}
    addTag(tagName:string){this._nodeTags[tagName]=true;}
    setTagValue(tagName:string, value:any){this._nodeTags[tagName]=value;}
    hasTag(tagName:string){return (tagName in this._nodeTags);}
    getTagValue(tagName:string){return this._nodeTags[tagName];}
    removeTag(tagName:string){delete this._nodeTags[tagName];}
    //</editor-fold>
    //###############################################\\--Tags--//###############################################


    constructor(...args:any[]) {
        super();
        this._nodeTags = [];
        this._geometry = new AGeometrySet();
        this._visible = true;
        this.signalGeometryUpdate = this.signalGeometryUpdate.bind(this);
        this.signalTransformUpdate = this.signalTransformUpdate.bind(this);
        const self = this;
        this.autoTransformUpdate = true;
    }


    //##################//--Listeners--\\##################
    //<editor-fold desc="Listeners">
/*
        this.subscribe(this.addStateKeyListener("_transform", ()=>{
            self.signalTransformUpdate();
        }), "NODE_TRANSFORM_UPDATE");
    addTransformListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch{
        return this.addStateKeyListener("_transform", callback, handle, synchronous);

    }
    signalTransformUpdate(){
        this.signalEvent(ANodeModel.NodeModelEvents.TRANSFORM_UPDATE, this);
    }
 */

    /**
     * Implemented as event listener that triggers whenever state key changes. This is so that the transform can be delegated to some other object, like in the case of a ACameraModel delegating it to a camera
     * @param callback
     * @param handle
     * @param synchronous
     * @returns {AEventCallbackSwitch}
     */
    addTransformListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch{
        return this.addEventListener(ANodeModel.NodeModelEvents.TRANSFORM_UPDATE, callback, handle);
    }
    signalTransformUpdate(){
        this.signalEvent(ANodeModel.NodeModelEvents.TRANSFORM_UPDATE, this);
    }
    addGeometryListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(ANodeModel.NodeModelEvents.GEOMETRY_UPDATE, callback, handle);
    }

    addRenderOrderListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(ANodeModel.NodeModelEvents.RENDER_ORDER_UPDATE, callback, handle);
    }

    signalGeometryUpdate(){
        this.signalEvent(ANodeModel.NodeModelEvents.GEOMETRY_UPDATE, this);
    }

    signalRenderOrderUpdate(){
        this.signalEvent(ANodeModel.NodeModelEvents.RENDER_ORDER_UPDATE, this)
    }


    addVisibilityListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addStateKeyListener("_visible", callback, handle, synchronous);
    }

    // signalMaterialUpdate(){
    //     this.signalEvent(ANodeModel.NodeModelEvents.MATERIAL_UPDATE, this);
    // }
    //</editor-fold>
    //##################\\--Listeners--//##################

    //###############################################//--Material Updates--\\###############################################
    //<editor-fold desc="Material Updates">
    /**
     * These are designed so that you can have the same material used for multiple objects. For this reason, we listen
     * to the material directly for updates, which will trigger updates even if we change the material elsewhere in code.
     */
    addMaterialUpdateListener(callback:(...args:any[])=>void, handle?:string){
        return this.addEventListener(AMaterial.Events.UPDATE, callback, handle);
    }
    addMaterialChangeListener(callback:(...args:any[])=>void, handle?:string){
        return this.addEventListener(AMaterial.Events.CHANGE, callback, handle);
    }

    signalMaterialUpdate(){
        this.signalEvent(AMaterial.Events.CHANGE);
    }

    setMaterialUpdateSubscriptions(){
        const self = this;
        this.subscribe(this.material.addEventListener(AMaterial.Events.UPDATE, (...args:any[])=>{
            self.onMaterialUpdate(AMaterial.Events.UPDATE, ...args)
        }), MATERIAL_UPDATE_SUBSCRIPTION_HANDLE);
    }
    onMaterialUpdate(...args:any[]){
        this.signalEvent(AMaterial.Events.UPDATE, ...args);
    }

    setMaterial(material:AMaterial|string){
        if(this.material === material){
            return;
        }else{
            let amaterial:AMaterial;
            if(material instanceof AMaterial){
                amaterial=material;
            }else{
                throw new Error("Material from string not implemented yet. Should look up in MaterialManager.")
            }

            if(this.material){
                this._disposeMaterial()
            }
            this._material = amaterial;
            this.setMaterialUpdateSubscriptions();
        }
        this.signalMaterialUpdate();
        // this.signalEvent(AMaterial.Events.CHANGE)
    }

    _disposeMaterial(){
        this.unsubscribe(MATERIAL_UPDATE_SUBSCRIPTION_HANDLE);
        this.material.release();
    }
    //</editor-fold>
    //###############################################\\--Material Updates--//###############################################

    timeUpdate(t:number, ...args:any[]){

    }



}

