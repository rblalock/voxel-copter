import { CONFIG, GAME_MODES, GAME_STATES } from './core/constants';
import type { GameConfig, GameMode, GameState } from './core/types';

export const Core = {
	CONFIG,
	GAME_STATES,
	GAME_MODES
};

export const Data = {};
export const Systems = {};
export const Game = {};
export const Render = {};
export const UI = {};

export const VoxelVibe = {
	Core,
	Data,
	Systems,
	Game,
	Render,
	UI
};

declare global {
	interface Window {
		VoxelVibe?: typeof VoxelVibe;
	}
}

if (typeof window !== 'undefined') {
	window.VoxelVibe = VoxelVibe;
}

export type { GameConfig, GameMode, GameState };
export default VoxelVibe;
