/**
 * VoxelVibe Engine - Keyboard Input System
 * Tracks key state and maps key codes to game actions.
 */

import type { PhysicsInput } from '../systems/physics';

/** Tracks which keys are currently pressed. */
export interface KeyState {
	[code: string]: boolean;
}

/** Creates empty key state. */
export function createKeyState(): KeyState {
	return {};
}

/** Maps keyboard state to helicopter physics input. */
export function mapHeliInput(keys: KeyState): PhysicsInput {
	return {
		forward: !!(keys['KeyW'] || keys['ArrowUp']),
		backward: !!(keys['KeyS'] || keys['ArrowDown']),
		bankLeft: !!(keys['KeyA'] || keys['ArrowLeft']),
		bankRight: !!(keys['KeyD'] || keys['ArrowRight']),
		yawLeft: !!keys['KeyJ'],
		yawRight: !!keys['KeyL'],
		climbUp: !!keys['KeyR'],
		climbDown: !!keys['KeyF'],
		boost: !!keys['Space'],
		strafeLeft: !!keys['KeyQ'],
		strafeRight: !!keys['KeyE'],
	};
}

/** Maps keyboard state to soldier movement input. */
export function mapSoldierMovement(keys: KeyState): { forward: boolean; backward: boolean; left: boolean; right: boolean; sprint: boolean; crouch: boolean; prone: boolean } {
	return {
		forward: !!(keys['KeyW'] || keys['ArrowUp']),
		backward: !!(keys['KeyS'] || keys['ArrowDown']),
		left: !!(keys['KeyA'] || keys['ArrowLeft']),
		right: !!(keys['KeyD'] || keys['ArrowRight']),
		sprint: !!keys['ShiftLeft'] || !!keys['ShiftRight'],
		crouch: !!keys['ControlLeft'] || !!keys['ControlRight'],
		prone: !!keys['KeyV'],
	};
}

/** Key codes that should prevent default browser behavior. */
export const PREVENT_DEFAULT_KEYS = new Set([
	'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab',
]);

/** Weapon selection key mappings for helicopter mode. */
export const HELI_WEAPON_KEYS: Record<string, number> = {
	'Digit1': 0,
	'Digit2': 1,
	'Digit3': 2,
	'Digit4': 3,
};

/** Weapon selection key mappings for soldier mode. */
export const SOLDIER_WEAPON_KEYS: Record<string, string> = {
	'Digit1': 'm4',
	'Digit2': 'sniper',
	'Digit3': 'pistol',
	'Digit4': 'javelin',
	'Digit5': 'stinger',
	'Digit6': 'c4',
	'Digit7': 'airstrike',
};
