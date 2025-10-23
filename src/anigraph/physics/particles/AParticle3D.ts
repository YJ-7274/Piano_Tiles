import {V3, Vec3} from "../../math";
import {AParticle} from "./AParticle";

export interface Particle3D extends AParticle<Vec3>{
    mass:number;
    position:Vec3;
    velocity:Vec3;
}

export class AParticle3D implements Particle3D{
    mass:number;
    position:Vec3;
    velocity:Vec3;
    visible:boolean=true;
    size:number;

    get hidden(){
        return !this.visible;
    }

    constructor(position?:Vec3, velocity?:Vec3, mass?:number, size?:number){
        this.position = position??V3();
        this.velocity = velocity??V3();
        this.mass = mass??1;
        this.size = size??1;
    }
}



