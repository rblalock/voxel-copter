/**
 * VoxelVibe Engine - Math Utilities
 * Pure math functions for angles, distances, interpolation, and terrain analysis.
 */

/** Clamps a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/** Linear interpolation between two values. */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/** Normalizes an angle to the range [0, 2*PI). */
export function normalizeAngle(angle: number): number {
	const TWO_PI = Math.PI * 2;
	return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

/** Calculates the shortest angular difference between two angles. Result is in [-PI, PI]. */
export function angleDifference(from: number, to: number): number {
	const diff = normalizeAngle(to - from);
	return diff > Math.PI ? diff - Math.PI * 2 : diff;
}

/** Normalizes an angle to the range [-PI, PI]. */
export function normalizeAngleToRange(angle: number): number {
	let a = angle;
	while (a > Math.PI) a -= Math.PI * 2;
	while (a < -Math.PI) a += Math.PI * 2;
	return a;
}

/** Calculates 2D distance between two points. */
export function distance2D(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

/** Calculates 3D distance between two points. */
export function distance3D(
	x1: number, y1: number, z1: number,
	x2: number, y2: number, z2: number,
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const dz = z2 - z1;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Calculates 3D distance between two points with map wrapping on X/Y axes. */
export function distance3DWrapped(
	x1: number, y1: number, z1: number,
	x2: number, y2: number, z2: number,
	mapSize: number,
): number {
	let dx = x1 - x2;
	let dy = y1 - y2;
	const half = mapSize / 2;
	if (dx > half) dx -= mapSize;
	if (dx < -half) dx += mapSize;
	if (dy > half) dy -= mapSize;
	if (dy < -half) dy += mapSize;
	const dz = z1 - z2;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Wraps a position within map bounds using modulo. */
export function wrapPosition(value: number, mapSize: number): number {
	return ((value % mapSize) + mapSize) % mapSize;
}

export interface TargetLike {
	x: number;
	y: number;
}

/** Finds the nearest target to a position with optional filtering and map wrapping. */
export function findNearestTarget<T extends TargetLike>(
	targets: T[],
	x: number,
	y: number,
	maxDist = Infinity,
	filterFn?: (target: T) => boolean,
	mapSize = 0,
): T | null {
	let nearest: T | null = null;
	let nearestDist = maxDist;
	const half = mapSize / 2;

	for (const target of targets) {
		if (filterFn && !filterFn(target)) continue;

		let dx = target.x - x;
		let dy = target.y - y;
		if (mapSize > 0) {
			if (dx > half) dx -= mapSize;
			if (dx < -half) dx += mapSize;
			if (dy > half) dy -= mapSize;
			if (dy < -half) dy += mapSize;
		}
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < nearestDist) {
			nearestDist = dist;
			nearest = target;
		}
	}

	return nearest;
}

/** Determines whether a color sample represents water. */
export function isWaterAt(r: number, g: number, b: number): boolean {
	return b > 110 && b > g + 20 && b > r + 20;
}

/**
 * Estimates terrain slope from a center sample and neighboring heights.
 * Expects samples[0] to be the center height.
 */
export function estimateSlopeFromSamples(samples: number[]): number {
	if (samples.length <= 1) return 0;
	const centerHeight = samples[0] ?? 0;
	let maxDiff = 0;
	for (let i = 1; i < samples.length; i++) {
		const sample = samples[i];
		if (sample === undefined) continue;
		maxDiff = Math.max(maxDiff, Math.abs(sample - centerHeight));
	}
	return maxDiff;
}
