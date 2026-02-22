/**
 * VoxelVibe Engine - Weather System
 * Weather conditions, sky colors, fog settings, and rain/lightning effects.
 */

export type WeatherCondition = 'clear' | 'dusk' | 'night' | 'fog' | 'storm';

export interface WeatherSettings {
	skyColor: number;
	fogStart: number;
	fogDensity: number;
	ambient: number;
	name: string;
	hasRain?: boolean;
	rainIntensity?: number;
}

/** Weather presets */
export const WEATHER_PRESETS: Record<WeatherCondition, WeatherSettings> = {
	clear: {
		skyColor: 0xff8090e0,
		fogStart: 400,
		fogDensity: 1.0,
		ambient: 1.0,
		name: 'CLEAR',
	},
	dusk: {
		skyColor: 0xff4040a0,
		fogStart: 300,
		fogDensity: 1.2,
		ambient: 0.7,
		name: 'DUSK',
	},
	night: {
		skyColor: 0xff101018,
		fogStart: 150,
		fogDensity: 2.0,
		ambient: 0.15,
		name: 'NIGHT',
	},
	fog: {
		skyColor: 0xff909090,
		fogStart: 80,
		fogDensity: 3.0,
		ambient: 0.5,
		name: 'FOG',
	},
	storm: {
		skyColor: 0xff303040,
		fogStart: 100,
		fogDensity: 2.5,
		ambient: 0.3,
		name: 'STORM',
		hasRain: true,
		rainIntensity: 1.0,
	},
};

/** All available weather conditions in cycle order */
export const WEATHER_CYCLE: WeatherCondition[] = ['clear', 'dusk', 'night', 'fog', 'storm'];

/** Returns the next weather condition in the cycle. */
export function nextWeatherCondition(current: WeatherCondition): WeatherCondition {
	const idx = WEATHER_CYCLE.indexOf(current);
	return WEATHER_CYCLE[(idx + 1) % WEATHER_CYCLE.length];
}

export interface RainDrop {
	x: number;
	y: number;
	length: number;
	speed: number;
	opacity: number;
}

/** Creates an array of rain particles for screen-space rendering. */
export function createRainParticles(count: number, screenWidth: number, screenHeight: number): RainDrop[] {
	const drops: RainDrop[] = [];
	for (let i = 0; i < count; i++) {
		drops.push({
			x: Math.random() * screenWidth,
			y: Math.random() * screenHeight,
			length: 10 + Math.random() * 20,
			speed: 15 + Math.random() * 10,
			opacity: 0.3 + Math.random() * 0.4,
		});
	}
	return drops;
}

/** Updates rain particle positions. Returns updated lightning flash value. */
export function updateRain(
	drops: RainDrop[],
	weather: WeatherSettings,
	screenWidth: number,
	screenHeight: number,
	now: number,
): void {
	if (!weather.hasRain) return;

	const intensity = weather.rainIntensity || 1.0;
	const windOffset = Math.sin(now / 2000) * 2;

	for (const drop of drops) {
		drop.y += drop.speed * intensity;
		drop.x += windOffset;

		if (drop.y > screenHeight) {
			drop.y = -drop.length;
			drop.x = Math.random() * screenWidth;
		}
		if (drop.x > screenWidth) drop.x = 0;
		if (drop.x < 0) drop.x = screenWidth;
	}
}

/** Lightning state for storm weather. */
export interface LightningState {
	flash: number;
	nextTime: number;
}

/** Creates initial lightning state. */
export function createLightningState(): LightningState {
	return { flash: 0, nextTime: 0 };
}

/** Updates lightning flash and triggers new strikes during storms. */
export function updateLightning(
	state: LightningState,
	condition: WeatherCondition,
	deltaTime: number,
	now: number,
): void {
	if (state.flash > 0) {
		state.flash -= deltaTime * 0.005;
		if (state.flash < 0) state.flash = 0;
	}

	if (condition === 'storm' && now > state.nextTime) {
		if (Math.random() < 0.2) {
			state.flash = 0.8 + Math.random() * 0.2;
		}
		state.nextTime = now + 3000 + Math.random() * 7000;
	}
}

/** Max rain particles constant */
export const MAX_RAIN_PARTICLES = 300;
