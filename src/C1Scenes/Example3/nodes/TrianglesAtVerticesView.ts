import {ANodeView2D} from "../../../anigraph";
import {SmallTriangleGraphicElement} from "./SmallTriangleGraphicElement";
import {TriangleAtVerticesModel} from "./TriangleAtVerticesModel";

/**
 * This view creates a SmallTriangleGraphicElement at each vertex of the attached model.
 * It demonstrates:
 * - Using multiple graphic elements in one custom view
 * - Using a custom graphic element
 */
export class TrianglesAtVerticesView extends ANodeView2D{

    get model(): TriangleAtVerticesModel {
        return this._model as TriangleAtVerticesModel;
    }


    init(): void {

        // Let's get the vertices data from our model...
        let verts = this.model.verts;

        // Now lets create one of our custom SmallTriangleGraphicElement's at each vertex of our model's geometry...
        for(let v=0;v<verts.nVerts;v++){
            // Create the custom element class instance
            let newElement = new SmallTriangleGraphicElement(verts.vertexAt(v));

            // Add the graphic to the view
            this.registerAndAddGraphic(newElement);
        }

        // If we want to access the graphics that have been added to this view, they are stored in this.graphics
        // This should print them to the console:
        console.log("The graphics elements stored in our view are:")
        console.log(this.graphics);

        this.update();
    }

    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }
}
