/**
 * VoxelVibe Engine - Mission Definitions Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	normalizeDifficulty,
	deriveTargetCounts,
	formatDuration,
	calculateAccuracy,
	validateMission,
	DEFAULT_MAPS,
	type AIConfig,
} from '../../src/voxelvibe/data/missions';

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
		expect(normalizeDifficulty(undefined)).toBe('medium');
	});
});

describe('deriveTargetCounts', () => {
	test('returns zero counts for null/undefined', () => {
		expect(deriveTargetCounts(null)).toEqual({ tanks: 0, soldiers: 0, buildings: 0, sams: 0 });
		expect(deriveTargetCounts(undefined)).toEqual({ tanks: 0, soldiers: 0, buildings: 0, sams: 0 });
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

	test('counts snipers as soldiers', () => {
		const config: AIConfig = {
			entities: [
				{ type: 'SOLDIER', count: 5 },
				{ type: 'SNIPER', count: 3 },
			],
		};
		expect(deriveTargetCounts(config)).toEqual({ tanks: 0, soldiers: 8, buildings: 0, sams: 0 });
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
});

describe('formatDuration', () => {
	test('formats seconds correctly', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(5)).toBe('0:05');
		expect(formatDuration(60)).toBe('1:00');
		expect(formatDuration(90)).toBe('1:30');
		expect(formatDuration(3661)).toBe('61:01');
	});

	test('handles negative values', () => {
		expect(formatDuration(-10)).toBe('0:00');
	});
});

describe('calculateAccuracy', () => {
	test('calculates percentage correctly', () => {
		expect(calculateAccuracy(100, 50)).toBe(50);
		expect(calculateAccuracy(100, 100)).toBe(100);
		expect(calculateAccuracy(3, 1)).toBe(33);
	});

	test('returns 0 for zero shots fired', () => {
		expect(calculateAccuracy(0, 0)).toBe(0);
	});
});

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
	});

	test('requires missionId', () => {
		const { missionId, ...noId } = validMission;
		expect(validateMission(noId).valid).toBe(false);
	});

	test('warns on unknown difficulty', () => {
		const result = validateMission({ ...validMission, difficulty: 'impossible' });
		expect(result.valid).toBe(true);
		expect(result.warnings.length).toBeGreaterThan(0);
	});
});

describe('DEFAULT_MAPS', () => {
	test('has 29 maps', () => {
		expect(DEFAULT_MAPS).toHaveLength(29);
	});

	test('all maps have color and height paths', () => {
		for (const map of DEFAULT_MAPS) {
			expect(map.color).toMatch(/\.png$/);
			expect(map.height).toMatch(/\.png$/);
			expect(map.name).toBeTruthy();
		}
	});
});
