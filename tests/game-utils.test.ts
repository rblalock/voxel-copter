/**
 * VoxelCopter Game Utilities Tests
 * Run with: bun test
 */

import { describe, expect, test } from 'bun:test';
import {
	normalizeDifficulty,
	deriveTargetCounts,
	formatDuration,
	calculateAccuracy,
	clamp,
	lerp,
	normalizeAngle,
	angleDifference,
	distance2D,
	distance3D,
	getTargetDamageCategory,
	getDamageMultiplier,
	validateMission,
	type AIConfig,
} from '../src/lib/game-utils';

// ─────────────────────────────────────────────────────────────────────────────
// normalizeDifficulty
// ─────────────────────────────────────────────────────────────────────────────

describe('normalizeDifficulty', () => {
	test('returns valid difficulties unchanged', () => {
		expect(normalizeDifficulty('easy')).toBe('easy');
		expect(normalizeDifficulty('medium')).toBe('medium');
		expect(normalizeDifficulty('hard')).toBe('hard');
		expect(normalizeDifficulty('extreme')).toBe('extreme');
	});

	test('maps "normal" to "medium"', () => {
		expect(normalizeDifficulty('normal')).toBe('medium');
	});

	test('defaults unknown values to "medium"', () => {
		expect(normalizeDifficulty('invalid')).toBe('medium');
		expect(normalizeDifficulty('')).toBe('medium');
		expect(normalizeDifficulty(undefined)).toBe('medium');
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// deriveTargetCounts
// ─────────────────────────────────────────────────────────────────────────────

describe('deriveTargetCounts', () => {
	test('returns zero counts for null/undefined', () => {
		expect(deriveTargetCounts(null)).toEqual({ tanks: 0, soldiers: 0, buildings: 0, sams: 0 });
		expect(deriveTargetCounts(undefined)).toEqual({ tanks: 0, soldiers: 0, buildings: 0, sams: 0 });
	});

	test('returns zero counts for empty entities', () => {
		expect(deriveTargetCounts({ entities: [] })).toEqual({ tanks: 0, soldiers: 0, buildings: 0, sams: 0 });
	});

	test('counts entities correctly', () => {
		const config: AIConfig = {
			entities: [
				{ type: 'TANK', count: 5 },
				{ type: 'SOLDIER', count: 10 },
				{ type: 'BUILDING', count: 3 },
				{ type: 'SAM_SITE', count: 2 },
			],
		};
		expect(deriveTargetCounts(config)).toEqual({ tanks: 5, soldiers: 10, buildings: 3, sams: 2 });
	});

	test('handles case-insensitive types', () => {
		const config: AIConfig = {
			entities: [
				{ type: 'tank', count: 3 },
				{ type: 'Tank', count: 2 },
			],
		};
		expect(deriveTargetCounts(config)).toEqual({ tanks: 5, soldiers: 0, buildings: 0, sams: 0 });
	});

	test('handles invalid counts gracefully', () => {
		const config: AIConfig = {
			entities: [
				{ type: 'TANK', count: NaN },
				{ type: 'SOLDIER', count: Infinity },
				{ type: 'BUILDING', count: 5 },
			],
		};
		// NaN becomes 0, Infinity stays as-is (Number.isFinite fails)
		const result = deriveTargetCounts(config);
		expect(result.buildings).toBe(5);
		expect(result.tanks).toBe(0);
		expect(result.soldiers).toBe(0); // Infinity fails isFinite check
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// formatDuration
// ─────────────────────────────────────────────────────────────────────────────

describe('formatDuration', () => {
	test('formats seconds correctly', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(5)).toBe('0:05');
		expect(formatDuration(59)).toBe('0:59');
		expect(formatDuration(60)).toBe('1:00');
		expect(formatDuration(90)).toBe('1:30');
		expect(formatDuration(600)).toBe('10:00');
		expect(formatDuration(3661)).toBe('61:01');
	});

	test('handles negative values', () => {
		expect(formatDuration(-10)).toBe('0:00');
	});

	test('handles decimal values', () => {
		expect(formatDuration(90.7)).toBe('1:30');
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateAccuracy
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateAccuracy', () => {
	test('calculates percentage correctly', () => {
		expect(calculateAccuracy(100, 50)).toBe(50);
		expect(calculateAccuracy(100, 100)).toBe(100);
		expect(calculateAccuracy(100, 0)).toBe(0);
		expect(calculateAccuracy(3, 1)).toBe(33);
	});

	test('returns 0 for zero shots fired', () => {
		expect(calculateAccuracy(0, 0)).toBe(0);
		expect(calculateAccuracy(0, 10)).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Math utilities
// ─────────────────────────────────────────────────────────────────────────────

describe('clamp', () => {
	test('clamps values correctly', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(15, 0, 10)).toBe(10);
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});
});

describe('lerp', () => {
	test('interpolates correctly', () => {
		expect(lerp(0, 100, 0)).toBe(0);
		expect(lerp(0, 100, 1)).toBe(100);
		expect(lerp(0, 100, 0.5)).toBe(50);
		expect(lerp(10, 20, 0.25)).toBe(12.5);
	});

	test('handles extrapolation', () => {
		expect(lerp(0, 100, 1.5)).toBe(150);
		expect(lerp(0, 100, -0.5)).toBe(-50);
	});
});

describe('normalizeAngle', () => {
	test('normalizes angles to [0, 2*PI)', () => {
		expect(normalizeAngle(0)).toBeCloseTo(0);
		expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
		expect(normalizeAngle(Math.PI * 2)).toBeCloseTo(0);
		expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(Math.PI);
		expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
	});
});

describe('angleDifference', () => {
	test('calculates shortest angular difference', () => {
		expect(angleDifference(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2);
		expect(angleDifference(0, -Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
		expect(angleDifference(0, Math.PI)).toBeCloseTo(Math.PI);
	});
});

describe('distance2D', () => {
	test('calculates 2D distance', () => {
		expect(distance2D(0, 0, 3, 4)).toBe(5);
		expect(distance2D(0, 0, 0, 0)).toBe(0);
		expect(distance2D(1, 1, 4, 5)).toBe(5);
	});
});

describe('distance3D', () => {
	test('calculates 3D distance', () => {
		expect(distance3D(0, 0, 0, 1, 2, 2)).toBe(3);
		expect(distance3D(0, 0, 0, 0, 0, 0)).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Combat utilities
// ─────────────────────────────────────────────────────────────────────────────

describe('getTargetDamageCategory', () => {
	test('returns correct categories', () => {
		expect(getTargetDamageCategory('TANK')).toEqual({ armored: true, infantry: false, structure: false, air: false });
		expect(getTargetDamageCategory('SOLDIER')).toEqual({
			armored: false,
			infantry: true,
			structure: false,
			air: false,
		});
		expect(getTargetDamageCategory('BUILDING')).toEqual({
			armored: false,
			infantry: false,
			structure: true,
			air: false,
		});
		expect(getTargetDamageCategory('HELICOPTER')).toEqual({
			armored: false,
			infantry: false,
			structure: false,
			air: true,
		});
	});
});

describe('getDamageMultiplier', () => {
	test('returns correct multipliers', () => {
		expect(getDamageMultiplier('cannon', 'TANK')).toBe(0.5);
		expect(getDamageMultiplier('missile', 'TANK')).toBe(2.0);
		expect(getDamageMultiplier('rifle', 'SOLDIER')).toBe(1.0);
		expect(getDamageMultiplier('sniper', 'SOLDIER')).toBe(3.0);
	});

	test('returns 1.0 for unknown combinations', () => {
		expect(getDamageMultiplier('cannon', 'UNKNOWN' as any)).toBe(1.0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Mission validation
// ─────────────────────────────────────────────────────────────────────────────

describe('validateMission', () => {
	const validMission = {
		missionId: 1,
		name: 'Test Mission',
		mapIndex: 1,
		difficulty: 'easy',
		weather: 'clear',
		playerStart: { x: 512, y: 512 },
		spawnZones: [{ x: 400, y: 300, radius: 100, types: ['TANK'], count: 5 }],
	};

	test('validates a valid mission', () => {
		const result = validateMission(validMission);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	test('rejects non-object input', () => {
		expect(validateMission(null).valid).toBe(false);
		expect(validateMission(undefined).valid).toBe(false);
		expect(validateMission('string').valid).toBe(false);
	});

	test('requires missionId', () => {
		const { missionId, ...noId } = validMission;
		const result = validateMission(noId);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('missionId'))).toBe(true);
	});

	test('requires name', () => {
		const result = validateMission({ ...validMission, name: '' });
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('name'))).toBe(true);
	});

	test('requires valid mapIndex', () => {
		const result = validateMission({ ...validMission, mapIndex: 0 });
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('mapIndex'))).toBe(true);
	});

	test('requires valid playerStart', () => {
		const result = validateMission({ ...validMission, playerStart: { x: 'invalid', y: 512 } });
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('playerStart'))).toBe(true);
	});

	test('warns on unknown difficulty', () => {
		const result = validateMission({ ...validMission, difficulty: 'impossible' });
		expect(result.valid).toBe(true);
		expect(result.warnings.some((w) => w.includes('difficulty'))).toBe(true);
	});

	test('warns on unknown weather', () => {
		const result = validateMission({ ...validMission, weather: 'tornado' });
		expect(result.valid).toBe(true);
		expect(result.warnings.some((w) => w.includes('weather'))).toBe(true);
	});

	test('validates spawn zones', () => {
		const result = validateMission({
			...validMission,
			spawnZones: [{ x: 'bad', y: 300 }],
		});
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('spawnZones'))).toBe(true);
	});
});
