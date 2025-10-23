import {
    AMaterial,
    APolygon2DGraphic,
    AShaderMaterial,
    Color,
    DefaultMaterials,
    GetAppState,
    Mat3,
    Polygon2D,
    V2,
    Vec2
} from "../../../anigraph";



const TriangleGeometry = Polygon2D.CreateForRendering(true);
TriangleGeometry.addVertex(V2(0,0), new Color(0.0,0.0,1.0));
TriangleGeometry.addVertex(V2(1,0), new Color(1.0,0.0,0.0));
TriangleGeometry.addVertex(V2(0,1), new Color(0.0,1.0,0.0));


export class SmallTriangleGraphicElement extends APolygon2DGraphic{
    static TriangleGeometry:Polygon2D = TriangleGeometry;
    static Material:AMaterial|undefined = undefined;
    constructor(position:Vec2) {

        // let's initialize the material if this is the first time creating one of these elements
        if(!SmallTriangleGraphicElement.Material){
            let appState = GetAppState();
            SmallTriangleGraphicElement.Material = appState.CreateMaterial(DefaultMaterials.RGBA_SHADER);
        }

        super(SmallTriangleGraphicElement.TriangleGeometry, SmallTriangleGraphicElement.Material);
        this.setTransform(Mat3.Translation2D(position));
    }
}
