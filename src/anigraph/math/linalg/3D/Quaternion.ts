import * as THREE from "three";
import { Matrix4, Vector3 } from "three";
import { V4, Vec4 } from "./Vec4";
import { V3, Vec3 } from "../2D/Vec3";
import { Mat4 } from "./Mat4";
import { Mat3 } from "../2D";
import { Precision } from "../../Precision";

export class Quaternion extends THREE.Quaternion {
  protected _x!: number;
  protected _y!: number;
  protected _z!: number;
  protected _w!: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    // super(x,y,z,w);
    super();
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
  }

  static FromWXYZ(wxyz: number[]) {
    return new Quaternion(wxyz[1], wxyz[2], wxyz[3], wxyz[0]);
  }

  static FromQuaternion(q: THREE.Quaternion) {
    return new Quaternion(q.x, q.y, q.z, q.w);
  }

  static RotationX(radians: number) {
    return Quaternion.FromAxisAngle(new Vec3(1, 0, 0), radians);
  }
  static RotationY(radians: number) {
    return Quaternion.FromAxisAngle(new Vec3(0, 1, 0), radians);
  }
  static RotationZ(radians: number) {
    return Quaternion.FromAxisAngle(new Vec3(0, 0, 1), radians);
  }


  getLocalX():Vec3{
    return this.appliedTo(V3(1,0,0));
  }
  getLocalY():Vec3{
    return this.appliedTo(V3(0,1,0));
  };
  getLocalZ():Vec3{
    return this.appliedTo(V3(0,0,1));
  };

  normalize(): Quaternion {
    super.normalize();
    return this;
  }

  get Vec4() {
    return new Vec4(this._x, this._y, this._z, this._w);
  }

  appliedTo(v: Vec3) {
    return v.getRotatedByQuaternion(this);
  }

  times(q: Quaternion | Mat3 | Mat4) {
    let r = new Quaternion();
    if (q instanceof Quaternion) {
      r.multiplyQuaternions(this, q);
      return r.normalize();
    } else {
      let qm = Quaternion.FromMatrix(q);
      r.multiplyQuaternions(this, qm);
      return r.normalize();
    }
  }

  asPrettyString(){
    return `Q(w=${this._w}, x=${this._x}, y=${this._y}, z=${this._z})`;
  }

  /**
   * Return true if each element is within precision of its counterpart
   * @param other
   */
  isEqualTo(other: Quaternion, tolerance?: number) {
    let epsilon: number =
      tolerance !== undefined ? tolerance : Precision.epsilon;
    if (Math.abs(this.x - other.x) > epsilon) {
      return false;
    }
    return true;
  }

  getInverse() {
    let r = new Quaternion(this.x, this.y, this.z, this.w);
    r.invert();
    return r;
  }

  randomize() {
    // Derived from http://planning.cs.uiuc.edu/node198.html
    // Note, this source uses w, x, y, z ordering,
    // so we swap the order below.

    const u1 = Math.random();
    const sqrt1u1 = Math.sqrt(1 - u1);
    const sqrtu1 = Math.sqrt(u1);

    const u2 = 2 * Math.PI * Math.random();

    const u3 = 2 * Math.PI * Math.random();

    return this.set(
      sqrt1u1 * Math.cos(u2),
      sqrtu1 * Math.sin(u3),
      sqrtu1 * Math.cos(u3),
      sqrt1u1 * Math.sin(u2)
    );
  }

  static FromMatrix(m: Mat3 | Mat4 | Matrix4) {
    let r = new Quaternion();
    let mr = m;
    if (mr instanceof Matrix4) {
      mr = Mat4.FromThreeJS(mr);
    }
    if (mr instanceof Mat4) {
      r._setWithRotationMatrix(mr.getLinearPart());
    } else if (mr instanceof Mat3) {
      r._setWithRotationMatrix(mr);
    } else {
      console.error(`Issue with ${mr}`);
    }
    return r;
  }

  _setWithRotationMatrix(M_in: Mat3) {
    let m = M_in.clone();
    m.c0 = m.c0.getNormalized();
    m.c1 = m.c1.getNormalized();
    m.c2 = m.c2.getNormalized();
    let q: Quaternion;
    if (m.m22 < 0) {
      if (m.m00 > m.m11) {
        let t = 1 + m.m00 - m.m11 - m.m22;
        q = new Quaternion(t, m.m01 + m.m10, m.m20 + m.m02, m.m12 - m.m21);
      } else {
        let t = 1 - m.m00 + m.m11 - m.m22;
        q = new Quaternion(m.m01 + m.m10, t, m.m12 + m.m21, m.m20 - m.m02);
      }
    } else {
      if (m.m00 < -m.m11) {
        let t = 1 - m.m00 - m.m11 + m.m22;
        q = new Quaternion(m.m20 + m.m02, m.m12 + m.m21, t, m.m01 - m.m10);
      } else {
        let t = 1 + m.m00 + m.m11 + m.m22;
        q = new Quaternion(m.m12 - m.m21, m.m20 - m.m02, m.m01 - m.m10, t);
      }
    }
    q.normalize();
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
  }

  static FromCameraOrientationVectors(forward: Vec3, up: Vec3) {
    let z = forward.getNormalized().times(-1);
    // let z = forward.getNormalized();
    let y = up;
    let x = y.cross(z).getNormalized();
    let upn = z.cross(x).getNormalized();
    let q = Quaternion.FromMatrix(
        Mat3.FromColumns(x, upn, z)
    );
    return q;
  }

  static FromZAndUp(z: Vec3, up: Vec3) {
    return Quaternion.FromCameraOrientationVectors(z.times(-1), up);
  }

  // static FromVectors(forward:Vec3, up:Vec3){
  //     let oaxis = forward.times(-1);
  //     // let oaxis = forward;
  //     if(Precision.PEQ(forward.dot(up), 1)){
  //         return Quaternion.FromRotationBetweenTwoVectors(oaxis, V3(0,0,-1));
  //     }
  //     return Quaternion.FromMatrix(
  //         Mat3.FromColumns(
  //             oaxis.cross(up).getNormalized(),
  //             up,
  //             oaxis
  //         )
  //     )
  // }

  Mat3() {
    var w = this._w;
    var x = this._x;
    var y = this._y;
    var z = this._z;

    var n = w * w + x * x + y * y + z * z;
    var s = n === 0 ? 0 : 2 / n;
    var wx = s * w * x,
      wy = s * w * y,
      wz = s * w * z;
    var xx = s * x * x,
      xy = s * x * y,
      xz = s * x * z;
    var yy = s * y * y,
      yz = s * y * z,
      zz = s * z * z;

    // if (d2) {
    //     return [
    //         [1 - (yy + zz), xy - wz, xz + wy, 0],
    //         [xy + wz, 1 - (xx + zz), yz - wx, 0],
    //         [xz - wy, yz + wx, 1 - (xx + yy), 0],
    //         [0, 0, 0, 1]];
    // }
    return new Mat3(
      1 - (yy + zz),
      xy + wz,
      xz - wy,
      xy - wz,
      1 - (xx + zz),
      yz + wx,
      xz + wy,
      yz - wx,
      1 - (xx + yy)
    );
  }

  getMatrix() {
    return this.Mat4();
  }

  Mat4() {
    var w = this._w;
    var x = this._x;
    var y = this._y;
    var z = this._z;

    var n = w * w + x * x + y * y + z * z;
    var s = n === 0 ? 0 : 2 / n;
    var wx = s * w * x,
      wy = s * w * y,
      wz = s * w * z;
    var xx = s * x * x,
      xy = s * x * y,
      xz = s * x * z;
    var yy = s * y * y,
      yz = s * y * z,
      zz = s * z * z;

    // if (d2) {
    //     return [
    //         [1 - (yy + zz), xy - wz, xz + wy, 0],
    //         [xy + wz, 1 - (xx + zz), yz - wx, 0],
    //         [xz - wy, yz + wx, 1 - (xx + yy), 0],
    //         [0, 0, 0, 1]];
    // }

    return new Mat4(
        1 - (yy + zz), xy + wz, xz - wy, 0,
        xy - wz, 1 - (xx + zz), yz + wx, 0,
        xz + wy, yz - wx, 1 - (xx + yy), 0,
        0, 0, 0, 1
    )

    // return new Mat4(
    //   1 - (yy + zz), xy - wz, xz + wy, 0,
    //   xy + wz, 1 - (xx + zz), yz - wx, 0,
    //   xz - wy, yz + wx, 1 - (xx + yy), 0,
    //   0, 0, 0, 1
    // );

    // const x = this._x, y = this._y, z = this._z, w = this._w;
    // const x2 = x + x,	y2 = y + y, z2 = z + z;
    // const xx = x * x2, xy = x * y2, xz = x * z2;
    // const yy = y * y2, yz = y * z2, zz = z * z2;
    // const wx = w * x2, wy = w * y2, wz = w * z2;
    //
    //
    // m.elements[ 0 ] = ( 1 - ( yy + zz ) );
    // m.elements[ 1 ] = ( xy + wz );
    // m.elements[ 2 ] = ( xz - wy );
    // m.elements[ 3 ] = 0;
    //
    // m.elements[ 4 ] = ( xy - wz );
    // m.elements[ 5 ] = ( 1 - ( xx + zz ) );
    // m.elements[ 6 ] = ( yz + wx );
    // m.elements[ 7 ] = 0;
    //
    // m.elements[ 8 ] = ( xz + wy );
    // m.elements[ 9 ] = ( yz - wx );
    // m.elements[ 10 ] = ( 1 - ( xx + yy ) );
    // m.elements[ 11 ] = 0;
    //
    // m.elements[ 12 ] = 0;
    // m.elements[ 13 ] = 0;
    // m.elements[ 14 ] = 0;
    // m.elements[ 15 ] = 1;
    //
    // return m.getTranspose();
  }

  static Identity() {
    let q = new Quaternion();
    q.identity();
    return q;
  }

  static Slerp(qa: Quaternion, qb: Quaternion, t: number): Quaternion {
    let r = new Quaternion();
    r.slerpQuaternions(qa, qb, t);
    return r;
  }

  static FromAxisAngle(axis: Vec3 | Vector3, angle: number): Quaternion {
    const halfAngle = angle * 0.5;
    let s = Math.sin(-halfAngle);
    let w = Math.cos(-halfAngle);
    let sinorm =
      s / Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    let x = axis.x * sinorm;
    let y = axis.y * sinorm;
    let z = axis.z * sinorm;
    return new Quaternion(x, y, z, w);
  }

  getAxisAndAngle() {
    return {
      axis: new Vec3(this.x, this.y, this.z).getNormalized(),
      angle: 2 * Math.acos(this.w),
    };
  }

  // public get axis(){
  //
  // }

  static FromRotationBetweenTwoVectors(
    vFrom: Vec3 | Vector3,
    vTo: Vec3 | Vector3
  ): Quaternion {
    let start = vFrom;
    if (start instanceof Vec3) {
      start = start.asThreeJS();
    }
    let end = vTo;
    if (end instanceof Vec3) {
      end = end.asThreeJS();
    }
    start.normalize();
    end.normalize();
    let r = new Quaternion();
    r.setFromUnitVectors(end, start);
    return r;
  }

  static Random() {
    let r = new Quaternion();
    r.randomize();
    return r.normalize();
  }
}
