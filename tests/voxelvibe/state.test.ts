/**
 * VoxelVibe Engine - Game State Tests
 */
import { describe, expect, test } from 'bun:test';
import {
	GAME_STATES,
	GAME_MODES,
	isMenuState,
	createTransitionState,
	startTransition,
	createDefaultSettings,
	createDefaultProfile,
	createSessionStats,
	createTelemetry,
	MAIN_MENU_OPTIONS,
	PAUSE_OPTIONS,
} from '../../src/voxelvibe/game/state';

describe('GAME_STATES', () => {
	test('has all expected states', () => {
		expect(GAME_STATES.TITLE).toBe('title');
		expect(GAME_STATES.PLAYING).toBe('playing');
		expect(GAME_STATES.PAUSED).toBe('paused');
		expect(GAME_STATES.VICTORY).toBe('victory');
		expect(GAME_STATES.DEFEAT).toBe('defeat');
	});
});

describe('GAME_MODES', () => {
	test('has comanche and delta', () => {
		expect(GAME_MODES.COMANCHE).toBe('comanche');
		expect(GAME_MODES.DELTA).toBe('delta');
	});
});

describe('isMenuState', () => {
	test('returns true for menu states', () => {
		expect(isMenuState('title')).toBe(true);
		expect(isMenuState('menu')).toBe(true);
		expect(isMenuState('campaign')).toBe(true);
		expect(isMenuState('settings')).toBe(true);
		expect(isMenuState('victory')).toBe(true);
	});

	test('returns false for playing and paused', () => {
		expect(isMenuState('playing')).toBe(false);
		expect(isMenuState('paused')).toBe(false);
	});
});

describe('transition', () => {
	test('creates inactive transition', () => {
		const t = createTransitionState();
		expect(t.active).toBe(false);
		expect(t.progress).toBe(0);
	});

	test('starts transition', () => {
		const t = createTransitionState();
		startTransition(t, 'playing', 500);
		expect(t.active).toBe(true);
		expect(t.targetState).toBe('playing');
		expect(t.duration).toBe(500);
		expect(t.phase).toBe('fadeOut');
	});
});

describe('settings', () => {
	test('creates with defaults', () => {
		const settings = createDefaultSettings();
		expect(settings.masterVolume).toBe(0.5);
		expect(settings.sfxVolume).toBe(0.7);
		expect(settings.drawDistance).toBe(1200);
		expect(settings.fogEnabled).toBe(true);
		expect(settings.defaultMode).toBe('comanche');
	});
});

describe('profile', () => {
	test('creates with defaults', () => {
		const profile = createDefaultProfile();
		expect(profile.version).toBe(1);
		expect(profile.highScore).toBe(0);
		expect(profile.stats.totalKills).toBe(0);
		expect(profile.achievements).toHaveLength(0);
	});
});

describe('session stats', () => {
	test('creates with zeros', () => {
		const stats = createSessionStats();
		expect(stats.kills).toBe(0);
		expect(stats.submitted).toBe(false);
	});
});

describe('telemetry', () => {
	test('creates with position', () => {
		const t = createTelemetry(100, 200);
		expect(t.lastPosition.x).toBe(100);
		expect(t.lastPosition.y).toBe(200);
		expect(t.distanceTraveled).toBe(0);
	});
});

describe('menu constants', () => {
	test('main menu has expected options', () => {
		expect(MAIN_MENU_OPTIONS.length).toBeGreaterThan(5);
		expect(MAIN_MENU_OPTIONS).toContain('CAMPAIGN');
		expect(MAIN_MENU_OPTIONS).toContain('SETTINGS');
	});

	test('pause menu has expected options', () => {
		expect(PAUSE_OPTIONS).toContain('RESUME [ESC]');
		expect(PAUSE_OPTIONS).toContain('QUIT TO MENU');
	});
});
