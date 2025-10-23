/**
 * @file Manages the configuration settings for the widget.
 * @author Abe Davis
 * @description Defines AGLRenderWindow class, which connects an AGLContext with a HTMLElement and provides functionality for window image capture.
 */
import {AObject, AObjectState, ASerializable} from "../../base";
import {AGLContext} from "./AGLContext";
import {ASceneController} from "../../scene";
import {assert} from "../../basictypes";


@ASerializable("AGLRenderWindow")
export class AGLRenderWindow extends AObject {
    @AObjectState isRendering:boolean;
    protected _context!:AGLContext;
    protected _sceneController!:ASceneController;
    protected _frameRequested:boolean=false;
    public container!: HTMLElement;

    protected _recordNextFrame: boolean = false;
    protected _recordNextFrameCallback!: (imageBlob: Blob | null) => void;

    get context(){
        return this._context;
    }

    setContext(context:AGLContext){
        this._context = context;
    }

    initContext(context?:AGLContext){
        if(context){
            this.setContext(context);
        }else{
            if(this.context === undefined){
                this.setContext(new AGLContext());
            }
        }

    }

    get aspect(){
        return this.container.clientWidth/this.container.clientHeight;
    }

    constructor(sceneController:ASceneController, context?:AGLContext){
        super();
        this.isRendering=false;
        this.bindMethods();
        const self = this;
        this.initContext(context);
        assert(sceneController.renderWindow === undefined, "Tried to use scene controller that is already assigned to a window");
        this.setSceneController(sceneController);
        window.addEventListener("resize", ()=>{
            self.sceneController.onWindowResize(self);
        });
    }

    get sceneController(){return this._sceneController;}
    get renderer() {
        return this.sceneController.context.renderer;
    }


    setContainer(container:HTMLElement){
        if(this.container){
            this.container.removeChild(this.sceneController.context.renderer.domElement)
            console.log("New container!!!")
        }
        this.container = container;
        this.container.appendChild(this.sceneController.context.renderer.domElement);
        this.sceneController.context.renderer.setSize(container.clientWidth, container.clientHeight)

    }

    setSceneController(sceneController:ASceneController){
        this._sceneController = sceneController;
        this.sceneController.setRenderWindow(this);
    }

    bindMethods(){
        this.render = this.render.bind(this);
        this._saveSingleFrameCallback = this._saveSingleFrameCallback.bind(this);
    }

    recordNextFrame(callback?:(imageBlob:Blob|null)=>void){
        if(callback===undefined){
            this._recordNextFrameCallback = this._saveSingleFrameCallback;
        }else{
            this._recordNextFrameCallback=callback;
        }
        this._recordNextFrame = true;
    }

    _saveSingleFrameCallback(imageBlob:Blob|null){
        // @ts-ignore
        saveAs(imageBlob, `${this.serializationLabel}.png`);
    }

    stopRendering(){
        this.isRendering = false;
    }

    startRendering(){
        if(!this.isRendering){
            this.isRendering=true;
            this.render();
        }
    }

    render(){
        if(this.isRendering){
            requestAnimationFrame(()=>this.render());
            this._frameRequested=true;
            if(this.sceneController.isInitialized && this.sceneController.isReadyToRender) {
                this.sceneController.onAnimationFrameCallback(this.context);
                if (this._recordNextFrame) {
                    this._recordNextFrame = false;
                    let self = this;
                    this.renderer.domElement.toBlob(function (blob: Blob | null) {
                        self._recordNextFrameCallback(blob);
                    });
                    console.warn("May be using DOM element resolution for saving frame...")
                }
            }
        }
    }
}
