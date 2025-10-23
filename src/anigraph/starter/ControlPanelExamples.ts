import {AObject, Color, GetAppState} from "../index";


export function AddExampleControlPanelSpecs(subscriber:AObject){
    let appState = GetAppState();
    const self = subscriber;

    /**
     * If you don't need to subscribe/unsubscribe and you aren't accessing anything that will later be deleted in your
     * onChange function, you can specify control panel specs directly as you would with [Leva](https://github.com/pmndrs/leva)
     */
    //<editor-fold desc="Direct specification using Leva (https://github.com/pmndrs/leva) specs">
    appState.setGUIControlSpecKey(
        "DirectControlSpec",
        {
            value:3,
            onChange:(value:any)=>{
                console.log(`DirectControlSpec was changed. New value:${value}`);
                // You can also access the self variable here...
                console.log(self);
            }
        }
    )


    let options = [
        "Op1", "Op2", "Op3"
    ]
    appState.setGUIControlSpecKey(
        "DirectSelectionControl",
        {
            options:options,
            value: options[0],
            onChange:(selected:any)=>{
                console.log(`DirectSelectionControl; ${selected} was selected`);
            }
        }
    )
    //</editor-fold>

    /**
     * Adding app state will let you subscribe to that app state from multiple objects. This means that you can
     * effectively add multiple
     */
    //<editor-fold desc="Adding app state and subscribing to it">

    // Adding a slider for an app state "PolygonScale" with initial value 1, min 0, max 5, and step size 0.001
    appState.addSliderControl("quickSlider", 1, 0, 5, 0.001);
    self.subscribeToAppState("quickSlider", (value:any)=>{
        console.log(`quickSlider: ${value}`);
    }, "quickSliderSubscription")

    // Adding a color picker to control a color stored in app state with key "ColorValue1"
    appState.addColorControl("quickColor", Color.FromString("#123abe"));
    self.subscribeToAppState("quickColor", (color:Color)=>{
        console.log(`quickSlider: ${color}`);
    }, "quickColorSubscription")

    //</editor-fold>


    /**
     * Selection controls are a bit more annoying for subscriptions...
     */
    //<editor-fold desc="Selection control by subscribing to app state">
    const SelectionOptions = [
        "Option 1",
        "Option 2",
        "Option 3"
    ]

    appState.setSelectionControl(
        "ExampleDropDown",
        "Option 1",
        SelectionOptions
    )

    self.subscribe(appState.addStateValueListener("ExampleDropDown",
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
    //</editor-fold>


    //<editor-fold desc="Adding collapsable folders/groups of controls">
    /**
     * Adding a foldable group of specs. You can create app state specs using `CreateControlPanel_type_Spec`
     * or you can define the spec manually (which is sometimes easier because you don't have to subscribe)
     */
    appState.addControlSpecGroup(
        "TestGroup",
        {
            sl1: appState.CreateControlPanelSliderSpec("slider1", 0, 0, 10, 0.1),
            sl2: appState.CreateControlPanelSliderSpec("slider2", 0, -10, 10, 0.1),
            customSpec: {
                value: 2,
                onChange: (value:any)=>{
                    console.log(`Custom input value is:${value}`);
                }
            }
        }
    )
    //</editor-fold>



}
