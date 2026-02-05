import type { GameConfig } from './types';

/**
 * Default configuration values shared by gameplay systems.
 */
export const CONFIG: GameConfig = {
	MAP_SIZE: 1024,
	MAP_SHIFT: 10,
	RENDER_DISTANCE: 1200,
	MIN_ALTITUDE: 5,
	MAX_ALTITUDE: 800,
	MOVE_SPEED: 0.25,
	TURN_SPEED: 0.008,
	CLIMB_SPEED: 0.25,
	HORIZON_SPEED: 1.0,
	BOOST_MULTIPLIER: 3.0,
	SKY_COLOR: 0xff8090e0,
	FOG_START: 400,
	COLLISION_MARGIN: 5,
	TARGET_COUNT: 8,
	RADAR_SIZE: 100,
	RADAR_RANGE: 500
};

/**
 * State machine identifiers for the game flow.
 */
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
	CUSTOM_MISSION: 'custom_mission'
} as const;

/**
 * Supported player mode identifiers.
 */
export const GAME_MODES = {
	COMANCHE: 'comanche',
	DELTA: 'delta'
} as const;
