/**
 * VoxelVibe Engine - Audio System
 * Web Audio API-based sound manager for game audio effects.
 */

export interface AudioState {
	ctx: AudioContext | null;
	masterVolume: GainNode | null;
	sfxVolume: GainNode | null;
	soundEnabled: boolean;
	noiseBuffer: AudioBuffer | null;
}

/** Creates a new audio state (uninitialized). */
export function createAudioState(): AudioState {
	return {
		ctx: null,
		masterVolume: null,
		sfxVolume: null,
		soundEnabled: true,
		noiseBuffer: null,
	};
}

/** Initializes the Web Audio API context and gain nodes. */
export function initAudio(state: AudioState): boolean {
	try {
		const AudioCtor = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
		if (!AudioCtor) return false;

		state.ctx = new AudioCtor();
		state.masterVolume = state.ctx!.createGain();
		state.sfxVolume = state.ctx!.createGain();
		state.masterVolume.connect(state.ctx!.destination);
		state.sfxVolume.connect(state.masterVolume);
		return true;
	} catch {
		state.soundEnabled = false;
		return false;
	}
}

/** Resumes a suspended audio context (required after user interaction). */
export function resumeAudio(state: AudioState): void {
	if (state.ctx && state.ctx.state === 'suspended') {
		state.ctx.resume();
	}
}

/** Applies volume levels to the gain nodes. */
export function applyVolume(state: AudioState, masterVol: number, sfxVol: number): void {
	if (state.masterVolume) state.masterVolume.gain.value = masterVol;
	if (state.sfxVolume) state.sfxVolume.gain.value = sfxVol;
}

/** Gets or creates a noise buffer for wind/ambient sounds. */
export function getNoiseBuffer(state: AudioState): AudioBuffer | null {
	if (state.noiseBuffer || !state.ctx) return state.noiseBuffer;
	const bufferSize = Math.floor(state.ctx.sampleRate * 2);
	const buffer = state.ctx.createBuffer(1, bufferSize, state.ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		data[i] = Math.random() * 2 - 1;
	}
	state.noiseBuffer = buffer;
	return buffer;
}

export interface SoundOptions {
	type: OscillatorType;
	startFreq: number;
	endFreq: number;
	duration: number;
	volume: number;
}

/** Plays a one-shot oscillator sound (for UI/menu feedback). */
export function playTone(state: AudioState, options: SoundOptions): void {
	if (!state.soundEnabled || !state.ctx || !state.sfxVolume) return;
	try {
		const osc = state.ctx.createOscillator();
		const gain = state.ctx.createGain();
		osc.type = options.type;
		osc.frequency.setValueAtTime(options.startFreq, state.ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(options.endFreq, state.ctx.currentTime + options.duration);
		gain.gain.setValueAtTime(options.volume, state.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + options.duration);
		osc.connect(gain);
		gain.connect(state.sfxVolume);
		osc.start();
		osc.stop(state.ctx.currentTime + options.duration);
	} catch {
		// Ignore audio errors
	}
}

/** Preset: menu navigation click sound */
export function playMenuNavigate(state: AudioState): void {
	playTone(state, { type: 'triangle', startFreq: 520, endFreq: 360, duration: 0.08, volume: 0.08 });
}

/** Preset: menu confirm/select sound */
export function playMenuConfirm(state: AudioState): void {
	playTone(state, { type: 'sine', startFreq: 820, endFreq: 520, duration: 0.12, volume: 0.12 });
}

/** Preset: achievement unlock sound */
export function playAchievement(state: AudioState): void {
	playTone(state, { type: 'triangle', startFreq: 660, endFreq: 980, duration: 0.18, volume: 0.14 });
}

export interface LoopingSound {
	source: AudioBufferSourceNode | null;
	gain: GainNode | null;
	filter: BiquadFilterNode | null;
}

/** Creates a looping noise-based sound (for wind). */
export function createWindSound(state: AudioState): LoopingSound | null {
	if (!state.soundEnabled || !state.ctx || !state.sfxVolume) return null;
	const buffer = getNoiseBuffer(state);
	if (!buffer) return null;

	const source = state.ctx.createBufferSource();
	const filter = state.ctx.createBiquadFilter();
	const gain = state.ctx.createGain();

	source.buffer = buffer;
	source.loop = true;
	filter.type = 'highpass';
	filter.frequency.value = 180;
	gain.gain.value = 0;

	source.connect(filter);
	filter.connect(gain);
	gain.connect(state.sfxVolume);
	source.start();

	return { source, gain, filter };
}

/** Stops and disconnects a looping sound. */
export function stopLoopingSound(sound: LoopingSound | null): void {
	if (!sound) return;
	try {
		sound.source?.stop();
		sound.source?.disconnect();
		sound.filter?.disconnect();
		sound.gain?.disconnect();
	} catch {
		// Ignore cleanup errors
	}
}
