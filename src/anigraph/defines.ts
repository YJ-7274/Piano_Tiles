export function TextureKeyForName(name: string) {
    return name + "Map";
}
export function TextureProvidedKeyForName(name: string) {
    return name + "MapProvided";
}
export function TextureSizeKeyForName(name: string) {
    return name + "Size";
}

export const ANIGRAPH_DEBUG_MODE = false;

export enum AniGraphDefines {
    DefaultGlobalScale = 10.0,
    DefaultZNear = 0.001,
    DefaultZFar = 50,
    DefaultOrthoZNear= -5,
    DefaultOrthoZFar = 5,
}

export enum BlinnPhongDefaults{
    Ambient=0.02,
    Diffuse = 0.3,
    Specular=0.01,
    SpecularExp=5.0
}

