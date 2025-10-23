import {GetAppState} from "../anigraph";

export function addExampleControlPanelControls(){
    /**
     * Get the app state, which is where the control panel variables live
     * @type {AppState}
     */
    const appState = GetAppState();
    appState.addSliderControl("ExampleSlider", 0, -1, 1, 0.001);
    appState.addButton("Button", ()=>{
        console.log("Button pressed!")
    })

    /**
     * How to add dropdown controls to control pannel.
     * Start by defining a dictionary that maps what the control panel option will be (a string) to different objects that should be returned on changes.
     */
    // let dropdown_options:{[key:string]:any} = {
    //     a:1,
    //     b:2,
    //     c:3
    // }
    let dropdownOptionKeys = [
        "a", "b", "c", "d", "e", "f", "g"
        ];
    appState.setGUIControlSpecKey(
        "Dropdown",
        {
            /**
             * Options are the
             */
            options: dropdownOptionKeys,
            value: dropdownOptionKeys[0],

            /**
             * when the dropdown changes, this function will be triggered with the new value as its argument
             * @param selected
             */
            onChange:(selected:any)=>{
                console.log(selected)
            }
        }
    )

    /**
     * Add toggle control to control pannel
     */
    appState.setGUIControlSpecKey(
        "Toggle",
        {
            value: true,
            onChange:(value:any)=>{
                console.log(value);
            }
        }
    )

}
