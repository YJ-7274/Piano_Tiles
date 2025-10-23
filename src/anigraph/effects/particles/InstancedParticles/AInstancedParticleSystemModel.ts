import {ASerializable} from "../../../base";
import {NodeTransform3D, Vec3} from "../../../math";
import {ACameraModel} from "../../../scene";
import {AParticleSystemModel} from "../AParticleSystemModel";
import {Particle3D} from "../../../physics/particles/AParticle3D";
import {AParticle} from "../../../physics";
import {AParticleEnums} from "../../../physics/particles/AParticleEnums";
import {AShaderMaterial, AShaderModel, ATexture} from "../../../rendering";
import {
    AInstancedParticleSystemShaderModel,
    InstancedParticleSystemMaterial
} from "./AInstancedParticleSystemShaderModel";


const DEFAULT_MASS:number=1;
enum BillboardParticleEnums{
    CameraSubscription="CameraSubscription"
}


@ASerializable("AInstancedParticleSystemModel")
export abstract class AInstancedParticleSystemModel<P extends AParticle<any>> extends AParticleSystemModel<P>{
    static ShaderModelClass:(typeof AShaderModel)=AInstancedParticleSystemShaderModel;
    static ShaderModel:AShaderModel;
    static async LoadShaderModel(name?:string, ...args:any[]){
        if(this.ShaderModel == undefined) {
            this.ShaderModel = await this.ShaderModelClass.CreateModel(name??"instancedparticle", ...args)
        }
    }

    /** Get set enableOpacity */
    set useOpacity(value:boolean){
        this.material.setUniform("opacityInMatrix", value);
    }
    get useOpacity(){
        return this.material.getUniformValue("opacityInMatrix");
    }

    static CreateMaterial(particleTexture?:ATexture, ...args:any[]):InstancedParticleSystemMaterial{
        let mat =  (this.ShaderModel.CreateMaterial(...args) as InstancedParticleSystemMaterial);
        if(particleTexture) {
            mat.particleTexture = particleTexture;
        }
        return mat;
    }

    get material():InstancedParticleSystemMaterial{return this._material as InstancedParticleSystemMaterial;}

    setParticleTexture(texture:ATexture){
        this.material.particleTexture = texture;
    }

    abstract initParticles(nParticles:number):void;

    // initParticles(nParticles:number){
    //     for(let i=0;i<nParticles;i++){
    //         let newp = new ABillboardParticle();
    //         newp.visible=false;
    //         this.addParticle(newp);
    //     }
    // }


    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
        this.signalParticlesUpdated();
    }

    constructor(nParticles?:number) {
        super();
        this.initParticles(nParticles??AParticleEnums.DEFAULT_MAX_N_PARTICLES);
        this.signalParticlesUpdated();
    }


}
