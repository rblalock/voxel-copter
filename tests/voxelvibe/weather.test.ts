/**
 * VoxelVibe Engine - Weather System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	WEATHER_PRESETS,
	WEATHER_CYCLE,
	nextWeatherCondition,
	createRainParticles,
	updateRain,
	createLightningState,
	updateLightning,
	MAX_RAIN_PARTICLES,
} from '../../src/voxelvibe/systems/weather';

describe('WEATHER_PRESETS', () => {
	test('has all five weather conditions', () => {
		expect(Object.keys(WEATHER_PRESETS)).toEqual(['clear', 'dusk', 'night', 'fog', 'storm']);
	});

	test('all presets have required fields', () => {
		for (const [, preset] of Object.entries(WEATHER_PRESETS)) {
			expect(typeof preset.skyColor).toBe('number');
			expect(typeof preset.fogStart).toBe('number');
			expect(typeof preset.fogDensity).toBe('number');
			expect(typeof preset.ambient).toBe('number');
			expect(typeof preset.name).toBe('string');
		}
	});

	test('only storm has rain', () => {
		expect(WEATHER_PRESETS.storm.hasRain).toBe(true);
		expect(WEATHER_PRESETS.clear.hasRain).toBeUndefined();
		expect(WEATHER_PRESETS.night.hasRain).toBeUndefined();
	});

	test('ambient ranges from 0 to 1', () => {
		for (const preset of Object.values(WEATHER_PRESETS)) {
			expect(preset.ambient).toBeGreaterThan(0);
			expect(preset.ambient).toBeLessThanOrEqual(1);
		}
	});
});

describe('nextWeatherCondition', () => {
	test('cycles through all conditions', () => {
		expect(nextWeatherCondition('clear')).toBe('dusk');
		expect(nextWeatherCondition('dusk')).toBe('night');
		expect(nextWeatherCondition('night')).toBe('fog');
		expect(nextWeatherCondition('fog')).toBe('storm');
		expect(nextWeatherCondition('storm')).toBe('clear');
	});
});

describe('createRainParticles', () => {
	test('creates the requested number of particles', () => {
		const drops = createRainParticles(100, 800, 600);
		expect(drops).toHaveLength(100);
	});

	test('particles are within screen bounds', () => {
		const drops = createRainParticles(50, 800, 600);
		for (const drop of drops) {
			expect(drop.x).toBeGreaterThanOrEqual(0);
			expect(drop.x).toBeLessThanOrEqual(800);
			expect(drop.y).toBeGreaterThanOrEqual(0);
			expect(drop.y).toBeLessThanOrEqual(600);
			expect(drop.speed).toBeGreaterThan(0);
			expect(drop.opacity).toBeGreaterThan(0);
		}
	});
});

describe('updateRain', () => {
	test('does nothing for non-rain weather', () => {
		const drops = createRainParticles(5, 800, 600);
		const origY = drops.map(d => d.y);
		updateRain(drops, WEATHER_PRESETS.clear, 800, 600, 1000);
		expect(drops.map(d => d.y)).toEqual(origY);
	});

	test('moves drops downward for storm weather', () => {
		const drops = createRainParticles(5, 800, 600);
		const origY = drops.map(d => d.y);
		updateRain(drops, WEATHER_PRESETS.storm, 800, 600, 1000);
		for (let i = 0; i < drops.length; i++) {
			// Either moved down or wrapped around
			expect(drops[i].y !== origY[i] || drops[i].y < 0).toBe(true);
		}
	});
});

describe('lightning', () => {
	test('creates initial state', () => {
		const state = createLightningState();
		expect(state.flash).toBe(0);
		expect(state.nextTime).toBe(0);
	});

	test('decays flash over time', () => {
		const state = createLightningState();
		state.flash = 1.0;
		updateLightning(state, 'clear', 100, 0);
		expect(state.flash).toBeLessThan(1.0);
	});
});

describe('MAX_RAIN_PARTICLES', () => {
	test('is 300', () => {
		expect(MAX_RAIN_PARTICLES).toBe(300);
	});
});
