import {button, folder} from "leva";
import {SHADER_UNIFORM_TYPES} from "./basictypes";
import {Color} from "./math/Color";
import tinycolor from "tinycolor2";

type _GUIControlSpec={[name:string]:any};
export interface GUIControlSpec extends _GUIControlSpec{
}


// export interface GUISliderSpec{
//     name:string,
//     value:any,
//     min?:any,
//     max?:any,
//     step?:any
// }


// export interface ShaderUniformParameterGUISpec{
//     nameInShader: string;
//     nameInGUI:string;
//     dtype:SHADER_UNIFORM_TYPES;
//     spec:GUIControlSpec;
// }

export class GUISpecs{
    static KeyNameInFolder(name:string, folderName:string){
        return name+"_"+folderName;
    }

    static MakeFolder(name:string, spec:GUIControlSpec, addFolderNameToKeys:boolean=true, collapsed:boolean=true){
        let specUse:GUIControlSpec = {};
        if(addFolderNameToKeys){
            for(let k in spec){
                specUse[GUISpecs.KeyNameInFolder(k, name)]=spec[k];
                // specUse[k+"_"+name]=spec[k];
            }
        }else{
            specUse = spec;
        }
        let fspec = folder(
            specUse,
            { collapsed: collapsed }
        )
        return fspec;
    }

    static ColorControl(onChange:(color:Color)=>void, initialValue:Color, otherSpecs?:{[name:string]:any}){
        return {
            value:initialValue.RGBuintAfloat,
            onChange: (v:any)=>{
                return onChange(Color.FromTinyColor(tinycolor(v)))
            },
            ...otherSpecs
        }
    }

    static ButtonControl(callback:()=>void, otherSpecs?:{[name:string]:any}){
        return button(callback, otherSpecs);
    }

    static CheckboxControl(onChange:(value:boolean)=>void, initialValue?:boolean, otherSpecs?:{[name:string]:any}){
        return {
            value:initialValue??false,
            onChange: (v:any)=>{
                return onChange(v);
            },
            ...otherSpecs
        }
    }

    static SliderControl(onChange:(v:number)=>void, initialValue:any, min:number, max:number, step?:number, otherSpecs?:{[name:string]:any}){{
            return {
                value: initialValue,
                onChange: onChange,
                min:min,
                max:max,
                step:step??(max-min)*0.01,
                ...otherSpecs
            }
        }
    }

    static SelectionControl(onChange:(v:string)=>void, options:string[], initialValue:string, otherSpecs?:{[name:string]:any}){
        return {
            value:initialValue,
            options:options,
            onChange:onChange,
            ...otherSpecs
        }
    }
}









// export interface GUIControlSpec extends _GUIControlSpec{
//   value:any;
//   onChange:AppStateValueChangeCallback;
// }
