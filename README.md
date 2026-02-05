# voxel-world

VoxelCopter is a Comanche-style voxel terrain game and mission sandbox built on Agentuity. It renders classic heightmap terrain in the browser and layers missions, AI-generated objectives, and a map editor on top.

<img width="3791" height="1916" alt="image" src="https://github.com/user-attachments/assets/8d26a3ea-f627-4486-9f1d-06aae32356a2" />


## What this is

- A browser-playable voxel terrain demo with helicopter (Comanche) and on-foot (Delta) modes.
- A mission system with objectives, events, and spawn layouts defined in JSON.
- A map editor to build or iterate on mission layouts.

## How it works

- `src/web/index.html` runs the game loop and canvas renderer.
- Terrain rendering uses a VoxelSpace-style heightmap ray-caster driven by color/height map pairs in `src/web/public/maps/` (`C*.png` color, `D*.png` height).
- Missions are loaded from `src/web/public/missions/*.json` and merged with scripted objectives and events at runtime.
- `src/web/public/mapeditor.html` loads the same maps to place spawns, objectives, and events, exporting JSON.
- Agentuity routes power AI mission generation and debriefs (`src/api/mission/route.ts`) plus global stats/leaderboards (`src/api/stats/route.ts`).
- Shared constants are bundled from `src/voxelvibe/index.ts` into `src/web/public/game.js` via `bun run build`.

## Project layout

```
src/
  agent/        # Mission + debrief agents
  api/          # Mission + stats endpoints
  lib/          # Shared game utilities
  voxelvibe/    # Shared constants/types bundled for the client
  web/
    index.html  # Main game canvas + engine
    public/
      game.js           # Bundled constants (generated)
      mapeditor.html    # Map/mission editor
      maps/             # Color + height map PNGs
      missions/         # Mission JSON layouts
```

## Attribution

- Terrain rendering approach and the base map assets come from the VoxelSpace project: https://github.com/s-macke/VoxelSpace?tab=readme-ov-file

## Running and deploying

### Requirements

- Bun v1.0+
- TypeScript 5+

### Development

```bash
bun run dev
```

Starts the dev server at `http://localhost:3500`.

### Build

```bash
bun run build
```

Compiles the Agentuity app and rebuilds `src/web/public/game.js`.

### Typecheck

```bash
bun run typecheck
```

### Deploy

```bash
bun run deploy
```
