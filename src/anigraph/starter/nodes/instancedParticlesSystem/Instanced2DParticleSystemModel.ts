import {ASerializable} from "../../../base";
import {AParticle} from "../../../physics";
import {A2DParticleSystemModel} from "../../../effects";
import {AParticleEnums} from "../../../physics/particles/AParticleEnums";

@ASerializable("Instanced2DParticleSystemModel")
export abstract class Instanced2DParticleSystemModel<P extends AParticle<any>> extends A2DParticleSystemModel<P>{
    abstract initParticles(nParticles:number):void;
    constructor(nParticles?:number) {
        super();
        if(nParticles) {
            this.initParticles(nParticles ?? AParticleEnums.DEFAULT_MAX_N_PARTICLES);
        }
    }
}
