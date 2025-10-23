import {ACamera, ACameraClass, Mat4, TransformationInterface} from "../math";
import {HasThreeJSObject} from "./graphicobject";
import * as THREE from "three";
import {AniGraphDefines} from "../defines";

export class ACameraElement extends ACamera implements HasThreeJSObject{
    protected _threejs!:THREE.Camera;
    get threejs(){
        return this._threejs;
    }

    getThreeJSCamera(){
        return this.threejs;
    }

    constructor(threeCamera?:THREE.Camera);
    constructor(pose?:TransformationInterface, projection?:Mat4);
    constructor(...args:any[]){
        if(args.length>0){
            if(args[0] instanceof THREE.Camera){
                super(args[0]);
                this._setThreeJS(args[0]);
            }else{
                super((args[0] as TransformationInterface).getMat4(), args[1]);
                this._setThreeJS(this.CreateThreeJSCamera());
            }
        }else{
            super();
            this._setThreeJS(this.CreateThreeJSCamera());
        }
        const self = this;
        this.addPoseListener((pose)=>{
            self.pose.assignTo(self.threejs.matrix);
            self.projection.assignTo(self.threejs.projectionMatrix);
            self.projection.getInverse().assignTo(self.threejs.projectionMatrixInverse);
        })

    }

    _setThreeJS(camera:THREE.Camera){
        this._threejs = camera;
        this._threejs.matrixAutoUpdate=false;
    }

    static CreatePerspectiveNearPlane(left: number, right: number, bottom: number, top: number, near?: number, far?: number) {
        let camera = new this();
        camera.setProjection(Mat4.PerspectiveFromNearPlane(left, right, bottom, top, near, far));
        camera._projectionType = ACameraClass.PROJECTION_TYPE.PERSPECTIVE;
        camera._setThreeJS(camera.CreateThreeJSCamera());
        return camera;
    }

    static CreateOrthographic(left:number, right:number, bottom:number, top:number, near?:number, far?:number) {
        let camera = new this();
        camera.setProjection(Mat4.ProjectionOrtho(left, right, bottom, top, near??AniGraphDefines.DefaultOrthoZNear, far??AniGraphDefines.DefaultOrthoZFar));
        camera._projectionType = ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC;
        camera._setThreeJS(camera.CreateThreeJSCamera());
        return camera;
    }



}



