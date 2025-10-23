import {
    Instanced2DParticleSystemView
} from "../../../../anigraph/starter/nodes/instancedParticlesSystem/Instanced2DParticleSystemView";
import {ASerializable, Color, Mat3} from "../../../../anigraph";
import {Custom2DParticle} from "./Custom2DParticle";

@ASerializable("ExampleParticleSystemView")
export class ExampleParticleSystemView extends Instanced2DParticleSystemView<Custom2DParticle>{
    /**
     * This function returns the Mat3 transform for placing the ith particle in 2D world coordinates. You can customize it if you want, but it is generally cleaner to customize how the `position` property of each particle is set in your model, and keep this function as it is.
     * @param i
     * @returns {Mat3}
     */
    get2DTransformForParticleIndex(i: number): Mat3 {
        let particle = this.model.particles[i];
        return Mat3.Translation2D(particle.position).times(Mat3.Scale2D(particle.radius));
    }

    /**
     * Returns the color for particle i
     * You can also customize this, but it's usually cleaner to customize how the color property of each particle is set in your model.
     * @param i
     * @returns {Color}
     */
    getColorForParticleIndex(i: number): Color {
        return this.model.particles[i].color;
    }

    update(args: any): void {
        this.setTransform(this.model.transform);
    }

    /**
     * This will be triggered when the corresponding model calls `signalParticlesUpdated()`.
     * @param args
     */
    updateParticles(...args:any[]) {
        for(let i=0;i<this.model.particles.length;i++){
            if(!this.model.particles[i].visible){
                this.particlesElement.setMatrixAt(i, Mat3.Zeros());
            }else {
                //  if you want to use particle opacity, you must update the particles using the following function
                this.particlesElement.setMatrixAndColorAt(i, this._getTransformForParticleIndex(i), this._getColorForParticleIndex(i), true);

                // If you aren't using opacity, you can use the following functions
                // this.particlesElement.setColorAt(i, this._getColorForParticleIndex(i));
                // this.particlesElement.setMatrixAt(i, this._getTransformForParticleIndex(i));
            }
        }

        // Once the transformations and colors have been updated, you need to indicate that the new data should be pushed to the GPU for rendering.
        this.particlesElement.setNeedsUpdate();
        this.update([]);
    }
}
