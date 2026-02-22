/**
 * VoxelVibe Engine - Target Definitions Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	TARGET_TYPES,
	FACTIONS,
	DOMAINS,
	ENTITY_BUDGET,
	getTargetDamageCategory,
} from '../../src/voxelvibe/data/targets';

describe('TARGET_TYPES', () => {
	test('has all expected target types', () => {
		const keys = Object.keys(TARGET_TYPES);
		expect(keys).toContain('TANK');
		expect(keys).toContain('SOLDIER');
		expect(keys).toContain('SNIPER');
		expect(keys).toContain('BUILDING');
		expect(keys).toContain('SAM_SITE');
		expect(keys).toContain('AIR_FIGHTER');
		expect(keys).toContain('AIR_ATTACK_HELI');
		expect(keys).toContain('CONTROL_TOWER');
	});

	test('all targets have required fields', () => {
		for (const [key, def] of Object.entries(TARGET_TYPES)) {
			expect(def.type).toBeDefined();
			expect(def.health).toBeGreaterThan(0);
			expect(def.points).toBeGreaterThanOrEqual(0);
			expect(def.size).toBeGreaterThan(0);
			expect(def.color).toMatch(/^#[0-9a-fA-F]+$/);
			expect(def.domain).toBeDefined();
			expect(def.faction).toBeDefined();
			expect(def.hitHeight).toBeGreaterThan(0);
		}
	});

	test('structures have no movement AI', () => {
		const structures = Object.values(TARGET_TYPES).filter(
			(t) => t.domain === DOMAINS.STRUCTURE && t.type !== 'sam',
		);
		for (const s of structures) {
			if (s.ai) {
				// SAM is structure with AI, others should be null
				expect(s.ai.type).toBe('sam');
			}
		}
	});

	test('air units have air domain', () => {
		expect(TARGET_TYPES.AIR_FIGHTER.domain).toBe(DOMAINS.AIR);
		expect(TARGET_TYPES.AIR_TRANSPORT.domain).toBe(DOMAINS.AIR);
		expect(TARGET_TYPES.AIR_ATTACK_HELI.domain).toBe(DOMAINS.AIR);
	});

	test('ground units have ground domain', () => {
		expect(TARGET_TYPES.TANK.domain).toBe(DOMAINS.GROUND);
		expect(TARGET_TYPES.SOLDIER.domain).toBe(DOMAINS.GROUND);
	});
});

describe('FACTIONS', () => {
	test('has expected factions', () => {
		expect(FACTIONS.ENEMY).toBe('enemy');
		expect(FACTIONS.FRIENDLY).toBe('friendly');
		expect(FACTIONS.NEUTRAL).toBe('neutral');
	});
});

describe('DOMAINS', () => {
	test('has expected domains', () => {
		expect(DOMAINS.GROUND).toBe('ground');
		expect(DOMAINS.AIR).toBe('air');
		expect(DOMAINS.STRUCTURE).toBe('structure');
		expect(DOMAINS.PLAYER).toBe('player');
	});
});

describe('ENTITY_BUDGET', () => {
	test('has reasonable limits', () => {
		expect(ENTITY_BUDGET.maxTotal).toBeGreaterThan(0);
		expect(ENTITY_BUDGET.maxGround).toBeLessThanOrEqual(ENTITY_BUDGET.maxTotal);
		expect(ENTITY_BUDGET.maxAir).toBeLessThanOrEqual(ENTITY_BUDGET.maxTotal);
	});
});

describe('getTargetDamageCategory', () => {
	test('returns correct categories', () => {
		expect(getTargetDamageCategory({ type: 'soldier' })).toBe('soldier');
		expect(getTargetDamageCategory({ type: 'sniper' })).toBe('soldier');
		expect(getTargetDamageCategory({ type: 'tank' })).toBe('tank');
		expect(getTargetDamageCategory({ type: 'sam' })).toBe('sam');
		expect(getTargetDamageCategory({ type: 'building', domain: 'structure' })).toBe('building');
		expect(getTargetDamageCategory({ type: 'air_fighter', domain: 'air' })).toBe('aircraft');
	});

	test('returns soldier for null', () => {
		expect(getTargetDamageCategory(null)).toBe('soldier');
	});

	test('returns soldier for unknown type', () => {
		expect(getTargetDamageCategory({ type: 'unknown' })).toBe('soldier');
	});
});
