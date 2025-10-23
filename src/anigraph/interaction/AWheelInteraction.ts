import {
    AInteraction,
    AInteractionEvent,
    AReceivesInteractionsInterface,
    PointerEvents
} from "./AInteraction";
import {CallbackType} from "../basictypes";


export type AWheelInteractionCallback = (event:AInteractionEvent, interaction?:AWheelInteraction)=>any;

export class AWheelInteraction extends AInteraction{
    static Create(element:any, moveCallback:AWheelInteractionCallback, handle?:string, ...args:any[]){
        const interaction = new this(element, moveCallback, handle);
        interaction.bindMethods();
        return interaction;
    }
    constructor(element:AReceivesInteractionsInterface, callback:AWheelInteractionCallback, handle?:string){
        super(element, undefined, handle);
        const self = this;
        this.wheelCallback = callback??this.wheelCallback;
        this.addDOMEventListener(PointerEvents.POINTER_WHEEL, (event:AInteractionEvent)=>{
            event.preventDefault();
            self.wheelCallback(event, self);
        });
    }

    wheelCallback(event:AInteractionEvent, interaction:AWheelInteraction){
        console.log(event);
    }

    bindMethods() {
        super.bindMethods();
    }
}
