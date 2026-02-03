/**
 * VoxelCopter Game Utilities
 * Pure functions extracted from the game engine for testability and reuse.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Mission & Difficulty Utilities
// ─────────────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

/**
 * Normalizes difficulty string to a valid difficulty level.
 * Maps 'normal' -> 'medium', defaults unknown values to 'medium'.
 */
export function normalizeDifficulty(difficulty: string | undefined): Difficulty {
	if (difficulty === 'normal') return 'medium';
	if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard' || difficulty === 'extreme') {
		return difficulty;
	}
	return 'medium';
}

export interface EntitySpec {
	type?: string;
	count?: number;
}

export interface AIConfig {
	entities?: EntitySpec[];
	briefing?: string;
	briefingDelta?: string;
	objectives?: string[];
	difficulty?: string;
	timeLimit?: number;
}

export interface TargetCounts {
	tanks: number;
	soldiers: number;
	buildings: number;
	sams: number;
}

/**
 * Derives target counts from AI configuration entities.
 */
export function deriveTargetCounts(aiConfig: AIConfig | null | undefined): TargetCounts {
	const counts: TargetCounts = { tanks: 0, soldiers: 0, buildings: 0, sams: 0 };
	if (!aiConfig || !Array.isArray(aiConfig.entities)) return counts;

	for (const spec of aiConfig.entities) {
		const typeKey = String(spec.type || '').toUpperCase();
		const rawCount = Number(spec.count || 0);
		const count = Number.isFinite(rawCount) ? rawCount : 0;

		if (typeKey === 'TANK') counts.tanks += count;
		if (typeKey === 'SOLDIER') counts.soldiers += count;
		if (typeKey === 'BUILDING') counts.buildings += count;
		if (typeKey === 'SAM_SITE') counts.sams += count;
	}

	return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats seconds into MM:SS format.
 */
export function formatDuration(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	const mins = Math.floor(total / 60);
	const secs = total % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates accuracy percentage from shots fired and hits.
 */
export function calculateAccuracy(shotsFired: number, shotsHit: number): number {
	if (shotsFired <= 0) return 0;
	return Math.round((shotsHit / shotsFired) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Math Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Normalizes an angle to the range [0, 2*PI).
 */
export function normalizeAngle(angle: number): number {
	const TWO_PI = Math.PI * 2;
	return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

/**
 * Calculates the shortest angular difference between two angles.
 * Result is in range [-PI, PI].
 */
export function angleDifference(from: number, to: number): number {
	const diff = normalizeAngle(to - from);
	return diff > Math.PI ? diff - Math.PI * 2 : diff;
}

/**
 * Calculates 2D distance between two points.
 */
export function distance2D(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates 3D distance between two points.
 */
export function distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const dz = z2 - z1;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates 3D distance between two points with map wrapping on X/Y axes.
 */
export function distance3DWrapped(
	x1: number,
	y1: number,
	z1: number,
	x2: number,
	y2: number,
	z2: number,
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

/**
 * Normalizes an angle to the range [-PI, PI].
 */
export function normalizeAngleToRange(angle: number): number {
	while (angle > Math.PI) angle -= Math.PI * 2;
	while (angle < -Math.PI) angle += Math.PI * 2;
	return angle;
}

export interface TargetLike {
	x: number;
	y: number;
}

/**
 * Finds the nearest target to a position with optional filtering and map wrapping.
 */
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

/**
 * Determines whether a color sample represents water.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// Weapon & Combat Utilities
// ─────────────────────────────────────────────────────────────────────────────

export type WeaponType = 'cannon' | 'rocket' | 'missile' | 'bomb' | 'rifle' | 'sniper' | 'launcher';
export type TargetType = 'TANK' | 'SAM_SITE' | 'SOLDIER' | 'BUILDING' | 'HELICOPTER';

export interface DamageCategory {
	armored: boolean;
	infantry: boolean;
	structure: boolean;
	air: boolean;
}

/**
 * Returns the damage category for a target type.
 */
export function getTargetDamageCategory(targetType: TargetType): DamageCategory {
	switch (targetType) {
		case 'TANK':
			return { armored: true, infantry: false, structure: false, air: false };
		case 'SAM_SITE':
			return { armored: true, infantry: false, structure: false, air: false };
		case 'SOLDIER':
			return { armored: false, infantry: true, structure: false, air: false };
		case 'BUILDING':
			return { armored: false, infantry: false, structure: true, air: false };
		case 'HELICOPTER':
			return { armored: false, infantry: false, structure: false, air: true };
		default:
			return { armored: false, infantry: false, structure: false, air: false };
	}
}

/**
 * Damage multipliers for weapon vs target combinations.
 */
const DAMAGE_MULTIPLIERS: Record<WeaponType, Partial<Record<TargetType, number>>> = {
	cannon: { TANK: 0.5, SAM_SITE: 1.0, SOLDIER: 2.0, BUILDING: 0.3, HELICOPTER: 1.5 },
	rocket: { TANK: 1.5, SAM_SITE: 1.5, SOLDIER: 1.0, BUILDING: 1.0, HELICOPTER: 1.0 },
	missile: { TANK: 2.0, SAM_SITE: 2.0, SOLDIER: 0.5, BUILDING: 1.5, HELICOPTER: 2.0 },
	bomb: { TANK: 2.5, SAM_SITE: 2.0, SOLDIER: 1.5, BUILDING: 3.0, HELICOPTER: 0.5 },
	rifle: { TANK: 0.1, SAM_SITE: 0.2, SOLDIER: 1.0, BUILDING: 0.1, HELICOPTER: 0.3 },
	sniper: { TANK: 0.2, SAM_SITE: 0.5, SOLDIER: 3.0, BUILDING: 0.2, HELICOPTER: 0.5 },
	launcher: { TANK: 2.0, SAM_SITE: 1.5, SOLDIER: 0.5, BUILDING: 1.0, HELICOPTER: 2.5 },
};

/**
 * Gets the damage multiplier for a weapon against a target.
 */
export function getDamageMultiplier(weaponType: WeaponType, targetType: TargetType): number {
	return DAMAGE_MULTIPLIERS[weaponType]?.[targetType] ?? 1.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mission Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface MissionData {
	missionId?: number;
	name?: string;
	mapIndex?: number;
	difficulty?: string;
	weather?: string;
	playerStart?: { x: number; y: number };
	airports?: Array<{ x: number; y: number }>;
	bases?: Array<{ x: number; y: number; size?: string; faction?: string }>;
	helipads?: Array<{ x: number; y: number }>;
	spawnZones?: Array<{ x: number; y: number; radius?: number; types?: string[]; count?: number }>;
	objectives?: string[];
	briefing?: string;
	timeLimit?: number;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates a mission data object.
 */
export function validateMission(mission: unknown): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!mission || typeof mission !== 'object') {
		return { valid: false, errors: ['Mission must be an object'], warnings: [] };
	}

	const m = mission as MissionData;

	// Required fields
	if (typeof m.missionId !== 'number') {
		errors.push('missionId must be a number');
	}

	if (typeof m.name !== 'string' || m.name.trim() === '') {
		errors.push('name must be a non-empty string');
	}

	if (typeof m.mapIndex !== 'number' || m.mapIndex < 1) {
		errors.push('mapIndex must be a positive number');
	}

	// Player start validation
	if (!m.playerStart || typeof m.playerStart.x !== 'number' || typeof m.playerStart.y !== 'number') {
		errors.push('playerStart must have numeric x and y coordinates');
	}

	// Optional fields with warnings
	if (m.difficulty && !['easy', 'medium', 'normal', 'hard', 'extreme'].includes(m.difficulty)) {
		warnings.push(`Unknown difficulty "${m.difficulty}", will default to medium`);
	}

	if (m.weather && !['clear', 'cloudy', 'rain', 'storm', 'fog', 'night'].includes(m.weather)) {
		warnings.push(`Unknown weather "${m.weather}"`);
	}

	// Spawn zones validation
	if (m.spawnZones && Array.isArray(m.spawnZones)) {
		m.spawnZones.forEach((zone, i) => {
			if (typeof zone.x !== 'number' || typeof zone.y !== 'number') {
				errors.push(`spawnZones[${i}] must have numeric x and y`);
			}
			if (zone.count !== undefined && (typeof zone.count !== 'number' || zone.count < 0)) {
				warnings.push(`spawnZones[${i}].count should be a non-negative number`);
			}
		});
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
