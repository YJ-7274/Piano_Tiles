import {ANodeView} from "./ANodeView";

export abstract class AGroupNodeView extends ANodeView{
}


export class AGroupNodeView2D extends AGroupNodeView{
    init(){

    }
    update(){
        this.setTransform2D(this.model.transform);
    }
}

export class AGroupNodeView3D extends AGroupNodeView{
    init(){

    }
    update(){
        this.setTransform(this.model.transform);
    }
}
