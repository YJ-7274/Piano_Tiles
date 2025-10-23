// const DEBUG = true;
const DEBUG = false;

export class GameConfigs{
    static WanderingCats= ! DEBUG;
    // static WanderingCats= false;
    static CustomCatPlacement=DEBUG;
    static nCats=10;
    static GameWorldScale:number=10;
    static UseTextures=true;
    static LabCatIsWatching:boolean=!DEBUG;
    static PLAYER_TURNSPEED=0.03;
    static PLAYER_MOVESPEED = 0.08;
}
