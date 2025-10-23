import {AGraphicObject} from "../graphicobject";
import {Color, Mat3, Mat4} from "../../math";

export abstract class AInstancedGraphicBase extends AGraphicObject{
    protected abstract _mesh:THREE.InstancedMesh;
    protected abstract _geometry:THREE.BufferGeometry;
    protected abstract _material:THREE.Material;
    get mesh(){return this._mesh;}
    /** Get set count */
    set count(value:number){this.mesh.count=value;}
    get count(){
        return this.mesh.count;
    }




    /**
     * Set the color of the instance in index `index`
     * @param index
     * @param color
     */
    setColorAt(index:number, color:Color){
        this.mesh.setColorAt(index, color.asThreeJS());
    }

    /**
     * Set the transformation matrix of the instance in index `index`
     * @param index
     * @param m
     */
    setMatrixAt(index:number, m:Mat4|Mat3){
        if(m instanceof Mat4){
            this.mesh.setMatrixAt(index, m.asThreeJS());
        }else{
            this.mesh.setMatrixAt(index, Mat4.From2DMat3(m).asThreeJS());
        }
    }

    setMatrixAndColorAt(index:number, mat:Mat3|Mat4, color:Color, useOpacity:boolean=true){
        if(index>this.count){
            console.warn("You are trying to set the transform for a graphic instance that doesn't exist! Instanced graphics need to have the number of instances specified up front for GPU resource allocation. When you initialize your model, specify the maximum number of particles you may use so that the GPU resources can be allocated! (e.g., when you initialize a particle system model, set the number of particles up front and just set visible=false for any you aren't using yet)")
        }
        if(useOpacity){
            let mat4 = mat.getMat4();
            mat4.m30 = 1.0-color.a;
            this.setMatrixAt(index, mat4);
            this.setColorAt(index, color);
        }else {
            this.setMatrixAt(index, mat);
            this.setColorAt(index, color);
        }
    }


    dispose(){
        super.dispose();
        if(this._geometry){
            this._geometry.dispose();
        }
        if(this._material){
            this._material.dispose();
        }
    }

    setUsage(usage:THREE.Usage){
        // mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
        this.mesh.instanceMatrix.setUsage( usage );
    }

    get geometery(){return this._geometry;}
    get material(){return this._material;}
}
