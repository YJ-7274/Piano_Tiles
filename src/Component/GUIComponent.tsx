import React, {useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {AppState} from "../anigraph";

type GUIComponentProps = {
    appState:AppState;
    children?: React.ReactNode;
}


export function GUIComponent(props: GUIComponentProps) {
    const [, setState] = useState(uuidv4());

    useEffect(() => {
        (async () => {
            props.appState.addComponentUpdateListener(() => {
                setState(uuidv4());
            })
        })();
    }, [props.appState]);

    function GUI() {
        let GUIContent = props.appState.getReactGUIContent();
        if (GUIContent) {
            return (
                <React.Fragment>
                    {GUIContent}
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                </React.Fragment>
            )
        }
    }

    const cardstyle = {
        display: "flex",
        padding: "5px",
        height: "100%"
    }
    return (
        <div className={"gui-component-div"}>
            {GUI()}
            {props.children}
        </div>
    )
}



export function GUIBottomComponent(props: GUIComponentProps) {
    const [, setState] = useState(uuidv4());

    useEffect(() => {
        (async () => {
            props.appState.addComponentUpdateListener(() => {
                setState(uuidv4());
            })
        })();
    }, [props.appState]);

    function GUI() {
        let GUIContent = props.appState.getReactGUIBottomContent();
        if (GUIContent) {
            return (
                <React.Fragment>
                    {GUIContent}
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                </React.Fragment>
            )
        }
    }

    const cardstyle = {
        display: "flex",
        padding: "5px",
        height: "100%"
    }
    return (
        <div className={"gui-component-div"}>
            {GUI()}
            {props.children}
        </div>
    )
}
