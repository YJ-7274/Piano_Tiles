import {Color, Particle2D, V2, Vec2} from "../../../../anigraph";

/**
 * Our custom 2D particle class. It must implement the Particle2D interface, which means it has `position`, `depth`, and `visible` properties.
 * You can customize your particle class with additional properties and functions.
 */
export class Custom2DParticle implements Particle2D{
    mass:number;
    position:Vec2;
    velocity:Vec2;
    visible:boolean=true;
    radius:number;
    depth:number=0;
    color:Color;

    /**
     * You can show or hide particles by setting their `visible` parameter.
     * This is important, because with instanced particles, you will need to create all the particles you plan to use up front so that the GPU can allocate the appropriate resources. This means that if you want fewer than this maximum number, you just hide the particles you aren't using.
     */
    show(){
        this.visible = true;
    }
    hide(){
        this.visible = false;
    }

    constructor(position?:Vec2, velocity?:Vec2, mass?:number, radius?:number){
        this.position = position??V2();
        this.velocity = velocity??V2();
        this.mass = mass??1;
        this.radius = radius??1;
        this.color = Color.Random();
        this.visible = true;
    }
}

