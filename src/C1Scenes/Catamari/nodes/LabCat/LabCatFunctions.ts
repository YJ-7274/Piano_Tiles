import {CatamariSceneModel} from "../../CatamariSceneModel";
import {LabCatModel} from "./LabCatModel";
import {AMaterialManager, GetAppState, V3} from "../../../../anigraph";
import {GameConfigs} from "../../CatamariGameConfigs";
import {CatamariSceneController} from "../../CatamariSceneController";

export function createLabCat(sceneModel:CatamariSceneModel){
    sceneModel.labCat = LabCatModel.SquareLabCat();
    sceneModel.labCat.transform.setPosition(
        V3(
            -GameConfigs.GameWorldScale+sceneModel.labCat.labCatScale,
            0,
            sceneModel.labCat.zValue
        )
    )
    sceneModel.labCat.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
    sceneModel.labCat.material.setTexture('diffuse', sceneModel.labCatTextures[0]);
    sceneModel.addChild(sceneModel.labCat);
    sceneModel.labCat.visible = false;
    labCatGoesIntoHiding(sceneModel);
}


export function labCatGoesIntoHiding(sceneModel:CatamariSceneModel){
    sceneModel.labCat.transform.setPosition(
        V3(
        -GameConfigs.GameWorldScale-1.5*sceneModel.labCat.labCatScale,
        0,
        sceneModel.labCat.zValue
    ))
}

export function callLabCatForth(sceneController:CatamariSceneController){
    // callback: (actionProgress: number) => any, duration: number, actionOverCallback?: CallbackType, tween?: BezierTween, handle?: string
    let sceneModel = sceneController.model;
    sceneController.addTimedAction(
        (progress:number)=>{
            let start = -GameConfigs.GameWorldScale-1.5*sceneModel.labCat.labCatScale;
            let end = -GameConfigs.GameWorldScale+sceneModel.labCat.labCatScale;
            sceneModel.labCat.transform.setPosition(
                V3(
                    progress*end+(1-progress)*start,
                    0,
                    sceneModel.labCat.zValue
                )
            )
        }, 8.0,
    )

}
