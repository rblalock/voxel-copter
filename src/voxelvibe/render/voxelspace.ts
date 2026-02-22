/**
 * VoxelVibe Engine - Voxelspace Terrain Renderer
 * Classic Comanche-style front-to-back scanline terrain raycaster.
 * Operates on altitude + color maps and writes to an ImageData pixel buffer.
 */

import type { WeatherSettings } from '../systems/weather';

/** Camera state needed for terrain rendering. */
export interface VoxelCamera {
	x: number;
	y: number;
	height: number;
	angle: number;
	horizon: number;
	distance: number;
	bank: number;
}

/** Map data needed for terrain rendering. */
export interface VoxelMap {
	altitude: Uint8Array | null;
	color: Uint32Array | null;
	shift: number;
	size: number;
}

/** Configuration for the terrain renderer. */
export interface VoxelRenderConfig {
	screenWidth: number;
	screenHeight: number;
	fogEnabled: boolean;
}

/**
 * Applies ambient lighting to a packed ABGR color.
 * Darkens RGB channels by the ambient factor (0-1).
 */
export function applyAmbient(color: number, ambient: number): number {
	const a = (color >>> 24) & 0xff;
	const b = (color >>> 16) & 0xff;
	const g = (color >>> 8) & 0xff;
	const r = color & 0xff;
	return (
		((a << 24) |
		(Math.floor(b * ambient) << 16) |
		(Math.floor(g * ambient) << 8) |
		Math.floor(r * ambient)) >>> 0
	);
}

/**
 * Blends a terrain color with the sky/fog color based on fog factor.
 * Both colors are in ABGR format.
 */
export function blendWithFog(terrainColor: number, fogFactor: number, skyColor: number): number {
	const invFog = 1 - fogFactor;

	const tR = terrainColor & 0xff;
	const tG = (terrainColor >> 8) & 0xff;
	const tB = (terrainColor >> 16) & 0xff;

	const sR = skyColor & 0xff;
	const sG = (skyColor >> 8) & 0xff;
	const sB = (skyColor >> 16) & 0xff;

	const r = Math.floor(tR * invFog + sR * fogFactor);
	const g = Math.floor(tG * invFog + sG * fogFactor);
	const b = Math.floor(tB * invFog + sB * fogFactor);

	return (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
}

/**
 * Samples terrain height at a world position with map wrapping.
 */
export function getTerrainHeight(map: VoxelMap, x: number, y: number): number {
	if (!map.altitude) return 0;
	const ix = Math.floor(x) & (map.size - 1);
	const iy = Math.floor(y) & (map.size - 1);
	return map.altitude[(iy << map.shift) + ix];
}

/**
 * Renders the voxelspace terrain into a pixel buffer.
 *
 * This is the core rendering algorithm:
 * - Casts rays from front to back across the viewing frustum
 * - Uses a Y-buffer for per-column occlusion culling
 * - Applies fog blending and ambient lighting based on weather
 * - Supports camera bank (roll) for tilted horizon
 */
export function renderTerrain(
	buf32: Uint32Array,
	map: VoxelMap,
	camera: VoxelCamera,
	weather: WeatherSettings,
	config: VoxelRenderConfig,
	hiddenYBuffer: Int32Array,
): void {
	const { screenWidth, screenHeight, fogEnabled } = config;

	// Fill with sky color
	buf32.fill(weather.skyColor >>> 0);

	if (!map.altitude || !map.color) return;

	// Reset Y-buffer
	hiddenYBuffer.fill(screenHeight);

	const sinAngle = Math.sin(camera.angle);
	const cosAngle = Math.cos(camera.angle);
	const bankTiltFactor = Math.sin(camera.bank) * 0.3;

	let dz = 1.0;

	for (let z = 1; z < camera.distance; z += dz) {
		// Viewing frustum edges at distance z
		const plx = -cosAngle * z - sinAngle * z;
		const ply = sinAngle * z - cosAngle * z;
		const prx = cosAngle * z - sinAngle * z;
		const pry = -sinAngle * z - cosAngle * z;

		const dx = (prx - plx) / screenWidth;
		const dy = (pry - ply) / screenWidth;

		let px = plx + camera.x;
		let py = ply + camera.y;

		const invz = (1.0 / z) * 240.0;

		// Fog calculation
		const fogStart = weather.fogStart;
		const fogEnd = Math.min(
			camera.distance,
			fogStart + (camera.distance - fogStart) / weather.fogDensity,
		);
		const fogFactor = fogEnabled
			? Math.min(1, Math.max(0, (z - fogStart) / (fogEnd - fogStart)))
			: 0;

		for (let i = 0; i < screenWidth; i++) {
			const mapX = Math.floor(px) & (map.size - 1);
			const mapY = Math.floor(py) & (map.size - 1);
			const mapOffset = (mapY << map.shift) + mapX;

			const terrainHeight = map.altitude[mapOffset];
			let terrainColor = map.color[mapOffset];

			if (weather.ambient < 1.0) {
				terrainColor = applyAmbient(terrainColor, weather.ambient);
			}

			const columnOffset = i - screenWidth / 2;
			const bankOffset = columnOffset * bankTiltFactor;
			const heightOnScreen = Math.floor(
				(camera.height - terrainHeight) * invz + camera.horizon + bankOffset,
			);

			if (heightOnScreen < hiddenYBuffer[i]) {
				if (fogFactor > 0) {
					terrainColor = blendWithFog(terrainColor, fogFactor, weather.skyColor);
				}

				// Draw vertical line from heightOnScreen to hiddenYBuffer[i]
				const yStart = Math.max(0, heightOnScreen);
				const yEnd = Math.min(screenHeight, hiddenYBuffer[i]);
				for (let y = yStart; y < yEnd; y++) {
					buf32[y * screenWidth + i] = terrainColor;
				}

				hiddenYBuffer[i] = heightOnScreen;
			}

			px += dx;
			py += dy;
		}

		// LOD: increase step size with distance
		dz += 0.005;
	}
}
