import {ANodeModel2D, ASerializable, Mat3, NodeTransform2D, Polygon2D, TransformationInterface} from "../anigraph";


/**
 * It's often a good practice to declare strings in one central place like this, and then refer to the variables when using them as strings later on.
 * This has three advantages:
 * - If you want to change the string, you only need to change it in one place.
 * - Autocomplete
 * - If you have a type somewhere, it will show as a compiling error instead of running with the wrong behavior.
 */
const enum MyEventStrings{
    CustomUpdateKey = "CustomUpdateKey",
    CustomUpdateSubscriptionHandle = "CustomUpdateSubscriptionHandle"
}

/**
 * If you create a custom model, it is important to add the @Serializable decordator with the name of the model.
 * This automates a lot of otherwise painful stuff.
 */
@ASerializable("MyCustomModel")
export class MyCustomModel extends ANodeModel2D{
    /**
     * This is how you would signal a custom update event
     */
    signalCustomUpdate(...args:any[]){
        // If you want to use arguments...
        // if(args.length>0){
        //     console.log(`signaling ${args[0]}`);
        // }

        this.signalEvent(MyEventStrings.CustomUpdateKey, ...args);
    }

    /**
     * This is what you would use to add a listener to the custom update event
     * @param callback
     * @param handle
     * @returns {AEventCallbackSwitch}
     */
    addCustomUpdateListener(callback: (...args: any[]) => void, handle?: string){
        return this.addEventListener(MyEventStrings.CustomUpdateKey, callback, handle);
    }


    constructor(verts?: Polygon2D, transform?: NodeTransform2D, ...args: any[]) {
        super(verts, transform?transform.getMatrix():transform, ...args);

        /**
         * If we wanted to subscribe to the custom event updates
         */

        const self = this;
        this.subscribe(
            this.addCustomUpdateListener((...args:any[])=>{

                // If you want to use arguments...
                if(args.length>0){
                    console.log(args[0]);
                }
                console.log("custom update event happened!")
                console.log(self);

            }), MyEventStrings.CustomUpdateSubscriptionHandle
        )

        /**
         * You can deactivate or activate the subscription as you please
         */
        this.deactivateSubscription(MyEventStrings.CustomUpdateSubscriptionHandle);
        this.activateSubscription(MyEventStrings.CustomUpdateSubscriptionHandle);

        // Signal the event
        this.signalCustomUpdate("We can pass an argument")
    }
}



@ASerializable("MyCustomMat3Model")
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

@ASerializable("MyCustomPRSAModel")
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
