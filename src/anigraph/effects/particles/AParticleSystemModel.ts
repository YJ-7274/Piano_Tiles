import {AObject, ASerializable} from "../../base";
import {Particle3D} from "../../physics/particles/AParticle3D";
import {ANodeModel3D} from "../../scene";
import {AParticle} from "../../physics";
import {ParticleEvents} from "../../physics/particles/AParticleEnums";
import {ParticleSystemModelInterface} from "./ParticleSystemModelInterface";


@ASerializable("AParticleSystemModel")
export class AParticleSystemModel<P extends AParticle<any>> extends ANodeModel3D implements ParticleSystemModelInterface<any>{
    particles:P[]=[];
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

    // timeUpdate(t: number, ...args:any[]) {
    //     super.timeUpdate(t, ...args);
    //     this.signalParticlesUpdated();
    // }

}
