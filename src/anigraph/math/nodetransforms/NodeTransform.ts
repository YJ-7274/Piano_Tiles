//##################//--node transform possible parent class--\\##################
// <editor-fold desc="node transform possibel parent class">
import {Mat4, Matrix, Quaternion, Vec3, VectorBase} from "../linalg";
import { TransformationInterface} from "../TrasnformationInterface";
import * as THREE from "three";

abstract class NodeTransform<VType extends VectorBase, MType extends Matrix>
  implements TransformationInterface
{
  position!: VType;
  anchor!: VType;
  scale!: VType | number;
  rotation!: any;

  abstract clone():NodeTransform<VType, MType>;
  abstract getMatrix(): MType;
  abstract getMat4(): Mat4;

  abstract assignTo(threejsMat: THREE.Matrix4):void;

  abstract setWithMatrix(m: MType, position?: VType, rotation?: any): void;
  abstract NodeTransform3D(mat: Mat4): any;
  abstract NodeTransform2D(): any;

  abstract getPosition(): Vec3;
  abstract _getQuaternionRotation(): Quaternion;
  abstract _setQuaternionRotation(q: Quaternion):void;
  abstract setPosition(position: Vec3):void;
}
export { NodeTransform };

//</editor-fold>
//##################\\--node transform possible parent class--//##################
