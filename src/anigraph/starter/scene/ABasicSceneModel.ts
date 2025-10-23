import {AObjectState, ASerializable} from "../../base";
import {ASceneModel} from "../../scene/ASceneModel";
import {AppState, GetAppState} from "../../appstate";
import {AMaterialManager, AShaderMaterial, AShaderModel, ATexture, DefaultMaterials} from "../../rendering";
import {AObject3DModelWrapper} from "../../geometry";
import {Color, NodeTransform3D, TransformationInterface} from "../../math";
import {A3DModelLoader} from "../../fileio";
import {APointLightModel} from "../../scene/lights";
import {ClassInterface} from "../../basictypes";
import {ALoadedModel} from "../../scene/nodes/loaded/ALoadedModel";


@ASerializable("ABasicSceneModel")
export abstract class ABasicSceneModel extends ASceneModel{
    @AObjectState _sceneScale!:number;
    get sceneScale(){
        if(this._sceneScale === undefined){
            this._sceneScale = GetAppState().globalScale;
        }
        return this._sceneScale;
    }
    _textures:{[name:string]:ATexture}={};
    _3Dmodels:{[name:string]:AObject3DModelWrapper}={};

    viewLight!:APointLightModel;
    static _VIEW_LIGHT_SUBSCRIPTION_KEY:string ="VIEW_LIGHT_CAMERA_UPDATE_SUB"

    /**
     * Loads a texture asynchronously and stores it in the textures dictionary
     * @param path the path to the texture relative to the 'public/' directory
     * @param name the name to associate with the texture. If not provided, the file name will be used.
     * @returns {Promise<void>}
     */
    async loadTexture(path:string, name?:string){
        console.log(`Loading image at path ${path}`)
        if(name === undefined){
            name = path.replace(/^.*[\\/]/, '')
        }
        this._textures[name] = await ATexture.LoadAsync(path);
        return;
    }

    // async loadTexture(name:string, public_path:string){
    //     this._textures[name] = await ATexture.LoadAsync(public_path);
    //     // const self = this;
    //     // let texturePromise = ATexture.LoadAsync(public_path);
    //     // texturePromise.then((tex:ATexture)=>{
    //     //     // self._textures[name]=tex;
    //     // },
    //     //     (reason)=>{
    //     //     console.log(reason);
    //     //         throw new Error(`Did not find texture at public path ${public_path}`)
    //     //     }
    //     // )
    //     // self._textures[name]= await texturePromise;
    //     // return;
    // }

    getTexture(name:string){
        return this._textures[name];
    }

    addTimeRateAppStateControl(appState:AppState){
        const STATEKEY = "ModelPlaySpeed"
        appState.addSliderIfMissing(STATEKEY, 1, 0, 10, 0.001);
        const self = this;
        this.subscribeToAppState(STATEKEY, (value:number)=>{
            self.clock.rate = value;
        })
    }


    addViewLight(){
        this.viewLight = new APointLightModel(this.camera.pose, Color.FromString("#ffffff"),1, 1, 1);
        this.addChild(this.viewLight)
        this._attachViewLightToCamera();
    }

    _attachViewLightToCamera(){
        const self = this;
        this.subscribe(this.camera.addPoseListener(()=>{
            self.viewLight.setTransform(self.camera.transform);
        }), ABasicSceneModel._VIEW_LIGHT_SUBSCRIPTION_KEY);
    }
    _detachViewLightFromCamera(){
        this.unsubscribe(ABasicSceneModel._VIEW_LIGHT_SUBSCRIPTION_KEY);
    }

    async load3DModel(path:string, name?:string, transform?:TransformationInterface){
        /**
         * Here we need to load the .ply file into an AObject3DModelWrapper instance
         */
        if(name === undefined){
            name = path.replace(/^.*[\\/]/, '')
        }
        this._3Dmodels[name] = await A3DModelLoader.LoadFromPath(path)
        this._3Dmodels[name].sourceTransform = transform??new NodeTransform3D();
        return;
    }

    get3DModel(name:string){
        return this._3Dmodels[name];
    }


    async LoadBasicShaders(){
        let appState = GetAppState();
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.RGBA_SHADER);
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER);
    }

    async PreloadAssets(){
        await super.PreloadAssets();
        await this.LoadBasicShaders();
    }
    abstract initAppState(appState:AppState):void;

    CreateModelFromAsset(name:string, material:AShaderMaterial, modelClass?:ClassInterface<ALoadedModel>){
        if(!this.get3DModel(name)){
            throw new Error(`You need to load ${name} assets using LoadTheCat() in PreloadAssets!`)
        }
        let appState = GetAppState();

        /**
         * Let's start by creating an instance of our material
         */
        // let material = appState.CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
        let model = this.get3DModel(name);
        if(this.getTexture(name)){
            material.setTexture('diffuse', this.getTexture(name));
        }else {
            let textures = model.getTextures();
            material.setTexture('diffuse', textures['diffuse']);
        }

        // optionally use vertex colors for your model. don't need them for the cat model (we get color from texture)
        // catMaterial.usesVertexColors=true;

        let loadedmodel:ALoadedModel;
        if(modelClass !== undefined) {
            // @ts-ignore
            loadedmodel = modelClass.Create(
                model
            )
        }else{
            loadedmodel = ALoadedModel.Create(
                model
            )
        }

        loadedmodel.setMaterial(material);
        return loadedmodel;

    }


}

