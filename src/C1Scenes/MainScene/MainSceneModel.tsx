import React from "react";
import {
    AppState,
    AShaderMaterial,
    Color,
    DefaultMaterials,
    GetAppState,
    V2
} from "../../anigraph";
import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {HitBandModel, PianoKeyDefinition, PianoKeyLayout, PianoKeyModel} from "./nodes";
import {PianoSamplePlayer, PianoVoiceHandle} from "./PianoSamplePlayer";

const WHITE_KEY_WIDTH = 0.45;
const WHITE_KEY_HEIGHT = 2.6;
const WHITE_KEY_GAP = 0.05;
const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6;
const BLACK_KEY_HEIGHT = WHITE_KEY_HEIGHT * 0.62;

const NOTE_OFFSETS: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11
};

type RawKeySpec = { key: string; note: string; label?: string };

const RAW_PIANO_KEYS: RawKeySpec[] = [
    // White keys
    {key: "A", note: "C4"},
    {key: "S", note: "D4"},
    {key: "D", note: "E4"},
    {key: "F", note: "F4"},
    {key: "J", note: "G4"},
    {key: "K", note: "A4"},
    {key: "L", note: "B4"},
    {key: ";", note: "C5"},

    // Black keys
    {key: "W", note: "C#4"},
    {key: "E", note: "D#4"},
    {key: "T", note: "F#4"},
    {key: "I", note: "G#4"},
    {key: "O", note: "A#4"}
];

interface PianoKeyEntry {
    layout: PianoKeyLayout;
    model: PianoKeyModel;
}

let nErrors = 0;

export const DIFFICULTY_OPTIONS = [
    { label: "Easy",   beats: 3},
    { label: "Medium", beats: 2},
    { label: "Hard",   beats: 1}
];

export class MainSceneModel extends App2DSceneModel {
    private keyMaterial!: AShaderMaterial;
    private keyMap: Map<string, PianoKeyEntry> = new Map();
    private activeKeys: Set<string> = new Set();
    private activePhysicalToLogical: Map<string, string> = new Map();
    private audioPlayer = new PianoSamplePlayer();
    private activeVoices: Map<string, PianoVoiceHandle> = new Map();
    private gameActive: boolean = false;
    private hitBandHeight: number = 0.1;
    private hitBand: HitBandModel | null = null;
    private score: number = 0;
    private activeTiles: Set<PianoKeyModel> = new Set();

    // Tile fall speed
    private fallSpeedPerFrame: number = 0.015;
    private tileTravelBeats: number = 2;

    // Beat
    private bpm: number = 80; // tempo
    private readonly targetFPS: number = 60;
    private frameCounter: number = 0;
    private melodySchedule: { frame: number; note: string }[] = [];
    
    private melodyEvents: { note: string; beats: number }[] = [
        {note: "C4", beats: 1}, {note: "C4", beats: 1}, {note: "G4", beats: 1}, {note: "G4", beats: 1}, {note: "A4", beats: 1}, {note: "A4", beats: 1}, {note: "G4", beats: 2},
        {note: "F4", beats: 1}, {note: "F4", beats: 1}, {note: "E4", beats: 1}, {note: "E4", beats: 1}, {note: "D4", beats: 1}, {note: "D4", beats: 1}, {note: "C4", beats: 2},
        {note: "G4", beats: 1}, {note: "G4", beats: 1}, {note: "F4", beats: 1}, {note: "F4", beats: 1}, {note: "E4", beats: 1}, {note: "E4", beats: 1}, {note: "D4", beats: 2},
        {note: "G4", beats: 1}, {note: "G4", beats: 1}, {note: "F4", beats: 1}, {note: "F4", beats: 1}, {note: "E4", beats: 1}, {note: "E4", beats: 1}, {note: "D4", beats: 2},
        {note: "C4", beats: 1}, {note: "C4", beats: 1}, {note: "G4", beats: 1}, {note: "G4", beats: 1}, {note: "A4", beats: 1}, {note: "A4", beats: 1}, {note: "G4", beats: 2},
        {note: "F4", beats: 1}, {note: "F4", beats: 1}, {note: "E4", beats: 1}, {note: "E4", beats: 1}, {note: "D4", beats: 1}, {note: "D4", beats: 1}, {note: "C4", beats: 2}
    ];


    initAppState(appState: AppState) {
        appState.setReactGUIContentFunction(() => {
            const containerStyle: React.CSSProperties = {
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
                fontSize: "0.9rem"
            };
            const titleStyle: React.CSSProperties = {
                fontWeight: 600,
                fontSize: "1rem"
            };
            const subtitleStyle: React.CSSProperties = {
                fontSize: "0.85rem",
                opacity: 0.75
            };
            return (
                <div style={containerStyle}>
                    <div style={titleStyle}>Piano Tiles</div>
                    <div style={subtitleStyle}>
                        {this.gameActive ?
                            `Score: ${this.score}` :
                            "Press Enter to start game, or just play piano freely"}
                    </div>
                </div>
            );
        });
    }

    initScene() {
        const appState = GetAppState();
        this.keyMaterial = appState.CreateMaterial(DefaultMaterials.RGBA_SHADER) as AShaderMaterial;

        const definitions = this.buildKeyDefinitions();
        const {whiteLayouts, blackLayouts} = this.buildLayouts(definitions);
        void this.audioPlayer.preload(definitions);

        this.keyMap.clear();
        this.activeKeys.clear();

        whiteLayouts.forEach((layout) => this.addKey(layout));
        blackLayouts.forEach((layout) => this.addKey(layout));

        this.signalComponentUpdate();
    }

    public setTileTravelBeats(beats: number): void {
        this.tileTravelBeats = beats;
    }

    handleKeyDown(rawKey: string, isShift: boolean = false, isSpace: boolean = false): boolean {
        const base = MainSceneModel.normalizeKey(rawKey);
        if (!base) return false;

        // Handle Enter key for game start/stop
        if (base === "Enter") {
            if (this.gameActive) {
                this.stopGame();
            } else {
                this.startGame();
            }
            return true;
        }

        let lookupBase = base;
        let suffix: "_LOW" | "_MID" | "_HIGH";

        if (base === ";") {
            if (isShift) {
                lookupBase = ";";
                suffix = "_HIGH";
            } else if (isSpace) {
                lookupBase = "A";
                suffix = "_MID";
            } else {
                lookupBase = "A";
                suffix = "_HIGH";
            }
        } else {
            suffix = isShift ? "_HIGH" : isSpace ? "_LOW" : "_MID";
        }

        const lookupKey = lookupBase + suffix;
        const entry = this.keyMap.get(lookupKey);
        if (!entry) return false;

        // GAME LOGIC FOR HITTING A TILE
        if (this.gameActive && this.hitBand) {
            let tileToHit: PianoKeyModel | null = null;
            let lowestYInBand = Infinity;

            const hitBandGeom = {
                centerY: this.hitBand.transform.position.y,
                height: this.hitBandHeight
            };
            const hitBandTop = hitBandGeom.centerY + hitBandGeom.height * this.sceneScale;
            const hitBandBottom = hitBandGeom.centerY - hitBandGeom.height * this.sceneScale; 

            // Find the lowest tile within the hit band that matches the key press
            this.activeTiles.forEach(tile => {
                const tileCenterY = tile.transform.position.y;
                if (tileCenterY <= hitBandTop && tileCenterY >= hitBandBottom) {
                    if (tile.definition.eventKey === lookupKey) {
                        if (tileCenterY < lowestYInBand) {
                            lowestYInBand = tileCenterY;
                            tileToHit = tile;
                        }
                    }
                }
            });

            if (tileToHit) {
                this.score += 1; // Increase score
                this.removeChild(tileToHit); // Remove the hit tile
                this.activeTiles.delete(tileToHit);
            }
        }
        // END GAME LOGIC

        const existingVoice = this.activeVoices.get(lookupKey);
        if (existingVoice) {
            existingVoice.stop();
            this.activeVoices.delete(lookupKey);
        }

        entry.model.setActive(true);
        this.activeKeys.add(lookupKey);

        this.activePhysicalToLogical.set(base, lookupKey);

        let newVoice: PianoVoiceHandle | undefined;
        const onVoiceEnded = () => {
            const current = this.activeVoices.get(lookupKey);
            if (current === newVoice) {
                this.activeVoices.delete(lookupKey);
            }
        };
        newVoice = this.audioPlayer.play(entry.model.definition, onVoiceEnded);
        if (newVoice) {
            this.activeVoices.set(lookupKey, newVoice);
        }
        this.signalComponentUpdate();
        return true;
    }

    handleKeyUp(rawKey: string, isShift: boolean = false, isSpace: boolean = false): boolean {
        const base = MainSceneModel.normalizeKey(rawKey);
        const logicalKey = this.activePhysicalToLogical.get(base);
        if (!logicalKey) return false;

        const entry = this.keyMap.get(logicalKey);
        if (!entry) return false;

        entry.model.setActive(false);
        this.activeKeys.delete(logicalKey);
        this.activePhysicalToLogical.delete(base);

        const voice = this.activeVoices.get(logicalKey);
        if (voice) {
            voice.stop();
            this.activeVoices.delete(logicalKey);
        }

        this.signalComponentUpdate();
        return true;
    }

    getActiveLabels(): string[] {
        const labels: string[] = [];
        this.activeKeys.forEach((key) => {
            const entry = this.keyMap.get(key);
            if (entry) {
                labels.push(entry.model.definition.label);
            }
        });
        return labels;
    }

    static normalizeKey(value: string): string {
        if (!value) {
            return value;
        }
        if (value === "Space" || value === "Spacebar") {
            return " ";
        }
        if (value === " ") {
            return value;
        }
        if (value === "Enter") {
            return "Enter";
        }
        if (value.length === 1 && /[a-z]/i.test(value)) {
            return value.toUpperCase();
        }
        if (value === ":") {
            return ";";
        }
        return value;
    }

    private buildKeyDefinitions(): PianoKeyDefinition[] {
        const makeDef = (spec: RawKeySpec, octaveShift: number, suffix: "_LOW" | "_MID" | "_HIGH"): PianoKeyDefinition => {
            const noteData = this.parseNote(spec.note);
            const shiftedMidi = noteData.midi + octaveShift * 12;
            const shiftedNote = spec.note.replace(/\d+$/, (m) => String(Number(m) + octaveShift));
            const baseLabel = spec.label ?? spec.key;
            let label = baseLabel;
            if (suffix === "_LOW") {
                label = `${baseLabel}-`;
            } else if (suffix === "_HIGH") {
                label = `${baseLabel}+`;
            }
            return {
                eventKey: MainSceneModel.normalizeKey(spec.key) + suffix,
                label,
                note: shiftedNote,
                midi: shiftedMidi,
                frequency: this.midiToFrequency(shiftedMidi),
                isSharp: noteData.accidental === "#"
            };
        };

        const defs: PianoKeyDefinition[] = [];
        for (const spec of RAW_PIANO_KEYS) {
            if (spec.key === ";") {
                defs.push(makeDef(spec, +1, "_HIGH"));
                continue;
            }
            // For all other keys, include LOW/MID/HIGH
            defs.push(makeDef(spec, -1, "_LOW"));
            defs.push(makeDef(spec, 0, "_MID"));
            defs.push(makeDef(spec, +1, "_HIGH"));
        }
        return defs.sort((a, b) => a.midi - b.midi);
    }

    private buildLayouts(definitions: PianoKeyDefinition[]): { whiteLayouts: PianoKeyLayout[]; blackLayouts: PianoKeyLayout[] } {
        const whiteDefs = definitions.filter((d) => !d.isSharp).sort((a, b) => a.midi - b.midi);
        const blackDefs = definitions.filter((d) => d.isSharp).sort((a, b) => a.midi - b.midi);

        const whiteLayouts: PianoKeyLayout[] = [];
        const naturalPosition = new Map<string, number>();

        whiteDefs.forEach((def, index) => {
            const centerX = index * (WHITE_KEY_WIDTH + WHITE_KEY_GAP);
            const layout: PianoKeyLayout = {
                definition: def,
                centerX,
                centerY: WHITE_KEY_HEIGHT * 0.5,
                width: WHITE_KEY_WIDTH,
                height: WHITE_KEY_HEIGHT
            };
            whiteLayouts.push(layout);
            naturalPosition.set(def.note, layout.centerX);
        });

        const blackLayouts: PianoKeyLayout[] = [];
        blackDefs.forEach((def) => {
            const naturalNote = def.note.replace("#", "");
            const baseCenter = naturalPosition.get(naturalNote);
            if (baseCenter === undefined) {
                return;
            }
            const nextNatural = this.getNextNaturalNote(naturalNote);
            const neighborCenter = naturalPosition.has(nextNatural)
                ? naturalPosition.get(nextNatural)!
                : baseCenter + WHITE_KEY_WIDTH + WHITE_KEY_GAP;
            const layout: PianoKeyLayout = {
                definition: def,
                centerX: baseCenter + 0.5 * (neighborCenter - baseCenter),
                centerY: WHITE_KEY_HEIGHT - BLACK_KEY_HEIGHT * 0.5,
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT
            };
            blackLayouts.push(layout);
        });

        let minLeft = Infinity;
        let maxRight = -Infinity;
        const consider = [...whiteLayouts, ...blackLayouts];
        let minBottom = Infinity;
        let maxTop = -Infinity;
        consider.forEach((layout) => {
            const left = layout.centerX - layout.width * 0.5;
            const right = layout.centerX + layout.width * 0.5;
            const bottom = layout.centerY - layout.height * 0.5;
            const top = layout.centerY + layout.height * 0.5;
            minLeft = Math.min(minLeft, left);
            maxRight = Math.max(maxRight, right);
            minBottom = Math.min(minBottom, bottom);
            maxTop = Math.max(maxTop, top);
        });
        const offset = (minLeft + maxRight) * 0.5;
        consider.forEach((layout) => {
            layout.centerX -= offset;
            layout.centerY -= WHITE_KEY_HEIGHT * 0.5;
        });

        const widthSpan = maxRight - minLeft;
        const heightSpan = maxTop - minBottom;
        const desiredWidthSpan = this.sceneScale * 1.8;
        const desiredHeightSpan = this.sceneScale * 0.8;
        const scaleX = widthSpan > 0 ? desiredWidthSpan / widthSpan : 1;
        const scaleY = heightSpan > 0 ? desiredHeightSpan / heightSpan : 1;
        if ((scaleX > 0 && Math.abs(scaleX - 1) > 0.0001) || (scaleY > 0 && Math.abs(scaleY - 1) > 0.0001)) {
            consider.forEach((layout) => {
                if (scaleX > 0) {
                    layout.centerX *= scaleX;
                    layout.width *= scaleX;
                }
                if (scaleY > 0) {
                    layout.centerY *= scaleY;
                    layout.height *= scaleY;
                }
            });
        }

        let currentBottom = Infinity;
        consider.forEach((layout) => {
            const bottom = layout.centerY - layout.height * 0.5;
            currentBottom = Math.min(currentBottom, bottom);
        });
        if (currentBottom !== Infinity) {
            const desiredBottom = -this.sceneScale * 0.9;
            const deltaY = desiredBottom - currentBottom;
            consider.forEach((layout) => {
                layout.centerY += deltaY;
            });
        }

        return {whiteLayouts, blackLayouts};
    }

    private addKey(layout: PianoKeyLayout) {
        const baseColor = layout.definition.isSharp ? Color.FromString("#111111") : Color.FromString("#f5f5f5");
        const activeColor = layout.definition.isSharp ? Color.FromString("#5ec9ff") : Color.FromString("#95c3ff");
        const keyModel = new PianoKeyModel(layout, baseColor, activeColor);
        keyModel.setMaterial(this.keyMaterial);
        keyModel.transform.position = V2(layout.centerX, layout.centerY);
        keyModel.zValue = layout.definition.isSharp ? 0.5 : 0.0;
        this.addChild(keyModel);

        this.keyMap.set(layout.definition.eventKey, {
            layout,
            model: keyModel
        });
    }

    private parseNote(note: string): { base: string; accidental: string; octave: number; midi: number } {
        const match = note.match(/^([A-G])(#?)(\d)$/);
        if (!match) {
            throw new Error(`Invalid note format: ${note}`);
        }
        const [, base, accidental, octaveStr] = match;
        const octave = parseInt(octaveStr, 10);
        const key = accidental === "#" ? `${base}#` : base;
        const offset = NOTE_OFFSETS[key];
        const midi = (octave + 1) * 12 + offset;
        return {base, accidental, octave, midi};
    }

    private midiToFrequency(midi: number): number {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    private getNextNaturalNote(note: string): string {
        const match = note.match(/^([A-G])(\d)$/);
        if (!match) {
            return note;
        }
        const [, letter, octaveStr] = match;
        const octave = parseInt(octaveStr, 10);
        const order = ["C", "D", "E", "F", "G", "A", "B"];
        const index = order.indexOf(letter);
        const nextLetter = order[(index + 1) % order.length];
        const nextOctave = letter === "B" ? octave + 1 : octave;
        return `${nextLetter}${nextOctave}`;
    }

    private startGame() {
        this.gameActive = true;
        this.frameCounter = 0;
        this.melodySchedule = [];

        const keyboardWidth = this.sceneScale * 1.8;
        const tileHeightWorld = this.getTileHeightWorld();
        let bandHeightWorld = this.hitBandHeight * this.sceneScale;
        if (tileHeightWorld > 0) {
            bandHeightWorld = tileHeightWorld;
            if (this.sceneScale !== 0) {
                this.hitBandHeight = tileHeightWorld / this.sceneScale;
            }
        }
        this.hitBand = new HitBandModel(keyboardWidth, bandHeightWorld);
        this.hitBand.setMaterial(this.keyMaterial);
        
        const liftAmount = bandHeightWorld / 3;
        this.hitBand.transform.position = V2(0, -bandHeightWorld * 0.5 + liftAmount);
        this.addChild(this.hitBand);

        this.buildMelodySchedule();
        
        this.signalComponentUpdate();
    }

    private stopGame() {
        this.gameActive = false;
        this.score = 0;

        if (this.hitBand) {
            this.removeChild(this.hitBand);
            this.hitBand = null;
        }

        this.activeTiles.forEach(tile => {
            this.removeChild(tile);
        });
        this.activeTiles.clear();
        
        this.signalComponentUpdate();
    }

    private spawnRandomTile(): void {
        const allKeyEntries = Array.from(this.keyMap.values());
        
        if (allKeyEntries.length > 0) {
            const randomIndex = Math.floor(Math.random() * allKeyEntries.length);
            const randomKeyEntry = allKeyEntries[randomIndex];
            
            const tileLayout: PianoKeyLayout = {
                ...randomKeyEntry.layout,
                width: randomKeyEntry.layout.width * 1,
                height: randomKeyEntry.layout.width * 2,
                centerX: 0,
                centerY: 0
            };

            // Create tile
            const tileBaseColor = Color.FromString("#4287f5");
            const tileActiveColor = Color.FromString("#42f5ef");
            
            const modifiedDef = {
                ...tileLayout.definition,
                isSharp: true
            };
            const tileLayoutWithBlackKeyStyle = {
                ...tileLayout,
                definition: modifiedDef
            };
            
            const tile = new PianoKeyModel(tileLayoutWithBlackKeyStyle, tileBaseColor, tileActiveColor);
            
            // Set material and position at the top
            tile.setMaterial(this.keyMaterial);
            tile.transform.position = V2(randomKeyEntry.layout.centerX, this.sceneScale);
            this.addChild(tile);
            this.activeTiles.add(tile);
        }
    }

    private spawnTileForNote(targetNote: string): void {
        const allKeyEntries = Array.from(this.keyMap.values());
        if (allKeyEntries.length === 0) return;

        const entry = allKeyEntries.find(e => e.model.definition.note === targetNote);
        const chosen = entry ?? allKeyEntries[Math.floor(Math.random() * allKeyEntries.length)];

        const tileLayout: PianoKeyLayout = {
            ...chosen.layout,
            width: chosen.layout.width * 1,
            height: chosen.layout.width * 2,
            centerX: 0,
            centerY: 0
        };

        const tileBaseColor = Color.FromString("#4287f5");
        const tileActiveColor = Color.FromString("#42f5ef");

        const modifiedDef = {
            ...tileLayout.definition,
            isSharp: true
        };
        const tileLayoutWithBlackKeyStyle = {
            ...tileLayout,
            definition: modifiedDef
        };

        const tile = new PianoKeyModel(tileLayoutWithBlackKeyStyle, tileBaseColor, tileActiveColor);
        tile.setMaterial(this.keyMaterial);
        tile.transform.position = V2(chosen.layout.centerX, this.sceneScale);
        this.addChild(tile);
        this.activeTiles.add(tile);
    }

    private getTileHeightWorld(): number {
        const entries = Array.from(this.keyMap.values());
        if (entries.length === 0) {
            return this.hitBandHeight * this.sceneScale;
        }
        const reference = entries.find(e => !e.model.definition.isSharp) ?? entries[0];
        return reference.layout.width * 2;
    }

    private buildMelodySchedule(): void {
        if (!this.hitBand) return;

        const framesPerBeat = Math.max(1, Math.round(this.targetFPS * (60 / this.bpm)));
        const spawnY = this.sceneScale;
        const hitY = this.hitBand.transform.position.y;
        const travelDistance = Math.max(0, spawnY - hitY);
        let travelFrames = 1;
        if (travelDistance > 0) {
            const desiredTravelFrames = Math.max(1, Math.round(framesPerBeat * this.tileTravelBeats));
            this.fallSpeedPerFrame = travelDistance / desiredTravelFrames;
            travelFrames = desiredTravelFrames;
        }

        let hitFrame = 0;
        const rawSchedule: { frame: number; note: string }[] = [];
        this.melodyEvents.forEach(evt => {
            const spawnFrame = hitFrame - travelFrames;
            rawSchedule.push({frame: spawnFrame, note: evt.note});
            hitFrame += evt.beats * framesPerBeat;
        });

        const minFrame = rawSchedule.reduce((m, e) => Math.min(m, e.frame), 0);
        const offset = minFrame < 0 ? -minFrame : 0;
        this.melodySchedule = rawSchedule
            .map(e => ({frame: e.frame + offset, note: e.note}))
            .sort((a, b) => a.frame - b.frame);
    }

    timeUpdate(t: number) {
        try {
            if (this.gameActive) {
                // Beat-scheduled spawns
                this.frameCounter++;
                while (this.melodySchedule.length > 0 && this.melodySchedule[0].frame <= this.frameCounter) {
                    const evt = this.melodySchedule.shift()!;
                    this.spawnTileForNote(evt.note);
                }

                const tilesToRemove: PianoKeyModel[] = [];

                // Move active tiles downward
                this.activeTiles.forEach(tile => {
                    const speed = this.fallSpeedPerFrame;
                    tile.transform.position = tile.transform.position.plus(V2(0, -speed));

                    // Check if tile has been missed
                    if (this.hitBand) {
                        const tileHeight = tile.layoutHeight;
                        const tileBottom = tile.transform.position.y - (tileHeight * 0.5);
                        const hitBandBottom = this.hitBand.transform.position.y - this.hitBandHeight * this.sceneScale * 0.5;

                        if (tileBottom < hitBandBottom) {
                            tilesToRemove.push(tile);
                            this.score -= 1;
                        }
                    }
                });

                if (tilesToRemove.length > 0) {
                    tilesToRemove.forEach(tile => {
                        this.removeChild(tile);
                        this.activeTiles.delete(tile);
                    });
                    this.signalComponentUpdate();
                }

                // End logic
                if (this.melodySchedule.length === 0 && this.activeTiles.size === 0) {
                    this.stopGame();
                }
            }
        } catch (e) {
            if (nErrors < 1) {
                console.error(e);
                nErrors += 1;
            }
        }
    }
}
