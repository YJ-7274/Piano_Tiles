import {AObject, AObjectState} from "./AObject";
import {ASerializable} from "../aserial";
import {ref} from "valtio";

export enum AObjectNodeEvents{
    // Descendant Events
    NewParent = 'NewParent',
    NewRoot = 'NewRoot',

    //Ancestor Events
    NewChild = 'NewChild',
    DescendantAdded = 'DescendantAdded',
    ChildRemoved = 'ChildRemoved',
    DescendantRemoved = 'DescendantRemoved',
    DescendantReleased='DescendantReleased'
}

@ASerializable("AObjectNode")
export class AObjectNode extends AObject{
    @AObjectState public _children:AObjectNode[];
    @AObjectState public name!: string;
    get children(){
        return this._children;
    }

    protected _parent!:AObjectNode|null;
    protected _root!:AObjectNode;

    get root(){
        return this._root;
    }
    set root(node:AObjectNode){
        if(this._root.uid===node.uid){
            return;
        }else{
            this._root = node;
            this.signalEvent(AObjectNodeEvents.NewRoot);

            // set all the children HelperClasses' roots, which will cause them to set their children HelperClasses' root...
            this.mapOverChildren((child:AObjectNode)=>{
                child.root = node;
            })
        }
    }

    protected _setRootSilent(node:AObjectNode){
        if(this._root.uid===node.uid){
            return;
        }else{
            this._root = node;
            // set all the children HelperClasses' roots, which will cause them to set their children HelperClasses' root...
            this.mapOverChildren((child:AObjectNode)=>{
                child._setRootSilent(node);
            })
        }
    }


    constructor(name?: string){
        super();
        this.name = name ? name : this.serializationLabel;
        // @ts-ignore
        this._children = (this.children===undefined)?[]:this.children;
        this._root = this._root??(this._parent??this);
        // @ts-ignore
        this._parent = (this._parent===undefined)?null:this._parent;


    }

    addNewParentListener(callback:(newParent?:AObjectNode, oldParent?:AObjectNode)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(AObjectNodeEvents.NewParent, callback, handle);
    }

    addChildRemovedListener(callback:(child:AObjectNode)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(AObjectNodeEvents.ChildRemoved, callback, handle);
    }


    signalNewParent(newParent?:AObjectNode, oldParent?:AObjectNode){
        this.signalEvent(AObjectNodeEvents.NewParent, newParent, oldParent);
    }

    /**
     * Signals new parent on child
     * which signals new root on descendants
     * new child on this node
     * @param child
     * @param position
     * @param signalChildEvents
     * @param signalAncestorEvents
     */
    _addChild(child:AObjectNode, position?:number, signalChildEvents:boolean=true, signalAncestorEvents:boolean=true, ...args:any[]){
        // Check if child is already in children
        if(this.children.includes(child)){
            throw new Error(`Tried to add existing child ${child} to node ${this}`);
        }

        // If child already has a parent this is a problem: we should have dealt with that elsewhere
        if(child.parent){
            throw new Error(`Child ${child} already has parent ${child.parent} when trying to add as child of ${this}`);
        }else{
            child._parent=this;
            if(signalChildEvents) {
                child.signalNewParent(this)
                child.root = this.root;
            }else{
                child._setRootSilent(this.root);
            }
        }
        if(position!==undefined){
            this.children.splice(position, 0, ref(child));
        }else{
            this.children.push(ref(child));
        }
        this.signalEvent(AObjectNodeEvents.NewChild, child);
        if(signalAncestorEvents) {
            child.mapOverAncestors((ancestor:AObjectNode)=>{
                ancestor.signalEvent(AObjectNodeEvents.DescendantAdded, child, ...args);
            })
        }
    }

    addChild(child:AObjectNode, position?:number, ...args:any[]){
        return this._addChild(child, position, true, true, ...args);
    }

    public get parent():AObjectNode|null{
        return this._parent;
    };

    mapOverChildren(fn:(child:AObjectNode)=>any[]|void){
        var rvals = [];
        for(let child of this.children){
            rvals.push(fn(child));
        }
        return rvals;
    }

    mapOverAncestors(fn:(ancestor:AObjectNode)=>any[]|void){
        var rvals = [];
        let parent = this.parent;
        let lastParent = (this as AObjectNode);
        while(parent && (parent!==lastParent)){
            rvals.push(fn(parent));
            lastParent = parent;
            parent = parent.parent;
        }
        return rvals;
    }

    getAncestorList(){
        var rvals = [];
        let parent = this.parent;
        let lastParent = (this as AObjectNode);
        while(parent && (parent!==lastParent)){
            rvals.push(parent);
            lastParent = parent;
            parent = parent.parent;
        }
        return rvals;
    }

    getDescendantList(){
        const rval:AObjectNode[] = [];
        this.mapOverChildren((c:AObjectNode)=>{
            rval.push(c);
            for(let cc of c.getDescendantList()){
                rval.push(cc);
            };
        })
        return rval;
    }

    filterChildren(fn:(child:AObjectNode, index?:number, array?:AObjectNode[])=>boolean){
        return this.children.filter(fn);
    }

    filterDescendants(fn:(child:AObjectNode, index?:number, array?:AObjectNode[])=>boolean){
        return this.getDescendantList().filter(fn);
    }

    mapOverDescendants(fn:(descendant:AObjectNode)=>any[]|void){
        return this.getDescendantList().map(fn);
    }

    release(...args:any[]){
        this.releaseChildren(...args)
        if(this._parent!==null){
            this._parent._removeChild(this);
        }
        let self = this;
        this.mapOverAncestors((ancestor: AObjectNode) => {
            ancestor.signalEvent(AObjectNodeEvents.DescendantReleased, self);
        })
        super.release();
        //would do super.release(args) here...
    }


    /**
     * A potentially silent version of removeChild
     * Signals new parent on the child
     * child removed on this node
     * descendant removed on ancestors
     * and new root on descendants
     * @param child
     * @param signalDescendantEvents
     * @param signalAncestorEvents
     * @private
     */
    _removeChild(child:AObjectNode, signalDescendantEvents:boolean=true, signalAncestorEvents:boolean=true,){
        for(let c=0;c<this.children.length;c++){
            if(this.children[c].uid===child.uid){
                this.children.splice(c,1);
                child._parent = null;
                if(signalDescendantEvents){
                    child.signalEvent(AObjectNodeEvents.NewParent, child, null);
                    child.root = child;
                }else{
                    child._setRootSilent(child);
                }
                if(signalAncestorEvents) {
                    this.signalEvent(AObjectNodeEvents.DescendantRemoved, child);
                    this.mapOverAncestors((ancestor: AObjectNode) => {
                        ancestor.signalEvent(AObjectNodeEvents.DescendantRemoved, child);
                    })
                }
                this.signalEvent(AObjectNodeEvents.ChildRemoved, child);
                return;
            }
        }
        throw new Error(`Tried to remove node ${child} that is not a child of ${this}`);
    }

    removeChild(child:AObjectNode){
        return this._removeChild(child, true, true);
    }

    /**
     * Release all children
     * @param args
     * @returns {any[]}
     */
    releaseChildren(...args:any[]){
        return this.mapOverChildren((child:AObjectNode)=>{return child.release(...args);});
    }

    /**
     * Remove all children without necessarily releasing them
     * @returns {any[]}
     */
    removeChildren(){
        const self = this;
        return this.mapOverChildren((child:AObjectNode)=>{self.removeChild(child);});
    }


    static fromJSON(state_dict:{[name:string]:any}){
        const rval = (this.CreateWithState(state_dict) as AObjectNode);
        rval.mapOverChildren((c:AObjectNode)=>{
                c._parent = rval;
            }
        );
        return rval;
    }
    toJSON(){
        return this.state;
    }


    //##################//--Reparenting--\\##################
    //<editor-fold desc="Reparenting">

    getChildWithID(uid:string){
        for(let c=0;c<this.children.length;c++){
            if(this.children[c].uid===uid){
                return this.children[c];
            }
        }
    }

    _uidsToChildrenList(uidList:string[]){
        let aon_array:AObjectNode[] = [];
        for(let uid of uidList){
            let child = this.getChildWithID(uid);
            if(child) {
                aon_array.push(child);
            }else{
                throw new Error(`unrecognized child uid: ${uid}`);
            }
        }
        return aon_array;
    }

    _childrenListToUIDs(childrenList:AObjectNode[]){
        let rval:string[]= [];
        for(let c of childrenList){
            rval.push(c.uid);
        }
        return rval;
    }

    reorderChildren(uidList:string[]){
        for(let uid of uidList){
            let child = this.getChildWithID(uid);
            if(child){
                child.reparent(this, false);
            }else{
                throw new Error ("Tried to reorder children with uid that does not belong to parent.")
            }
        }
    }

    /**
     * Removes this node from its parent and adds it to a new parent
     * by default only signals descendants
     * @param newParent
     * @param signalDescendantEvents
     * @param signalAncestorEvents
     */
    reparent(newParent:AObjectNode, signalDescendantEvents:boolean=true, signalAncestorEvents:boolean=true, ...args:any[]){
        if(this.parent){
            this.parent._removeChild(this, signalDescendantEvents, signalAncestorEvents);
        }
        newParent._addChild(this, undefined, signalDescendantEvents, signalAncestorEvents, ...args);
    }
    //</editor-fold>
    //##################\\--Reparenting--//##################


}
