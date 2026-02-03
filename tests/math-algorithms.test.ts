/**
 * VoxelCopter Math & Algorithm Tests
 * Run with: bun test
 */

import { describe, expect, test } from 'bun:test';
import {
	distance3DWrapped,
	normalizeAngleToRange,
	findNearestTarget,
	isWaterAt,
	estimateSlopeFromSamples,
} from '../src/lib/game-utils';

// ─────────────────────────────────────────────────────────────────────────────
// distance3DWrapped
// ─────────────────────────────────────────────────────────────────────────────

describe('distance3DWrapped', () => {
	const mapSize = 100;

	test('calculates distance without wrapping', () => {
		expect(distance3DWrapped(10, 10, 0, 13, 14, 0, mapSize)).toBeCloseTo(5);
	});

	test('wraps across the X boundary', () => {
		expect(distance3DWrapped(95, 50, 0, 5, 50, 0, mapSize)).toBeCloseTo(10);
	});

	test('wraps across the Y boundary', () => {
		expect(distance3DWrapped(20, 2, 0, 20, 98, 0, mapSize)).toBeCloseTo(4);
	});

	test('wraps across both boundaries', () => {
		expect(distance3DWrapped(98, 97, 0, 3, 2, 0, mapSize)).toBeCloseTo(Math.sqrt(50));
	});

	test('returns zero when points match', () => {
		expect(distance3DWrapped(10, 10, 10, 10, 10, 10, mapSize)).toBe(0);
	});

	test('handles large 3D distances', () => {
		expect(distance3DWrapped(10, 10, 0, 60, 60, 80, mapSize)).toBeCloseTo(Math.sqrt(11400));
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeAngleToRange
// ─────────────────────────────────────────────────────────────────────────────

describe('normalizeAngleToRange', () => {
	test('returns angles already in range', () => {
		expect(normalizeAngleToRange(0.5)).toBeCloseTo(0.5);
		expect(normalizeAngleToRange(-1.1)).toBeCloseTo(-1.1);
	});

	test('handles angles greater than 2π', () => {
		expect(normalizeAngleToRange(Math.PI * 3)).toBeCloseTo(Math.PI);
	});

	test('handles angles less than -π', () => {
		expect(normalizeAngleToRange(-1.5 * Math.PI)).toBeCloseTo(0.5 * Math.PI);
	});

	test('preserves π and -π', () => {
		expect(normalizeAngleToRange(Math.PI)).toBeCloseTo(Math.PI);
		expect(normalizeAngleToRange(-Math.PI)).toBeCloseTo(-Math.PI);
	});

	test('handles multiple rotations', () => {
		expect(normalizeAngleToRange(10 * Math.PI)).toBeCloseTo(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// findNearestTarget
// ─────────────────────────────────────────────────────────────────────────────

describe('findNearestTarget', () => {
	const mapSize = 100;

	test('returns the only target', () => {
		const target = { id: 'only', x: 10, y: 10 };
		expect(findNearestTarget([target], 0, 0, Infinity, undefined, mapSize)).toBe(target);
	});

	test('finds nearest when it is first in list', () => {
		const t1 = { id: 'near', x: 5, y: 5 };
		const t2 = { id: 'far', x: 50, y: 50 };
		expect(findNearestTarget([t1, t2], 0, 0, Infinity, undefined, mapSize)).toBe(t1);
	});

	test('finds nearest when it is last in list', () => {
		const t1 = { id: 'far', x: 40, y: 40 };
		const t2 = { id: 'near', x: 20, y: 20 };
		expect(findNearestTarget([t1, t2], 25, 25, Infinity, undefined, mapSize)).toBe(t2);
	});

	test('wraps map distances to find nearer target', () => {
		const t1 = { id: 'wrapped', x: 5, y: 50 };
		const t2 = { id: 'direct', x: 60, y: 50 };
		expect(findNearestTarget([t1, t2], 95, 50, Infinity, undefined, mapSize)).toBe(t1);
	});

	test('returns null when no targets exist', () => {
		expect(findNearestTarget([], 0, 0, Infinity, undefined, mapSize)).toBeNull();
	});

	test('returns null when filter excludes all targets', () => {
		const t1 = { id: 't1', x: 10, y: 10 };
		expect(findNearestTarget([t1], 0, 0, Infinity, () => false, mapSize)).toBeNull();
	});

	test('skips nearest target when filtered out', () => {
		const t1 = { id: 'near', x: 10, y: 10 };
		const t2 = { id: 'far', x: 20, y: 20 };
		expect(findNearestTarget([t1, t2], 0, 0, Infinity, (t) => t.id !== 'near', mapSize)).toBe(t2);
	});

	test('returns null when nearest exceeds maxDist', () => {
		const t1 = { id: 'far', x: 30, y: 30 };
		expect(findNearestTarget([t1], 0, 0, 10, undefined, mapSize)).toBeNull();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// isWaterAt
// ─────────────────────────────────────────────────────────────────────────────

describe('isWaterAt', () => {
	test('detects clear water colors', () => {
		expect(isWaterAt(10, 20, 200)).toBe(true);
	});

	test('detects deep water colors', () => {
		expect(isWaterAt(0, 0, 180)).toBe(true);
	});

	test('rejects land colors', () => {
		expect(isWaterAt(120, 100, 80)).toBe(false);
	});

	test('handles threshold edge cases', () => {
		expect(isWaterAt(30, 40, 110)).toBe(false);
		expect(isWaterAt(90, 110, 131)).toBe(true);
		expect(isWaterAt(100, 140, 150)).toBe(false);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// estimateSlopeFromSamples
// ─────────────────────────────────────────────────────────────────────────────

describe('estimateSlopeFromSamples', () => {
	test('returns zero on flat terrain', () => {
		expect(estimateSlopeFromSamples([10, 10, 10, 10, 10])).toBe(0);
	});

	test('handles gentle slopes', () => {
		expect(estimateSlopeFromSamples([10, 12, 11, 13])).toBe(3);
	});

	test('handles steep slopes', () => {
		expect(estimateSlopeFromSamples([20, 40, 18])).toBe(20);
	});

	test('handles cliffs', () => {
		expect(estimateSlopeFromSamples([5, 100])).toBe(95);
	});

	test('returns zero for a single sample', () => {
		expect(estimateSlopeFromSamples([7])).toBe(0);
	});
});
