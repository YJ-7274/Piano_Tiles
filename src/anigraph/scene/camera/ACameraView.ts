import {ACameraModel} from "./index";
import {ANodeView} from "../nodeView";
import * as THREE from "three";
import {AObject, ASerializable} from "../../base";
import {ANodeModel} from "../nodeModel";
import {ACamera, Mat3, Mat4, TransformationInterface} from "../../math";

@ASerializable("ACameraView")
export class ACameraView extends ANodeView{
// export class ACameraView extends _ANodeView{

    static Create(model:ACameraModel){
        let cameraView = new ACameraView();
        cameraView.setModel(model);
        return cameraView;
    }

    get threeJSCamera():THREE.Camera{
        return this.threejs as THREE.Camera;
    }


    setModelListeners() {
        super.setModelListeners();
        const self = this;
        this.model.addCameraProjectionListener((a:AObject)=>{
            self.update();
        })
    }

    // get threejs():THREE.Camera{
    //     return this._threejs as THREE.Camera;
    // }

    get model():ACameraModel{
        return this._model as ACameraModel;
    }

    setModel(model: ACameraModel) {
        super.setModel(model);
        this.update();
    }

    // setModelListeners(){
    //     const self=this;
    //     this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_STATE_LISTENER, false);
    //     this.subscribe(this.model.addStateListener(()=>{self.update()}));
    //     this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_RELEASE_LISTENER, false);
    //     this.subscribe(this.model.addEventListener(ANodeModel.Events.RELEASE, ()=>{self.dispose()}));
    // }

    init():void{
        this.threejs.matrixAutoUpdate=false;
    }

    // updateTransform() {
    //     this.update();
    // }


    setTransform(transform:TransformationInterface){
        if(transform instanceof Mat3){
            transform.Mat4From2DH().assignTo(this.threeJSCamera.matrix);
        }else{
            (transform.getMatrix() as Mat4).assignTo(this.threeJSCamera.matrix);
        }
    }


    update():void{
        // this.model.camera.getProjection().assignTo(this.threejs.projectionMatrix);
        // this.model.camera.getProjectionInverse().assignTo(this.threejs.projectionMatrixInverse);
        // this.model.camera.getPose().getMatrix().assignTo(this.threejs.matrix);
        // this.model.camera.getPose().getMatrix().assignTo(this.threejs.matrixWorld);
        // this.threejs.matrixWorldInverse.copy( this.threejs.matrixWorld).invert();

        // TODO: Maybe check to make sure this is ok?
        this.model.camera.getProjection().assignTo(this.threeJSCamera.projectionMatrix);
        this.model.camera.getProjectionInverse().assignTo(this.threeJSCamera.projectionMatrixInverse);
        this.model.transform.getMat4().assignTo(this.threeJSCamera.matrix);
        this.model.transform.getMat4().assignTo(this.threeJSCamera.matrixWorld);
        this.threeJSCamera.matrixWorldInverse.copy( this.threeJSCamera.matrixWorld).invert();
    }

    updateWithCamera(camera:ACamera){
        camera.getProjection().assignTo(this.threeJSCamera.projectionMatrix);
        camera.getProjectionInverse().assignTo(this.threeJSCamera.projectionMatrixInverse);
        camera.transform.getMat4().assignTo(this.threeJSCamera.matrix);
        camera.transform.getMat4().assignTo(this.threeJSCamera.matrixWorld);
        this.threeJSCamera.matrixWorldInverse.copy( this.threeJSCamera.matrixWorld).invert();
    }

    dispose(): void {
    }

    protected _initializeThreeJSObject(): void {
        // super._initializeThreeJSObject();
        this._threejs = this.model.camera.CreateThreeJSCamera();
        // this._threeJSCamera = this.model.camera.CreateThreeJSCamera();
        // this.threejs.add(this.threeJSCamera);
    }

}
