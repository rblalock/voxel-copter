/**
 * VoxelVibe Engine - Game State Machine
 * Manages game states, transitions, settings, and profile persistence.
 */

/** All possible game states. */
export const GAME_STATES = {
	TITLE: 'title',
	MENU: 'menu',
	CAMPAIGN: 'campaign',
	FREEPLAY: 'freeplay',
	SETTINGS: 'settings',
	ACHIEVEMENTS: 'achievements',
	LEADERBOARD: 'leaderboard',
	HOWTO: 'howto',
	BRIEFING: 'briefing',
	PLAYING: 'playing',
	PAUSED: 'paused',
	VICTORY: 'victory',
	DEFEAT: 'defeat',
	MISSION_GENERATOR: 'mission_generator',
	CUSTOM_MISSION: 'custom_mission',
} as const;

export type GameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];

/** Game modes. */
export const GAME_MODES = {
	COMANCHE: 'comanche',
	DELTA: 'delta',
} as const;

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

/** Checks if a state is a menu/UI state (not gameplay). */
export function isMenuState(state: string): boolean {
	return (
		state === GAME_STATES.TITLE ||
		state === GAME_STATES.MENU ||
		state === GAME_STATES.CAMPAIGN ||
		state === GAME_STATES.FREEPLAY ||
		state === GAME_STATES.SETTINGS ||
		state === GAME_STATES.ACHIEVEMENTS ||
		state === GAME_STATES.LEADERBOARD ||
		state === GAME_STATES.HOWTO ||
		state === GAME_STATES.BRIEFING ||
		state === GAME_STATES.VICTORY ||
		state === GAME_STATES.DEFEAT ||
		state === GAME_STATES.MISSION_GENERATOR ||
		state === GAME_STATES.CUSTOM_MISSION
	);
}

/** Screen transition state. */
export interface TransitionState {
	active: boolean;
	startTime: number;
	duration: number;
	targetState: string | null;
	phase: 'fadeOut' | 'hold' | 'fadeIn';
	holdForCallback: boolean;
	onSwitch: (() => void) | null;
	progress: number;
}

/** Creates initial transition state. */
export function createTransitionState(): TransitionState {
	return {
		active: false,
		startTime: 0,
		duration: 500,
		targetState: null,
		phase: 'fadeOut',
		holdForCallback: false,
		onSwitch: null,
		progress: 0,
	};
}

/** Starts a screen transition. */
export function startTransition(
	state: TransitionState,
	targetState: string,
	duration: number,
	options?: { hold?: boolean; onSwitch?: () => void },
): void {
	state.active = true;
	state.startTime = performance.now();
	state.duration = duration;
	state.targetState = targetState;
	state.phase = 'fadeOut';
	state.holdForCallback = options?.hold ?? false;
	state.onSwitch = options?.onSwitch ?? null;
	state.progress = 0;
}

/** Releases a held transition (callback done). */
export function releaseTransition(state: TransitionState): void {
	if (state.holdForCallback) {
		state.holdForCallback = false;
		state.phase = 'fadeIn';
	}
}

/** Default game settings. */
export interface GameSettings {
	masterVolume: number;
	sfxVolume: number;
	mouseSensitivity: number;
	invertY: boolean;
	drawDistance: number;
	fogEnabled: boolean;
	defaultMode: GameMode;
}

/** Creates default settings. */
export function createDefaultSettings(): GameSettings {
	return {
		masterVolume: 0.5,
		sfxVolume: 0.7,
		mouseSensitivity: 1.0,
		invertY: false,
		drawDistance: 1200,
		fogEnabled: true,
		defaultMode: GAME_MODES.COMANCHE,
	};
}

/** Player profile for persistence. */
export interface PlayerProfile {
	version: number;
	highScore: number;
	missionScores: Record<string, number>;
	missionStars: Record<string, number>;
	missionsCompleted: number[];
	stats: {
		totalKills: number;
		totalDeaths: number;
		totalTimePlayed: number;
		missionsPlayed: number;
		missionsCompleted: number;
		tanksDestroyed: number;
		samsDestroyed: number;
		buildingsDestroyed: number;
	};
	achievements: string[];
	firstPlayDate: string | null;
	lastPlayDate: string | null;
}

/** Creates default player profile. */
export function createDefaultProfile(): PlayerProfile {
	return {
		version: 1,
		highScore: 0,
		missionScores: {},
		missionStars: {},
		missionsCompleted: [],
		stats: {
			totalKills: 0,
			totalDeaths: 0,
			totalTimePlayed: 0,
			missionsPlayed: 0,
			missionsCompleted: 0,
			tanksDestroyed: 0,
			samsDestroyed: 0,
			buildingsDestroyed: 0,
		},
		achievements: [],
		firstPlayDate: null,
		lastPlayDate: null,
	};
}

/** Session stats tracking. */
export interface SessionStats {
	kills: number;
	deaths: number;
	score: number;
	shotsFired: number;
	hits: number;
	submitted: boolean;
}

/** Creates fresh session stats. */
export function createSessionStats(): SessionStats {
	return { kills: 0, deaths: 0, score: 0, shotsFired: 0, hits: 0, submitted: false };
}

/** Telemetry data tracked per session. */
export interface Telemetry {
	shotsFired: number;
	shotsHit: number;
	missilesFired: number;
	missilesHit: number;
	missilesDodged: number;
	damageDealt: number;
	damageTaken: number;
	distanceTraveled: number;
	flightTime: number;
	groundTime: number;
	lastPosition: { x: number; y: number };
}

/** Creates fresh telemetry. */
export function createTelemetry(x: number, y: number): Telemetry {
	return {
		shotsFired: 0, shotsHit: 0,
		missilesFired: 0, missilesHit: 0, missilesDodged: 0,
		damageDealt: 0, damageTaken: 0,
		distanceTraveled: 0, flightTime: 0, groundTime: 0,
		lastPosition: { x, y },
	};
}

/** Menu navigation constants. */
export const MAIN_MENU_OPTIONS = [
	'MODE', 'CAMPAIGN', 'RANDOM MISSION', 'FREE PLAY',
	'AI MISSION', 'MAP EDITOR', 'SETTINGS',
	'ACHIEVEMENTS', 'LEADERBOARD', 'HOW TO PLAY',
] as const;

export const PAUSE_OPTIONS = ['RESUME [ESC]', 'RESTART MISSION', 'QUIT TO MENU'] as const;
