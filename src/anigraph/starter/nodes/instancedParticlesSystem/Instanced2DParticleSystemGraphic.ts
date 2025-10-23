import {AInstancedParticleSystemGraphic} from "../../../effects";
import {AMaterial} from "../../../rendering";

export class Instanced2DParticleSystemGraphic extends AInstancedParticleSystemGraphic{
    static Create(nParticles:number=100, material?:AMaterial|THREE.Material, ...args:any[]){
        let psystem = new this();
        psystem.init(nParticles, material)
        return psystem;
    }
}
