import {Polygon2DView} from "../../../anigraph/starter/nodes/polygon2D";
import {PianoKeyModel} from "./PianoKeyModel";
import {PianoKeyLabelGraphic} from "./PianoKeyLabelGraphic";

const WHITE_LABEL_BASE = "#1a1f2b";
const WHITE_LABEL_ACTIVE = "#0b3a8d";
const WHITE_LABEL_BG = "rgba(13, 58, 141, 0.08)";
const WHITE_LABEL_BG_ACTIVE = "rgba(13, 58, 141, 0.18)";
const BLACK_LABEL_BASE = "#f4f7ff";
const BLACK_LABEL_ACTIVE = "#fbfdff";
const BLACK_LABEL_BG = "rgba(255, 255, 255, 0.18)";
const BLACK_LABEL_BG_ACTIVE = "rgba(168, 214, 255, 0.32)";

export class PianoKeyView extends Polygon2DView {
    protected labelGraphic?: PianoKeyLabelGraphic;

    get model(): PianoKeyModel {
        return this._model as PianoKeyModel;
    }

    init(): void {
        super.init();
        if (typeof document === "undefined") {
            return;
        }
        this.labelGraphic = new PianoKeyLabelGraphic(this.model.definition.label, {
            color: this.getBaseLabelColor(),
            backgroundColor: this.getBaseLabelBackground(),
            shadowColor: this.model.definition.isSharp ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
            shadowBlur: this.model.definition.isSharp ? 6 : 4
        });
        this.labelGraphic.setScale(this.labelWidth(), this.labelHeight());
        this.positionLabel();
        this.updateLabelVisuals();
        this.registerAndAddGraphic(this.labelGraphic);
    }

    update(): void {
        super.update();
        if (!this.labelGraphic) {
            return;
        }
        this.labelGraphic.setScale(this.labelWidth(), this.labelHeight());
        this.positionLabel();
        this.updateLabelVisuals();
    }

    private rendererAspect(): number {
        const renderer = this.controller?.renderer;
        if (!renderer) {
            return 1;
        }
        const canvas = renderer.domElement;
        const width = canvas?.clientWidth ?? 0;
        const height = canvas?.clientHeight ?? 0;
        if (width <= 0 || height <= 0) {
            return 1;
        }
        return width / height;
    }

    private labelSize(): number {
        const baseDimension = Math.min(this.model.layoutWidth, this.model.layoutHeight);
        const base = this.model.definition.isSharp ? baseDimension * 0.9 : baseDimension * 0.8;
        return base * 1.5;
    }

    private labelWidth(): number {
        const aspect = this.rendererAspect();
        return aspect > 0 ? this.labelSize() / aspect : this.labelSize();
    }

    private labelHeight(): number {
        return this.labelSize();
    }

    private positionLabel() {
        if (!this.labelGraphic) return;
        const yOffset = this.model.definition.isSharp ? -this.model.layoutHeight * 0.1 : -this.model.layoutHeight * 0.38;
        const zOffset = this.model.definition.isSharp ? 0.015 : 0.01;
        this.labelGraphic.setPosition(0, yOffset, zOffset);
    }

    private getBaseLabelColor(): string {
        return this.model.definition.isSharp ? BLACK_LABEL_BASE : WHITE_LABEL_BASE;
    }

    private getActiveLabelColor(): string {
        return this.model.definition.isSharp ? BLACK_LABEL_ACTIVE : WHITE_LABEL_ACTIVE;
    }

    private getBaseLabelBackground(): string {
        return this.model.definition.isSharp ? BLACK_LABEL_BG : WHITE_LABEL_BG;
    }

    private getActiveLabelBackground(): string {
        return this.model.definition.isSharp ? BLACK_LABEL_BG_ACTIVE : WHITE_LABEL_BG_ACTIVE;
    }

    private updateLabelVisuals() {
        if (!this.labelGraphic) return;
        const label = this.model.definition.label;
        const isActive = this.model.isActive;

        this.labelGraphic.setText(label, {
            color: isActive ? this.getActiveLabelColor() : this.getBaseLabelColor(),
            backgroundColor: isActive ? this.getActiveLabelBackground() : this.getBaseLabelBackground(),
            shadowColor: this.model.definition.isSharp ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
            shadowBlur: this.model.definition.isSharp ? (isActive ? 8 : 6) : (isActive ? 5 : 4)
        });
        this.labelGraphic.setOpacity(1);
    }
}
