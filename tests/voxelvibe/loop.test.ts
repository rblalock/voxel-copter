/**
 * VoxelVibe Engine - Game Loop Tests
 */
import { describe, expect, test } from 'bun:test';
import { createFrameState, computeDeltaTime } from '../../src/voxelvibe/game/loop';

describe('createFrameState', () => {
	test('creates with zero values', () => {
		const frame = createFrameState();
		expect(frame.lastTime).toBe(0);
		expect(frame.fps).toBe(0);
		expect(frame.frameCount).toBe(0);
	});
});

describe('computeDeltaTime', () => {
	test('returns clamped delta time', () => {
		const frame = createFrameState();
		frame.lastTime = 1000;
		const dt = computeDeltaTime(frame, 1016);
		expect(dt).toBe(16);
	});

	test('clamps to max 50ms', () => {
		const frame = createFrameState();
		frame.lastTime = 1000;
		const dt = computeDeltaTime(frame, 1200);
		expect(dt).toBe(50);
	});

	test('clamps to min 0ms', () => {
		const frame = createFrameState();
		frame.lastTime = 1000;
		const dt = computeDeltaTime(frame, 990);
		expect(dt).toBe(0);
	});

	test('updates lastTime', () => {
		const frame = createFrameState();
		computeDeltaTime(frame, 1000);
		expect(frame.lastTime).toBe(1000);
	});

	test('counts frames for FPS', () => {
		const frame = createFrameState();
		for (let i = 0; i < 60; i++) {
			computeDeltaTime(frame, i * 16.67);
		}
		expect(frame.frameCount).toBeGreaterThan(0);
	});

	test('updates FPS after 1 second', () => {
		const frame = createFrameState();
		frame.fpsUpdateTime = 0;
		// Simulate 60 frames over ~1 second
		for (let i = 0; i < 61; i++) {
			computeDeltaTime(frame, i * 16.67);
		}
		expect(frame.fps).toBeGreaterThan(0);
	});
});
