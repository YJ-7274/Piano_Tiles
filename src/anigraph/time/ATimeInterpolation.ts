import {AObject, ASerializable} from "../base";
import {AClock} from "./AClock";
import {HasLinearOperations} from "../math/linalg/HasLinearOperations";
import {BezierTween} from "../geometry";
import {assert} from "../basictypes";

const TIME_LISTENER_HANDLE="TIME_LISTENER_HANDLE";



@ASerializable("ATimeInterpolationBase")
export abstract class ATimeInterpolationBase<V extends HasLinearOperations<any>> extends AObject{
    constructor(...args:any[]) {
        super();
        this.tween = BezierTween.Linear;

    }
    /** Get start and end time */
    abstract get startTime():number;
    abstract get endTime():number;

    /** Get start and end values */
    abstract startValue:V;
    abstract endValue:V;

    tween!:BezierTween;

    getValueForTime(t:number):V{
        let x = (t-this.startTime)/(this.endTime-this.startTime);
        let y = this.tween.eval(x);
        return this.startValue.plus(this.endValue.minus(this.startValue).times(y));
    }
}


@ASerializable("Tween")
export abstract class Tween<V extends HasLinearOperations<any>> extends ATimeInterpolationBase<V>{
    protected _startValue!:V;
    get startValue(){
        return this._startValue;
    }
    protected _endValue!:V;
    get endValue(){
        return this._endValue;
    }
}


enum TimeFilterType{
    HAS_START="HAS_START",
    HAS_END="HAS_END"
}


interface ValueAccessor<V>{
    get:()=>V,
    set:(v:V)=>void
}

@ASerializable("ATimeFilter")
export class ATimeFilter<V extends HasLinearOperations<any>> extends ATimeInterpolationBase<V>{
    static FilterTypes=TimeFilterType;
    // filterType:TimeFilterType=TimeFilterType.HAS_START;


    lastTimeUpdated:number=0;
    latency:number=1;


    get startTime(): number {
        return this.lastTimeUpdated;
    }
    get endTime():number{
        return this.lastTimeUpdated+this.latency;
    }

    setTarget(v:V){
        this.endValue=v;
    }

    constructor(
        latency:number=1,
        ...args:any[]
    ) {
        super(0,latency);
    }

    setStartValueAccessor(getter:()=>V,setter:(v:V)=>void){
        if(this._startValue!==undefined){throw new Error("Cant set start value accessor when start value already set")}
        this._getStartValue=getter;
        this._setStartValue=setter;
    }
    setEndValueAccessor(getter:()=>V,setter:(v:V)=>void){
        if(this._endValue!==undefined){throw new Error("Cant set end value accessor when end value already set")}
        this._getEndValue=getter;
        this._setEndValue=setter;
    }

    setStartValue(v:V){
        if(this._setStartValue!==undefined){throw new Error("Cant set start value when accessor already set")}
        this._startValue=v;
    }
    setEndValue(v:V){
        if(this._setEndValue!==undefined){throw new Error("Cant set end value when accessor already set")}
        this._endValue=v;
    }

    _startValue:V|undefined=undefined;
    _getStartValue:(()=>V)|undefined=undefined;
    _setStartValue:((v:V)=>void)|undefined=undefined;

    _endValue:V|undefined=undefined;
    _getEndValue:(()=>V)|undefined=undefined;
    _setEndValue:((v:V)=>void)|undefined=undefined;


    get startValue(){
        if(this._getStartValue!==undefined){
            return this._getStartValue();
        }else if(this._startValue){
            return this._startValue;
        }else{
            throw new Error("Start value not specified")
        }
    }
    set startValue(v:V){
        if(this._setStartValue !== undefined){
            this._setStartValue(v);
        }else {
            this._startValue = v;
        }
    }

    get endValue(){
        if(this._getEndValue!==undefined){
            return this._getEndValue();
        }else if(this._endValue){
            return this._endValue;
        }else{
            throw new Error("End value not specified")
        }
    }
    set endValue(v:V){
        if(this._setEndValue !== undefined){
            this._setEndValue(v);
        }else {
            this._endValue = v;
        }
    }

    updateFilter(t:number){
        let v = this.getValueForTime(t);
        this.startValue=v;
        this.lastTimeUpdated=t;
    }
}




