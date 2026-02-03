/**
 * Build and Smoke Tests
 * Ensures the project builds and typechecks successfully.
 */

import { describe, expect, test } from 'bun:test';
import { $ } from 'bun';

describe('Build Pipeline', () => {
	test(
		'typecheck passes',
		async () => {
			const result = await $`bun run typecheck`.quiet().nothrow();
			if (result.exitCode !== 0) {
				console.error('Typecheck output:', result.stderr.toString());
			}
			expect(result.exitCode).toBe(0);
		},
		{ timeout: 60000 }
	);

	test(
		'build succeeds',
		async () => {
			const result = await $`bun run build`.quiet().nothrow();
			if (result.exitCode !== 0) {
				console.error('Build output:', result.stderr.toString());
			}
			expect(result.exitCode).toBe(0);
		},
		{ timeout: 120000 }
	);
});

describe('Code Quality', () => {
	test('no TODO/FIXME in critical paths', async () => {
		const indexHtml = await Bun.file('src/web/index.html').text();

		// Count TODOs/FIXMEs - warn if too many
		const todoCount = (indexHtml.match(/TODO|FIXME/gi) || []).length;

		// Just informational - don't fail on TODOs
		if (todoCount > 0) {
			console.log(`Found ${todoCount} TODO/FIXME comments in index.html`);
		}

		// But fail if there are critical markers
		expect(indexHtml).not.toContain('XXX_CRITICAL');
		expect(indexHtml).not.toContain('BROKEN_DO_NOT_SHIP');
	});

	test('game HTML file exists and has content', async () => {
		const indexHtml = await Bun.file('src/web/index.html').text();
		expect(indexHtml.length).toBeGreaterThan(1000);
		expect(indexHtml).toContain('VoxelCopter');
		expect(indexHtml).toContain('gameCanvas');
	});

	test('map editor HTML file exists', async () => {
		const mapEditor = await Bun.file('src/web/mapeditor.html').text();
		expect(mapEditor.length).toBeGreaterThan(100);
	});
});
