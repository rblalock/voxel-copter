/**
 * VoxelVibe Engine - Particle System Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	createParticlePool,
	spawnParticles,
	updateParticles,
	MAX_PARTICLES,
	PARTICLE_GRAVITY,
} from '../../src/voxelvibe/systems/particles';

const flatTerrain = () => 0;

describe('createParticlePool', () => {
	test('creates empty pool', () => {
		const pool = createParticlePool();
		expect(pool.particles).toHaveLength(0);
		expect(pool.pool).toHaveLength(0);
	});
});

describe('spawnParticles', () => {
	test('spawns requested count', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 100, 100, 50, 'spark', 5);
		expect(pool.particles).toHaveLength(5);
	});

	test('respects MAX_PARTICLES limit', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 0, 0, 0, 'smoke', MAX_PARTICLES + 50);
		expect(pool.particles).toHaveLength(MAX_PARTICLES);
	});

	test('does nothing for zero count', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 0, 0, 0, 'spark', 0);
		expect(pool.particles).toHaveLength(0);
	});

	test('spawns spark with correct properties', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 50, 60, 70, 'spark', 1);
		const p = pool.particles[0];
		expect(p.x).toBe(50);
		expect(p.y).toBe(60);
		expect(p.z).toBe(70);
		expect(p.type).toBe('spark');
		expect(p.life).toBeGreaterThan(0);
		expect(p.color).not.toBeNull();
	});

	test('spawns all particle types without error', () => {
		const types = ['spark', 'smoke', 'debris', 'dust', 'blood', 'trail_smoke', 'muzzle_flash'] as const;
		for (const type of types) {
			const pool = createParticlePool();
			spawnParticles(pool, 100, 100, 50, type, 3, { getTerrainHeight: flatTerrain });
			expect(pool.particles).toHaveLength(3);
			expect(pool.particles[0].type).toBe(type);
		}
	});

	test('smoke is smaller in delta mode', () => {
		const poolNormal = createParticlePool();
		const poolDelta = createParticlePool();
		// Spawn many to average out randomness
		spawnParticles(poolNormal, 0, 0, 0, 'smoke', 50, { isDelta: false });
		spawnParticles(poolDelta, 0, 0, 0, 'smoke', 50, { isDelta: true });
		const avgNormal = poolNormal.particles.reduce((s, p) => s + p.size, 0) / 50;
		const avgDelta = poolDelta.particles.reduce((s, p) => s + p.size, 0) / 50;
		expect(avgDelta).toBeLessThan(avgNormal);
	});
});

describe('updateParticles', () => {
	test('removes dead particles', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 0, 0, 50, 'spark', 5);
		// Set very short life
		for (const p of pool.particles) {
			p.life = 0.001;
		}
		updateParticles(pool, 100, 1024, flatTerrain);
		expect(pool.particles).toHaveLength(0);
	});

	test('recycles dead particles into pool', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 0, 0, 50, 'spark', 3);
		for (const p of pool.particles) {
			p.life = 0.001;
		}
		updateParticles(pool, 100, 1024, flatTerrain);
		// Dead particles should be in the recycle pool
		expect(pool.pool.length).toBe(3);
	});

	test('moves particles by velocity', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 500, 500, 50, 'debris', 1);
		const p = pool.particles[0];
		p.vx = 100;
		p.vy = 0;
		p.vz = 100;
		p.life = 10;
		const origX = p.x;
		updateParticles(pool, 100, 1024, flatTerrain);
		expect(p.x).toBeGreaterThan(origX);
	});

	test('wraps positions within map bounds', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 1020, 1020, 50, 'smoke', 1);
		const p = pool.particles[0];
		p.vx = 500;
		p.vy = 500;
		p.life = 10;
		updateParticles(pool, 100, 1024, flatTerrain);
		expect(p.x).toBeGreaterThanOrEqual(0);
		expect(p.x).toBeLessThan(1024);
		expect(p.y).toBeGreaterThanOrEqual(0);
		expect(p.y).toBeLessThan(1024);
	});

	test('applies gravity to sparks', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 500, 500, 100, 'spark', 1);
		const p = pool.particles[0];
		p.vz = 0;
		p.life = 10;
		updateParticles(pool, 100, 1024, flatTerrain);
		expect(p.vz).toBeLessThan(0);
	});

	test('debris stops at terrain', () => {
		const pool = createParticlePool();
		spawnParticles(pool, 500, 500, 5, 'debris', 1);
		const p = pool.particles[0];
		p.z = 0;
		p.vz = -100;
		p.life = 10;
		updateParticles(pool, 100, 1024, () => 10);
		expect(p.z).toBe(10);
		expect(p.vz).toBe(0);
	});
});

describe('constants', () => {
	test('MAX_PARTICLES is 200', () => {
		expect(MAX_PARTICLES).toBe(200);
	});

	test('PARTICLE_GRAVITY is 120', () => {
		expect(PARTICLE_GRAVITY).toBe(120);
	});
});
