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
    VoxelVibe: () => VoxelVibe,
    UI: () => UI,
    Systems: () => Systems,
    Render: () => Render,
    Game: () => Game,
    Data: () => Data,
    Core: () => Core
  });

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

  // src/voxelvibe/index.ts
  var Core = {
    CONFIG,
    GAME_STATES,
    GAME_MODES
  };
  var Data = {};
  var Systems = {};
  var Game = {};
  var Render = {};
  var UI = {};
  var VoxelVibe = {
    Core,
    Data,
    Systems,
    Game,
    Render,
    UI
  };
  if (typeof window !== "undefined") {
    window.VoxelVibe = VoxelVibe;
  }
  var voxelvibe_default = VoxelVibe;
})();
