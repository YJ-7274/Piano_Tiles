import {AMaterial} from "../rendering";
import * as THREE from "three";
import {Loader, Object3D} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader";
import {AObject3DModelWrapper} from "../geometry";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


function getDescendantMesh(obj:THREE.Object3D):THREE.Mesh|undefined{
    if(obj.type==="Mesh"){
        return obj as THREE.Mesh;
    }else{
        for(let c of obj.children){
            let cm = getDescendantMesh(c);
            if(cm && cm.type ==="Mesh"){
                return cm;
            }
        }
    }
    return;
}

export class A3DModelLoader{
    static async _LoadFromPath(path:string, callback:(model:AObject3DModelWrapper)=>Promise<void>, computeVertexNormals:boolean=false) {

        function handleLoadedObject3D(obj: THREE.Object3D) {

            if (obj instanceof THREE.BufferGeometry) {
                if (obj.attributes.normal == undefined) {
                    obj.computeVertexNormals()
                }
                let threemesh = new THREE.Mesh(obj);
                if(computeVertexNormals) {
                    obj.computeVertexNormals()
                }
                callback(new AObject3DModelWrapper(threemesh));
            } else {
                callback(new AObject3DModelWrapper(obj));
            }
        }

        let extension = path.split('.').pop();
        let loader: Loader;
        switch (extension) {
            case 'obj':
                loader = new OBJLoader();
                break;
            case 'ply':
                loader = new PLYLoader();
                break;
            case 'glb':
                loader = new GLTFLoader();
                break;
            default:
                throw new Error(`Extension "${extension}" not recognized`);
        }
        loader.setCrossOrigin("");
        // @ts-ignore
        loader.load(path, handleLoadedObject3D);
        // return loader.loadAsync(path, handleLoadedObject3D)
    }
    static async LoadSceneFromPath(path:string, computeVertexNormals:boolean=false) {
        let extension = path.split('.').pop();
        let loader: Loader;
        switch (extension) {
            case 'obj':
                loader = new OBJLoader();
                break;
            case 'ply':
                loader = new PLYLoader();
                break;
            case 'glb':
                loader = new GLTFLoader();
                break;
            default:
                throw new Error(`Extension "${extension}" not recognized`);
        }
        loader.setCrossOrigin("");
        let obj = await loader.loadAsync(path);
        if(extension === 'glb'){
            return new AObject3DModelWrapper(obj.scenes[0]);
        }
        if (obj instanceof THREE.BufferGeometry) {
            if (obj.attributes.normal == undefined || computeVertexNormals) {
                //obj.computeVertexNormals()
            }
            let threemesh = new THREE.Mesh(obj);
            return new AObject3DModelWrapper(threemesh);
        } else {
            return new AObject3DModelWrapper(obj);
        }
    }

    static async LoadFromPath(path:string, computeVertexNormals:boolean=false) {
        let extension = path.split('.').pop();
        let loader: Loader;
        switch (extension) {
            case 'obj':
                loader = new OBJLoader();
                break;
            case 'ply':
                loader = new PLYLoader();
                break;
            case 'glb':
                loader = new GLTFLoader();
                break;
            case 'gltf':
                loader = new GLTFLoader();
                break;
            default:
                throw new Error(`Extension "${extension}" not recognized`);
        }
        loader.setCrossOrigin("");
        let obj = await loader.loadAsync(path);
        if(extension === 'glb' || extension === 'gltf'){
            let mesh = getDescendantMesh(obj.scenes[0]);
            if(mesh){
                return new AObject3DModelWrapper(mesh);
            }else{
                return new AObject3DModelWrapper(obj.scenes[0]);
            }
        }
        if (obj instanceof THREE.BufferGeometry) {
            let threemesh = new THREE.Mesh(obj);
            return new AObject3DModelWrapper(threemesh);
        } else {
            return new AObject3DModelWrapper(obj);
        }
    }
}
