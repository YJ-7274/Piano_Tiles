import {Mat4, Vec2, Vec3, VectorBase} from "../../math";
import {AParticle} from "./AParticle";

export abstract class ABasicParticle<InterfaceType extends VectorBase, StoredType extends VectorBase> implements AParticle<InterfaceType>{
    mass:number=1;
    protected _position!:StoredType;
    abstract get position():InterfaceType;
    abstract set position(v:InterfaceType|StoredType);
    protected _radius:number=1;
    get radius(){return this._radius;}
    set radius(v:number){this._radius = v;}
    protected _id:number=0;
    get id(){return this._id;}
    protected _visible:boolean=false;
    get visible(){
        return this._visible;
    }
    show(){
        this._visible=true;
    }
    hide(){
        this._visible=false;
    }
}

export abstract class PhysicalParticle<InterfaceType extends VectorBase, StoredType extends VectorBase> extends ABasicParticle<InterfaceType, StoredType>{
    public _velocity!:StoredType;
    abstract get velocity():InterfaceType;
    abstract set velocity(v:InterfaceType|StoredType);
    mass:number=1;
}


export class Basic3DParticle extends ABasicParticle<Vec3, Vec3>{
    get position(){
        return this._position;
    }
    set position(v:Vec3){
        this._position = v;
    }
}

export class AParticle3DOther extends PhysicalParticle<Vec3, Vec3>{
    get position(){
        return this._position;
    }
    set position(v:Vec3){
        this._position = v;
    }

    _velocity!:Vec3
    get velocity(): Vec3 {
        return this._velocity;
    }
    set velocity(v:Vec3){
        this._velocity=v;
    }



}

export class Basic2DParticle extends ABasicParticle<Vec2, Vec3>{
    projection!:Mat4;
    get position(){
        return this._position.xy;
    }
    set position(v:Vec2){
        this._position = new Vec3(v.x, v.y, 1);
    }
    set position3D(v:Vec3){
        this._position = v;
    }
    get position3D(){return this._position;}
}
