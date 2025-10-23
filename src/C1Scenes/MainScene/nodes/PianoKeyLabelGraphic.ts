import * as THREE from "three";
import {AGraphicObject, Color} from "../../../anigraph";

type CanvasLike = HTMLCanvasElement;
type CanvasContextLike = CanvasRenderingContext2D;

export interface PianoKeyLabelOptions {
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    /**
     * Font size as a ratio of the texture size (0-1).
     */
    fontSizeRatio?: number;
    /**
     * Padding as a ratio of the texture size (0-0.5).
     */
    paddingRatio?: number;
    textureSize?: number;
    shadowColor?: string;
    shadowBlur?: number;
}

const DEFAULT_LABEL_OPTS: Required<Omit<PianoKeyLabelOptions, "backgroundColor" | "shadowColor" | "shadowBlur">> & {
    backgroundColor: string;
    shadowColor: string;
    shadowBlur: number;
} = {
    color: "#171717",
    backgroundColor: "rgba(0,0,0,0)",
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
    fontWeight: "600",
    fontSizeRatio: 0.62,
    paddingRatio: 0.18,
    textureSize: 512,
    shadowColor: "rgba(0,0,0,0.35)",
    shadowBlur: 6
};

const ensureCanvas = (size: number): CanvasLike | undefined => {
    if (typeof document === "undefined") {
        return undefined;
    }
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return canvas;
};

export class PianoKeyLabelGraphic extends AGraphicObject {
    private readonly sprite: THREE.Sprite;
    private readonly material: THREE.SpriteMaterial;
    private texture?: THREE.CanvasTexture;
    private canvas?: CanvasLike;
    private context?: CanvasContextLike;
    private options: typeof DEFAULT_LABEL_OPTS = {...DEFAULT_LABEL_OPTS};
    private currentText = "";

    constructor(text: string, options?: PianoKeyLabelOptions) {
        super();
        this.material = new THREE.SpriteMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            sizeAttenuation: false
        });
        this.sprite = new THREE.Sprite(this.material);
        this.sprite.center.set(0.5, 0.5);
        this.sprite.renderOrder = 10;

        if (options) {
            this.options = {...this.options, ...options};
        }

        this.configureCanvas();
        this.setText(text);
    }

    private configureCanvas() {
        this.canvas = ensureCanvas(this.options.textureSize);
        if (!this.canvas) {
            return;
        }
        const context = this.canvas.getContext("2d");
        if (!context) {
            this.canvas = undefined;
            return;
        }
        this.context = context;
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.needsUpdate = true;
        this.material.map = this.texture;
        this.material.needsUpdate = true;
    }

    setText(text: string, options?: PianoKeyLabelOptions) {
        this.currentText = text;
        if (options) {
            this.options = {...this.options, ...options};
        }
        if (!this.canvas || !this.context || !this.texture) {
            return;
        }

        const size = this.options.textureSize;
        if ((this.canvas as HTMLCanvasElement).width !== size) {
            (this.canvas as HTMLCanvasElement).width = size;
            (this.canvas as HTMLCanvasElement).height = size;
        }

        const ctx = this.context;
        ctx.clearRect(0, 0, size, size);

        if (this.options.backgroundColor && this.options.backgroundColor !== "rgba(0,0,0,0)") {
            ctx.fillStyle = this.options.backgroundColor;
            const padding = size * this.options.paddingRatio;
            const boxSize = size - padding * 2;
            ctx.beginPath();
            ctx.rect(padding, padding, boxSize, boxSize);
            ctx.fill();
        }

        if (this.options.shadowBlur > 0) {
            ctx.shadowColor = this.options.shadowColor;
            ctx.shadowBlur = this.options.shadowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = size * 0.02;
        } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = this.options.color;
        const fontSize = this.options.fontSizeRatio * size;
        ctx.font = `${this.options.fontWeight} ${fontSize}px ${this.options.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, size / 2, size / 2);

        this.texture.needsUpdate = true;
    }

    setColor(color: Color | string) {
        const value = typeof color === "string" ? color : color.asThreeJS().getStyle();
        this.setText(this.currentText, {
            ...this.options,
            color: value
        });
    }

    setOpacity(opacity: number) {
        this.material.opacity = opacity;
    }

    setScale(width: number, height: number) {
        this.sprite.scale.set(width, height, 1);
    }

    setPosition(x: number, y: number, z: number = 0) {
        this.sprite.position.set(x, y, z);
    }

    get threejs(): THREE.Object3D {
        return this.sprite;
    }

    dispose(): void {
        if (this.texture) {
            this.texture.dispose();
        }
        this.material.map = null;
        this.material.dispose();
        this.sprite.removeFromParent();
    }
}
