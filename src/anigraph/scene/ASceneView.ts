import * as THREE from "three";
import {AModelInterface, AView, HasModelViewMap, MVMViewMap} from "../base";
import {ASceneController} from "./ASceneController";
import {ANodeView} from "./nodeView";
import {ATexture} from "../rendering";
import {Quaternion} from "../math";


export class ASceneView extends AView implements HasModelViewMap {
    protected _viewMap: MVMViewMap = {};
    protected _controller!:ASceneController;
    protected _threeJSScene!:THREE.Scene;
    get controller(){return this._controller;}
    get model(){return this.controller.model;}
    get modelID(){return this.model.uid;}
    get viewMap(){return this._viewMap;}
    _threejs!:THREE.Object3D;

    get threeJSScene(){
        return this._threeJSScene;
    }

    get threejs():THREE.Group{
        return this._threejs as THREE.Group;
    }

    constructor(controller:ASceneController) {
        super();
        this._controller = controller;
        this._threeJSScene = new THREE.Scene();
        this._threejs = new THREE.Group();
        this._threejs.matrixAutoUpdate=false;
        this._threeJSScene.add(this.threejs);
    }

    hasModel(model:AModelInterface){
        return (model.uid in this.viewMap);
        // return this.controller.hasModel(model);
    };
    hasView(view:AView){
        return (view.uid in this.viewMap[view.modelID]);
    }
    addView(view:ANodeView){
        if(this.viewMap[view.modelID]===undefined){
            this.viewMap[view.modelID]={};
        }
        this.viewMap[view.modelID][view.uid]=view;
        // if(view.model.parent === this.model){
        //     this.threejs.add(view._threejs);
        // }
        //
    }
    removeView(view:AView){
        this.threejs.remove(view._threejs);
        delete this.viewMap[view.modelID][view.uid];
    }

    releaseView(view:AView){
        this.threejs.remove(view._threejs);
        this.viewMap[view.modelID][view.uid].disposeGraphics();
        delete this.viewMap[view.modelID][view.uid];

    }


    setBackgroundTexture(texture:ATexture){
        this._threeJSScene.background = texture.threejs
    }

    setBackgroundTransform(transform:Quaternion){
        this._threeJSScene.rotation.setFromQuaternion(transform);
        this.threejs.rotation.setFromQuaternion(transform.getInverse());
        this._threeJSScene.matrixWorldNeedsUpdate=true;
        this.threejs.matrixWorldNeedsUpdate=true;
    }

    getViewListForModel(model:AModelInterface):ANodeView[]{
        if(this.hasModel(model)) {
            return Object.values(this.viewMap[model.uid]);
        }
        else{
            return [];
        }
    }

    _getViewListForModelID(modelID:string):ANodeView[]{
        return Object.values(this.viewMap[modelID]);
    }


    disposeViews(){
        for (let modelID in this.viewMap){
            let viewList = this._getViewListForModelID(modelID);
            for(let v of viewList) {
                this.releaseView(v);
            }
        }
        for(let modelID in this.viewMap){
            delete this.viewMap[modelID];
        }
    }

    /**
     * This should release all of the graphics resources!
     */
    release(){
        this.disposeViews();
        super.release();
    }

}

