/**
 * VoxelVibe Engine - Combat System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	createTargetingState,
	resetTargeting,
	getLockTime,
	getValidTargetDomain,
	isValidTarget,
	getTargetingRange,
	getTargetDamageCategory,
	getDamageForTarget,
	createProjectile,
	updateProjectiles,
	createScreenShake,
	triggerScreenShake,
	updateScreenShake,
	createCountermeasureState,
	deployCountermeasure,
	getObjectiveTotal,
	getObjectiveProgressText,
	type Target,
} from '../../src/voxelvibe/systems/combat';

function makeTarget(overrides: Partial<Target> = {}): Target {
	return {
		id: 'test', type: 'tank', x: 100, y: 100, z: 0,
		health: 100, maxHealth: 100, points: 100, size: 20,
		color: '#000', domain: 'ground', faction: 'enemy',
		hitHeight: 8, heightOffset: 0, destroyed: false,
		spawnX: 100, spawnY: 100, angle: 0, ai: null, lastFireTime: 0,
		...overrides,
	};
}

describe('targeting state', () => {
	test('creates clean state', () => {
		const state = createTargetingState();
		expect(state.lockedTarget).toBeNull();
		expect(state.lockProgress).toBe(0);
		expect(state.isLocking).toBe(false);
	});

	test('reset clears all fields', () => {
		const state = createTargetingState();
		state.lockedTarget = makeTarget();
		state.lockProgress = 50;
		state.isLocking = true;
		resetTargeting(state);
		expect(state.lockedTarget).toBeNull();
		expect(state.lockProgress).toBe(0);
	});
});

describe('getLockTime', () => {
	test('returns times for guided weapons', () => {
		expect(getLockTime('hellfire')).toBe(1500);
		expect(getLockTime('stinger')).toBe(1000);
		expect(getLockTime('javelin')).toBe(2000);
	});

	test('returns 0 for unguided weapons', () => {
		expect(getLockTime('cannon')).toBe(0);
		expect(getLockTime('rockets')).toBe(0);
	});
});

describe('getValidTargetDomain', () => {
	test('stinger targets air only', () => {
		const result = getValidTargetDomain('stinger');
		expect(result.domain).toBe('air');
		expect(result.requiresLock).toBe(true);
	});

	test('hellfire targets surface', () => {
		const result = getValidTargetDomain('hellfire');
		expect(result.domain).toBe('surface');
	});

	test('cannon targets anything', () => {
		const result = getValidTargetDomain('cannon');
		expect(result.domain).toBeNull();
		expect(result.requiresLock).toBe(false);
	});
});

describe('isValidTarget', () => {
	test('rejects destroyed targets', () => {
		expect(isValidTarget(makeTarget({ destroyed: true }), 'cannon', 'enemy')).toBe(false);
	});

	test('rejects non-enemy targets', () => {
		expect(isValidTarget(makeTarget({ faction: 'friendly' }), 'cannon', 'enemy')).toBe(false);
	});

	test('stinger rejects ground targets', () => {
		expect(isValidTarget(makeTarget({ domain: 'ground' }), 'stinger', 'enemy')).toBe(false);
	});

	test('stinger accepts air targets', () => {
		expect(isValidTarget(makeTarget({ domain: 'air' }), 'stinger', 'enemy')).toBe(true);
	});

	test('hellfire rejects air targets', () => {
		expect(isValidTarget(makeTarget({ domain: 'air' }), 'hellfire', 'enemy')).toBe(false);
	});

	test('cannon accepts any enemy', () => {
		expect(isValidTarget(makeTarget(), 'cannon', 'enemy')).toBe(true);
	});
});

describe('getTargetingRange', () => {
	test('hellfire has long range', () => {
		expect(getTargetingRange('hellfire')).toBe(2000);
	});

	test('cannon has shorter range', () => {
		expect(getTargetingRange('cannon')).toBe(800);
	});
});

describe('getTargetDamageCategory', () => {
	test('maps target types correctly', () => {
		expect(getTargetDamageCategory(makeTarget({ type: 'tank' }))).toBe('tank');
		expect(getTargetDamageCategory(makeTarget({ type: 'soldier' }))).toBe('soldier');
		expect(getTargetDamageCategory(makeTarget({ type: 'sniper' }))).toBe('soldier');
		expect(getTargetDamageCategory(makeTarget({ type: 'sam' }))).toBe('sam');
		expect(getTargetDamageCategory(makeTarget({ type: 'building', domain: 'structure' }))).toBe('building');
		expect(getTargetDamageCategory(makeTarget({ type: 'air_fighter', domain: 'air' }))).toBe('aircraft');
	});

	test('returns soldier for null', () => {
		expect(getTargetDamageCategory(null)).toBe('soldier');
	});
});

describe('getDamageForTarget', () => {
	test('returns correct multiplier', () => {
		expect(getDamageForTarget('cannon', makeTarget({ type: 'tank' }))).toBe(0.5);
		expect(getDamageForTarget('stinger', makeTarget({ type: 'air_fighter', domain: 'air' }))).toBe(2.0);
	});
});

describe('projectile management', () => {
	test('creates projectile with correct velocity direction', () => {
		const p = createProjectile(100, 100, 50, 0, 'cannon', 25, 20, 0, false, null, false);
		expect(p.x).toBe(100);
		expect(p.y).toBe(100);
		expect(p.z).toBe(50);
		expect(p.life).toBe(5.0);
		expect(p.vy).toBeLessThan(0); // Moving forward (negative Y in this coord system)
	});

	test('updateProjectiles moves and expires', () => {
		const projectiles = [
			createProjectile(100, 100, 50, 0, 'cannon', 25, 20, 0, false, null, false),
		];
		projectiles[0].life = 0.01;
		updateProjectiles(projectiles, 100, 1024);
		expect(projectiles).toHaveLength(0);
	});

	test('updateProjectiles wraps position', () => {
		const projectiles = [
			createProjectile(1020, 1020, 50, 0, 'cannon', 25, 20, 0, false, null, false),
		];
		projectiles[0].vx = 100;
		projectiles[0].vy = 100;
		updateProjectiles(projectiles, 100, 1024);
		expect(projectiles[0].x).toBeGreaterThanOrEqual(0);
		expect(projectiles[0].x).toBeLessThan(1024);
	});
});

describe('screen shake', () => {
	test('creates with zero intensity', () => {
		const shake = createScreenShake();
		expect(shake.intensity).toBe(0);
	});

	test('trigger sets intensity', () => {
		const shake = createScreenShake();
		triggerScreenShake(shake, 5, 100);
		expect(shake.intensity).toBe(5);
	});

	test('update decays intensity', () => {
		const shake = createScreenShake();
		triggerScreenShake(shake, 5, 100);
		updateScreenShake(shake, 16);
		expect(shake.intensity).toBeLessThan(5);
	});
});

describe('countermeasures', () => {
	test('deploys successfully', () => {
		const cm = createCountermeasureState();
		// lastUsed starts at 0, so first call needs now > cooldown
		expect(deployCountermeasure(cm, 'chaff', 5000)).toBe(true);
		expect(cm.chaff.count).toBe(9);
	});

	test('fails when empty', () => {
		const cm = createCountermeasureState();
		cm.chaff.count = 0;
		expect(deployCountermeasure(cm, 'chaff', 5000)).toBe(false);
	});

	test('respects cooldown', () => {
		const cm = createCountermeasureState();
		deployCountermeasure(cm, 'flare', 5000);
		expect(deployCountermeasure(cm, 'flare', 5500)).toBe(false);
		expect(deployCountermeasure(cm, 'flare', 8000)).toBe(true);
	});
});

describe('objectives', () => {
	test('getObjectiveTotal returns correct values', () => {
		expect(getObjectiveTotal({ type: 'destroy_type', count: 5 })).toBe(5);
		expect(getObjectiveTotal({ type: 'survive_time', duration: 120 })).toBe(120);
		expect(getObjectiveTotal({ type: 'destroy_all' })).toBe(-1);
		expect(getObjectiveTotal({ type: 'reach_location' })).toBe(1);
	});

	test('getObjectiveProgressText formats correctly', () => {
		expect(getObjectiveProgressText(
			{ id: '1', type: 'destroy_all', description: '', progress: 0, total: -1, complete: false, failed: false },
			3,
		)).toBe('3 remaining');

		expect(getObjectiveProgressText(
			{ id: '2', type: 'destroy_type', description: '', progress: 2, total: 5, complete: false, failed: false },
			0,
		)).toBe('2/5');

		expect(getObjectiveProgressText(
			{ id: '3', type: 'reach_location', description: '', progress: 0, total: 1, complete: true, failed: false },
			0,
		)).toBe('REACHED');
	});
});
