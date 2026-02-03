/**
 * Mission File Validation Tests
 * Validates all mission JSON files in src/web/public/missions/
 */

import { describe, expect, test } from 'bun:test';
import { validateMission } from '../src/lib/game-utils';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const MISSIONS_DIR = join(import.meta.dir, '../src/web/public/missions');

describe('Mission Files', () => {
	test('missions directory exists', async () => {
		const files = await readdir(MISSIONS_DIR);
		expect(files.length).toBeGreaterThan(0);
	});

	test('all mission files are valid JSON', async () => {
		const files = await readdir(MISSIONS_DIR);
		const jsonFiles = files.filter((f) => f.endsWith('.json'));

		for (const file of jsonFiles) {
			const content = await readFile(join(MISSIONS_DIR, file), 'utf-8');
			expect(() => JSON.parse(content)).not.toThrow();
		}
	});

	test('all mission files pass validation', async () => {
		const files = await readdir(MISSIONS_DIR);
		const jsonFiles = files.filter((f) => f.endsWith('.json'));

		for (const file of jsonFiles) {
			const content = await readFile(join(MISSIONS_DIR, file), 'utf-8');
			const mission = JSON.parse(content);
			const result = validateMission(mission);

			if (!result.valid) {
				console.error(`${file} validation errors:`, result.errors);
			}

			expect(result.valid).toBe(true);
		}
	});

	test('mission IDs are unique', async () => {
		const files = await readdir(MISSIONS_DIR);
		const jsonFiles = files.filter((f) => f.endsWith('.json'));
		const ids = new Set<number>();

		for (const file of jsonFiles) {
			const content = await readFile(join(MISSIONS_DIR, file), 'utf-8');
			const mission = JSON.parse(content);

			if (ids.has(mission.missionId)) {
				throw new Error(`Duplicate missionId ${mission.missionId} in ${file}`);
			}
			ids.add(mission.missionId);
		}

		expect(ids.size).toBe(jsonFiles.length);
	});

	test('all missions have valid map indices', async () => {
		const files = await readdir(MISSIONS_DIR);
		const jsonFiles = files.filter((f) => f.endsWith('.json'));

		for (const file of jsonFiles) {
			const content = await readFile(join(MISSIONS_DIR, file), 'utf-8');
			const mission = JSON.parse(content);

			expect(mission.mapIndex).toBeGreaterThanOrEqual(1);
			expect(mission.mapIndex).toBeLessThanOrEqual(29); // Maps 1-29 available
		}
	});

	test('all missions have valid player start positions', async () => {
		const files = await readdir(MISSIONS_DIR);
		const jsonFiles = files.filter((f) => f.endsWith('.json'));

		for (const file of jsonFiles) {
			const content = await readFile(join(MISSIONS_DIR, file), 'utf-8');
			const mission = JSON.parse(content);

			expect(mission.playerStart).toBeDefined();
			expect(typeof mission.playerStart.x).toBe('number');
			expect(typeof mission.playerStart.y).toBe('number');
			// Map bounds are 0-1024
			expect(mission.playerStart.x).toBeGreaterThanOrEqual(0);
			expect(mission.playerStart.x).toBeLessThanOrEqual(1024);
			expect(mission.playerStart.y).toBeGreaterThanOrEqual(0);
			expect(mission.playerStart.y).toBeLessThanOrEqual(1024);
		}
	});
});
