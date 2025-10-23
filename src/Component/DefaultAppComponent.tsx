import React from "react";

type DefaultComponentProps = {
    children?: React.ReactNode;
    model?: any;
};
export function DefaultAppComponent(props: DefaultComponentProps) {
    return (
        <div>
            <div className={"container-fluid"}>
                <div className={"row"}>
                    {props.children}
                </div>
            </div>
        </div>
    );
}
