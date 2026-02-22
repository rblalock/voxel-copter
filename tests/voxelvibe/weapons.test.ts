/**
 * VoxelVibe Engine - Weapon Definitions Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	WEAPONS,
	WEAPONS_DELTA,
	WEAPON_ORDER,
	SOLDIER_WEAPON_ORDER,
	DAMAGE_MULTIPLIERS,
	getDamageMultiplier,
	DEFAULT_COUNTERMEASURES,
} from '../../src/voxelvibe/data/weapons';

describe('WEAPONS (helicopter)', () => {
	test('has all four helicopter weapons', () => {
		expect(Object.keys(WEAPONS)).toEqual(['cannon', 'rockets', 'hellfire', 'stinger']);
	});

	test('cannon has infinite ammo', () => {
		expect(WEAPONS.cannon.ammo).toBe(Infinity);
		expect(WEAPONS.cannon.maxAmmo).toBe(Infinity);
	});

	test('guided weapons are marked', () => {
		expect(WEAPONS.hellfire.guided).toBe(true);
		expect(WEAPONS.stinger.guided).toBe(true);
		expect(WEAPONS.cannon.guided).toBeUndefined();
		expect(WEAPONS.rockets.guided).toBeUndefined();
	});

	test('stinger is air-to-air', () => {
		expect(WEAPONS.stinger.airToAir).toBe(true);
	});

	test('all weapons have positive fireRate', () => {
		for (const [, w] of Object.entries(WEAPONS)) {
			expect(w.fireRate).toBeGreaterThan(0);
		}
	});
});

describe('WEAPONS_DELTA (soldier)', () => {
	test('has all soldier weapons', () => {
		expect(Object.keys(WEAPONS_DELTA)).toEqual([
			'm4', 'sniper', 'pistol', 'javelin', 'stinger', 'c4', 'airstrike',
		]);
	});

	test('m4 is auto, sniper is semi-auto', () => {
		expect(WEAPONS_DELTA.m4.auto).toBe(true);
		expect(WEAPONS_DELTA.sniper.auto).toBe(false);
	});

	test('c4 is explosive with blast radius', () => {
		expect(WEAPONS_DELTA.c4.explosive).toBe(true);
		expect(WEAPONS_DELTA.c4.blastRadius).toBe(60);
	});
});

describe('WEAPON_ORDER', () => {
	test('matches helicopter weapon keys', () => {
		for (const key of WEAPON_ORDER) {
			expect(WEAPONS[key]).toBeDefined();
		}
	});
});

describe('SOLDIER_WEAPON_ORDER', () => {
	test('matches soldier weapon keys', () => {
		for (const key of SOLDIER_WEAPON_ORDER) {
			expect(WEAPONS_DELTA[key]).toBeDefined();
		}
	});
});

describe('getDamageMultiplier', () => {
	test('returns correct multipliers for known combos', () => {
		expect(getDamageMultiplier('cannon', 'tank')).toBe(0.5);
		expect(getDamageMultiplier('hellfire', 'tank')).toBe(1.5);
		expect(getDamageMultiplier('stinger', 'aircraft')).toBe(2.0);
		expect(getDamageMultiplier('javelin', 'tank')).toBe(2.5);
		expect(getDamageMultiplier('sniper', 'soldier')).toBe(1.5);
	});

	test('returns 1.0 for unknown weapon', () => {
		expect(getDamageMultiplier('unknown', 'tank')).toBe(1.0);
	});

	test('small arms are weak vs armor', () => {
		expect(getDamageMultiplier('pistol', 'tank')).toBeLessThan(0.1);
		expect(getDamageMultiplier('m4', 'tank')).toBeLessThan(0.1);
	});
});

describe('DEFAULT_COUNTERMEASURES', () => {
	test('has chaff and flare', () => {
		expect(DEFAULT_COUNTERMEASURES.chaff.count).toBe(10);
		expect(DEFAULT_COUNTERMEASURES.flare.count).toBe(10);
		expect(DEFAULT_COUNTERMEASURES.chaff.cooldown).toBe(2000);
	});
});
