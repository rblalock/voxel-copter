/**
 * VoxelVibe Engine - AI System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	wrappedDistance2D,
	wrappedAngleTo,
	canTargetFire,
	recordTargetFire,
	createAlertState,
	raiseAlert,
	updateAlertLevel,
	type AIContext,
} from '../../src/voxelvibe/systems/ai';
import type { Target } from '../../src/voxelvibe/systems/combat';

function makeTarget(overrides: Partial<Target> = {}): Target {
	return {
		id: 'test', type: 'tank', x: 100, y: 100, z: 0,
		health: 100, maxHealth: 100, points: 100, size: 20,
		color: '#000', domain: 'ground', faction: 'enemy',
		hitHeight: 8, heightOffset: 0, destroyed: false,
		spawnX: 100, spawnY: 100, angle: 0,
		ai: { type: 'patrol', engageRange: 200, fireRate: 2000, speed: 0.02, patrolRadius: 40 },
		lastFireTime: 0,
		...overrides,
	};
}

describe('wrappedDistance2D', () => {
	test('calculates direct distance', () => {
		expect(wrappedDistance2D(10, 10, 13, 14, 1024)).toBeCloseTo(5);
	});

	test('wraps across boundary', () => {
		expect(wrappedDistance2D(5, 50, 1019, 50, 1024)).toBeCloseTo(10);
	});
});

describe('wrappedAngleTo', () => {
	test('returns angle to target', () => {
		const angle = wrappedAngleTo(0, 0, 100, 0, 1024);
		expect(angle).toBeCloseTo(Math.PI / 2);
	});
});

describe('canTargetFire', () => {
	test('returns true when in range and off cooldown', () => {
		const target = makeTarget({ lastFireTime: 0 });
		expect(canTargetFire(target, 150, 100, 1024, 5000)).toBe(true);
	});

	test('returns false when out of range', () => {
		const target = makeTarget();
		expect(canTargetFire(target, 600, 100, 1024, 5000)).toBe(false);
	});

	test('returns false when on cooldown', () => {
		const target = makeTarget({ lastFireTime: 4500 });
		expect(canTargetFire(target, 150, 100, 1024, 5000)).toBe(false);
	});

	test('returns false when destroyed', () => {
		const target = makeTarget({ destroyed: true });
		expect(canTargetFire(target, 150, 100, 1024, 5000)).toBe(false);
	});
});

describe('recordTargetFire', () => {
	test('updates lastFireTime', () => {
		const target = makeTarget();
		recordTargetFire(target, 5000);
		expect(target.lastFireTime).toBe(5000);
	});

	test('decrements burst shots', () => {
		const target = makeTarget();
		target.burstShotsLeft = 3;
		recordTargetFire(target, 5000);
		expect(target.burstShotsLeft).toBe(2);
	});
});

describe('alert system', () => {
	test('creates undetected state', () => {
		const state = createAlertState();
		expect(state.level).toBe(0);
	});

	test('raises alert level', () => {
		const state = createAlertState();
		raiseAlert(state, 2, 1000);
		expect(state.level).toBe(2);
	});

	test('never exceeds level 3', () => {
		const state = createAlertState();
		raiseAlert(state, 5, 1000);
		expect(state.level).toBe(3);
	});

	test('decays over time', () => {
		const state = createAlertState();
		raiseAlert(state, 2, 1000);
		// Timer set to 1000 + 30000 = 31000
		updateAlertLevel(state, 32000);
		expect(state.level).toBe(1);
	});

	test('does not decay before timer expires', () => {
		const state = createAlertState();
		raiseAlert(state, 2, 1000);
		updateAlertLevel(state, 5000);
		expect(state.level).toBe(2);
	});
});
