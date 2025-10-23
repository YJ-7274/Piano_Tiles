import {Mutex} from "async-mutex";

export interface ConfirmInitialized{
    get initMutex():Mutex;
    confirmInitialized():Promise<void>;
}

