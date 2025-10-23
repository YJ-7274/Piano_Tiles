import {ANodeView} from "../../nodeView";
import {AGraphicObject} from "../../../rendering";

export class ALoadedView extends ANodeView{
    init(): void {
        // this.threejs.add(this.model.)
        this.initLoadedObjects();
        this.update();
    }

    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }

    onMaterialUpdate(...args:any[]){
        const self = this;
        this.mapOverGraphics((element:AGraphicObject)=>{
            element.onMaterialUpdate(self.model.material, ...args);
        })
    }

    onMaterialChange(){
        const self = this;
        this.mapOverGraphics((element:AGraphicObject)=>{
            element.onMaterialChange(self.model.material);
        })
    }

}
