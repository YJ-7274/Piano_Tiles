import { ASerializable } from "../../base";
import { NodeTransform } from "./NodeTransform";
import {Vec2, Vec3, Mat3, Mat4, Quaternion, V4, V3, V2} from "../linalg";
import { Precision } from "../Precision";
import { NodeTransform3D } from "./NodeTransform3D";
import {TransformationInterface} from "../TrasnformationInterface";

@ASerializable("NodeTransform2D")
export class NodeTransform2D implements NodeTransform<Vec2, Mat3> {
  /**
   * The convention here is that a NodeTransform object parameterized transformations that can be expressed as a matrix
   * product M = PRSA where:
   * P is a translation by the vector defined in position
   * R is a rotation by the angle defined in rotation
   * S is a scale by the amounds stored in _scale
   * A is a translation by the negative of the vector stored in anchor
   *
   * The translation by -anchor is a convention used in many animation tools. The reason for this is that if anchor
   * indicates where the local origin of our object is moved, then the transform that performs this movement is
   * actually a translation by -anchor.
   *
   * Notes:
   * - This is an over-complete representation for matrices of this form. Most notably, it is possible to
   * achieve the same transformation through changes to position or anchor. There is also a more subtle redundancy
   * between scale and rotation.
   * - Only a subset of valid 3x3 matrices can be represented this way. For this reason, initializing a NodeTransform
   * with a matrix will result in an approximating projection of sorts. And, more generally, the transformation from
   * matrix to NodeTransform is often not invertable. The transform from NodeTransform to matrix is usually invertable,
   * but the inverse may be ambiguous due to the over-completeness.
   */
  public position!: Vec2;
  public anchor!: Vec2;
  public _scale!: Vec2;
  public rotation!: number;

  /**
   * Static function for getting the identity transform
   * @returns {NodeTransform2D}
   * @constructor
   */
  static Identity(){
    return new this();
  }

  get scale(): Vec2 {
    return this._scale;
  }

  /**
   * if you set scale to a number (e.g., 'myTransform.scale = 2;`) it will automatically set all dimensions of the scale
   * vector to that number to achieve uniform scaling. You can also set it to a vector for non-uniform scaling.
   * @param value
   */
  set scale(value: Vec2 | number) {
    if (value instanceof Vec2) {
      this._scale = value;
    } else {
      this._scale = new Vec2(value, value);
    }
  }

  /**
   * Preferred method for initializing is to specify parameters
   * @param position
   * @param rotation
   * @param scale
   * @param anchor
   */
  constructor(position?: Vec2, rotation?: number, scale?: Vec2, anchor?: Vec2);
  /**
   * You can optionally give it a matrix, but remember this is risky.
   * @param matrix
   * @param position
   */
  constructor(matrix: Mat3, position?: Vec2);
  constructor(...args: any[]) {
    if (args[0] instanceof Mat3) {
      let pos = args.length > 1 ? args[1] : undefined;
      this.setWithMatrix(args[0], pos);
      if (!this.position) {
        this.position = new Vec2(0, 0);
      }
    } else {
      this.position = (args.length > 0) ? args[0]?? V2(0, 0): new Vec2(0, 0);
      this.rotation = (args.length > 1) ? args[1]?? 0 : 0;
      this.scale = (args.length > 2) ? args[2]?? V2(1, 1): new Vec2(1, 1);
      this.anchor = (args.length > 3) ? args[3]?? V2(0, 0): new Vec2(0, 0);
    }
  }

  static FromTransformationInterface(t?:TransformationInterface){
    if(t===undefined){
      return new NodeTransform2D();
    }
    if(t instanceof NodeTransform2D){
      return t.clone()
    }else{
      return NodeTransform2D.FromMatrix(t as Mat3);
    }
  }

  getPosition(): Vec3 {
    return Vec3.FromVec2(this.position);
  }
  _getQuaternionRotation(): Quaternion {
    throw new Error("Method not implemented.");
    }
  _setQuaternionRotation(q: Quaternion): void {
    throw new Error("Method not implemented.");
  }
  setPosition(position: Vec3): void {
    this.position = position.xy;
  }

  clone() {
    return new NodeTransform2D(
      this.position.clone(),
      this.rotation,
      this.scale.clone(),
      this.anchor.clone()
    );
  }

  /**
   * Returns the transformation matrix for this set of transform properties.
   *
   * @returns the transformation matrix
   */
  getMatrix() {
    const position = Mat3.Translation2D(this.position);
    const rotation = Mat3.Rotation(this.rotation);
    const scale = Mat3.Scale2D(this.scale);
    const anchor = Mat3.Translation2D(this.anchor.times(-1));
    return position.times(rotation).times(scale).times(anchor);
  }

  getMat4(): Mat4 {
    return this.getMatrix().Mat4From2DH();
  }

  static FromMatrix(m:Mat3, position?:Vec2, useOldRotation?:boolean){
    let newNT = new NodeTransform2D();
    newNT.setWithMatrix(m, position, useOldRotation);
    return newNT;
  }


  /**
   * Sets the transform properties based on the given affine transformation
   * matrix and optional position.
   *
   * This function should set the transform based on an input matrix and
   * (optionally) a starting position. Calling T.getMatrix() on the resulting
   * transform should produce the input matrix `m`. Position should
   * be the point where changes to rotation or scale will rotate and scale around.
   * Meanings of position, rotation, scale, and anchor match those used in Adobe
   * standards (e.g., After Effects). The corresponding matrix is calculated
   * as shown in getMatrix() above: (P)*(R)*(S)*(-A). Position is specified as
   * a constraint because the two translations in the above equation create a
   * redundancy.
   *
   * We recommend familiarizing yourself with the available methods in
   * `src/anigraph/amath/Mat3.ts`.
   *
   * Also familiarize yourself with the available functions in
   * `src/anigraph/amath/Precision.ts`. These are useful when dealing with
   * floating point inaccuracies and other small numbers.
   *
   * Note: do not let the scale factor be less than epsilon.
   *
   * @param m the affine transformation matrix
   * @param position the starting positon
   */
  setWithMatrix(m: Mat3, position?: Vec2, useOldRotation?: boolean) {
    // throw new Error("setWithMatrix not implemented yet! Wait for assignment 2!")

      console.warn("NodeTransform2D.setWithMatrix is illposed!")


    // TODO: Don't leave this in!
    const ex = new Vec3(1,0,0);
    const ey = new Vec3(0,1,0);

    if (position !== undefined) {
      this.position = position;
    }else{
      this.position = m.times(V3(0.0,0.0,1.0)).xy;
    }

    if(!useOldRotation) {
      const Mex = m.times(ex);
      this.rotation = Math.atan2(Mex.y, Mex.x);
    }

    const noRo = Mat3.Rotation(-this.rotation).times(m);
    const scaleX = noRo.times(ex);
    const scaleY = noRo.times(ey);
    this.scale = new Vec2(Precision.ClampAbsAboveEpsilon(scaleX.x), Precision.ClampAbsAboveEpsilon(scaleY.y));

    var ORSinv = Mat3.Translation2D(this.position).times(
        Mat3.Rotation(this.rotation).times(
            Mat3.Scale2D(this.scale)
        )
    ).getInverse();

    if(ORSinv===null){
      throw new Error(`tried to set transform with matrix that has zero determinant: ${m}`);
      return;
    }
    this.anchor = ORSinv.times(m).times(Vec3.From2DHPoint(new Vec2(0,0))).Point2D.times(-1);
  }

  NodeTransform3D() {
    let rval = new NodeTransform3D(
      new Vec3(this.position.x, this.position.y, 0),
      Quaternion.FromAxisAngle(new Vec3(0, 0, 1), this.rotation),
      new Vec3(this.scale.x, this.scale.y, 1),
      new Vec3(this.anchor.x, this.anchor.y, 0)
    );
    return rval;
  }

  NodeTransform2D() {
    return this;
  }

  assignTo(threejsMat: THREE.Matrix4) {
    this.getMat4().assignTo(threejsMat);
  }
}
