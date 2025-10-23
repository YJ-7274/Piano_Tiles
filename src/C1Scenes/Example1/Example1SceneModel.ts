import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {Polygon2DModel} from "../../anigraph/starter/nodes/polygon2D";
import {AMaterial, AppState, Color, DefaultMaterials, GetAppState, Mat3, Polygon2D, V2} from "../../anigraph";
import {Polygon2DModelPRSA} from "../../anigraph/starter/nodes/polygon2D/Polygon2DModelPRSA";
import {CustomPolygon2DModel, CustomPolygon2DPRSAModel} from "./CustomPolygon2DModel";
import {CustomPolygon2DMat3Model} from "./CustomPolygon2DModel";

/**
 * These will be options to choose from in our example drop-down widget of the control panel.
 * @type {string[]}
 */
const SelectionOptions = [
    "Option 1",
    "Option 2",
    "Option 3"
]


export class Example1SceneModel extends App2DSceneModel{

    nChainLinks = 5;


    /**
     * This will be a list of polygon models that we will use to make up our scene
     * @type {Polygon2DModel[]}
     */
    polygons:CustomPolygon2DModel[] = []

    /**
     * A material for drawing polygons
     * @type {AMaterial}
     */
    polygonMaterial!:AMaterial;

    /**
     * This will add variables to the control pannel.
     * You can add sliders and color pickers and drop down menus (oh my!).
     *
     * @param appState
     */
    initAppState(appState:AppState){
        // Adding a slider for an app state called "PolygonScale" with initial value 1, min 0, max 5, and step size 0.001
        appState.addSliderIfMissing("PolygonScale", 1, 0, 5, 0.001);

        appState.addSliderIfMissing("Spikiness", 0, 0, 1, 0.001);
        appState.addSliderIfMissing("PolygonRotation", 0, -2*Math.PI, 2*Math.PI, 0.001);

        // Adding a color picker to control a color stored in app state with key "ColorValue1"
        appState.addColorControl("ColorValue1", Color.FromString("#123abe"));

        // Dropdown menus with options are a bit more annoying but also doable...
        appState.setSelectionControl(
            "ExampleDropDown",
            "Option 1",
            SelectionOptions
        )

        for(let i=0; i<this.nChainLinks;i++){
            appState.addSliderIfMissing(`Link${i}Rotation`, 0, -2*Math.PI, 2*Math.PI, 0.001);
        }
    }

    /**
     * Use this function to initialize the content of the scene.
     * Generally, this will involve creating instances of ANodeModel subclasses and adding them as children of the scene:
     * ```
     * let myNewModel = new MyModelClass(...);
     * this.addChild(myNewModel);
     * ```
     *
     * You may also want to add tags to your models, which provide an additional way to control how they are rendered
     * by the scene controller. See example code below.
     */
    initScene(){
        let appState = GetAppState();

        // Initialize a material to use for drawing colored polygons
        this.polygonMaterial = appState.CreateMaterial(DefaultMaterials.RGBA_SHADER);


        /**
         * We can define functions inside of other functions. Here we will use this to define a function that generates
         * the geometry for a k-spiked polygon. Take note that you need to define your polygon vertices in the right
         * order. In this example, if you traverse the vertices in the counter-clockwise order the geometry will come
         * out wrong!
         *
         * @param k
         * @param spikiness
         * @param color
         * @returns {Polygon2D}
         */
        function createSpikyGeometry(k:number, spikiness:number=0, color:Color){
            let polygon = Polygon2D.CreateForRendering() // default is hasColors=true, hasTextureCoords=false
            // color = color??appState.getState("ColorValue1");
            let spikeScale = 1-spikiness;
            for(let v=0;v<k;v++){
                let theta_step = -2*Math.PI/k; // The sign matters here!
                let theta = v*theta_step;
                let thetab = (v+0.5)*theta_step;
                polygon.addVertex(V2(Math.cos(theta), Math.sin(theta)), color);
                polygon.addVertex(V2(Math.cos(thetab), Math.sin(thetab)).times(spikeScale), color);
            }
            return polygon;
        }

        // Now let's create a polygon with spiky geometry
        let newPolygon = new CustomPolygon2DMat3Model(createSpikyGeometry(10, appState.getState("Spikiness"), appState.getState("ColorValue1")));

        // We set its material to be the simple RGB material
        newPolygon.setMaterial(this.polygonMaterial);

        // Now we add it as a child of our scene model
        this.addChild(newPolygon);


        // Here we will create a hierarchy of linked polygons. We will be able to control them using the rotation
        // sliders like an articulated object
        let links:Polygon2DModelPRSA[] = [];
        let lastParent:CustomPolygon2DModel = newPolygon;
        for(let i=0; i<this.nChainLinks;i++){
            let newLink = new CustomPolygon2DPRSAModel(createSpikyGeometry(3, 0.75, Color.Random()));
            newLink.setMaterial(this.polygonMaterial);
            newLink.transform.anchor = V2(1.2,0);
            links.push(newLink);
            lastParent.addChild(newLink);
            lastParent = newLink;
            // Here we hook up the slider for Child1Rotation
            this.subscribe(appState.addStateValueListener(`Link${i}Rotation`, (newValue)=>{
                links[i].transform.rotation = newValue;
            }), `Link${i}RotationSubscription`);
        }

        // We can't use "this" to refer to our scene model from inside of callbacks, because those callbacks will be called
        // later and elsewhere (when "this" is no longer the scene model). So we will create a new variable that we can
        // use to refer to the scene model from within callbacks.
        const self = this;

        // Here we subscribe to the "ColorValue1" App state control that we created in `initAppState` above
        this.subscribe(appState.addStateValueListener("ColorValue1", (newValue)=>{
            newPolygon.setUniformColor(newValue); // Set the color of our polygon geometry to be the selected color
            newPolygon.signalGeometryUpdate(); // signal that the geometry of our polygon has changed so that the view will update
        }), "ColorSubscription")

        // If you want to unsubscribe the callback that we added, you can do so by calling `unsubscribe` with the subscription handle we used above
        // this.unsubscribe("ColorSubscription")

        // Here we subscribe to the "PolygonScale" App state control that we created in `initAppState` above
        this.subscribe(appState.addStateValueListener("PolygonScale", (newValue)=>{
            let rotation = appState.getState("PolygonRotation");
            newPolygon.setTransform(Mat3.Rotation(rotation).times(Mat3.Scale2D(newValue)));
        }), "PolygonScaleSubscription")


        // Here we subscribe to the "PolygonRotation" App state control that we created in `initAppState` above
        this.subscribe(appState.addStateValueListener("PolygonRotation", (newValue)=>{
            let scale = appState.getState("PolygonScale");
            newPolygon.setTransform(Mat3.Rotation(newValue).times(Mat3.Scale2D(scale)));
        }), "PolygonRotationSubscription")

        // Here we subscribe to the "ColorValue1" App state control that we created in `initAppState` above
        this.subscribe(appState.addStateValueListener("Spikiness", (newValue)=>{
            newPolygon.setVerts(createSpikyGeometry(10, appState.getState("Spikiness"), appState.getState("ColorValue1")))
            newPolygon.signalGeometryUpdate(); // signal that the geometry of our polygon has changed so that the view will update
        }), "SpikinessSubscription")

        // Here we add a callback that does different things when you select different options with the dropdown...
        this.subscribe(appState.addStateValueListener("ExampleDropDown",
            (selection:any)=>{
                switch (selection){
                    case SelectionOptions[0]:
                        console.log(SelectionOptions[0]);
                        break;
                    case SelectionOptions[1]:
                        console.log(SelectionOptions[1]);
                        break;
                    case SelectionOptions[2]:
                        console.log(SelectionOptions[2]);
                        break;
                    default:
                        console.log(`Unrecognized selection ${selection}`);
                        break;
                }
            }), "ExampleSelectionSubscription");

    }


    /**
     * This is the function that gets called every time the frame updates. Check other scenes for examples that use the
     * t parameter.
     * @param t
     */
    timeUpdate(t: number) {
        try {
        }catch(e) {
            console.error(e);
        }
    }
}
