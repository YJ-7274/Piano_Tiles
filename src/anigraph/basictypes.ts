import {folder} from "leva";

export type Constructor<T> = new (...args: any[]) => T;
export type CallbackType = (...args: any[]) => any;
export type GenericDict = { [name: string]: any };

export interface ClassInterface<InstanceClass> extends Function {
  new (...args: any[]): InstanceClass;
}


export const enum SHADER_UNIFORM_TYPES{
  FLOAT,
  INT,
  VEC2,
  VEC3,
  VEC4,
  COLOR3,
  COLOR4,
  MAT2,
  MAT3,
  MAT4,
  CUSTOM
}

export type AppStateValueChangeCallback =(v:any)=>void;

export const BasicDiffuseShaderAppState = {
  Ambient:"ambient",
  Diffuse:"diffuse",
}


export const  BlinnPhongShaderAppState = {
  ...BasicDiffuseShaderAppState,
  Specular:"specular",
  SpecularExp:"specularExp"
}

export function assert(x:any, message?:string){
  if(!x){
    console.warn(message);
    throw new Error(`ASSERT ERROR: ${message}`);
  }
}
