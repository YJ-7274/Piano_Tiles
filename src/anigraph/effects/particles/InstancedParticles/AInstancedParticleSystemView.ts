import {Color, Mat4, VectorType} from "../../../index";
import {AInstancedParticleSystemGraphic} from "./AInstancedParticleSystemGraphic";
import {AParticleSystemView} from "../AParticleSystemView";
import {AParticle} from "../../../index";


export abstract class AInstancedParticleSystemView<P extends AParticle<any>> extends AParticleSystemView<P>{
    static MAX_PARTICLES=300;

    /**
     * From AParticleSystemView you still need to define these as well
     */
    // abstract updateParticles():void;
    // abstract createParticlesElement(...args:any[]):AInstancedParticleSystemGraphic;

    abstract _getColorForParticleIndex(i:number):Color;
    abstract _getTransformForParticleIndex(i:number):Mat4;


    get particlesElement():AInstancedParticleSystemGraphic{
        return this._particlesElement as AInstancedParticleSystemGraphic;
    }

    init() {
        super.init();
    }


    update(...args:any[]) {
        this.setTransform(this.model.transform);
    }

    updateParticles(...args:any[]) {
        for(let i=0;i<this.model.particles.length;i++){
            this.particlesElement.setColorAt(i, this._getColorForParticleIndex(i));
            this.particlesElement.setMatrixAt(i, this._getTransformForParticleIndex(i));
        }
        this.particlesElement.setNeedsUpdate();
    }

}
