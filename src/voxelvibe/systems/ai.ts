/**
 * VoxelVibe Engine - AI System
 * Enemy behavior patterns: patrol, infantry, sniper, SAM, and aircraft AI.
 */

import { wrapPosition } from '../core/math';
import { CONFIG } from '../core/constants';
import { DOMAINS, FACTIONS, TARGET_TYPES } from '../data/targets';
import { GAME_MODES } from '../game/state';
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

// ============================================
// AI World Context (extended for game-specific behaviors)
// ============================================

/** Extended context for game-specific AI behaviors. */
export interface AIWorldContext {
	playerX: number;
	playerY: number;
	playerZ: number;
	mapSize: number;
	now: number;
	gameMode: string;
	targets: Target[];
	enemyProjectiles: any[];
	getTerrainHeight: (x: number, y: number) => number;
	isTargetOccluded: (target: any, cam: any, dx: number, dy: number, dist: number) => boolean;
	spawnParticles: (x: number, y: number, z: number, type: string, count: number) => void;
	showMissileWarning: () => void;
	alertLevel: number;
	alertTimer: number;
	alertDuration: number;
}

// ============================================
// Shared Helpers
// ============================================

function _normalizeAngle(angle: number): number {
	while (angle > Math.PI) angle -= Math.PI * 2;
	while (angle < -Math.PI) angle += Math.PI * 2;
	return angle;
}

export function wrappedDistance3D(
	x1: number, y1: number, z1: number,
	x2: number, y2: number, z2: number,
): number {
	let dx = x1 - x2;
	let dy = y1 - y2;
	const half = CONFIG.MAP_SIZE / 2;
	if (dx > half) dx -= CONFIG.MAP_SIZE;
	if (dx < -half) dx += CONFIG.MAP_SIZE;
	if (dy > half) dy -= CONFIG.MAP_SIZE;
	if (dy < -half) dy += CONFIG.MAP_SIZE;
	const dz = z1 - z2;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Gets the detect range, modified by the current alert level in DELTA mode. */
export function getAlertedDetectRange(ctx: AIWorldContext, baseRange: number): number {
	if (ctx.gameMode !== GAME_MODES.DELTA) return baseRange;
	if (ctx.alertLevel === 0) return baseRange * 0.6;
	if (ctx.alertLevel === 1) return baseRange * 0.8;
	if (ctx.alertLevel === 2) return baseRange * 1.0;
	return baseRange * 1.5;
}

/** Raises the alert level (DELTA mode only). */
export function raiseAlertLevel(ctx: AIWorldContext): void {
	if (ctx.gameMode !== GAME_MODES.DELTA) return;
	ctx.alertLevel = Math.min(ctx.alertLevel + 1, 3);
	ctx.alertTimer = ctx.alertDuration;
}

// ============================================
// AI Behavior Functions
// ============================================

export function findNearestTargetOfFaction(ctx: AIWorldContext, fromUnit, targetFaction) {
	let nearest = null, nearestDist = Infinity;
	for (const candidate of ctx.targets) {
		if (candidate.destroyed || candidate === fromUnit || candidate.faction !== targetFaction) continue;
		const dist = wrappedDistance3D(fromUnit.x, fromUnit.y, fromUnit.z ?? 0, candidate.x, candidate.y, candidate.z ?? 0);
		if (dist < nearestDist) { nearestDist = dist; nearest = candidate; }
	}
	return nearest;
}


export function getAITarget(ctx: AIWorldContext, unit) {
	const faction = unit?.faction || FACTIONS.ENEMY;
	if (faction === FACTIONS.NEUTRAL) return null;
	const playerTarget = { x: ctx.playerX, y: ctx.playerY, z: ctx.playerZ };
	if (faction === FACTIONS.ENEMY) {
		const nearestFriendly = findNearestTargetOfFaction(ctx, unit, FACTIONS.FRIENDLY);
		if (nearestFriendly) {
			const fd = wrappedDistance3D(unit.x, unit.y, unit.z ?? 0, nearestFriendly.x, nearestFriendly.y, nearestFriendly.z ?? 0);
			const pd = wrappedDistance3D(unit.x, unit.y, unit.z ?? 0, playerTarget.x, playerTarget.y, playerTarget.z);
			if (fd < pd) return { x: nearestFriendly.x, y: nearestFriendly.y, z: nearestFriendly.z, target: nearestFriendly, isPlayer: false };
		}
		return { x: playerTarget.x, y: playerTarget.y, z: playerTarget.z, target: 'player', isPlayer: true };
	}
	if (faction === FACTIONS.FRIENDLY) {
		const nearestEnemy = findNearestTargetOfFaction(ctx, unit, FACTIONS.ENEMY);
		if (!nearestEnemy) return null;
		return { x: nearestEnemy.x, y: nearestEnemy.y, z: nearestEnemy.z, target: nearestEnemy, isPlayer: false };
	}
	return null;
}


export function airSteerToward(entity, targetX, targetY, maxTurnRate, dt) {
	const ai = entity.ai;
	const dx = targetX - entity.x, dy = targetY - entity.y;
	const targetHeading = Math.atan2(dy, dx);
	const diff = _normalizeAngle(targetHeading - ai.heading);
	ai.heading = _normalizeAngle(ai.heading + Math.sign(diff) * Math.min(Math.abs(diff), maxTurnRate * dt * 60));
}


export function airHoldAltitude(ctx: AIWorldContext, entity, targetAlt, climbRate, dt) {
	const diff = targetAlt - entity.z;
	entity.z += Math.sign(diff) * Math.min(Math.abs(diff), climbRate * dt * 60);
	entity.z = Math.max(entity.z, ctx.getTerrainHeight(entity.x, entity.y) + 20);
}


export function fireAircraftWeapon(ctx: AIWorldContext, entity, targetX, targetY, targetZ) {
	const ai = entity.ai;
	if (!ai.weaponType) return;
	const dx = targetX - entity.x, dy = targetY - entity.y, dz = targetZ - entity.z;
	const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
	if (dist <= 0) return;
	const spread = ai.weaponType === 'air_cannon' ? 0.05 : ai.weaponType === 'air_missile' ? 0.01 : 0.02;
	ctx.enemyProjectiles.push({
		type: ai.weaponType,
		x: entity.x, y: entity.y, z: entity.z,
		vx: (dx / dist + (Math.random() - 0.5) * spread) * ai.bulletSpeed,
		vy: (dy / dist + (Math.random() - 0.5) * spread) * ai.bulletSpeed,
		vz: (dz / dist) * ai.bulletSpeed,
		damage: ai.bulletDamage, sourceId: entity.id,
		life: 3000, spawnTime: performance.now(), faction: entity.faction
	});
	ctx.spawnParticles(entity.x, entity.y, entity.z, 'muzzle_flash', 1);
}


export function updateTankAI(ctx: AIWorldContext, target, deltaTime, currentTime) {
	const ai = target.ai;
	ai.patrolAngle += ai.speed * ai.patrolDirection * deltaTime * 0.001;
	target.x = ai.patrolCenter.x + Math.cos(ai.patrolAngle) * ai.patrolRadius;
	target.y = ai.patrolCenter.y + Math.sin(ai.patrolAngle) * ai.patrolRadius;
	target.x = ((target.x % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.y = ((target.y % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.z = ctx.getTerrainHeight(target.x, target.y) + TARGET_TYPES.TANK.heightOffset;
	ai.heading = _normalizeAngle(ai.patrolAngle + (ai.patrolDirection >= 0 ? Math.PI / 2 : -Math.PI / 2));
	if (ctx.gameMode !== GAME_MODES.DELTA) { ai.state = 'patrol'; return; }
	const targetInfo = getAITarget(ctx, target);
	if (!targetInfo) { ai.state = 'patrol'; return; }
	let dx = targetInfo.x - target.x, dy = targetInfo.y - target.y;
	if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE; if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
	if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE; if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const tankOrigin = { x: target.x, y: target.y, height: target.z };
	const targetPos = targetInfo.isPlayer ? { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z } : (targetInfo.target || { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z });
	const hasLOS = !ctx.isTargetOccluded(targetPos, tankOrigin, dx, dy, dist);
	if (dist <= ai.detectRange && hasLOS) ai.state = 'engage';
	else if (ai.state === 'engage' && (!hasLOS || dist > ai.detectRange * 1.2)) ai.state = 'patrol';
	if (ai.state === 'engage' && dist <= ai.engageRange && currentTime - ai.lastFired > ai.fireRate) {
		const aimAngle = Math.atan2(dx, dy);
		const dz = targetInfo.z - (target.z + 6);
		ctx.enemyProjectiles.push({ x: target.x, y: target.y, z: target.z + 6, angle: aimAngle, pitch: (dist > 0 ? dz / dist : 0) + (Math.random() - 0.5) * 0.02, speed: ai.bulletSpeed, damage: ai.bulletDamage, type: 'tank_shell', lifetime: 200, faction: target.faction });
		ctx.spawnParticles(target.x, target.y, target.z + 8, 'muzzle_flash', 1);
		ai.lastFired = currentTime;
	}
}


export function updateSamAI(ctx: AIWorldContext, target, currentTime) {
	if (ctx.gameMode !== GAME_MODES.COMANCHE) return;
	const targetInfo = getAITarget(ctx, target);
	if (!targetInfo) return;
	let dx = targetInfo.x - target.x, dy = targetInfo.y - target.y;
	if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE; if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
	if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE; if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const playerTarget = targetInfo.isPlayer ? { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z } : (targetInfo.target || { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z });
	const samCam = { x: target.x, y: target.y, height: target.z + 10 };
	const hasLOS = !ctx.isTargetOccluded(playerTarget, samCam, dx, dy, dist);
	if (dist < target.ai.range && hasLOS && currentTime - target.ai.lastFired > target.ai.fireRate) {
		ctx.enemyProjectiles.push({ x: target.x, y: target.y, z: target.z + 10, vx: 0, vy: 0, vz: target.ai.missileSpeed * 3, targetX: targetInfo.x, targetY: targetInfo.y, targetZ: targetInfo.z, speed: target.ai.missileSpeed, damage: target.ai.missileDamage, type: 'sam_missile', lifetime: 800, phase: 'launch', launchAltitude: target.z + 60, angle: 0, faction: target.faction, targetId: targetInfo.isPlayer ? 'player' : targetInfo.target?.id });
		ctx.spawnParticles(target.x, target.y, target.z + 12, 'muzzle_flash', 1);
		target.ai.lastFired = currentTime;
		if (targetInfo.isPlayer) ctx.showMissileWarning();
	}
}


export function updateSoldierAI(ctx: AIWorldContext, target, deltaTime, currentTime) {
	const ai = target.ai;
	const targetInfo = getAITarget(ctx, target);
	let dx = 0, dy = 0, dist = Infinity, hasLOS = false;
	if (targetInfo) {
		dx = targetInfo.x - target.x; dy = targetInfo.y - target.y;
		if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE; if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
		if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE; if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
		dist = Math.sqrt(dx * dx + dy * dy);
		const soldierCam = { x: target.x, y: target.y, height: target.z };
		const playerTarget = targetInfo.isPlayer ? { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z } : (targetInfo.target || { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z });
		hasLOS = !ctx.isTargetOccluded(playerTarget, soldierCam, dx, dy, dist);
		const detectRange = getAlertedDetectRange(ctx, ai.detectRange);
		if (dist <= detectRange && hasLOS) { if (targetInfo.isPlayer) raiseAlertLevel(ctx); ai.state = 'engage'; }
		else if (ai.state === 'engage' && (!hasLOS || dist > detectRange * 1.15)) ai.state = 'patrol';
	} else { ai.state = 'patrol'; }
	if (ai.state === 'patrol') {
		ai.patrolAngle += ai.patrolSpeed * deltaTime * 0.001;
		target.x = ai.patrolCenter.x + Math.cos(ai.patrolAngle) * ai.patrolRadius;
		target.y = ai.patrolCenter.y + Math.sin(ai.patrolAngle) * ai.patrolRadius;
		ai.facingAngle = ai.patrolAngle + Math.PI * 0.5; ai.pose = 'stand';
	} else {
		ai.facingAngle = Math.atan2(dx, dy);
		if (dist > ai.engageRange) { target.x += Math.sin(ai.facingAngle) * ai.patrolSpeed * 0.9 * deltaTime * 0.06; target.y += Math.cos(ai.facingAngle) * ai.patrolSpeed * 0.9 * deltaTime * 0.06; }
		if (targetInfo && dist <= ai.engageRange && currentTime - ai.lastFired > ai.fireRate) {
			const spread = (Math.random() - 0.5) * ai.accuracy;
			const aimAngle = ai.facingAngle + spread;
			const dz = targetInfo.z - target.z;
			ctx.enemyProjectiles.push({ x: target.x, y: target.y, z: target.z + 4, angle: aimAngle, pitch: (dist > 0 ? dz / dist : 0) + (Math.random() - 0.5) * ai.accuracy * 0.4, speed: ai.bulletSpeed, damage: ai.bulletDamage, type: 'infantry_bullet', lifetime: 140, faction: target.faction });
			ctx.spawnParticles(target.x, target.y, target.z + 5, 'muzzle_flash', 1);
			ai.lastFired = currentTime; ai.pose = 'shoot';
		} else { ai.pose = 'stand'; }
	}
	target.x = ((target.x % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.y = ((target.y % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.z = ctx.getTerrainHeight(target.x, target.y) + TARGET_TYPES.SOLDIER.heightOffset;
}


export function updateSniperAI(ctx: AIWorldContext, target, deltaTime, currentTime) {
	const ai = target.ai;
	const targetInfo = getAITarget(ctx, target);
	let dx = 0, dy = 0, dist = Infinity, hasLOS = false;
	if (targetInfo) {
		dx = targetInfo.x - target.x; dy = targetInfo.y - target.y;
		if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE; if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
		if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE; if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
		dist = Math.sqrt(dx * dx + dy * dy);
		const sniperCam = { x: target.x, y: target.y, height: target.z };
		const playerTarget = targetInfo.isPlayer ? { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z } : (targetInfo.target || { x: targetInfo.x, y: targetInfo.y, z: targetInfo.z });
		hasLOS = !ctx.isTargetOccluded(playerTarget, sniperCam, dx, dy, dist);
		const detectRange = getAlertedDetectRange(ctx, ai.detectRange);
		if (dist <= detectRange && hasLOS) { if (targetInfo.isPlayer) raiseAlertLevel(ctx); ai.state = 'engage'; }
		else if (ai.state === 'engage' && (!hasLOS || dist > detectRange * 1.1)) ai.state = 'overwatch';
	} else { ai.state = 'overwatch'; }
	if (ai.state === 'patrol' || ai.state === 'overwatch') {
		ai.patrolAngle += ai.patrolSpeed * deltaTime * 0.0005;
		target.x = ai.patrolCenter.x + Math.cos(ai.patrolAngle) * ai.patrolRadius * 0.5;
		target.y = ai.patrolCenter.y + Math.sin(ai.patrolAngle) * ai.patrolRadius * 0.5;
		ai.facingAngle = ai.patrolAngle; ai.pose = 'crouch';
	} else if (ai.state === 'engage') {
		ai.facingAngle = Math.atan2(dx, dy);
		if (targetInfo && dist <= ai.engageRange && currentTime - ai.lastFired > ai.fireRate) {
			const spread = (Math.random() - 0.5) * ai.accuracy;
			const dz = targetInfo.z - target.z;
			ctx.enemyProjectiles.push({ x: target.x, y: target.y, z: target.z + 3, angle: ai.facingAngle + spread, pitch: (dist > 0 ? dz / dist : 0) + (Math.random() - 0.5) * ai.accuracy * 0.2, speed: ai.bulletSpeed, damage: ai.bulletDamage, type: 'sniper_bullet', lifetime: 200, tracerColor: '#ff4400', faction: target.faction });
			ctx.spawnParticles(target.x, target.y, target.z + 3, 'muzzle_flash', 1);
			ai.lastFired = currentTime; ai.pose = 'shoot';
		} else { ai.pose = 'crouch'; }
	}
	target.x = ((target.x % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.y = ((target.y % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	target.z = ctx.getTerrainHeight(target.x, target.y) + TARGET_TYPES.SNIPER.heightOffset;
}


export function updateAircraftAI(ctx: AIWorldContext, entity, deltaTime, currentTime) {
	if (!entity.ai || entity.ai.type !== 'aircraft') return;
	const ai = entity.ai;
	const dt = deltaTime * 0.001;
	const targetInfo = getAITarget(ctx, entity);
	const hasTarget = !!targetInfo;
	const targetX = targetInfo?.x ?? entity.x, targetY = targetInfo?.y ?? entity.y, targetZ = targetInfo?.z ?? entity.z;
	let targetDx = targetX - entity.x, targetDy = targetY - entity.y;
	if (targetDx > CONFIG.MAP_SIZE / 2) targetDx -= CONFIG.MAP_SIZE; if (targetDx < -CONFIG.MAP_SIZE / 2) targetDx += CONFIG.MAP_SIZE;
	if (targetDy > CONFIG.MAP_SIZE / 2) targetDy -= CONFIG.MAP_SIZE; if (targetDy < -CONFIG.MAP_SIZE / 2) targetDy += CONFIG.MAP_SIZE;
	const targetDist = hasTarget ? Math.sqrt(targetDx * targetDx + targetDy * targetDy) : Infinity;
	if (!ai.state) { ai.state = 'patrol'; ai.patrolCenter = { x: entity.x, y: entity.y }; ai.patrolAngle = Math.random() * Math.PI * 2; ai.heading = ai.patrolAngle; ai.lastFireTime = 0; ai.lastAttackTime = ai.lastAttackTime || 0; ai.burstShotsFired = 0; ai.burstCooldownStart = 0; ai.inBurstCooldown = false; }
	const isPlayerInAir = ctx.gameMode === GAME_MODES.COMANCHE;
	switch (ai.state) {
		case 'patrol': {
			ai.patrolAngle += ai.turnRate * 0.5 * dt * 60;
			airSteerToward(entity, ai.patrolCenter.x + Math.cos(ai.patrolAngle) * 150, ai.patrolCenter.y + Math.sin(ai.patrolAngle) * 150, ai.turnRate, dt);
			airHoldAltitude(ctx, entity, ai.preferredAlt, ai.climbRate, dt);
			if (hasTarget && ((targetInfo?.isPlayer && isPlayerInAir) || !targetInfo?.isPlayer) && targetDist < ai.detectRange && ai.engageRange > 0) { ai.state = 'intercept'; ai.targetId = targetInfo?.isPlayer ? 'player' : targetInfo?.target?.id || null; }
			break;
		}
		case 'intercept': {
			if (!hasTarget) { ai.state = 'patrol'; break; }
			airSteerToward(entity, targetX, targetY, ai.turnRate, dt);
			airHoldAltitude(ctx, entity, Math.max(ai.preferredAlt, targetZ + 20), ai.climbRate, dt);
			if (targetDist < ai.engageRange) ai.state = 'attack_run';
			else if (targetDist > ai.detectRange * 1.5) ai.state = 'patrol';
			break;
		}
		case 'attack_run': {
			if (!hasTarget) { ai.state = 'patrol'; break; }
			airSteerToward(entity, targetX, targetY, ai.turnRate * 1.2, dt);
			airHoldAltitude(ctx, entity, targetZ + 10, ai.climbRate * 0.5, dt);
			if (ai.weaponType) {
				if (ai.role === 'fighter') {
				    const cooldown = ai.attackCooldown || 8000;
				    if (currentTime - ai.lastAttackTime >= cooldown) { fireAircraftWeapon(ctx, entity, targetX, targetY, targetZ); ai.lastAttackTime = currentTime; ai.lastFireTime = currentTime; ai.state = 'extend'; ai.extendTime = currentTime; }
				} else if (ai.role === 'attack_heli' && ai.burstCount && ai.burstCooldown) {
				    if (ai.inBurstCooldown) { if (currentTime - ai.burstCooldownStart >= ai.burstCooldown) { ai.inBurstCooldown = false; ai.burstShotsFired = 0; } }
				    else if (currentTime - ai.lastFireTime > ai.fireRate) { fireAircraftWeapon(ctx, entity, targetX, targetY, targetZ); ai.lastFireTime = currentTime; ai.burstShotsFired = (ai.burstShotsFired || 0) + 1; if (ai.burstShotsFired >= ai.burstCount) { ai.inBurstCooldown = true; ai.burstCooldownStart = currentTime; } }
				} else if (currentTime - ai.lastFireTime > ai.fireRate) { fireAircraftWeapon(ctx, entity, targetX, targetY, targetZ); ai.lastFireTime = currentTime; }
			}
			if (ai.role !== 'fighter') { if (targetDist < 50) { ai.state = 'extend'; ai.extendTime = currentTime; } else if (targetDist > ai.engageRange * 1.5) ai.state = 'intercept'; }
			else if (targetDist > ai.engageRange * 1.5) ai.state = 'intercept';
			if (entity.health < entity.maxHealth * 0.5) { ai.state = 'evade'; ai.evadeTime = currentTime; }
			break;
		}
		case 'extend': {
			if (!hasTarget) { ai.state = 'patrol'; break; }
			const awayAngle = Math.atan2(entity.y - targetY, entity.x - targetX);
			airSteerToward(entity, entity.x + Math.cos(awayAngle) * 100, entity.y + Math.sin(awayAngle) * 100, ai.turnRate, dt);
			airHoldAltitude(ctx, entity, ai.preferredAlt + 30, ai.climbRate, dt);
			if (currentTime - ai.extendTime > (ai.role === 'fighter' ? (ai.attackCooldown || 8000) : 3000)) ai.state = 'intercept';
			break;
		}
		case 'evade': {
			if (!hasTarget) { ai.state = 'patrol'; break; }
			const evadeAngle = Math.atan2(entity.y - targetY, entity.x - targetX) + (Math.random() - 0.5) * Math.PI;
			airSteerToward(entity, entity.x + Math.cos(evadeAngle) * 150, entity.y + Math.sin(evadeAngle) * 150, ai.turnRate * 1.5, dt);
			airHoldAltitude(ctx, entity, ai.preferredAlt + 50, ai.climbRate * 1.5, dt);
			if (currentTime - ai.evadeTime > 5000) ai.state = entity.health > entity.maxHealth * 0.3 ? 'intercept' : 'patrol';
			break;
		}
	}
	entity.x += Math.cos(ai.heading) * ai.speed * dt * 60;
	entity.y += Math.sin(ai.heading) * ai.speed * dt * 60;
	entity.x = ((entity.x % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
	entity.y = ((entity.y % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
}


/** Dispatches AI updates for all targets. */
export function updateEnemyAI(ctx: AIWorldContext, deltaTime: number, currentTime: number): void {
	for (const target of ctx.targets) {
		if (target.destroyed || !target.ai) continue;
		const aiType = target.ai.type;
		if (aiType === 'patrol') updateTankAI(ctx, target, deltaTime, currentTime);
		else if (aiType === 'sam') updateSamAI(ctx, target, currentTime);
		else if (aiType === 'infantry') updateSoldierAI(ctx, target, deltaTime, currentTime);
		else if (aiType === 'sniper') updateSniperAI(ctx, target, deltaTime, currentTime);
		else if (aiType === 'aircraft') updateAircraftAI(ctx, target, deltaTime, currentTime);
	}
}
