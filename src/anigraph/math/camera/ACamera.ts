import {AObject, AObjectState} from "../../base";
import {AniGraphDefines} from "../../defines";
import {NodeTransform3D} from "../nodetransforms";
import {Mat4, V2, V4, Vec3, Vec4} from "../linalg";
import * as THREE from "three";
import {Transformation3DInterface, TransformationInterface} from "../TrasnformationInterface";
import {Camera} from "three";
import {VertexArray3D} from "../../geometry";


// export const ZNEAR:number = AniGraphDefines.DefaultZNear;
// export const ZFAR:number = AniGraphDefines.DefaultZFar;

enum CamUpdateEvents{
    POSE_UPDATED='CAMERA_POSE_UPDATED',
    PROJECTION_UPDATED='CAMERA_PROJECTION_UPDATED',
}


enum CAMERA_PROJECTION_TYPES{
    PERSPECTIVE = 'PERSPECTIVE',
    ORTHOGRAPHIC = 'ORTHOGRAPHIC'
}


export abstract class ACameraClass<T extends Transformation3DInterface> extends AObject{
    static CameraUpdateEvents = CamUpdateEvents;
    static DEFAULT_NEAR = AniGraphDefines.DefaultZNear;
    static DEFAULT_FAR = AniGraphDefines.DefaultZFar;
    abstract get transform():T;
    // abstract setTransform(transform:T):void;
    static PROJECTION_TYPE = CAMERA_PROJECTION_TYPES;

    _projectionType!:CAMERA_PROJECTION_TYPES;

    get projectionType(){
        return this._projectionType;
    }

    fixedImagePlaneWidth!:number;

    @AObjectState _pose:T;
    @AObjectState protected _projection:Mat4;
    @AObjectState zoom!:number;
    @AObjectState lrbt:number[];
    @AObjectState zNear!:number;
    @AObjectState zFar!:number;



    // @AObjectState _pose:T;
    // protected _projection:Mat4;
    // zoom!:number;
    // lrbt:number[];
    // zNear!:number;
    // zFar!:number;

    /**
     * This is so that we can define an initializer in the parent abstract class
     * @private
     */
    abstract _DefaultPose():T;
    abstract setWithThreeJSCamera(camera:THREE.Camera):void;

    get position(){
        return this.pose.getPosition();
    }

    set position(value:Vec3){
        this.setPosition(value);
    }

    get nodeTransform():NodeTransform3D{
        if(this._pose instanceof NodeTransform3D){
            return this._pose as NodeTransform3D;
        }else{
            console.error(`trying to use camera.nodeTransform when pose is set to a Matrix transformation! ${this._pose}`);
            return NodeTransform3D.FromMatrix(this._pose as unknown as Mat4);
        }
    }

    getPoseAsNodeTransform(){
        if(this._pose instanceof NodeTransform3D){
            return this._pose.clone() as NodeTransform3D;
        }else{
            return NodeTransform3D.FromMatrix(this._pose.getMat4());
        }
    }

    get pose(){return this._pose;}
    set pose(p:T){
        this._pose = p;
    }
    get projection(){return this._projection;}
    set projection(p:Mat4){
        this._projection = p;
    }

    get frustumLeft(){return this.lrbt[0];}
    get frustumRight(){return this.lrbt[1];}
    get frustumBottom(){return this.lrbt[2];}
    get frustumTop(){return this.lrbt[3];}



    getPose(){return this.pose;}
    getProjection(){return this.projection;}
    getProjectionInverse(){return this.projection.getInverse();}
    get modelMatrix(){return this.pose.getMatrix();}
    get viewMatrix(){return this.pose.getMat4().getInverse();}
    get PV(){return this.projection.times(this.viewMatrix);}

    get right(){return this.pose._getQuaternionRotation().getLocalX();}
    get up(){return this.pose._getQuaternionRotation().getLocalY();}
    get backward(){return this.pose._getQuaternionRotation().getLocalZ();}
    get forward(){return this.backward.times(-1);}


    // abstract onCanvasResize(width:number, height:number):void;

    get aspect(){
        let wh = this._nearPlaneWH;
        return wh.x/wh.y;
    }

    /**
     * update projection when lrtb, zoom, or near/far have changed
     */
    // abstract updateProjection():void;
    updateProjection(): void {
        switch (this.projectionType){
            case ACameraClass.PROJECTION_TYPE.PERSPECTIVE:
                this._setProjection(Mat4.PerspectiveFromNearPlane(this.lrbt[0], this.lrbt[1], this.lrbt[2], this.lrbt[3], this.zNear, this.zFar));
                break;
            case ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC:
                let center = this._nearPlaneCenter;
                let wh = this._nearPlaneWH.times(0.5);
                this._setProjection(Mat4.ProjectionOrtho(center.x-wh.x, center.x+wh.x, center.y-wh.y, center.y+wh.y, this.zNear, this.zFar));
                break;
            default:
                throw new Error("Unknown projection type: "+this.projectionType);
                break;

        }
    }

    _setProjection(projection:Mat4, signalEvent:boolean=true){
        this.projection = projection;
        if(signalEvent) {
            this.signalEvent(ACameraClass.CameraUpdateEvents.PROJECTION_UPDATED);
        }
    }

    constructor(threeCamera?:THREE.Camera);
    constructor(pose?:TransformationInterface, projection?:Mat4);
    constructor(...args:any[])
    {
        super();
        this._pose = this._DefaultPose();
        this._projection = new Mat4()
        this.zoom = 1;
        this.lrbt=[];
        this.zNear=ACamera.DEFAULT_NEAR;
        this.zFar=ACamera.DEFAULT_FAR;

        if(args.length) {
            if (args[0] instanceof THREE.Camera) {
                this.setWithThreeJSCamera(args[0]);
            } else {
                this.setPose(args[0]);
                // this.pose = args[0];
            }
            if (args[1] && args[1] instanceof Mat4) {
                this.projection = args[1];
            }
        }else{
            this._projectionType = ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC;
        }
        const self = this;
        this.addStateKeyListener('zoom', ()=>{
            self.onZoomUpdate();
        })
    }

    CreateThreeJSCamera(): Camera {
        switch(this.projectionType){
            case ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC:
                return new THREE.OrthographicCamera(this.lrbt[0], this.lrbt[1], this.lrbt[3], this.lrbt[2], this.zNear, this.zFar);
                break;

            case ACamera.PROJECTION_TYPE.PERSPECTIVE:
                let fov = Math.atan(this.frustumTop/this.zNear)*180;
                let perspective = new THREE.PerspectiveCamera();
                this.getProjection().assignTo(perspective.projectionMatrix);
                this.getProjectionInverse().assignTo(perspective.projectionMatrixInverse);
                this.transform.getMat4().assignTo(perspective.matrix);
                this.transform.getMat4().assignTo(perspective.matrixWorld);
                perspective.matrixWorldInverse.copy( perspective.matrixWorld).invert();
                return perspective;
                break;

            default:
                throw new Error("Unrecognized camera projection type: "+this.projectionType);
        }
    }



    addPoseListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true,){
        return this.addStateKeyListener('_pose', callback, handle, synchronous);
    }
    addProjectionListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addStateKeyListener('_projection', callback, handle, synchronous);
    }

    setProjection(projection:Mat4){
        this._setProjection(projection);
        let pinv = this.projection.getInverse();
        let min = pinv.times(V4(-1.0,-1.0,-1.0, 1.0)).getHomogenized()
        let max = pinv.times(V4(1.0,1.0,-1.0, 1.0)).getHomogenized()
        let farpoint = pinv.times(V4(0.0,0.0,1.0,1.0)).getHomogenized();
        this.lrbt = [
            min.x,
            max.x,
            min.y,
            max.y,
        ]
        this.zNear = -min.z;
        this.zFar = -farpoint.z;
    }

    // setPose(pose:T){
    //     this.pose = pose;
    // }

    abstract setPose(pose:TransformationInterface):void;


    setPosition(position:Vec3){
        this.pose.setPosition(position);
    }



    onZoomUpdate() {
        this.updateProjection();
    }


    get _nearPlaneCenter(){
        return V2(this.frustumLeft,this.frustumBottom).plus(V2(this.frustumRight, this.frustumTop)).times(0.5);
    }
    get _nearPlaneWH(){
        return V2(this.frustumRight, this.frustumTop).minus(V2(this.frustumLeft,this.frustumBottom)).times(1.0/this.zoom);
    }

    getProjectedPoint(p:Vec3|Vec4){
        let pointIn = (p instanceof Vec4)?p:p.Point3DH;
        return this.getWorldToNDC().times(pointIn).Point3D;
    }

    getWorldSpaceProjectionOnNearPlane(p:Vec3|Vec4, offset:number=0.001){
        let pointIn = (p instanceof Vec4)?p:p.Point3DH;
        let proj = this.getWorldToNDC().times(pointIn).getHomogenized();
        proj.z=-1+offset;
        let npointh = this.getWorldToNDC().getInverse().times(proj);
        return npointh.Point3D;
    }


    getWorldToNDC(){
        return this.PV;
    }

    /**
     * gets a matrix with:
     * x column: the vector from the left of the near plane to the right of the near plane in world coords
     * y column: the vector from the bottom of the near plane to the top of the near plane in world coords
     * z column: the vector from the near to the far plane in world coords
     * w column: the location of the middle of the near plane
     */
    _getNearPlaneMatrix(camera:THREE.Camera){
        let camPVMI = this.getWorldToNDC().getInverse();
        let maxMat = Mat4.Identity();
        // set depth of x and y columns to near plane
        maxMat.r2=new Vec4(-1,-1,1,0);
        // set homogeneous coords of columns to 1
        maxMat.r3=new Vec4(1,1,1,1);

        maxMat = camPVMI.times(maxMat);
        let minMat = Mat4.Scale3D(-1);
        // set depth of x y and z to near plane
        minMat.r2=new Vec4(-1,-1,-1,-1);
        // set homogeneous coords of columns to 1
        minMat.r3 = new Vec4(1,1,1,1);
        minMat = camPVMI.times(minMat);

        let rmat = new Mat4();
        rmat.c0=maxMat.c0.getHomogenized().minus(minMat.c0.getHomogenized());
        rmat.c1=maxMat.c1.getHomogenized().minus(minMat.c1.getHomogenized());
        rmat.c2=maxMat.c2.getHomogenized().minus(minMat.c2.getHomogenized());
        rmat.c3 = minMat.c3.getHomogenized();
        return rmat;
    }

    /**
     * gets a matrix with:
     * x column: the vector from the left of the far plane to the right of the far plane in world coords
     * y column: the vector from the bottom of the far plane to the top of the far plane in world coords
     * z column: the vector from the near to the far plane in world coords
     * w column: the location of the middle of the far plane
     */
    _getFarPlaneMatrix(camera:THREE.Camera){
        let camPVMI = this.getWorldToNDC().getInverse();
        let maxMat = Mat4.Identity();
        // set depth of x and y columns to far plane
        maxMat.r2=new Vec4(1,1,1,0);
        // set homogeneous coords of columns to 1
        maxMat.r3=new Vec4(1,1,1,1);
        maxMat = camPVMI.times(maxMat);
        let minMat = Mat4.Scale3D(-1);
        // set depth of x y and z to far plane
        minMat.r2=new Vec4(1,1,-1,1);
        // set homogeneous coords of columns to 1
        minMat.r3 = new Vec4(1,1,1,1);
        minMat = camPVMI.times(minMat);
        let rmat = new Mat4();
        rmat.c0=maxMat.c0.getHomogenized().minus(minMat.c0.getHomogenized());
        rmat.c1=maxMat.c1.getHomogenized().minus(minMat.c1.getHomogenized());
        rmat.c2=maxMat.c2.getHomogenized().minus(minMat.c2.getHomogenized());
        rmat.c3 = minMat.c3.getHomogenized();
        return rmat;
    }

    onCanvasResize(width: number, height: number) {
        let oldAspect = this.aspect;
        let newAspect = width/height;
        // let newAspect = height/width;
        let ratio = newAspect/oldAspect;
        let newL = this.lrbt[0]*ratio;
        let newR = this.lrbt[1]*ratio;
        this.lrbt = [newL, newR, this.lrbt[2], this.lrbt[3]];
        this.updateProjection();
    }

    _get2DSceneBounds(){
        let epsilon = 0.1;
        let PVinv = this.PV.getInverse();
        // let zval = 1-epsilon;
        // let zval = -1+epsilon;
        let zval = 1-epsilon;
        let corners = [
            PVinv.times(V4(-1,-1,zval,1)).Point3D,
            PVinv.times(V4(1,-1,zval,1)).Point3D,
            PVinv.times(V4(1,1,zval,1)).Point3D,
            PVinv.times(V4(-1,1,zval, 1)).Point3D,
        ]
        // this.verts.position.updateElements(corners);

        let verts = VertexArray3D.CreateForRendering(false, true);
        verts.addVertex(corners[0], undefined, V2(0,0));
        verts.addVertex(corners[1], undefined, V2(1,0));
        verts.addVertex(corners[2], undefined, V2(1,1));
        verts.addVertex(corners[3], undefined, V2(0,1));
        return verts.getBounds().getBoundsXY();
    }

}


export class AMatrixCamera extends ACameraClass<Mat4> {
    _DefaultPose(): Mat4 {
        return new Mat4();
    }
    // setTransform(transform: Mat4): void {
    //     this.pose=transform;
    // }

    setPose(pose: TransformationInterface) {
        this.pose = pose.getMat4();
    }

    setWithThreeJSCamera(camera: Camera): void {
        this.setProjection(Mat4.FromThreeJS(camera.projectionMatrix));
        if(camera.matrixAutoUpdate){
            this.setPose(NodeTransform3D.FromThreeJSObject(camera).getMat4());
        }else{
            // this.setPose(Mat4.FromThreeJS(camera.matrix));
            this.setPose(Mat4.FromThreeJS(camera.matrix));
        }
        if(camera instanceof THREE.PerspectiveCamera){
            this._projectionType = ACameraClass.PROJECTION_TYPE.PERSPECTIVE;
        }else if(camera instanceof THREE.OrthographicCamera){
            this._projectionType = ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC;
        }
    }

    get transform(): Mat4 {
        return this.pose;
    }
}

export class ACamera extends ACameraClass<Transformation3DInterface>{
    _DefaultPose(): NodeTransform3D {
        return new NodeTransform3D();
    }
    setPose(pose: Transformation3DInterface): void {
        this.pose = pose;
        // if(pose instanceof NodeTransform3D){
        //     this.pose = pose.clone();
        // }else{
        //     this.pose = NodeTransform3D.FromPoseMatrix(pose.getMat4());
        // }
    }

    static CopyOf(camera:ACamera){
        let newCamera = new this();
        newCamera._projectionType = camera._projectionType;
        newCamera.setProjection(camera.projection);
        newCamera.setPose(camera.pose);
        return newCamera;
    }

    setWithThreeJSCamera(camera: Camera): void {
        this.setProjection(Mat4.FromThreeJS(camera.projectionMatrix));
        if(camera.matrixAutoUpdate){
            this.setPose(NodeTransform3D.FromThreeJSObject(camera));
        }else{
            // this.setPose(Mat4.FromThreeJS(camera.matrix));
            this.setPose(NodeTransform3D.FromPoseMatrix(Mat4.FromThreeJS(camera.matrix)));
        }
        if(camera instanceof THREE.PerspectiveCamera){
            this._projectionType = ACameraClass.PROJECTION_TYPE.PERSPECTIVE;
        }else if(camera instanceof THREE.OrthographicCamera){
            this._projectionType = ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC;
        }
    }

    get transform() {
        return this.pose;
    }

    /**
     * Creates a perspective camera based on vertical fov, aspect, near, and far
     * @param fovy
     * @param aspect
     * @param near
     * @param far
     * @returns {ACamera}
     * @constructor
     */
    static CreatePerspectiveFOV(fovy: number, aspect: number, near?: number, far?: number){
        let camera = new this();
        camera.setProjection(Mat4.PerspectiveFromFOV(fovy, aspect, near, far));
        camera._projectionType = ACameraClass.PROJECTION_TYPE.PERSPECTIVE;
        return camera;
    }

    static CreatePerspectiveNearPlane(left: number, right: number, bottom: number, top: number, near?: number, far?: number) {
        let camera = new this();
        camera.setProjection(Mat4.PerspectiveFromNearPlane(left, right, bottom, top, near, far));
        camera._projectionType = ACameraClass.PROJECTION_TYPE.PERSPECTIVE;
        return camera;
    }

    static CreateOrthographic(left:number, right:number, bottom:number, top:number, near?:number, far?:number){
        let camera = new this();
        camera.setProjection(Mat4.ProjectionOrtho(left, right, bottom, top, near??AniGraphDefines.DefaultZNear, far??AniGraphDefines.DefaultZFar));
        camera._projectionType = ACameraClass.PROJECTION_TYPE.ORTHOGRAPHIC;
        return camera;
    }



}
