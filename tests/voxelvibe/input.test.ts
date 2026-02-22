/**
 * VoxelVibe Engine - Input System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	createKeyState,
	mapHeliInput,
	mapSoldierMovement,
	PREVENT_DEFAULT_KEYS,
	HELI_WEAPON_KEYS,
	SOLDIER_WEAPON_KEYS,
} from '../../src/voxelvibe/input/keyboard';

describe('createKeyState', () => {
	test('creates empty state', () => {
		const keys = createKeyState();
		expect(Object.keys(keys)).toHaveLength(0);
	});
});

describe('mapHeliInput', () => {
	test('maps W to forward', () => {
		const keys = createKeyState();
		keys['KeyW'] = true;
		const input = mapHeliInput(keys);
		expect(input.forward).toBe(true);
		expect(input.backward).toBe(false);
	});

	test('maps arrows as alternate keys', () => {
		const keys = createKeyState();
		keys['ArrowUp'] = true;
		keys['ArrowLeft'] = true;
		const input = mapHeliInput(keys);
		expect(input.forward).toBe(true);
		expect(input.bankLeft).toBe(true);
	});

	test('maps Space to boost', () => {
		const keys = createKeyState();
		keys['Space'] = true;
		expect(mapHeliInput(keys).boost).toBe(true);
	});

	test('maps R/F to climb', () => {
		const keys = createKeyState();
		keys['KeyR'] = true;
		expect(mapHeliInput(keys).climbUp).toBe(true);
		keys['KeyR'] = false;
		keys['KeyF'] = true;
		expect(mapHeliInput(keys).climbDown).toBe(true);
	});

	test('maps J/L to yaw', () => {
		const keys = createKeyState();
		keys['KeyJ'] = true;
		expect(mapHeliInput(keys).yawLeft).toBe(true);
	});

	test('all false when no keys pressed', () => {
		const input = mapHeliInput(createKeyState());
		expect(input.forward).toBe(false);
		expect(input.backward).toBe(false);
		expect(input.bankLeft).toBe(false);
		expect(input.bankRight).toBe(false);
		expect(input.boost).toBe(false);
	});
});

describe('mapSoldierMovement', () => {
	test('maps WASD correctly', () => {
		const keys = createKeyState();
		keys['KeyW'] = true;
		keys['KeyA'] = true;
		const input = mapSoldierMovement(keys);
		expect(input.forward).toBe(true);
		expect(input.left).toBe(true);
		expect(input.right).toBe(false);
	});

	test('maps Shift to sprint', () => {
		const keys = createKeyState();
		keys['ShiftLeft'] = true;
		expect(mapSoldierMovement(keys).sprint).toBe(true);
	});

	test('maps V to prone', () => {
		const keys = createKeyState();
		keys['KeyV'] = true;
		expect(mapSoldierMovement(keys).prone).toBe(true);
	});
});

describe('PREVENT_DEFAULT_KEYS', () => {
	test('includes arrow keys and space', () => {
		expect(PREVENT_DEFAULT_KEYS.has('ArrowUp')).toBe(true);
		expect(PREVENT_DEFAULT_KEYS.has('Space')).toBe(true);
		expect(PREVENT_DEFAULT_KEYS.has('Tab')).toBe(true);
	});

	test('does not include regular letters', () => {
		expect(PREVENT_DEFAULT_KEYS.has('KeyW')).toBe(false);
	});
});

describe('weapon key mappings', () => {
	test('helicopter weapons map to indices', () => {
		expect(HELI_WEAPON_KEYS['Digit1']).toBe(0);
		expect(HELI_WEAPON_KEYS['Digit4']).toBe(3);
	});

	test('soldier weapons map to names', () => {
		expect(SOLDIER_WEAPON_KEYS['Digit1']).toBe('m4');
		expect(SOLDIER_WEAPON_KEYS['Digit2']).toBe('sniper');
		expect(SOLDIER_WEAPON_KEYS['Digit6']).toBe('c4');
	});
});
