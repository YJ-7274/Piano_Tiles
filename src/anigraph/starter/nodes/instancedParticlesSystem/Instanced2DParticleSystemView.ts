import {Particle2D} from "../../../physics";
import {AInstancedParticleSystemGraphic, AInstancedParticleSystemView} from "../../../effects";
import {Instanced2DParticleSystemModel} from "./Instanced2DParticleSystemModel";
import {Color, Mat3, Mat4, NodeTransform2D, TransformationInterface} from "../../../math";

export abstract class Instanced2DParticleSystemView<P extends Particle2D> extends AInstancedParticleSystemView<P>{

    get particlesElement():AInstancedParticleSystemGraphic{
        return this._particlesElement as AInstancedParticleSystemGraphic;
    }
    get model():Instanced2DParticleSystemModel<P>{
        return this._model as Instanced2DParticleSystemModel<P>;
    }

    _getTransformForParticleIndex(i:number):Mat4{
        if(i>this.particlesElement.count){
            console.warn("You are trying to set the transform for a graphic instance that doesn't exist! Instanced graphics need to have the number of instances specified up front for GPU resource allocation. When you initialize your model, specify the maximum number of particles you may use so that the GPU resources can be allocated! (e.g., when you initialize a particle system model, set the number of particles up front and just set visible=false for any you aren't using yet)")
        }
        let nodetransform = this.get2DTransformForParticleIndex(i);
        return Mat4.From2DMat3(nodetransform.getMatrix());
    };

    _getColorForParticleIndex(i: number): Color {
        return this.getColorForParticleIndex(i);
    }

    abstract get2DTransformForParticleIndex(i:number):Mat3;
    abstract getColorForParticleIndex(i:number):Color;

    createParticlesElement(...args:any[]): AInstancedParticleSystemGraphic {
        return AInstancedParticleSystemGraphic.Create(this.model.nParticles, this.model.material);
        // return AInstancedParticleSystemGraphic.Create(this.model.nParticles);
    }

    init() {
        super.init();
    }

    setTransform(transform:TransformationInterface){
        if(transform instanceof Mat3){
            let t = transform.Mat4From2DH();
            t.m23=this.model.zValue;
            t.assignTo(this.threejs.matrix);
        }else if (transform instanceof NodeTransform2D) {
            let t = transform.getMatrix().Mat4From2DH();
            t.m23=this.model.zValue;
            t.assignTo(this.threejs.matrix);
        }else{
            (transform.getMatrix() as Mat4).assignTo(this.threejs.matrix);
        }
    }


    update(...args:any[]) {
        let transform = Mat4.From2DMat3(this.model.transform.getMatrix());
        // transform.m23 = this.model.zValue;
        this.setTransform(transform);
    }

}
