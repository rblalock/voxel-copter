/**
 * VoxelVibe Engine - Physics System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	HELI_PHYSICS,
	SOLDIER_PHYSICS,
	createCameraState,
	updateHelicopterPhysics,
	updateSimplePhysics,
	createHeliState,
	isHeliLanded,
	createSoldierState,
	type PhysicsInput,
	type PhysicsConfig,
} from '../../src/voxelvibe/systems/physics';

const flatTerrain = () => 0;

const defaultConfig: PhysicsConfig = {
	mapSize: 1024,
	minAltitude: 5,
	maxAltitude: 800,
	moveSpeed: 0.25,
	climbSpeed: 0.25,
	boostMultiplier: 3.0,
	collisionMargin: 5,
	screenHeight: 600,
};

const noInput: PhysicsInput = {
	forward: false, backward: false,
	bankLeft: false, bankRight: false,
	yawLeft: false, yawRight: false,
	climbUp: false, climbDown: false,
	boost: false,
	strafeLeft: false, strafeRight: false,
};

describe('HELI_PHYSICS constants', () => {
	test('has reasonable values', () => {
		expect(HELI_PHYSICS.MAX_BANK).toBeGreaterThan(0);
		expect(HELI_PHYSICS.MAX_FORWARD_SPEED).toBeGreaterThan(0);
		expect(HELI_PHYSICS.ACCELERATION).toBeGreaterThan(0);
	});
});

describe('createCameraState', () => {
	test('creates with default values', () => {
		const cam = createCameraState();
		expect(cam.x).toBe(512);
		expect(cam.y).toBe(512);
		expect(cam.height).toBe(150);
		expect(cam.forwardSpeed).toBe(0);
		expect(cam.bank).toBe(0);
	});
});

describe('updateHelicopterPhysics', () => {
	test('forward input increases forward speed', () => {
		const cam = createCameraState();
		updateHelicopterPhysics(cam, { ...noInput, forward: true }, defaultConfig, 1, flatTerrain);
		expect(cam.forwardSpeed).toBeGreaterThan(0);
	});

	test('backward input decreases forward speed', () => {
		const cam = createCameraState();
		updateHelicopterPhysics(cam, { ...noInput, backward: true }, defaultConfig, 1, flatTerrain);
		expect(cam.forwardSpeed).toBeLessThan(0);
	});

	test('no input decelerates forward speed', () => {
		const cam = createCameraState();
		cam.forwardSpeed = 0.2;
		updateHelicopterPhysics(cam, noInput, defaultConfig, 1, flatTerrain);
		expect(cam.forwardSpeed).toBeLessThan(0.2);
		expect(cam.forwardSpeed).toBeGreaterThan(0);
	});

	test('bank left input increases bank', () => {
		const cam = createCameraState();
		updateHelicopterPhysics(cam, { ...noInput, bankLeft: true }, defaultConfig, 1, flatTerrain);
		expect(cam.bank).toBeGreaterThan(0);
	});

	test('bank right input decreases bank', () => {
		const cam = createCameraState();
		updateHelicopterPhysics(cam, { ...noInput, bankRight: true }, defaultConfig, 1, flatTerrain);
		expect(cam.bank).toBeLessThan(0);
	});

	test('bank is clamped to MAX_BANK', () => {
		const cam = createCameraState();
		cam.bank = 100;
		updateHelicopterPhysics(cam, noInput, defaultConfig, 1, flatTerrain);
		expect(Math.abs(cam.bank)).toBeLessThanOrEqual(HELI_PHYSICS.MAX_BANK);
	});

	test('climb up increases height', () => {
		const cam = createCameraState();
		const startHeight = cam.height;
		updateHelicopterPhysics(cam, { ...noInput, climbUp: true }, defaultConfig, 1, flatTerrain);
		expect(cam.height).toBeGreaterThan(startHeight);
	});

	test('terrain collision prevents going below terrain', () => {
		const cam = createCameraState();
		cam.height = 5;
		cam.verticalSpeed = -10;
		updateHelicopterPhysics(cam, noInput, defaultConfig, 1, () => 50);
		expect(cam.height).toBeGreaterThanOrEqual(50 + defaultConfig.collisionMargin);
		expect(cam.verticalSpeed).toBeGreaterThanOrEqual(0);
	});

	test('position wraps within map bounds', () => {
		const cam = createCameraState();
		cam.x = 1025;
		cam.y = -5;
		updateHelicopterPhysics(cam, noInput, defaultConfig, 1, flatTerrain);
		expect(cam.x).toBeGreaterThanOrEqual(0);
		expect(cam.x).toBeLessThan(1024);
		expect(cam.y).toBeGreaterThanOrEqual(0);
		expect(cam.y).toBeLessThan(1024);
	});

	test('boost multiplies speed limit', () => {
		const cam = createCameraState();
		for (let i = 0; i < 100; i++) {
			updateHelicopterPhysics(cam, { ...noInput, forward: true, boost: true }, defaultConfig, 1, flatTerrain);
		}
		expect(cam.forwardSpeed).toBeGreaterThan(HELI_PHYSICS.MAX_FORWARD_SPEED);
	});

	test('yaw left increases angle', () => {
		const cam = createCameraState();
		const startAngle = cam.angle;
		updateHelicopterPhysics(cam, { ...noInput, yawLeft: true }, defaultConfig, 1, flatTerrain);
		expect(cam.angle).toBeGreaterThan(startAngle);
	});
});

describe('updateSimplePhysics', () => {
	test('forward sets speed directly', () => {
		const cam = createCameraState();
		updateSimplePhysics(cam, { ...noInput, forward: true }, defaultConfig, 1, flatTerrain);
		expect(cam.forwardSpeed).toBe(defaultConfig.moveSpeed);
	});

	test('no input stops movement', () => {
		const cam = createCameraState();
		cam.forwardSpeed = 0.5;
		updateSimplePhysics(cam, noInput, defaultConfig, 1, flatTerrain);
		expect(cam.forwardSpeed).toBe(0);
	});

	test('bank is always zero in simple mode', () => {
		const cam = createCameraState();
		cam.bank = 0.5;
		updateSimplePhysics(cam, { ...noInput, bankLeft: true }, defaultConfig, 1, flatTerrain);
		expect(cam.bank).toBe(0);
	});
});

describe('HeliState', () => {
	test('creates with default values', () => {
		const heli = createHeliState();
		expect(heli.health).toBe(200);
		expect(heli.maxHealth).toBe(200);
		expect(heli.destroyed).toBe(false);
	});

	test('isHeliLanded detects ground contact', () => {
		const heli = createHeliState();
		heli.z = 5;
		heli.forwardSpeed = 0;
		expect(isHeliLanded(heli, () => 0)).toBe(true);
	});

	test('isHeliLanded returns false when flying', () => {
		const heli = createHeliState();
		heli.z = 100;
		expect(isHeliLanded(heli, () => 0)).toBe(false);
	});

	test('isHeliLanded returns false when moving fast', () => {
		const heli = createHeliState();
		heli.z = 5;
		heli.forwardSpeed = 0.2;
		expect(isHeliLanded(heli, () => 0)).toBe(false);
	});
});

describe('SoldierState', () => {
	test('creates with default values', () => {
		const soldier = createSoldierState();
		expect(soldier.health).toBe(100);
		expect(soldier.stance).toBe('stand');
	});
});
