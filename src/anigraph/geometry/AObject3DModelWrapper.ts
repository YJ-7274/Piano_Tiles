import * as THREE from "three";
import {V3, Mat4, TransformationInterface, NodeTransform3D, ATexture,} from "../index";
import {HasBounds} from "./HasBounds";
import {VertexArray3D} from "./VertexArray3D";
import {BoundingBox3D} from "./BoundingBox3D";
import { ref } from "valtio";
import {AObject, ASerializable} from "../base";
import {GetDeepTHREEJSClone} from "../rendering";

/**
 * Object that wraps a loaded THREE.Object3D, which is a three.js object.
 * https://threejs.org/docs/index.html?q=Object3D#api/en/core/Object3D
 */
@ASerializable("AObject3DModelWrapper")
export class AObject3DModelWrapper extends AObject implements HasBounds {
  public object: THREE.Object3D;
  protected _sourceTransform: TransformationInterface;

  /**
   * A transformation of the original asset into some new default coordinates. This is generally used, for example, if the asset was built with an x-z ground plane but you are using an x-y ground plane.
   * @returns {TransformationInterface}
   */
  get sourceTransform() :TransformationInterface{
    return this._sourceTransform;
  }

  constructor(object: THREE.Object3D) {
    super(object.uuid);
    this.object = ref(object);
    this.object.matrixAutoUpdate = false;

    // default the source transform to the identity
    this._sourceTransform = new NodeTransform3D();
  }

  /**
   * Get all descendants that have a material property. We will use this to set the materials associated with loaded objects.
   * @returns {Object3D[]}
   */
  getThreeJSDescendantsThatHaveMatProperty(){
    let objs:THREE.Object3D[] = [];
    function getRelevantChildren(obj:THREE.Object3D){
      if ('material' in obj) {
        objs.push(obj);
      }
      if('children' in obj) {
        for (let c of obj.children) {
          getRelevantChildren(c);
        }
      }
    }
    getRelevantChildren(this.object);
    return objs;
  }

  getMeshElementByName(elementName:string){
    function _getElement(p:THREE.Object3D):THREE.Object3D|undefined{
      if(p.type == "Mesh") {
        if (p.name == elementName) {
          return p;
        }
      }
      for(let c of p.children){
        let cel:THREE.Object3D|undefined = _getElement(c);
        if(cel){
          return cel;
        }
      }
    }
    return _getElement(this.object)
  }


  /**
   * Returns a new Object3D instance based on the asset.
   * @param wrapInGroup Whether to wrap the object in a group. This is sometimes what you want if the object is a mesh and you want to create a scene graph node.
   * @param deepCopy Whether the object should be a deep copy of the asset or a reference.
   * @param scale optional scale factor.
   * @returns {Object3D | Group}
   */
  getNewSceneObject(wrapInGroup:boolean=false, deepCopy?:boolean, scale?:number) {
    let obj: THREE.Object3D;
    if(deepCopy){
      obj = GetDeepTHREEJSClone(this.object);
    }else {
      if (this.object instanceof THREE.Mesh) {
        obj = new THREE.Mesh(this.object.geometry, this.object.material);
      } else {
        obj = this.object.clone();
      }
    }
    obj.matrixAutoUpdate = false;
    if(scale===undefined) {
      this.sourceTransform.assignTo(obj.matrix);
    }else{
      (this.sourceTransform.getMatrix() as Mat4).times(Mat4.Scale3D(scale)).assignTo(obj.matrix);
    }
    if(wrapInGroup){
      let group = new THREE.Group();
      group.matrixAutoUpdate=false;
      group.add(obj);
      return group;
    }else {
      return obj;
    }
  }

  /**
   * Get a dictionary with color and possibly normal THREE.Texture
   * @returns {{normal: ATexture | undefined, color: ATexture | undefined} | {normal: undefined, diffuse: undefined}}
   */
  getTextures(){
    let objectMesh:THREE.Mesh;
    if(this.object instanceof THREE.Group){
      objectMesh = this.object.children[0] as THREE.Mesh;
    }else {
      objectMesh = (this.object as THREE.Mesh);
    }
    let material = objectMesh.material;
    if(material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshPhongMaterial){
      let diffuseTexture = material.map? new ATexture(material.map, 'diffuse'):undefined;
      let normalTexture = material.normalMap? new ATexture(material.normalMap, 'normal'):undefined;
      return {
        color: diffuseTexture,
        normal: normalTexture
      }
    } else{
      console.log(`Have not implemented texture fetch for material type ${material}`);
      return {
        diffuse: undefined,
        normal: undefined
      }
    }


  }

  /**
   * Set source scale
   * @param sourceScale
   */
  setSourceScale(sourceScale:number){
    // this._sourceTransform.scale=sourceScale;
    if(this._sourceTransform instanceof NodeTransform3D){
      this._sourceTransform.scale = sourceScale
    }else{
      console.warn("Setting source scale when source transform is not a NodeTransform!")
      this._sourceTransform = NodeTransform3D.FromMatrix(this._sourceTransform as Mat4);
      (this._sourceTransform as NodeTransform3D).scale = sourceScale;
    }
    // Mat4.Scale3D(sourceScale).assignTo(this.object.matrix);
    this._sourceTransform.getMatrix().assignTo(this.object.matrix);
  }

  /**
   * Calculates a bounding bod for the vertex array of the object.
   * @returns {VertexArray3D}
   */
  getBoundingBoxVertexArray() {
    return VertexArray3D.BoundingBoxMeshVertsForObject3D(this.object);
  }

  set sourceTransform(v: TransformationInterface) {
    this._sourceTransform = v;
    this._sourceTransform.assignTo(this.object.matrix);
  }

  getBounds(): BoundingBox3D {
    let threebox = new THREE.Box3().setFromObject(this.object);
    let bounds = new BoundingBox3D();
    bounds.minPoint = V3(threebox.min.x, threebox.min.y, threebox.min.z);
    bounds.maxPoint = V3(threebox.max.x, threebox.max.y, threebox.max.z);
    return bounds;
  }
}
