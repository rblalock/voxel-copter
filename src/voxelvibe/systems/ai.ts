/**
 * VoxelVibe Engine - AI System
 * Enemy behavior patterns: patrol, infantry, sniper, SAM, and aircraft AI.
 */

import { wrapPosition } from '../core/math';
import { DOMAINS } from '../data/targets';
import type { Target } from './combat';

/** AI behavior update context. */
export interface AIContext {
	playerX: number;
	playerY: number;
	playerZ: number;
	mapSize: number;
	now: number;
	getTerrainHeight: (x: number, y: number) => number;
}

/**
 * Calculates wrapped distance between two points on a toroidal map.
 */
export function wrappedDistance2D(
	x1: number, y1: number,
	x2: number, y2: number,
	mapSize: number,
): number {
	let dx = x1 - x2;
	let dy = y1 - y2;
	const half = mapSize / 2;
	if (dx > half) dx -= mapSize;
	if (dx < -half) dx += mapSize;
	if (dy > half) dy -= mapSize;
	if (dy < -half) dy += mapSize;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates angle from source to target with map wrapping.
 */
export function wrappedAngleTo(
	fromX: number, fromY: number,
	toX: number, toY: number,
	mapSize: number,
): number {
	let dx = toX - fromX;
	let dy = toY - fromY;
	const half = mapSize / 2;
	if (dx > half) dx -= mapSize;
	if (dx < -half) dx += mapSize;
	if (dy > half) dy -= mapSize;
	if (dy < -half) dy += mapSize;
	return Math.atan2(dx, dy);
}

/**
 * Updates patrol AI: moves the target in a circle around its spawn point.
 */
export function updatePatrolAI(
	target: Target,
	ctx: AIContext,
	deltaTime: number,
): void {
	if (!target.ai || target.destroyed) return;

	const ai = target.ai;
	const speed = ai.speed || 0.02;
	const radius = ai.patrolRadius || 40;

	// Simple circular patrol around spawn point
	const time = ctx.now * 0.001 * speed;
	target.x = wrapPosition(target.spawnX + Math.cos(time) * radius, ctx.mapSize);
	target.y = wrapPosition(target.spawnY + Math.sin(time) * radius, ctx.mapSize);

	// Update altitude to terrain
	if (target.domain === DOMAINS.GROUND) {
		target.z = ctx.getTerrainHeight(target.x, target.y);
	}
}

/**
 * Checks if a target can fire at the player based on range and fire rate.
 */
export function canTargetFire(
	target: Target,
	playerX: number, playerY: number,
	mapSize: number,
	now: number,
): boolean {
	if (!target.ai || target.destroyed) return false;

	const dist = wrappedDistance2D(target.x, target.y, playerX, playerY, mapSize);
	const engageRange = target.ai.engageRange || target.ai.range || 200;
	const fireRate = target.ai.fireRate || 2000;

	if (dist > engageRange) return false;
	if (now - target.lastFireTime < fireRate) return false;

	// Burst fire check
	if (target.ai.burstCount && target.ai.burstCooldown) {
		if (target.burstCooldownUntil && now < target.burstCooldownUntil) return false;
		if (target.burstShotsLeft !== undefined && target.burstShotsLeft <= 0) {
			target.burstCooldownUntil = now + target.ai.burstCooldown;
			target.burstShotsLeft = target.ai.burstCount;
			return false;
		}
	}

	return true;
}

/**
 * Records that a target has fired, updating timers and burst counters.
 */
export function recordTargetFire(target: Target, now: number): void {
	target.lastFireTime = now;
	if (target.burstShotsLeft !== undefined) {
		target.burstShotsLeft--;
	}
}

/** Alert level for stealth gameplay. */
export interface AlertState {
	level: number;       // 0=undetected, 1=suspicious, 2=alert, 3=full alarm
	timer: number;       // Time until alert decays
	duration: number;    // How long alerts last (ms)
}

/** Creates initial alert state. */
export function createAlertState(): AlertState {
	return { level: 0, timer: 0, duration: 30000 };
}

/** Raises the alert level. */
export function raiseAlert(state: AlertState, level: number, now: number): void {
	state.level = Math.max(state.level, Math.min(3, level));
	state.timer = now + state.duration;
}

/** Updates alert level decay. */
export function updateAlertLevel(state: AlertState, now: number): void {
	if (state.level > 0 && now > state.timer) {
		state.level = Math.max(0, state.level - 1);
		if (state.level > 0) {
			state.timer = now + state.duration;
		}
	}
}
