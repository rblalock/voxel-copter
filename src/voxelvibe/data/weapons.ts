/**
 * VoxelVibe Engine - Weapon Definitions
 * Static weapon data for helicopter (Comanche) and soldier (Delta) modes.
 */

export interface WeaponDef {
	name: string;
	key: string;
	ammo: number;
	maxAmmo: number;
	fireRate: number;
	damage: number;
	projectileSpeed: number;
	projectileType: string;
	color: string;
	spread: number;
	description: string;
	guided?: boolean;
	airToAir?: boolean;
}

export interface SoldierWeaponDef {
	name: string;
	damage: number;
	fireRate: number;
	spread: number;
	magSize: number;
	maxMags: number;
	projectileSpeed: number;
	color: string;
	auto: boolean;
	key: string;
	guided?: boolean;
	airToAir?: boolean;
	projectileType?: string;
	explosive?: boolean;
	blastRadius?: number;
	type?: string;
}

/** Helicopter (Comanche) weapon definitions */
export const WEAPONS: Record<string, WeaponDef> = {
	cannon: {
		name: 'CANNON',
		key: '1',
		ammo: Infinity,
		maxAmmo: Infinity,
		fireRate: 100,
		damage: 25,
		projectileSpeed: 20,
		projectileType: 'bullet',
		color: '#ffff00',
		spread: 0.02,
		description: 'Rapid-fire cannon',
	},
	rockets: {
		name: 'ROCKETS',
		key: '2',
		ammo: 20,
		maxAmmo: 20,
		fireRate: 500,
		damage: 75,
		projectileSpeed: 15,
		projectileType: 'rocket',
		color: '#ff6600',
		spread: 0.01,
		description: 'Unguided rockets',
	},
	hellfire: {
		name: 'HELLFIRE',
		key: '3',
		ammo: 8,
		maxAmmo: 8,
		fireRate: 1000,
		damage: 200,
		projectileSpeed: 12,
		projectileType: 'missile',
		color: '#ff0000',
		spread: 0,
		guided: true,
		description: 'Laser-guided missile',
	},
	stinger: {
		name: 'STINGER',
		key: '4',
		ammo: 4,
		maxAmmo: 4,
		fireRate: 1500,
		damage: 150,
		projectileSpeed: 25,
		projectileType: 'missile',
		color: '#00ffff',
		spread: 0,
		guided: true,
		airToAir: true,
		description: 'Heat-seeking missile',
	},
};

/** Soldier (Delta) weapon definitions */
export const WEAPONS_DELTA: Record<string, SoldierWeaponDef> = {
	m4: {
		name: 'M4 Carbine',
		damage: 25,
		fireRate: 100,
		spread: 0.02,
		magSize: 30,
		maxMags: 5,
		projectileSpeed: 20,
		color: '#ffaa00',
		auto: true,
		key: 'Digit1',
	},
	sniper: {
		name: 'M24 Sniper',
		damage: 100,
		fireRate: 1200,
		spread: 0.002,
		magSize: 5,
		maxMags: 4,
		projectileSpeed: 30,
		color: '#ff4400',
		auto: false,
		key: 'Digit2',
	},
	pistol: {
		name: 'M9 Pistol',
		damage: 20,
		fireRate: 200,
		spread: 0.03,
		magSize: 15,
		maxMags: 3,
		projectileSpeed: 15,
		color: '#ffff00',
		auto: false,
		key: 'Digit3',
	},
	javelin: {
		name: 'Javelin',
		damage: 240,
		fireRate: 1800,
		spread: 0.005,
		magSize: 1,
		maxMags: 3,
		projectileSpeed: 10,
		color: '#ff8800',
		auto: false,
		guided: true,
		projectileType: 'missile',
		key: 'Digit4',
	},
	stinger: {
		name: 'Stinger',
		damage: 180,
		fireRate: 1500,
		spread: 0.003,
		magSize: 1,
		maxMags: 4,
		projectileSpeed: 18,
		color: '#00ccff',
		auto: false,
		guided: true,
		airToAir: true,
		projectileType: 'missile',
		key: 'Digit5',
	},
	c4: {
		name: 'C4 Explosive',
		damage: 400,
		fireRate: 500,
		spread: 0,
		magSize: 1,
		maxMags: 3,
		projectileSpeed: 0,
		color: '#ff4400',
		auto: false,
		explosive: true,
		blastRadius: 60,
		key: 'Digit6',
	},
	airstrike: {
		name: 'Airstrike',
		damage: 0,
		fireRate: 0,
		spread: 0,
		magSize: 1,
		maxMags: 2,
		projectileSpeed: 0,
		color: '#66ccff',
		auto: false,
		type: 'support',
		key: 'Digit7',
	},
};

/** Default weapon cycling order for helicopter mode */
export const WEAPON_ORDER = ['cannon', 'rockets', 'hellfire', 'stinger'] as const;

/** Default weapon cycling order for soldier mode */
export const SOLDIER_WEAPON_ORDER = ['m4', 'sniper', 'pistol', 'javelin', 'stinger', 'c4', 'airstrike'] as const;

export type DamageCategory = 'soldier' | 'tank' | 'building' | 'sam' | 'aircraft';

/** Damage multipliers: weaponType -> targetCategory -> multiplier */
export const DAMAGE_MULTIPLIERS: Record<string, Record<DamageCategory, number>> = {
	pistol:    { soldier: 1.0, tank: 0.02, building: 0.02, sam: 0.05, aircraft: 0.08 },
	m4:        { soldier: 1.0, tank: 0.03, building: 0.03, sam: 0.08, aircraft: 0.12 },
	sniper:    { soldier: 1.5, tank: 0.06, building: 0.05, sam: 0.12, aircraft: 0.18 },
	cannon:    { soldier: 1.0, tank: 0.5,  building: 0.3,  sam: 0.8,  aircraft: 1.0 },
	rockets:   { soldier: 2.0, tank: 1.0,  building: 0.8,  sam: 1.0,  aircraft: 1.5 },
	hellfire:  { soldier: 3.0, tank: 1.5,  building: 1.0,  sam: 1.2,  aircraft: 2.0 },
	stinger:   { soldier: 1.0, tank: 0.1,  building: 0.05, sam: 0.3,  aircraft: 2.0 },
	javelin:   { soldier: 0.6, tank: 2.5,  building: 0.6,  sam: 1.2,  aircraft: 0.4 },
	c4:        { soldier: 3.0, tank: 2.0,  building: 2.5,  sam: 2.0,  aircraft: 0.5 },
	airstrike: { soldier: 1.6, tank: 1.4,  building: 1.3,  sam: 1.3,  aircraft: 0.4 },
};

/** Returns the damage multiplier for a weapon against a damage category. */
export function getDamageMultiplier(weaponType: string, category: DamageCategory): number {
	return DAMAGE_MULTIPLIERS[weaponType]?.[category] ?? 1.0;
}

/** Default countermeasure loadout */
export const DEFAULT_COUNTERMEASURES = {
	chaff: { count: 10, cooldown: 2000 },
	flare: { count: 10, cooldown: 2000 },
} as const;
