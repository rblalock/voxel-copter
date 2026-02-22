/**
 * VoxelVibe Engine - Target Type Definitions
 * Static data for all enemy unit types, factions, and domains.
 */

export const FACTIONS = {
	ENEMY: 'enemy',
	FRIENDLY: 'friendly',
	NEUTRAL: 'neutral',
} as const;

export type Faction = (typeof FACTIONS)[keyof typeof FACTIONS];

export const DOMAINS = {
	GROUND: 'ground',
	AIR: 'air',
	STRUCTURE: 'structure',
	PLAYER: 'player',
} as const;

export type Domain = (typeof DOMAINS)[keyof typeof DOMAINS];

export interface TargetAI {
	type: string;
	speed?: number;
	patrolRadius?: number;
	patrolSpeed?: number;
	detectRange?: number;
	engageRange?: number;
	fireRate?: number;
	bulletSpeed?: number;
	bulletDamage?: number;
	accuracy?: number;
	range?: number;
	missileSpeed?: number;
	missileDamage?: number;
	role?: string;
	turnRate?: number;
	climbRate?: number;
	preferredAlt?: number;
	weaponType?: string | null;
	attackCooldown?: number;
	burstCount?: number;
	burstCooldown?: number;
}

export interface TargetTypeDef {
	type: string;
	health: number;
	maxHealth?: number;
	points: number;
	size: number;
	color: string;
	domain: Domain;
	faction: Faction;
	hitHeight: number;
	heightOffset?: number;
	canShoot?: boolean;
	ai: TargetAI | null;
}

/** All target type definitions */
export const TARGET_TYPES: Record<string, TargetTypeDef> = {
	TANK: {
		type: 'tank',
		health: 100,
		points: 100,
		size: 20,
		color: '#4a5c4a',
		domain: DOMAINS.GROUND,
		faction: FACTIONS.ENEMY,
		hitHeight: 8,
		heightOffset: 0,
		ai: {
			type: 'patrol',
			speed: 0.02,
			patrolRadius: 40,
			detectRange: 250,
			engageRange: 200,
			fireRate: 2500,
			bulletSpeed: 1.2,
			bulletDamage: 25,
		},
	},
	SOLDIER: {
		type: 'soldier',
		health: 60,
		maxHealth: 60,
		points: 100,
		size: 12,
		color: '#5a6b4a',
		domain: DOMAINS.GROUND,
		faction: FACTIONS.ENEMY,
		hitHeight: 12,
		heightOffset: 7,
		canShoot: true,
		ai: {
			type: 'infantry',
			detectRange: 200,
			engageRange: 150,
			fireRate: 800,
			accuracy: 0.05,
			bulletSpeed: 2.5,
			bulletDamage: 8,
			patrolRadius: 30,
			patrolSpeed: 0.02,
		},
	},
	SNIPER: {
		type: 'sniper',
		health: 40,
		maxHealth: 40,
		points: 150,
		size: 12,
		color: '#3a4a3a',
		domain: DOMAINS.GROUND,
		faction: FACTIONS.ENEMY,
		hitHeight: 12,
		heightOffset: 7,
		canShoot: true,
		ai: {
			type: 'sniper',
			detectRange: 400,
			engageRange: 350,
			fireRate: 2500,
			accuracy: 0.01,
			bulletSpeed: 4.0,
			bulletDamage: 25,
			patrolRadius: 15,
			patrolSpeed: 0.005,
		},
	},
	BUILDING: {
		type: 'building',
		health: 200,
		points: 200,
		size: 40,
		color: '#6b5a4a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 40,
		heightOffset: 0,
		ai: null,
	},
	HANGAR: {
		type: 'hangar',
		health: 300,
		points: 250,
		size: 50,
		color: '#5a5a5a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 35,
		heightOffset: 0,
		ai: null,
	},
	CONTROL_TOWER: {
		type: 'control_tower',
		health: 150,
		points: 300,
		size: 20,
		color: '#6a6a6a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 50,
		heightOffset: 0,
		ai: null,
	},
	BARRACKS: {
		type: 'barracks',
		health: 180,
		points: 150,
		size: 35,
		color: '#5a6a4a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 20,
		heightOffset: 0,
		ai: null,
	},
	FUEL_DEPOT: {
		type: 'fuel_depot',
		health: 100,
		points: 200,
		size: 25,
		color: '#4a4a4a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 15,
		heightOffset: 0,
		ai: null,
	},
	HELIPAD: {
		type: 'helipad',
		health: 50,
		points: 50,
		size: 30,
		color: '#3a3a3a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 2,
		heightOffset: 0,
		ai: null,
	},
	SAM_SITE: {
		type: 'sam',
		health: 150,
		points: 150,
		size: 25,
		color: '#3a4a3a',
		domain: DOMAINS.STRUCTURE,
		faction: FACTIONS.ENEMY,
		hitHeight: 20,
		heightOffset: 0,
		ai: {
			type: 'sam',
			fireRate: 8000,
			range: 350,
			missileSpeed: 1.5,
			missileDamage: 30,
		},
	},
	AIR_FIGHTER: {
		type: 'air_fighter',
		health: 80,
		points: 400,
		size: 18,
		color: '#5a5a6a',
		domain: DOMAINS.AIR,
		faction: FACTIONS.ENEMY,
		hitHeight: 8,
		ai: {
			type: 'aircraft',
			role: 'fighter',
			speed: 0.6,
			turnRate: 0.015,
			climbRate: 0.3,
			preferredAlt: 250,
			detectRange: 400,
			engageRange: 250,
			fireRate: 1200,
			weaponType: 'air_missile',
			bulletSpeed: 0.9,
			bulletDamage: 45,
			attackCooldown: 8000,
		},
	},
	AIR_TRANSPORT: {
		type: 'air_transport',
		health: 150,
		points: 300,
		size: 30,
		color: '#6a6a5a',
		domain: DOMAINS.AIR,
		faction: FACTIONS.ENEMY,
		hitHeight: 12,
		ai: {
			type: 'aircraft',
			role: 'transport',
			speed: 0.4,
			turnRate: 0.008,
			climbRate: 0.15,
			preferredAlt: 200,
			detectRange: 200,
			engageRange: 0,
			fireRate: 0,
			weaponType: null,
		},
	},
	AIR_ATTACK_HELI: {
		type: 'air_attack_heli',
		health: 120,
		points: 350,
		size: 22,
		color: '#3a3a3a',
		domain: DOMAINS.AIR,
		faction: FACTIONS.ENEMY,
		hitHeight: 10,
		ai: {
			type: 'aircraft',
			role: 'attack_heli',
			speed: 0.18,
			turnRate: 0.02,
			climbRate: 0.25,
			preferredAlt: 80,
			detectRange: 300,
			engageRange: 200,
			fireRate: 180,
			weaponType: 'air_cannon',
			bulletSpeed: 1.4,
			bulletDamage: 8,
			burstCount: 5,
			burstCooldown: 2000,
		},
	},
};

/** Entity budget limits */
export const ENTITY_BUDGET = {
	maxGround: 50,
	maxAir: 8,
	maxStructures: 30,
	maxTotal: 80,
} as const;

import type { DamageCategory } from './weapons';

/**
 * Maps a target instance to its damage category for multiplier lookup.
 * Accepts any object with at least a `type` field and optional `domain` field.
 */
export function getTargetDamageCategory(target: { type?: string; domain?: string } | null): DamageCategory {
	if (!target) return 'soldier';
	if (target.type === 'soldier') return 'soldier';
	if (target.type === 'sniper') return 'soldier';
	if (target.type === 'tank') return 'tank';
	if (target.type === 'sam') return 'sam';
	if (target.domain === DOMAINS.AIR) return 'aircraft';
	if (target.domain === DOMAINS.STRUCTURE) return 'building';
	return 'soldier';
}
