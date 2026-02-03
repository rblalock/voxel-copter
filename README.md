# voxel-world

A new Agentuity project created with `agentuity create`.

## What You Get

A fully configured Agentuity project with:

- ✅ **TypeScript** - Full type safety out of the box
- ✅ **Bun runtime** - Fast JavaScript runtime and package manager
- ✅ **Hot reload** - Development server with auto-rebuild
- ✅ **Example agent** - Sample "hello" agent to get started
- ✅ **React frontend** - Pre-configured web interface
- ✅ **API routes** - Example API endpoints
- ✅ **Type checking** - TypeScript configuration ready to go

## Project Structure

```
my-app/
├── src/
│   ├── agent/            # Agent definitions
│   │   └── hello/
│   │       ├── agent.ts  # Example agent
│   │       └── index.ts  # Default exports
│   ├── api/              # API definitions
│   │   └── index.ts      # Example routes
│   └── web/              # React web application
│       ├── public/       # Static assets
│       ├── App.tsx       # Main React component
│       ├── frontend.tsx  # Entry point
│       └── index.html    # HTML template
├── AGENTS.md             # Agent guidelines
├── app.ts                # Application entry point
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Available Commands

After creating your project, you can run:

### Development

```bash
bun dev
```

Starts the development server at `http://localhost:3500`

### Build

```bash
bun build
```

Compiles your application into the `.agentuity/` directory

### Type Check

```bash
bun typecheck
```

Runs TypeScript type checking

### Deploy to Agentuity

```bash
bun run deploy
```

Deploys your application to the Agentuity cloud

## Next Steps

After creating your project:

1. **Customize the example agent** - Edit `src/agent/hello/agent.ts`
2. **Add new agents** - Create new folders in `src/agent/`
3. **Add new APIs** - Create new folders in `src/api/`
4. **Add Web files** - Create new routes in `src/web/`
5. **Customize the UI** - Edit `src/web/app.tsx`
6. **Configure your app** - Modify `app.ts` to add middleware, configure services, etc.

## Creating Custom Agents

Create a new agent by adding a folder in `src/agent/`:

```typescript
// src/agent/my-agent/agent.ts
import { createAgent } from '@agentuity/runtime';
import { s } from '@agentuity/schema';

const agent = createAgent({
	description: 'My amazing agent',
	schema: {
		input: s.object({
			name: s.string(),
		}),
		output: s.string(),
	},
	handler: async (_ctx, { name }) => {
		return `Hello, ${name}! This is my custom agent.`;
	},
});

export default agent;
```

## Adding API Routes

Create custom routes in `src/api/`:

```typescript
// src/api/my-agent/route.ts
import { createRouter } from '@agentuity/runtime';
import myAgent from './agent';

const router = createRouter();

router.get('/', async (c) => {
	const result = await myAgent.run({ message: 'Hello!' });
	return c.json(result);
});

router.post('/', myAgent.validator(), async (c) => {
	const data = c.req.valid('json');
	const result = await myAgent.run(data);
	return c.json(result);
});

export default router;
```

## Map Editor

VoxelCopter includes a built-in map editor for customizing missions.

### Accessing the Map Editor

- **Development:** `http://localhost:3500/src/web/public/mapeditor.html`
- **Production:** `http://localhost:3500/mapeditor.html`

### For Developers: Editing Main Missions

1. Open the map editor
2. Select a mission from the **Mission** dropdown (Mission 1-5)
3. Click **Load Mission** to load the existing mission data
4. Edit the mission:
   - **Spawns tab:** Place player start, airports, bases, helipads, enemy spawn zones
   - **Objectives tab:** Define mission objectives (destroy all, destroy type, reach location, etc.)
   - **Events tab:** Set up triggered events (timed spawns, messages, zone triggers)
5. Click **Save Mission** to download the JSON file
6. Save the downloaded file to `src/web/public/missions/mission-X.json` (overwrite the existing file)
7. The dev server will hot-reload, or run `bun run build` to rebuild

### For Players: Creating Custom Missions

1. Open the map editor
2. Select a map from the **Map** dropdown
3. Design your mission using the Spawns, Objectives, and Events tabs
4. Click **Save Local** to save to your browser's localStorage
5. In the game, access your custom mission from the **Custom Map** menu

### Map Editor Features

| Tab | Features |
|-----|----------|
| **Spawns** | Player Start, Airports, Bases, Helipads, Enemy Spawn Zones |
| **Objectives** | destroy_all, destroy_type, destroy_count, reach_location, survive_time, protect_target |
| **Events** | Triggers: kill_count, time_elapsed, enter_zone, objective_complete |
| | Actions: show_message, spawn_enemies, add_objective, complete_mission, fail_mission |

### Validation

Click **⚠ Validate** to check your mission for:
- Missing player start position
- Missing win conditions
- Invalid objective configurations
- Empty spawn zones

### Playtest

Click **▶ Playtest** to immediately test your mission in the game. This saves the mission to localStorage and opens the game in playtest mode.

## Learn More

- [Agentuity Documentation](https://agentuity.dev)
- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [Zod Documentation](https://zod.dev/)

## Requirements

- [Bun](https://bun.sh/) v1.0 or higher
- TypeScript 5+
