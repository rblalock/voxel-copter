/**
 * VoxelVibe Engine - Combat System
 * Targeting, projectile management, damage calculation, and objective tracking.
 */

import type { DamageCategory } from '../data/weapons';
import { DAMAGE_MULTIPLIERS } from '../data/weapons';
import { DOMAINS, type Domain } from '../data/targets';

/** A runtime target instance in the game world. */
export interface Target {
	id: string;
	type: string;
	x: number;
	y: number;
	z: number;
	health: number;
	maxHealth: number;
	points: number;
	size: number;
	color: string;
	domain: Domain;
	faction: string;
	hitHeight: number;
	heightOffset: number;
	destroyed: boolean;
	spawnX: number;
	spawnY: number;
	angle: number;
	ai: any;
	lastFireTime: number;
	canShoot?: boolean;
	burstShotsLeft?: number;
	burstCooldownUntil?: number;
}

/** A projectile in flight. */
export interface Projectile {
	x: number;
	y: number;
	z: number;
	vx: number;
	vy: number;
	vz: number;
	damage: number;
	weapon: string;
	speed: number;
	life: number;
	guided: boolean;
	targetId: string | null;
	airToAir: boolean;
}

/** An active explosion in the world. */
export interface Explosion {
	x: number;
	y: number;
	z: number;
	radius: number;
	maxRadius: number;
	time: number;
	maxTime: number;
	damage: number;
}

/** Targeting system state. */
export interface TargetingState {
	lockedTarget: Target | null;
	selectedTarget: Target | null;
	lockProgress: number;
	lockStartTime: number;
	isLocking: boolean;
	lastCycleTime: number;
}

/** Creates initial targeting state. */
export function createTargetingState(): TargetingState {
	return {
		lockedTarget: null,
		selectedTarget: null,
		lockProgress: 0,
		lockStartTime: 0,
		isLocking: false,
		lastCycleTime: 0,
	};
}

/** Resets targeting state. */
export function resetTargeting(state: TargetingState): void {
	state.lockedTarget = null;
	state.selectedTarget = null;
	state.lockProgress = 0;
	state.isLocking = false;
	state.lockStartTime = 0;
}

/** Lock acquisition times by weapon type (ms). */
export const LOCK_TIMES: Record<string, number> = {
	hellfire: 1500,
	stinger: 1000,
	javelin: 2000,
};

/** Returns the lock time for a given weapon. */
export function getLockTime(weaponKey: string): number {
	return LOCK_TIMES[weaponKey] || 0;
}

/** Determines valid target domains for a weapon. */
export function getValidTargetDomain(weaponKey: string): { domain: string | null; requiresLock: boolean } {
	if (weaponKey === 'stinger') {
		return { domain: DOMAINS.AIR, requiresLock: true };
	} else if (weaponKey === 'hellfire' || weaponKey === 'javelin') {
		return { domain: 'surface', requiresLock: true };
	}
	return { domain: null, requiresLock: false };
}

/** Checks if a target is valid for a given weapon's targeting constraints. */
export function isValidTarget(
	target: Target | null,
	weaponKey: string,
	enemyFaction: string,
): boolean {
	if (!target || target.destroyed) return false;
	if (target.faction !== enemyFaction) return false;

	const valid = getValidTargetDomain(weaponKey);
	if (valid.domain) {
		if (valid.domain === 'surface') {
			if (target.domain === DOMAINS.AIR) return false;
		} else if (target.domain !== valid.domain) {
			return false;
		}
	}
	return true;
}

/** Returns the targeting range for a weapon. */
export function getTargetingRange(weaponKey: string): number {
	if (weaponKey === 'hellfire' || weaponKey === 'javelin') return 2000;
	if (weaponKey === 'stinger') return 1200;
	return 800;
}

/** Maps a target to its damage category for multiplier lookup. */
export function getTargetDamageCategory(target: Target | null): DamageCategory {
	if (!target) return 'soldier';
	if (target.type === 'soldier' || target.type === 'sniper') return 'soldier';
	if (target.type === 'tank') return 'tank';
	if (target.type === 'sam') return 'sam';
	if (target.domain === DOMAINS.AIR) return 'aircraft';
	if (target.domain === DOMAINS.STRUCTURE) return 'building';
	return 'soldier';
}

/** Returns the damage multiplier for a weapon against a specific target. */
export function getDamageForTarget(weaponType: string, target: Target | null): number {
	const category = getTargetDamageCategory(target);
	return DAMAGE_MULTIPLIERS[weaponType]?.[category] ?? 1.0;
}

/** Creates a new projectile. */
export function createProjectile(
	x: number, y: number, z: number,
	angle: number,
	weapon: string,
	damage: number,
	speed: number,
	spread: number,
	guided: boolean,
	targetId: string | null,
	airToAir: boolean,
): Projectile {
	const finalAngle = angle + (Math.random() - 0.5) * spread;
	return {
		x, y, z,
		vx: -Math.sin(finalAngle) * speed,
		vy: -Math.cos(finalAngle) * speed,
		vz: 0,
		damage,
		weapon,
		speed,
		life: 5.0,
		guided,
		targetId,
		airToAir,
	};
}

/** Updates projectile positions and removes expired ones. */
export function updateProjectiles(
	projectiles: Projectile[],
	deltaTime: number,
	mapSize: number,
): void {
	const dt = deltaTime / 1000;
	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		p.life -= dt;
		if (p.life <= 0) {
			projectiles.splice(i, 1);
			continue;
		}
		p.x += p.vx * deltaTime * 0.06;
		p.y += p.vy * deltaTime * 0.06;
		p.z += p.vz * deltaTime * 0.06;

		// Wrap position
		p.x = ((p.x % mapSize) + mapSize) % mapSize;
		p.y = ((p.y % mapSize) + mapSize) % mapSize;
	}
}

/** Screen shake state. */
export interface ScreenShake {
	x: number;
	y: number;
	intensity: number;
	decay: number;
	duration: number;
}

/** Creates initial screen shake state. */
export function createScreenShake(): ScreenShake {
	return { x: 0, y: 0, intensity: 0, decay: 0.9, duration: 0 };
}

/** Triggers a screen shake effect. */
export function triggerScreenShake(shake: ScreenShake, intensity: number, duration: number): void {
	shake.intensity = Math.max(shake.intensity, intensity);
	shake.duration = Math.max(shake.duration, duration);
}

/** Updates screen shake decay. */
export function updateScreenShake(shake: ScreenShake, deltaTime: number): void {
	if (shake.intensity > 0) {
		shake.x = (Math.random() - 0.5) * shake.intensity * 2;
		shake.y = (Math.random() - 0.5) * shake.intensity * 2;
		shake.intensity *= shake.decay;
		shake.duration -= deltaTime;
		if (shake.intensity < 0.1 || shake.duration <= 0) {
			shake.intensity = 0;
			shake.x = 0;
			shake.y = 0;
		}
	}
}

/** Countermeasure state. */
export interface CountermeasureState {
	chaff: { count: number; cooldown: number; lastUsed: number };
	flare: { count: number; cooldown: number; lastUsed: number };
}

/** Creates initial countermeasure state. */
export function createCountermeasureState(): CountermeasureState {
	return {
		chaff: { count: 10, cooldown: 2000, lastUsed: 0 },
		flare: { count: 10, cooldown: 2000, lastUsed: 0 },
	};
}

/** Attempts to deploy a countermeasure. Returns true if deployed. */
export function deployCountermeasure(
	state: CountermeasureState,
	type: 'chaff' | 'flare',
	now: number,
): boolean {
	const cm = state[type];
	if (cm.count <= 0) return false;
	if (now - cm.lastUsed < cm.cooldown) return false;
	cm.count--;
	cm.lastUsed = now;
	return true;
}

/** Mission objective state tracking. */
export interface ObjectiveProgress {
	id: string;
	type: string;
	description: string;
	progress: number;
	total: number;
	complete: boolean;
	failed: boolean;
	targetType?: string;
	x?: number;
	y?: number;
	radius?: number;
	duration?: number;
	targetId?: string;
}

/** Gets the total required for an objective type. */
export function getObjectiveTotal(obj: { type: string; count?: number; duration?: number }): number {
	switch (obj.type) {
		case 'destroy_type':
		case 'destroy_count':
			return obj.count || 1;
		case 'survive_time':
			return obj.duration || 60;
		case 'destroy_all':
			return -1;
		default:
			return 1;
	}
}

/** Gets display text for an objective's progress. */
export function getObjectiveProgressText(obj: ObjectiveProgress, remainingTargets: number): string {
	switch (obj.type) {
		case 'destroy_all':
			return remainingTargets === 0 ? 'COMPLETE' : `${remainingTargets} remaining`;
		case 'destroy_type':
		case 'destroy_count':
			return `${obj.progress}/${obj.total}`;
		case 'survive_time': {
			const remaining = Math.max(0, obj.total - obj.progress);
			return `${Math.ceil(remaining)}s`;
		}
		case 'reach_location':
			return obj.complete ? 'REACHED' : 'IN PROGRESS';
		case 'protect_target':
			return obj.failed ? 'FAILED' : 'PROTECTED';
		default:
			return obj.complete ? 'COMPLETE' : 'IN PROGRESS';
	}
}
