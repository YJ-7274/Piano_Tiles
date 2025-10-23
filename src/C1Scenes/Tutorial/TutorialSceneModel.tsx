import {
    AGroupNodeModel2D, AGroupNodePRSAModel2D,
    AMaterialManager, ANodeModel2D,
    AppState, AShaderMaterial, BezierTween,
    Color,
    GetAppState,
    NodeTransform2D,
    Polygon2D, V2, Vec2,
    VertexArray2D
} from "../../anigraph";
import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {MyCustomModel, MyCustomPolygonModel, MyCustomPRSAModel, MyCustomPRSAPolygonModel} from "./nodes";


let nErrors = 0;

const enum Constants{
    LabCatSitsTextureHandle = "LabCatSitsTextureHandle",
    CompassTextureHandle = "CompassTextureHandle",
    Slider1 = "Slider1",
    Color1 = "Color1",
}

/**
 * This is your Scene Model class. The scene model is the main data model for your application. It is the root for a
 * hierarchy of models that make up your scene/
 */
export class TutorialSceneModel extends App2DSceneModel{

    groupNode!:AGroupNodePRSAModel2D;


    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();
        await this.loadTexture(`./images/LabCatSitsSquareSmall.jpg`, Constants.LabCatSitsTextureHandle);
        await this.loadTexture('./images/compass.png', Constants.CompassTextureHandle);
    }

    /**
     * This will add variables to the control pannel
     * @param appState
     */
    initAppState(appState:AppState){
        appState.addSliderIfMissing(Constants.Slider1, 0, 0, 1, 0.001);
        appState.addColorControl(Constants.Color1, Color.FromString("#123abe"));
    }

    /**
     * Use this function to initialize the content of the scene.
     * Generally, this will involve creating instances of ANodeModel subclasses and adding them as children of the scene:
     * ```
     * let myNewModel = new MyModelClass(...);
     * this.addChild(myNewModel);
     * ```
     *
     * You may also want to add tags to your models, which provide an additional way to control how they are rendered
     * by the scene controller. See example code below.
     */
    initScene(){
        let appState = GetAppState();

        this.groupNode = new AGroupNodePRSAModel2D();
        this.addChild(this.groupNode);

        /**
         * We will specify two types of materials, which are used to color geometry in different ways.
         * One will be a texture material, that tectures the geometry with Lab Cat.
         * The other will be a RGBA color material, that lets us specify color for each vertex.
         */

        /**
         * When creating a texture, use the same handle you used in PreloadAssets() to load the texture from file.
         */
        let labCatTexture = this.getTexture(Constants.LabCatSitsTextureHandle);
        let labCatTextureMaterial = appState.Create2DTextureMaterial(labCatTexture)

        /**
         * We will create another texture material for our compass texture
         */
        let compassTexture = this.getTexture(Constants.CompassTextureHandle);
        let compassTextureMaterial = appState.Create2DTextureMaterial(compassTexture);

        /**
         * And we will create an RGBA color material that uses vertex colors.
         */
        let coloredVertsMaterial = appState.Create2DRGBAMaterial();



        /**
         * Create a textured polygon square.
         */
        let texturePolygonSquareGeometry = Polygon2D.SquareXYUV(1.0);
        let polygonTransform = new NodeTransform2D(new Vec2(1,1), Math.PI);
        let texturedPolygon = new MyCustomPRSAPolygonModel(texturePolygonSquareGeometry, labCatTextureMaterial, polygonTransform);
        this.groupNode.addChild(texturedPolygon);

        /**
         * Create the second model using mesh geometry. Mesh geometry is defined with a list of vertices and then a list of index triplets defining triangles.
         * The colored mesh star we add later in this function will show you how to create custom mesh geometry. For now, we'll use a helper function to create a simple textured square.
         */
        let meshGeometry = VertexArray2D.SquareXYUV(1.0);

        // transform for us to use
        let meshTransform = new NodeTransform2D();
        meshTransform.position = new Vec2(-1,-1);
        let myCustomModel: MyCustomModel = new MyCustomPRSAModel(meshGeometry, compassTextureMaterial, meshTransform);
        this.groupNode.addChild(myCustomModel);

        /**
         * Colorful wheel geometry
         * Define geometry that has one white vertex in the center, then a bunch of colorful spikes around it.
         */
        let wheelVerts = [V2(0,0)];
        let wheelColors = [Color.White()];
        let nSpokes = 15;
        let radius = 1.5;
        let color0 = Color.Green();
        let stepsize = (1/(nSpokes-1))*2*Math.PI;

        /**
         * Loop over the spikes.
         */
        for(let i=0;i<nSpokes;i++){
            let theta = -i*stepsize;
            wheelVerts.push(V2(Math.cos(theta), Math.sin(theta)).times((i%2)? radius:radius*0.5));
            wheelColors.push(color0.GetSpun(i*stepsize));
        }

        /**
         * Now we will use our wheel geometry to create two models. One will be a shape polygon, and one will be a triangle mesh.
         * The difference is that the shape polygon simply defines ordered verts around its perimeter, while the mesh actually specifies a list of triangles.
         */

        /**
         * Let's start by creating a colored mesh. The difference will be that our mesh is built out of triangles.
         * We'll use the same set of colored vertices from above
         */
        let coloredMeshTransform = new NodeTransform2D(new Vec2(-1,1));

        /**
         * We could technically use VertexArray2D here, which is the parent of Polygon2D. However, if you have collision behavior implemented for 2d polygons, you can choose to use it here.
         * We will provide a reference implementation for 2D polygon collisions after 2 days past the A2 deadline.
         */
        let coloredTriangleGeometry = Polygon2D.FromLists(
            wheelVerts,
            wheelColors,
        )

        /**
         * Here we specify the indices of vertices that we want to connect into triangles.
         * We will add triangles one at a time.
         */
        for(let i=2;i<nSpokes;i++){
            coloredTriangleGeometry.addTriangleIndices([0, i, i-1]);
        }
        coloredTriangleGeometry.addTriangleIndices([0, 1, nSpokes-1]);

        /**
         * Create a triangle mesh node model using our geometry, material, and transform.
         */
        let coloredTriangleMesh = new MyCustomPRSAModel(coloredTriangleGeometry, coloredVertsMaterial, coloredMeshTransform)
        this.groupNode.addChild(coloredTriangleMesh);


        /**
         * Create a colored polygon. You are kind of on your own when it comes to polygon tesselation behavior.
         * It should be based on Three.js shapes https://threejs.org/docs/#api/en/geometries/ShapeGeometry
         * From what I gather, these shapes should be specified by their perimeter vertices in clockwise order...
         */
        let coloredPolygonGeometry = Polygon2D.FromLists(
            wheelVerts,
            wheelColors,
        )
        let coloredPolygonTransform = new NodeTransform2D(new Vec2(1,-1));
        let coloredPolygon = new MyCustomPRSAPolygonModel(coloredPolygonGeometry, coloredVertsMaterial, coloredPolygonTransform)
        this.groupNode.addChild(coloredPolygon);
    }

    /**
     * Here we define a function that will add a timed action to our model.
     * The timed action is one that happens over a specified duration (in seconds).
     * In this case, we spin the groupNode in our scene by setting its rotation according to a bezier curve in time.
     */
    spin(){
        const self = this;

        /**
         * Add the timed action
         * Check out the definition of addTimedAction for more details
         */
        this.addTimedAction((actionProgress) => {
            self.groupNode.transform.rotation = actionProgress*4*Math.PI;
            },
            2,
            () => {
                self.groupNode.transform.rotation = 0;
            },
            /**
             * The cubic bezier tween is defined by the x and y coordinates of its second and third control points in canonical form. That is, where the first control point is [0,0], and the last is [1,1]. The x coordinate represents progress along the specified duration, and the y coordinate represents the corresponding actionProgress value.
             */
            new BezierTween(0.33, -0.6, 0.66, 1.6)
        )

    }



    timeUpdate(t: number) {
        let appState = GetAppState();

        /**
         * We will have our group node move around in a circle with time, where the radious is controlled by the control panel slider `Slider1`
         */

        let theta = t*5.0;
        this.groupNode.transform.position=V2(
            Math.cos(theta),
            Math.sin(theta)
        ).times(appState.getState(Constants.Slider1));

        try {
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }
    }
}
