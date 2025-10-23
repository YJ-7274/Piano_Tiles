import {Layout} from "./style";
import {CatamariSceneModel} from "./CatamariSceneModel";
import React from "react";

type CatamariComponentProps = {
    model?: CatamariSceneModel,
    children?: React.ReactNode;
};
export function CatamariComponent(props: CatamariComponentProps) {
    return (
        <div>
            <Layout>
                <div className={"container-fluid"}>
                    <div className={"row"}>
                        {props.children}
                    </div>
                </div>
            </Layout>
        </div>
    );
}
