/**
 * VoxelVibe Engine - Math Utilities Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	clamp,
	lerp,
	normalizeAngle,
	angleDifference,
	normalizeAngleToRange,
	distance2D,
	distance3D,
	distance3DWrapped,
	wrapPosition,
	findNearestTarget,
	isWaterAt,
	estimateSlopeFromSamples,
} from '../../src/voxelvibe/core/math';

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

describe('normalizeAngleToRange', () => {
	test('returns angles already in range', () => {
		expect(normalizeAngleToRange(0.5)).toBeCloseTo(0.5);
		expect(normalizeAngleToRange(-1.1)).toBeCloseTo(-1.1);
	});

	test('handles angles greater than 2PI', () => {
		expect(normalizeAngleToRange(Math.PI * 3)).toBeCloseTo(Math.PI);
	});

	test('handles angles less than -PI', () => {
		expect(normalizeAngleToRange(-1.5 * Math.PI)).toBeCloseTo(0.5 * Math.PI);
	});

	test('handles multiple rotations', () => {
		expect(normalizeAngleToRange(10 * Math.PI)).toBeCloseTo(0);
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
});

describe('wrapPosition', () => {
	test('wraps within bounds', () => {
		expect(wrapPosition(512, 1024)).toBe(512);
		expect(wrapPosition(1024, 1024)).toBe(0);
		expect(wrapPosition(-1, 1024)).toBe(1023);
		expect(wrapPosition(1025, 1024)).toBe(1);
	});
});

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

	test('returns null when nearest exceeds maxDist', () => {
		const t1 = { id: 'far', x: 30, y: 30 };
		expect(findNearestTarget([t1], 0, 0, 10, undefined, mapSize)).toBeNull();
	});
});

describe('isWaterAt', () => {
	test('detects water colors', () => {
		expect(isWaterAt(10, 20, 200)).toBe(true);
		expect(isWaterAt(0, 0, 180)).toBe(true);
	});

	test('rejects land colors', () => {
		expect(isWaterAt(120, 100, 80)).toBe(false);
	});
});

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

	test('returns zero for a single sample', () => {
		expect(estimateSlopeFromSamples([7])).toBe(0);
	});
});
