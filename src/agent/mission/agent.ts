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

CRITICAL RULES FOR ENTITY GENERATION:
1. You MUST generate entities based on the user's request. The entities array should NEVER be empty unless the user explicitly asks for no enemies.
2. If the user asks for "airplanes", "jets", "aircraft", or "fighters", include AIR_FIGHTER entities.
3. If the user asks for "tanks" or "armor", include TANK entities.
4. If the user asks for "helicopters" or "helis", include AIR_ATTACK_HELI entities.
5. If the user asks for "soldiers", "infantry", or "troops", include SOLDIER entities.
6. If the user asks for "SAM", "anti-air", or "AA", include SAM_SITE entities.
7. If the user says "lots of", "many", or "heavy", use higher counts (5-10+).
8. Always include a variety of enemies appropriate to the difficulty level.

Available entity types:
- TANK: Ground vehicle, medium threat
- SOLDIER: Infantry, low threat, appears in groups
- BUILDING: Static structure, mission objective
- SAM_SITE: Anti-air defense, high threat
- AIR_FIGHTER: Enemy jet, high threat, fast
- AIR_ATTACK_HELI: Enemy helicopter, medium threat
- HANGAR, CONTROL_TOWER, BARRACKS, FUEL_DEPOT, HELIPAD: Base buildings

Difficulty scaling (MINIMUM entity counts):
- easy: 3+ tanks, 5+ soldiers, no aircraft, long time limit
- normal: 5+ tanks, 2+ SAM_SITE, 8+ soldiers, 1+ aircraft, medium time
- hard: 8+ tanks, 4+ SAM_SITE, 15+ soldiers, 3+ aircraft, short time
- extreme: 12+ tanks, 6+ SAM_SITE, 20+ soldiers, 5+ aircraft, very short time

CRITICAL RULES FOR WEATHER:
1. If the user mentions "night", "dark", "evening", "midnight", or "nocturnal", set weather to "night".
2. If the user mentions "fog", "foggy", "mist", or "misty", set weather to "fog".
3. If the user mentions "storm", "stormy", "rain", or "thunder", set weather to "storm".
4. If the user mentions "dusk", "sunset", or "evening", set weather to "dusk".
5. Otherwise, default to "clear".

Weather options:
- clear: Full visibility
- dusk: Reduced visibility, orange sky
- night: Very low visibility, need night vision
- fog: Limited visibility, atmospheric
- storm: Rain, lightning, dramatic

EXAMPLE OUTPUT (for "night raid on airport, lots of airplanes"):
{
  "seed": 123456,
  "weather": "night",
  "timeLimit": 300,
  "entities": [
    { "type": "AIR_FIGHTER", "count": 6, "area": "airport" },
    { "type": "AIR_ATTACK_HELI", "count": 2, "area": "airport" },
    { "type": "SAM_SITE", "count": 4, "area": "airport" },
    { "type": "TANK", "count": 5, "area": "scattered" },
    { "type": "SOLDIER", "count": 12, "area": "base" }
  ],
  "objectives": [
    { "type": "destroy_count", "targetType": "AIR_FIGHTER", "count": 6, "description": "Destroy all enemy aircraft" }
  ],
  "briefing": "Under cover of darkness, infiltrate the enemy airbase and neutralize their air superiority assets.",
  "difficulty": "normal",
  "airportCount": 2,
  "baseCount": 1
}

Respond with a JSON object matching the output schema. Be creative with briefings!`;

		const userPrompt = `Generate a ${difficulty} difficulty mission for ${mode} mode.

User request: "${prompt}"

Parse the user's request carefully. Extract:
1. Desired enemy types (airplanes → AIR_FIGHTER, tanks → TANK, helicopters → AIR_ATTACK_HELI, etc.)
2. Quantities ("lots of" = 5-10+, "few" = 2-3, "many" = 8-15)
3. Time of day (night, evening, dark → weather: "night"; fog, mist → weather: "fog")
4. Location hints (airport → airportCount: 2+, base → baseCount: 2+)

IMPORTANT: You MUST populate the entities array with enemies. Do NOT return an empty entities array.
If the user mentions specific enemy types, include those. Always include supporting enemies too.

Create an engaging mission with appropriate enemies, objectives, and a dramatic military briefing.`;

		try {
			const completion = await client.chat.completions.create({
				model: 'gpt-4o-mini',  // Fixed model name
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
			});

			const content = completion.choices[0]?.message?.content;
			if (!content) {
				ctx.logger.error('No content in OpenAI response');
				throw new Error('No content in response');
			}
			
			// Log raw response for debugging
			ctx.logger.info('Raw OpenAI response:', content);
			
			let generated: Record<string, unknown>;
			try {
				generated = JSON.parse(content) as Record<string, unknown>;
			} catch (parseError) {
				ctx.logger.error('Failed to parse OpenAI response:', content);
				throw new Error('Invalid JSON response');
			}

			const rawEntities = Array.isArray(generated.entities) ? generated.entities : [];
			const rawObjectives = Array.isArray(generated.objectives) ? generated.objectives : [];
			
			ctx.logger.info('Raw entities from LLM:', JSON.stringify(rawEntities));
			ctx.logger.info('Raw weather from LLM:', generated.weather);

			// Normalize entities - ensure count is always a number
			let entities = rawEntities.slice(0, 20).map((e: Record<string, unknown>) => ({
				type: typeof e.type === 'string' ? e.type : 'SOLDIER',
				count: typeof e.count === 'number' ? e.count : (typeof e.quantity === 'number' ? e.quantity : 1),
				area: typeof e.area === 'string' ? e.area : 'scattered',
			}));

			// Fallback: If entities array is empty, generate defaults based on difficulty
			if (entities.length === 0) {
				ctx.logger.warn('LLM returned empty entities array, using difficulty-based defaults for:', difficulty);
				// Default fallback for any difficulty level
				const defaultEntities = [
					{ type: 'TANK', count: 5, area: 'scattered' },
					{ type: 'SAM_SITE', count: 2, area: 'base' },
					{ type: 'SOLDIER', count: 8, area: 'scattered' },
					{ type: 'AIR_FIGHTER', count: 1, area: 'airport' },
				];
				
				if (difficulty === 'easy') {
					entities = [
						{ type: 'TANK', count: 3, area: 'scattered' },
						{ type: 'SOLDIER', count: 5, area: 'scattered' },
					];
				} else if (difficulty === 'hard') {
					entities = [
						{ type: 'TANK', count: 8, area: 'scattered' },
						{ type: 'SAM_SITE', count: 4, area: 'base' },
						{ type: 'SOLDIER', count: 15, area: 'scattered' },
						{ type: 'AIR_FIGHTER', count: 3, area: 'airport' },
					];
				} else if (difficulty === 'extreme') {
					entities = [
						{ type: 'TANK', count: 12, area: 'scattered' },
						{ type: 'SAM_SITE', count: 6, area: 'base' },
						{ type: 'SOLDIER', count: 20, area: 'scattered' },
						{ type: 'AIR_FIGHTER', count: 5, area: 'airport' },
						{ type: 'AIR_ATTACK_HELI', count: 2, area: 'airport' },
					];
				} else {
					// normal or any other value
					entities = defaultEntities;
				}
				ctx.logger.info('Fallback entities generated:', entities.length);
			}

			// Normalize objectives - ensure required fields exist
			const objectives = rawObjectives.length > 0
				? rawObjectives.slice(0, 5).map((o: Record<string, unknown>) => ({
					type: typeof o.type === 'string' ? o.type : 'destroy_all',
					description: typeof o.description === 'string' ? o.description : 'Complete the objective',
					targetType: typeof o.targetType === 'string' ? o.targetType : undefined,
					count: typeof o.count === 'number' ? o.count : undefined,
				}))
				: [{ type: 'destroy_all', description: 'Destroy all enemy forces' }];

			const result = {
				seed: typeof generated.seed === 'number' ? generated.seed : Math.floor(Math.random() * 1000000),
				weather: WEATHER_OPTIONS.includes(generated.weather as (typeof WEATHER_OPTIONS)[number])
					? (generated.weather as (typeof WEATHER_OPTIONS)[number])
					: 'clear',
				timeLimit: Math.max(60, Math.min(600, typeof generated.timeLimit === 'number' ? generated.timeLimit : 300)),
				entities,
				objectives,
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
				seed: result.seed,
				weather: result.weather,
				briefing: result.briefing?.substring(0, 50),
			});

			// Log the full result for debugging
			ctx.logger.info('Full result:', JSON.stringify(result));

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
