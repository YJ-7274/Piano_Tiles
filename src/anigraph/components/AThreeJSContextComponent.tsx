import React, {useEffect, useRef, useState} from "react";
import {AGLContext, AGLRenderWindow} from "../rendering";
import {ASceneController} from "../scene";

type AThreeJSContextComponentProps = {
    renderWindow:AGLRenderWindow
    children?: React.ReactNode
}

export function AThreeJSContextComponent(props:AThreeJSContextComponentProps) {
    const container = useRef(null as unknown as HTMLDivElement);
    useEffect(() => {
        props.renderWindow.setContainer(container.current);
        props.renderWindow.startRendering();
    });
    return (
        <div className="canvas anigraph-parent">
            <div
                className="anigraphcontainer"
                ref={container}
                key={props.renderWindow.uid}
                >
                {props.children}
            </div>
        </div>
    );
}
