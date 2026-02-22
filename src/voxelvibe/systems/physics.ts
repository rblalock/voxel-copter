/**
 * VoxelVibe Engine - Physics System
 * Helicopter flight model, soldier movement, and terrain collision.
 */

import { clamp, wrapPosition } from '../core/math';

/** Helicopter physics tuning constants */
export const HELI_PHYSICS = {
	MAX_BANK: Math.PI / 4,
	BANK_RATE: 0.012,
	BANK_RETURN: 0.015,
	TURN_BANK_RATIO: 0.001,
	MAX_FORWARD_SPEED: 0.3,
	ACCELERATION: 0.005,
	DECELERATION: 0.003,
	LATERAL_DRIFT: 0.01,
	MAX_YAW_RATE: 0.008,
	PITCH_RATE: 0.5,
} as const;

/** Soldier movement tuning constants */
export const SOLDIER_PHYSICS = {
	stanceEyeHeights: { stand: 14, crouch: 9, prone: 4 } as Record<string, number>,
	stanceSpeeds: {
		stand: 0.15,
		sprint: 0.28,
		crouch: 0.075,
		prone: 0.0375,
	} as Record<string, number>,
	accel: 0.008,
	friction: 0.85,
	headBobSpeed: 0.15,
} as const;

/** Camera/flight state used by both helicopter and soldier modes. */
export interface CameraState {
	x: number;
	y: number;
	height: number;
	angle: number;
	horizon: number;
	distance: number;
	bank: number;
	bankVelocity: number;
	pitch: number;
	yawRate: number;
	forwardSpeed: number;
	lateralSpeed: number;
	verticalSpeed: number;
}

/** Creates default camera state. */
export function createCameraState(): CameraState {
	return {
		x: 512, y: 512, height: 150,
		angle: 0, horizon: 100, distance: 1200,
		bank: 0, bankVelocity: 0, pitch: 0,
		yawRate: 0, forwardSpeed: 0, lateralSpeed: 0, verticalSpeed: 0,
	};
}

/** Input flags consumed by physics update. */
export interface PhysicsInput {
	forward: boolean;
	backward: boolean;
	bankLeft: boolean;
	bankRight: boolean;
	yawLeft: boolean;
	yawRight: boolean;
	climbUp: boolean;
	climbDown: boolean;
	boost: boolean;
	strafeLeft: boolean;
	strafeRight: boolean;
}

/** Config values needed during physics update. */
export interface PhysicsConfig {
	mapSize: number;
	minAltitude: number;
	maxAltitude: number;
	moveSpeed: number;
	climbSpeed: number;
	boostMultiplier: number;
	collisionMargin: number;
	screenHeight: number;
}

/**
 * Updates helicopter flight physics.
 * Applies banking, acceleration, yaw, climb, and terrain collision.
 */
export function updateHelicopterPhysics(
	cam: CameraState,
	input: PhysicsInput,
	config: PhysicsConfig,
	dt: number,
	getTerrainHeight: (x: number, y: number) => number,
): void {
	const boost = input.boost ? config.boostMultiplier : 1;
	const climbSpeed = config.climbSpeed * boost;

	// Banking
	let bankInput = 0;
	if (input.bankLeft) bankInput = 1;
	if (input.bankRight) bankInput = -1;

	if (bankInput !== 0) {
		cam.bank += bankInput * HELI_PHYSICS.BANK_RATE;
	} else {
		cam.bank *= 1 - HELI_PHYSICS.BANK_RETURN;
		if (Math.abs(cam.bank) < 0.01) cam.bank = 0;
	}
	cam.bank = clamp(cam.bank, -HELI_PHYSICS.MAX_BANK, HELI_PHYSICS.MAX_BANK);

	// Forward/backward
	if (input.forward) {
		cam.forwardSpeed += HELI_PHYSICS.ACCELERATION * boost;
	} else if (input.backward) {
		cam.forwardSpeed -= HELI_PHYSICS.ACCELERATION * boost;
	} else {
		cam.forwardSpeed *= 1 - HELI_PHYSICS.DECELERATION;
	}
	const maxSpeed = HELI_PHYSICS.MAX_FORWARD_SPEED * boost;
	cam.forwardSpeed = clamp(cam.forwardSpeed, -maxSpeed, maxSpeed);

	// Lateral strafe / bank drift
	if (input.strafeLeft) {
		cam.lateralSpeed += HELI_PHYSICS.ACCELERATION * boost;
	} else if (input.strafeRight) {
		cam.lateralSpeed -= HELI_PHYSICS.ACCELERATION * boost;
	} else {
		const bankDrift = -cam.bank * HELI_PHYSICS.LATERAL_DRIFT * Math.abs(cam.forwardSpeed);
		cam.lateralSpeed *= 1 - HELI_PHYSICS.DECELERATION;
		cam.lateralSpeed += bankDrift;
	}
	cam.lateralSpeed = clamp(cam.lateralSpeed, -maxSpeed, maxSpeed);

	// Turn rate from bank
	const effectiveSpeed = Math.max(0.3, Math.abs(cam.forwardSpeed) / HELI_PHYSICS.MAX_FORWARD_SPEED);
	cam.yawRate = cam.bank * HELI_PHYSICS.TURN_BANK_RATIO * effectiveSpeed * 15;
	cam.angle += cam.yawRate;

	// Direct yaw (J/L)
	if (input.yawLeft) cam.angle += HELI_PHYSICS.MAX_YAW_RATE * dt;
	if (input.yawRight) cam.angle -= HELI_PHYSICS.MAX_YAW_RATE * dt;

	// Apply movement
	const sinAngle = Math.sin(cam.angle);
	const cosAngle = Math.cos(cam.angle);
	cam.x -= sinAngle * cam.forwardSpeed * dt;
	cam.y -= cosAngle * cam.forwardSpeed * dt;
	cam.x -= cosAngle * cam.lateralSpeed * dt;
	cam.y += sinAngle * cam.lateralSpeed * dt;

	// Altitude
	if (input.climbUp) {
		cam.verticalSpeed += climbSpeed * 0.06 * dt;
	} else if (input.climbDown) {
		cam.verticalSpeed -= climbSpeed * 0.06 * dt;
	} else {
		cam.verticalSpeed *= Math.max(0, 1 - 0.08 * dt);
	}
	cam.verticalSpeed = clamp(cam.verticalSpeed, -climbSpeed * 0.7, climbSpeed);
	cam.height += cam.verticalSpeed * dt;

	// Pitch decay
	cam.pitch *= Math.max(0, 1 - 0.05 * dt);

	// Clamp and wrap
	cam.horizon = clamp(cam.horizon, 0, config.screenHeight);
	cam.height = clamp(cam.height, config.minAltitude, config.maxAltitude);
	cam.x = wrapPosition(cam.x, config.mapSize);
	cam.y = wrapPosition(cam.y, config.mapSize);

	// Terrain collision
	const terrainH = getTerrainHeight(cam.x, cam.y);
	if (cam.height < terrainH + config.collisionMargin) {
		cam.height = terrainH + config.collisionMargin;
		cam.verticalSpeed = Math.max(0, cam.verticalSpeed);
	}
}

/**
 * Updates simple direct-turn physics (no banking).
 */
export function updateSimplePhysics(
	cam: CameraState,
	input: PhysicsInput,
	config: PhysicsConfig,
	dt: number,
	getTerrainHeight: (x: number, y: number) => number,
): void {
	const boost = input.boost ? config.boostMultiplier : 1;
	const turnSpeed = 0.008;

	if (input.bankLeft) cam.angle += turnSpeed * boost * dt;
	if (input.bankRight) cam.angle -= turnSpeed * boost * dt;

	if (input.forward) {
		cam.forwardSpeed = config.moveSpeed * boost;
	} else if (input.backward) {
		cam.forwardSpeed = -config.moveSpeed * boost * 0.5;
	} else {
		cam.forwardSpeed = 0;
	}

	cam.bank = 0;
	cam.lateralSpeed = 0;

	// Apply movement
	const sinAngle = Math.sin(cam.angle);
	const cosAngle = Math.cos(cam.angle);
	cam.x -= sinAngle * cam.forwardSpeed * dt;
	cam.y -= cosAngle * cam.forwardSpeed * dt;

	// Altitude (same as helicopter)
	const climbSpeed = config.climbSpeed * boost;
	if (input.climbUp) {
		cam.verticalSpeed += climbSpeed * 0.06 * dt;
	} else if (input.climbDown) {
		cam.verticalSpeed -= climbSpeed * 0.06 * dt;
	} else {
		cam.verticalSpeed *= Math.max(0, 1 - 0.08 * dt);
	}
	cam.verticalSpeed = clamp(cam.verticalSpeed, -climbSpeed * 0.7, climbSpeed);
	cam.height += cam.verticalSpeed * dt;

	cam.horizon = clamp(cam.horizon, 0, config.screenHeight);
	cam.height = clamp(cam.height, config.minAltitude, config.maxAltitude);
	cam.x = wrapPosition(cam.x, config.mapSize);
	cam.y = wrapPosition(cam.y, config.mapSize);

	const terrainH = getTerrainHeight(cam.x, cam.y);
	if (cam.height < terrainH + config.collisionMargin) {
		cam.height = terrainH + config.collisionMargin;
		cam.verticalSpeed = Math.max(0, cam.verticalSpeed);
	}
}

/** Helicopter state for player entity tracking. */
export interface HeliState {
	x: number;
	y: number;
	z: number;
	angle: number;
	bank: number;
	forwardSpeed: number;
	lateralSpeed: number;
	verticalSpeed: number;
	health: number;
	maxHealth: number;
	destroyed: boolean;
	visible: boolean;
}

/** Creates default helicopter state. */
export function createHeliState(): HeliState {
	return {
		x: 512, y: 512, z: 25,
		angle: 0, bank: 0,
		forwardSpeed: 0, lateralSpeed: 0, verticalSpeed: 0,
		health: 200, maxHealth: 200,
		destroyed: false, visible: true,
	};
}

/** Checks if the helicopter is on the ground (landed). */
export function isHeliLanded(heli: HeliState, getTerrainHeight?: (x: number, y: number) => number): boolean {
	if (!getTerrainHeight) return false;
	const terrainH = getTerrainHeight(heli.x, heli.y);
	return heli.z <= terrainH + 10 && Math.abs(heli.forwardSpeed) < 0.05;
}

/** Soldier state for player entity tracking. */
export interface SoldierState {
	x: number;
	y: number;
	stance: string;
	health: number;
}

/** Creates default soldier state. */
export function createSoldierState(): SoldierState {
	return { x: 512, y: 512, stance: 'stand', health: 100 };
}
