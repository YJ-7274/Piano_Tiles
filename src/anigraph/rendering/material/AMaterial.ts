import {folder} from "leva";
import {ASerializable, AObject} from "../../base";
import {MaterialParameters} from "three/src/materials/Material";
import {AMaterialModel} from "./AMaterialModel";
import {Color} from "../../math";
import * as THREE from "three";

enum AMaterialEvents{
    CHANGE='MATERIAL_CHANGE',
    UPDATE='MATERIAL_UPDATE'
}

@ASerializable("AMaterial")
export class AMaterial extends AObject{
    protected _model!:AMaterialModel;
    public _material!:THREE.Material;
    static Events = AMaterialEvents;

    static GEOMETRY_SIDE = {
        FRONT:THREE.FrontSide,
        BACK:THREE.BackSide,
        BOTH:THREE.DoubleSide
    };
    get threejs(){return this._material;}

    get model(){
        return this._model;
    }

    constructor(...args:any[]) {
        super();
    }

    init(model:AMaterialModel){
        this.setModel(model);
    }

    get usesVertexColors(){return this.getValue('vertexColors');}
    set usesVertexColors(value:boolean|undefined){this.setValue('vertexColors',value);}

    /** Get set depthTest */
    get depthTest(){return this.getValue('depthTest');}
    set depthTest(value:boolean|undefined){this.setValue('depthTest',value)}

    get depthWrite(){return this.getValue('depthWrite');}
    set depthWrite(value:boolean|undefined){this.setValue('depthWrite',value)}

    /** Get set DepthFunc */
    set depthFunc(value:THREE.DepthModes){this.setValue('depthFunc',value)}
    get depthFunc(){return this.getValue('depthFunc');}



    get visible(){return this.getValue('visible');}
    set visible(value:boolean|undefined){this.setValue('visible',value)}


    /**
     * GEOMETRY_SIDE.BOTH to render both front and back faces
     * GEOMETRY_SIDE.FRONT to render front faces only
     * GEOMETRY_SIDE.BACK to render back faces only
     * @param renderSide
     */
    setRenderSide(renderSide:THREE.Side){
        this._material.side = renderSide;
    }

    //##################//--Values--\\##################
    //<editor-fold desc="Values">
    getModelColor(){
        let c = this.getValue('color');
        if(c){
            return Color.FromThreeJS(c);
        }else{
            return Color.FromString("#77bb77");
        }
    }
    setModelColor(v:Color|THREE.Color){
        if(v instanceof  Color){
            this.setValue('color', v.asThreeJS());
        }else{
            this.setValue('color', v);
        }
    }
    setValue(name:string, value:any){
        let vals:{[name:string]:any}={};
        vals[name]=value;
        this.setValues(vals);
    }
    setValues(values:MaterialParameters){
        this.threejs.setValues(values);
        this.signalEvent(AMaterial.Events.UPDATE, values);
    }
    getValue(name:string):any{
        // @ts-ignore
        return this.threejs[name];
    }

    setBlendingMode(mode:THREE.Blending){
        this.threejs.blending=mode;
    }

    //</editor-fold>
    //##################\\--Values--//##################

    setModel(model:AMaterialModel){
        this._model = model;
        this._material = model._CreateTHREEJS();
        // this.threejs.setValues(this._model.defaults);
    }

    getMaterialGUIParams() {
        const self = this;
        return {
            MaterialProps: folder(
                self.model.getMaterialGUIParams(self),
                { collapsed: false }
            ),
        }
    }

    dispose(){
        this._material.dispose();
    }

    release() {
        this.dispose();
        super.release();
    }

}

