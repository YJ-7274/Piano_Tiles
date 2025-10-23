import {AObject} from "../../base";
import {AGLRenderWindow} from "./AGLRenderWindow";
import {AGLContext} from "./AGLContext";
import {ConfirmInitialized} from "../../scene/ConfirmInitialized";




export interface ARenderDelegate extends ConfirmInitialized{
    get isReadyToRender():boolean;
    initRendering(contextView:AGLRenderWindow):Promise<void>;
    onAnimationFrameCallback(context:AGLContext):void;
    onWindowResize(renderWindow:AGLRenderWindow):void;
    get renderWindow():AGLRenderWindow;
    setRenderWindow(renderWindow: AGLRenderWindow):void;
    setContext(context:AGLContext):void;
    initContext():void;
    get context():AGLContext;
}

// type RenderDelegate implements ARenderDe
