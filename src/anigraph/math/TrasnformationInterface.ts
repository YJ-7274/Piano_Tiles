import {Mat3, Mat4, Matrix, Quaternion, Vec3} from "./linalg";
import * as THREE from "three";

export interface TransformationInterface {
    getMatrix(): Matrix;
    getMat4(): Mat4;
    assignTo(threejsMat:THREE.Matrix4):void;
    setPosition(position:Vec3):void;
    getPosition():Vec3;
    clone():TransformationInterface;
    _getQuaternionRotation():Quaternion;
    _setQuaternionRotation(q:Quaternion):void;
}


export interface Transformation3DInterface extends TransformationInterface{
    appliedToPoint(p:Vec3):Vec3;
}

export interface Transformation2DInterface extends TransformationInterface{
    getMatrix(): Mat3;
}
