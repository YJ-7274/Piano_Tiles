import {Polygon2DView} from "../../../anigraph/starter/nodes/polygon2D";
import {APolygon2DGraphic, Color, Mat3} from "../../../anigraph";
import {CustomPolygonModel} from "./CustomPolygonModel";

/**
 * A custom view for our pyramid-starter-style model
 */
export class CustomPolygonView extends Polygon2DView{
    // We will have an array of specific graphics elements we want to update
    elements: APolygon2DGraphic[]=[];

    /**
     * We redefine our model getter with the assumed model class. This will make writing the rest of our view in Typescript
     * much easier, since we will be able to access parameters specific to that model class without needing to cast it every time.
     * @returns {CustomPolygonModel}
     */
    get model(): CustomPolygonModel {
        return this._model as CustomPolygonModel;
    }

    /**
     * Here we define a helper function to create graphic elements. We will call this helper function in our `init` function
     */
    createElements(){
        // We can clear any graphics that may have existed before. Not really necessary in this example, but a fine check to do.
        this.disposeGraphics();

        this.elements = [];
        for(let i=0;i<this.model.nElements;i++){

            // Create a polygon graphic for each element
            let newElement=new APolygon2DGraphic();

            // initialize it with the model geometry and a random color
            newElement.init(this.model.verts, Color.Random());

            // Set its transform
            newElement.setTransform(Mat3.Translation2D(i,1).times(this.model.transform.getMatrix()));

            // register the graphic with the view
            this.registerGraphic(newElement);

            // Add the graphic as a child of the view, or of another graphic
            this.add(newElement);
            // otherGraphic.add(newElement);

            // We will save the element in our elements array so we know to update it in updateElements
            this.elements.push(newElement);
        }
    }

    /**
     * We will call this every time our pyramid parameters change. It will update our graphics elements based on the new
     * parameter values.
     */
    updateElements(){
        for(let i=0;i<this.model.nElements;i++){
            this.elements[i].setTransform(Mat3.Translation2D(i,1).times(this.model.pyramidTransform.getMatrix()));
            this.elements[i].setMaterial(this.model.color.GetSpun(Math.PI*0.1*i));
        }
    }

    /**
     * Set up graphics and callbacks here.
     */
    init(): void {

        // A helper function for creating our elements
        this.createElements();

        // We call our update function here to initialize everything according to current app state
        this.updateElements();

        // Views come with some callbacks registered by default. Any time an @AObjectState variable changes in our model
        // the view's `update` function will be called. In particular, this includes any change to the model's `transform` property.
        this.update();


        // We can register any non-standard callbacks here.
        // Below we register a callback for an event defined in our model class (see model class for more details).
        const self = this;
        /**
         * We are going to update elements every time pyramid props are updated
         */
        this.subscribe(this.model.addPyramidUpdateListener(
            ()=>{
                this.updateElements();
            }
        ))
    }
}
