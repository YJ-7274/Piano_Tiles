import React from "react";
import {AGLRenderWindow, AThreeJSContextComponent} from "../anigraph";

type VisualizationComponentProps = {
    renderWindow:AGLRenderWindow;
    name:string;
    children?: React.ReactNode;
}

export function MainComponent(props: VisualizationComponentProps) {
    return (
            <div className={"card"}>
                <h3 className={"card-header"}>
                    {/*{props.name}*/}
                    {props.children}
                </h3>
                <div className={"card-body"}>
                    <AThreeJSContextComponent renderWindow={props.renderWindow}/>
                </div>
                <div className={"card-body scene-description"}>
                </div>
            </div>
    )
}
