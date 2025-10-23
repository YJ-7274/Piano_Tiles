import {Particle3D} from "../../physics/particles/AParticle3D";
import {ANodeView} from "../../scene";
import {AGraphicGroup, AInstancedGraphic} from "../../rendering";
import {AParticleSystemModel} from "./AParticleSystemModel";
import {Color, Mat4} from "../../math";
import {AInstancedParticleSystemGraphic} from "./InstancedParticles";
import {AParticle} from "../../physics/particles";
import {ParticleSystemModelInterface} from "./ParticleSystemModelInterface";

export abstract class AParticleSystemView<P extends AParticle<any>> extends ANodeView{

    abstract updateParticles():void;
    abstract createParticlesElement(...args:any[]):AInstancedParticleSystemGraphic;

    particleGroup!:AGraphicGroup;
    _particlesElement!:AInstancedParticleSystemGraphic;
    get particlesElement(){
        return this._particlesElement;
    }

    get model():ParticleSystemModelInterface<P>{
        return this._model as AParticleSystemModel<P>;
    }



    init() {
        this.particleGroup = new AGraphicGroup();
        this.registerGraphic(this.particleGroup);
        this.add(this.particleGroup);
        this._particlesElement = this.createParticlesElement();
        this.particleGroup.add(this.particlesElement);
    }

    setModelListeners() {
        super.setModelListeners();
        this.addParticleSubscriptions();
    }

    addParticleSubscriptions(){
        this.subscribe(this.model.addParticlesListener(()=>{
            this.updateParticles();
        }))
    }



    // update(...args:any[]) {
    //     for(let p=0;p<this.model.particles.length;p++){
    //         this.particlesElement.setParticle(p, this.model.particles[p]);
    //     }
    //     this.particlesElement.setNeedsUpdate();
    // }
}



