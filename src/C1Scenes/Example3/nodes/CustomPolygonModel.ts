import {
    AppState,
    ASerializable,
    Color,
    GetAppState,
    NodeTransform2D,
    Polygon2D,
    TransformationInterface
} from "../../../anigraph";
import {Polygon2DModel} from "../../../anigraph/starter/nodes/polygon2D";
import type {Transformation2DInterface} from "../../../anigraph";

enum AppStateKeys{
    PyramidScale="PyramidScale",
    PyramidRotation="PyramidRotation",
    PyramidProps="PyramidProps",
    PyramidBaseColor="PyramidBaseColor",
}

/**
 * This is kind of starter code for pyramid-kaleidoscope-esque procedural scenes.
 */
@ASerializable("CustomPolygonModel")
export class CustomPolygonModel extends Polygon2DModel{
    static AppStateKeys=AppStateKeys;
    pyramidTransform!:NodeTransform2D;
    color:Color;
    nElements:number=5;

    /**
     * Custom update event. We call this every time one of the slider params changes.
     */
    signalPyramidUpdate(){
        this.signalEvent(CustomPolygonModel.AppStateKeys.PyramidProps);
    }

    /**
     * Helper function to add callbacks that we want to trigger when a pyramid update event happens.
     * @param callback
     * @param handle
     * @returns {AEventCallbackSwitch}
     */
    addPyramidUpdateListener(callback: (...args: any[]) => void, handle?: string){
        return this.addEventListener(CustomPolygonModel.AppStateKeys.PyramidProps, callback, handle);
    }

    /**
     * Adding app state controls to the control panel
     * @param appState
     */
    static initAppState(appState:AppState){
        appState.addSliderIfMissing(CustomPolygonModel.AppStateKeys.PyramidScale, 1, 0, 5, 0.001);
        appState.addSliderIfMissing(CustomPolygonModel.AppStateKeys.PyramidRotation, 1, -2*Math.PI, 2*Math.PI, 0.001);
        appState.addColorControl(CustomPolygonModel.AppStateKeys.PyramidBaseColor, Color.FromString("#123abe"));

        // Add more pops to make things more interesting...
        // you might also consider adding some controls using the click and drag interactions in the scene controller.
    }

    /**
     * You can feed in a Polygon2D to define geometry.
     * @param verts
     * @param transform
     * @param args
     */
    constructor(verts?: Polygon2D, transform?: Transformation2DInterface, ...args: any[]) {
        super(verts, transform, ...args);

        // Get the color from the app state
        this.color = GetAppState().getState(CustomPolygonModel.AppStateKeys.PyramidBaseColor);

        // initialize the transform to the identity.
        this.pyramidTransform = new NodeTransform2D();
        const self = this;

        /**
         * Here we are calling signalPyramidUpdate any time one of the control panel parameters changes
         */
        this.subscribeToAppState(CustomPolygonModel.AppStateKeys.PyramidScale, (v:number)=>{
            self.pyramidTransform.scale = v;
            self.signalPyramidUpdate();
        })
        this.subscribeToAppState(CustomPolygonModel.AppStateKeys.PyramidRotation, (v:number)=>{
            self.pyramidTransform.rotation= v;
            self.signalPyramidUpdate();
        })
        this.subscribeToAppState(CustomPolygonModel.AppStateKeys.PyramidBaseColor, (color:Color)=>{
            self.color = color;
            self.signalPyramidUpdate();
        })
    }
}
