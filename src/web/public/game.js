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
    Render: () => Render,
    Physics: () => exports_physics,
    Particles: () => exports_particles,
    Missions: () => exports_missions,
    MathUtils: () => exports_math,
    Loop: () => exports_loop,
    Keyboard: () => exports_keyboard,
    Input: () => Input,
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
  function findNearestTarget(targets, x, y, maxDist = Infinity, filterFn, mapSize = 0) {
    let nearest = null;
    let nearestDist = maxDist;
    const half = mapSize / 2;
    for (const target of targets) {
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
  var GAME_MODES = {
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
    playTone: () => playTone,
    playMenuNavigate: () => playMenuNavigate,
    playMenuConfirm: () => playMenuConfirm,
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
    GAME_MODES: () => GAME_MODES2
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
  var GAME_MODES2 = {
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
      defaultMode: GAME_MODES2.COMANCHE
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
    GAME_MODES,
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
    Voxelspace: exports_voxelspace
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
