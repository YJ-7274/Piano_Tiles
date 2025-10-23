import {ASerializable, Color, Polygon2D} from "../../../anigraph";
import {Polygon2DModelPRSA} from "../../../anigraph/starter/nodes/polygon2D/Polygon2DModelPRSA";

export interface PianoKeyDefinition {
    eventKey: string;
    label: string;
    note: string;
    midi: number;
    frequency: number;
    isSharp: boolean;
}

export interface PianoKeyLayout {
    definition: PianoKeyDefinition;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
}

@ASerializable("PianoKeyModel")
export class PianoKeyModel extends Polygon2DModelPRSA {
    readonly definition: PianoKeyDefinition;
    readonly baseColor: Color;
    readonly activeColor: Color;
    readonly layoutWidth: number;
    readonly layoutHeight: number;
    private _active = false;

    constructor(layout: PianoKeyLayout, baseColor: Color, activeColor: Color) {
        super(Polygon2D.ColoredRectangle(layout.width, layout.height, baseColor));
        this.definition = layout.definition;
        this.baseColor = baseColor;
        this.activeColor = activeColor;
        this.layoutWidth = layout.width;
        this.layoutHeight = layout.height;
    }

    setActive(active: boolean): boolean {
        if (this._active === active) {
            return false;
        }
        this._active = active;
        this.setUniformColor(active ? this.activeColor : this.baseColor);
        this.signalGeometryUpdate();
        return true;
    }

    get isActive(): boolean {
        return this._active;
    }
}
