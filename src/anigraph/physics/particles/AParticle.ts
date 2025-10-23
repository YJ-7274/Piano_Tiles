import {Mat4, Vec2, Vec3, VectorBase, VectorType} from "../../math/linalg";

export interface AParticle<V extends VectorType>{
    get position():V;
}
