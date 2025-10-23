import {ANodeView, ANodeView2D, APolygon2DGraphic, Color, Mat3, V2} from "../../../../anigraph";
import {MyCustomModel} from "./MyCustomModel";

export class MyCustomView extends ANodeView2D{

    get model(): MyCustomModel {
        return this._model as MyCustomModel;
    }


    init(): void {

        // This would be a good place to create and add graphics elements.

        this.update();
        const self = this;


        /**
         * We could update elements every time our model's custom event happens
         */
        // this.subscribe(this.model.addCustomUpdateListener(
        //     ()=>{
        //         this.updateElements();
        //     }
        // ))
    }

    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }
}
