import {Howl, Howler, HowlErrorCallback, HowlOptions} from 'howler';
import {AObject, AObjectState, ASerializable} from "../base";

@ASerializable("AAudioManager")
class AAudioManager extends AObject{
    _sounds!:{[name:string]:Howl}
    _initSounds(){
        this._sounds = {};
    }

    get sounds(){
        return this._sounds;
    }

    constructor() {
        super();
        this._initSounds();
    }

    /**
     * Get a sound by name
     * @param name
     * @returns {Howl}
     */
    getSound(name:string):Howl{
        return this.sounds[name];
    }

    playSound(name:string):void{
        this.getSound(name).play();
    }

    /**
     * Load a sound into AudioManager.sounds, storing it under the name `name`.
     * Returns a promise that can be await-ed to make sure sound is loaded.
     * @param name name for tracking the sound
     * @param path path of the sound file. If not provided, assumed to be the same as name.
     * @param howlOptions howl options, if you want to customize more
     * @returns {Promise<unknown>}
     * @constructor
     */
    LoadSound(name:string, path?:string, howlOptions?:HowlOptions){
        const self = this;
        path = path? path:name;
        howlOptions = howlOptions? howlOptions : {
            src: path
        }

        return new Promise((resolve, reject) => {
            howlOptions = Object.assign(
                {
                    src: path,
                    volume: 1.0,
                    preload: true,
                    onplayerror: (soundID:number, error:HowlErrorCallback | undefined) =>
                        console.error("Can't play an audio file: " + error),
                    onloaderror: (soundID:number, error:HowlErrorCallback | undefined) =>
                        console.error('Error while loading an audio file: ' + error),
                },
                howlOptions,
                {
                    onload: resolve,
                    onloaderror: (soundId: number, error?: string) => reject(error),
                }
            );
            this._sounds[name] = new Howl(
                howlOptions,
            );
        });
    }
}

export const AudioManager = new AAudioManager();


