# VoxelVibe Parity Checklist (Baseline)

This checklist captures the current gameplay behavior and user-facing features for regression verification during refactoring.

## 1. Core Gameplay Features
- 3D voxel terrain rendered to a canvas with horizon/altitude effects
- Helicopter flight with altitude, yaw, and banking controls
- On-foot FPS-style movement with mouse look
- Map selection (1-29) via dropdown
- Radar/minimap style HUD for targets
- Draw distance slider with live updates
- Toggle fog on/off in settings
- Toggle NVG (night vision) and weather
- Pause/resume flow with ESC
- Basic scoring, telemetry, and session stats tracking
- Persistent settings/profile stored in localStorage

## 2. Game Modes
- **Comanche (Helicopter)**
  - Flight controls, aerial combat, countermeasures
- **Delta (On Foot)**
  - FPS movement, weapon reloads, infantry combat

## 3. Menu System
- Title screen -> Main menu transition
- Main menu with mode toggle (Comanche/Delta)
- Campaign mission selection
- Freeplay menu
- Settings menu (volume, mouse sensitivity, invert Y, fog, default mode)
- Achievements screen
- Leaderboard screen
- How-to screen
- Mission generator screen (G from main menu)
- Custom mission flow (map editor + playtest)
- Briefing screen for missions
- Pause menu during gameplay
- Victory and defeat screens

## 4. Mission System
- Campaign missions with briefings and objectives
- Freeplay mode for quick play
- Mission generator (AI/randomized mission setup)
- Custom missions via map editor + playtest parameter
- Objective types:
  - Destroy all targets
  - Destroy specific type/count
  - Survive time
  - Reach location
  - Protect target
- Mission results: victory/defeat, retry, return to menu

## 5. Weapons & Combat
- **Comanche weapons**
  - Cannon (infinite ammo)
  - Rockets (unguided)
  - Hellfire (guided missile)
  - Stinger (air-to-air guided)
  - Weapon cycling and numeric selection
  - Countermeasures: chaff and flare
- **Delta weapons**
  - M4 Carbine (auto)
  - Sniper rifle
  - Pistol
  - Javelin (anti-armor)
  - Stinger (anti-air)
  - C4 explosive
  - Airstrike support
- Damage multipliers vary by weapon vs target category (soldier, tank, building, SAM, aircraft)

## 6. Entity Types
- Ground: tanks, soldiers, snipers
- Structures: building, hangar, control tower, barracks, fuel depot, helipad, SAM site
- Air: fighter jet, transport aircraft, attack helicopter
- Friendly/neutral variants for bases/helipads

## 7. Audio
- Procedural audio via Web Audio API
- Menu navigation and confirm sounds
- Achievement sound cue
- Helicopter rotor and wind sounds (Comanche only)
- Weapon fire sounds (cannon, rockets, missiles)
- Explosion sound effects
- Global sound toggle (B)

## 8. Visual Effects
- Dynamic fog and configurable draw distance
- Weather presets: clear, dusk, night, fog, storm
- Rain particles and lightning in storm weather
- Particle effects: smoke, trail smoke, explosions, blood
- NVG visual mode
- UI overlays (altitude, speed, FPS, radar/targets)

## 9. Controls
- **Comanche**
  - W/S: forward/back
  - A/D: bank left/right
  - J/L: yaw left/right
  - R/F: altitude up/down
  - Q/E: look up/down
  - Space: boost
  - 1-4: select weapon
  - Z/X or [ ]: cycle weapons
  - ; / ': chaff/flare
  - T: toggle targeting crosshairs
  - Tab: cycle targets
- **Delta**
  - WASD: move
  - Mouse: look
  - Shift: sprint
  - Ctrl: crouch
  - V: prone
  - Click: fire
  - R: reload
  - Z/X: cycle weapons
  - 1-7: select weapon
  - T: toggle targeting crosshairs
  - Tab: cycle targets
- **General**
  - E: enter/exit helicopter
  - M: cycle weather
  - N: toggle NVG
  - B: toggle sound
  - H: hide controls panel
  - ESC: pause
