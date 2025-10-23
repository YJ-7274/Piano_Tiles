import {Color, V2, Vec2, VectorBase} from "../../math";
import {AParticle} from "./AParticle";


export interface Particle2D extends AParticle<Vec2>{
    position:Vec2;
    depth:number;
    visible?:boolean;
}

export interface Particle2DProperties extends Particle2D{
    velocity?:Vec2;
    mass?:number;
    size?:number|VectorBase;
    color?:Color;
    get id():number|string;
}

export class AParticle2D implements Particle2D{
    protected _id!:number;
    position:Vec2;
    visible:boolean=true;
    size:number;
    depth:number=0;

    get radius(){
        return this.size*0.5;
    }



    /** Get set id */
    set id(value){this._id = value;}
    get id(){return this._id;}

    get hidden(){
        return !this.visible;
    }

    show(){
        this.visible=true;
    }
    hide(){
        this.visible=false;
}

    constructor(properties?:Particle2DProperties){
        if(properties !== undefined){
            this.position = properties.position??V2();
            this.size = properties.size?(properties.size as number):1;
            this.depth = properties.depth??0;
        }else{
            this.position = V2();
            this.size = 1;
            this.depth = 0;
        }
    }
}


export class AParticle2DEuler extends AParticle2D{
    velocity:Vec2;
    mass:number=1;
    constructor(properties?:Particle2DProperties) {
        super(properties);
        if(properties !== undefined){
            this.velocity = properties.velocity??V2();
            this.mass = (properties.mass !== undefined)?properties.mass:1;
        }else{
            this.velocity = V2();
            this.mass = 1;
        }
    }

}


