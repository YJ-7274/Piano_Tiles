import {AGraphicGroup} from "../graphicobject";
import {Color} from "../../math";
import {AObject3DModelWrapper} from "../../geometry";
import {AMaterial} from "../material";
import * as THREE from "three";
import {ASerializable} from "../../base";
import {Material} from "three";

export interface ALoadedElementInterface{
    updateSourceTransform():void;
    setMaterial(material: Color | THREE.Color | Material | Material[]):void;
}

@ASerializable("ALoadedElement")
export class ALoadedElement extends AGraphicGroup implements ALoadedElementInterface{
    public _sourceObject:AObject3DModelWrapper
    public loadedObject:THREE.Object3D;
    constructor(object:AObject3DModelWrapper) {
        super();
        this.loadedObject= object.getNewSceneObject();
        this.threejs.add(this.loadedObject);
        this._sourceObject=object;
    }

    setMaterial(material:Color|THREE.Color|THREE.Material|THREE.Material[]){
        function setMaterialForMesh(obj:THREE.Object3D){
            if(obj instanceof THREE.Mesh){
                obj.material = material;
            }else if(obj instanceof THREE.Group){
                for(let child of obj.children){
                    setMaterialForMesh(child)
                }
            }
        }
        setMaterialForMesh(this.loadedObject);
    }

    onMaterialChange(newMaterial:AMaterial){
        this.setMaterial(newMaterial.threejs);
    }
    onMaterialUpdate(newMaterial: AMaterial, ...args:any[]) {
        super.onMaterialUpdate(newMaterial, ...args);
    }

    updateSourceTransform(){
        this._sourceObject.sourceTransform.getMatrix().assignTo(this.loadedObject.matrix);
    }
}

