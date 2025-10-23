



export interface HasLinearOperations<T>{
    times(factor:number):T,
    plus(other:T):T,
    minus(other:T):T,
}


