import {
    AMaterial,
    AMaterialManager,
    ANodeModel2D, ANodeModel2DPRSA,
    AppState,
    ASerializable, AShaderMaterial, ATexture,
    Color, GetAppState, Mat3,
    NodeTransform2D,
    Polygon2D, Transformation2DInterface,
    V2,
    Vec2, VertexArray2D
} from "../../../../anigraph";
import {ANodeModel2DMat3} from "../../../../anigraph/scene/nodeModel/ANodeModel2DMat3";
import type {TransformationInterface} from "../../../../anigraph";


/**
 * It's often a good practice to declare strings in one central place like this, and then refer to the variables when using them as strings later on.
 * This has three advantages:
 * - If you want to change the string, you only need to change it in one place.
 * - Autocomplete
 * - If you have a type somewhere, it will show as a compiling error instead of running with the wrong behavior.
 */
const enum Constants{
    ExampleString = "ExampleString"
}

/**
 * If you create a custom model, it is important to add the @Serializable decordator with the name of the model.
 * This automates a lot of otherwise painful stuff.
 */
@ASerializable("MyCustomModel")
export class MyCustomModel extends ANodeModel2D{

    /**
     * Constructor for node model
     * @param {VertexArray2D} verts The geometry for our model
     * @param {AMaterial} material A material, which defines how the model should be colored
     * @param {Transformation2DInterface | undefined} transform A transform, which can be a Mat3 or a NodeTransform2D, though the subclasses defined below in the same source file specialize to one type or the other
     * @param args this is essentially a placeholder for arguments that may be useful in defining subclasses.
     */
    constructor(verts: VertexArray2D, material:AMaterial, transform?: Transformation2DInterface|undefined, ...args: any[]) {
        super(verts, transform, ...args);
        this.setMaterial(material);
    }
}

/**
 * If you don't define a new ASerializable label, then the class will inherit its parent's
 */
export class MyCustomMat3Model extends MyCustomModel{
    get transform(): Mat3 {
        return this._transform as Mat3;
    }
    setTransformToIdentity(){
        this._transform = new Mat3();
    }
    setTransform(transform:TransformationInterface){
        return this.setTransformMat3(transform);
    }
}

/**
 * If you don't define a new ASerializable label, then the class will inherit its parent's
 */
export class MyCustomPRSAModel extends MyCustomModel{
    get transform(): NodeTransform2D {
        return this._transform as NodeTransform2D;
    }
    setTransformToIdentity(){
        this._transform = new NodeTransform2D();
    }
    setTransform(transform:TransformationInterface){
        return this.setTransformPRSA(transform);
    }
}
