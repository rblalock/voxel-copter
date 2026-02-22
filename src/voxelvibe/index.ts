/**
 * VoxelVibe Engine
 * A voxelspace terrain rendering engine with combat, physics, and AI systems.
 */

// Core
import * as MathUtils from './core/math';
import { CONFIG, GAME_MODES as CORE_GAME_MODES, GAME_STATES as CORE_GAME_STATES } from './core/constants';
import type { GameConfig, GameMode as CoreGameMode, GameState as CoreGameState } from './core/types';

// Data
import * as Weapons from './data/weapons';
import * as Targets from './data/targets';
import * as Missions from './data/missions';

// Systems
import * as Weather from './systems/weather';
import * as Audio from './systems/audio';
import * as Particles from './systems/particles';
import * as Physics from './systems/physics';
import * as Combat from './systems/combat';
import * as AI from './systems/ai';

// Render
import * as Voxelspace from './render/voxelspace';

// Input
import * as Keyboard from './input/keyboard';

// Game
import * as State from './game/state';
import * as Loop from './game/loop';

export const Core = {
	CONFIG,
	GAME_STATES: CORE_GAME_STATES,
	GAME_MODES: CORE_GAME_MODES,
	Math: MathUtils,
};

export const Data = {
	Weapons,
	Targets,
	Missions,
};

export const Systems = {
	Weather,
	Audio,
	Particles,
	Physics,
	Combat,
	AI,
};

export const Render = {
	Voxelspace,
};

export const Input = {
	Keyboard,
};

export const Game = {
	State,
	Loop,
};

export const VoxelVibe = {
	Core,
	Data,
	Systems,
	Render,
	Input,
	Game,
};

declare global {
	interface Window {
		VoxelVibe?: typeof VoxelVibe;
	}
}

if (typeof window !== 'undefined') {
	window.VoxelVibe = VoxelVibe;
}

// Re-export all modules for direct imports
export {
	MathUtils,
	Weapons,
	Targets,
	Missions,
	Weather,
	Audio,
	Particles,
	Physics,
	Combat,
	AI,
	Voxelspace,
	Keyboard,
	State,
	Loop,
};

export type { GameConfig, CoreGameMode, CoreGameState };
export default VoxelVibe;
