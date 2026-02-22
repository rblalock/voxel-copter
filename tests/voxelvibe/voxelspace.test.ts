/**
 * VoxelVibe Engine - Voxelspace Renderer Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	applyAmbient,
	blendWithFog,
	getTerrainHeight,
	renderTerrain,
	type VoxelCamera,
	type VoxelMap,
} from '../../src/voxelvibe/render/voxelspace';
import { WEATHER_PRESETS } from '../../src/voxelvibe/systems/weather';

function createTestMap(size: number): VoxelMap {
	const total = size * size;
	const altitude = new Uint8Array(total);
	const color = new Uint32Array(total);
	// Flat terrain at height 50, green color
	altitude.fill(50);
	color.fill(0xff00ff00 >>> 0); // ABGR green
	return { altitude, color, shift: Math.log2(size), size };
}

describe('applyAmbient', () => {
	test('full ambient returns same color', () => {
		const color = 0xff804020 >>> 0; // ABGR, unsigned
		expect(applyAmbient(color, 1.0)).toBe(color);
	});

	test('zero ambient makes RGB black', () => {
		const color = 0xffff8040 >>> 0;
		const result = applyAmbient(color, 0);
		// Alpha preserved, RGB zeroed
		expect((result >>> 24) & 0xff).toBe(0xff);
		expect(result & 0xff).toBe(0);
		expect((result >>> 8) & 0xff).toBe(0);
		expect((result >>> 16) & 0xff).toBe(0);
	});

	test('half ambient halves RGB', () => {
		const color = 0xff006400 >>> 0; // ABGR: A=255, B=0, G=100, R=0
		const result = applyAmbient(color, 0.5);
		const g = (result >>> 8) & 0xff;
		expect(g).toBe(50);
	});
});

describe('blendWithFog', () => {
	test('zero fog returns terrain color', () => {
		const terrain = 0xff804020 >>> 0;
		const sky = 0xff8090e0 >>> 0;
		const result = blendWithFog(terrain, 0, sky);
		expect(result & 0xff).toBe(terrain & 0xff);
	});

	test('full fog returns sky color', () => {
		const terrain = 0xff804020 >>> 0;
		const sky = 0xff8090e0 >>> 0;
		const result = blendWithFog(terrain, 1.0, sky);
		expect(result & 0xff).toBe(sky & 0xff);
		expect((result >>> 8) & 0xff).toBe((sky >>> 8) & 0xff);
	});
});

describe('getTerrainHeight', () => {
	test('returns height at position', () => {
		const map = createTestMap(1024);
		expect(getTerrainHeight(map, 512, 512)).toBe(50);
	});

	test('wraps out-of-bounds positions', () => {
		const map = createTestMap(1024);
		expect(getTerrainHeight(map, 1025, 1025)).toBe(50);
		expect(getTerrainHeight(map, -1, -1)).toBe(50);
	});

	test('returns 0 for null altitude', () => {
		const map: VoxelMap = { altitude: null, color: null, shift: 10, size: 1024 };
		expect(getTerrainHeight(map, 100, 100)).toBe(0);
	});
});

describe('renderTerrain', () => {
	test('fills buffer with sky color on empty map', () => {
		const width = 32;
		const height = 16;
		const buf32 = new Uint32Array(width * height);
		const map: VoxelMap = { altitude: null, color: null, shift: 10, size: 1024 };
		const cam: VoxelCamera = { x: 512, y: 512, height: 150, angle: 0, horizon: 8, distance: 100, bank: 0 };
		const hiddenY = new Int32Array(width);
		const skyColor = WEATHER_PRESETS.clear.skyColor >>> 0;

		renderTerrain(buf32, map, cam, WEATHER_PRESETS.clear, { screenWidth: width, screenHeight: height, fogEnabled: true }, hiddenY);

		for (let i = 0; i < buf32.length; i++) {
			expect(buf32[i]).toBe(skyColor);
		}
	});

	test('renders terrain pixels on valid map', () => {
		const width = 128;
		const height = 128;
		const buf32 = new Uint32Array(width * height);
		const map = createTestMap(1024);
		// Camera just above terrain (height 60, terrain at 50), horizon at middle of screen
		const cam: VoxelCamera = { x: 512, y: 512, height: 60, angle: 0, horizon: 64, distance: 200, bank: 0 };
		const hiddenY = new Int32Array(width);
		const skyColor = WEATHER_PRESETS.clear.skyColor >>> 0;

		renderTerrain(buf32, map, cam, WEATHER_PRESETS.clear, { screenWidth: width, screenHeight: height, fogEnabled: false }, hiddenY);

		let nonSkyPixels = 0;
		for (let i = 0; i < buf32.length; i++) {
			if (buf32[i] !== skyColor) nonSkyPixels++;
		}
		expect(nonSkyPixels).toBeGreaterThan(0);
	});

	test('hiddenYBuffer is updated', () => {
		const width = 128;
		const height = 128;
		const buf32 = new Uint32Array(width * height);
		const map = createTestMap(1024);
		const cam: VoxelCamera = { x: 512, y: 512, height: 60, angle: 0, horizon: 64, distance: 200, bank: 0 };
		const hiddenY = new Int32Array(width);

		renderTerrain(buf32, map, cam, WEATHER_PRESETS.clear, { screenWidth: width, screenHeight: height, fogEnabled: true }, hiddenY);

		let drawnColumns = 0;
		for (let i = 0; i < width; i++) {
			if (hiddenY[i] < height) drawnColumns++;
		}
		expect(drawnColumns).toBeGreaterThan(0);
	});
});
