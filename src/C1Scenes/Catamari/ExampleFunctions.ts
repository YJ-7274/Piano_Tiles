import {ASceneModel, Color, GetAppState, V2} from "../../anigraph";
import {Polygon2DModel} from "../../anigraph/starter/nodes/polygon2D";

export default class ExampleFuncs {

    static createSimpleRGBTriangleNode(sceneModel: ASceneModel) {
        // let unitquad = new UnitQuadModel(GetAppState().materials.CreateMaterial(DefaultMaterials.RGBA_SHADER, new Color(0.0,1.0,0.0)));
        let polygon = new Polygon2DModel();
        polygon.verts.initColorAttribute();
        let material = GetAppState().materials.createRGBAShaderMaterial();
        polygon.setMaterial(material);
        polygon.verts.addVertex(V2(), Color.FromRGBA(1.0, 0.0, 0.0, 1.0));
        polygon.verts.addVertex(V2(1, 1), Color.FromRGBA(0.0, 1.0, 0.0, 1.0));
        polygon.verts.addVertex(V2(1, 0), Color.FromRGBA(0.0, 0.0, 1.0, 1.0));
        return polygon
    }

    static addSimpleTriangle(sceneModel: ASceneModel) {
        let polygon = ExampleFuncs.createSimpleRGBTriangleNode(sceneModel);
        sceneModel.addChild(polygon);
        sceneModel.signalComponentUpdate();
        return polygon;
    }



}
