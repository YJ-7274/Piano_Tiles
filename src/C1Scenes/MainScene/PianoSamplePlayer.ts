import {PianoKeyDefinition} from "./nodes";

interface PianoSamplePlayerOptions {
    basePath?: string;
    extension?: string;
    masterGain?: number;
    attackSeconds?: number;
    releaseSeconds?: number;
}

export interface PianoVoiceHandle {
    stop: () => void;
}

const DEFAULT_OPTIONS: Required<PianoSamplePlayerOptions> = {
    basePath: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3",
    extension: "mp3",
    masterGain: 0.6,
    attackSeconds: 0.01,
    releaseSeconds: 0.7
};

const NOTE_REGEX = /^([A-Ga-g])(#?)(\d)$/;

/**
 * Handles loading and playing back sampled piano notes using a single Steinway timbre set.
 */
export class PianoSamplePlayer {
    private readonly options: Required<PianoSamplePlayerOptions>;
    private context?: AudioContext;
    private masterGain?: GainNode;
    private buffers: Map<string, AudioBuffer> = new Map();
    private pending: Map<string, Promise<AudioBuffer | undefined>> = new Map();
    private failedUrls: Set<string> = new Set();

    constructor(options?: PianoSamplePlayerOptions) {
        this.options = {...DEFAULT_OPTIONS, ...options};
    }

    async preload(definitions: PianoKeyDefinition[]): Promise<void> {
        const unique = new Set<string>();
        definitions.forEach((def) => {
            unique.add(this.normalizeNote(def.note));
        });
        const noteList: string[] = [];
        unique.forEach((note) => noteList.push(note));
        await Promise.all(noteList.map((note) => this.requestBuffer(note).catch(() => undefined)));
    }

    play(definition: PianoKeyDefinition, onEnded?: () => void): PianoVoiceHandle | undefined {
        const context = this.ensureContext();
        if (!context || !this.masterGain) {
            return undefined;
        }

        const noteKey = this.normalizeNote(definition.note);
        const buffer = this.buffers.get(noteKey);
        if (buffer) {
            return this.playBuffer(context, buffer, onEnded);
        }

        // Trigger load for future presses.
        void this.requestBuffer(noteKey);
        console.warn(`[PianoSamplePlayer] Sample not ready for "${noteKey}"`);
        return undefined;
    }

    private ensureContext(): AudioContext | undefined {
        if (typeof window === "undefined") {
            return undefined;
        }
        if (!this.context) {
            const Constructor = window.AudioContext || (window as any).webkitAudioContext;
            if (!Constructor) {
                return undefined;
            }
            this.context = new Constructor();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.options.masterGain;
            this.masterGain.connect(this.context.destination);
        }
        if (this.context.state === "suspended") {
            this.context.resume().catch(() => undefined);
        }
        return this.context;
    }

    private async requestBuffer(noteKey: string): Promise<AudioBuffer | undefined> {
        if (this.buffers.has(noteKey)) {
            return this.buffers.get(noteKey);
        }
        if (this.pending.has(noteKey)) {
            return this.pending.get(noteKey);
        }

        const promise = this.loadBuffer(noteKey)
            .then((buffer) => {
                if (buffer) {
                    this.buffers.set(noteKey, buffer);
                }
                this.pending.delete(noteKey);
                return buffer;
            })
            .catch(() => {
                this.pending.delete(noteKey);
                return undefined;
            });

        this.pending.set(noteKey, promise);
        return promise;
    }

    private async loadBuffer(noteKey: string): Promise<AudioBuffer | undefined> {
        const context = this.ensureContext();
        if (!context) {
            return undefined;
        }
        const urls = this.buildSampleUrl(noteKey, this.options.basePath);
        for (const url of urls) {
            if (this.failedUrls.has(url)) {
                continue;
            }
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                return await context.decodeAudioData(arrayBuffer.slice(0));
            } catch (error) {
                if (!this.failedUrls.has(url)) {
                    console.warn(`[PianoSamplePlayer] Failed to load sample "${url}":`, error);
                    this.failedUrls.add(url);
                }
            }
        }
        return undefined;
    }

    private playBuffer(context: AudioContext, buffer: AudioBuffer, onEnded?: () => void): PianoVoiceHandle {
        if (!this.masterGain) {
            return {stop: () => undefined};
        }
        const source = context.createBufferSource();
        source.buffer = buffer;

        const gain = context.createGain();
        const now = context.currentTime;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(1.0, now + this.options.attackSeconds);

        source.connect(gain);
        gain.connect(this.masterGain);

        let stopped = false;
        const releaseDuration = Math.max(0.05, this.options.releaseSeconds);

        const cleanup = () => {
            if (!stopped) {
                stopped = true;
            }
            onEnded?.();
        };

        source.onended = cleanup;

        source.start(now);

        const stop = () => {
            if (stopped) {
                return;
            }
            stopped = true;
            const current = context.currentTime;
            gain.gain.cancelScheduledValues(current);
            const currentValue = gain.gain.value;
            gain.gain.setValueAtTime(currentValue, current);
            const releaseEnd = current + releaseDuration;
            gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
            source.stop(releaseEnd + 0.02);
        };

        return {stop};
    }

    private buildSampleUrlCandidates(noteKey: string, basePath: string): string[] {
        const variants = new Set<string>();
        const match = NOTE_REGEX.exec(noteKey);
        if (match) {
            const [, letterRaw, accidental, octave] = match;
            const letter = letterRaw.toUpperCase();
            if (accidental === "#") {
                const enharmonic = this.toFlat(letter);
                variants.add(`${letter}s${octave}`);
                variants.add(`${letter}sharp${octave}`);
                variants.add(`${letter}#${octave}`);
                if (enharmonic) {
                    variants.add(`${enharmonic}${octave}`);
                }
            } else {
                variants.add(`${letter}${octave}`);
            }
        } else {
            variants.add(noteKey.toUpperCase());
        }
        const urls: string[] = [];
        variants.forEach((name) => {
            urls.push(`${basePath}/${encodeURIComponent(name)}.${this.options.extension}`);
        });
        return urls;
    }

    private buildSampleUrl(noteKey: string, basePath: string): string[] {
        return this.buildSampleUrlCandidates(noteKey, basePath);
    }

    private toFlat(letter: string): string | undefined {
        switch (letter) {
            case "C":
                return "Db";
            case "D":
                return "Eb";
            case "F":
                return "Gb";
            case "G":
                return "Ab";
            case "A":
                return "Bb";
            default:
                return undefined;
        }
    }

    private normalizeNote(note: string): string {
        const match = NOTE_REGEX.exec(note);
        if (!match) {
            return note.toUpperCase();
        }
        const [, letterRaw, accidental, octave] = match;
        const letter = letterRaw.toUpperCase();
        const accidentalPart = accidental === "#" ? "#" : "";
        return `${letter}${accidentalPart}${octave}`;
    }
}
