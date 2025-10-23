import * as THREE from "three";
import {AInstancedGraphicBase} from "./AInstancedGraphicBase";
import {Color, Mat4} from "../../math";
import {VertexArray2D, VertexArray3D} from "../../geometry";
import {AParticle} from "../../physics/particles/AParticle";
import {AParticleEnums} from "../../physics/particles/AParticleEnums";
import {AParticle3D} from "../../physics/particles/AParticle3D";
import {AMaterial} from "../material";

export abstract class AInstancedGraphic extends AInstancedGraphicBase{
    protected _mesh!:THREE.InstancedMesh
    protected _geometry!:THREE.BufferGeometry;
    protected _material!:THREE.Material;

    get threejs(){
        return this.mesh;
    }

    constructor() {
        super();
    }


    setMaterial(material:THREE.Material){
        if(this._material !== undefined){
            this._material.dispose();
        }
        this._material = material;
    }


    setNeedsUpdate(){
        this.threejs.instanceMatrix.needsUpdate=true;
        if(this.threejs.instanceColor) {
            this.threejs.instanceColor.needsUpdate = true;
        }

    }

    setVerts(verts:VertexArray3D|number[]){
        if(this._geometry){
            this._geometry.dispose();
        }
        if(verts === undefined){
            this._setGeometryPlane();
        }else if(verts instanceof VertexArray3D){
            this._geometry = new THREE.BufferGeometry();
            this._geometry.setIndex(verts.indices.elements);
            for (let attribute in verts.attributes) {
                this._geometry.setAttribute(attribute, verts.getAttributeArray(attribute).BufferAttribute());
            }
        }
        if(this._mesh){
            this._mesh.geometry = this._geometry;
        }
    }

    _setGeometryPlane(){
        let geometry = VertexArray3D.SquareXYUV(1);
        this._geometry = new THREE.BufferGeometry();
        this._geometry.setIndex(geometry.indices.elements);
        for(let attribute in geometry.attributes){
            this._geometry.setAttribute(attribute, geometry.getAttributeArray(attribute).BufferAttribute());
        }
    }

    init(nInstances:number, material?:THREE.Material|AMaterial, verts?:VertexArray3D|number[], ...args:any[]){
        // nParticles = nParticles!==undefined?nParticles:AParticleEnums.DEFAULT_MAX_N_PARTICLES;
        if(verts){
            this.setVerts(verts);
        }else{
            this._setGeometryPlane();
        }
        let mat = material;
        if(mat instanceof AMaterial){
            mat = mat.threejs;
        }
        if(mat){
            this.setMaterial(mat);
        }else {
            throw new Error("No instanced graphic material provided!");
        }
        if(this._geometry && this._material){
            this._mesh = new THREE.InstancedMesh(this._geometry, this._material, nInstances);
            // this.threejs.matrixAutoUpdate=false;
            this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            this.setColorAt(0, Color.FromString("#00ff00"));
            // @ts-ignore
            this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage );
        }
    }

}
