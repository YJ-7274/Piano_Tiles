import {ACallbackSwitch, AObject, ASerializable} from "../base";
import {Color} from "../math/Color";
import {AHandlesEvents} from "../base/aobject/AHandlesEvents";
import {v4 as uuidv4} from "uuid";
import {proxy} from "valtio/vanilla";
import {folder} from "leva";
import {ConfirmInitialized} from "../scene/ConfirmInitialized";
import {Mutex} from "async-mutex";
import {ClassInterface} from "../basictypes";
import {AppStateValueChangeCallback} from "../basictypes";
import {GUISpecs, GUIControlSpec} from "../GUISpecs";
import {AniGraphDefines, TextureProvidedKeyForName} from "../defines";

var _appState:AAppState;



export function SetAppState(appState:AAppState):AAppState{
    if(_appState !== undefined){
        throw new Error(`Already set the app state to ${_appState}`);
    }
    _appState = appState;
    _appState.init();
    return _appState;
}

// enum AppStateKeys{
//     InteractionMode="InteractionMode",
//     GUI_KEY=,
//     AmbientLight="ambient"
// }

const _GUI_KEY_KEY_INDEX="GUI_KEY";

export enum AppStateEvents{
    TRIGGER_CONTROL_PANEL_UPDATE='TRIGGER_CONTROL_PANEL_UPDATE'
}

@ASerializable("AAppState")
export abstract class AAppState extends AHandlesEvents{
    name:string="App";
    stateValues:{[name:string]:any};
    GUIControlSpecs:{[name:string]:GUIControlSpec}={};
    _initMutex:Mutex;
    static AppStateEvents=AppStateEvents
    static _GUI_KEY_INDEX = _GUI_KEY_KEY_INDEX;


    globalScale:number=AniGraphDefines.DefaultGlobalScale;
    zNear:number=AniGraphDefines.DefaultZNear;
    zFar:number=AniGraphDefines.DefaultZFar;
    orthoZNear:number=AniGraphDefines.DefaultOrthoZNear;
    orthoZFar:number=AniGraphDefines.DefaultOrthoZFar;



    init(){}
    /** Get set guiKey */
    set _guiKey(value){this.stateValues[_GUI_KEY_KEY_INDEX]=value;}
    get _guiKey(){return this.stateValues[_GUI_KEY_KEY_INDEX];}

    getState(key:string){
        if(key in this.stateValues) {
            return this.stateValues[key];
        }else{
            return undefined;
        }
    }

    setState(name:string, value:any){
        this.stateValues[name]=value;
        this.signalEvent(AAppState.GetEventKeyForName(name), value);
    }

    constructor() {
        super();
        this._initMutex = new Mutex();
        this.stateValues=proxy({});
        this.setState(_GUI_KEY_KEY_INDEX, uuidv4());
    }

    get initMutex(){
        return this._initMutex;
    }




    updateControlPanel(){
        this.signalEvent(AAppState.AppStateEvents.TRIGGER_CONTROL_PANEL_UPDATE);
    }

    addControlPanelListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(AAppState.AppStateEvents.TRIGGER_CONTROL_PANEL_UPDATE, callback, handle);
    }


    _GetOnChangeForName(parameterName:string):AppStateValueChangeCallback{
        const self = this;
        return (v:any)=>{
            self.setState(parameterName, v);
        }

    }

    CreateControlPanelCheckboxSpec(stateName:string, value:boolean, otherSpecs?:{[name:string]:any}){
        const self = this;
        return GUISpecs.CheckboxControl(
            self._GetOnChangeForName(stateName),
            value,
            otherSpecs
        )
    }

    CreateControlPanelSliderSpec(stateName:string, initialValue:any, min?:number, max?:number, step?:number, otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        return GUISpecs.SliderControl(
            self._GetOnChangeForName(stateName),
            initialValue,
            min??Math.min(initialValue, 0.0),
            max??Math.max(initialValue, 1.0),
            step,
            otherSpecs
        )
    }

    CreateControlPanelColorPickerSpec(stateName:string, initialValue:Color, otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        return GUISpecs.ColorControl(
            self._GetOnChangeForName(stateName),
            initialValue,
            otherSpecs
        );
    }


    CreateControlPanelButtonSpec(callback:()=>void, otherSpecs?:{[name:string]:any}):GUIControlSpec{
        return GUISpecs.ButtonControl(callback, otherSpecs);
    }

    CreateControlPanelSelectionSpec(stateName:string, initialValue:any, options:any[], otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        return GUISpecs.SelectionControl(
            (v: string) => {
                self._GetOnChangeForName(stateName)(v);
            },
            options,
            initialValue,
            otherSpecs
        )
    }


    static GetEventKeyForName(name:string):string{
        return `Parameter_${name}_update_event`;
    }

    setGUIControlSpecKey(name:string, spec:GUIControlSpec){
        this.GUIControlSpecs[name]= spec;
        this.updateControlPanel();
    }

    // setGUIControlSpecKeyGroup(name:string, spec:GUIControlSpec){
    //     this.GUIControlSpecs[name]= folder();
    //     this.updateControlPanel();
    // }

    addSliderControl(name:string, initialValue:any, min?:number, max?:number, step?:number){
        this.setGUIControlSpecKey(name, this.CreateControlPanelSliderSpec(name, initialValue, min, max, step))
    }

    addCheckboxControl(name:string, value:boolean){
        this.setGUIControlSpecKey(name, this.CreateControlPanelCheckboxSpec(name, value))
        // this.setUniform(TextureProvidedKeyForName(name), !!tex, 'bool');
    }

    /**
     * Add a button that triggers a provided callback
     * @param name
     * @param callback
     */
    addButton(name:string, callback:()=>void){
        this.setGUIControlSpecKey(name, this.CreateControlPanelButtonSpec(callback));
    }

    addColorControl(name:string, initialValue:Color){
        this.setGUIControlSpecKey(name,this.CreateControlPanelColorPickerSpec(name, initialValue));
    }

    setSelectionControl(name:string, initialValue:any, options:any[], otherSpecs?:{[name:string]:any}){
        this.setGUIControlSpecKey(name,this.CreateControlPanelSelectionSpec(name, initialValue, options, otherSpecs));
    }

    /**
     * Adds a listener to app state with a particular name. The provided callback will be triggered whenever the app state with that name signals a change.
     * @param {string} stateName
     * @param {AppStateValueChangeCallback} callback
     * @param {string} handle
     * @returns {AEventCallbackSwitch}
     */
    addStateValueListener(
        stateName: string,
        callback: AppStateValueChangeCallback,
        handle?: string
    ) {
        return this.addEventListener(
            AAppState.GetEventKeyForName(stateName),
            callback,
            handle,
            );
    }




    addControlSpec(controlSpec:{[name:string]:GUIControlSpec}){
        this.GUIControlSpecs = {
            ...this.GUIControlSpecs,
            ...controlSpec
        };
    }

    _GetUniqueFolderName(name:string){
        if(name in this.GUIControlSpecs){
            let ntries = 1;
            let rname = name+`${ntries}`
            while(rname in this.GUIControlSpecs){
                ntries++;
                rname = name+`${ntries}`
            }
            return rname;
        }else{
            return name;
        }
    }

    /**
     * Adds a folder of control specs
     * @param name the name of the folder
     * @param spec the spec
     * @param addFolderNameToKeys if true (default) will automatically add the folder name to the end of each individual
     * spec item. This is because leva expects unique keys for each control, even if they are in different folders
     * @param collapsed whether the folder is collapsed by default
     */
    addControlSpecGroup(name:string, spec:GUIControlSpec, addFolderNameToKeys=true, collapsed=true){
        this.GUIControlSpecs[name] = GUISpecs.MakeFolder(name, spec, addFolderNameToKeys, collapsed);
        this.updateControlPanel();
    }

    updateControlSpecEntry(name:string, spec:GUIControlSpec){
        this.GUIControlSpecs[name]=spec;
        this.updateControlPanel();
    }

    /**
     * A helper function that will check whether the control panel currently has a given slider control in it.
     * If the control is not there, then we will add it with the provided parameters.
     * @param name
     * @param initialValue: initial value for app state
     * @param min: minimum value of slider
     * @param max: maximum value of slider
     * @param step: step size of slider
     */
    addSliderIfMissing(name:string, initialValue?:number, min?:number, max?:number, step?:number){
        if(this.getState(name)===undefined){
            this.addSliderControl(name, initialValue??1.0, min, max, step);
        }
    }

}

export function CheckAAppState():AAppState|undefined{
    return _appState;
}

export function GetAAppState(){
    let appState = CheckAAppState();
    if(appState===undefined){
        throw Error("No App State!")
    }
    return appState;
}
