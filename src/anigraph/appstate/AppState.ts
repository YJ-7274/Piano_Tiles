import {AAppState} from "../appstate/AAppState";
import {
    ACallbackSwitch,
    ASceneController,
    ASceneModel,
    CheckAAppState,
    ClassInterface,
    SetAppState,
    AMaterialManager,
    AShaderMaterial,
    Color,
    DefaultMaterials,
    AMaterialModelBase,
    AMaterialModel, ABasicMaterialModel, AShaderModel, ATexture
} from "../index";
import {AGLRenderWindow} from "../index";
import {AHandlesEvents} from "../base/aobject/AHandlesEvents";
import { ABlinnPhongShaderModel } from "../rendering/shadermodels";

enum AppStateEnums{
    MAIN_RENDER_WINDOW="mainWindow",
    SECOND_RENDER_WINDOW="secondWindow"
}

interface CreatesShaderModels{
    CreateModel:(...args:any[])=>ABlinnPhongShaderModel;
}

export class AppState extends AAppState{
    sceneModel:ASceneModel;
    materials:AMaterialManager;
    renderWindows:{[name:string]:AGLRenderWindow}={};
    constructor(sceneModel:ASceneModel) {
        super();
        this.sceneModel = sceneModel;
        this.materials = new AMaterialManager();
    }


    _getReactGUIContent!:(props:{appState:AppState})=>any;
    _getReactGUIBottomContent!:(props:{appState:AppState})=>any;

    getReactGUIContent(){
        if(this._getReactGUIContent !== undefined){
            return this._getReactGUIContent({appState: this});
        }else{
            return undefined;
        }
    }

    getReactGUIBottomContent(){
        if(this._getReactGUIBottomContent !== undefined){
            return this._getReactGUIBottomContent({appState: this});
        }else{
            return undefined;
        }
    }

    setReactGUIContentFunction(func:(props:{appState:any})=>any){
        this._getReactGUIContent=func;
    }

    setReactGUIBottomContentFunction(func:(props:{appState:any})=>any){
        this._getReactGUIBottomContent=func;
    }

    get mainRenderWindow(){
        return this.renderWindows[AppStateEnums.MAIN_RENDER_WINDOW];
    }
    getRenderWindow(key:string){
        return this.renderWindows[key];
    }

    createMainRenderWindow(controllerClass:ClassInterface<ASceneController>){
        this.createRenderWindow(AppStateEnums.MAIN_RENDER_WINDOW, controllerClass);
    }

    getSceneController(name:string){
        return this.renderWindows[name].sceneController;
    }

    get mainSceneController(){
        return this.getSceneController(AppStateEnums.MAIN_RENDER_WINDOW);
    }

    async confirmInitialized(){
        const self = this;
        for(let window_name in this.renderWindows){
            await self.renderWindows[window_name].sceneController.confirmInitialized();
        }
        return self.initMutex.runExclusive(async () => {
            self.init();
        });
    }


    updateComponents(){
        this.sceneModel.signalComponentUpdate();
    }

    addComponentUpdateListener(callback:(self:AHandlesEvents)=>void, handle?:string):ACallbackSwitch{
        return this.sceneModel.addComponentUpdateListener(callback, handle);
    }


    createRenderWindow(name:string, controllerClass:ClassInterface<ASceneController>){
        let sceneController = new controllerClass(this.sceneModel);
        this.renderWindows[name]= new AGLRenderWindow(sceneController);
        return this.renderWindows[name];
    }

    /**
     * You can just provide SHADERNAME, where the shaders are in public/shaders/SHADERNAME/SHADERNAME.vert.glsl
     * and public/shaders/SHADERNAME/SHADERNAME.frag.glsl
     * @param name
     * @returns {Promise<void>}
     */
    async loadShaderMaterialModel(name:string){
        return this.materials.loadShaderModel(name);
    }
    async loadLineShaderMaterialModel(name:string){
        return this.materials.loadLineShaderModel(name);
    }

    async addShaderMaterialModel(name:string, m:AMaterialModelBase<any>|typeof AShaderModel, ...args:any[]){
        if(m instanceof AMaterialModelBase<any>){
            return this.setMaterialModel(name, m);
        }else{
            let model = await (m as typeof AShaderModel).CreateModel(name, ...args);
            return this.setMaterialModel(name, model);
        }
    }

    async setMaterialModel(name:string, m:AMaterialModelBase<any>){
        return this.materials.setMaterialModel(name, m);
    }

    getShaderMaterialModel(name:string){
        return this.materials.getShaderMaterialModel(name);
    }


    Create2DTextureMaterial(texture:ATexture):AShaderMaterial{
        let material = this.CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER) as AShaderMaterial;
        material.setDiffuseTexture(texture);
        return material;
    }
    Create2DRGBAMaterial():AShaderMaterial{
        return this.CreateMaterial(AMaterialManager.DefaultMaterials.RGBA_SHADER) as AShaderMaterial;
    }

    CreateMaterial(modelName:string, ...args:any[]){
        return this.materials.getMaterialModel(modelName).CreateMaterial(...args);
    }

    CreateBasicMaterial(color?:Color){
        let basic = this.materials.getMaterialModel(DefaultMaterials.Basic).CreateMaterial();
        if(color) {
            basic.setValue("color", color.asThreeJS());
        }
        return basic;
    }

    CreateShaderMaterial(modelName:string, ...args:any[]):AShaderMaterial{
        return this.materials.getMaterialModel(modelName).CreateMaterial(...args) as AShaderMaterial;
    }
}


export function CreateAppState(sceneModel:ASceneModel):AppState{
    let appState = CheckAAppState() as AppState;
    if(appState===undefined){
        appState = new AppState(sceneModel);
        SetAppState(appState);
    }else{
        console.warn(`ALREADY HAVE APP STATE!\n${appState}`)
        SetAppState(appState);
    }
    return appState;
}





// // TO_DO: APP STATE FIX / MERGE!!!
// export class AppState extends AObject implements ConfirmInitialized{
//     static enums = AppStateEnums;
//     @AObjectState columnSize:number;
//     _initMutex:Mutex;
//     renderWindows:{[name:string]:AGLRenderWindow}={};
//     sceneModel:ASceneModel;
//
//     constructor(){
//         super();
//         this._initMutex = new Mutex();
//         this.columnSize=6;
//         this.sceneModel = new A0SceneModel();
//     }
//
//
//     get mainRenderWindow(){
//         return this.renderWindows[AppState.enums.MAIN_RENDER_WINDOW];
//     }
//     get secondRenderWindow(){
//         return this.renderWindows[AppState.enums.SECOND_RENDER_WINDOW];
//     }
//
//     createMainRenderWindow(controllerClass:ClassInterface<ASceneController>){
//         this.addRenderWindow(AppState.enums.MAIN_RENDER_WINDOW, controllerClass);
//     }
//
//     createSecondRenderWindow(controllerClass:ClassInterface<ASceneController>){
//         this.addRenderWindow(AppState.enums.SECOND_RENDER_WINDOW, controllerClass);
//     }
//
//     addRenderWindow(name:string, controllerClass:ClassInterface<ASceneController>){
//         let sceneController = new controllerClass(this.sceneModel);
//         this.renderWindows[name]= new AGLRenderWindow(sceneController);
//     }
//
//     getSceneController(name:string){
//         return this.renderWindows[name].sceneController;
//     }
//
//     init(){
//         console.log("Initializing App State!")
//     }
//
//     get initMutex(){
//         return this._initMutex;
//     }
//     async confirmInitialized(){
//         const self = this;
//         for(let window_name in this.renderWindows){
//             await self.renderWindows[window_name].sceneController.confirmInitialized();
//         }
//         return self.initMutex.runExclusive(async () => {
//             self.init();
//         });
//     }
//
//     updateComponents(){
//         this.sceneModel.signalComponentUpdate();
//     }
//
//     addComponentUpdateListener(callback:(self:AObject)=>void, handle?:string):ACallbackSwitch{
//         return this.sceneModel.addComponentUpdateListener(callback, handle);
//     }
// }
