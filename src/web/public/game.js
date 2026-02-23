(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

  // src/voxelvibe/index.ts
  var exports_voxelvibe = {};
  __export(exports_voxelvibe, {
    default: () => voxelvibe_default,
    Weather: () => exports_weather,
    Weapons: () => exports_weapons,
    Voxelspace: () => exports_voxelspace,
    VoxelVibe: () => VoxelVibe,
    Targets: () => exports_targets,
    Systems: () => Systems,
    State: () => exports_state,
    Sprites: () => exports_sprites,
    Render: () => Render,
    Radar: () => exports_radar,
    Physics: () => exports_physics,
    Particles: () => exports_particles,
    Missions: () => exports_missions,
    MathUtils: () => exports_math,
    Loop: () => exports_loop,
    Keyboard: () => exports_keyboard,
    Input: () => Input,
    HUD: () => exports_hud,
    Game: () => Game,
    Data: () => Data,
    Core: () => Core,
    Combat: () => exports_combat,
    Audio: () => exports_audio,
    AI: () => exports_ai
  });

  // src/voxelvibe/core/math.ts
  var exports_math = {};
  __export(exports_math, {
    wrapPosition: () => wrapPosition,
    normalizeAngleToRange: () => normalizeAngleToRange,
    normalizeAngle: () => normalizeAngle,
    lerp: () => lerp,
    isWaterAt: () => isWaterAt,
    findNearestTarget: () => findNearestTarget,
    estimateSlopeFromSamples: () => estimateSlopeFromSamples,
    distance3DWrapped: () => distance3DWrapped,
    distance3D: () => distance3D,
    distance2D: () => distance2D,
    clamp: () => clamp,
    angleDifference: () => angleDifference
  });
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function normalizeAngle(angle) {
    const TWO_PI = Math.PI * 2;
    return (angle % TWO_PI + TWO_PI) % TWO_PI;
  }
  function angleDifference(from, to) {
    const diff = normalizeAngle(to - from);
    return diff > Math.PI ? diff - Math.PI * 2 : diff;
  }
  function normalizeAngleToRange(angle) {
    let a = angle;
    while (a > Math.PI)
      a -= Math.PI * 2;
    while (a < -Math.PI)
      a += Math.PI * 2;
    return a;
  }
  function distance2D(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function distance3D(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function distance3DWrapped(x1, y1, z1, x2, y2, z2, mapSize) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    const half = mapSize / 2;
    if (dx > half)
      dx -= mapSize;
    if (dx < -half)
      dx += mapSize;
    if (dy > half)
      dy -= mapSize;
    if (dy < -half)
      dy += mapSize;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function wrapPosition(value, mapSize) {
    return (value % mapSize + mapSize) % mapSize;
  }
  function findNearestTarget(targets2, x, y, maxDist = Infinity, filterFn, mapSize = 0) {
    let nearest = null;
    let nearestDist = maxDist;
    const half = mapSize / 2;
    for (const target of targets2) {
      if (filterFn && !filterFn(target))
        continue;
      let dx = target.x - x;
      let dy = target.y - y;
      if (mapSize > 0) {
        if (dx > half)
          dx -= mapSize;
        if (dx < -half)
          dx += mapSize;
        if (dy > half)
          dy -= mapSize;
        if (dy < -half)
          dy += mapSize;
      }
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = target;
      }
    }
    return nearest;
  }
  function isWaterAt(r, g, b) {
    return b > 110 && b > g + 20 && b > r + 20;
  }
  function estimateSlopeFromSamples(samples) {
    if (samples.length <= 1)
      return 0;
    const centerHeight = samples[0] ?? 0;
    let maxDiff = 0;
    for (let i = 1;i < samples.length; i++) {
      const sample = samples[i];
      if (sample === undefined)
        continue;
      maxDiff = Math.max(maxDiff, Math.abs(sample - centerHeight));
    }
    return maxDiff;
  }

  // src/voxelvibe/core/constants.ts
  var CONFIG = {
    MAP_SIZE: 1024,
    MAP_SHIFT: 10,
    RENDER_DISTANCE: 1200,
    MIN_ALTITUDE: 5,
    MAX_ALTITUDE: 800,
    MOVE_SPEED: 0.25,
    TURN_SPEED: 0.008,
    CLIMB_SPEED: 0.25,
    HORIZON_SPEED: 1,
    BOOST_MULTIPLIER: 3,
    SKY_COLOR: 4286615776,
    FOG_START: 400,
    COLLISION_MARGIN: 5,
    TARGET_COUNT: 8,
    RADAR_SIZE: 100,
    RADAR_RANGE: 500
  };
  var GAME_STATES = {
    TITLE: "title",
    MENU: "menu",
    CAMPAIGN: "campaign",
    FREEPLAY: "freeplay",
    SETTINGS: "settings",
    ACHIEVEMENTS: "achievements",
    LEADERBOARD: "leaderboard",
    HOWTO: "howto",
    BRIEFING: "briefing",
    PLAYING: "playing",
    PAUSED: "paused",
    VICTORY: "victory",
    DEFEAT: "defeat",
    MISSION_GENERATOR: "mission_generator",
    CUSTOM_MISSION: "custom_mission"
  };
  var GAME_MODES2 = {
    COMANCHE: "comanche",
    DELTA: "delta"
  };

  // src/voxelvibe/data/weapons.ts
  var exports_weapons = {};
  __export(exports_weapons, {
    getDamageMultiplier: () => getDamageMultiplier,
    WEAPON_ORDER: () => WEAPON_ORDER,
    WEAPONS_DELTA: () => WEAPONS_DELTA,
    WEAPONS: () => WEAPONS,
    SOLDIER_WEAPON_ORDER: () => SOLDIER_WEAPON_ORDER,
    DEFAULT_COUNTERMEASURES: () => DEFAULT_COUNTERMEASURES,
    DAMAGE_MULTIPLIERS: () => DAMAGE_MULTIPLIERS
  });
  var WEAPONS = {
    cannon: {
      name: "CANNON",
      key: "1",
      ammo: Infinity,
      maxAmmo: Infinity,
      fireRate: 100,
      damage: 25,
      projectileSpeed: 20,
      projectileType: "bullet",
      color: "#ffff00",
      spread: 0.02,
      description: "Rapid-fire cannon"
    },
    rockets: {
      name: "ROCKETS",
      key: "2",
      ammo: 20,
      maxAmmo: 20,
      fireRate: 500,
      damage: 75,
      projectileSpeed: 15,
      projectileType: "rocket",
      color: "#ff6600",
      spread: 0.01,
      description: "Unguided rockets"
    },
    hellfire: {
      name: "HELLFIRE",
      key: "3",
      ammo: 8,
      maxAmmo: 8,
      fireRate: 1000,
      damage: 200,
      projectileSpeed: 12,
      projectileType: "missile",
      color: "#ff0000",
      spread: 0,
      guided: true,
      description: "Laser-guided missile"
    },
    stinger: {
      name: "STINGER",
      key: "4",
      ammo: 4,
      maxAmmo: 4,
      fireRate: 1500,
      damage: 150,
      projectileSpeed: 25,
      projectileType: "missile",
      color: "#00ffff",
      spread: 0,
      guided: true,
      airToAir: true,
      description: "Heat-seeking missile"
    }
  };
  var WEAPONS_DELTA = {
    m4: {
      name: "M4 Carbine",
      damage: 25,
      fireRate: 100,
      spread: 0.02,
      magSize: 30,
      maxMags: 5,
      projectileSpeed: 20,
      color: "#ffaa00",
      auto: true,
      key: "Digit1"
    },
    sniper: {
      name: "M24 Sniper",
      damage: 100,
      fireRate: 1200,
      spread: 0.002,
      magSize: 5,
      maxMags: 4,
      projectileSpeed: 30,
      color: "#ff4400",
      auto: false,
      key: "Digit2"
    },
    pistol: {
      name: "M9 Pistol",
      damage: 20,
      fireRate: 200,
      spread: 0.03,
      magSize: 15,
      maxMags: 3,
      projectileSpeed: 15,
      color: "#ffff00",
      auto: false,
      key: "Digit3"
    },
    javelin: {
      name: "Javelin",
      damage: 240,
      fireRate: 1800,
      spread: 0.005,
      magSize: 1,
      maxMags: 3,
      projectileSpeed: 10,
      color: "#ff8800",
      auto: false,
      guided: true,
      projectileType: "missile",
      key: "Digit4"
    },
    stinger: {
      name: "Stinger",
      damage: 180,
      fireRate: 1500,
      spread: 0.003,
      magSize: 1,
      maxMags: 4,
      projectileSpeed: 18,
      color: "#00ccff",
      auto: false,
      guided: true,
      airToAir: true,
      projectileType: "missile",
      key: "Digit5"
    },
    c4: {
      name: "C4 Explosive",
      damage: 400,
      fireRate: 500,
      spread: 0,
      magSize: 1,
      maxMags: 3,
      projectileSpeed: 0,
      color: "#ff4400",
      auto: false,
      explosive: true,
      blastRadius: 60,
      key: "Digit6"
    },
    airstrike: {
      name: "Airstrike",
      damage: 0,
      fireRate: 0,
      spread: 0,
      magSize: 1,
      maxMags: 2,
      projectileSpeed: 0,
      color: "#66ccff",
      auto: false,
      type: "support",
      key: "Digit7"
    }
  };
  var WEAPON_ORDER = ["cannon", "rockets", "hellfire", "stinger"];
  var SOLDIER_WEAPON_ORDER = ["m4", "sniper", "pistol", "javelin", "stinger", "c4", "airstrike"];
  var DAMAGE_MULTIPLIERS = {
    pistol: { soldier: 1, tank: 0.02, building: 0.02, sam: 0.05, aircraft: 0.08 },
    m4: { soldier: 1, tank: 0.03, building: 0.03, sam: 0.08, aircraft: 0.12 },
    sniper: { soldier: 1.5, tank: 0.06, building: 0.05, sam: 0.12, aircraft: 0.18 },
    cannon: { soldier: 1, tank: 0.5, building: 0.3, sam: 0.8, aircraft: 1 },
    rockets: { soldier: 2, tank: 1, building: 0.8, sam: 1, aircraft: 1.5 },
    hellfire: { soldier: 3, tank: 1.5, building: 1, sam: 1.2, aircraft: 2 },
    stinger: { soldier: 1, tank: 0.1, building: 0.05, sam: 0.3, aircraft: 2 },
    javelin: { soldier: 0.6, tank: 2.5, building: 0.6, sam: 1.2, aircraft: 0.4 },
    c4: { soldier: 3, tank: 2, building: 2.5, sam: 2, aircraft: 0.5 },
    airstrike: { soldier: 1.6, tank: 1.4, building: 1.3, sam: 1.3, aircraft: 0.4 }
  };
  function getDamageMultiplier(weaponType, category) {
    return DAMAGE_MULTIPLIERS[weaponType]?.[category] ?? 1;
  }
  var DEFAULT_COUNTERMEASURES = {
    chaff: { count: 10, cooldown: 2000 },
    flare: { count: 10, cooldown: 2000 }
  };

  // src/voxelvibe/data/targets.ts
  var exports_targets = {};
  __export(exports_targets, {
    getTargetDamageCategory: () => getTargetDamageCategory,
    TARGET_TYPES: () => TARGET_TYPES,
    FACTIONS: () => FACTIONS,
    ENTITY_BUDGET: () => ENTITY_BUDGET,
    DOMAINS: () => DOMAINS
  });
  var FACTIONS = {
    ENEMY: "enemy",
    FRIENDLY: "friendly",
    NEUTRAL: "neutral"
  };
  var DOMAINS = {
    GROUND: "ground",
    AIR: "air",
    STRUCTURE: "structure",
    PLAYER: "player"
  };
  var TARGET_TYPES = {
    TANK: {
      type: "tank",
      health: 100,
      points: 100,
      size: 20,
      color: "#4a5c4a",
      domain: DOMAINS.GROUND,
      faction: FACTIONS.ENEMY,
      hitHeight: 8,
      heightOffset: 0,
      ai: {
        type: "patrol",
        speed: 0.02,
        patrolRadius: 40,
        detectRange: 250,
        engageRange: 200,
        fireRate: 2500,
        bulletSpeed: 1.2,
        bulletDamage: 25
      }
    },
    SOLDIER: {
      type: "soldier",
      health: 60,
      maxHealth: 60,
      points: 100,
      size: 12,
      color: "#5a6b4a",
      domain: DOMAINS.GROUND,
      faction: FACTIONS.ENEMY,
      hitHeight: 12,
      heightOffset: 7,
      canShoot: true,
      ai: {
        type: "infantry",
        detectRange: 200,
        engageRange: 150,
        fireRate: 800,
        accuracy: 0.05,
        bulletSpeed: 2.5,
        bulletDamage: 8,
        patrolRadius: 30,
        patrolSpeed: 0.02
      }
    },
    SNIPER: {
      type: "sniper",
      health: 40,
      maxHealth: 40,
      points: 150,
      size: 12,
      color: "#3a4a3a",
      domain: DOMAINS.GROUND,
      faction: FACTIONS.ENEMY,
      hitHeight: 12,
      heightOffset: 7,
      canShoot: true,
      ai: {
        type: "sniper",
        detectRange: 400,
        engageRange: 350,
        fireRate: 2500,
        accuracy: 0.01,
        bulletSpeed: 4,
        bulletDamage: 25,
        patrolRadius: 15,
        patrolSpeed: 0.005
      }
    },
    BUILDING: {
      type: "building",
      health: 200,
      points: 200,
      size: 40,
      color: "#6b5a4a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 40,
      heightOffset: 0,
      ai: null
    },
    HANGAR: {
      type: "hangar",
      health: 300,
      points: 250,
      size: 50,
      color: "#5a5a5a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 35,
      heightOffset: 0,
      ai: null
    },
    CONTROL_TOWER: {
      type: "control_tower",
      health: 150,
      points: 300,
      size: 20,
      color: "#6a6a6a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 50,
      heightOffset: 0,
      ai: null
    },
    BARRACKS: {
      type: "barracks",
      health: 180,
      points: 150,
      size: 35,
      color: "#5a6a4a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 20,
      heightOffset: 0,
      ai: null
    },
    FUEL_DEPOT: {
      type: "fuel_depot",
      health: 100,
      points: 200,
      size: 25,
      color: "#4a4a4a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 15,
      heightOffset: 0,
      ai: null
    },
    HELIPAD: {
      type: "helipad",
      health: 50,
      points: 50,
      size: 30,
      color: "#3a3a3a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 2,
      heightOffset: 0,
      ai: null
    },
    SAM_SITE: {
      type: "sam",
      health: 150,
      points: 150,
      size: 25,
      color: "#3a4a3a",
      domain: DOMAINS.STRUCTURE,
      faction: FACTIONS.ENEMY,
      hitHeight: 20,
      heightOffset: 0,
      ai: {
        type: "sam",
        fireRate: 8000,
        range: 350,
        missileSpeed: 1.5,
        missileDamage: 30
      }
    },
    AIR_FIGHTER: {
      type: "air_fighter",
      health: 80,
      points: 400,
      size: 18,
      color: "#5a5a6a",
      domain: DOMAINS.AIR,
      faction: FACTIONS.ENEMY,
      hitHeight: 8,
      ai: {
        type: "aircraft",
        role: "fighter",
        speed: 0.6,
        turnRate: 0.015,
        climbRate: 0.3,
        preferredAlt: 250,
        detectRange: 400,
        engageRange: 250,
        fireRate: 1200,
        weaponType: "air_missile",
        bulletSpeed: 0.9,
        bulletDamage: 45,
        attackCooldown: 8000
      }
    },
    AIR_TRANSPORT: {
      type: "air_transport",
      health: 150,
      points: 300,
      size: 30,
      color: "#6a6a5a",
      domain: DOMAINS.AIR,
      faction: FACTIONS.ENEMY,
      hitHeight: 12,
      ai: {
        type: "aircraft",
        role: "transport",
        speed: 0.4,
        turnRate: 0.008,
        climbRate: 0.15,
        preferredAlt: 200,
        detectRange: 200,
        engageRange: 0,
        fireRate: 0,
        weaponType: null
      }
    },
    AIR_ATTACK_HELI: {
      type: "air_attack_heli",
      health: 120,
      points: 350,
      size: 22,
      color: "#3a3a3a",
      domain: DOMAINS.AIR,
      faction: FACTIONS.ENEMY,
      hitHeight: 10,
      ai: {
        type: "aircraft",
        role: "attack_heli",
        speed: 0.18,
        turnRate: 0.02,
        climbRate: 0.25,
        preferredAlt: 80,
        detectRange: 300,
        engageRange: 200,
        fireRate: 180,
        weaponType: "air_cannon",
        bulletSpeed: 1.4,
        bulletDamage: 8,
        burstCount: 5,
        burstCooldown: 2000
      }
    }
  };
  var ENTITY_BUDGET = {
    maxGround: 50,
    maxAir: 8,
    maxStructures: 30,
    maxTotal: 80
  };
  function getTargetDamageCategory(target) {
    if (!target)
      return "soldier";
    if (target.type === "soldier")
      return "soldier";
    if (target.type === "sniper")
      return "soldier";
    if (target.type === "tank")
      return "tank";
    if (target.type === "sam")
      return "sam";
    if (target.domain === DOMAINS.AIR)
      return "aircraft";
    if (target.domain === DOMAINS.STRUCTURE)
      return "building";
    return "soldier";
  }

  // src/voxelvibe/data/missions.ts
  var exports_missions = {};
  __export(exports_missions, {
    validateMission: () => validateMission,
    normalizeDifficulty: () => normalizeDifficulty,
    formatDuration: () => formatDuration,
    deriveTargetCounts: () => deriveTargetCounts,
    calculateAccuracy: () => calculateAccuracy,
    DEFAULT_MAPS: () => DEFAULT_MAPS
  });
  function normalizeDifficulty(difficulty) {
    if (difficulty === "normal")
      return "medium";
    if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard" || difficulty === "extreme") {
      return difficulty;
    }
    return "medium";
  }
  function deriveTargetCounts(aiConfig) {
    const counts = { tanks: 0, soldiers: 0, buildings: 0, sams: 0 };
    if (!aiConfig || !Array.isArray(aiConfig.entities))
      return counts;
    for (const spec of aiConfig.entities) {
      const typeKey = String(spec.type || "").toUpperCase();
      const rawCount = Number(spec.count || 0);
      const count = Number.isFinite(rawCount) ? rawCount : 0;
      if (typeKey === "TANK")
        counts.tanks += count;
      if (typeKey === "SOLDIER")
        counts.soldiers += count;
      if (typeKey === "SNIPER")
        counts.soldiers += count;
      if (typeKey === "BUILDING")
        counts.buildings += count;
      if (typeKey === "SAM_SITE")
        counts.sams += count;
    }
    return counts;
  }
  function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  function calculateAccuracy(shotsFired, shotsHit) {
    if (shotsFired <= 0)
      return 0;
    return Math.round(shotsHit / shotsFired * 100);
  }
  function validateMission(mission) {
    const errors = [];
    const warnings = [];
    if (!mission || typeof mission !== "object") {
      return { valid: false, errors: ["Mission must be an object"], warnings: [] };
    }
    const m = mission;
    if (typeof m.missionId !== "number") {
      errors.push("missionId must be a number");
    }
    if (typeof m.name !== "string" || m.name.trim() === "") {
      errors.push("name must be a non-empty string");
    }
    if (typeof m.mapIndex !== "number" || m.mapIndex < 1) {
      errors.push("mapIndex must be a positive number");
    }
    if (!m.playerStart || typeof m.playerStart.x !== "number" || typeof m.playerStart.y !== "number") {
      errors.push("playerStart must have numeric x and y coordinates");
    }
    if (m.difficulty && !["easy", "medium", "normal", "hard", "extreme"].includes(m.difficulty)) {
      warnings.push(`Unknown difficulty "${m.difficulty}", will default to medium`);
    }
    if (m.weather && !["clear", "cloudy", "rain", "storm", "fog", "night"].includes(m.weather)) {
      warnings.push(`Unknown weather "${m.weather}"`);
    }
    if (m.spawnZones && Array.isArray(m.spawnZones)) {
      m.spawnZones.forEach((zone, i) => {
        if (typeof zone.x !== "number" || typeof zone.y !== "number") {
          errors.push(`spawnZones[${i}] must have numeric x and y`);
        }
        if (zone.count !== undefined && (typeof zone.count !== "number" || zone.count < 0)) {
          warnings.push(`spawnZones[${i}].count should be a non-negative number`);
        }
      });
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  var DEFAULT_MAPS = [
    { color: "/src/web/public/maps/C1W.png", height: "/src/web/public/maps/D1.png", name: "Map 1" },
    { color: "/src/web/public/maps/C2W.png", height: "/src/web/public/maps/D2.png", name: "Map 2" },
    { color: "/src/web/public/maps/C3.png", height: "/src/web/public/maps/D3.png", name: "Map 3" },
    { color: "/src/web/public/maps/C4.png", height: "/src/web/public/maps/D4.png", name: "Map 4" },
    { color: "/src/web/public/maps/C5W.png", height: "/src/web/public/maps/D5.png", name: "Map 5" },
    { color: "/src/web/public/maps/C6W.png", height: "/src/web/public/maps/D6.png", name: "Map 6" },
    { color: "/src/web/public/maps/C7W.png", height: "/src/web/public/maps/D7.png", name: "Map 7" },
    { color: "/src/web/public/maps/C8.png", height: "/src/web/public/maps/D6.png", name: "Map 8" },
    { color: "/src/web/public/maps/C9W.png", height: "/src/web/public/maps/D9.png", name: "Map 9" },
    { color: "/src/web/public/maps/C10W.png", height: "/src/web/public/maps/D10.png", name: "Map 10" },
    { color: "/src/web/public/maps/C11W.png", height: "/src/web/public/maps/D11.png", name: "Map 11" },
    { color: "/src/web/public/maps/C12W.png", height: "/src/web/public/maps/D11.png", name: "Map 12" },
    { color: "/src/web/public/maps/C13.png", height: "/src/web/public/maps/D13.png", name: "Map 13" },
    { color: "/src/web/public/maps/C14.png", height: "/src/web/public/maps/D14.png", name: "Map 14" },
    { color: "/src/web/public/maps/C15.png", height: "/src/web/public/maps/D15.png", name: "Map 15" },
    { color: "/src/web/public/maps/C16W.png", height: "/src/web/public/maps/D16.png", name: "Map 16" },
    { color: "/src/web/public/maps/C17W.png", height: "/src/web/public/maps/D17.png", name: "Map 17" },
    { color: "/src/web/public/maps/C18W.png", height: "/src/web/public/maps/D18.png", name: "Map 18" },
    { color: "/src/web/public/maps/C19W.png", height: "/src/web/public/maps/D19.png", name: "Map 19" },
    { color: "/src/web/public/maps/C20W.png", height: "/src/web/public/maps/D20.png", name: "Map 20" },
    { color: "/src/web/public/maps/C21.png", height: "/src/web/public/maps/D21.png", name: "Map 21" },
    { color: "/src/web/public/maps/C22W.png", height: "/src/web/public/maps/D22.png", name: "Map 22" },
    { color: "/src/web/public/maps/C23W.png", height: "/src/web/public/maps/D21.png", name: "Map 23" },
    { color: "/src/web/public/maps/C24W.png", height: "/src/web/public/maps/D24.png", name: "Map 24" },
    { color: "/src/web/public/maps/C25W.png", height: "/src/web/public/maps/D25.png", name: "Map 25" },
    { color: "/src/web/public/maps/C26W.png", height: "/src/web/public/maps/D18.png", name: "Map 26" },
    { color: "/src/web/public/maps/C27W.png", height: "/src/web/public/maps/D15.png", name: "Map 27" },
    { color: "/src/web/public/maps/C28W.png", height: "/src/web/public/maps/D25.png", name: "Map 28" },
    { color: "/src/web/public/maps/C29W.png", height: "/src/web/public/maps/D16.png", name: "Map 29" }
  ];

  // src/voxelvibe/systems/weather.ts
  var exports_weather = {};
  __export(exports_weather, {
    updateRain: () => updateRain,
    updateLightning: () => updateLightning,
    nextWeatherCondition: () => nextWeatherCondition,
    createRainParticles: () => createRainParticles,
    createLightningState: () => createLightningState,
    WEATHER_PRESETS: () => WEATHER_PRESETS,
    WEATHER_CYCLE: () => WEATHER_CYCLE,
    MAX_RAIN_PARTICLES: () => MAX_RAIN_PARTICLES
  });
  var WEATHER_PRESETS = {
    clear: {
      skyColor: 4286615776,
      fogStart: 400,
      fogDensity: 1,
      ambient: 1,
      name: "CLEAR"
    },
    dusk: {
      skyColor: 4282400928,
      fogStart: 300,
      fogDensity: 1.2,
      ambient: 0.7,
      name: "DUSK"
    },
    night: {
      skyColor: 4279242776,
      fogStart: 150,
      fogDensity: 2,
      ambient: 0.15,
      name: "NIGHT"
    },
    fog: {
      skyColor: 4287664272,
      fogStart: 80,
      fogDensity: 3,
      ambient: 0.5,
      name: "FOG"
    },
    storm: {
      skyColor: 4281348160,
      fogStart: 100,
      fogDensity: 2.5,
      ambient: 0.3,
      name: "STORM",
      hasRain: true,
      rainIntensity: 1
    }
  };
  var WEATHER_CYCLE = ["clear", "dusk", "night", "fog", "storm"];
  function nextWeatherCondition(current) {
    const idx = WEATHER_CYCLE.indexOf(current);
    return WEATHER_CYCLE[(idx + 1) % WEATHER_CYCLE.length];
  }
  function createRainParticles(count, screenWidth, screenHeight) {
    const drops = [];
    for (let i = 0;i < count; i++) {
      drops.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        length: 10 + Math.random() * 20,
        speed: 15 + Math.random() * 10,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    return drops;
  }
  function updateRain(drops, weather, screenWidth, screenHeight, now) {
    if (!weather.hasRain)
      return;
    const intensity = weather.rainIntensity || 1;
    const windOffset = Math.sin(now / 2000) * 2;
    for (const drop of drops) {
      drop.y += drop.speed * intensity;
      drop.x += windOffset;
      if (drop.y > screenHeight) {
        drop.y = -drop.length;
        drop.x = Math.random() * screenWidth;
      }
      if (drop.x > screenWidth)
        drop.x = 0;
      if (drop.x < 0)
        drop.x = screenWidth;
    }
  }
  function createLightningState() {
    return { flash: 0, nextTime: 0 };
  }
  function updateLightning(state, condition, deltaTime, now) {
    if (state.flash > 0) {
      state.flash -= deltaTime * 0.005;
      if (state.flash < 0)
        state.flash = 0;
    }
    if (condition === "storm" && now > state.nextTime) {
      if (Math.random() < 0.2) {
        state.flash = 0.8 + Math.random() * 0.2;
      }
      state.nextTime = now + 3000 + Math.random() * 7000;
    }
  }
  var MAX_RAIN_PARTICLES = 300;

  // src/voxelvibe/systems/audio.ts
  var exports_audio = {};
  __export(exports_audio, {
    stopLoopingSound: () => stopLoopingSound,
    resumeAudio: () => resumeAudio,
    playVictoryStinger: () => playVictoryStinger,
    playTone: () => playTone,
    playRocketSound: () => playRocketSound,
    playMissileWarningBeep: () => playMissileWarningBeep,
    playMissileSound: () => playMissileSound,
    playMenuNavigateSound: () => playMenuNavigateSound,
    playMenuNavigate: () => playMenuNavigate,
    playMenuConfirmSound: () => playMenuConfirmSound,
    playMenuConfirm: () => playMenuConfirm,
    playHitSound: () => playHitSound,
    playExplosionSound: () => playExplosionSound,
    playDefeatStinger: () => playDefeatStinger,
    playDamageSound: () => playDamageSound,
    playCountermeasureSound: () => playCountermeasureSound,
    playCannonSound: () => playCannonSound,
    playAchievementSound: () => playAchievementSound,
    playAchievement: () => playAchievement,
    initAudio: () => initAudio,
    getNoiseBuffer: () => getNoiseBuffer,
    createWindSound: () => createWindSound,
    createAudioState: () => createAudioState,
    applyVolume: () => applyVolume
  });
  function createAudioState() {
    return {
      ctx: null,
      masterVolume: null,
      sfxVolume: null,
      soundEnabled: true,
      noiseBuffer: null
    };
  }
  function initAudio(state) {
    try {
      const AudioCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioCtor)
        return false;
      state.ctx = new AudioCtor;
      state.masterVolume = state.ctx.createGain();
      state.sfxVolume = state.ctx.createGain();
      state.masterVolume.connect(state.ctx.destination);
      state.sfxVolume.connect(state.masterVolume);
      return true;
    } catch {
      state.soundEnabled = false;
      return false;
    }
  }
  function resumeAudio(state) {
    if (state.ctx && state.ctx.state === "suspended") {
      state.ctx.resume();
    }
  }
  function applyVolume(state, masterVol, sfxVol) {
    if (state.masterVolume)
      state.masterVolume.gain.value = masterVol;
    if (state.sfxVolume)
      state.sfxVolume.gain.value = sfxVol;
  }
  function getNoiseBuffer(state) {
    if (state.noiseBuffer || !state.ctx)
      return state.noiseBuffer;
    const bufferSize = Math.floor(state.ctx.sampleRate * 2);
    const buffer = state.ctx.createBuffer(1, bufferSize, state.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0;i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    state.noiseBuffer = buffer;
    return buffer;
  }
  function playTone(state, options) {
    if (!state.soundEnabled || !state.ctx || !state.sfxVolume)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = options.type;
      osc.frequency.setValueAtTime(options.startFreq, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(options.endFreq, state.ctx.currentTime + options.duration);
      gain.gain.setValueAtTime(options.volume, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + options.duration);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + options.duration);
    } catch {}
  }
  function playMenuNavigate(state) {
    playTone(state, { type: "triangle", startFreq: 520, endFreq: 360, duration: 0.08, volume: 0.08 });
  }
  function playMenuConfirm(state) {
    playTone(state, { type: "sine", startFreq: 820, endFreq: 520, duration: 0.12, volume: 0.12 });
  }
  function playAchievement(state) {
    playTone(state, { type: "triangle", startFreq: 660, endFreq: 980, duration: 0.18, volume: 0.14 });
  }
  function createWindSound(state) {
    if (!state.soundEnabled || !state.ctx || !state.sfxVolume)
      return null;
    const buffer = getNoiseBuffer(state);
    if (!buffer)
      return null;
    const source = state.ctx.createBufferSource();
    const filter = state.ctx.createBiquadFilter();
    const gain = state.ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = "highpass";
    filter.frequency.value = 180;
    gain.gain.value = 0;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(state.sfxVolume);
    source.start();
    return { source, gain, filter };
  }
  function stopLoopingSound(sound) {
    if (!sound)
      return;
    try {
      sound.source?.stop();
      sound.source?.disconnect();
      sound.filter?.disconnect();
      sound.gain?.disconnect();
    } catch {}
  }
  function playMenuNavigateSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, state.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Error playing menu navigate sound:", e);
    }
  }
  function playMenuConfirmSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(820, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, state.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Error playing menu confirm sound:", e);
    }
  }
  function playAchievementSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(660, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(980, state.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.14, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Error playing achievement sound:", e);
    }
  }
  function playVictoryStinger(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    const now = state.ctx.currentTime;
    const osc = state.ctx.createOscillator();
    const gain = state.ctx.createGain();
    osc.type = "triangle";
    gain.gain.setValueAtTime(0, now);
    const notes = [392, 523, 659];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.18;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
    });
    osc.connect(gain);
    gain.connect(state.sfxVolume);
    osc.start(now);
    osc.stop(now + 0.6);
  }
  function playDefeatStinger(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    const now = state.ctx.currentTime;
    const osc = state.ctx.createOscillator();
    const gain = state.ctx.createGain();
    osc.type = "sine";
    gain.gain.setValueAtTime(0, now);
    const notes = [330, 277, 220];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    });
    osc.connect(gain);
    gain.connect(state.sfxVolume);
    osc.start(now);
    osc.stop(now + 0.7);
  }
  function playCannonSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const gain = state.ctx.createGain();
      const filter = state.ctx.createBiquadFilter();
      const bufferSize = Math.floor(state.ctx.sampleRate * 0.05);
      const buffer = state.ctx.createBuffer(1, bufferSize, state.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0;i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = state.ctx.createBufferSource();
      noise.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      gain.gain.setValueAtTime(0.25, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(state.sfxVolume);
      noise.start();
    } catch (e) {
      console.warn("Error playing cannon sound:", e);
    }
  }
  function playRocketSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, state.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Error playing rocket sound:", e);
    }
  }
  function playMissileSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, state.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.12, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Error playing missile sound:", e);
    }
  }
  function playExplosionSound(state, size = "medium") {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const duration = size === "large" ? 0.5 : size === "medium" ? 0.35 : 0.2;
      const volume = size === "large" ? 0.35 : size === "medium" ? 0.25 : 0.15;
      const osc = state.ctx.createOscillator();
      const noiseGain = state.ctx.createGain();
      const oscGain = state.ctx.createGain();
      const filter = state.ctx.createBiquadFilter();
      const bufferSize = Math.floor(state.ctx.sampleRate * duration);
      const buffer = state.ctx.createBuffer(1, bufferSize, state.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0;i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = state.ctx.createBufferSource();
      noise.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, state.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, state.ctx.currentTime + duration);
      noiseGain.gain.setValueAtTime(volume, state.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(state.sfxVolume);
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, state.ctx.currentTime + duration);
      oscGain.gain.setValueAtTime(volume * 0.5, state.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + duration);
      osc.connect(oscGain);
      oscGain.connect(state.sfxVolume);
      noise.start();
      osc.start();
      osc.stop(state.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Error playing explosion sound:", e);
    }
  }
  function playHitSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 150;
      gain.gain.setValueAtTime(0.12, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Error playing hit sound:", e);
    }
  }
  function playMissileWarningBeep(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.15, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Error playing warning beep:", e);
    }
  }
  function playDamageSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const bufferSize = Math.floor(state.ctx.sampleRate * 0.1);
      const buffer = state.ctx.createBuffer(1, bufferSize, state.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0;i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
      }
      const noise = state.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = state.ctx.createGain();
      gain.gain.value = 0.25;
      noise.connect(gain);
      gain.connect(state.sfxVolume);
      noise.start();
    } catch (e) {
      console.warn("Error playing damage sound:", e);
    }
  }
  function playCountermeasureSound(state) {
    if (!state.soundEnabled || !state.ctx)
      return;
    try {
      const osc = state.ctx.createOscillator();
      const gain = state.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, state.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, state.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, state.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, state.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(state.sfxVolume);
      osc.start();
      osc.stop(state.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Error playing countermeasure sound:", e);
    }
  }

  // src/voxelvibe/systems/particles.ts
  var exports_particles = {};
  __export(exports_particles, {
    updateParticles: () => updateParticles,
    spawnParticles: () => spawnParticles,
    createParticlePool: () => createParticlePool,
    PARTICLE_GRAVITY: () => PARTICLE_GRAVITY,
    MAX_PARTICLES: () => MAX_PARTICLES
  });
  var MAX_PARTICLES = 200;
  var PARTICLE_GRAVITY = 120;
  function createParticlePool() {
    return { particles: [], pool: [] };
  }
  function getPooled(pool) {
    return pool.pool.pop() || {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      type: "spark",
      life: 0,
      maxLife: 0,
      size: 2,
      growth: 0,
      color: null
    };
  }
  function recycle(pool, index) {
    const p = pool.particles[index];
    pool.pool.push(p);
    pool.particles[index] = pool.particles[pool.particles.length - 1];
    pool.particles.pop();
  }
  function spawnParticles(pool, x, y, z, type, count, config) {
    if (!count || count <= 0)
      return;
    for (let i = 0;i < count; i++) {
      if (pool.particles.length >= MAX_PARTICLES)
        return;
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
        case "spark": {
          const speed = 80 + Math.random() * 80;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.vz = 40 + Math.random() * 40;
          p.life = 0.25 + Math.random() * 0.15;
          p.size = 1.5 + Math.random() * 1.5;
          p.color = { r: 255, g: 180 + Math.random() * 60, b: 60 };
          break;
        }
        case "smoke": {
          const speed = isDelta ? 4 + Math.random() * 6 : 8 + Math.random() * 12;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.vz = isDelta ? 6 + Math.random() * 8 : 12 + Math.random() * 18;
          p.life = isDelta ? 0.4 + Math.random() * 0.4 : 1 + Math.random() * 1;
          p.size = isDelta ? 2 + Math.random() * 2 : 6 + Math.random() * 6;
          p.growth = isDelta ? 4 + Math.random() * 4 : 12 + Math.random() * 14;
          const shade = 60 + Math.floor(Math.random() * 50);
          p.color = { r: shade, g: shade, b: shade };
          break;
        }
        case "debris": {
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
        case "dust": {
          const terrainHeight = config?.getTerrainHeight?.(x, y) ?? 0;
          p.z = terrainHeight + 1;
          p.life = 0.35 + Math.random() * 0.25;
          p.size = 8 + Math.random() * 6;
          p.growth = 60 + Math.random() * 40;
          p.color = { r: 120, g: 110, b: 90 };
          break;
        }
        case "blood": {
          const speed = 20 + Math.random() * 30;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.vz = 30 + Math.random() * 40;
          p.life = 0.4 + Math.random() * 0.3;
          p.size = 2 + Math.random() * 3;
          p.color = {
            r: 120 + Math.floor(Math.random() * 40),
            g: 20 + Math.floor(Math.random() * 20),
            b: 20 + Math.floor(Math.random() * 20)
          };
          break;
        }
        case "trail_smoke": {
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
        case "muzzle_flash": {
          p.vx = 0;
          p.vy = 0;
          p.vz = 0;
          p.life = 0.06 + Math.random() * 0.03;
          p.size = 6 + Math.random() * 4;
          p.growth = 0;
          p.color = {
            r: 255,
            g: 220 + Math.floor(Math.random() * 35),
            b: 100 + Math.floor(Math.random() * 50)
          };
          break;
        }
      }
      p.maxLife = p.life;
      pool.particles.push(p);
    }
  }
  function updateParticles(pool, deltaTime, mapSize, getTerrainHeight) {
    const dt = deltaTime * 0.001;
    if (dt <= 0)
      return;
    for (let i = pool.particles.length - 1;i >= 0; i--) {
      const p = pool.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        recycle(pool, i);
        continue;
      }
      if (p.type === "dust") {
        p.size += p.growth * dt;
        p.z = getTerrainHeight(p.x, p.y) + 1;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
      }
      p.x = (p.x % mapSize + mapSize) % mapSize;
      p.y = (p.y % mapSize + mapSize) % mapSize;
      if (p.type === "smoke" || p.type === "trail_smoke") {
        p.size += p.growth * dt;
      }
      if (p.type === "spark") {
        p.vz -= PARTICLE_GRAVITY * 0.35 * dt;
      }
      if (p.type === "debris") {
        p.vz -= PARTICLE_GRAVITY * dt;
        const terrainH = getTerrainHeight(p.x, p.y);
        if (p.z <= terrainH) {
          p.z = terrainH;
          p.vx *= 0.4;
          p.vy *= 0.4;
          p.vz = 0;
        }
      }
      if (p.type === "blood") {
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

  // src/voxelvibe/systems/physics.ts
  var exports_physics = {};
  __export(exports_physics, {
    updateSimplePhysics: () => updateSimplePhysics,
    updateHelicopterPhysics: () => updateHelicopterPhysics,
    isHeliLanded: () => isHeliLanded,
    createSoldierState: () => createSoldierState,
    createHeliState: () => createHeliState,
    createCameraState: () => createCameraState,
    SOLDIER_PHYSICS: () => SOLDIER_PHYSICS,
    HELI_PHYSICS: () => HELI_PHYSICS
  });
  var HELI_PHYSICS = {
    MAX_BANK: Math.PI / 4,
    BANK_RATE: 0.012,
    BANK_RETURN: 0.015,
    TURN_BANK_RATIO: 0.001,
    MAX_FORWARD_SPEED: 0.3,
    ACCELERATION: 0.005,
    DECELERATION: 0.003,
    LATERAL_DRIFT: 0.01,
    MAX_YAW_RATE: 0.008,
    PITCH_RATE: 0.5
  };
  var SOLDIER_PHYSICS = {
    stanceEyeHeights: { stand: 14, crouch: 9, prone: 4 },
    stanceSpeeds: {
      stand: 0.15,
      sprint: 0.28,
      crouch: 0.075,
      prone: 0.0375
    },
    accel: 0.008,
    friction: 0.85,
    headBobSpeed: 0.15
  };
  function createCameraState() {
    return {
      x: 512,
      y: 512,
      height: 150,
      angle: 0,
      horizon: 100,
      distance: 1200,
      bank: 0,
      bankVelocity: 0,
      pitch: 0,
      yawRate: 0,
      forwardSpeed: 0,
      lateralSpeed: 0,
      verticalSpeed: 0
    };
  }
  function updateHelicopterPhysics(cam, input, config, dt, getTerrainHeight) {
    const boost = input.boost ? config.boostMultiplier : 1;
    const climbSpeed = config.climbSpeed * boost;
    let bankInput = 0;
    if (input.bankLeft)
      bankInput = 1;
    if (input.bankRight)
      bankInput = -1;
    if (bankInput !== 0) {
      cam.bank += bankInput * HELI_PHYSICS.BANK_RATE;
    } else {
      cam.bank *= 1 - HELI_PHYSICS.BANK_RETURN;
      if (Math.abs(cam.bank) < 0.01)
        cam.bank = 0;
    }
    cam.bank = clamp(cam.bank, -HELI_PHYSICS.MAX_BANK, HELI_PHYSICS.MAX_BANK);
    if (input.forward) {
      cam.forwardSpeed += HELI_PHYSICS.ACCELERATION * boost;
    } else if (input.backward) {
      cam.forwardSpeed -= HELI_PHYSICS.ACCELERATION * boost;
    } else {
      cam.forwardSpeed *= 1 - HELI_PHYSICS.DECELERATION;
    }
    const maxSpeed = HELI_PHYSICS.MAX_FORWARD_SPEED * boost;
    cam.forwardSpeed = clamp(cam.forwardSpeed, -maxSpeed, maxSpeed);
    if (input.strafeLeft) {
      cam.lateralSpeed += HELI_PHYSICS.ACCELERATION * boost;
    } else if (input.strafeRight) {
      cam.lateralSpeed -= HELI_PHYSICS.ACCELERATION * boost;
    } else {
      const bankDrift = -cam.bank * HELI_PHYSICS.LATERAL_DRIFT * Math.abs(cam.forwardSpeed);
      cam.lateralSpeed *= 1 - HELI_PHYSICS.DECELERATION;
      cam.lateralSpeed += bankDrift;
    }
    cam.lateralSpeed = clamp(cam.lateralSpeed, -maxSpeed, maxSpeed);
    const effectiveSpeed = Math.max(0.3, Math.abs(cam.forwardSpeed) / HELI_PHYSICS.MAX_FORWARD_SPEED);
    cam.yawRate = cam.bank * HELI_PHYSICS.TURN_BANK_RATIO * effectiveSpeed * 15;
    cam.angle += cam.yawRate;
    if (input.yawLeft)
      cam.angle += HELI_PHYSICS.MAX_YAW_RATE * dt;
    if (input.yawRight)
      cam.angle -= HELI_PHYSICS.MAX_YAW_RATE * dt;
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    cam.x -= sinAngle * cam.forwardSpeed * dt;
    cam.y -= cosAngle * cam.forwardSpeed * dt;
    cam.x -= cosAngle * cam.lateralSpeed * dt;
    cam.y += sinAngle * cam.lateralSpeed * dt;
    if (input.climbUp) {
      cam.verticalSpeed += climbSpeed * 0.06 * dt;
    } else if (input.climbDown) {
      cam.verticalSpeed -= climbSpeed * 0.06 * dt;
    } else {
      cam.verticalSpeed *= Math.max(0, 1 - 0.08 * dt);
    }
    cam.verticalSpeed = clamp(cam.verticalSpeed, -climbSpeed * 0.7, climbSpeed);
    cam.height += cam.verticalSpeed * dt;
    cam.pitch *= Math.max(0, 1 - 0.05 * dt);
    cam.horizon = clamp(cam.horizon, 0, config.screenHeight);
    cam.height = clamp(cam.height, config.minAltitude, config.maxAltitude);
    cam.x = wrapPosition(cam.x, config.mapSize);
    cam.y = wrapPosition(cam.y, config.mapSize);
    const terrainH = getTerrainHeight(cam.x, cam.y);
    if (cam.height < terrainH + config.collisionMargin) {
      cam.height = terrainH + config.collisionMargin;
      cam.verticalSpeed = Math.max(0, cam.verticalSpeed);
    }
  }
  function updateSimplePhysics(cam, input, config, dt, getTerrainHeight) {
    const boost = input.boost ? config.boostMultiplier : 1;
    const turnSpeed = 0.008;
    if (input.bankLeft)
      cam.angle += turnSpeed * boost * dt;
    if (input.bankRight)
      cam.angle -= turnSpeed * boost * dt;
    if (input.forward) {
      cam.forwardSpeed = config.moveSpeed * boost;
    } else if (input.backward) {
      cam.forwardSpeed = -config.moveSpeed * boost * 0.5;
    } else {
      cam.forwardSpeed = 0;
    }
    cam.bank = 0;
    cam.lateralSpeed = 0;
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    cam.x -= sinAngle * cam.forwardSpeed * dt;
    cam.y -= cosAngle * cam.forwardSpeed * dt;
    const climbSpeed = config.climbSpeed * boost;
    if (input.climbUp) {
      cam.verticalSpeed += climbSpeed * 0.06 * dt;
    } else if (input.climbDown) {
      cam.verticalSpeed -= climbSpeed * 0.06 * dt;
    } else {
      cam.verticalSpeed *= Math.max(0, 1 - 0.08 * dt);
    }
    cam.verticalSpeed = clamp(cam.verticalSpeed, -climbSpeed * 0.7, climbSpeed);
    cam.height += cam.verticalSpeed * dt;
    cam.horizon = clamp(cam.horizon, 0, config.screenHeight);
    cam.height = clamp(cam.height, config.minAltitude, config.maxAltitude);
    cam.x = wrapPosition(cam.x, config.mapSize);
    cam.y = wrapPosition(cam.y, config.mapSize);
    const terrainH = getTerrainHeight(cam.x, cam.y);
    if (cam.height < terrainH + config.collisionMargin) {
      cam.height = terrainH + config.collisionMargin;
      cam.verticalSpeed = Math.max(0, cam.verticalSpeed);
    }
  }
  function createHeliState() {
    return {
      x: 512,
      y: 512,
      z: 25,
      angle: 0,
      bank: 0,
      forwardSpeed: 0,
      lateralSpeed: 0,
      verticalSpeed: 0,
      health: 200,
      maxHealth: 200,
      destroyed: false,
      visible: true
    };
  }
  function isHeliLanded(heli, getTerrainHeight) {
    if (!getTerrainHeight)
      return false;
    const terrainH = getTerrainHeight(heli.x, heli.y);
    return heli.z <= terrainH + 10 && Math.abs(heli.forwardSpeed) < 0.05;
  }
  function createSoldierState() {
    return { x: 512, y: 512, stance: "stand", health: 100 };
  }

  // src/voxelvibe/systems/combat.ts
  var exports_combat = {};
  __export(exports_combat, {
    updateScreenShake: () => updateScreenShake,
    updateProjectiles: () => updateProjectiles,
    triggerScreenShake: () => triggerScreenShake,
    resetTargeting: () => resetTargeting,
    isValidTarget: () => isValidTarget,
    getValidTargetDomain: () => getValidTargetDomain,
    getTargetingRange: () => getTargetingRange,
    getTargetDamageCategory: () => getTargetDamageCategory2,
    getObjectiveTotal: () => getObjectiveTotal,
    getObjectiveProgressText: () => getObjectiveProgressText,
    getLockTime: () => getLockTime,
    getDamageForTarget: () => getDamageForTarget,
    deployCountermeasure: () => deployCountermeasure,
    createTargetingState: () => createTargetingState,
    createScreenShake: () => createScreenShake,
    createProjectile: () => createProjectile,
    createCountermeasureState: () => createCountermeasureState,
    LOCK_TIMES: () => LOCK_TIMES
  });
  function createTargetingState() {
    return {
      lockedTarget: null,
      selectedTarget: null,
      lockProgress: 0,
      lockStartTime: 0,
      isLocking: false,
      lastCycleTime: 0
    };
  }
  function resetTargeting(state) {
    state.lockedTarget = null;
    state.selectedTarget = null;
    state.lockProgress = 0;
    state.isLocking = false;
    state.lockStartTime = 0;
  }
  var LOCK_TIMES = {
    hellfire: 1500,
    stinger: 1000,
    javelin: 2000
  };
  function getLockTime(weaponKey) {
    return LOCK_TIMES[weaponKey] || 0;
  }
  function getValidTargetDomain(weaponKey) {
    if (weaponKey === "stinger") {
      return { domain: DOMAINS.AIR, requiresLock: true };
    } else if (weaponKey === "hellfire" || weaponKey === "javelin") {
      return { domain: "surface", requiresLock: true };
    }
    return { domain: null, requiresLock: false };
  }
  function isValidTarget(target, weaponKey, enemyFaction) {
    if (!target || target.destroyed)
      return false;
    if (target.faction !== enemyFaction)
      return false;
    const valid = getValidTargetDomain(weaponKey);
    if (valid.domain) {
      if (valid.domain === "surface") {
        if (target.domain === DOMAINS.AIR)
          return false;
      } else if (target.domain !== valid.domain) {
        return false;
      }
    }
    return true;
  }
  function getTargetingRange(weaponKey) {
    if (weaponKey === "hellfire" || weaponKey === "javelin")
      return 2000;
    if (weaponKey === "stinger")
      return 1200;
    return 800;
  }
  function getTargetDamageCategory2(target) {
    if (!target)
      return "soldier";
    if (target.type === "soldier" || target.type === "sniper")
      return "soldier";
    if (target.type === "tank")
      return "tank";
    if (target.type === "sam")
      return "sam";
    if (target.domain === DOMAINS.AIR)
      return "aircraft";
    if (target.domain === DOMAINS.STRUCTURE)
      return "building";
    return "soldier";
  }
  function getDamageForTarget(weaponType, target) {
    const category = getTargetDamageCategory2(target);
    return DAMAGE_MULTIPLIERS[weaponType]?.[category] ?? 1;
  }
  function createProjectile(x, y, z, angle, weapon, damage, speed, spread, guided, targetId, airToAir) {
    const finalAngle = angle + (Math.random() - 0.5) * spread;
    return {
      x,
      y,
      z,
      vx: -Math.sin(finalAngle) * speed,
      vy: -Math.cos(finalAngle) * speed,
      vz: 0,
      damage,
      weapon,
      speed,
      life: 5,
      guided,
      targetId,
      airToAir
    };
  }
  function updateProjectiles(projectiles, deltaTime, mapSize) {
    const dt = deltaTime / 1000;
    for (let i = projectiles.length - 1;i >= 0; i--) {
      const p = projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        projectiles.splice(i, 1);
        continue;
      }
      p.x += p.vx * deltaTime * 0.06;
      p.y += p.vy * deltaTime * 0.06;
      p.z += p.vz * deltaTime * 0.06;
      p.x = (p.x % mapSize + mapSize) % mapSize;
      p.y = (p.y % mapSize + mapSize) % mapSize;
    }
  }
  function createScreenShake() {
    return { x: 0, y: 0, intensity: 0, decay: 0.9, duration: 0 };
  }
  function triggerScreenShake(shake, intensity, duration) {
    shake.intensity = Math.max(shake.intensity, intensity);
    shake.duration = Math.max(shake.duration, duration);
  }
  function updateScreenShake(shake, deltaTime) {
    if (shake.intensity > 0) {
      shake.x = (Math.random() - 0.5) * shake.intensity * 2;
      shake.y = (Math.random() - 0.5) * shake.intensity * 2;
      shake.intensity *= shake.decay;
      shake.duration -= deltaTime;
      if (shake.intensity < 0.1 || shake.duration <= 0) {
        shake.intensity = 0;
        shake.x = 0;
        shake.y = 0;
      }
    }
  }
  function createCountermeasureState() {
    return {
      chaff: { count: 10, cooldown: 2000, lastUsed: 0 },
      flare: { count: 10, cooldown: 2000, lastUsed: 0 }
    };
  }
  function deployCountermeasure(state, type, now) {
    const cm = state[type];
    if (cm.count <= 0)
      return false;
    if (now - cm.lastUsed < cm.cooldown)
      return false;
    cm.count--;
    cm.lastUsed = now;
    return true;
  }
  function getObjectiveTotal(obj) {
    switch (obj.type) {
      case "destroy_type":
      case "destroy_count":
        return obj.count || 1;
      case "survive_time":
        return obj.duration || 60;
      case "destroy_all":
        return -1;
      default:
        return 1;
    }
  }
  function getObjectiveProgressText(obj, remainingTargets) {
    switch (obj.type) {
      case "destroy_all":
        return remainingTargets === 0 ? "COMPLETE" : `${remainingTargets} remaining`;
      case "destroy_type":
      case "destroy_count":
        return `${obj.progress}/${obj.total}`;
      case "survive_time": {
        const remaining = Math.max(0, obj.total - obj.progress);
        return `${Math.ceil(remaining)}s`;
      }
      case "reach_location":
        return obj.complete ? "REACHED" : "IN PROGRESS";
      case "protect_target":
        return obj.failed ? "FAILED" : "PROTECTED";
      default:
        return obj.complete ? "COMPLETE" : "IN PROGRESS";
    }
  }

  // src/voxelvibe/systems/ai.ts
  var exports_ai = {};
  __export(exports_ai, {
    wrappedDistance2D: () => wrappedDistance2D,
    wrappedAngleTo: () => wrappedAngleTo,
    updatePatrolAI: () => updatePatrolAI,
    updateAlertLevel: () => updateAlertLevel,
    recordTargetFire: () => recordTargetFire,
    raiseAlert: () => raiseAlert,
    createAlertState: () => createAlertState,
    canTargetFire: () => canTargetFire
  });
  function wrappedDistance2D(x1, y1, x2, y2, mapSize) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    const half = mapSize / 2;
    if (dx > half)
      dx -= mapSize;
    if (dx < -half)
      dx += mapSize;
    if (dy > half)
      dy -= mapSize;
    if (dy < -half)
      dy += mapSize;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function wrappedAngleTo(fromX, fromY, toX, toY, mapSize) {
    let dx = toX - fromX;
    let dy = toY - fromY;
    const half = mapSize / 2;
    if (dx > half)
      dx -= mapSize;
    if (dx < -half)
      dx += mapSize;
    if (dy > half)
      dy -= mapSize;
    if (dy < -half)
      dy += mapSize;
    return Math.atan2(dx, dy);
  }
  function updatePatrolAI(target, ctx, deltaTime) {
    if (!target.ai || target.destroyed)
      return;
    const ai = target.ai;
    const speed = ai.speed || 0.02;
    const radius = ai.patrolRadius || 40;
    const time = ctx.now * 0.001 * speed;
    target.x = wrapPosition(target.spawnX + Math.cos(time) * radius, ctx.mapSize);
    target.y = wrapPosition(target.spawnY + Math.sin(time) * radius, ctx.mapSize);
    if (target.domain === DOMAINS.GROUND) {
      target.z = ctx.getTerrainHeight(target.x, target.y);
    }
  }
  function canTargetFire(target, playerX, playerY, mapSize, now) {
    if (!target.ai || target.destroyed)
      return false;
    const dist = wrappedDistance2D(target.x, target.y, playerX, playerY, mapSize);
    const engageRange = target.ai.engageRange || target.ai.range || 200;
    const fireRate = target.ai.fireRate || 2000;
    if (dist > engageRange)
      return false;
    if (now - target.lastFireTime < fireRate)
      return false;
    if (target.ai.burstCount && target.ai.burstCooldown) {
      if (target.burstCooldownUntil && now < target.burstCooldownUntil)
        return false;
      if (target.burstShotsLeft !== undefined && target.burstShotsLeft <= 0) {
        target.burstCooldownUntil = now + target.ai.burstCooldown;
        target.burstShotsLeft = target.ai.burstCount;
        return false;
      }
    }
    return true;
  }
  function recordTargetFire(target, now) {
    target.lastFireTime = now;
    if (target.burstShotsLeft !== undefined) {
      target.burstShotsLeft--;
    }
  }
  function createAlertState() {
    return { level: 0, timer: 0, duration: 30000 };
  }
  function raiseAlert(state, level, now) {
    state.level = Math.max(state.level, Math.min(3, level));
    state.timer = now + state.duration;
  }
  function updateAlertLevel(state, now) {
    if (state.level > 0 && now > state.timer) {
      state.level = Math.max(0, state.level - 1);
      if (state.level > 0) {
        state.timer = now + state.duration;
      }
    }
  }

  // src/voxelvibe/render/voxelspace.ts
  var exports_voxelspace = {};
  __export(exports_voxelspace, {
    renderTerrain: () => renderTerrain,
    getTerrainHeight: () => getTerrainHeight,
    blendWithFog: () => blendWithFog,
    applyAmbient: () => applyAmbient
  });
  function applyAmbient(color, ambient) {
    const a = color >>> 24 & 255;
    const b = color >>> 16 & 255;
    const g = color >>> 8 & 255;
    const r = color & 255;
    return (a << 24 | Math.floor(b * ambient) << 16 | Math.floor(g * ambient) << 8 | Math.floor(r * ambient)) >>> 0;
  }
  function blendWithFog(terrainColor, fogFactor, skyColor) {
    const invFog = 1 - fogFactor;
    const tR = terrainColor & 255;
    const tG = terrainColor >> 8 & 255;
    const tB = terrainColor >> 16 & 255;
    const sR = skyColor & 255;
    const sG = skyColor >> 8 & 255;
    const sB = skyColor >> 16 & 255;
    const r = Math.floor(tR * invFog + sR * fogFactor);
    const g = Math.floor(tG * invFog + sG * fogFactor);
    const b = Math.floor(tB * invFog + sB * fogFactor);
    return (4278190080 | b << 16 | g << 8 | r) >>> 0;
  }
  function getTerrainHeight(map, x, y) {
    if (!map.altitude)
      return 0;
    const ix = Math.floor(x) & map.size - 1;
    const iy = Math.floor(y) & map.size - 1;
    return map.altitude[(iy << map.shift) + ix];
  }
  function renderTerrain(buf32, map, camera, weather, config, hiddenYBuffer) {
    const { screenWidth, screenHeight, fogEnabled } = config;
    buf32.fill(weather.skyColor >>> 0);
    if (!map.altitude || !map.color)
      return;
    hiddenYBuffer.fill(screenHeight);
    const sinAngle = Math.sin(camera.angle);
    const cosAngle = Math.cos(camera.angle);
    const bankTiltFactor = Math.sin(camera.bank) * 0.3;
    let dz = 1;
    for (let z = 1;z < camera.distance; z += dz) {
      const plx = -cosAngle * z - sinAngle * z;
      const ply = sinAngle * z - cosAngle * z;
      const prx = cosAngle * z - sinAngle * z;
      const pry = -sinAngle * z - cosAngle * z;
      const dx = (prx - plx) / screenWidth;
      const dy = (pry - ply) / screenWidth;
      let px = plx + camera.x;
      let py = ply + camera.y;
      const invz = 1 / z * 240;
      const fogStart = weather.fogStart;
      const fogEnd = Math.min(camera.distance, fogStart + (camera.distance - fogStart) / weather.fogDensity);
      const fogFactor = fogEnabled ? Math.min(1, Math.max(0, (z - fogStart) / (fogEnd - fogStart))) : 0;
      for (let i = 0;i < screenWidth; i++) {
        const mapX = Math.floor(px) & map.size - 1;
        const mapY = Math.floor(py) & map.size - 1;
        const mapOffset = (mapY << map.shift) + mapX;
        const terrainHeight = map.altitude[mapOffset];
        let terrainColor = map.color[mapOffset];
        if (weather.ambient < 1) {
          terrainColor = applyAmbient(terrainColor, weather.ambient);
        }
        const columnOffset = i - screenWidth / 2;
        const bankOffset = columnOffset * bankTiltFactor;
        const heightOnScreen = Math.floor((camera.height - terrainHeight) * invz + camera.horizon + bankOffset);
        if (heightOnScreen < hiddenYBuffer[i]) {
          if (fogFactor > 0) {
            terrainColor = blendWithFog(terrainColor, fogFactor, weather.skyColor);
          }
          const yStart = Math.max(0, heightOnScreen);
          const yEnd = Math.min(screenHeight, hiddenYBuffer[i]);
          for (let y = yStart;y < yEnd; y++) {
            buf32[y * screenWidth + i] = terrainColor;
          }
          hiddenYBuffer[i] = heightOnScreen;
        }
        px += dx;
        py += dy;
      }
      dz += 0.005;
    }
  }

  // src/voxelvibe/render/sprites.ts
  var exports_sprites = {};
  __export(exports_sprites, {
    setScreenSize: () => setScreenSize,
    setCameraAngle: () => setCameraAngle,
    rgbToHex: () => rgbToHex,
    rgbToCss: () => rgbToCss,
    renderProjectiles: () => renderProjectiles,
    renderParticles: () => renderParticles,
    renderMissionMessage: () => renderMissionMessage,
    renderExplosions: () => renderExplosions,
    renderEnemyProjectiles: () => renderEnemyProjectiles,
    renderAchievementToasts: () => renderAchievementToasts,
    queueAchievementToast: () => queueAchievementToast,
    normalizeHexColor: () => normalizeHexColor,
    normalizeAngle: () => normalizeAngle2,
    lightenColor: () => lightenColor,
    isTargetOccluded: () => isTargetOccluded,
    isShadowOccluded: () => isShadowOccluded,
    isProjectileOccluded: () => isProjectileOccluded,
    init: () => init,
    hexToRgb: () => hexToRgb,
    getSpriteColorWithFog: () => getSpriteColorWithFog,
    getSpriteColor: () => getSpriteColor,
    getObjectiveProgressText: () => getObjectiveProgressText2,
    getLockedTargetForMissile: () => getLockedTargetForMissile,
    getDeltaZoomFactor: () => getDeltaZoomFactor,
    getDamagedBuildingColor: () => getDamagedBuildingColor,
    drawTransportPlane: () => drawTransportPlane,
    drawTank: () => drawTank,
    drawSoldier: () => drawSoldier,
    drawSAMSite: () => drawSAMSite,
    drawResupplyGlow: () => drawResupplyGlow,
    drawHelipad: () => drawHelipad,
    drawHelicopter: () => drawHelicopter,
    drawHangar: () => drawHangar,
    drawFuelDepot: () => drawFuelDepot,
    drawFriendlyAircraft: () => drawFriendlyAircraft,
    drawFighterJet: () => drawFighterJet,
    drawControlTower: () => drawControlTower,
    drawBuilding: () => drawBuilding,
    drawBarracks: () => drawBarracks,
    drawAttackHelicopter: () => drawAttackHelicopter,
    drawAircraftShadow: () => drawAircraftShadow,
    darkenColor: () => darkenColor,
    checkAllObjectivesComplete: () => checkAllObjectivesComplete,
    blendColors: () => blendColors,
    blendColorWithFog: () => blendColorWithFog,
    applyAmbientToHex: () => applyAmbientToHex,
    CONFIG: () => CONFIG
  });
  var _ctx;
  var _cameraAngle = 0;
  var _screenWidth = 800;
  var _screenHeight = 600;
  var _getTerrainHeight = () => 0;
  function init(ctx, getTerrainHeight2) {
    _ctx = ctx;
    _getTerrainHeight = getTerrainHeight2;
  }
  function setScreenSize(width, height) {
    _screenWidth = width;
    _screenHeight = height;
  }
  function setCameraAngle(angle) {
    _cameraAngle = angle;
  }
  var SHADOW_SUN_ANGLE = Math.PI * 0.35;
  function drawAircraftShadow(screenX, groundScreenY, size, alpha, camAngle = 0) {
    if (alpha <= 0 || size <= 0)
      return;
    const sunAngle = SHADOW_SUN_ANGLE - camAngle;
    const offsetX = Math.cos(sunAngle) * size * 0.6;
    const offsetY = Math.sin(sunAngle) * size * 0.35;
    _ctx.save();
    _ctx.globalAlpha = alpha;
    _ctx.fillStyle = "#000";
    _ctx.beginPath();
    _ctx.ellipse(screenX + offsetX, groundScreenY + offsetY, size * 0.9, size * 0.35, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
  }
  function normalizeHexColor(color) {
    if (!color)
      return "000000";
    let hex = color.replace("#", "").trim();
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    return hex.padEnd(6, "0").slice(0, 6);
  }
  function hexToRgb(color) {
    const hex = normalizeHexColor(color);
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }
  function rgbToHex(color) {
    const toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }
  function blendColors(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  function getDamagedBuildingColor(baseColor, healthPercent) {
    if (healthPercent >= 1)
      return baseColor;
    const damageFactor = 1 - healthPercent;
    return blendColors(baseColor, "#2a2a2a", damageFactor * 0.6);
  }
  function rgbToCss(color) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }
  function applyAmbientToHex(color, ambient) {
    const base = hexToRgb(color);
    return {
      r: Math.floor(base.r * ambient),
      g: Math.floor(base.g * ambient),
      b: Math.floor(base.b * ambient)
    };
  }
  function blendColorWithFog(color, factor, skyColor) {
    const skyR = skyColor & 255;
    const skyG = skyColor >> 8 & 255;
    const skyB = skyColor >> 16 & 255;
    return {
      r: Math.floor(color.r + (skyR - color.r) * factor),
      g: Math.floor(color.g + (skyG - color.g) * factor),
      b: Math.floor(color.b + (skyB - color.b) * factor)
    };
  }
  function getSpriteColor(baseColor, distance, weather, camDistance, fogEnabled) {
    let color = applyAmbientToHex(baseColor, weather.ambient);
    const fogStart = weather.fogStart;
    const fogEnd = Math.min(camDistance, fogStart + (camDistance - fogStart) / (weather.fogDensity || 2));
    const fogFactor = fogEnabled ? Math.min(1, Math.max(0, (distance - fogStart) / (fogEnd - fogStart))) : 0;
    if (fogFactor > 0) {
      color = blendColorWithFog(color, fogFactor, weather.skyColor);
    }
    return rgbToCss(color);
  }
  function getSpriteColorWithFog(baseColor, fogFactor, ambient, skyColor) {
    let color = applyAmbientToHex(baseColor, ambient);
    if (fogFactor > 0) {
      color = blendColorWithFog(color, fogFactor, skyColor);
    }
    return rgbToCss(color);
  }
  function drawSoldier(x, y, size, color, pose = "stand", fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 8);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const headW = Math.max(2, Math.floor(s * 0.18));
    const headH = Math.max(2, Math.floor(s * 0.16));
    const helmetH = Math.max(1, Math.floor(s * 0.06));
    const torsoW = Math.max(3, Math.floor(s * 0.26));
    const torsoH = Math.max(4, Math.floor(s * 0.32));
    const legW = Math.max(2, Math.floor(s * 0.1));
    const legH = Math.max(3, Math.floor(s * 0.28));
    const armW = Math.max(1, Math.floor(s * 0.08));
    const armH = Math.max(2, Math.floor(s * 0.22));
    const bootH = Math.max(1, Math.floor(s * 0.06));
    const packW = Math.max(2, Math.floor(s * 0.14));
    const packH = Math.max(2, Math.floor(s * 0.18));
    const helmetRadius = Math.max(2, Math.floor(headW * 0.65));
    const vestH = Math.max(2, Math.floor(torsoH * 0.45));
    const kneeH = Math.max(1, Math.floor(legH * 0.18));
    const bootToeH = Math.max(1, Math.floor(bootH * 0.5));
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const skin = getSpriteColorWithFog("#8a6a5a", fogFactor, ambient, skyColor);
    const gear = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const gearDark = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const boot = getSpriteColorWithFog("#3a3020", fogFactor, ambient, skyColor);
    const isCrouch = pose === "crouch";
    const isShoot = pose === "shoot";
    const crouchOffset = isCrouch ? Math.floor(s * 0.12) : 0;
    const legSpread = isCrouch ? Math.floor(s * 0.04) : Math.floor(s * 0.02);
    const bootY = iy - bootH + crouchOffset;
    const legY = bootY - legH + (isCrouch ? Math.floor(legH * 0.3) : 0);
    const torsoY = legY - torsoH + Math.floor(s * 0.04);
    const headY = torsoY - headH - helmetH + Math.floor(s * 0.02);
    const armY = torsoY + Math.floor(s * 0.02);
    const kneeY = legY + Math.floor(legH * 0.55);
    const vestY = torsoY + Math.floor(torsoH * 0.2);
    _ctx.fillStyle = boot;
    _ctx.fillRect(ix - legW - legSpread, bootY, legW + 1, bootH);
    _ctx.fillRect(ix + legSpread - 1, bootY, legW + 1, bootH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - legW - legSpread, bootY + bootH - bootToeH, legW + 1, bootToeH);
    _ctx.fillRect(ix + legSpread - 1, bootY + bootH - bootToeH, legW + 1, bootToeH);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - legW - legSpread, legY, legW, legH);
    _ctx.fillRect(ix + legSpread, legY, legW, legH);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - legW - legSpread, legY, Math.max(1, Math.floor(legW * 0.4)), legH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - legW - legSpread, kneeY, legW, kneeH);
    _ctx.fillRect(ix + legSpread, kneeY, legW, kneeH);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(torsoW / 2), torsoY, torsoW, torsoH);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2), torsoY, Math.max(1, Math.floor(torsoW * 0.25)), torsoH);
    _ctx.fillStyle = highlight;
    _ctx.fillRect(ix + Math.floor(torsoW / 2) - 1, torsoY, 1, torsoH);
    _ctx.fillStyle = gear;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) + 1, vestY, torsoW - 2, vestH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) + 1, vestY + Math.floor(vestH * 0.5), torsoW - 2, Math.max(1, Math.floor(vestH * 0.2)));
    _ctx.fillRect(ix - 1, vestY, 2, vestH);
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - packW + 1, torsoY + Math.floor(s * 0.04), packW, packH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - packW + 1, torsoY + Math.floor(s * 0.04), Math.max(1, Math.floor(packW * 0.3)), packH);
    const armOffsetY = isShoot ? -Math.floor(s * 0.06) : 0;
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - armW, armY + armOffsetY, armW, armH);
    _ctx.fillRect(ix + Math.floor(torsoW / 2), armY + armOffsetY, armW, armH);
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(ix, headY + helmetH, helmetRadius, Math.PI, 0);
    _ctx.lineTo(ix + helmetRadius, headY + helmetH + Math.floor(helmetH * 0.8));
    _ctx.lineTo(ix - helmetRadius, headY + helmetH + Math.floor(helmetH * 0.8));
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(headW / 2) - 1, headY + helmetH, headW + 2, Math.max(1, Math.floor(helmetH * 0.6)));
    _ctx.fillStyle = skin;
    _ctx.fillRect(ix - Math.floor(headW / 2), headY + helmetH, headW, headH);
    const weaponLen = Math.max(3, Math.floor(s * 0.4));
    const weaponH = Math.max(1, Math.floor(s * 0.05));
    const stockLen = Math.max(2, Math.floor(s * 0.12));
    const magH = Math.max(1, Math.floor(s * 0.08));
    if (isShoot) {
      const weaponX = ix + Math.floor(torsoW / 2) + armW - 1;
      const weaponY = armY + armOffsetY + Math.floor(armH * 0.3);
      _ctx.fillStyle = gear;
      _ctx.fillRect(weaponX, weaponY, weaponLen, weaponH);
      _ctx.fillStyle = gearDark;
      _ctx.fillRect(weaponX - stockLen, weaponY - 1, stockLen, weaponH + 2);
      _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.3), weaponY + weaponH, Math.max(1, Math.floor(s * 0.04)), magH);
      _ctx.fillRect(weaponX + weaponLen, weaponY - 1, Math.max(1, Math.floor(s * 0.03)), weaponH + 2);
    } else {
      const weaponX = ix + Math.floor(torsoW / 2);
      const weaponY = armY + Math.floor(armH * 0.5);
      _ctx.fillStyle = gear;
      _ctx.fillRect(weaponX, weaponY, Math.floor(weaponLen * 0.7), weaponH);
      _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.2), weaponY + weaponH, weaponH, Math.floor(weaponLen * 0.4));
      _ctx.fillStyle = gearDark;
      _ctx.fillRect(weaponX - Math.floor(stockLen * 0.5), weaponY - 1, Math.floor(stockLen * 0.6), weaponH + 2);
      _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.3), weaponY + weaponH, Math.max(1, Math.floor(s * 0.04)), magH);
      _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.7), weaponY - 1, Math.max(1, Math.floor(s * 0.03)), weaponH + 2);
    }
  }
  function drawHelicopter(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const belly = getSpriteColorWithFog(darkenColor(color, 55), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog("#1a4a5a", fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog("#3a7a9a", fogFactor, ambient, skyColor);
    const rotor = getSpriteColorWithFog("#3a3a3a", fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const weapon = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const weaponDark = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;
    {
      if (showFront) {
        _ctx.save();
        _ctx.translate(ix, iy);
        const fuseW = s * 0.3;
        const fuseH2 = s * 0.6;
        const shoulderW = s * 0.42;
        const wingSpan = s * 0.85;
        const rotorRadX2 = s * 0.8;
        const rotorRadY2 = s * 0.2;
        const rotorTime2 = performance.now() / 42;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.22;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 0.95, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.65;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.05));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.95 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.035, -fuseH2 * 0.78, s * 0.07, s * 0.2);
        _ctx.fillStyle = getSpriteColorWithFog("#2a3a3a", fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(0, -fuseH2 * 1.03, s * 0.1, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-shoulderW * 0.7, -fuseH2 * 0.55);
        _ctx.lineTo(shoulderW * 0.7, -fuseH2 * 0.55);
        _ctx.lineTo(fuseW * 1.1, -fuseH2 * 0.05);
        _ctx.lineTo(fuseW * 0.9, fuseH2 * 0.52);
        _ctx.lineTo(-fuseW * 0.9, fuseH2 * 0.52);
        _ctx.lineTo(-fuseW * 1.1, -fuseH2 * 0.05);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = belly;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.7, fuseH2 * 0.05);
        _ctx.lineTo(fuseW * 0.7, fuseH2 * 0.05);
        _ctx.lineTo(fuseW * 0.55, fuseH2 * 0.55);
        _ctx.lineTo(-fuseW * 0.55, fuseH2 * 0.55);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.4, -fuseH2 * 0.35);
        _ctx.lineTo(fuseW * 0.4, -fuseH2 * 0.35);
        _ctx.lineTo(fuseW * 0.32, fuseH2 * 0.05);
        _ctx.lineTo(-fuseW * 0.32, fuseH2 * 0.05);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glassHighlight;
        _ctx.fillRect(-fuseW * 0.28, -fuseH2 * 0.28, fuseW * 0.2, s * 0.08);
        _ctx.fillRect(fuseW * 0.08, -fuseH2 * 0.28, fuseW * 0.2, s * 0.08);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-wingSpan * 0.45, -fuseH2 * 0.02, wingSpan * 0.3, s * 0.08);
        _ctx.fillRect(fuseW + s * 0.02, -fuseH2 * 0.02, wingSpan * 0.3, s * 0.08);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.52, s * 0.08, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = exhaust;
        _ctx.fillRect(-s * 0.02, fuseH2 * 0.52, s * 0.04, s * 0.12);
        const wheelR2 = Math.max(1, Math.floor(s * 0.06));
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.05, fuseH2 * 0.3, s * 0.05, s * 0.18);
        _ctx.fillRect(fuseW, fuseH2 * 0.3, s * 0.05, s * 0.18);
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(-fuseW - s * 0.06, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
        _ctx.arc(fuseW + s * 0.03, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.restore();
        return;
      }
      if (showBack) {
        _ctx.save();
        _ctx.translate(ix, iy);
        const fuseW = s * 0.3;
        const fuseH2 = s * 0.6;
        const wingSpan = s * 0.85;
        const rotorRadX2 = s * 0.8;
        const rotorRadY2 = s * 0.2;
        const rotorTime2 = performance.now() / 42;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.22;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 0.95, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.65;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.05));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.95 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.035, -fuseH2 * 0.78, s * 0.07, s * 0.2);
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.95, -fuseH2 * 0.55);
        _ctx.lineTo(fuseW * 0.95, -fuseH2 * 0.55);
        _ctx.lineTo(fuseW * 0.85, fuseH2 * 0.52);
        _ctx.lineTo(-fuseW * 0.85, fuseH2 * 0.52);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = belly;
        _ctx.fillRect(-fuseW * 0.65, fuseH2 * 0.05, fuseW * 1.3, fuseH2 * 0.45);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-wingSpan * 0.45, -fuseH2 * 0.02, wingSpan * 0.3, s * 0.08);
        _ctx.fillRect(fuseW + s * 0.02, -fuseH2 * 0.02, wingSpan * 0.3, s * 0.08);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.05, fuseH2 * 0.35, s * 0.1, s * 0.35);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH2 * 0.5);
        _ctx.lineTo(-s * 0.14, fuseH2 * 0.88);
        _ctx.lineTo(s * 0.14, fuseH2 * 0.88);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.32, fuseH2 * 0.7, s * 0.64, s * 0.06);
        const fenRadBack = s * 0.15;
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.74, fenRadBack * 1.18, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.74, fenRadBack * 0.82, 0, Math.PI * 2);
        _ctx.fill();
        const fenTimeBack = performance.now() / 18;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.015);
        for (let i = 0;i < 8; i++) {
          const fAngle = fenTimeBack + i * (Math.PI / 4);
          _ctx.beginPath();
          _ctx.moveTo(0, fuseH2 * 0.74);
          _ctx.lineTo(Math.cos(fAngle) * fenRadBack * 0.7, fuseH2 * 0.74 + Math.sin(fAngle) * fenRadBack * 0.7);
          _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.74, fenRadBack * 0.18, 0, Math.PI * 2);
        _ctx.fill();
        const wheelR2 = Math.max(1, Math.floor(s * 0.06));
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.08, fuseH2 * 0.12, s * 0.06, s * 0.35);
        _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.12, s * 0.06, s * 0.35);
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(-fuseW - s * 0.06, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
        _ctx.arc(fuseW + s * 0.05, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.restore();
        return;
      }
      if (showSide) {
        _ctx.save();
        _ctx.translate(ix, iy);
        _ctx.scale(dir, 1);
        const fuseLen2 = s * 1.7;
        const fuseH2 = s * 0.24;
        const tailLen2 = s * 1.05;
        const tailH2 = s * 0.08;
        const tailRise = s * 0.1;
        const finH2 = s * 0.3;
        const skidStrut2 = Math.max(1, Math.floor(s * 0.03));
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.35, -tailH2 * 0.4 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35 - tailLen2, -tailH2 * 0.2 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35 - tailLen2, tailH2 * 0.3 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35, tailH2 * 0.5 - tailRise);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.35 - tailLen2 + s * 0.1, -tailH2 * 0.2 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35 - tailLen2 - s * 0.02, -finH2 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35 - tailLen2 - s * 0.12, -finH2 - tailRise);
        _ctx.lineTo(-fuseLen2 * 0.35 - tailLen2 - s * 0.04, -tailH2 * 0.2 - tailRise);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseLen2 * 0.35 - tailLen2 - s * 0.04, -tailRise, s * 0.26, s * 0.05);
        const fenestronRadius2 = s * 0.16;
        const fenestronX2 = -fuseLen2 * 0.35 - tailLen2 - s * 0.02;
        const fenestronY2 = -finH2 + s * 0.12 - tailRise;
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.arc(fenestronX2, fenestronY2, fenestronRadius2 * 1.22, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.arc(fenestronX2, fenestronY2, fenestronRadius2 * 0.85, 0, Math.PI * 2);
        _ctx.fill();
        const fenTime2 = performance.now() / 18;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.02);
        for (let i = 0;i < 8; i++) {
          const fAngle = fenTime2 + i * (Math.PI / 4);
          _ctx.beginPath();
          _ctx.moveTo(fenestronX2, fenestronY2);
          _ctx.lineTo(fenestronX2 + Math.cos(fAngle) * fenestronRadius2 * 0.75, fenestronY2 + Math.sin(fAngle) * fenestronRadius2 * 0.75);
          _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(fenestronX2, fenestronY2, fenestronRadius2 * 0.22, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.45, -fuseH2 * 0.2);
        _ctx.lineTo(fuseLen2 * 0.55, 0);
        _ctx.lineTo(fuseLen2 * 0.45, fuseH2 * 0.35);
        _ctx.lineTo(-fuseLen2 * 0.35, fuseH2 * 0.5);
        _ctx.lineTo(-fuseLen2 * 0.35, -fuseH2 * 0.4);
        _ctx.lineTo(fuseLen2 * 0.2, -fuseH2 * 0.55);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = belly;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.35, fuseH2 * 0.15);
        _ctx.lineTo(-fuseLen2 * 0.35, fuseH2 * 0.5);
        _ctx.lineTo(-fuseLen2 * 0.35, fuseH2 * 0.28);
        _ctx.lineTo(fuseLen2 * 0.3, fuseH2 * 0.1);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.35, -fuseH2 * 0.25);
        _ctx.lineTo(fuseLen2 * 0.15, -fuseH2 * 0.55);
        _ctx.lineTo(-fuseLen2 * 0.2, -fuseH2 * 0.42);
        _ctx.lineTo(-fuseLen2 * 0.05, -fuseH2 * 0.22);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.38, -fuseH2 * 0.18);
        _ctx.lineTo(fuseLen2 * 0.48, fuseH2 * 0.02);
        _ctx.lineTo(fuseLen2 * 0.34, fuseH2 * 0.24);
        _ctx.lineTo(fuseLen2 * 0.1, fuseH2 * 0.2);
        _ctx.lineTo(fuseLen2 * 0.08, -fuseH2 * 0.22);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.36, -fuseH2 * 0.12);
        _ctx.lineTo(fuseLen2 * 0.42, fuseH2 * 0.02);
        _ctx.lineTo(fuseLen2 * 0.28, fuseH2 * 0.06);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = getSpriteColorWithFog("#2a3a3a", fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(0, -fuseH2 * 0.95, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.05, -fuseH2 * 0.05);
        _ctx.lineTo(fuseLen2 * 0.05 - s * 0.45, -fuseH2 * 0.18);
        _ctx.lineTo(fuseLen2 * 0.05 - s * 0.45, fuseH2 * 0.02);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.fillRect(fuseLen2 * 0.05 - s * 0.4, fuseH2 * 0.04, s * 0.18, s * 0.08);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.arc(fuseLen2 * 0.35, fuseH2 * 0.35, s * 0.08, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = exhaust;
        _ctx.fillRect(fuseLen2 * 0.35, fuseH2 * 0.32, s * 0.16, s * 0.04);
        const wheelR2 = Math.max(1, Math.floor(s * 0.06));
        _ctx.fillStyle = darker;
        _ctx.fillRect(fuseLen2 * 0.15, fuseH2 * 0.42, skidStrut2, s * 0.16);
        _ctx.fillRect(-fuseLen2 * 0.12, fuseH2 * 0.42, skidStrut2, s * 0.16);
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(fuseLen2 * 0.2, fuseH2 * 0.6, wheelR2, 0, Math.PI * 2);
        _ctx.arc(-fuseLen2 * 0.08, fuseH2 * 0.6, wheelR2, 0, Math.PI * 2);
        _ctx.fill();
        const rotorTime2 = performance.now() / 42;
        const rotorRadX2 = fuseLen2 * 0.75;
        const rotorRadY2 = fuseLen2 * 0.22;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 0.72, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.7;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.06));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.72 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.04, -fuseH2 * 0.84, s * 0.08, s * 0.14);
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(0, -fuseH2 * 0.86, s * 0.05, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.restore();
        return;
      }
    }
    {
      if (showFront) {
        _ctx.save();
        _ctx.translate(ix, iy);
        const fuseW = s * 0.5;
        const fuseH2 = s * 0.45;
        const rotorRadX2 = s * 0.9;
        const rotorRadY2 = s * 0.3;
        const rotorTime2 = performance.now() / 36;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 1.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.7;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.08));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 1.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.06, -fuseH2 * 1.7, s * 0.12, s * 0.35);
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 1.1, -fuseH2 * 0.2);
        _ctx.lineTo(-fuseW * 0.8, -fuseH2 * 1.05);
        _ctx.lineTo(fuseW * 0.8, -fuseH2 * 1.05);
        _ctx.lineTo(fuseW * 1.1, -fuseH2 * 0.2);
        _ctx.lineTo(fuseW * 0.9, fuseH2 * 0.55);
        _ctx.lineTo(-fuseW * 0.9, fuseH2 * 0.55);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.25, -fuseH2 * 0.1);
        _ctx.lineTo(0, fuseH2 * 0.1);
        _ctx.lineTo(fuseW * 0.25, -fuseH2 * 0.1);
        _ctx.lineTo(0, -fuseH2 * 0.3);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.22, -fuseH2 * 0.55);
        _ctx.lineTo(fuseW * 0.22, -fuseH2 * 0.55);
        _ctx.lineTo(fuseW * 0.18, -fuseH2 * 0.25);
        _ctx.lineTo(-fuseW * 0.18, -fuseH2 * 0.25);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glassHighlight;
        _ctx.fillRect(-fuseW * 0.14, -fuseH2 * 0.5, fuseW * 0.12, s * 0.08);
        _ctx.fillStyle = weapon;
        _ctx.fillRect(-fuseW - s * 0.08, -fuseH2 * 0.8, s * 0.12, s * 0.3);
        _ctx.fillRect(fuseW - s * 0.04, -fuseH2 * 0.8, s * 0.12, s * 0.3);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseW - s * 0.45, -fuseH2 * 0.18, s * 0.45, s * 0.12);
        _ctx.fillRect(fuseW, -fuseH2 * 0.18, s * 0.45, s * 0.12);
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(-fuseW - s * 0.4, -fuseH2 * 0.38, s * 0.18, s * 0.28);
        _ctx.fillRect(fuseW + s * 0.22, -fuseH2 * 0.38, s * 0.18, s * 0.28);
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.58, s * 0.16, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(-s * 0.05, fuseH2 * 0.7, s * 0.04, s * 0.12);
        _ctx.fillRect(s * 0.01, fuseH2 * 0.7, s * 0.04, s * 0.12);
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.12, fuseH2 * 0.25, s * 0.1, s * 0.5);
        _ctx.fillRect(-fuseW - s * 0.18, fuseH2 * 0.7, s * 0.24, s * 0.06);
        _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.25, s * 0.1, s * 0.5);
        _ctx.fillRect(fuseW - s * 0.06, fuseH2 * 0.7, s * 0.24, s * 0.06);
        _ctx.restore();
        return;
      }
      if (showBack) {
        _ctx.save();
        _ctx.translate(ix, iy);
        const fuseW = s * 0.5;
        const fuseH2 = s * 0.45;
        const rotorRadX2 = s * 0.9;
        const rotorRadY2 = s * 0.3;
        const rotorTime2 = performance.now() / 36;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 1.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.7;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.08));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 1.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.06, -fuseH2 * 1.7, s * 0.12, s * 0.35);
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.95, -fuseH2 * 0.3);
        _ctx.lineTo(-fuseW * 0.7, -fuseH2);
        _ctx.lineTo(fuseW * 0.7, -fuseH2);
        _ctx.lineTo(fuseW * 0.95, -fuseH2 * 0.3);
        _ctx.lineTo(fuseW * 0.85, fuseH2 * 0.45);
        _ctx.lineTo(-fuseW * 0.85, fuseH2 * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(-fuseW * 0.55, -fuseH2 * 0.55, s * 0.18, s * 0.12);
        _ctx.fillRect(fuseW * 0.37, -fuseH2 * 0.55, s * 0.18, s * 0.12);
        _ctx.fillStyle = getSpriteColorWithFog("#4a3a2f", fogFactor, ambient, skyColor);
        _ctx.fillRect(-fuseW * 0.5, -fuseH2 * 0.52, s * 0.08, s * 0.06);
        _ctx.fillRect(fuseW * 0.42, -fuseH2 * 0.52, s * 0.08, s * 0.06);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseW - s * 0.4, -fuseH2 * 0.15, s * 0.4, s * 0.1);
        _ctx.fillRect(fuseW, -fuseH2 * 0.15, s * 0.4, s * 0.1);
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.08, fuseH2 * 0.2, s * 0.16, s * 0.6);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH2 * 0.5);
        _ctx.lineTo(-s * 0.17, fuseH2 * 0.95);
        _ctx.lineTo(s * 0.17, fuseH2 * 0.95);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.38, fuseH2 * 0.7, s * 0.76, s * 0.08);
        const fenRadBack = s * 0.16;
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.73, fenRadBack * 1.25, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.73, fenRadBack * 0.85, 0, Math.PI * 2);
        _ctx.fill();
        const fenTimeBack = performance.now() / 14;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.02);
        for (let i = 0;i < 8; i++) {
          const fAngle = fenTimeBack + i * (Math.PI / 4);
          _ctx.beginPath();
          _ctx.moveTo(0, fuseH2 * 0.73);
          _ctx.lineTo(Math.cos(fAngle) * fenRadBack * 0.72, fuseH2 * 0.73 + Math.sin(fAngle) * fenRadBack * 0.72);
          _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        _ctx.fillStyle = weaponDark;
        _ctx.beginPath();
        _ctx.arc(0, fuseH2 * 0.73, fenRadBack * 0.2, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.12, fuseH2 * 0.12, s * 0.1, s * 0.45);
        _ctx.fillRect(-fuseW - s * 0.2, fuseH2 * 0.52, s * 0.26, s * 0.07);
        _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.12, s * 0.1, s * 0.45);
        _ctx.fillRect(fuseW - s * 0.06, fuseH2 * 0.52, s * 0.26, s * 0.07);
        _ctx.restore();
        return;
      }
      if (showSide) {
        _ctx.save();
        _ctx.translate(ix, iy);
        _ctx.scale(dir, 1);
        const fuseLen2 = s * 1.6;
        const fuseH2 = s * 0.35;
        const tailLen2 = s * 1.05;
        const tailH2 = s * 0.12;
        const finH2 = s * 0.32;
        const wingSpan = s * 0.6;
        const skidH2 = Math.max(1, Math.floor(s * 0.05));
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.32, -tailH2 * 0.7);
        _ctx.lineTo(-fuseLen2 * 0.32 - tailLen2, -tailH2 * 0.35);
        _ctx.lineTo(-fuseLen2 * 0.32 - tailLen2, tailH2 * 0.35);
        _ctx.lineTo(-fuseLen2 * 0.32, tailH2 * 0.7);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.32 - tailLen2 + s * 0.12, -tailH2 * 0.35);
        _ctx.lineTo(-fuseLen2 * 0.32 - tailLen2 - s * 0.02, -finH2);
        _ctx.lineTo(-fuseLen2 * 0.32 - tailLen2 - s * 0.16, -finH2);
        _ctx.lineTo(-fuseLen2 * 0.32 - tailLen2 - s * 0.06, -tailH2 * 0.35);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseLen2 * 0.32 - tailLen2 - s * 0.08, -s * 0.04, s * 0.3, s * 0.08);
        const enemyFenRadius = s * 0.16;
        const enemyFenX = -fuseLen2 * 0.32 - tailLen2 - s * 0.02;
        const enemyFenY = -finH2 + s * 0.12;
        _ctx.fillStyle = weaponDark;
        _ctx.beginPath();
        _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 1.25, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.85, 0, Math.PI * 2);
        _ctx.fill();
        const enemyFenTime = performance.now() / 14;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.025);
        for (let i = 0;i < 8; i++) {
          const fAngle = enemyFenTime + i * (Math.PI / 4);
          _ctx.beginPath();
          _ctx.moveTo(enemyFenX, enemyFenY);
          _ctx.lineTo(enemyFenX + Math.cos(fAngle) * enemyFenRadius * 0.75, enemyFenY + Math.sin(fAngle) * enemyFenRadius * 0.75);
          _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        _ctx.fillStyle = weaponDark;
        _ctx.beginPath();
        _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.22, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.48, -fuseH2 * 0.08);
        _ctx.lineTo(fuseLen2 * 0.58, fuseH2 * 0.22);
        _ctx.lineTo(fuseLen2 * 0.46, fuseH2 * 0.55);
        _ctx.lineTo(-fuseLen2 * 0.32, fuseH2 * 0.6);
        _ctx.lineTo(-fuseLen2 * 0.35, -fuseH2 * 0.42);
        _ctx.lineTo(fuseLen2 * 0.08, -fuseH2 * 0.6);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.1, -fuseH2 * 0.25);
        _ctx.lineTo(fuseLen2 * 0.32, -fuseH2 * 0.25);
        _ctx.lineTo(fuseLen2 * 0.26, -fuseH2 * 0.45);
        _ctx.lineTo(fuseLen2 * 0.06, -fuseH2 * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.4, fuseH2 * 0.4);
        _ctx.lineTo(-fuseLen2 * 0.32, fuseH2 * 0.6);
        _ctx.lineTo(-fuseLen2 * 0.32, fuseH2 * 0.35);
        _ctx.lineTo(fuseLen2 * 0.34, fuseH2 * 0.25);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseLen2 * 0.22, -fuseH2 * 0.7, s * 0.32, s * 0.14);
        _ctx.fillRect(-fuseLen2 * 0.3, -fuseH2 * 0.18, s * 0.14, s * 0.1);
        _ctx.fillRect(-fuseLen2 * 0.3, fuseH2 * 0.05, s * 0.14, s * 0.1);
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.05, -fuseH2 * 0.18);
        _ctx.lineTo(-fuseLen2 * 0.05 - wingSpan, -fuseH2 * 0.28);
        _ctx.lineTo(-fuseLen2 * 0.05 - wingSpan, -fuseH2 * 0.1);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen2 * 0.05, fuseH2 * 0.22);
        _ctx.lineTo(-fuseLen2 * 0.05 - wingSpan, fuseH2 * 0.32);
        _ctx.lineTo(-fuseLen2 * 0.05 - wingSpan, fuseH2 * 0.14);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = weapon;
        _ctx.fillRect(-fuseLen2 * 0.05 - wingSpan * 0.7, -fuseH2 * 0.35, s * 0.24, s * 0.14);
        _ctx.fillRect(-fuseLen2 * 0.05 - wingSpan * 0.7, fuseH2 * 0.28, s * 0.26, s * 0.1);
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(-fuseLen2 * 0.05 - wingSpan * 0.62, fuseH2 * 0.36, s * 0.14, s * 0.04);
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.38, -fuseH2 * 0.1);
        _ctx.lineTo(fuseLen2 * 0.46, fuseH2 * 0.12);
        _ctx.lineTo(fuseLen2 * 0.32, fuseH2 * 0.32);
        _ctx.lineTo(fuseLen2 * 0.18, fuseH2 * 0.26);
        _ctx.lineTo(fuseLen2 * 0.16, -fuseH2 * 0.12);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen2 * 0.36, 0);
        _ctx.lineTo(fuseLen2 * 0.4, fuseH2 * 0.12);
        _ctx.lineTo(fuseLen2 * 0.3, fuseH2 * 0.16);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(fuseLen2 * 0.38, fuseH2 * 0.48, s * 0.12, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(fuseLen2 * 0.38, fuseH2 * 0.44, s * 0.24, s * 0.06);
        _ctx.fillRect(fuseLen2 * 0.6, fuseH2 * 0.42, s * 0.04, s * 0.1);
        _ctx.fillStyle = darker;
        _ctx.fillRect(fuseLen2 * 0.12, fuseH2 * 0.48, Math.max(1, s * 0.03), s * 0.2);
        _ctx.fillRect(-fuseLen2 * 0.18, fuseH2 * 0.48, Math.max(1, s * 0.03), s * 0.2);
        _ctx.fillRect(-fuseLen2 * 0.26, fuseH2 * 0.66, fuseLen2 * 0.5, skidH2);
        const rotorTime2 = performance.now() / 36;
        const rotorRadX2 = fuseLen2 * 0.75;
        const rotorRadY2 = fuseLen2 * 0.24;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH2 * 0.78, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 0.7;
        for (let i = 0;i < 4; i++) {
          const angle = rotorTime2 + i * (Math.PI / 2);
          const bx = Math.cos(angle) * rotorRadX2;
          const by = Math.sin(angle) * rotorRadY2;
          const bladeW = Math.max(2, Math.floor(s * 0.07));
          _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.78 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1;
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.05, -fuseH2 * 0.9, s * 0.1, s * 0.16);
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(0, -fuseH2 * 0.92, s * 0.06, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.restore();
        return;
      }
    }
    {
      if (showFront) {
        const wingSpan = s * 1.15;
        const fuseH3 = s * 0.75;
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH3 * 0.55);
        _ctx.lineTo(ix - wingSpan, iy + fuseH3 * 0.1);
        _ctx.lineTo(ix - wingSpan * 0.2, iy + fuseH3 * 0.5);
        _ctx.lineTo(ix + wingSpan * 0.2, iy + fuseH3 * 0.5);
        _ctx.lineTo(ix + wingSpan, iy + fuseH3 * 0.1);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = highlight;
        _ctx.fillRect(ix - s * 0.1, iy - fuseH3 * 0.35, s * 0.2, fuseH3 * 0.7);
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - wingSpan * 0.55, iy + fuseH3 * 0.05, s * 0.22, s * 0.1);
        _ctx.fillRect(ix + wingSpan * 0.33, iy + fuseH3 * 0.05, s * 0.22, s * 0.1);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix - s * 0.2, iy + fuseH3 * 0.1);
        _ctx.lineTo(ix - s * 0.3, iy + fuseH3 * 0.45);
        _ctx.lineTo(ix - s * 0.08, iy + fuseH3 * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(ix + s * 0.2, iy + fuseH3 * 0.1);
        _ctx.lineTo(ix + s * 0.3, iy + fuseH3 * 0.45);
        _ctx.lineTo(ix + s * 0.08, iy + fuseH3 * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = glass;
        _ctx.fillRect(ix - s * 0.08, iy - fuseH3 * 0.3, s * 0.16, s * 0.18);
        _ctx.fillStyle = glassHighlight;
        _ctx.fillRect(ix - s * 0.06, iy - fuseH3 * 0.26, s * 0.06, s * 0.08);
        return;
      }
      if (showBack) {
        const wingSpan = s * 1.15;
        const fuseH3 = s * 0.75;
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH3 * 0.55);
        _ctx.lineTo(ix - wingSpan, iy + fuseH3 * 0.1);
        _ctx.lineTo(ix - wingSpan * 0.2, iy + fuseH3 * 0.5);
        _ctx.lineTo(ix + wingSpan * 0.2, iy + fuseH3 * 0.5);
        _ctx.lineTo(ix + wingSpan, iy + fuseH3 * 0.1);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.1, iy - fuseH3 * 0.35, s * 0.2, fuseH3 * 0.7);
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy + fuseH3 * 0.15);
        _ctx.lineTo(ix - s * 0.12, iy + fuseH3 * 0.5);
        _ctx.lineTo(ix + s * 0.12, iy + fuseH3 * 0.5);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.1, iy + fuseH3 * 0.38, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.1, iy + fuseH3 * 0.38, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = exhaustGlow;
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.1, iy + fuseH3 * 0.4, s * 0.04, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.1, iy + fuseH3 * 0.4, s * 0.04, 0, Math.PI * 2);
        _ctx.fill();
        return;
      }
      _ctx.save();
      _ctx.translate(ix, iy);
      _ctx.scale(dir, 1);
      const fuseLen2 = s * 1.85;
      const fuseH2 = s * 0.22;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen2 * 0.55, 0);
      _ctx.lineTo(fuseLen2 * 0.35, -fuseH2 * 0.9);
      _ctx.lineTo(-fuseLen2 * 0.35, -fuseH2 * 0.7);
      _ctx.lineTo(-fuseLen2 * 0.52, 0);
      _ctx.lineTo(-fuseLen2 * 0.35, fuseH2 * 0.7);
      _ctx.lineTo(fuseLen2 * 0.35, fuseH2 * 0.9);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-fuseLen2 * 0.1, -s * 0.55, s * 0.6, s * 0.12);
      _ctx.fillRect(-fuseLen2 * 0.1, s * 0.43, s * 0.6, s * 0.12);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseLen2 * 0.4, -s * 0.35, s * 0.18, s * 0.16);
      _ctx.fillRect(-fuseLen2 * 0.4, s * 0.19, s * 0.18, s * 0.16);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(-fuseLen2 * 0.35, 0);
      _ctx.lineTo(-fuseLen2 * 0.52, -s * 0.42);
      _ctx.lineTo(-fuseLen2 * 0.52, 0);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = glass;
      _ctx.beginPath();
      _ctx.ellipse(fuseLen2 * 0.28, 0, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = glassHighlight;
      _ctx.beginPath();
      _ctx.ellipse(fuseLen2 * 0.3, -s * 0.02, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseLen2 * 0.18, -s * 0.45, s * 0.18, s * 0.06);
      _ctx.fillRect(-fuseLen2 * 0.18, s * 0.39, s * 0.18, s * 0.06);
      _ctx.fillStyle = exhaustGlow;
      _ctx.globalAlpha = 0.6;
      _ctx.beginPath();
      _ctx.ellipse(-fuseLen2 * 0.54, 0, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 1;
      _ctx.restore();
      return;
    }
    if (showFront) {
      _ctx.save();
      _ctx.translate(ix, iy);
      const fuseW = s * 0.28;
      const fuseH2 = s * 0.55;
      const wingSpan = s * 0.9;
      const rotorRadX2 = s * 0.75;
      const rotorRadY2 = s * 0.2;
      const rotorTime2 = performance.now() / 40;
      _ctx.fillStyle = rotor;
      _ctx.globalAlpha = 0.2;
      _ctx.beginPath();
      _ctx.ellipse(0, -fuseH2 * 0.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 0.6;
      for (let i = 0;i < 4; i++) {
        const angle = rotorTime2 + i * Math.PI / 2;
        const bx = Math.cos(angle) * rotorRadX2;
        const by = Math.sin(angle) * rotorRadY2;
        const bladeW = Math.max(2, Math.floor(s * 0.05));
        _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.9 + by - 1, bladeW, 2);
      }
      _ctx.globalAlpha = 1;
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.03, -fuseH2 * 0.75, s * 0.06, s * 0.18);
      _ctx.fillStyle = getSpriteColorWithFog("#2a3a3a", fogFactor, ambient, skyColor);
      _ctx.beginPath();
      _ctx.arc(0, -fuseH2 * 1, s * 0.09, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = getSpriteColorWithFog("#1a2a2a", fogFactor, ambient, skyColor);
      _ctx.beginPath();
      _ctx.arc(0, -fuseH2 * 0.98, s * 0.045, Math.PI * 0.8, Math.PI * 2.2);
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-fuseW - s * 0.12, -fuseH2 * 0.45, s * 0.14, s * 0.22);
      _ctx.fillRect(fuseW - s * 0.02, -fuseH2 * 0.45, s * 0.14, s * 0.22);
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW, -fuseH2 * 0.5);
      _ctx.lineTo(fuseW, -fuseH2 * 0.5);
      _ctx.lineTo(fuseW * 1.1, fuseH2 * 0.1);
      _ctx.lineTo(fuseW * 0.7, fuseH2 * 0.5);
      _ctx.lineTo(-fuseW * 0.7, fuseH2 * 0.5);
      _ctx.lineTo(-fuseW * 1.1, fuseH2 * 0.1);
      _ctx.closePath();
      _ctx.fill();
      _ctx.strokeStyle = darker;
      _ctx.lineWidth = Math.max(1, Math.floor(s * 0.02));
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.7, -fuseH2 * 0.2);
      _ctx.lineTo(fuseW * 0.7, -fuseH2 * 0.25);
      _ctx.stroke();
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.6, fuseH2 * 0.2);
      _ctx.lineTo(fuseW * 0.6, fuseH2 * 0.18);
      _ctx.stroke();
      _ctx.lineWidth = 1;
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(0, -fuseH2 * 0.5);
      _ctx.lineTo(s * 0.03, fuseH2 * 0.3);
      _ctx.lineTo(-s * 0.03, fuseH2 * 0.3);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = glass;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.5, -fuseH2 * 0.35);
      _ctx.lineTo(fuseW * 0.5, -fuseH2 * 0.35);
      _ctx.lineTo(fuseW * 0.4, fuseH2 * 0.15);
      _ctx.lineTo(-fuseW * 0.4, fuseH2 * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW * 0.45, -fuseH2 * 0.12, fuseW * 0.9, s * 0.02);
      _ctx.fillStyle = glassHighlight;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.35, -fuseH2 * 0.3);
      _ctx.lineTo(0, -fuseH2 * 0.3);
      _ctx.lineTo(-fuseW * 0.1, -fuseH2 * 0.15);
      _ctx.lineTo(-fuseW * 0.35, -fuseH2 * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.beginPath();
      _ctx.moveTo(fuseW * 0.1, -fuseH2 * 0.28);
      _ctx.lineTo(fuseW * 0.35, -fuseH2 * 0.2);
      _ctx.lineTo(fuseW * 0.2, -fuseH2 * 0.1);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-wingSpan * 0.5, -fuseH2 * 0.05, wingSpan * 0.35, s * 0.08);
      _ctx.fillRect(fuseW + s * 0.02, -fuseH2 * 0.05, wingSpan * 0.35, s * 0.08);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-wingSpan * 0.45, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(-wingSpan * 0.32, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(wingSpan * 0.26, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(wingSpan * 0.39, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(-s * 0.08, fuseH2 * 0.35);
      _ctx.lineTo(s * 0.08, fuseH2 * 0.35);
      _ctx.lineTo(s * 0.05, fuseH2 * 0.55);
      _ctx.lineTo(-s * 0.05, fuseH2 * 0.55);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = exhaust;
      _ctx.fillRect(-s * 0.02, fuseH2 * 0.5, s * 0.04, s * 0.12);
      const wheelR2 = Math.max(1, Math.floor(s * 0.06));
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW - s * 0.04, fuseH2 * 0.3, s * 0.04, s * 0.16);
      _ctx.fillRect(fuseW, fuseH2 * 0.3, s * 0.04, s * 0.16);
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.arc(-fuseW - s * 0.05, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
      _ctx.arc(fuseW + s * 0.02, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.restore();
      return;
    }
    if (showBack) {
      _ctx.save();
      _ctx.translate(ix, iy);
      const fuseW = s * 0.28;
      const fuseH2 = s * 0.55;
      const wingSpan = s * 0.9;
      const rotorRadX2 = s * 0.75;
      const rotorRadY2 = s * 0.2;
      const rotorTime2 = performance.now() / 40;
      _ctx.fillStyle = rotor;
      _ctx.globalAlpha = 0.2;
      _ctx.beginPath();
      _ctx.ellipse(0, -fuseH2 * 0.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 0.6;
      for (let i = 0;i < 4; i++) {
        const angle = rotorTime2 + i * Math.PI / 2;
        const bx = Math.cos(angle) * rotorRadX2;
        const by = Math.sin(angle) * rotorRadY2;
        const bladeW = Math.max(2, Math.floor(s * 0.05));
        _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 0.9 + by - 1, bladeW, 2);
      }
      _ctx.globalAlpha = 1;
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.03, -fuseH2 * 0.75, s * 0.06, s * 0.18);
      _ctx.fillStyle = dark;
      _ctx.fillRect(-fuseW - s * 0.12, -fuseH2 * 0.45, s * 0.14, s * 0.22);
      _ctx.fillRect(fuseW - s * 0.02, -fuseH2 * 0.45, s * 0.14, s * 0.22);
      _ctx.fillStyle = exhaust;
      _ctx.fillRect(-fuseW - s * 0.1, -fuseH2 * 0.35, s * 0.1, s * 0.12);
      _ctx.fillRect(fuseW, -fuseH2 * 0.35, s * 0.1, s * 0.12);
      _ctx.fillStyle = getSpriteColorWithFog("#5a4a3a", fogFactor, ambient, skyColor);
      _ctx.fillRect(-fuseW - s * 0.08, -fuseH2 * 0.32, s * 0.06, s * 0.06);
      _ctx.fillRect(fuseW + s * 0.02, -fuseH2 * 0.32, s * 0.06, s * 0.06);
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW, -fuseH2 * 0.5);
      _ctx.lineTo(fuseW, -fuseH2 * 0.5);
      _ctx.lineTo(fuseW * 1.1, fuseH2 * 0.1);
      _ctx.lineTo(fuseW * 0.7, fuseH2 * 0.5);
      _ctx.lineTo(-fuseW * 0.7, fuseH2 * 0.5);
      _ctx.lineTo(-fuseW * 1.1, fuseH2 * 0.1);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW * 0.6, -fuseH2 * 0.4, fuseW * 1.2, s * 0.04);
      _ctx.fillRect(-fuseW * 0.5, fuseH2 * 0.1, fuseW * 1, s * 0.03);
      _ctx.fillStyle = dark;
      _ctx.fillRect(-wingSpan * 0.5, -fuseH2 * 0.05, wingSpan * 0.35, s * 0.08);
      _ctx.fillRect(fuseW + s * 0.02, -fuseH2 * 0.05, wingSpan * 0.35, s * 0.08);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-wingSpan * 0.45, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(-wingSpan * 0.32, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(wingSpan * 0.26, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillRect(wingSpan * 0.39, s * 0.02, s * 0.06, s * 0.15);
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.05, fuseH2 * 0.35, s * 0.1, s * 0.35);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(0, fuseH2 * 0.5);
      _ctx.lineTo(-s * 0.12, fuseH2 * 0.85);
      _ctx.lineTo(s * 0.12, fuseH2 * 0.85);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.28, fuseH2 * 0.68, s * 0.56, s * 0.05);
      const fenRadBack = s * 0.12;
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.72, fenRadBack * 1.15, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.72, fenRadBack * 0.8, 0, Math.PI * 2);
      _ctx.fill();
      const fenTimeBack = performance.now() / 20;
      _ctx.strokeStyle = rotor;
      _ctx.lineWidth = Math.max(1, s * 0.015);
      for (let i = 0;i < 8; i++) {
        const fAngle = fenTimeBack + i * Math.PI / 4;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH2 * 0.72);
        _ctx.lineTo(Math.cos(fAngle) * fenRadBack * 0.7, fuseH2 * 0.72 + Math.sin(fAngle) * fenRadBack * 0.7);
        _ctx.stroke();
      }
      _ctx.lineWidth = 1;
      _ctx.fillStyle = exhaust;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.72, fenRadBack * 0.18, 0, Math.PI * 2);
      _ctx.fill();
      const wheelR2 = Math.max(1, Math.floor(s * 0.06));
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW - s * 0.08, fuseH2 * 0.12, s * 0.06, s * 0.35);
      _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.12, s * 0.06, s * 0.35);
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.arc(-fuseW - s * 0.06, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
      _ctx.arc(fuseW + s * 0.05, fuseH2 * 0.52, wheelR2, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.restore();
      return;
    }
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);
    const fuseLen = s * 1.5;
    const fuseH = s * 0.28;
    const noseLen = s * 0.35;
    const tailLen = s * 0.9;
    const tailH = s * 0.1;
    const finH = s * 0.22;
    const skidH = Math.max(1, Math.floor(s * 0.04));
    const skidStrut = Math.max(1, Math.floor(s * 0.03));
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35, -tailH * 0.6);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen, -tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen, tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35, tailH * 0.6);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35 - tailLen + s * 0.08, -tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.04, -finH);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.12, -finH);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.06, -tailH * 0.3);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.fillRect(-fuseLen * 0.35 - tailLen - s * 0.02, -s * 0.02, s * 0.18, s * 0.04);
    const fenestronRadius = s * 0.12;
    const fenestronX = -fuseLen * 0.35 - tailLen - s * 0.03;
    const fenestronY = -finH + s * 0.08;
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 1.2, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.85, 0, Math.PI * 2);
    _ctx.fill();
    const fenTime = performance.now() / 20;
    _ctx.strokeStyle = rotor;
    _ctx.lineWidth = Math.max(1, s * 0.02);
    for (let i = 0;i < 8; i++) {
      const fAngle = fenTime + i * Math.PI / 4;
      _ctx.beginPath();
      _ctx.moveTo(fenestronX, fenestronY);
      _ctx.lineTo(fenestronX + Math.cos(fAngle) * fenestronRadius * 0.75, fenestronY + Math.sin(fAngle) * fenestronRadius * 0.75);
      _ctx.stroke();
    }
    _ctx.lineWidth = 1;
    _ctx.fillStyle = exhaust;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.2, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.5, fuseH * 0.1);
    _ctx.lineTo(fuseLen * 0.4, fuseH * 0.4);
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5);
    _ctx.lineTo(-fuseLen * 0.35, -fuseH * 0.4);
    _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.5);
    _ctx.closePath();
    _ctx.fill();
    _ctx.strokeStyle = darker;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.02));
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.25, -fuseH * 0.25);
    _ctx.lineTo(-fuseLen * 0.05, -fuseH * 0.38);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.1, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.2, fuseH * 0.25);
    _ctx.stroke();
    _ctx.lineWidth = 1;
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.35, -fuseH * 0.25);
    _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.5);
    _ctx.lineTo(-fuseLen * 0.25, -fuseH * 0.4);
    _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, fuseH * 0.35);
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5);
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.3);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.15, -fuseH * 0.55, s * 0.2, s * 0.08);
    _ctx.fillStyle = exhaust;
    _ctx.fillRect(-fuseLen * 0.38, -fuseH * 0.2, s * 0.08, s * 0.12);
    _ctx.fillRect(-fuseLen * 0.38, fuseH * 0.1, s * 0.08, s * 0.12);
    _ctx.fillStyle = glass;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.38, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.48, fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.25);
    _ctx.lineTo(fuseLen * 0.1, fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.36, -fuseH * 0.1);
    _ctx.lineTo(fuseLen * 0.42, fuseH * 0);
    _ctx.lineTo(fuseLen * 0.3, fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.28, -fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = getSpriteColorWithFog("#2a3a3a", fogFactor, ambient, skyColor);
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.92, s * 0.06, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.35, fuseH * 0.35, s * 0.08, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = exhaust;
    _ctx.fillRect(fuseLen * 0.35, fuseH * 0.32, s * 0.15, s * 0.04);
    const wheelR = Math.max(1, Math.floor(s * 0.06));
    _ctx.fillStyle = darker;
    _ctx.fillRect(fuseLen * 0.16, fuseH * 0.4, skidStrut, s * 0.16);
    _ctx.fillRect(-fuseLen * 0.14, fuseH * 0.4, skidStrut, s * 0.16);
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.2, fuseH * 0.58, wheelR, 0, Math.PI * 2);
    _ctx.arc(-fuseLen * 0.1, fuseH * 0.58, wheelR, 0, Math.PI * 2);
    _ctx.fill();
    const rotorTime = performance.now() / 40;
    const rotorRadX = fuseLen * 0.7;
    const rotorRadY = fuseLen * 0.2;
    _ctx.fillStyle = rotor;
    _ctx.globalAlpha = 0.25;
    _ctx.beginPath();
    _ctx.ellipse(0, -fuseH * 0.7, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 0.7;
    for (let i = 0;i < 4; i++) {
      const angle = rotorTime + i * Math.PI / 2;
      const bx = Math.cos(angle) * rotorRadX;
      const by = Math.sin(angle) * rotorRadY;
      const bladeW = Math.max(2, Math.floor(s * 0.06));
      _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.7 + by - 1, bladeW, 2);
    }
    _ctx.globalAlpha = 1;
    _ctx.fillStyle = darker;
    _ctx.fillRect(-s * 0.04, -fuseH * 0.8, s * 0.08, s * 0.12);
    _ctx.fillStyle = exhaust;
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.82, s * 0.05, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
  }
  function drawFighterJet(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 15), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog("#2a4a6a", fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog("#4a7a9a", fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const exhaustGlow2 = getSpriteColorWithFog("#4a3a2a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;
    if (showFront) {
      const wingSpan = s * 1.1;
      const fuseH = s * 0.8;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.5);
      _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15);
      _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.4);
      _ctx.lineTo(ix, iy + fuseH * 0.5);
      _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.4);
      _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.4);
      _ctx.lineTo(ix - wingSpan * 0.7, iy + fuseH * 0.05);
      _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.1);
      _ctx.lineTo(ix, iy - fuseH * 0.2);
      _ctx.closePath();
      _ctx.fill();
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.4);
      _ctx.lineTo(ix + wingSpan * 0.7, iy + fuseH * 0.05);
      _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.1);
      _ctx.lineTo(ix, iy - fuseH * 0.2);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix - s * 0.15, iy + fuseH * 0.2);
      _ctx.lineTo(ix - s * 0.25, iy + fuseH * 0.5);
      _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.45);
      _ctx.closePath();
      _ctx.fill();
      _ctx.beginPath();
      _ctx.moveTo(ix + s * 0.15, iy + fuseH * 0.2);
      _ctx.lineTo(ix + s * 0.25, iy + fuseH * 0.5);
      _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.45);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = glass;
      _ctx.fillRect(ix - s * 0.08, iy - fuseH * 0.3, s * 0.16, s * 0.18);
      _ctx.fillStyle = glassHighlight;
      _ctx.fillRect(ix - s * 0.06, iy - fuseH * 0.28, s * 0.06, s * 0.08);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - s * 0.2, iy - fuseH * 0.05, s * 0.08, s * 0.12);
      _ctx.fillRect(ix + s * 0.12, iy - fuseH * 0.05, s * 0.08, s * 0.12);
      _ctx.fillStyle = highlight;
      _ctx.fillRect(ix - s * 0.03, iy - fuseH * 0.5, s * 0.06, s * 0.1);
      return;
    }
    if (showBack) {
      const wingSpan = s * 1.1;
      const fuseH = s * 0.8;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.5);
      _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15);
      _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.4);
      _ctx.lineTo(ix, iy + fuseH * 0.5);
      _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.4);
      _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.3);
      _ctx.lineTo(ix - wingSpan * 0.8, iy + fuseH * 0.1);
      _ctx.lineTo(ix - wingSpan * 0.4, iy + fuseH * 0.2);
      _ctx.lineTo(ix, iy);
      _ctx.closePath();
      _ctx.fill();
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH * 0.3);
      _ctx.lineTo(ix + wingSpan * 0.8, iy + fuseH * 0.1);
      _ctx.lineTo(ix + wingSpan * 0.4, iy + fuseH * 0.2);
      _ctx.lineTo(ix, iy);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix - s * 0.15, iy + fuseH * 0.2);
      _ctx.lineTo(ix - s * 0.25, iy + fuseH * 0.5);
      _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.45);
      _ctx.closePath();
      _ctx.fill();
      _ctx.beginPath();
      _ctx.moveTo(ix + s * 0.15, iy + fuseH * 0.2);
      _ctx.lineTo(ix + s * 0.25, iy + fuseH * 0.5);
      _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.45);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = exhaust;
      _ctx.beginPath();
      _ctx.arc(ix - s * 0.08, iy + fuseH * 0.42, s * 0.08, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix + s * 0.08, iy + fuseH * 0.42, s * 0.08, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = exhaustGlow2;
      _ctx.beginPath();
      _ctx.arc(ix - s * 0.08, iy + fuseH * 0.44, s * 0.045, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix + s * 0.08, iy + fuseH * 0.44, s * 0.045, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = getSpriteColorWithFog("#6a5a4a", fogFactor, ambient, skyColor);
      _ctx.beginPath();
      _ctx.arc(ix - s * 0.08, iy + fuseH * 0.45, s * 0.025, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix + s * 0.08, iy + fuseH * 0.45, s * 0.025, 0, Math.PI * 2);
      _ctx.fill();
      return;
    }
    if (showSide) {
      _ctx.save();
      _ctx.translate(ix, iy);
      _ctx.scale(dir, 1);
      const fuseLen = s * 1.5;
      const fuseH = s * 0.22;
      const noseLen = s * 0.4;
      const wingChord = s * 0.35;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen * 0.5, 0);
      _ctx.lineTo(fuseLen * 0.35, -fuseH * 0.6);
      _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.8);
      _ctx.lineTo(-fuseLen * 0.5, -fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.55, 0);
      _ctx.lineTo(-fuseLen * 0.5, fuseH * 0.5);
      _ctx.lineTo(fuseLen * 0.3, fuseH * 0.5);
      _ctx.lineTo(fuseLen * 0.45, fuseH * 0.2);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.4);
      _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.75);
      _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.2, -fuseH * 0.4);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen * 0.35, fuseH * 0.4);
      _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.2);
      _ctx.lineTo(fuseLen * 0.3, fuseH * 0.25);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.moveTo(-fuseLen * 0.05, fuseH * 0.3);
      _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.9);
      _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.9);
      _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.3);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(-fuseLen * 0.4, fuseH * 0.2);
      _ctx.lineTo(-fuseLen * 0.55, fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.55, fuseH * 0.35);
      _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.2);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(-fuseLen * 0.35, -fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.5, -fuseH * 1.3);
      _ctx.lineTo(-fuseLen * 0.55, -fuseH * 1.3);
      _ctx.lineTo(-fuseLen * 0.55, -fuseH * 0.5);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = glass;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen * 0.3, -fuseH * 0.5);
      _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.75);
      _ctx.lineTo(-fuseLen * 0.15, -fuseH * 0.5);
      _ctx.lineTo(fuseLen * 0.2, -fuseH * 0.35);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(fuseLen * 0.05, -fuseH * 0.65, s * 0.02, fuseH * 0.25);
      _ctx.fillStyle = glassHighlight;
      _ctx.beginPath();
      _ctx.moveTo(fuseLen * 0.25, -fuseH * 0.45);
      _ctx.lineTo(fuseLen * 0.1, -fuseH * 0.6);
      _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.45);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = exhaust;
      _ctx.fillRect(-fuseLen * 0.55, -fuseH * 0.3, s * 0.1, fuseH * 0.6);
      _ctx.fillStyle = exhaustGlow2;
      _ctx.fillRect(-fuseLen * 0.58, -fuseH * 0.15, s * 0.05, fuseH * 0.3);
      _ctx.fillStyle = darker;
      _ctx.fillRect(fuseLen * 0, fuseH * 0.35, s * 0.2, s * 0.08);
      _ctx.restore();
    }
  }
  function drawFriendlyAircraft(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog("#2a4a6a", fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog("#4a7a9a", fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const exhaustGlow2 = getSpriteColorWithFog("#ff7a2a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;
    if (showFront) {
      const wingSpan = s * 1;
      const fuseH2 = s * 0.7;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH2 * 0.5);
      _ctx.lineTo(ix - wingSpan, iy + fuseH2 * 0.15);
      _ctx.lineTo(ix, iy + fuseH2 * 0.5);
      _ctx.lineTo(ix + wingSpan, iy + fuseH2 * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.fillRect(ix - s * 0.08, iy - fuseH2 * 0.35, s * 0.16, fuseH2 * 0.7);
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - wingSpan * 0.55, iy + fuseH2 * 0.05, s * 0.18, s * 0.05);
      _ctx.fillRect(ix + wingSpan * 0.37, iy + fuseH2 * 0.05, s * 0.18, s * 0.05);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy + fuseH2 * 0.1);
      _ctx.lineTo(ix - s * 0.08, iy + fuseH2 * 0.5);
      _ctx.lineTo(ix + s * 0.08, iy + fuseH2 * 0.5);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = glass;
      _ctx.fillRect(ix - s * 0.07, iy - fuseH2 * 0.25, s * 0.14, s * 0.16);
      _ctx.fillStyle = glassHighlight;
      _ctx.fillRect(ix - s * 0.05, iy - fuseH2 * 0.22, s * 0.05, s * 0.08);
      return;
    }
    if (showBack) {
      const wingSpan = s * 1;
      const fuseH2 = s * 0.7;
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - fuseH2 * 0.5);
      _ctx.lineTo(ix - wingSpan, iy + fuseH2 * 0.15);
      _ctx.lineTo(ix, iy + fuseH2 * 0.5);
      _ctx.lineTo(ix + wingSpan, iy + fuseH2 * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 0.08, iy - fuseH2 * 0.35, s * 0.16, fuseH2 * 0.7);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy + fuseH2 * 0.15);
      _ctx.lineTo(ix - s * 0.1, iy + fuseH2 * 0.5);
      _ctx.lineTo(ix + s * 0.1, iy + fuseH2 * 0.5);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = exhaust;
      _ctx.beginPath();
      _ctx.arc(ix, iy + fuseH2 * 0.38, s * 0.08, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = exhaustGlow2;
      _ctx.beginPath();
      _ctx.arc(ix, iy + fuseH2 * 0.4, s * 0.05, 0, Math.PI * 2);
      _ctx.fill();
      return;
    }
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);
    const fuseLen = s * 1.8;
    const fuseH = s * 0.2;
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.5, 0);
    _ctx.lineTo(fuseLen * 0.3, -fuseH);
    _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.8);
    _ctx.lineTo(-fuseLen * 0.5, 0);
    _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.8);
    _ctx.lineTo(fuseLen * 0.3, fuseH);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.05, -fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.25, -s * 0.6);
    _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.4);
    _ctx.closePath();
    _ctx.fill();
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.05, fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.25, s * 0.6);
    _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.4);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35, 0);
    _ctx.lineTo(-fuseLen * 0.5, -s * 0.4);
    _ctx.lineTo(-fuseLen * 0.5, 0);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = glass;
    _ctx.beginPath();
    _ctx.ellipse(fuseLen * 0.25, 0, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.ellipse(fuseLen * 0.28, -s * 0.02, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.22, -s * 0.45, s * 0.16, s * 0.05);
    _ctx.fillRect(-fuseLen * 0.22, s * 0.4, s * 0.16, s * 0.05);
    _ctx.fillStyle = exhaustGlow2;
    _ctx.globalAlpha = 0.6;
    _ctx.beginPath();
    _ctx.ellipse(-fuseLen * 0.52, 0, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 1;
    _ctx.restore();
  }
  function drawTransportPlane(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 18);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const windowColor = getSpriteColorWithFog("#4a6a8a", fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;
    if (showFront) {
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.ellipse(ix, iy, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.ellipse(ix - s * 0.08, iy - s * 0.15, s * 0.12, s * 0.25, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 1, iy - s * 0.35, s * 2, s * 0.16);
      _ctx.fillStyle = highlight;
      _ctx.fillRect(ix - s * 0.9, iy - s * 0.35, s * 1.8, s * 0.04);
      _ctx.fillStyle = windowColor;
      _ctx.fillRect(ix - s * 0.12, iy - s * 0.4, s * 0.24, s * 0.1);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - s * 0.01, iy - s * 0.4, s * 0.02, s * 0.1);
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 0.7, iy - s * 0.3, s * 0.16, s * 0.22);
      _ctx.fillRect(ix - s * 0.35, iy - s * 0.3, s * 0.16, s * 0.22);
      _ctx.fillRect(ix + s * 0.19, iy - s * 0.3, s * 0.16, s * 0.22);
      _ctx.fillRect(ix + s * 0.54, iy - s * 0.3, s * 0.16, s * 0.22);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.ellipse(ix - s * 0.62, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.ellipse(ix - s * 0.27, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.ellipse(ix + s * 0.27, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.ellipse(ix + s * 0.62, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - s * 0.04, iy + s * 0.4, s * 0.08, s * 0.15);
      _ctx.beginPath();
      _ctx.arc(ix, iy + s * 0.55, s * 0.06, 0, Math.PI * 2);
      _ctx.fill();
      return;
    }
    if (showBack) {
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.ellipse(ix, iy, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 1, iy - s * 0.35, s * 2, s * 0.16);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix, iy - s * 0.45);
      _ctx.lineTo(ix - s * 0.08, iy - s * 0.9);
      _ctx.lineTo(ix + s * 0.08, iy - s * 0.9);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - s * 0.4, iy - s * 0.92, s * 0.8, s * 0.08);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - s * 0.2, iy + s * 0.1, s * 0.4, s * 0.35);
      _ctx.fillStyle = getSpriteColorWithFog("#3a3a3a", fogFactor, ambient, skyColor);
      _ctx.fillRect(ix - s * 0.18, iy + s * 0.12, s * 0.36, s * 0.04);
      _ctx.fillStyle = exhaust;
      _ctx.beginPath();
      _ctx.arc(ix - s * 0.62, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix - s * 0.27, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix + s * 0.27, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(ix + s * 0.62, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
      _ctx.fill();
      return;
    }
    if (showSide) {
      _ctx.save();
      _ctx.translate(ix, iy);
      _ctx.scale(dir, 1);
      _ctx.fillStyle = body;
      _ctx.fillRect(-s * 0.95, -s * 0.22, s * 1.9, s * 0.44);
      _ctx.beginPath();
      _ctx.moveTo(s * 0.95, -s * 0.18);
      _ctx.lineTo(s * 1.1, 0);
      _ctx.lineTo(s * 0.95, s * 0.18);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.2, -s * 0.38, s * 0.8, s * 0.12);
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 1.05, -s * 0.5, s * 0.2, s * 0.35);
      _ctx.fillRect(-s * 1.05, -s * 0.35, s * 0.45, s * 0.12);
      _ctx.fillStyle = windowColor;
      for (let i = 0;i < 5; i++) {
        _ctx.fillRect(-s * 0.5 + i * s * 0.22, -s * 0.12, s * 0.1, s * 0.08);
      }
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.05, -s * 0.1, s * 0.16, s * 0.12);
      _ctx.fillRect(s * 0.18, -s * 0.1, s * 0.16, s * 0.12);
      _ctx.fillRect(s * 0.41, -s * 0.1, s * 0.16, s * 0.12);
      _ctx.restore();
    }
  }
  function drawAttackHelicopter(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const body = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 50), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 65), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 4), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog("#122a2a", fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog("#2f5a5a", fogFactor, ambient, skyColor);
    const rotor = getSpriteColorWithFog("#3a3a3a", fogFactor, ambient, skyColor);
    const weapon = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const weaponDark = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;
    if (showFront) {
      _ctx.save();
      _ctx.translate(ix, iy);
      const fuseW = s * 0.45;
      const fuseH2 = s * 0.4;
      const rotorRadX2 = s * 0.85;
      const rotorRadY2 = s * 0.28;
      const rotorTime2 = performance.now() / 38;
      _ctx.fillStyle = rotor;
      _ctx.globalAlpha = 0.25;
      _ctx.beginPath();
      _ctx.ellipse(0, -fuseH2 * 1.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 0.7;
      for (let i = 0;i < 4; i++) {
        const angle = rotorTime2 + i * Math.PI / 2;
        const bx = Math.cos(angle) * rotorRadX2;
        const by = Math.sin(angle) * rotorRadY2;
        const bladeW = Math.max(2, Math.floor(s * 0.07));
        _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 1.9 + by - 1, bladeW, 2);
      }
      _ctx.globalAlpha = 1;
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.05, -fuseH2 * 1.7, s * 0.1, s * 0.35);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.28, -fuseH2 * 1.35, s * 0.56, s * 0.2);
      _ctx.fillStyle = weapon;
      _ctx.fillRect(-fuseW - s * 0.08, -fuseH2 * 0.9, s * 0.12, s * 0.25);
      _ctx.fillRect(fuseW - s * 0.04, -fuseH2 * 0.9, s * 0.12, s * 0.25);
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 1.1, -fuseH2 * 0.25);
      _ctx.lineTo(-fuseW * 0.8, -fuseH2 * 1.05);
      _ctx.lineTo(fuseW * 0.8, -fuseH2 * 1.05);
      _ctx.lineTo(fuseW * 1.1, -fuseH2 * 0.25);
      _ctx.lineTo(fuseW * 0.9, fuseH2 * 0.55);
      _ctx.lineTo(-fuseW * 0.9, fuseH2 * 0.55);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.4, -fuseH2 * 0.95);
      _ctx.lineTo(fuseW * 0.4, -fuseH2 * 0.95);
      _ctx.lineTo(fuseW * 0.25, -fuseH2 * 0.55);
      _ctx.lineTo(-fuseW * 0.25, -fuseH2 * 0.55);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW * 0.18, -fuseH2 * 0.15);
      _ctx.lineTo(0, fuseH2 * 0.05);
      _ctx.lineTo(fuseW * 0.18, -fuseH2 * 0.15);
      _ctx.lineTo(0, -fuseH2 * 0.25);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = body;
      _ctx.fillRect(-fuseW - s * 0.42, -fuseH2 * 0.18, s * 0.42, s * 0.12);
      _ctx.fillRect(fuseW, -fuseH2 * 0.18, s * 0.42, s * 0.12);
      _ctx.fillStyle = weapon;
      _ctx.fillRect(-fuseW - s * 0.38, -fuseH2 * 0.4, s * 0.14, s * 0.25);
      _ctx.fillRect(-fuseW - s * 0.22, -fuseH2 * 0.35, s * 0.1, s * 0.2);
      _ctx.fillRect(fuseW + s * 0.24, -fuseH2 * 0.4, s * 0.14, s * 0.25);
      _ctx.fillRect(fuseW + s * 0.12, -fuseH2 * 0.35, s * 0.1, s * 0.2);
      _ctx.fillStyle = weaponDark;
      _ctx.fillRect(-fuseW - s * 0.36, fuseH2 * 0, s * 0.08, s * 0.18);
      _ctx.fillRect(fuseW + s * 0.28, fuseH2 * 0, s * 0.08, s * 0.18);
      _ctx.fillStyle = glass;
      _ctx.beginPath();
      _ctx.ellipse(0, -fuseH2 * 0.15, fuseW * 0.35, fuseH2 * 0.35, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW * 0.4, -fuseH2 * 0.3, fuseW * 0.8, s * 0.03);
      _ctx.fillStyle = glassHighlight;
      _ctx.beginPath();
      _ctx.ellipse(-fuseW * 0.08, -fuseH2 * 0.35, fuseW * 0.1, fuseH2 * 0.1, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = weapon;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.55, s * 0.15, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = weaponDark;
      _ctx.fillRect(-s * 0.04, fuseH2 * 0.65, s * 0.03, s * 0.12);
      _ctx.fillRect(s * 0.01, fuseH2 * 0.65, s * 0.03, s * 0.12);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW - s * 0.12, fuseH2 * 0.25, s * 0.1, s * 0.5);
      _ctx.fillRect(-fuseW - s * 0.18, fuseH2 * 0.7, s * 0.22, s * 0.06);
      _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.25, s * 0.1, s * 0.5);
      _ctx.fillRect(fuseW - s * 0.04, fuseH2 * 0.7, s * 0.22, s * 0.06);
      _ctx.restore();
      return;
    }
    if (showBack) {
      _ctx.save();
      _ctx.translate(ix, iy);
      const fuseW = s * 0.45;
      const fuseH2 = s * 0.4;
      const rotorRadX2 = s * 0.85;
      const rotorRadY2 = s * 0.28;
      const rotorTime2 = performance.now() / 38;
      _ctx.fillStyle = rotor;
      _ctx.globalAlpha = 0.25;
      _ctx.beginPath();
      _ctx.ellipse(0, -fuseH2 * 1.9, rotorRadX2, rotorRadY2, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 0.7;
      for (let i = 0;i < 4; i++) {
        const angle = rotorTime2 + i * Math.PI / 2;
        const bx = Math.cos(angle) * rotorRadX2;
        const by = Math.sin(angle) * rotorRadY2;
        const bladeW = Math.max(2, Math.floor(s * 0.07));
        _ctx.fillRect(bx - bladeW / 2, -fuseH2 * 1.9 + by - 1, bladeW, 2);
      }
      _ctx.globalAlpha = 1;
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.05, -fuseH2 * 1.7, s * 0.1, s * 0.35);
      _ctx.fillStyle = darker;
      _ctx.fillRect(-s * 0.22, -fuseH2 * 1.3, s * 0.44, s * 0.18);
      _ctx.fillStyle = body;
      _ctx.beginPath();
      _ctx.moveTo(-fuseW, -fuseH2 * 0.3);
      _ctx.lineTo(-fuseW * 0.7, -fuseH2);
      _ctx.lineTo(fuseW * 0.7, -fuseH2);
      _ctx.lineTo(fuseW, -fuseH2 * 0.3);
      _ctx.lineTo(fuseW * 0.8, fuseH2 * 0.4);
      _ctx.lineTo(-fuseW * 0.8, fuseH2 * 0.4);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
      _ctx.beginPath();
      _ctx.arc(-fuseW * 0.4, -fuseH2 * 0.5, s * 0.1, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(fuseW * 0.4, -fuseH2 * 0.5, s * 0.1, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = getSpriteColorWithFog("#5a4a3a", fogFactor, ambient, skyColor);
      _ctx.beginPath();
      _ctx.arc(-fuseW * 0.4, -fuseH2 * 0.5, s * 0.05, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.beginPath();
      _ctx.arc(fuseW * 0.4, -fuseH2 * 0.5, s * 0.05, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = body;
      _ctx.fillRect(-fuseW - s * 0.35, -fuseH2 * 0.15, s * 0.35, s * 0.1);
      _ctx.fillRect(fuseW, -fuseH2 * 0.15, s * 0.35, s * 0.1);
      _ctx.fillStyle = weapon;
      _ctx.fillRect(-fuseW - s * 0.28, -fuseH2 * 0.3, s * 0.1, s * 0.18);
      _ctx.fillRect(fuseW + s * 0.18, -fuseH2 * 0.3, s * 0.1, s * 0.18);
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.07, fuseH2 * 0.2, s * 0.14, s * 0.55);
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(0, fuseH2 * 0.5);
      _ctx.lineTo(-s * 0.15, fuseH2 * 0.9);
      _ctx.lineTo(s * 0.15, fuseH2 * 0.9);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(-s * 0.35, fuseH2 * 0.62, s * 0.7, s * 0.08);
      const fenRadEnemyBack = s * 0.14;
      _ctx.fillStyle = weapon;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.7, fenRadEnemyBack * 1.2, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.7, fenRadEnemyBack * 0.82, 0, Math.PI * 2);
      _ctx.fill();
      const fenTimeEnemyBack = performance.now() / 15;
      _ctx.strokeStyle = rotor;
      _ctx.lineWidth = Math.max(1, s * 0.02);
      for (let i = 0;i < 8; i++) {
        const fAngle = fenTimeEnemyBack + i * Math.PI / 4;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH2 * 0.7);
        _ctx.lineTo(Math.cos(fAngle) * fenRadEnemyBack * 0.72, fuseH2 * 0.7 + Math.sin(fAngle) * fenRadEnemyBack * 0.72);
        _ctx.stroke();
      }
      _ctx.lineWidth = 1;
      _ctx.fillStyle = weaponDark;
      _ctx.beginPath();
      _ctx.arc(0, fuseH2 * 0.7, fenRadEnemyBack * 0.2, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = darker;
      _ctx.fillRect(-fuseW - s * 0.12, fuseH2 * 0.12, s * 0.1, s * 0.45);
      _ctx.fillRect(-fuseW - s * 0.18, fuseH2 * 0.52, s * 0.22, s * 0.06);
      _ctx.fillRect(fuseW + s * 0.02, fuseH2 * 0.12, s * 0.1, s * 0.45);
      _ctx.fillRect(fuseW - s * 0.04, fuseH2 * 0.52, s * 0.22, s * 0.06);
      _ctx.restore();
      return;
    }
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);
    const fuseLen = s * 1.5;
    const fuseH = s * 0.32;
    const tailLen = s * 0.95;
    const tailH = s * 0.12;
    const finH = s * 0.28;
    const wingSpan = s * 0.55;
    const skidH = Math.max(1, Math.floor(s * 0.04));
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.32, -tailH * 0.7);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen, -tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen, tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32, tailH * 0.7);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.32 - tailLen + s * 0.1, -tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.02, -finH);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.14, -finH);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.08, -tailH * 0.35);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.fillRect(-fuseLen * 0.32 - tailLen - s * 0.06, -s * 0.04, s * 0.26, s * 0.08);
    const enemyFenRadius = s * 0.14;
    const enemyFenX = -fuseLen * 0.32 - tailLen - s * 0.02;
    const enemyFenY = -finH + s * 0.1;
    _ctx.fillStyle = weaponDark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 1.25, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.85, 0, Math.PI * 2);
    _ctx.fill();
    const enemyFenTime = performance.now() / 15;
    _ctx.strokeStyle = rotor;
    _ctx.lineWidth = Math.max(1, s * 0.025);
    for (let i = 0;i < 8; i++) {
      const fAngle = enemyFenTime + i * Math.PI / 4;
      _ctx.beginPath();
      _ctx.moveTo(enemyFenX, enemyFenY);
      _ctx.lineTo(enemyFenX + Math.cos(fAngle) * enemyFenRadius * 0.75, enemyFenY + Math.sin(fAngle) * enemyFenRadius * 0.75);
      _ctx.stroke();
    }
    _ctx.lineWidth = 1;
    _ctx.fillStyle = weaponDark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.22, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.45, -fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.55, fuseH * 0.18);
    _ctx.lineTo(fuseLen * 0.45, fuseH * 0.48);
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.55);
    _ctx.lineTo(-fuseLen * 0.34, -fuseH * 0.42);
    _ctx.lineTo(fuseLen * 0.05, -fuseH * 0.55);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.1, -fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.3, -fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.28, -fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.35);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.35, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.1, -fuseH * 0.52);
    _ctx.lineTo(-fuseLen * 0.2, -fuseH * 0.42);
    _ctx.lineTo(-fuseLen * 0.05, -fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, fuseH * 0.4);
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.55);
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.2, -fuseH * 0.65, s * 0.28, s * 0.12);
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.28, -fuseH * 0.15, s * 0.12, s * 0.08);
    _ctx.fillRect(-fuseLen * 0.28, fuseH * 0.05, s * 0.12, s * 0.08);
    _ctx.fillStyle = highlight;
    _ctx.fillRect(-fuseLen * 0.26, -fuseH * 0.12, s * 0.06, s * 0.02);
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.05, -fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.25);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.15, -fuseH * 0.05);
    _ctx.closePath();
    _ctx.fill();
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.05, fuseH * 0.2);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.3);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.15, fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = weapon;
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, -fuseH * 0.35, s * 0.22, s * 0.14);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.4, -fuseH * 0.32, s * 0.16, s * 0.12);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, fuseH * 0.28, s * 0.24, s * 0.1);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.4, fuseH * 0.25, s * 0.18, s * 0.1);
    _ctx.fillStyle = weaponDark;
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.65, fuseH * 0.36, s * 0.14, s * 0.04);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.35, fuseH * 0.33, s * 0.12, s * 0.04);
    _ctx.fillStyle = glass;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.48, fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.2, fuseH * 0.3);
    _ctx.lineTo(fuseLen * 0.18, -fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.15, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.15, fuseH * 0.2);
    _ctx.lineTo(-fuseLen * 0.02, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.02, -fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.38, 0);
    _ctx.lineTo(fuseLen * 0.42, fuseH * 0.1);
    _ctx.lineTo(fuseLen * 0.32, fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.3, 0);
    _ctx.closePath();
    _ctx.fill();
    _ctx.fillStyle = darker;
    _ctx.fillRect(fuseLen * 0.32, -fuseH * 0.02, s * 0.02, fuseH * 0.22);
    _ctx.fillRect(fuseLen * 0.18, -fuseH * 0.18, s * 0.02, fuseH * 0.28);
    if (s >= 16) {
      _ctx.fillStyle = highlight;
      const markX = -fuseLen * 0.02;
      const markY = -fuseH * 0.15;
      const markW = Math.max(1, Math.floor(s * 0.06));
      const markH = Math.max(1, Math.floor(s * 0.02));
      _ctx.fillRect(markX, markY, markW, markH);
      _ctx.fillRect(markX, markY, Math.max(1, Math.floor(markW * 0.35)), markH * 4);
      _ctx.fillRect(markX, markY + markH * 2, Math.max(1, Math.floor(markW * 0.7)), markH);
      _ctx.fillRect(markX + markW + markH, markY, markH, markH * 4);
      _ctx.fillRect(markX + markW + markH * 2, markY, markH, markH * 4);
      _ctx.fillRect(markX + markW + markH, markY + markH * 2, markH * 2, markH);
      _ctx.fillRect(markX + markW + markH * 4, markY, markW, markH);
      _ctx.fillRect(markX + markW + markH * 4, markY + markH * 2, markW, markH);
      _ctx.fillRect(markX + markW + markH * 4, markY + markH * 3, Math.max(1, Math.floor(markW * 0.6)), markH);
      _ctx.fillRect(markX + markW + markH * 4 + markW - markH, markY, markH, markH * 4);
    }
    _ctx.fillStyle = weapon;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.38, fuseH * 0.45, s * 0.1, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = weaponDark;
    _ctx.fillRect(fuseLen * 0.38, fuseH * 0.42, s * 0.22, s * 0.05);
    _ctx.fillRect(fuseLen * 0.58, fuseH * 0.4, s * 0.04, s * 0.08);
    _ctx.fillStyle = darker;
    _ctx.fillRect(fuseLen * 0.12, fuseH * 0.45, Math.max(1, s * 0.03), s * 0.2);
    _ctx.fillRect(-fuseLen * 0.18, fuseH * 0.45, Math.max(1, s * 0.03), s * 0.2);
    _ctx.fillRect(-fuseLen * 0.25, fuseH * 0.62, fuseLen * 0.5, skidH);
    const rotorTime = performance.now() / 38;
    const rotorRadX = fuseLen * 0.72;
    const rotorRadY = fuseLen * 0.22;
    _ctx.fillStyle = rotor;
    _ctx.globalAlpha = 0.25;
    _ctx.beginPath();
    _ctx.ellipse(0, -fuseH * 0.75, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 0.7;
    for (let i = 0;i < 4; i++) {
      const angle = rotorTime + i * Math.PI / 2;
      const bx = Math.cos(angle) * rotorRadX;
      const by = Math.sin(angle) * rotorRadY;
      const bladeW = Math.max(2, Math.floor(s * 0.07));
      _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.75 + by - 1, bladeW, 2);
    }
    _ctx.globalAlpha = 1;
    _ctx.fillStyle = darker;
    _ctx.fillRect(-s * 0.05, -fuseH * 0.88, s * 0.1, s * 0.15);
    _ctx.fillStyle = weapon;
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.9, s * 0.06, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
  }
  function drawTank(x, y, size, color, heading = 0, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 18), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 32), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const track = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const trackMid = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const trackHighlight = getSpriteColorWithFog("#3a3a3a", fogFactor, ambient, skyColor);
    const wheel = getSpriteColorWithFog("#252525", fogFactor, ambient, skyColor);
    const wheelHighlight = getSpriteColorWithFog("#404040", fogFactor, ambient, skyColor);
    const metal = getSpriteColorWithFog("#2a2a2a", fogFactor, ambient, skyColor);
    const metalDark = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const relAngle = normalizeAngle2(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingToward = cosRel < -0.5;
    if (showSide) {
      const hullLen = s * 1.2;
      const hullH = s * 0.22;
      const trackH = Math.max(3, Math.floor(s * 0.24));
      const trackLen = s * 1.3;
      const turretLen = s * 0.55;
      const turretH = s * 0.2;
      const gunLen = s * 0.6;
      const gunH = Math.max(2, Math.floor(s * 0.06));
      const wheelRad = Math.max(2, Math.floor(trackH * 0.38));
      const wheelCount = Math.max(3, Math.floor(s / 12));
      const trackY = iy - Math.floor(trackH * 0.3);
      const hullY = trackY - hullH + Math.floor(trackH * 0.15);
      const turretY = hullY - turretH + Math.floor(s * 0.04);
      _ctx.fillStyle = track;
      _ctx.fillRect(ix - trackLen * 0.5, trackY, trackLen, trackH);
      _ctx.fillStyle = trackHighlight;
      _ctx.fillRect(ix - trackLen * 0.5, trackY, trackLen, Math.max(1, Math.floor(trackH * 0.15)));
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - trackLen * 0.52, trackY - Math.floor(s * 0.04), trackLen * 1.04, Math.floor(s * 0.05));
      const wheelSpacing = trackLen / (wheelCount + 1);
      for (let i = 1;i <= wheelCount; i++) {
        const wx = ix - trackLen * 0.5 + wheelSpacing * i;
        const wy = trackY + trackH * 0.5;
        _ctx.fillStyle = wheel;
        _ctx.beginPath();
        _ctx.arc(wx, wy, wheelRad, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = wheelHighlight;
        _ctx.beginPath();
        _ctx.arc(wx, wy - wheelRad * 0.3, wheelRad * 0.5, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = trackMid;
        _ctx.beginPath();
        _ctx.arc(wx, wy, wheelRad * 0.35, 0, Math.PI * 2);
        _ctx.fill();
      }
      _ctx.fillStyle = wheel;
      _ctx.beginPath();
      _ctx.arc(ix - trackLen * 0.42, trackY + trackH * 0.4, wheelRad * 0.9, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = wheelHighlight;
      _ctx.beginPath();
      _ctx.arc(ix - trackLen * 0.42, trackY + trackH * 0.3, wheelRad * 0.4, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = wheel;
      _ctx.beginPath();
      _ctx.arc(ix + trackLen * 0.42, trackY + trackH * 0.4, wheelRad * 0.9, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = wheelHighlight;
      _ctx.beginPath();
      _ctx.arc(ix + trackLen * 0.42, trackY + trackH * 0.3, wheelRad * 0.4, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = base;
      _ctx.beginPath();
      _ctx.moveTo(ix + hullLen * 0.5, hullY + hullH);
      _ctx.lineTo(ix + hullLen * 0.55, hullY + hullH * 0.3);
      _ctx.lineTo(ix + hullLen * 0.4, hullY);
      _ctx.lineTo(ix - hullLen * 0.45, hullY);
      _ctx.lineTo(ix - hullLen * 0.5, hullY + hullH);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.moveTo(ix + hullLen * 0.4, hullY);
      _ctx.lineTo(ix - hullLen * 0.45, hullY);
      _ctx.lineTo(ix - hullLen * 0.35, hullY + hullH * 0.25);
      _ctx.lineTo(ix + hullLen * 0.3, hullY + hullH * 0.25);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - hullLen * 0.5, hullY + hullH * 0.6, hullLen, hullH * 0.4);
      _ctx.fillStyle = base;
      _ctx.beginPath();
      _ctx.moveTo(ix + turretLen * 0.5, turretY + turretH);
      _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.4);
      _ctx.lineTo(ix + turretLen * 0.4, turretY);
      _ctx.lineTo(ix - turretLen * 0.5, turretY);
      _ctx.lineTo(ix - turretLen * 0.55, turretY + turretH);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.beginPath();
      _ctx.moveTo(ix + turretLen * 0.35, turretY);
      _ctx.lineTo(ix - turretLen * 0.45, turretY);
      _ctx.lineTo(ix - turretLen * 0.35, turretY + turretH * 0.3);
      _ctx.lineTo(ix + turretLen * 0.25, turretY + turretH * 0.3);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - turretLen * 0.55, turretY + turretH * 0.65, turretLen * 1.1, turretH * 0.35);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - turretLen * 0.15, turretY - Math.floor(s * 0.05), s * 0.15, Math.floor(s * 0.06));
      _ctx.fillStyle = metalDark;
      _ctx.fillRect(ix - turretLen * 0.12, turretY - Math.floor(s * 0.04), s * 0.09, Math.floor(s * 0.04));
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - turretLen * 0.4, turretY - Math.floor(s * 0.03), s * 0.1, Math.floor(s * 0.04));
      _ctx.fillStyle = darker;
      _ctx.beginPath();
      _ctx.moveTo(ix + turretLen * 0.45, turretY + turretH * 0.25);
      _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.4);
      _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.7);
      _ctx.lineTo(ix + turretLen * 0.45, turretY + turretH * 0.85);
      _ctx.closePath();
      _ctx.fill();
      const gunY = turretY + turretH * 0.45;
      _ctx.fillStyle = metal;
      _ctx.fillRect(ix + turretLen * 0.5, gunY, gunLen, gunH);
      _ctx.fillStyle = metalDark;
      _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.15, gunY - 1, gunLen * 0.15, gunH + 2);
      _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.45, gunY - 1, gunLen * 0.15, gunH + 2);
      _ctx.fillStyle = metalDark;
      _ctx.fillRect(ix + turretLen * 0.5 + gunLen - s * 0.06, gunY - Math.floor(s * 0.02), s * 0.08, gunH + Math.floor(s * 0.04));
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.3, gunY - Math.floor(s * 0.015), s * 0.08, gunH + Math.floor(s * 0.03));
      _ctx.fillStyle = metalDark;
      _ctx.fillRect(ix + turretLen * 0.48, gunY + gunH + Math.floor(s * 0.02), s * 0.2, Math.max(1, Math.floor(s * 0.025)));
      _ctx.fillStyle = metalDark;
      for (let i = 0;i < 3; i++) {
        _ctx.fillRect(ix + turretLen * 0.25 + i * s * 0.06, turretY + turretH * 0.15, s * 0.04, s * 0.08);
      }
    } else if (showFront) {
      const bodyW = s * 0.9;
      const bodyH = s * 0.45;
      const turretW = s * 0.5;
      const turretH = s * 0.25;
      _ctx.fillStyle = track;
      _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, bodyH * 0.35);
      _ctx.fillStyle = trackHighlight;
      _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, Math.max(1, bodyH * 0.08));
      _ctx.fillStyle = base;
      _ctx.beginPath();
      _ctx.moveTo(ix - bodyW * 0.5, iy + bodyH * 0.15);
      _ctx.lineTo(ix - bodyW * 0.4, iy - bodyH * 0.25);
      _ctx.lineTo(ix + bodyW * 0.4, iy - bodyH * 0.25);
      _ctx.lineTo(ix + bodyW * 0.5, iy + bodyH * 0.15);
      _ctx.closePath();
      _ctx.fill();
      _ctx.fillStyle = highlight;
      _ctx.fillRect(ix - bodyW * 0.35, iy - bodyH * 0.2, bodyW * 0.7, bodyH * 0.12);
      _ctx.fillStyle = base;
      _ctx.fillRect(ix - turretW * 0.5, iy - bodyH * 0.5, turretW, turretH);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - turretW * 0.4, iy - bodyH * 0.5, turretW * 0.8, turretH * 0.25);
      _ctx.fillStyle = metal;
      _ctx.beginPath();
      _ctx.arc(ix, iy - bodyH * 0.45, s * 0.06, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.fillStyle = metalDark;
      _ctx.beginPath();
      _ctx.arc(ix, iy - bodyH * 0.45, s * 0.03, 0, Math.PI * 2);
      _ctx.fill();
    } else if (showBack) {
      const bodyW = s * 0.9;
      const bodyH = s * 0.45;
      const turretW = s * 0.5;
      const turretH = s * 0.25;
      _ctx.fillStyle = track;
      _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, bodyH * 0.35);
      _ctx.fillStyle = trackHighlight;
      _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, Math.max(1, bodyH * 0.08));
      _ctx.fillStyle = base;
      _ctx.fillRect(ix - bodyW * 0.5, iy - bodyH * 0.2, bodyW, bodyH * 0.45);
      _ctx.fillStyle = dark;
      _ctx.fillRect(ix - bodyW * 0.45, iy - bodyH * 0.15, bodyW * 0.9, bodyH * 0.35);
      _ctx.fillStyle = metalDark;
      _ctx.fillRect(ix - bodyW * 0.3, iy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.18);
      _ctx.fillRect(ix + bodyW * 0.08, iy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.18);
      _ctx.fillStyle = base;
      _ctx.fillRect(ix - turretW * 0.5, iy - bodyH * 0.5, turretW, turretH);
      _ctx.fillStyle = darker;
      _ctx.fillRect(ix - turretW * 0.4, iy - bodyH * 0.5, turretW * 0.8, turretH * 0.25);
      _ctx.fillStyle = metal;
      _ctx.fillRect(ix - s * 0.04, iy - bodyH * 0.55, s * 0.08, s * 0.08);
    }
  }
  function drawBuilding(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 16);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const height = Math.floor(s * 1.6);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const shadow = getSpriteColorWithFog(darkenColor(color, 30), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog(darkenColor(color, 45), fogFactor, ambient, skyColor);
    const trim = getSpriteColorWithFog("#444444", fogFactor, ambient, skyColor);
    const windowDark = getSpriteColorWithFog("#223344", fogFactor, ambient, skyColor);
    const windowLit = getSpriteColorWithFog("#c9b46a", fogFactor, ambient, skyColor);
    _ctx.fillStyle = trim;
    _ctx.fillRect(ix - Math.floor(s * 0.48), iy - Math.floor(s * 0.08), Math.floor(s * 0.96), Math.floor(s * 0.12));
    _ctx.fillStyle = shadow;
    _ctx.fillRect(ix - Math.floor(s * 0.45), iy - height, Math.floor(s * 0.32), height - Math.floor(s * 0.08));
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(s * 0.1), iy - height, Math.floor(s * 0.55), height - Math.floor(s * 0.08));
    _ctx.fillStyle = highlight;
    _ctx.fillRect(ix + Math.floor(s * 0.42), iy - height, Math.floor(s * 0.05), height - Math.floor(s * 0.08));
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - Math.floor(s * 0.5), iy - height - Math.floor(s * 0.08), Math.floor(s * 1), Math.floor(s * 0.12));
    const rows = 3;
    const cols = 2;
    for (let row = 0;row < rows; row++) {
      for (let col = 0;col < cols; col++) {
        const wx = ix - Math.floor(s * 0.02) + col * Math.floor(s * 0.2);
        const wy = iy - height + Math.floor(s * 0.18) + row * Math.floor(s * 0.4);
        _ctx.fillStyle = Math.random() > 0.6 ? windowLit : windowDark;
        _ctx.fillRect(wx, wy, Math.floor(s * 0.14), Math.floor(s * 0.18));
      }
    }
    _ctx.fillStyle = trim;
    _ctx.fillRect(ix + Math.floor(s * 0.08), iy - Math.floor(s * 0.34), Math.floor(s * 0.2), Math.floor(s * 0.26));
  }
  function drawHangar(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 20);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog(darkenColor(color, 10), fogFactor, ambient, skyColor);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.7, iy - s * 0.4, s * 1.4, s * 0.8);
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - s * 0.7, iy - s * 0.5, s * 1.4, s * 0.15);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.4, iy - s * 0.1, s * 0.8, s * 0.5);
    _ctx.fillStyle = getSpriteColorWithFog(darkenColor(color, 15), fogFactor, ambient, skyColor);
    _ctx.fillRect(ix - s * 0.45, iy - s * 0.15, s * 0.05, s * 0.55);
    _ctx.fillRect(ix + s * 0.4, iy - s * 0.15, s * 0.05, s * 0.55);
  }
  function drawControlTower(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 15);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog("#4a8aaa", fogFactor, ambient, skyColor);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.3, iy, s * 0.6, s * 0.4);
    _ctx.fillRect(ix - s * 0.2, iy - s * 0.8, s * 0.4, s * 0.8);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.4, iy - s * 1.2, s * 0.8, s * 0.4);
    _ctx.fillStyle = glass;
    _ctx.fillRect(ix - s * 0.35, iy - s * 1.1, s * 0.7, s * 0.2);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.05, iy - s * 1.5, s * 0.1, s * 0.3);
  }
  function drawBarracks(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 18);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog("#4a3a2a", fogFactor, ambient, skyColor);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.6, iy - s * 0.25, s * 1.2, s * 0.5);
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - s * 0.65, iy - s * 0.35, s * 1.3, s * 0.12);
    _ctx.fillStyle = dark;
    for (let i = 0;i < 4; i++) {
      _ctx.fillRect(ix - s * 0.45 + i * s * 0.25, iy - s * 0.15, s * 0.12, s * 0.15);
    }
    _ctx.fillRect(ix - s * 0.08, iy + s * 0.05, s * 0.16, s * 0.2);
  }
  function drawFuelDepot(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 15);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 30), fogFactor, ambient, skyColor);
    const warning = getSpriteColorWithFog("#8a4a2a", fogFactor, ambient, skyColor);
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.3, s, s * 0.6);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.35, s, s * 0.1);
    _ctx.fillStyle = warning;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.1, s, s * 0.08);
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + s * 0.4, iy - s * 0.15, s * 0.2, s * 0.1);
    _ctx.fillRect(ix + s * 0.55, iy - s * 0.15, s * 0.05, s * 0.4);
  }
  function drawHelipad(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 20);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const marking = getSpriteColorWithFog("#8a8a2a", fogFactor, ambient, skyColor);
    const darkEdge = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const padW = s * 0.95;
    const padH = s * 0.35;
    _ctx.fillStyle = base;
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.5, padH * 0.5, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.strokeStyle = darkEdge;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.05));
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.48, padH * 0.48, 0, 0, Math.PI * 2);
    _ctx.stroke();
    const hHeight = padH * 0.55;
    const hWidth = Math.max(1, Math.floor(padW * 0.08));
    const hGap = padW * 0.18;
    const hBarH = Math.max(1, Math.floor(padH * 0.15));
    _ctx.fillStyle = marking;
    _ctx.fillRect(ix - hGap - hWidth / 2, iy - hHeight / 2, hWidth, hHeight);
    _ctx.fillRect(ix + hGap - hWidth / 2, iy - hHeight / 2, hWidth, hHeight);
    _ctx.fillRect(ix - hGap, iy - hBarH / 2, hGap * 2, hBarH);
    _ctx.strokeStyle = marking;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.04));
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.43, padH * 0.43, 0, 0, Math.PI * 2);
    _ctx.stroke();
  }
  function drawResupplyGlow(x, y, size, fogFactor = 0) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const time = performance.now() / 1000;
    const pulse = 0.25 + Math.sin(time * 2) * 0.1;
    const alpha = Math.max(0.05, pulse * (1 - fogFactor * 0.7));
    const glowRadius = size * 0.6;
    const glowHeight = size * 0.25;
    _ctx.globalAlpha = alpha * 0.4;
    _ctx.fillStyle = "#88ff88";
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 1.4, glowHeight * 1.4, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = alpha * 0.6;
    _ctx.fillStyle = "#aaffaa";
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 1.1, glowHeight * 1.1, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = alpha * 0.8;
    _ctx.fillStyle = "#ccffcc";
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 0.8, glowHeight * 0.8, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 1;
  }
  function drawSAMSite(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 4286615776) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const platform = getSpriteColorWithFog("#3a3a3a", fogFactor, ambient, skyColor);
    const platformEdge = getSpriteColorWithFog("#4a4a4a", fogFactor, ambient, skyColor);
    const tube = getSpriteColorWithFog("#1a1a1a", fogFactor, ambient, skyColor);
    const radar = getSpriteColorWithFog("#666666", fogFactor, ambient, skyColor);
    const cabinGlass = getSpriteColorWithFog("#335566", fogFactor, ambient, skyColor);
    _ctx.fillStyle = platform;
    _ctx.fillRect(ix - Math.floor(s * 0.6), iy - Math.floor(s * 0.05), Math.floor(s * 1.2), Math.floor(s * 0.15));
    _ctx.fillStyle = platformEdge;
    _ctx.fillRect(ix - Math.floor(s * 0.6), iy - Math.floor(s * 0.05), Math.floor(s * 1.2), Math.max(1, Math.floor(s * 0.03)));
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - Math.floor(s * 0.4), iy - Math.floor(s * 0.15), Math.floor(s * 0.8), Math.floor(s * 0.12));
    _ctx.fillStyle = tube;
    _ctx.fillRect(ix - Math.floor(s * 0.28), iy - Math.floor(s * 0.02), Math.floor(s * 0.12), Math.floor(s * 0.08));
    _ctx.fillRect(ix + Math.floor(s * 0.16), iy - Math.floor(s * 0.02), Math.floor(s * 0.12), Math.floor(s * 0.08));
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(s * 0.3), iy - Math.floor(s * 0.45), Math.floor(s * 0.6), Math.floor(s * 0.32));
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + Math.floor(s * 0.22), iy - Math.floor(s * 0.45), Math.floor(s * 0.08), Math.floor(s * 0.32));
    _ctx.fillStyle = tube;
    for (let row = 0;row < 2; row++) {
      for (let col = 0;col < 2; col++) {
        const tubeX = ix - Math.floor(s * 0.2) + col * Math.floor(s * 0.22);
        const tubeY = iy - Math.floor(s * 0.42) + row * Math.floor(s * 0.14);
        _ctx.fillRect(tubeX, tubeY, Math.floor(s * 0.08), Math.floor(s * 0.08));
      }
    }
    _ctx.fillStyle = platformEdge;
    _ctx.fillRect(ix - Math.floor(s * 0.52), iy - Math.floor(s * 0.7), Math.floor(s * 0.05), Math.floor(s * 0.35));
    _ctx.fillStyle = radar;
    _ctx.fillRect(ix - Math.floor(s * 0.56), iy - Math.floor(s * 0.78), Math.floor(s * 0.12), Math.floor(s * 0.08));
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + Math.floor(s * 0.35), iy - Math.floor(s * 0.35), Math.floor(s * 0.2), Math.floor(s * 0.22));
    _ctx.fillStyle = cabinGlass;
    _ctx.fillRect(ix + Math.floor(s * 0.38), iy - Math.floor(s * 0.32), Math.floor(s * 0.14), Math.floor(s * 0.08));
  }
  function lightenColor(color, amount) {
    const base = hexToRgb(color);
    return rgbToHex({
      r: Math.min(255, base.r + amount),
      g: Math.min(255, base.g + amount),
      b: Math.min(255, base.b + amount)
    });
  }
  function darkenColor(color, amount) {
    const base = hexToRgb(color);
    return rgbToHex({
      r: Math.max(0, base.r - amount),
      g: Math.max(0, base.g - amount),
      b: Math.max(0, base.b - amount)
    });
  }
  function renderEnemyProjectiles(cam, enemyProjectiles) {
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    for (const ep of enemyProjectiles) {
      let dx = ep.x - cam.x;
      let dy = ep.y - cam.y;
      if (dx > CONFIG.MAP_SIZE / 2)
        dx -= CONFIG.MAP_SIZE;
      if (dx < -CONFIG.MAP_SIZE / 2)
        dx += CONFIG.MAP_SIZE;
      if (dy > CONFIG.MAP_SIZE / 2)
        dy -= CONFIG.MAP_SIZE;
      if (dy < -CONFIG.MAP_SIZE / 2)
        dy += CONFIG.MAP_SIZE;
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = -dx * sinAngle - dy * cosAngle;
      if (ry > 5 && ry < cam.distance) {
        if (isProjectileOccluded(ep, cam, dx, dy, ry)) {
          continue;
        }
        const scaleX = _screenWidth / 2 / ry;
        const scaleY = 240 / ry;
        const screenX = _screenWidth / 2 + rx * scaleX;
        const bankTiltFactor = Math.sin(cam.bank || 0) * 0.3;
        const bankOffset = (screenX - _screenWidth / 2) * bankTiltFactor;
        const screenY = (cam.height - ep.z) * scaleY + cam.horizon + bankOffset;
        const scale = Math.min(scaleY, 1);
        if (ep.type === "air_cannon") {
          const bulletSize = Math.max(2.5, 2.5 * scale);
          _ctx.fillStyle = "#ffcc66";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
          _ctx.fill();
        } else if (ep.type === "air_rocket") {
          const rocketSize = Math.max(3.5, 4 * scale);
          _ctx.fillStyle = "#ff8844";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, rocketSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = Math.atan2(ep.vx || 0, ep.vy || 0);
          for (let t = 1;t <= 2; t++) {
            const trailDist = t * 7 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY - Math.cos(trailAngle) * trailDist;
            const trailSize = (3 - t * 0.6) * scale;
            _ctx.fillStyle = `rgba(180, 180, 180, ${0.5 - t * 0.15})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, Math.max(trailSize, 1), 0, Math.PI * 2);
            _ctx.fill();
          }
        } else if (ep.type === "air_missile") {
          const missileSize = Math.max(4, 5 * scale);
          _ctx.fillStyle = "#ff4455";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, missileSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = Math.atan2(ep.vx || 0, ep.vy || 0);
          for (let t = 1;t <= 3; t++) {
            const trailDist = t * 8 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY - Math.cos(trailAngle) * trailDist;
            const trailSize = (3.5 - t * 0.7) * scale;
            _ctx.fillStyle = `rgba(220, 220, 220, ${0.6 - t * 0.15})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, Math.max(trailSize, 1), 0, Math.PI * 2);
            _ctx.fill();
          }
        } else if (ep.type === "infantry_bullet") {
          const bulletSize = Math.max(1.5, 1.5 * scale);
          _ctx.fillStyle = "#ffe066";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
          _ctx.fill();
        } else if (ep.type === "tank_shell") {
          const shellSize = Math.max(3, 4 * scale);
          _ctx.fillStyle = "#d0c8a0";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, shellSize, 0, Math.PI * 2);
          _ctx.fill();
        } else if (ep.type === "sam_missile") {
          const missileSize = Math.max(4, 5 * scale);
          _ctx.fillStyle = "#ff3300";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, missileSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = ep.phase === "launch" ? Math.PI : ep.angle || 0;
          for (let t = 1;t <= 3; t++) {
            const trailDist = t * 8 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY - Math.cos(trailAngle) * trailDist;
            const trailSize = (4 - t * 0.8) * scale;
            _ctx.fillStyle = `rgba(200, 200, 200, ${0.5 - t * 0.12})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, Math.max(trailSize, 1), 0, Math.PI * 2);
            _ctx.fill();
          }
          const flameX = screenX + Math.sin(trailAngle) * 10 * scale;
          const flameY = screenY - Math.cos(trailAngle) * 10 * scale;
          _ctx.fillStyle = "#ffaa00";
          _ctx.beginPath();
          _ctx.arc(flameX, flameY, Math.max(2.5 * scale, 1.5), 0, Math.PI * 2);
          _ctx.fill();
        } else {
          const missileSize = Math.max(4, 5 * scale);
          _ctx.fillStyle = "#ff3300";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, missileSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = ep.angle || 0;
          for (let t = 1;t <= 3; t++) {
            const trailDist = t * 7 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY - Math.cos(trailAngle) * trailDist;
            const trailSize = (3.5 - t * 0.7) * scale;
            _ctx.fillStyle = `rgba(200, 200, 200, ${0.5 - t * 0.12})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, Math.max(trailSize, 1), 0, Math.PI * 2);
            _ctx.fill();
          }
        }
      }
    }
  }
  function isTargetOccluded(target, cam, dx, dy, ry) {
    const tar_getTerrainHeight = _getTerrainHeight(target.x, target.y);
    if (target.z < tar_getTerrainHeight) {
      return true;
    }
    const numSamples = Math.min(40, Math.max(10, Math.floor(ry / 10)));
    const targetHeight = typeof target.hitHeight === "number" ? target.hitHeight : target.size * 0.5;
    const targetBaseZ = target.z;
    const clearance = 2;
    for (let s = 1;s < numSamples; s++) {
      const linearT = s / numSamples;
      const t = linearT;
      let sampleX = cam.x + dx * t;
      let sampleY = cam.y + dy * t;
      sampleX = (sampleX % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      sampleY = (sampleY % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      const terrainAtSample = _getTerrainHeight(sampleX, sampleY);
      const expectedHeightToBase = cam.height + (targetBaseZ - cam.height) * t;
      if (terrainAtSample > expectedHeightToBase + clearance) {
        return true;
      }
    }
    const checkRadius = 5;
    for (let ox = -checkRadius;ox <= checkRadius; ox += checkRadius) {
      for (let oy = -checkRadius;oy <= checkRadius; oy += checkRadius) {
        let checkX = target.x + ox;
        let checkY = target.y + oy;
        checkX = (checkX % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
        checkY = (checkY % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
        const nearbyTerrain = _getTerrainHeight(checkX, checkY);
        if (nearbyTerrain > target.z + targetHeight * 0.3) {
          const tdx = checkX - cam.x;
          const tdy = checkY - cam.y;
          const dotProduct = tdx * dx + tdy * dy;
          if (dotProduct > 0 && dotProduct < dx * dx + dy * dy) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function isProjectileOccluded(obj, cam, dx, dy, ry) {
    const terrainHeight = _getTerrainHeight(obj.x, obj.y);
    if (obj.z < terrainHeight) {
      return true;
    }
    const numSamples = Math.min(15, Math.max(5, Math.floor(ry / 30)));
    const clearance = 2;
    for (let s = 1;s < numSamples; s++) {
      const t = s / numSamples;
      let sampleX = cam.x + dx * t;
      let sampleY = cam.y + dy * t;
      sampleX = (sampleX % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      sampleY = (sampleY % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      const terrainAtSample = _getTerrainHeight(sampleX, sampleY);
      const expectedHeight = cam.height + (obj.z - cam.height) * t;
      if (terrainAtSample > expectedHeight + clearance) {
        return true;
      }
    }
    return false;
  }
  function isShadowOccluded(shadowX, shadowY, shadowZ, cam, dx, dy, ry) {
    const numSamples = Math.min(20, Math.max(5, Math.floor(ry / 20)));
    const clearance = 3;
    for (let s = 1;s < numSamples; s++) {
      const t = s / numSamples;
      let sampleX = cam.x + dx * t;
      let sampleY = cam.y + dy * t;
      sampleX = (sampleX % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      sampleY = (sampleY % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      const terrainAtSample = _getTerrainHeight(sampleX, sampleY);
      const expectedHeight = cam.height + (shadowZ - cam.height) * t;
      if (terrainAtSample > expectedHeight + clearance) {
        return true;
      }
    }
    return false;
  }
  function renderProjectiles(cam, projectiles) {
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    for (const proj of projectiles) {
      let dx = proj.x - cam.x;
      let dy = proj.y - cam.y;
      if (!proj.noWrap) {
        if (dx > CONFIG.MAP_SIZE / 2)
          dx -= CONFIG.MAP_SIZE;
        if (dx < -CONFIG.MAP_SIZE / 2)
          dx += CONFIG.MAP_SIZE;
        if (dy > CONFIG.MAP_SIZE / 2)
          dy -= CONFIG.MAP_SIZE;
        if (dy < -CONFIG.MAP_SIZE / 2)
          dy += CONFIG.MAP_SIZE;
      }
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = -dx * sinAngle - dy * cosAngle;
      if (ry > 5 && ry < cam.distance) {
        if (isProjectileOccluded(proj, cam, dx, dy, ry)) {
          continue;
        }
        const scaleX = _screenWidth / 2 / ry;
        const scaleY = 240 / ry;
        const screenX = _screenWidth / 2 + rx * scaleX;
        const bankTiltFactor = Math.sin(cam.bank || 0) * 0.3;
        const bankOffset = (screenX - _screenWidth / 2) * bankTiltFactor;
        const screenY = (cam.height - proj.z) * scaleY + cam.horizon + bankOffset;
        const scale = Math.min(scaleY, 1);
        if (proj.projectileType === "missile") {
          const missileSize = 5 * scale;
          _ctx.fillStyle = proj.color || "#ff4400";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, missileSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = proj.angle - cam.angle;
          for (let t = 1;t <= 3; t++) {
            const trailDist = t * 8 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY + Math.cos(trailAngle) * trailDist;
            const trailSize = (4 - t * 0.8) * scale;
            const alpha = 0.6 - t * 0.15;
            _ctx.fillStyle = `rgba(150, 150, 150, ${alpha})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
            _ctx.fill();
          }
          const flameX = screenX + Math.sin(trailAngle) * 10 * scale;
          const flameY = screenY + Math.cos(trailAngle) * 10 * scale;
          _ctx.fillStyle = "#ffaa00";
          _ctx.beginPath();
          _ctx.arc(flameX, flameY, 3 * scale, 0, Math.PI * 2);
          _ctx.fill();
        } else if (proj.projectileType === "rocket") {
          const rocketSize = 4 * scale;
          _ctx.fillStyle = proj.color || "#ff6600";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, rocketSize, 0, Math.PI * 2);
          _ctx.fill();
          const trailAngle = proj.angle - cam.angle;
          for (let t = 1;t <= 2; t++) {
            const trailDist = t * 6 * scale;
            const trailX = screenX + Math.sin(trailAngle) * trailDist;
            const trailY = screenY + Math.cos(trailAngle) * trailDist;
            const trailSize = (3 - t * 0.6) * scale;
            const alpha = 0.7 - t * 0.2;
            _ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            _ctx.beginPath();
            _ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
            _ctx.fill();
          }
        } else {
          const bulletSize = proj.projectileType === "cannon" ? 3 * scale : 2.5 * scale;
          _ctx.fillStyle = proj.color || "#ffff00";
          _ctx.beginPath();
          _ctx.arc(screenX, screenY, Math.max(bulletSize, 1.5), 0, Math.PI * 2);
          _ctx.fill();
        }
      }
    }
  }
  function renderExplosions(cam, explosions) {
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    for (const exp of explosions) {
      let dx = exp.x - cam.x;
      let dy = exp.y - cam.y;
      if (dx > CONFIG.MAP_SIZE / 2)
        dx -= CONFIG.MAP_SIZE;
      if (dx < -CONFIG.MAP_SIZE / 2)
        dx += CONFIG.MAP_SIZE;
      if (dy > CONFIG.MAP_SIZE / 2)
        dy -= CONFIG.MAP_SIZE;
      if (dy < -CONFIG.MAP_SIZE / 2)
        dy += CONFIG.MAP_SIZE;
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = -dx * sinAngle - dy * cosAngle;
      if (ry > 5 && ry < cam.distance) {
        if (isProjectileOccluded(exp, cam, dx, dy, ry)) {
          continue;
        }
        const scaleX = _screenWidth / 2 / ry;
        const scaleY = 240 / ry;
        const screenX = _screenWidth / 2 + rx * scaleX;
        const bankTiltFactor = Math.sin(cam.bank || 0) * 0.3;
        const bankOffset = (screenX - _screenWidth / 2) * bankTiltFactor;
        const screenY = (cam.height - exp.z) * scaleY + cam.horizon + bankOffset;
        const progress = 1 - exp.lifetime / exp.maxLifetime;
        const currentSize = exp.size * scaleY * (0.5 + progress * 0.5);
        const alpha = 1 - progress;
        const gradient = _ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, currentSize);
        gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 200, 50, ${alpha * 0.8})`);
        gradient.addColorStop(0.6, `rgba(255, 100, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 50, 0, 0)`);
        _ctx.fillStyle = gradient;
        _ctx.beginPath();
        _ctx.arc(screenX, screenY, currentSize, 0, Math.PI * 2);
        _ctx.fill();
      }
    }
  }
  function renderParticles(cam, particles) {
    if (particles.length === 0)
      return;
    const sinAngle = Math.sin(cam.angle);
    const cosAngle = Math.cos(cam.angle);
    for (const p of particles) {
      let dx = p.x - cam.x;
      let dy = p.y - cam.y;
      if (dx > CONFIG.MAP_SIZE / 2)
        dx -= CONFIG.MAP_SIZE;
      if (dx < -CONFIG.MAP_SIZE / 2)
        dx += CONFIG.MAP_SIZE;
      if (dy > CONFIG.MAP_SIZE / 2)
        dy -= CONFIG.MAP_SIZE;
      if (dy < -CONFIG.MAP_SIZE / 2)
        dy += CONFIG.MAP_SIZE;
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = -dx * sinAngle - dy * cosAngle;
      if (ry > 5 && ry < cam.distance) {
        if (isProjectileOccluded(p, cam, dx, dy, ry)) {
          continue;
        }
        const scaleX = _screenWidth / 2 / ry;
        const scaleY = 240 / ry;
        const screenX = _screenWidth / 2 + rx * scaleX;
        const bankTiltFactor = Math.sin(cam.bank || 0) * 0.3;
        const bankOffset = (screenX - _screenWidth / 2) * bankTiltFactor;
        const screenY = (cam.height - p.z) * scaleY + cam.horizon + bankOffset;
        const size = Math.max(1, p.size * scaleY);
        const alpha = Math.max(0, p.life / p.maxLife);
        if (screenX > -size && screenX < _screenWidth + size && screenY > -size && screenY < _screenHeight + size) {
          if (p.type === "spark") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.fill();
          } else if (p.type === "smoke") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.6})`;
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.fill();
          } else if (p.type === "debris") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.9})`;
            _ctx.fillRect(screenX - size * 0.5, screenY - size * 0.5, size, size);
          } else if (p.type === "dust") {
            _ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.4})`;
            _ctx.lineWidth = Math.max(1, size * 0.15);
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.stroke();
          } else if (p.type === "blood") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.85})`;
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.fill();
          } else if (p.type === "trail_smoke") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.3})`;
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.fill();
          } else if (p.type === "muzzle_flash") {
            _ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.7})`;
            _ctx.beginPath();
            _ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            _ctx.fill();
          }
        }
      }
    }
  }
  function renderMissionMessage() {
    if (!missionMessage || performance.now() > missionMessageEnd) {
      missionMessage = null;
      return;
    }
    const alpha = Math.min(1, (missionMessageEnd - performance.now()) / 500);
    _ctx.save();
    _ctx.globalAlpha = alpha;
    _ctx.font = "bold 20px Courier New";
    _ctx.textAlign = "center";
    _ctx.fillStyle = "#ff0";
    _ctx.strokeStyle = "#000";
    _ctx.lineWidth = 3;
    _ctx.strokeText(missionMessage, _screenWidth / 2, _screenHeight * 0.25);
    _ctx.fillText(missionMessage, _screenWidth / 2, _screenHeight * 0.25);
    _ctx.restore();
  }
  function checkAllObjectivesComplete() {
    if (objectiveState.failed.length > 0) {
      const failedObj = objectiveState.objectives.find((o) => o.failed);
      endMission(false, failedObj ? `FAILED: ${failedObj.description}` : "Objective failed");
      return;
    }
    const allComplete = objectiveState.objectives.every((obj) => obj.complete);
    if (allComplete && objectiveState.objectives.length > 0) {
      endMission(true);
    }
  }
  function getObjectiveProgressText2(obj) {
    switch (obj.type) {
      case "destroy_all":
        const remaining = targets.filter((t) => !t.destroyed).length;
        return remaining === 0 ? "COMPLETE" : `${remaining} remaining`;
      case "destroy_type":
      case "destroy_count":
        return `${obj.progress}/${obj.total}`;
      case "survive_time":
        const remaining2 = Math.max(0, obj.total - obj.progress);
        return `${Math.ceil(remaining2)}s`;
      case "reach_location":
        return obj.complete ? "REACHED" : "IN PROGRESS";
      case "protect_target":
        return obj.failed ? "FAILED" : "PROTECTED";
      default:
        return obj.complete ? "COMPLETE" : "IN PROGRESS";
    }
  }
  function normalizeAngle2(angle) {
    while (angle > Math.PI)
      angle -= Math.PI * 2;
    while (angle < -Math.PI)
      angle += Math.PI * 2;
    return angle;
  }
  function getLockedTargetForMissile() {
    if (targetingSystem.lockedTarget && !targetingSystem.lockedTarget.destroyed) {
      return targetingSystem.lockedTarget;
    }
    if (targetingSystem.selectedTarget && !targetingSystem.selectedTarget.destroyed && targetingSystem.lockProgress > 50) {
      return targetingSystem.selectedTarget;
    }
    return null;
  }
  function getDeltaZoomFactor() {
    if (gameMode !== GAME_MODES.DELTA)
      return 1;
    const weaponKey = soldierWeapon.current;
    const targetZoom = soldierScope.active ? weaponKey === "sniper" ? soldierScope.zoom : 1.6 : 1;
    return 1 + (targetZoom - 1) * (soldierScope.transitionTime || 0);
  }
  function queueAchievementToast(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement)
      return;
    achievementToasts.push({ id, title: achievement.name, desc: achievement.desc, icon: achievement.icon, startTime: performance.now() });
  }
  function renderAchievementToasts() {
    if (!achievementToasts.length)
      return;
    const now = performance.now();
    const toastWidth = 280, toastHeight = 60;
    achievementToasts = achievementToasts.filter(function(toast) {
      return now - toast.startTime < ACHIEVEMENT_TOAST_DURATION;
    });
    _ctx.save();
    achievementToasts.forEach(function(toast, index) {
      const elapsed = now - toast.startTime;
      const remaining = ACHIEVEMENT_TOAST_DURATION - elapsed;
      const targetX = _screenWidth - toastWidth - 20;
      const startX = _screenWidth + toastWidth + 20;
      let x = targetX, alpha = 1;
      if (elapsed < ACHIEVEMENT_TOAST_SLIDE) {
        const t = elapsed / ACHIEVEMENT_TOAST_SLIDE;
        const ease = 1 - Math.pow(1 - t, 3);
        x = startX + (targetX - startX) * ease;
        alpha = Math.min(1, t + 0.2);
      } else if (remaining < ACHIEVEMENT_TOAST_SLIDE) {
        const t = remaining / ACHIEVEMENT_TOAST_SLIDE;
        const ease = 1 - Math.pow(1 - t, 3);
        x = targetX + (1 - ease) * (toastWidth + 40);
        alpha = Math.max(0, t);
      }
      const y = _screenHeight - 80 - toastHeight - index * (toastHeight + 10);
      _ctx.globalAlpha = alpha;
      _ctx.fillStyle = "rgba(0, 30, 0, 0.9)";
      _ctx.strokeStyle = "#0f0";
      _ctx.lineWidth = 2;
      _ctx.fillRect(x, y, toastWidth, toastHeight);
      _ctx.strokeRect(x, y, toastWidth, toastHeight);
      _ctx.font = "20px Courier New";
      _ctx.fillStyle = "#ff0";
      _ctx.textAlign = "left";
      _ctx.fillText(toast.icon, x + 10, y + 34);
      _ctx.font = "bold 14px Courier New";
      _ctx.fillStyle = "#0f0";
      _ctx.fillText(toast.title.toUpperCase(), x + 40, y + 24);
      _ctx.font = "12px Courier New";
      _ctx.fillStyle = "#0a0";
      _ctx.fillText(toast.desc, x + 40, y + 42);
    });
    _ctx.restore();
  }

  // src/voxelvibe/render/radar.ts
  var exports_radar = {};
  __export(exports_radar, {
    setScreenSize: () => setScreenSize2,
    renderTerrainRadar: () => renderTerrainRadar,
    renderRadar: () => renderRadar,
    renderMinimap: () => renderMinimap,
    init: () => init2
  });
  var _ctx2;
  var _screenWidth2 = 800;
  var _screenHeight2 = 600;
  function init2(ctx) {
    _ctx2 = ctx;
  }
  function setScreenSize2(width, height) {
    _screenWidth2 = width;
    _screenHeight2 = height;
  }
  function renderRadar(camera, targets2, enemyProjectiles, objectiveState2) {
    const radarSize = CONFIG.RADAR_SIZE;
    const radarX = 10;
    const radarY = _screenHeight2 - radarSize - 10;
    const radarCenterX = radarX + radarSize / 2;
    const radarCenterY = radarY + radarSize / 2;
    _ctx2.fillStyle = "rgba(0, 20, 0, 0.7)";
    _ctx2.fillRect(radarX, radarY, radarSize, radarSize);
    _ctx2.strokeStyle = "#0f0";
    _ctx2.lineWidth = 2;
    _ctx2.strokeRect(radarX, radarY, radarSize, radarSize);
    _ctx2.strokeStyle = "rgba(0, 255, 0, 0.3)";
    _ctx2.lineWidth = 1;
    _ctx2.beginPath();
    _ctx2.arc(radarCenterX, radarCenterY, radarSize / 4, 0, Math.PI * 2);
    _ctx2.stroke();
    _ctx2.beginPath();
    _ctx2.arc(radarCenterX, radarCenterY, radarSize / 2 - 5, 0, Math.PI * 2);
    _ctx2.stroke();
    _ctx2.beginPath();
    _ctx2.moveTo(radarCenterX, radarY + 5);
    _ctx2.lineTo(radarCenterX, radarY + radarSize - 5);
    _ctx2.moveTo(radarX + 5, radarCenterY);
    _ctx2.lineTo(radarX + radarSize - 5, radarCenterY);
    _ctx2.stroke();
    const scale = (radarSize / 2 - 5) / CONFIG.RADAR_RANGE;
    for (const target of targets2) {
      if (target.destroyed)
        continue;
      const physicalDx = target.x - camera.x;
      const physicalDy = target.y - camera.y;
      const physicalDist = Math.sqrt(physicalDx * physicalDx + physicalDy * physicalDy);
      if (physicalDist > CONFIG.RADAR_RANGE * 2)
        continue;
      let dx = physicalDx;
      let dy = physicalDy;
      if (dx > CONFIG.MAP_SIZE / 2)
        dx -= CONFIG.MAP_SIZE;
      if (dx < -CONFIG.MAP_SIZE / 2)
        dx += CONFIG.MAP_SIZE;
      if (dy > CONFIG.MAP_SIZE / 2)
        dy -= CONFIG.MAP_SIZE;
      if (dy < -CONFIG.MAP_SIZE / 2)
        dy += CONFIG.MAP_SIZE;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > CONFIG.RADAR_RANGE)
        continue;
      const sinAngle = Math.sin(-camera.angle);
      const cosAngle = Math.cos(-camera.angle);
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = dx * sinAngle + dy * cosAngle;
      const radarTargetX = radarCenterX + rx * scale;
      const radarTargetY = radarCenterY - ry * scale;
      if (target.type === "sam") {
        _ctx2.fillStyle = "#ff6600";
      } else if (target.type === "tank") {
        _ctx2.fillStyle = "#ff0000";
      } else if (target.type === "soldier") {
        _ctx2.fillStyle = "#ffcc00";
      } else {
        _ctx2.fillStyle = "#ffff00";
      }
      _ctx2.beginPath();
      _ctx2.arc(radarTargetX, radarTargetY, 3, 0, Math.PI * 2);
      _ctx2.fill();
    }
    for (const ep of enemyProjectiles) {
      const physicalDx = ep.x - camera.x;
      const physicalDy = ep.y - camera.y;
      const physicalDist = Math.sqrt(physicalDx * physicalDx + physicalDy * physicalDy);
      if (physicalDist > CONFIG.RADAR_RANGE * 2)
        continue;
      let dx = physicalDx;
      let dy = physicalDy;
      if (dx > CONFIG.MAP_SIZE / 2)
        dx -= CONFIG.MAP_SIZE;
      if (dx < -CONFIG.MAP_SIZE / 2)
        dx += CONFIG.MAP_SIZE;
      if (dy > CONFIG.MAP_SIZE / 2)
        dy -= CONFIG.MAP_SIZE;
      if (dy < -CONFIG.MAP_SIZE / 2)
        dy += CONFIG.MAP_SIZE;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > CONFIG.RADAR_RANGE)
        continue;
      const sinAngle = Math.sin(-camera.angle);
      const cosAngle = Math.cos(-camera.angle);
      const rx = dx * cosAngle - dy * sinAngle;
      const ry = dx * sinAngle + dy * cosAngle;
      const radarX2 = radarCenterX + rx * scale;
      const radarY2 = radarCenterY - ry * scale;
      const blinkOn = Math.floor(performance.now() / 100) % 2 === 0;
      if (blinkOn) {
        _ctx2.fillStyle = "#ff00ff";
        _ctx2.beginPath();
        _ctx2.arc(radarX2, radarY2, 4, 0, Math.PI * 2);
        _ctx2.fill();
      }
    }
    if (objectiveState2.objectives.length > 0) {
      for (const obj of objectiveState2.objectives) {
        if (obj.type === "reach_location" && !obj.complete) {
          let dx = obj.x - camera.x;
          let dy = obj.y - camera.y;
          if (dx > CONFIG.MAP_SIZE / 2)
            dx -= CONFIG.MAP_SIZE;
          if (dx < -CONFIG.MAP_SIZE / 2)
            dx += CONFIG.MAP_SIZE;
          if (dy > CONFIG.MAP_SIZE / 2)
            dy -= CONFIG.MAP_SIZE;
          if (dy < -CONFIG.MAP_SIZE / 2)
            dy += CONFIG.MAP_SIZE;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const sinAngle = Math.sin(-camera.angle);
          const cosAngle = Math.cos(-camera.angle);
          const rx = dx * cosAngle - dy * sinAngle;
          const ry = dx * sinAngle + dy * cosAngle;
          const radarRx = rx * scale;
          const radarRy = ry * scale;
          const radarDist = Math.sqrt(radarRx * radarRx + radarRy * radarRy);
          const maxRadarDist = radarSize / 2 - 8;
          let finalRx, finalRy;
          if (radarDist > maxRadarDist && radarDist > 0) {
            const clampScale = maxRadarDist / radarDist;
            finalRx = radarRx * clampScale;
            finalRy = radarRy * clampScale;
          } else {
            finalRx = radarRx;
            finalRy = radarRy;
          }
          const objX = radarCenterX + finalRx;
          const objY = radarCenterY - finalRy;
          const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
          _ctx2.fillStyle = blinkOn ? "#00ffff" : "#008888";
          _ctx2.beginPath();
          _ctx2.moveTo(objX, objY - 5);
          _ctx2.lineTo(objX + 4, objY);
          _ctx2.lineTo(objX, objY + 5);
          _ctx2.lineTo(objX - 4, objY);
          _ctx2.closePath();
          _ctx2.fill();
        }
      }
    }
    _ctx2.fillStyle = "#0f0";
    _ctx2.beginPath();
    _ctx2.moveTo(radarCenterX, radarCenterY - 6);
    _ctx2.lineTo(radarCenterX - 4, radarCenterY + 4);
    _ctx2.lineTo(radarCenterX + 4, radarCenterY + 4);
    _ctx2.closePath();
    _ctx2.fill();
    _ctx2.font = "10px Courier New";
    _ctx2.fillStyle = "#0f0";
    _ctx2.textAlign = "left";
    _ctx2.fillText("RADAR", radarX + 5, radarY + 12);
  }
  function renderMinimap(camera, targets2, world, playerState, gameMode2) {
    const mapSize = 120;
    const mapX = _screenWidth2 - mapSize - 15;
    const mapY = 50;
    const scale = mapSize / CONFIG.MAP_SIZE;
    _ctx2.fillStyle = "rgba(0, 20, 0, 0.8)";
    _ctx2.fillRect(mapX, mapY, mapSize, mapSize);
    _ctx2.strokeStyle = "#0f0";
    _ctx2.lineWidth = 1;
    _ctx2.strokeRect(mapX, mapY, mapSize, mapSize);
    _ctx2.fillStyle = "#f00";
    for (const base of world.bases) {
      const bx = mapX + base.x * scale;
      const by = mapY + base.y * scale;
      _ctx2.fillRect(bx - 2, by - 2, 4, 4);
    }
    _ctx2.fillStyle = "#f80";
    for (const airport of world.airports) {
      const ax = mapX + airport.x * scale;
      const ay = mapY + airport.y * scale;
      _ctx2.fillRect(ax - 3, ay - 1, 6, 2);
    }
    _ctx2.fillStyle = "#f00";
    for (const target of targets2) {
      if (target.destroyed)
        continue;
      if (target.domain === DOMAINS.AIR) {
        const tx = mapX + target.x * scale;
        const ty = mapY + target.y * scale;
        _ctx2.beginPath();
        _ctx2.arc(tx, ty, 2, 0, Math.PI * 2);
        _ctx2.fill();
      }
    }
    _ctx2.fillStyle = "#0f0";
    const px = mapX + camera.x * scale;
    const py = mapY + camera.y * scale;
    _ctx2.save();
    _ctx2.translate(px, py);
    _ctx2.rotate(-camera.angle + Math.PI / 2);
    _ctx2.beginPath();
    _ctx2.moveTo(0, -4);
    _ctx2.lineTo(-3, 3);
    _ctx2.lineTo(3, 3);
    _ctx2.closePath();
    _ctx2.fill();
    _ctx2.restore();
    if (gameMode2 === GAME_MODES2.DELTA && playerState.heli.visible) {
      _ctx2.fillStyle = "#0ff";
      const hx = mapX + playerState.heli.x * scale;
      const hy = mapY + playerState.heli.y * scale;
      _ctx2.fillRect(hx - 2, hy - 2, 4, 4);
    }
    _ctx2.font = "9px Courier New";
    _ctx2.fillStyle = "#0a0";
    _ctx2.textAlign = "left";
    _ctx2.fillText("TACTICAL MAP", mapX + 3, mapY + mapSize - 3);
  }
  function renderTerrainRadar(camera, getTerrainHeight2) {
    if (!currentMap.altitude)
      return;
    const tfWidth = 200;
    const tfHeight = 60;
    const tfX = _screenWidth2 / 2 - tfWidth / 2;
    const tfY = _screenHeight2 - tfHeight - 85;
    _ctx2.fillStyle = "rgba(0, 20, 0, 0.85)";
    _ctx2.fillRect(tfX, tfY, tfWidth, tfHeight);
    _ctx2.strokeStyle = "#0a0";
    _ctx2.lineWidth = 1;
    _ctx2.strokeRect(tfX + 1, tfY + 1, tfWidth - 2, tfHeight - 2);
    _ctx2.strokeStyle = "#0f0";
    _ctx2.lineWidth = 2;
    _ctx2.strokeRect(tfX, tfY, tfWidth, tfHeight);
    const cornerSize = 5;
    _ctx2.fillStyle = "#0f0";
    _ctx2.fillRect(tfX, tfY, cornerSize, 2);
    _ctx2.fillRect(tfX, tfY, 2, cornerSize);
    _ctx2.fillRect(tfX + tfWidth - cornerSize, tfY, cornerSize, 2);
    _ctx2.fillRect(tfX + tfWidth - 2, tfY, 2, cornerSize);
    _ctx2.fillRect(tfX, tfY + tfHeight - 2, cornerSize, 2);
    _ctx2.fillRect(tfX, tfY + tfHeight - cornerSize, 2, cornerSize);
    _ctx2.fillRect(tfX + tfWidth - cornerSize, tfY + tfHeight - 2, cornerSize, 2);
    _ctx2.fillRect(tfX + tfWidth - 2, tfY + tfHeight - cornerSize, 2, cornerSize);
    _ctx2.font = "bold 9px Courier New";
    _ctx2.fillStyle = "#0f0";
    _ctx2.textAlign = "center";
    _ctx2.fillText("TERRAIN RADAR", tfX + tfWidth / 2, tfY + 10);
    const scanRange = 300;
    const numSamples = 40;
    const graphX = tfX + 10;
    const graphWidth = tfWidth - 20;
    const graphY = tfY + 15;
    const graphHeight = tfHeight - 22;
    const sinAngle = Math.sin(camera.angle);
    const cosAngle = Math.cos(camera.angle);
    const terrainHeights = [];
    let maxHeight = camera.height;
    let minHeight = 0;
    for (let i = 0;i < numSamples; i++) {
      const dist = i / numSamples * scanRange;
      let sampleX = camera.x - sinAngle * dist;
      let sampleY = camera.y - cosAngle * dist;
      sampleX = (sampleX % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      sampleY = (sampleY % CONFIG.MAP_SIZE + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
      const height = getTerrainHeight2(sampleX, sampleY);
      terrainHeights.push(height);
      if (height > maxHeight)
        maxHeight = height;
    }
    maxHeight = Math.max(maxHeight + 50, camera.height + 100);
    minHeight = Math.max(0, Math.min(...terrainHeights) - 20);
    const heightRange = maxHeight - minHeight;
    _ctx2.strokeStyle = "rgba(0, 100, 0, 0.3)";
    _ctx2.lineWidth = 1;
    for (let alt = 0;alt <= maxHeight; alt += 100) {
      if (alt < minHeight)
        continue;
      const y = graphY + graphHeight - (alt - minHeight) / heightRange * graphHeight;
      if (y >= graphY && y <= graphY + graphHeight) {
        _ctx2.beginPath();
        _ctx2.moveTo(graphX, y);
        _ctx2.lineTo(graphX + graphWidth, y);
        _ctx2.stroke();
      }
    }
    _ctx2.fillStyle = "rgba(139, 90, 43, 0.6)";
    _ctx2.strokeStyle = "#8B5A2B";
    _ctx2.lineWidth = 1;
    _ctx2.beginPath();
    _ctx2.moveTo(graphX, graphY + graphHeight);
    for (let i = 0;i < numSamples; i++) {
      const x = graphX + i / numSamples * graphWidth;
      const normalizedHeight = (terrainHeights[i] - minHeight) / heightRange;
      const y = graphY + graphHeight - normalizedHeight * graphHeight;
      if (i === 0) {
        _ctx2.lineTo(x, y);
      } else {
        _ctx2.lineTo(x, y);
      }
    }
    _ctx2.lineTo(graphX + graphWidth, graphY + graphHeight);
    _ctx2.closePath();
    _ctx2.fill();
    _ctx2.stroke();
    const heliAltY = graphY + graphHeight - (camera.height - minHeight) / heightRange * graphHeight;
    _ctx2.setLineDash([4, 4]);
    _ctx2.strokeStyle = "#0f0";
    _ctx2.lineWidth = 1;
    _ctx2.beginPath();
    _ctx2.moveTo(graphX, heliAltY);
    _ctx2.lineTo(graphX + graphWidth, heliAltY);
    _ctx2.stroke();
    _ctx2.setLineDash([]);
    _ctx2.fillStyle = "#0f0";
    _ctx2.beginPath();
    _ctx2.moveTo(graphX - 2, heliAltY);
    _ctx2.lineTo(graphX + 6, heliAltY - 4);
    _ctx2.lineTo(graphX + 6, heliAltY + 4);
    _ctx2.closePath();
    _ctx2.fill();
    let collisionWarning = false;
    let warningDist = 0;
    for (let i = 0;i < numSamples; i++) {
      if (terrainHeights[i] > camera.height - 20) {
        collisionWarning = true;
        warningDist = i / numSamples * scanRange;
        break;
      }
    }
    if (collisionWarning) {
      const blinkOn = Math.floor(performance.now() / 200) % 2 === 0;
      if (blinkOn) {
        _ctx2.fillStyle = "#ff0000";
        _ctx2.font = "bold 10px Courier New";
        _ctx2.textAlign = "center";
        _ctx2.fillText("PULL UP", tfX + tfWidth / 2, tfY + tfHeight - 3);
        const warnX = graphX + warningDist / scanRange * graphWidth;
        _ctx2.strokeStyle = "#ff0000";
        _ctx2.lineWidth = 2;
        _ctx2.beginPath();
        _ctx2.moveTo(warnX, graphY);
        _ctx2.lineTo(warnX, graphY + graphHeight);
        _ctx2.stroke();
      }
    }
    _ctx2.font = "9px Courier New";
    _ctx2.fillStyle = "#0f0";
    _ctx2.textAlign = "left";
    _ctx2.fillText(`ALT:${Math.floor(camera.height)}`, tfX + 4, tfY + tfHeight - 3);
    _ctx2.textAlign = "right";
    _ctx2.fillText(`${scanRange}m`, tfX + tfWidth - 4, tfY + tfHeight - 3);
  }

  // src/voxelvibe/render/hud.ts
  var exports_hud = {};
  __export(exports_hud, {
    setScreenSize: () => setScreenSize3,
    renderFlightPathPredictor: () => renderFlightPathPredictor,
    renderCompass: () => renderCompass,
    renderAttitudeIndicator: () => renderAttitudeIndicator,
    renderAltitudeLadder: () => renderAltitudeLadder,
    init: () => init3,
    drawHUDPanel: () => drawHUDPanel,
    applyNightVisionEffect: () => applyNightVisionEffect
  });
  var _ctx3;
  var _canvas = null;
  var _screenWidth3 = 800;
  var _screenHeight3 = 600;
  function init3(ctx, canvas) {
    _ctx3 = ctx;
    if (canvas)
      _canvas = canvas;
  }
  function setScreenSize3(width, height) {
    _screenWidth3 = width;
    _screenHeight3 = height;
  }
  function drawHUDPanel(x, y, width, height, title = null) {
    _ctx3.fillStyle = "rgba(0, 20, 0, 0.85)";
    _ctx3.fillRect(x, y, width, height);
    _ctx3.strokeStyle = "#0a0";
    _ctx3.lineWidth = 1;
    _ctx3.strokeRect(x + 1, y + 1, width - 2, height - 2);
    _ctx3.strokeStyle = "#0f0";
    _ctx3.lineWidth = 2;
    _ctx3.strokeRect(x, y, width, height);
    const cornerSize = 6;
    _ctx3.fillStyle = "#0f0";
    _ctx3.fillRect(x, y, cornerSize, 2);
    _ctx3.fillRect(x, y, 2, cornerSize);
    _ctx3.fillRect(x + width - cornerSize, y, cornerSize, 2);
    _ctx3.fillRect(x + width - 2, y, 2, cornerSize);
    _ctx3.fillRect(x, y + height - 2, cornerSize, 2);
    _ctx3.fillRect(x, y + height - cornerSize, 2, cornerSize);
    _ctx3.fillRect(x + width - cornerSize, y + height - 2, cornerSize, 2);
    _ctx3.fillRect(x + width - 2, y + height - cornerSize, 2, cornerSize);
    if (title) {
      _ctx3.fillStyle = "rgba(0, 80, 0, 0.5)";
      _ctx3.fillRect(x + 2, y + 2, width - 4, 16);
      _ctx3.font = "bold 11px Courier New";
      _ctx3.fillStyle = "#0f0";
      _ctx3.textAlign = "center";
      _ctx3.fillText(title, x + width / 2, y + 13);
    }
  }
  function renderCompass(heading) {
    const compassWidth = 250;
    const compassX = _screenWidth3 / 2 - compassWidth / 2;
    const compassY = 8;
    const compassHeight = 28;
    _ctx3.fillStyle = "rgba(0, 0, 0, 0.6)";
    _ctx3.fillRect(compassX, compassY, compassWidth, compassHeight);
    _ctx3.strokeStyle = "#0a0";
    _ctx3.lineWidth = 1;
    _ctx3.strokeRect(compassX, compassY, compassWidth, compassHeight);
    _ctx3.save();
    _ctx3.beginPath();
    _ctx3.rect(compassX + 1, compassY + 1, compassWidth - 2, compassHeight - 2);
    _ctx3.clip();
    const pixelsPerDegree = 2;
    _ctx3.font = "bold 11px Courier New";
    _ctx3.textAlign = "center";
    const cardinals = {
      0: "N",
      45: "NE",
      90: "E",
      135: "SE",
      180: "S",
      225: "SW",
      270: "W",
      315: "NW"
    };
    for (let deg = -180;deg <= 540; deg += 5) {
      let normDeg = (deg % 360 + 360) % 360;
      let diff = deg - heading;
      if (diff > 180)
        diff -= 360;
      if (diff < -180)
        diff += 360;
      if (Math.abs(diff) < compassWidth / 2 / pixelsPerDegree) {
        const x = _screenWidth3 / 2 + diff * pixelsPerDegree;
        _ctx3.strokeStyle = "#0f0";
        _ctx3.lineWidth = 1;
        _ctx3.beginPath();
        if (deg % 10 === 0) {
          _ctx3.moveTo(x, compassY + compassHeight - 10);
          _ctx3.lineTo(x, compassY + compassHeight - 2);
          _ctx3.stroke();
          if (cardinals[normDeg]) {
            _ctx3.fillStyle = "#0f0";
            _ctx3.fillText(cardinals[normDeg], x, compassY + 14);
          } else if (deg % 30 === 0) {
            _ctx3.fillStyle = "#0a0";
            _ctx3.font = "9px Courier New";
            _ctx3.fillText(normDeg.toString(), x, compassY + 14);
            _ctx3.font = "bold 11px Courier New";
          }
        } else {
          _ctx3.moveTo(x, compassY + compassHeight - 6);
          _ctx3.lineTo(x, compassY + compassHeight - 2);
          _ctx3.stroke();
        }
      }
    }
    _ctx3.restore();
    _ctx3.fillStyle = "#ff0";
    _ctx3.beginPath();
    _ctx3.moveTo(_screenWidth3 / 2, compassY - 2);
    _ctx3.lineTo(_screenWidth3 / 2 - 6, compassY + 6);
    _ctx3.lineTo(_screenWidth3 / 2 + 6, compassY + 6);
    _ctx3.closePath();
    _ctx3.fill();
  }
  function renderAltitudeLadder(altitude, verticalSpeed, _camDistance) {
    const ladderX = _screenWidth3 - 50;
    const ladderY = _screenHeight3 / 2 - 100;
    const ladderHeight = 200;
    const ladderWidth = 40;
    _ctx3.fillStyle = "rgba(0, 0, 0, 0.5)";
    _ctx3.fillRect(ladderX, ladderY, ladderWidth, ladderHeight);
    _ctx3.strokeStyle = "#0a0";
    _ctx3.lineWidth = 1;
    _ctx3.strokeRect(ladderX, ladderY, ladderWidth, ladderHeight);
    altitude = Math.round(altitude);
    const altPerPixel = 2;
    _ctx3.save();
    _ctx3.beginPath();
    _ctx3.rect(ladderX, ladderY, ladderWidth, ladderHeight);
    _ctx3.clip();
    const centerY = ladderY + ladderHeight / 2;
    for (let alt = Math.floor((altitude - 100) / 10) * 10;alt <= altitude + 100; alt += 10) {
      const yOffset = (altitude - alt) / altPerPixel;
      const y = centerY + yOffset;
      if (y >= ladderY && y <= ladderY + ladderHeight) {
        _ctx3.strokeStyle = "#0f0";
        _ctx3.lineWidth = 1;
        _ctx3.beginPath();
        if (alt % 50 === 0) {
          _ctx3.moveTo(ladderX, y);
          _ctx3.lineTo(ladderX + 15, y);
          _ctx3.stroke();
          _ctx3.font = "10px Courier New";
          _ctx3.fillStyle = "#0f0";
          _ctx3.textAlign = "left";
          _ctx3.fillText(alt.toString(), ladderX + 18, y + 3);
        } else {
          _ctx3.moveTo(ladderX, y);
          _ctx3.lineTo(ladderX + 8, y);
          _ctx3.stroke();
        }
      }
    }
    _ctx3.restore();
    _ctx3.fillStyle = "#0f0";
    _ctx3.font = "bold 14px Courier New";
    _ctx3.textAlign = "center";
    _ctx3.fillText(altitude.toString(), ladderX + ladderWidth / 2, ladderY + ladderHeight + 18);
    const vspeed = Math.round((verticalSpeed || 0) * 10);
    if (vspeed !== 0) {
      _ctx3.font = "10px Courier New";
      _ctx3.fillStyle = vspeed > 0 ? "#0f0" : "#f80";
      const vspeedStr = (vspeed > 0 ? "+" : "") + vspeed;
      _ctx3.fillText(vspeedStr, ladderX + ladderWidth / 2, ladderY - 5);
    }
  }
  function renderFlightPathPredictor(bank, forwardSpeed, yawRate) {
    const cx = _screenWidth3 / 2;
    const cy = _screenHeight3 / 2;
    const bankAngle = bank || 0;
    forwardSpeed = Math.abs(forwardSpeed || 0);
    yawRate = yawRate || 0;
    if (forwardSpeed < 0.5)
      return;
    _ctx3.save();
    _ctx3.setLineDash([5, 5]);
    _ctx3.strokeStyle = "#0f0";
    _ctx3.lineWidth = 1;
    _ctx3.beginPath();
    _ctx3.moveTo(cx, cy);
    let px = cx;
    let py = cy;
    let angle = 0;
    const steps = 30;
    const timeStep = 0.07;
    for (let i = 0;i < steps; i++) {
      const turnFactor = yawRate * 800;
      const advanceFactor = forwardSpeed * 3;
      angle += turnFactor * timeStep;
      px += Math.sin(angle) * advanceFactor;
      py -= Math.cos(angle) * advanceFactor * 0.5;
      _ctx3.lineTo(px, py);
      if (i > steps * 0.7) {
        _ctx3.globalAlpha = 1 - (i - steps * 0.7) / (steps * 0.3);
      }
    }
    _ctx3.stroke();
    _ctx3.globalAlpha = 0.5;
    _ctx3.setLineDash([]);
    _ctx3.beginPath();
    _ctx3.arc(px, py, 5, 0, Math.PI * 2);
    _ctx3.stroke();
    _ctx3.restore();
  }
  function renderAttitudeIndicator(cx, cy, bank, pitch) {
    const width = 120;
    const height = 40;
    const bankAngle = bank || 0;
    const pitchOffset = (pitch || 0) * 30;
    _ctx3.fillStyle = "rgba(0, 0, 0, 0.5)";
    _ctx3.fillRect(cx - width / 2, cy - height / 2, width, height);
    _ctx3.strokeStyle = "#0f0";
    _ctx3.lineWidth = 1;
    _ctx3.strokeRect(cx - width / 2, cy - height / 2, width, height);
    _ctx3.save();
    _ctx3.beginPath();
    _ctx3.rect(cx - width / 2 + 2, cy - height / 2 + 2, width - 4, height - 4);
    _ctx3.clip();
    _ctx3.save();
    _ctx3.translate(cx, cy + pitchOffset);
    _ctx3.rotate(bankAngle);
    _ctx3.fillStyle = "#234";
    _ctx3.fillRect(-width, -height * 2, width * 2, height * 2);
    _ctx3.fillStyle = "#432";
    _ctx3.fillRect(-width, 0, width * 2, height * 2);
    _ctx3.strokeStyle = "#fff";
    _ctx3.lineWidth = 2;
    _ctx3.beginPath();
    _ctx3.moveTo(-width, 0);
    _ctx3.lineTo(width, 0);
    _ctx3.stroke();
    _ctx3.strokeStyle = "#888";
    _ctx3.lineWidth = 1;
    for (let p = -20;p <= 20; p += 10) {
      if (p !== 0) {
        const y = -p * 1.5;
        _ctx3.beginPath();
        _ctx3.moveTo(-20, y);
        _ctx3.lineTo(20, y);
        _ctx3.stroke();
      }
    }
    _ctx3.restore();
    _ctx3.restore();
    _ctx3.strokeStyle = "#ff0";
    _ctx3.lineWidth = 2;
    _ctx3.beginPath();
    _ctx3.moveTo(cx - 25, cy);
    _ctx3.lineTo(cx - 10, cy);
    _ctx3.moveTo(cx + 10, cy);
    _ctx3.lineTo(cx + 25, cy);
    _ctx3.moveTo(cx - 3, cy);
    _ctx3.lineTo(cx + 3, cy);
    _ctx3.moveTo(cx, cy - 3);
    _ctx3.lineTo(cx, cy + 3);
    _ctx3.stroke();
    _ctx3.strokeStyle = "#0f0";
    _ctx3.lineWidth = 1;
    _ctx3.beginPath();
    _ctx3.arc(cx, cy - height / 2 + 5, 35, Math.PI * 1.25, Math.PI * 1.75);
    _ctx3.stroke();
    _ctx3.save();
    _ctx3.translate(cx, cy - height / 2 + 5);
    _ctx3.rotate(bankAngle);
    _ctx3.fillStyle = "#0f0";
    _ctx3.beginPath();
    _ctx3.moveTo(0, -35);
    _ctx3.lineTo(-4, -28);
    _ctx3.lineTo(4, -28);
    _ctx3.closePath();
    _ctx3.fill();
    _ctx3.restore();
  }
  function applyNightVisionEffect(ambient) {
    const boostFactor = Math.min(4, Math.max(1.5, 1.5 / ambient));
    _ctx3.save();
    _ctx3.globalCompositeOperation = "lighter";
    _ctx3.globalAlpha = (boostFactor - 1) * 0.5;
    if (_canvas)
      _ctx3.drawImage(_canvas, 0, 0);
    if (ambient < 0.4) {
      _ctx3.globalAlpha = 0.3;
      if (_canvas)
        _ctx3.drawImage(_canvas, 0, 0);
    }
    _ctx3.globalCompositeOperation = "multiply";
    _ctx3.globalAlpha = 1;
    _ctx3.fillStyle = "#60ff60";
    _ctx3.fillRect(0, 0, _screenWidth3, _screenHeight3);
    _ctx3.globalCompositeOperation = "overlay";
    _ctx3.globalAlpha = 0.2;
    _ctx3.fillStyle = "#00ff00";
    _ctx3.fillRect(0, 0, _screenWidth3, _screenHeight3);
    _ctx3.globalCompositeOperation = "screen";
    _ctx3.globalAlpha = 0.15;
    _ctx3.fillStyle = "#003300";
    _ctx3.fillRect(0, 0, _screenWidth3, _screenHeight3);
    _ctx3.restore();
    _ctx3.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let y = 0;y < _screenHeight3; y += 4) {
      _ctx3.fillRect(0, y, _screenWidth3, 1);
    }
    _ctx3.fillStyle = "rgba(0, 255, 0, 0.02)";
    for (let i = 0;i < 20; i++) {
      const x = Math.random() * _screenWidth3;
      const y = Math.random() * _screenHeight3;
      _ctx3.fillRect(x, y, 2, 2);
    }
    const gradient = _ctx3.createRadialGradient(_screenWidth3 / 2, _screenHeight3 / 2, _screenHeight3 * 0.4, _screenWidth3 / 2, _screenHeight3 / 2, _screenHeight3 * 0.9);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    _ctx3.fillStyle = gradient;
    _ctx3.fillRect(0, 0, _screenWidth3, _screenHeight3);
    _ctx3.strokeStyle = "rgba(0, 255, 0, 0.12)";
    _ctx3.lineWidth = 3;
    _ctx3.strokeRect(2, 2, _screenWidth3 - 4, _screenHeight3 - 4);
  }

  // src/voxelvibe/input/keyboard.ts
  var exports_keyboard = {};
  __export(exports_keyboard, {
    mapSoldierMovement: () => mapSoldierMovement,
    mapHeliInput: () => mapHeliInput,
    createKeyState: () => createKeyState,
    SOLDIER_WEAPON_KEYS: () => SOLDIER_WEAPON_KEYS,
    PREVENT_DEFAULT_KEYS: () => PREVENT_DEFAULT_KEYS,
    HELI_WEAPON_KEYS: () => HELI_WEAPON_KEYS
  });
  function createKeyState() {
    return {};
  }
  function mapHeliInput(keys) {
    return {
      forward: !!(keys["KeyW"] || keys["ArrowUp"]),
      backward: !!(keys["KeyS"] || keys["ArrowDown"]),
      bankLeft: !!(keys["KeyA"] || keys["ArrowLeft"]),
      bankRight: !!(keys["KeyD"] || keys["ArrowRight"]),
      yawLeft: !!keys["KeyJ"],
      yawRight: !!keys["KeyL"],
      climbUp: !!keys["KeyR"],
      climbDown: !!keys["KeyF"],
      boost: !!keys["Space"],
      strafeLeft: !!keys["KeyQ"],
      strafeRight: !!keys["KeyE"]
    };
  }
  function mapSoldierMovement(keys) {
    return {
      forward: !!(keys["KeyW"] || keys["ArrowUp"]),
      backward: !!(keys["KeyS"] || keys["ArrowDown"]),
      left: !!(keys["KeyA"] || keys["ArrowLeft"]),
      right: !!(keys["KeyD"] || keys["ArrowRight"]),
      sprint: !!keys["ShiftLeft"] || !!keys["ShiftRight"],
      crouch: !!keys["ControlLeft"] || !!keys["ControlRight"],
      prone: !!keys["KeyV"]
    };
  }
  var PREVENT_DEFAULT_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "Tab"
  ]);
  var HELI_WEAPON_KEYS = {
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3
  };
  var SOLDIER_WEAPON_KEYS = {
    Digit1: "m4",
    Digit2: "sniper",
    Digit3: "pistol",
    Digit4: "javelin",
    Digit5: "stinger",
    Digit6: "c4",
    Digit7: "airstrike"
  };

  // src/voxelvibe/game/state.ts
  var exports_state = {};
  __export(exports_state, {
    startTransition: () => startTransition,
    releaseTransition: () => releaseTransition,
    isMenuState: () => isMenuState,
    createTransitionState: () => createTransitionState,
    createTelemetry: () => createTelemetry,
    createSessionStats: () => createSessionStats,
    createDefaultSettings: () => createDefaultSettings,
    createDefaultProfile: () => createDefaultProfile,
    PAUSE_OPTIONS: () => PAUSE_OPTIONS,
    MAIN_MENU_OPTIONS: () => MAIN_MENU_OPTIONS,
    GAME_STATES: () => GAME_STATES2,
    GAME_MODES: () => GAME_MODES3
  });
  var GAME_STATES2 = {
    TITLE: "title",
    MENU: "menu",
    CAMPAIGN: "campaign",
    FREEPLAY: "freeplay",
    SETTINGS: "settings",
    ACHIEVEMENTS: "achievements",
    LEADERBOARD: "leaderboard",
    HOWTO: "howto",
    BRIEFING: "briefing",
    PLAYING: "playing",
    PAUSED: "paused",
    VICTORY: "victory",
    DEFEAT: "defeat",
    MISSION_GENERATOR: "mission_generator",
    CUSTOM_MISSION: "custom_mission"
  };
  var GAME_MODES3 = {
    COMANCHE: "comanche",
    DELTA: "delta"
  };
  function isMenuState(state) {
    return state === GAME_STATES2.TITLE || state === GAME_STATES2.MENU || state === GAME_STATES2.CAMPAIGN || state === GAME_STATES2.FREEPLAY || state === GAME_STATES2.SETTINGS || state === GAME_STATES2.ACHIEVEMENTS || state === GAME_STATES2.LEADERBOARD || state === GAME_STATES2.HOWTO || state === GAME_STATES2.BRIEFING || state === GAME_STATES2.VICTORY || state === GAME_STATES2.DEFEAT || state === GAME_STATES2.MISSION_GENERATOR || state === GAME_STATES2.CUSTOM_MISSION;
  }
  function createTransitionState() {
    return {
      active: false,
      startTime: 0,
      duration: 500,
      targetState: null,
      phase: "fadeOut",
      holdForCallback: false,
      onSwitch: null,
      progress: 0
    };
  }
  function startTransition(state, targetState, duration, options) {
    state.active = true;
    state.startTime = performance.now();
    state.duration = duration;
    state.targetState = targetState;
    state.phase = "fadeOut";
    state.holdForCallback = options?.hold ?? false;
    state.onSwitch = options?.onSwitch ?? null;
    state.progress = 0;
  }
  function releaseTransition(state) {
    if (state.holdForCallback) {
      state.holdForCallback = false;
      state.phase = "fadeIn";
    }
  }
  function createDefaultSettings() {
    return {
      masterVolume: 0.5,
      sfxVolume: 0.7,
      mouseSensitivity: 1,
      invertY: false,
      drawDistance: 1200,
      fogEnabled: true,
      defaultMode: GAME_MODES3.COMANCHE
    };
  }
  function createDefaultProfile() {
    return {
      version: 1,
      highScore: 0,
      missionScores: {},
      missionStars: {},
      missionsCompleted: [],
      stats: {
        totalKills: 0,
        totalDeaths: 0,
        totalTimePlayed: 0,
        missionsPlayed: 0,
        missionsCompleted: 0,
        tanksDestroyed: 0,
        samsDestroyed: 0,
        buildingsDestroyed: 0
      },
      achievements: [],
      firstPlayDate: null,
      lastPlayDate: null
    };
  }
  function createSessionStats() {
    return { kills: 0, deaths: 0, score: 0, shotsFired: 0, hits: 0, submitted: false };
  }
  function createTelemetry(x, y) {
    return {
      shotsFired: 0,
      shotsHit: 0,
      missilesFired: 0,
      missilesHit: 0,
      missilesDodged: 0,
      damageDealt: 0,
      damageTaken: 0,
      distanceTraveled: 0,
      flightTime: 0,
      groundTime: 0,
      lastPosition: { x, y }
    };
  }
  var MAIN_MENU_OPTIONS = [
    "MODE",
    "CAMPAIGN",
    "RANDOM MISSION",
    "FREE PLAY",
    "AI MISSION",
    "MAP EDITOR",
    "SETTINGS",
    "ACHIEVEMENTS",
    "LEADERBOARD",
    "HOW TO PLAY"
  ];
  var PAUSE_OPTIONS = ["RESUME [ESC]", "RESTART MISSION", "QUIT TO MENU"];

  // src/voxelvibe/game/loop.ts
  var exports_loop = {};
  __export(exports_loop, {
    createFrameState: () => createFrameState,
    computeDeltaTime: () => computeDeltaTime
  });
  function createFrameState() {
    return {
      lastTime: 0,
      frameCount: 0,
      fps: 0,
      fpsUpdateTime: 0
    };
  }
  function computeDeltaTime(frame, timestamp) {
    const rawDelta = timestamp - frame.lastTime;
    const deltaTime = Math.min(50, Math.max(0, rawDelta));
    frame.lastTime = timestamp;
    frame.frameCount++;
    if (timestamp - frame.fpsUpdateTime >= 1000) {
      frame.fps = frame.frameCount;
      frame.frameCount = 0;
      frame.fpsUpdateTime = timestamp;
    }
    return deltaTime;
  }

  // src/voxelvibe/index.ts
  var Core = {
    CONFIG,
    GAME_STATES,
    GAME_MODES: GAME_MODES2,
    Math: exports_math
  };
  var Data = {
    Weapons: exports_weapons,
    Targets: exports_targets,
    Missions: exports_missions
  };
  var Systems = {
    Weather: exports_weather,
    Audio: exports_audio,
    Particles: exports_particles,
    Physics: exports_physics,
    Combat: exports_combat,
    AI: exports_ai
  };
  var Render = {
    Voxelspace: exports_voxelspace,
    Sprites: exports_sprites,
    Radar: exports_radar,
    HUD: exports_hud
  };
  var Input = {
    Keyboard: exports_keyboard
  };
  var Game = {
    State: exports_state,
    Loop: exports_loop
  };
  var VoxelVibe = {
    Core,
    Data,
    Systems,
    Render,
    Input,
    Game
  };
  if (typeof window !== "undefined") {
    window.VoxelVibe = VoxelVibe;
  }
  var voxelvibe_default = VoxelVibe;
})();
