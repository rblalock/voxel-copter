/**
 * VoxelVibe Engine - Particle System
 * Manages destruction particles, smoke, sparks, debris, blood, and trails.
 */

export type ParticleType =
	| 'spark'
	| 'smoke'
	| 'debris'
	| 'dust'
	| 'blood'
	| 'trail_smoke'
	| 'muzzle_flash';

export interface Particle {
	x: number;
	y: number;
	z: number;
	vx: number;
	vy: number;
	vz: number;
	type: ParticleType;
	life: number;
	maxLife: number;
	size: number;
	growth: number;
	color: { r: number; g: number; b: number } | null;
}

export const MAX_PARTICLES = 200;
export const PARTICLE_GRAVITY = 120;

export interface ParticlePool {
	particles: Particle[];
	pool: Particle[];
}

/** Creates a new particle system pool. */
export function createParticlePool(): ParticlePool {
	return { particles: [], pool: [] };
}

function getPooled(pool: ParticlePool): Particle {
	return (
		pool.pool.pop() || {
			x: 0, y: 0, z: 0,
			vx: 0, vy: 0, vz: 0,
			type: 'spark' as ParticleType,
			life: 0, maxLife: 0,
			size: 2, growth: 0, color: null,
		}
	);
}

function recycle(pool: ParticlePool, index: number): void {
	const p = pool.particles[index];
	pool.pool.push(p);
	pool.particles[index] = pool.particles[pool.particles.length - 1];
	pool.particles.pop();
}

/** Particle spawn configuration by type */
interface SpawnConfig {
	isDelta: boolean;
	getTerrainHeight: (x: number, y: number) => number;
}

/**
 * Spawns particles at a given position.
 * Uses object pooling to reduce GC pressure.
 */
export function spawnParticles(
	pool: ParticlePool,
	x: number,
	y: number,
	z: number,
	type: ParticleType,
	count: number,
	config?: Partial<SpawnConfig>,
): void {
	if (!count || count <= 0) return;

	for (let i = 0; i < count; i++) {
		if (pool.particles.length >= MAX_PARTICLES) return;

		const p = getPooled(pool);
		p.x = x;
		p.y = y;
		p.z = z;
		p.vx = 0;
		p.vy = 0;
		p.vz = 0;
		p.type = type;
		p.size = 2;
		p.growth = 0;
		p.color = null;

		const angle = Math.random() * Math.PI * 2;
		const isDelta = config?.isDelta ?? false;

		switch (type) {
			case 'spark': {
				const speed = 80 + Math.random() * 80;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed;
				p.vz = 40 + Math.random() * 40;
				p.life = 0.25 + Math.random() * 0.15;
				p.size = 1.5 + Math.random() * 1.5;
				p.color = { r: 255, g: 180 + Math.random() * 60, b: 60 };
				break;
			}
			case 'smoke': {
				const speed = isDelta ? 4 + Math.random() * 6 : 8 + Math.random() * 12;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed;
				p.vz = isDelta ? 6 + Math.random() * 8 : 12 + Math.random() * 18;
				p.life = isDelta ? 0.4 + Math.random() * 0.4 : 1.0 + Math.random() * 1.0;
				p.size = isDelta ? 2 + Math.random() * 2 : 6 + Math.random() * 6;
				p.growth = isDelta ? 4 + Math.random() * 4 : 12 + Math.random() * 14;
				const shade = 60 + Math.floor(Math.random() * 50);
				p.color = { r: shade, g: shade, b: shade };
				break;
			}
			case 'debris': {
				const speed = 30 + Math.random() * 40;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed;
				p.vz = 50 + Math.random() * 40;
				p.life = 0.8 + Math.random() * 0.5;
				p.size = 2 + Math.random() * 2.5;
				const shade = 70 + Math.floor(Math.random() * 40);
				p.color = { r: shade, g: shade * 0.9, b: shade * 0.8 };
				break;
			}
			case 'dust': {
				const terrainHeight = config?.getTerrainHeight?.(x, y) ?? 0;
				p.z = terrainHeight + 1;
				p.life = 0.35 + Math.random() * 0.25;
				p.size = 8 + Math.random() * 6;
				p.growth = 60 + Math.random() * 40;
				p.color = { r: 120, g: 110, b: 90 };
				break;
			}
			case 'blood': {
				const speed = 20 + Math.random() * 30;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed;
				p.vz = 30 + Math.random() * 40;
				p.life = 0.4 + Math.random() * 0.3;
				p.size = 2 + Math.random() * 3;
				p.color = {
					r: 120 + Math.floor(Math.random() * 40),
					g: 20 + Math.floor(Math.random() * 20),
					b: 20 + Math.floor(Math.random() * 20),
				};
				break;
			}
			case 'trail_smoke': {
				const speed = 2 + Math.random() * 3;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed;
				p.vz = Math.random() * 2;
				p.life = 0.25 + Math.random() * 0.15;
				p.size = 2 + Math.random() * 2;
				p.growth = 3 + Math.random() * 2;
				const shade = 80 + Math.floor(Math.random() * 40);
				p.color = { r: shade, g: shade, b: shade };
				break;
			}
			case 'muzzle_flash': {
				p.vx = 0;
				p.vy = 0;
				p.vz = 0;
				p.life = 0.06 + Math.random() * 0.03;
				p.size = 6 + Math.random() * 4;
				p.growth = 0;
				p.color = {
					r: 255,
					g: 220 + Math.floor(Math.random() * 35),
					b: 100 + Math.floor(Math.random() * 50),
				};
				break;
			}
		}

		p.maxLife = p.life;
		pool.particles.push(p);
	}
}

/**
 * Updates all particles: applies physics, wraps positions, removes dead particles.
 */
export function updateParticles(
	pool: ParticlePool,
	deltaTime: number,
	mapSize: number,
	getTerrainHeight: (x: number, y: number) => number,
): void {
	const dt = deltaTime * 0.001;
	if (dt <= 0) return;

	for (let i = pool.particles.length - 1; i >= 0; i--) {
		const p = pool.particles[i];
		p.life -= dt;
		if (p.life <= 0) {
			recycle(pool, i);
			continue;
		}

		if (p.type === 'dust') {
			p.size += p.growth * dt;
			p.z = getTerrainHeight(p.x, p.y) + 1;
		} else {
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.z += p.vz * dt;
		}

		// Wrap around map
		p.x = ((p.x % mapSize) + mapSize) % mapSize;
		p.y = ((p.y % mapSize) + mapSize) % mapSize;

		if (p.type === 'smoke' || p.type === 'trail_smoke') {
			p.size += p.growth * dt;
		}

		if (p.type === 'spark') {
			p.vz -= PARTICLE_GRAVITY * 0.35 * dt;
		}

		if (p.type === 'debris') {
			p.vz -= PARTICLE_GRAVITY * dt;
			const terrainH = getTerrainHeight(p.x, p.y);
			if (p.z <= terrainH) {
				p.z = terrainH;
				p.vx *= 0.4;
				p.vy *= 0.4;
				p.vz = 0;
			}
		}

		if (p.type === 'blood') {
			p.vz -= PARTICLE_GRAVITY * 0.8 * dt;
			const terrainH = getTerrainHeight(p.x, p.y);
			if (p.z <= terrainH) {
				p.z = terrainH;
				p.vx = 0;
				p.vy = 0;
				p.vz = 0;
			}
		}
	}
}
