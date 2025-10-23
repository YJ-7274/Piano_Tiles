import {ASerializable, Mat3, NodeTransform2D, Transformation2DInterface} from "../../anigraph";
import {Polygon2DModel} from "../../anigraph/starter/nodes/polygon2D";

/**
 * Customizable polygon node model.
 * We don't really change anything here, but are going to use it as a parent class for the Mat3 and NodeTransform2D specific node model subclasses below.
 */
@ASerializable("CustomPolygon2DModel")
export class CustomPolygon2DModel extends Polygon2DModel{
    /**
     * thr transform property type is Transformation2DInterface by default here.
     * If we want to specialize it by explicitly making it a Mat3, or, more likely, by explicitly makingit a NodeTransform2D, then we can do that by overwriting some of its parent class methods with explicit types (see below)
     */
}

/**
 * We can specialize a version that explicitly uses Mat3 objects to represent transformations
 */
@ASerializable("CustomPolygon2DMat3Model")
export class CustomPolygon2DMat3Model extends CustomPolygon2DModel{
    /**
     * Wrapper that interprets the Transformation2DInterface as a Mat3
     * @returns {Mat3}
     */
    get transform(): Mat3 {
        return this._transform as Mat3;
    }

    /**
     * Sets the transform to an identity Mat3
     */
    setTransformToIdentity(){
        this._transform = new Mat3();
    }

    /**
     * If the input transform is not a Mat3, it will be converted to one.
     * Note that this can throw away information! E.g., there are different combinations of position and anchor that map to the same Mat3 object.
     * @param transform
     */
    setTransform(transform:Transformation2DInterface){
        return this.setTransformMat3(transform);
    }
}

/**
 * We can specialize a version that explicitly uses NodeTransform2D objects to represent transformations
 */
@ASerializable("CustomPolygon2DPRSAModel")
export class CustomPolygon2DPRSAModel extends CustomPolygon2DModel{
    /**
     * Wrapper that interprets the Transformation2DInterface as a NodeTransform2D
     * @returns {NodeTransform2D}
     */
    get transform(): NodeTransform2D {
        return this._transform as NodeTransform2D;
    }

    /**
     * Sets the transform to an identity NodeTransform2D
     */
    setTransformToIdentity(){
        this._transform = new NodeTransform2D();
    }

    /**
     * If the input transform is not a NodeTransform2D, it will be converted to one before assignment.
     * Note that this may have unpredictable behavior! The space of transformations we can represent with a matrix is larger than what we can represent with PRSA, so it may be impossible to match a given input matrix with a NodeTransform2D.
     * @param transform
     */
    setTransform(transform:Transformation2DInterface){
        return this.setTransformPRSA(transform);
    }
}
