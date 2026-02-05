/**
 * Core configuration values for terrain rendering, flight, and combat tuning.
 */
export interface GameConfig {
	MAP_SIZE: number;
	MAP_SHIFT: number;
	RENDER_DISTANCE: number;
	MIN_ALTITUDE: number;
	MAX_ALTITUDE: number;
	MOVE_SPEED: number;
	TURN_SPEED: number;
	CLIMB_SPEED: number;
	HORIZON_SPEED: number;
	BOOST_MULTIPLIER: number;
	SKY_COLOR: number;
	FOG_START: number;
	COLLISION_MARGIN: number;
	TARGET_COUNT: number;
	RADAR_SIZE: number;
	RADAR_RANGE: number;
}

/**
 * Supported gameplay state identifiers.
 */
export type GameState =
	| 'title'
	| 'menu'
	| 'campaign'
	| 'freeplay'
	| 'settings'
	| 'achievements'
	| 'leaderboard'
	| 'howto'
	| 'briefing'
	| 'playing'
	| 'paused'
	| 'victory'
	| 'defeat'
	| 'mission_generator'
	| 'custom_mission';

/**
 * Supported gameplay mode identifiers.
 */
export type GameMode = 'comanche' | 'delta';
