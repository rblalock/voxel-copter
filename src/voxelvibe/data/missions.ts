/**
 * VoxelVibe Engine - Mission Definitions & Validation
 * Static mission data and helper functions for mission management.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface MissionTargets {
	tanks: number;
	buildings: number;
	sams: number;
}

export interface MissionTargetsDelta {
	soldiers: number;
	buildings: number;
	sams: number;
}

export interface MissionObjective {
	type: string;
	description: string;
	targetType?: string;
	count?: number;
	x?: number;
	y?: number;
	radius?: number;
	duration?: number;
	targetId?: string;
}

export interface MissionDef {
	id: number;
	name: string;
	map: number;
	layoutFile: string;
	briefing: string;
	briefingDelta: string;
	objectives: MissionObjective[];
	targets: MissionTargets;
	targetsDelta: MissionTargetsDelta;
	difficulty: Difficulty;
	timeLimit: number | null;
	rewards: { score: number };
	deltaOnly?: boolean;
}

/** Normalizes difficulty string to a valid difficulty level. */
export function normalizeDifficulty(difficulty: string | undefined): Difficulty {
	if (difficulty === 'normal') return 'medium';
	if (
		difficulty === 'easy' ||
		difficulty === 'medium' ||
		difficulty === 'hard' ||
		difficulty === 'extreme'
	) {
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

/** Derives target counts from AI configuration entities. */
export function deriveTargetCounts(aiConfig: AIConfig | null | undefined): TargetCounts {
	const counts: TargetCounts = { tanks: 0, soldiers: 0, buildings: 0, sams: 0 };
	if (!aiConfig || !Array.isArray(aiConfig.entities)) return counts;

	for (const spec of aiConfig.entities) {
		const typeKey = String(spec.type || '').toUpperCase();
		const rawCount = Number(spec.count || 0);
		const count = Number.isFinite(rawCount) ? rawCount : 0;

		if (typeKey === 'TANK') counts.tanks += count;
		if (typeKey === 'SOLDIER') counts.soldiers += count;
		if (typeKey === 'SNIPER') counts.soldiers += count;
		if (typeKey === 'BUILDING') counts.buildings += count;
		if (typeKey === 'SAM_SITE') counts.sams += count;
	}

	return counts;
}

/** Formats seconds into MM:SS format. */
export function formatDuration(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	const mins = Math.floor(total / 60);
	const secs = total % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Calculates accuracy percentage from shots fired and hits. */
export function calculateAccuracy(shotsFired: number, shotsHit: number): number {
	if (shotsFired <= 0) return 0;
	return Math.round((shotsHit / shotsFired) * 100);
}

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

/** Validates a mission data object. */
export function validateMission(mission: unknown): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!mission || typeof mission !== 'object') {
		return { valid: false, errors: ['Mission must be an object'], warnings: [] };
	}

	const m = mission as MissionData;

	if (typeof m.missionId !== 'number') {
		errors.push('missionId must be a number');
	}

	if (typeof m.name !== 'string' || m.name.trim() === '') {
		errors.push('name must be a non-empty string');
	}

	if (typeof m.mapIndex !== 'number' || m.mapIndex < 1) {
		errors.push('mapIndex must be a positive number');
	}

	if (!m.playerStart || typeof m.playerStart.x !== 'number' || typeof m.playerStart.y !== 'number') {
		errors.push('playerStart must have numeric x and y coordinates');
	}

	if (m.difficulty && !['easy', 'medium', 'normal', 'hard', 'extreme'].includes(m.difficulty)) {
		warnings.push(`Unknown difficulty "${m.difficulty}", will default to medium`);
	}

	if (m.weather && !['clear', 'cloudy', 'rain', 'storm', 'fog', 'night'].includes(m.weather)) {
		warnings.push(`Unknown weather "${m.weather}"`);
	}

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

	return { valid: errors.length === 0, errors, warnings };
}

/** Map data paths */
export interface MapEntry {
	color: string;
	height: string;
	name: string;
}

/** Default map list */
export const DEFAULT_MAPS: MapEntry[] = [
	{ color: '/src/web/public/maps/C1W.png', height: '/src/web/public/maps/D1.png', name: 'Map 1' },
	{ color: '/src/web/public/maps/C2W.png', height: '/src/web/public/maps/D2.png', name: 'Map 2' },
	{ color: '/src/web/public/maps/C3.png', height: '/src/web/public/maps/D3.png', name: 'Map 3' },
	{ color: '/src/web/public/maps/C4.png', height: '/src/web/public/maps/D4.png', name: 'Map 4' },
	{ color: '/src/web/public/maps/C5W.png', height: '/src/web/public/maps/D5.png', name: 'Map 5' },
	{ color: '/src/web/public/maps/C6W.png', height: '/src/web/public/maps/D6.png', name: 'Map 6' },
	{ color: '/src/web/public/maps/C7W.png', height: '/src/web/public/maps/D7.png', name: 'Map 7' },
	{ color: '/src/web/public/maps/C8.png', height: '/src/web/public/maps/D6.png', name: 'Map 8' },
	{ color: '/src/web/public/maps/C9W.png', height: '/src/web/public/maps/D9.png', name: 'Map 9' },
	{ color: '/src/web/public/maps/C10W.png', height: '/src/web/public/maps/D10.png', name: 'Map 10' },
	{ color: '/src/web/public/maps/C11W.png', height: '/src/web/public/maps/D11.png', name: 'Map 11' },
	{ color: '/src/web/public/maps/C12W.png', height: '/src/web/public/maps/D11.png', name: 'Map 12' },
	{ color: '/src/web/public/maps/C13.png', height: '/src/web/public/maps/D13.png', name: 'Map 13' },
	{ color: '/src/web/public/maps/C14.png', height: '/src/web/public/maps/D14.png', name: 'Map 14' },
	{ color: '/src/web/public/maps/C15.png', height: '/src/web/public/maps/D15.png', name: 'Map 15' },
	{ color: '/src/web/public/maps/C16W.png', height: '/src/web/public/maps/D16.png', name: 'Map 16' },
	{ color: '/src/web/public/maps/C17W.png', height: '/src/web/public/maps/D17.png', name: 'Map 17' },
	{ color: '/src/web/public/maps/C18W.png', height: '/src/web/public/maps/D18.png', name: 'Map 18' },
	{ color: '/src/web/public/maps/C19W.png', height: '/src/web/public/maps/D19.png', name: 'Map 19' },
	{ color: '/src/web/public/maps/C20W.png', height: '/src/web/public/maps/D20.png', name: 'Map 20' },
	{ color: '/src/web/public/maps/C21.png', height: '/src/web/public/maps/D21.png', name: 'Map 21' },
	{ color: '/src/web/public/maps/C22W.png', height: '/src/web/public/maps/D22.png', name: 'Map 22' },
	{ color: '/src/web/public/maps/C23W.png', height: '/src/web/public/maps/D21.png', name: 'Map 23' },
	{ color: '/src/web/public/maps/C24W.png', height: '/src/web/public/maps/D24.png', name: 'Map 24' },
	{ color: '/src/web/public/maps/C25W.png', height: '/src/web/public/maps/D25.png', name: 'Map 25' },
	{ color: '/src/web/public/maps/C26W.png', height: '/src/web/public/maps/D18.png', name: 'Map 26' },
	{ color: '/src/web/public/maps/C27W.png', height: '/src/web/public/maps/D15.png', name: 'Map 27' },
	{ color: '/src/web/public/maps/C28W.png', height: '/src/web/public/maps/D25.png', name: 'Map 28' },
	{ color: '/src/web/public/maps/C29W.png', height: '/src/web/public/maps/D16.png', name: 'Map 29' },
];
