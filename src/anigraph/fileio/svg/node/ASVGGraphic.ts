import {ASerializable} from "../../../base";
import {AGraphicElement, AGraphicGroup} from "../../../rendering";
import {Color, Mat4} from "../../../math";
import * as THREE from "three";
import {ASVGModel3D} from "./ASVGModel3D";
import {SVGAsset} from "../SVGAsset";

@ASerializable("ASVGGraphic")
export class ASVGGraphic extends AGraphicGroup{
    _svgObject!:THREE.Object3D;
    svgRootNode!:THREE.Object3D;
    get svgObject():THREE.Object3D{
        return this._svgObject;
    }


    setElementColor(elementName:string, color:Color){
        let parentObj = this.threejs;
        function setElColor(p:THREE.Object3D){
            if(p.type == "Mesh") {
                if (p.name == elementName) {
                    let material = ((p as THREE.Mesh).material as THREE.MeshBasicMaterial);
                    material.setValues({"color": color.asThreeJS()});
                    if(color.a<1){
                        material.setValues({"transparent": true});
                        material.setValues({"opacity": color.a});
                        // (p as THREE.Mesh).material.setValue("transparent", true);
                        // (p as THREE.Mesh).material.setValue("opacity", color.a);
                    }else{
                        material.setValues({"transparent": false});
                        material.setValues({"opacity": 1.0});
                    }
                }
            }
            for(let c of p.children){
                setElColor(c);
            }
        }
        setElColor(parentObj);
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
        return _getElement(this.threejs)
    }

    protected constructor(svgSourceObject:THREE.Object3D) {
        super();
        this._svgObject=svgSourceObject.clone();
        this.threejs.add(svgSourceObject);
    }

    static Create(svgAsset:SVGAsset, deepCopy?:boolean){
        let svgObj = svgAsset.getNewSceneObject(true, deepCopy);
        let group = new THREE.Group();
        group.matrixAutoUpdate=false;
        group.add(svgObj);
        let newNode = new this(group);
        newNode.svgRootNode = svgObj;
        return newNode;
    }

    setSourceTransform(mat:Mat4){
        mat.assignTo(this.svgRootNode.matrix);
    }

    // static Create(svgSourceObject:THREE.Object3D){
    //     return new this(svgSourceObject);
    // }
}
