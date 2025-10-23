import {ANodeView, ANodeView2D, APolygon2DGraphic, ATriangleMeshGraphic, Color, Mat3, V2} from "../../../../anigraph";
import {MyCustomPolygonModel} from "./MyCustomPolygonModel";
import {TexturePoly2DSettings} from "../../../../anigraph/starter/nodes/textured";


export class MyCustomPolygonView extends ANodeView2D{
    /**
     * Our graphic element will be an APolygon2DGraphic, which we will use to render the model's Polygon2D as a polygon shape.
     * @type {APolygon2DGraphic}
     */
    element!:APolygon2DGraphic;

    get model(): MyCustomPolygonModel {
        return this._model as MyCustomPolygonModel;
    }


    init(){
        // create the element
        this.element = new APolygon2DGraphic();

        // initialize it with the geometry and material from our model
        this.element.init(this.model.verts, this.model.material);

        // Register and add it to the view
        this.registerAndAddGraphic(this.element);

        // Call update for good measure...
        this.update();

        // Optionally add a listener for changes in geometry
        const self = this;
        this.subscribe(this.model.addGeometryListener(
            ()=>{
                self.updateGeometry();
            }
        ))
    }

    /**
     * Our update function will update the view's transform based on the transformation stored in our model
     * @param args
     */
    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }

    /**
     * We will re-set the element's vertices when the model signals that the geometry has changed.
     */
    updateGeometry(){
        this.element.setVerts2D(this.model.verts);
    }
}
