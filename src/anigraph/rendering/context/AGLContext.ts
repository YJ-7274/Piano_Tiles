/**
 * @file Manages the configuration settings for the widget.
 * @author Abe Davis
 * @description Defines the AGLContext class, which is a wrapper on the THREE.WebGLRenderer class with convenience functions.
 */
import {AObject, ASerializable} from "../../base";
import * as THREE from "three";
import * as WebGLRenderer from "three/src/renderers/WebGLRenderer";
import {Vector2} from "three";
import {Vec2} from "../../math";

const _DEFAULT_WEBGLRENDERER_PARAMS = {
  alpha: true,
  preserveDrawingBuffer: true,
};

@ASerializable("AGLContext")
export class AGLContext extends AObject {
    public renderer!: THREE.WebGLRenderer;
    static DEFAULT_SETTINGS = _DEFAULT_WEBGLRENDERER_PARAMS;
    constructor(contextParams?: WebGLRenderer.WebGLRendererParameters) {
        super();
        // this.container=container;
        this.renderer = new THREE.WebGLRenderer(
            {
                ...AGLContext.DEFAULT_SETTINGS,
                ...(contextParams ?? {})
            }
        );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.sortObjects = false;
    }

    getShape(){
        let rsize = new Vector2();
        this.renderer.getSize(rsize);
        return new Vec2(rsize.x, rsize.y);
    }

    getAspect(){
        let shape = this.getShape();
        return shape.x/shape.y;
    }

}
