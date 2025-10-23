import {V2, Vec2, V3, Vec3, V4, Vec4, Mat4, V4A} from "../math/linalg";
import {
  VertexAttributeArray,
  VertexAttributeArray2D,
  VertexAttributeArray3D,
  VertexAttributeArray4D,
  VertexAttributeArrayFromThreeJS, VertexAttributeColor3DArray, VertexAttributeColorArray,
} from "./VertexAttributeArray";
import { ASerializable} from "../base/aserial/ASerializable";
import { VertexArray } from "./VertexArray";
import { VertexIndexArray } from "./VertexIndexArray";
import { BoundingBox3D } from "./BoundingBox3D";
import { Color} from "../index";

// import { ATexture } from "../arender/ATexture";


export interface Vertex3DAttributes{
  position:Vec3;
  normal?:Vec3;
  color?:Color;
  uv?:Vec2;
}

@ASerializable("VertexArray3D")
export class VertexArray3D extends VertexArray<Vec3> {
  constructor() {
    super();
    this.position = new VertexAttributeArray3D();
  }

  getBounds(): BoundingBox3D {
    let b = new BoundingBox3D();
    b.boundVertexPositionArrray(this.position);
    return b;
  }

  /** Get set position */
  set position(value: VertexAttributeArray3D) {
    this.attributes["position"] = value;
  }
  get position() {
    return this.attributes["position"] as VertexAttributeArray3D;
  }

  setAttributeArray(name: string, attributeArray: VertexAttributeArray<any>) {
    this.attributes[name] = attributeArray;
  }

  static FromThreeJS(buffergeo: THREE.BufferGeometry) {
    let varray = new VertexArray3D();
    varray.indices = VertexIndexArray.FromThreeJS(buffergeo.index);
    for (let atrname in buffergeo.attributes) {
      varray.attributes[atrname] = VertexAttributeArrayFromThreeJS(
        buffergeo.attributes[atrname]
      );
    }
    return varray;
  }

  // static FromVertexArray2D(v2:VertexArray2D, transform:Mat4){
  //     let v3=new VertexArray3D();
  // }

  addTriangleCCW(A: Vec3, B: Vec3, C: Vec3, uv?: Vec2[], color?: Vec4[]|Color[]) {
    let i = this.nVerts;
    let AB = B.minus(A);
    let AC = C.minus(A);
    let N = AB.getNormalized().cross(AC.getNormalized());

    let colorv=color;
    if(colorv !== undefined) {
      for(let c=0; c<colorv?.length;c++) {
        if (colorv[c] instanceof Color) {
          colorv[c] = (colorv[c] as Color).Vec4;
        }
      }
    }

    this.addVertex(A, N, uv ? uv[0] : undefined, colorv ? colorv[0] : undefined);
    this.addVertex(B, N, uv ? uv[1] : undefined, colorv ? colorv[1] : undefined);
    this.addVertex(C, N, uv ? uv[2] : undefined, colorv ? colorv[2] : undefined);

    this.addTriangleIndices(i, i + 1, i + 2);
  }

  addTriangleIndices(a:number, b:number, c:number){
    this.indices.push([a,b,c]);
  }

  addVertices(positions: Vec3[], colors?: Color|Color[] | Vec3[] | Vec4[]) {
    this.position.pushArray(positions);
    if (colors) {
      if(colors instanceof Color){
        this.color?.pushArray(new Array(positions.length).fill(colors));
      }else {
        this.color?.pushArray(colors);
      }
    }
  }


  addTriangleWithAttributesCCW(v0:Vertex3DAttributes, v1:Vertex3DAttributes, v2:Vertex3DAttributes, calcNormals=true){
    // this.hasAttribute("")
    let i = this.nVerts;
    let A = v0["position"];
    let B = v1["position"];
    let C = v2["position"];

    let hasNormal = this.hasNormal;
    let hasColor = this.hasColor;
    let hasUV = this.hasUV;

    let normals:(Vec3|undefined)[] = [];
    if(calcNormals && hasNormal) {
      let AB = B.minus(A);
      let AC = C.minus(A);
      let N = AB.getNormalized().cross(AC.getNormalized());
      normals.push(v0["normal"]??N);
      normals.push(v1["normal"]??N);
      normals.push(v2["normal"]??N);
    }else{
      normals = [undefined, undefined, undefined];
    }

    this.addVertex(A, normals[0], v0["uv"], v0["color"]);
    this.addVertex(B, normals[1], v0["uv"], v1["color"]);
    this.addVertex(C, normals[2], v0["uv"], v2["color"]);
    this.indices.push([i, i + 1, i + 2]);
  }

  // addTriangleCCW(A: Vec3, B: Vec3, C: Vec3, uv?: Vec2[], color?: Vec4[]) {
  //   let i = this.nVerts;
  //   let AB = B.minus(A);
  //   let AC = C.minus(A);
  //   let N = AB.getNormalized().cross(AC.getNormalized());
  //
  //   let colorv=color;
  //   // if(colorv !== undefined) {
  //   //   for(let c=0; c<colorv?.length;c++) {
  //   //     if (colorv[c] instanceof Color) {
  //   //       colorv[c] = (colorv[c] as Color).Vec4;
  //   //     }
  //   //   }
  //   // }
  //
  //   this.addVertex(A, N, uv ? uv[0] : undefined, colorv ? colorv[0] : undefined);
  //   this.addVertex(B, N, uv ? uv[1] : undefined, colorv ? colorv[1] : undefined);
  //   this.addVertex(C, N, uv ? uv[2] : undefined, colorv ? colorv[2] : undefined);
  //
  //   this.indices.push([i, i + 1, i + 2]);
  // }

  static Axis(scale = 1) {
    let o = V3(0, 0, 0);
    let x = V3(scale, 0, 0);
    let y = V3(0, scale, 0);
    let nz = V3(0, 0, -scale);
    let verts = VertexArray3D.CreateForRendering(false, false, true);
    verts.addVertex(o, undefined, undefined, Color.FromString("#ff0000"));
    verts.addVertex(x, undefined, undefined, Color.FromString("#ff0000"));
    verts.addVertex(o, undefined, undefined, Color.FromString("#00ff00"));
    verts.addVertex(y, undefined, undefined, Color.FromString("#00ff00"));
    verts.addVertex(o, undefined, undefined, Color.FromString("#0000ff"));
    verts.addVertex(nz, undefined, undefined, Color.FromString("#0000ff"));
    verts.indices = new VertexIndexArray(2);
    verts.indices.push([0, 1, 2, 3, 4, 5]);
    return verts;
  }

  static FrustumFromProjectionMatrix(P: Mat4, imagePlaneDepth = 100) {
    let imagePlaneNDC = 0.0;
    let baseNDC = [
      V4(-1, -1, imagePlaneNDC, 1),
      V4(1, -1, imagePlaneNDC, 1),
      V4(1, 1, imagePlaneNDC, 1),
      V4(-1, 1, imagePlaneNDC, 1),
    ];

    let PInv = P.getInverse();
    let baseV = baseNDC.map((v: Vec4) => {
      return PInv.times(v);
    });

    let verts = new VertexArray3D();
    verts.normal = new VertexAttributeArray3D();
    verts.indices = new VertexIndexArray(3);

    for (let i = 0; i < 3; i++) {
      verts.addTriangleCCW(
        V3(0, 0, 0),
        baseV[i].Point3D.getHomogenized().times(-imagePlaneDepth),
        baseV[i + 1].Point3D.getHomogenized().times(-imagePlaneDepth)
      );
    }
    verts.addTriangleCCW(
      V3(0, 0, 0),
      baseV[3].Point3D.getHomogenized().times(-imagePlaneDepth),
      baseV[0].Point3D.getHomogenized().times(-imagePlaneDepth)
    );
    return verts;
  }

  initColorAttribute(){
    this.color = new VertexAttributeColorArray();
  }
  initColor3DAttribute(){
    this.color = new VertexAttributeColor3DArray();
  }
  initIndices(vertsPerElement:number=3){
    this.indices = new VertexIndexArray(vertsPerElement);
  }

  initUVAttribute(){
    this.uv = new VertexAttributeArray2D();
  }

  initNormalAttribute(){
    this.normal = new VertexAttributeArray3D();
  }


  static CreateForRendering(
    hasNormals: boolean = true,
    hasTextureCoords: boolean = true,
    hasColors: boolean = false
  ) {
    let v = new this();
    // v.indices = new VertexIndexArray(3);
    v.initIndices()
    if (hasNormals) {
      v.initNormalAttribute();
    }
    if (hasTextureCoords) {
      v.initUVAttribute();
    }
    if (hasColors) {
      v.initColorAttribute();
    }
    return v;
  }


  static SquareXYUV(scale: number = 1, wraps: number = 1) {
    let verts = new VertexArray3D();
    // verts.position = new VertexAttributeArray3D();
    verts.position.push(V3(-0.5, -0.5, 0.0).times(scale));
    verts.position.push(V3(0.5, -0.5, 0.0).times(scale));
    verts.position.push(V3(0.5, 0.5, 0.0).times(scale));
    verts.position.push(V3(-0.5, 0.5, 0.0).times(scale));
    // verts.uv = new VertexAttributeArray2D();
    verts.initUVAttribute();
    verts.uv.push(V2(0, 0).times(wraps));
    verts.uv.push(V2(1, 0).times(wraps));
    verts.uv.push(V2(1, 1).times(wraps));
    verts.uv.push(V2(0, 1).times(wraps));

    // verts.normal = new VertexAttributeArray3D();
    verts.initNormalAttribute();
    verts.normal.push(V3(0.0, 0.0, 1.0).times(scale));
    verts.normal.push(V3(0.0, 0.0, 1.0).times(scale));
    verts.normal.push(V3(0.0, 0.0, 1.0).times(scale));
    verts.normal.push(V3(0.0, 0.0, 1.0).times(scale));

    // verts.indices = new VertexIndexArray(3);
    verts.initIndices();
    verts.indices.push([0, 1, 2]);
    verts.indices.push([0, 2, 3]);
    return verts;
  }

  static IndexedGrid(
    width: number = 1,
    height: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1,
    textureWraps?:Vec2,
    color?: Color
  ) {
    // let width:number=1, height:number=1, widthSegments:number=1,heightSegments:number=1;

    color = color ?? Color.FromString("#ffffff");

    if(textureWraps === undefined){
      textureWraps = V2(1, 1);
    }

    let halfW = width * 0.5;
    let halfH = height * 0.5;
    // let's use normals, texture coords, and colors...
    let v = VertexArray3D.CreateForRendering(true, true, true);
    for (let y = 0; y < heightSegments + 1; y++) {
      for (let x = 0; x < widthSegments + 1; x++) {
        v.addVertex(
          V3(
            -halfW + (x / widthSegments) * width,
            -halfH + (y / heightSegments) * height,
            0
          ),
          V3(0, 0, 1),
          V2(x*textureWraps.x / widthSegments, y*textureWraps.y / heightSegments),
          color
        );
      }
    }

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        v.indices.push([
          x + y * (widthSegments + 1),
          x + 1 + y * (widthSegments + 1),
          x + 1 + (y + 1) * (widthSegments + 1),
        ]);
        v.indices.push([
          x + 1 + (y + 1) * (widthSegments + 1),
          x + (y + 1) * (widthSegments + 1),
          x + y * (widthSegments + 1),
        ]);
      }
    }
    return v;
  }

  // static VertsForBounds2D(bound:BoundingBox3D){
  //     let verts = new VertexArray3D();
  //     verts.position= new VertexAttributeArray3D();
  //     verts.position.push(V3(-0.5*aspect,-0.5,0.0).times(scale))
  //     verts.position.push(V3(0.5*aspect,-0.5,0.0).times(scale))
  //     verts.position.push(V3(0.5*aspect,0.5,0.0).times(scale))
  //     verts.position.push(V3(-0.5*aspect,0.5,0.0).times(scale))
  //     verts.uv = new VertexAttributeArray2D()
  //     verts.uv.push(V2(0,0));
  //     verts.uv.push(V2(1,0));
  //     verts.uv.push(V2(1,1));
  //     verts.uv.push(V2(0,1));
  //
  //     verts.normal = new VertexAttributeArray3D();
  //     verts.normal.push(V3(0.0,0.0,-1.0).times(scale))
  //     verts.normal.push(V3(0.0,0.0,-1.0).times(scale))
  //     verts.normal.push(V3(0.0,0.0,-1.0).times(scale))
  //     verts.normal.push(V3(0.0,0.0,-1.0).times(scale))
  //
  //     verts.indices = new VertexIndexArray(3);
  //     verts.indices.push([0,1,2]);
  //     verts.indices.push([0,2,3]);
  //     return verts;
  // }

  static Box3D(minPoint:Vec3, maxPoint:Vec3) {
    // let va = new VertexArray3D();
    let va = VertexArray3D.CreateForRendering(true, true)
    let corners = [minPoint.clone(),
      V3(maxPoint.x, minPoint.y, minPoint.z),
      V3(maxPoint.x, maxPoint.y, minPoint.z),
      V3(minPoint.x, maxPoint.y, minPoint.z),
      V3(minPoint.x, minPoint.y, maxPoint.z),
      V3(maxPoint.x, minPoint.y, maxPoint.z),
        maxPoint.clone(),
      V3(minPoint.x, maxPoint.y, maxPoint.z)
    ];

    va.indices = new VertexIndexArray(3);
    let startIndex = 0;
    function addSide(verts:Vec3[]){
      let si = startIndex;
      // let normal = verts[1].minus(verts[0]).cross(verts[3].minus(verts[0])).getNormalized().times(-1);
      let normal = V3(0,0,1);
      va.addVertex(verts[0],normal,V2(0,1));
      va.addVertex(verts[1],normal,V2(1,1));
      va.addVertex(verts[2],normal,V2(1,0));
      va.addVertex(verts[3],normal,V2(0,0));
      va.indices.push([si,si+1,si+2]);
      va.indices.push([si,si+2,si+3]);
      startIndex = startIndex+4;
    }

    addSide([corners[0],corners[1],corners[2],corners[3]])
    addSide([corners[0],corners[1],corners[5],corners[4]])
    addSide([corners[0],corners[3],corners[7],corners[4]])

    addSide([corners[4],corners[5],corners[6],corners[7]])
    addSide([corners[2],corners[3],corners[7],corners[6]])
    addSide([corners[1],corners[2],corners[6],corners[5]])
    return va;
  }


  static MeshVertsForBoundingBox3D(bounds: BoundingBox3D) {
    return bounds.GetBoxTriangleMeshVerts();
  }

  static BoundingBoxMeshVertsForObject3D(obj: THREE.Object3D) {
    return BoundingBox3D.FromTHREEJSObject(obj).GetBoxTriangleMeshVerts();
  }

  /**
   * Slightly modified from ThreeJS
   * @param radius
   * @param widthSegments
   * @param heightSegments
   * @param phiStart
   * @param phiLength
   * @param thetaStart
   * @param thetaLength
   * @constructor
   */
  static Sphere(
    radius = 1,
    widthSegments = 32,
    heightSegments = 16,
    phiStart = 0,
    phiLength = Math.PI * 2,
    thetaStart = 0,
    thetaLength = Math.PI,
    ccw:boolean = true
  ) {
    let sphere = VertexArray3D.CreateForRendering(true, true);
    widthSegments = Math.max(3, Math.floor(widthSegments));
    heightSegments = Math.max(2, Math.floor(heightSegments));
    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
    let index = 0;
    const grid = [];
    const vertex = new Vec3();
    // const normal = new Vec3();
    // generate vertices, normals and uvs

    for (let iy = 0; iy <= heightSegments; iy++) {
      const verticesRow = [];
      const v = iy / heightSegments;
      // special case for the poles
      let uOffset = 0;
      if (iy === 0 && thetaStart === 0) {
        uOffset = 0.5 / widthSegments;
      } else if (iy === heightSegments && thetaEnd === Math.PI) {
        uOffset = -0.5 / widthSegments;
      }
      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;
        // vertex
        vertex.x =
          -radius *
          Math.cos(phiStart + u * phiLength) *
          Math.sin(thetaStart + v * thetaLength);
        vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
        vertex.z =
          radius *
          Math.sin(phiStart + u * phiLength) *
          Math.sin(thetaStart + v * thetaLength);

        // uv
        let uv = V2(u + uOffset, 1 - v);

        verticesRow.push(index++);
        sphere.addVertex(vertex, vertex.getNormalized(), uv);
      }
      grid.push(verticesRow);
    }

    // indices

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];
        if (iy !== 0 || thetaStart > 0) {

          if(!ccw) {
            sphere.indices.push([d, b, a]);
          }else{
            sphere.indices.push([a, b, d]);
          }
        }
        if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
          if(!ccw){
            sphere.indices.push([d, c, b]);
          }else{
            sphere.indices.push([b, c, d]);
          }


        }
      }
    }
    return sphere;
  }


  /**
   * Slightly modified from ThreeJS
   * @param radius
   * @param widthSegments
   * @param heightSegments
   * @param phiStart
   * @param phiLength
   * @param thetaStart
   * @param thetaLength
   * @constructor
   */
  static ColoredSphere(
      radius = 1,
      widthSegments = 32,
      heightSegments = 16,
      color?:Color
  ) {
    // color = color??Color.RandomRGBA();
    let phiStart = 0;
    let phiLength = Math.PI * 2;
    let thetaStart = 0;
    let thetaLength = Math.PI
    let sphere = VertexArray3D.CreateForRendering(true, true, true);
    widthSegments = Math.max(3, Math.floor(widthSegments));
    heightSegments = Math.max(2, Math.floor(heightSegments));
    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
    let index = 0;
    const grid = [];
    const vertex = new Vec3();
    // const normal = new Vec3();
    // generate vertices, normals and uvs

    for (let iy = 0; iy <= heightSegments; iy++) {
      const verticesRow = [];
      const v = iy / heightSegments;
      // special case for the poles
      let uOffset = 0;
      if (iy === 0 && thetaStart === 0) {
        uOffset = 0.5 / widthSegments;
      } else if (iy === heightSegments && thetaEnd === Math.PI) {
        uOffset = -0.5 / widthSegments;
      }
      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;
        // vertex
        vertex.x =
            -radius *
            Math.cos(phiStart + u * phiLength) *
            Math.sin(thetaStart + v * thetaLength);
        vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
        vertex.z =
            radius *
            Math.sin(phiStart + u * phiLength) *
            Math.sin(thetaStart + v * thetaLength);

        // uv
        let uv = V2(u + uOffset, 1 - v);

        verticesRow.push(index++);
        sphere.addVertex(vertex, vertex.getNormalized(), uv,color??Color.RandomRGBA());
      }
      grid.push(verticesRow);
    }

    // indices

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];
        if (iy !== 0 || thetaStart > 0) {
          sphere.indices.push([a, b, d]);
        }
        if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
          sphere.indices.push([b, c, d]);
        }
      }
    }
    return sphere;
  }


  // static SpriteGeometry(texture: ATexture, scale: number = 100) {
  //   let verts = new VertexArray3D();
  //   let aspect = texture.width / texture.height;
  //   verts.position = new VertexAttributeArray3D();
  //   verts.position.push(V3(-0.5 * aspect, -0.5, 0.0).times(scale));
  //   verts.position.push(V3(0.5 * aspect, -0.5, 0.0).times(scale));
  //   verts.position.push(V3(0.5 * aspect, 0.5, 0.0).times(scale));
  //   verts.position.push(V3(-0.5 * aspect, 0.5, 0.0).times(scale));
  //   verts.uv = new VertexAttributeArray2D();
  //   verts.uv.push(V2(0, 0));
  //   verts.uv.push(V2(1, 0));
  //   verts.uv.push(V2(1, 1));
  //   verts.uv.push(V2(0, 1));
  //
  //   verts.normal = new VertexAttributeArray3D();
  //   verts.normal.push(V3(0.0, 0.0, -1.0).times(scale));
  //   verts.normal.push(V3(0.0, 0.0, -1.0).times(scale));
  //   verts.normal.push(V3(0.0, 0.0, -1.0).times(scale));
  //   verts.normal.push(V3(0.0, 0.0, -1.0).times(scale));
  //
  //   verts.indices = new VertexIndexArray(3);
  //   verts.indices.push([0, 1, 2]);
  //   verts.indices.push([0, 2, 3]);
  //   return verts;
  // }

  addVertex(v: Vec3, normal?: Vec3, uv?: Vec2, color?: Color | Vec4) {
    this.position.push(v);
    if (color) {
      this.color?.push(V4A(...color.elements));
    }
    if (normal) {
      this.normal?.push(V3(...normal.elements));
    }
    if (uv) {
      this.uv?.push(V2(...uv.elements));
    }
  }

  static FromVec3List(verts: Vec3[]) {
    let va = new VertexArray3D();
    for (let v of verts) {
      va.addVertex(v);
    }
    return va;
  }
}
