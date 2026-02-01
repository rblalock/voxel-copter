import { createAgent } from '@agentuity/runtime';
import { s } from '@agentuity/schema';
import OpenAI from 'openai';

const client = new OpenAI();

const WEATHER_OPTIONS = ['clear', 'dusk', 'night', 'fog', 'storm'] as const;
const DIFFICULTY_OPTIONS = ['easy', 'normal', 'hard', 'extreme'] as const;
const MODE_OPTIONS = ['comanche', 'delta', 'mixed'] as const;

// Input schema
const AgentInput = s.object({
	prompt: s.string().optional().describe('User request for mission type'),
	mode: s.enum(MODE_OPTIONS).optional().describe('Game mode'),
	difficulty: s.enum(DIFFICULTY_OPTIONS).optional().describe('Difficulty level'),
	mapIndex: s.number().optional().describe('Map index to use'),
});

// Entity spawn spec
const EntitySpawnSchema = s.object({
	type: s.string(),
	count: s.number(),
	area: s.string().optional(), // 'scattered', 'clustered', 'base', 'airport'
});

// Objective schema
const ObjectiveSchema = s.object({
	type: s.string(), // 'destroy_all', 'destroy_count', 'survive', 'reach_location'
	targetType: s.string().optional(),
	count: s.number().optional(),
	description: s.string(),
});

// Output schema
const AgentOutput = s.object({
	seed: s.number(),
	weather: s.enum(WEATHER_OPTIONS),
	timeLimit: s.number(), // seconds
	entities: s.array(EntitySpawnSchema),
	objectives: s.array(ObjectiveSchema),
	briefing: s.string(),
	briefingDelta: s.string().optional(),
	difficulty: s.enum(DIFFICULTY_OPTIONS),
	airportCount: s.number(),
	baseCount: s.number(),
});

const agent = createAgent('mission', {
	description: 'Generates dynamic missions for VoxelCopter based on user prompts',
	schema: {
		input: AgentInput,
		output: AgentOutput,
	},
	handler: async (ctx, input) => {
		const { prompt = 'Generate a balanced combat mission', mode = 'comanche', difficulty = 'normal' } = input;

		ctx.logger.info('Generating mission', { prompt, mode, difficulty });

		const systemPrompt = `You are a mission designer for VoxelCopter, a Comanche-style helicopter combat game.
Generate a mission configuration based on the user's request.

Available entity types:
- TANK: Ground vehicle, medium threat
- SOLDIER: Infantry, low threat, appears in groups
- BUILDING: Static structure, mission objective
- SAM_SITE: Anti-air defense, high threat
- AIR_FIGHTER: Enemy jet, high threat, fast
- AIR_ATTACK_HELI: Enemy helicopter, medium threat
- HANGAR, CONTROL_TOWER, BARRACKS, FUEL_DEPOT, HELIPAD: Base buildings

Difficulty scaling:
- easy: Few enemies, no aircraft, long time limit
- normal: Balanced enemies, some aircraft, medium time
- hard: Many enemies, aircraft patrols, short time
- extreme: Heavy resistance, multiple aircraft, very short time

Weather affects visibility:
- clear: Full visibility
- dusk: Reduced visibility, orange sky
- night: Very low visibility, need night vision
- fog: Limited visibility, atmospheric
- storm: Rain, lightning, dramatic

Respond with a JSON object matching the output schema. Be creative with briefings!`;

		const userPrompt = `Generate a ${difficulty} difficulty mission for ${mode} mode.
User request: "${prompt}"

Create an engaging mission with appropriate enemies, objectives, and a dramatic military briefing.`;

		try {
			const completion = await client.chat.completions.create({
				model: 'gpt-5-mini',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
			});

			const content = completion.choices[0]?.message?.content ?? '{}';
			const generated = JSON.parse(content) as Record<string, unknown>;

			const entities = Array.isArray(generated.entities) ? generated.entities : [];
			const objectives = Array.isArray(generated.objectives) ? generated.objectives : [];

			const result = {
				seed: typeof generated.seed === 'number' ? generated.seed : Math.floor(Math.random() * 1000000),
				weather: WEATHER_OPTIONS.includes(generated.weather as (typeof WEATHER_OPTIONS)[number])
					? (generated.weather as (typeof WEATHER_OPTIONS)[number])
					: 'clear',
				timeLimit: Math.max(60, Math.min(600, typeof generated.timeLimit === 'number' ? generated.timeLimit : 300)),
				entities: entities.slice(0, 20),
				objectives:
					objectives.length > 0
						? objectives.slice(0, 5)
						: [{ type: 'destroy_all', description: 'Destroy all enemy forces' }],
				briefing: typeof generated.briefing === 'string'
					? generated.briefing
					: 'Engage and destroy enemy forces in the area.',
				briefingDelta: typeof generated.briefingDelta === 'string' ? generated.briefingDelta : undefined,
				difficulty,
				airportCount: Math.max(0, Math.min(3, typeof generated.airportCount === 'number' ? generated.airportCount : 1)),
				baseCount: Math.max(0, Math.min(5, typeof generated.baseCount === 'number' ? generated.baseCount : 2)),
			};

			ctx.logger.info('Mission generated', {
				entityCount: result.entities.length,
				objectiveCount: result.objectives.length,
			});

			return result;
		} catch (error) {
			ctx.logger.error('Mission generation failed:', error);

			return {
				seed: Math.floor(Math.random() * 1000000),
				weather: 'clear',
				timeLimit: 300,
				entities: [
					{ type: 'TANK', count: 5, area: 'scattered' },
					{ type: 'SAM_SITE', count: 2, area: 'base' },
					{ type: 'SOLDIER', count: 10, area: 'scattered' },
				],
				objectives: [{ type: 'destroy_all', description: 'Destroy all enemy forces' }],
				briefing: 'Intelligence reports enemy activity in the area. Engage and destroy all hostile forces.',
				difficulty,
				airportCount: 1,
				baseCount: 2,
			};
		}
	},
});

export default agent;
