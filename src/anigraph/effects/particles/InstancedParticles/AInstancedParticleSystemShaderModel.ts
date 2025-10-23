import {AShaderMaterial, AShaderModel, ATexture} from "../../../rendering";
import {ClassInterface} from "../../../basictypes";
import * as THREE from "three";


export class InstancedParticleSystemMaterial extends AShaderMaterial{
    /** Get set particleTexture */
    set particleTexture(value:ATexture|undefined){
        this.setTexture("particle", value);
    }
    get particleTexture(){
        return this.getTexture("particle");
    }

    /** Get set opacityInMatrix */
    set opacityInMatrix(value:boolean){
        this.setUniform("opacityInMatrix", value, 'bool');
    }
    get opacityInMatrix(){
        return this.getUniformValue("opacityInMatrix");
    }
}


export class AInstancedParticleSystemShaderModel extends AShaderModel{
    ShaderMaterialClass:ClassInterface<AShaderMaterial>=InstancedParticleSystemMaterial;
    private _particleTexture?:ATexture;
    /**
     * Set default particle texture
     * @param value
     */
    set diffuseTexture(value){this._particleTexture = value;}

    /**
     * Get the default particle texture
     * @returns {ATexture | undefined}
     */
    get diffuseTexture(){return this._particleTexture;}

    CreateMaterial(particleTexture?:ATexture, ...args:any[]){
        /**
         * If a texture is provided it will be used. If not, then the default provided for this model will be used if it
         * is defined
         * @type {ATexture | undefined}
         */
        particleTexture =particleTexture??this._particleTexture;
        let mat = super.CreateMaterial(...args) as InstancedParticleSystemMaterial;

        mat.depthWrite=false;
        mat.depthTest = true;
        mat.depthFunc = THREE.LessDepth;

        /**
         * Set the particle texture
         */
        mat.particleTexture = particleTexture;
        return mat;
    }

}

