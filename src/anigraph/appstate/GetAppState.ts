import {GetAAppState} from "./AAppState";
import {AppState} from "./AppState";

export function GetAppState(){
    return GetAAppState() as AppState;
}
