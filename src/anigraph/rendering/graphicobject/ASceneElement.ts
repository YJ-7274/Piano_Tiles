import {AGraphicElement, AGraphicObject} from "./index";
import * as THREE from "three";


export class ASceneElement extends AGraphicElement{
    protected _threejs:THREE.Scene;
    protected _members:AGraphicObject[]=[];
    get members(){
        return this._members;
    }

    get threejs():THREE.Scene{
        return this._threejs;
    }

    private get _scene(){
        return this._threejs;
    }
    getThreeJSScene(){
        return this._scene;
    }

    constructor(threejsObject?:THREE.Scene) {
        super();
        if(threejsObject){
            this._threejs = threejsObject;
        }else{
            this._threejs = new THREE.Scene();
        }
        if(this.threejs){
            if(this.threejs.name ==""){
                this.setObject3DName(this.serializationLabel);
            }
        }
    }

    mapOverMembers(fn:(child:AGraphicObject)=>any[]|void){
        var rvals = [];
        for(let member of this._members){
            rvals.push(fn(member));
        }
        return rvals;
    }

    add(toAdd:AGraphicObject){
        this._members.push(toAdd);
        super.add(toAdd);
    }

    remove(toRemove:AGraphicObject){
        for(let c=0; c<this._members.length; c++){
            if(this._members[c].uid===toRemove.uid){
                this._members.splice(c,1);
                super.remove(toRemove);
                return;
            }
        }
        throw new Error(`Tried to remove render object ${toRemove} that is not a member of ${this}`);
    }

    dispose() {
        this.mapOverMembers((m:AGraphicObject)=>{m.dispose();});
        super.dispose();
    }
}
