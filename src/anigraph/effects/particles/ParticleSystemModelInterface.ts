import { ANodeModel} from "../../scene";
import {AParticle} from "../../physics";
import {AEventCallbackSwitch, AObject} from "../../base";


export interface ParticleSystemModelInterface<P extends AParticle<any>> extends ANodeModel{
    particles:P[];
    get nParticles():number;
    addParticlesListener(callback:(self:AObject)=>void, handle?:string, synchronous?:boolean):AEventCallbackSwitch;
}
