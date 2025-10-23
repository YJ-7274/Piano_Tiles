import {AParticleSystemModel} from "./AParticleSystemModel";
import {AObject, ASerializable} from "../../base";
import {AParticle} from "../../physics";
import {ANodeModel2D, ANodeModel3D, ANodeModel2DPRSA} from "../../scene";
import {ParticleEvents} from "../../physics/particles/AParticleEnums";
import {ParticleSystemModelInterface} from "./ParticleSystemModelInterface";


@ASerializable("A2DParticleSystemModel")
export class A2DParticleSystemModel<P extends AParticle<any>> extends ANodeModel2DPRSA implements ParticleSystemModelInterface<P>{
    _particles:P[]=[];
    /** Get set particles */
    set particles(value){this._particles = value;}
    get particles(){return this._particles;}
    get nParticles(){
        return this.particles.length;
    }

    /**
     *
     * @param callback
     * @param handle
     * @param synchronous
     * @returns {AStateCallbackSwitch}
     */
    addParticlesListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true,){
        return this.addEventListener(ParticleEvents.PARTICLES_UPDATED,callback, handle);
    }

    signalParticlesUpdated(...args:any[]){
        this.signalEvent(ParticleEvents.PARTICLES_UPDATED, ...args);
    }


    addParticle(particle:P){
        this.particles.push(particle);
    }

}
