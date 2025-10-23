import {ANodeModel2D} from "../../../nodeModel";
import {ALineMaterialModel} from "../../../../rendering";

export enum CurveInterpolationModes{
    Linear="Linear",
    CubicBezier="CubicBezier"
}

enum CurveCreationInteractionModeStateKeys{
    CurrentCurve="CurrentCurve"
}

export class Curve2DModel extends ANodeModel2D {
    /**
     * Width/thickness of the spline
     * @type {number}
     */
    lineWidth: number = 0.05;

    /**
     * We will have two interpolation modes: Linear, and CubicBezier.
     * These are set to the enum declared at the top of this file.
     * @type {CurveInterpolationModes}
     */
    static InterpolationModes=CurveInterpolationModes;

    /**
     * Getter and setter for `interpolationMode`, which wraps the protected variable _interpolationMode holding the
     * current interpolation mode for the spline.
     * */
    protected _interpolationMode:CurveInterpolationModes=CurveInterpolationModes.Linear;
    /**
     * When the interpolation mode changes, we need to signal an update of the geometry.
     * @param value
     */
    set interpolationMode(value){
        this._interpolationMode = value;
        this.signalGeometryUpdate();
    }
    get interpolationMode(){return this._interpolationMode;}

    getStrokeMaterial() {
        return ALineMaterialModel.GlobalInstance.CreateMaterial();
    }

    getFrameMaterial() {
        return ALineMaterialModel.GlobalInstance.CreateMaterial();
    }

    constructor() {
        super();
        this.verts.initColorAttribute()
    }
}
