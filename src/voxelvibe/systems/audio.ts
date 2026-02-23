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

// ============================================================
// Game-specific one-shot sound effects
// ============================================================

export function playMenuNavigateSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(360, state.ctx!.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.08);
    } catch (e) {
        console.warn('Error playing menu navigate sound:', e);
    }
}

export function playMenuConfirmSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, state.ctx!.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.12);
    } catch (e) {
        console.warn('Error playing menu confirm sound:', e);
    }
}

export function playAchievementSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(980, state.ctx!.currentTime + 0.18);
        gain.gain.setValueAtTime(0.14, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.2);
    } catch (e) {
        console.warn('Error playing achievement sound:', e);
    }
}

export function playVictoryStinger(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    const now = state.ctx!.currentTime;
    const osc = state.ctx!.createOscillator();
    const gain = state.ctx!.createGain();
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.0, now);
    const notes = [392, 523, 659];
    notes.forEach((freq, idx) => {
        const t = now + idx * 0.18;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
    });
    osc.connect(gain);
    gain.connect(state.sfxVolume!);
    osc.start(now);
    osc.stop(now + 0.6);
}

export function playDefeatStinger(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    const now = state.ctx!.currentTime;
    const osc = state.ctx!.createOscillator();
    const gain = state.ctx!.createGain();
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0, now);
    const notes = [330, 277, 220];
    notes.forEach((freq, idx) => {
        const t = now + idx * 0.2;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    });
    osc.connect(gain);
    gain.connect(state.sfxVolume!);
    osc.start(now);
    osc.stop(now + 0.7);
}

export function playCannonSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        const gain = state.ctx!.createGain();
        const filter = state.ctx!.createBiquadFilter();
        
        // White noise burst for gunshot
        const bufferSize = Math.floor(state.ctx!.sampleRate * 0.05);  // 50ms
        const buffer = state.ctx!.createBuffer(1, bufferSize, state.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = state.ctx!.createBufferSource();
        noise.buffer = buffer;
        
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        gain.gain.setValueAtTime(0.25, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.05);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(state.sfxVolume!);
        
        noise.start();
    } catch (e) {
        console.warn('Error playing cannon sound:', e);
    }
}

// Rocket Launch Sound
export function playRocketSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        
        // Whoosh sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, state.ctx!.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.18, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.3);
    } catch (e) {
        console.warn('Error playing rocket sound:', e);
    }
}

// Missile Launch Sound (Hellfire/Stinger)
export function playMissileSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        // Higher pitched than rocket
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, state.ctx!.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.12, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.5);
    } catch (e) {
        console.warn('Error playing missile sound:', e);
    }
}

// Explosion Sound
export function playExplosionSound(state: AudioState, size: string = 'medium'): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        const duration = size === 'large' ? 0.5 : size === 'medium' ? 0.35 : 0.2;
        const volume = size === 'large' ? 0.35 : size === 'medium' ? 0.25 : 0.15;
        
        // Low frequency rumble + noise
        const osc = state.ctx!.createOscillator();
        const noiseGain = state.ctx!.createGain();
        const oscGain = state.ctx!.createGain();
        const filter = state.ctx!.createBiquadFilter();
        
        // Noise component
        const bufferSize = Math.floor(state.ctx!.sampleRate * duration);
        const buffer = state.ctx!.createBuffer(1, bufferSize, state.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = state.ctx!.createBufferSource();
        noise.buffer = buffer;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, state.ctx!.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, state.ctx!.currentTime + duration);
        
        noiseGain.gain.setValueAtTime(volume, state.ctx!.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(state.sfxVolume!);
        
        // Bass thump
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, state.ctx!.currentTime + duration);
        
        oscGain.gain.setValueAtTime(volume * 0.5, state.ctx!.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + duration);
        
        osc.connect(oscGain);
        oscGain.connect(state.sfxVolume!);
        
        noise.start();
        osc.start();
        osc.stop(state.ctx!.currentTime + duration);
    } catch (e) {
        console.warn('Error playing explosion sound:', e);
    }
}

// Hit Sound (bullet impact)
export function playHitSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 150;
        
        gain.gain.setValueAtTime(0.12, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.05);
    } catch (e) {
        console.warn('Error playing hit sound:', e);
    }
}

// Missile Warning Alarm
export function playMissileWarningBeep(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        // Beeping alarm
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 800;
        
        gain.gain.setValueAtTime(0.15, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.1);
    } catch (e) {
        console.warn('Error playing warning beep:', e);
    }
}

export function playDamageSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        // Crunch/impact sound
        const bufferSize = Math.floor(state.ctx!.sampleRate * 0.1);
        const buffer = state.ctx!.createBuffer(1, bufferSize, state.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        
        const noise = state.ctx!.createBufferSource();
        noise.buffer = buffer;
        
        const gain = state.ctx!.createGain();
        gain.gain.value = 0.25;
        
        noise.connect(gain);
        gain.connect(state.sfxVolume!);
        
        noise.start();
    } catch (e) {
        console.warn('Error playing damage sound:', e);
    }
}

// Countermeasure Deploy Sound
export function playCountermeasureSound(state: AudioState): void {
    if (!state.soundEnabled || !state.ctx) return;
    
    try {
        const osc = state.ctx!.createOscillator();
        const gain = state.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, state.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, state.ctx!.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.1, state.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, state.ctx!.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(state.sfxVolume!);
        
        osc.start();
        osc.stop(state.ctx!.currentTime + 0.15);
    } catch (e) {
        console.warn('Error playing countermeasure sound:', e);
    }
}
