import { createAgent } from '@agentuity/runtime';
import { s } from '@agentuity/schema';
import OpenAI from 'openai';

const client = new OpenAI();

const AgentInput = s.object({
	missionBriefing: s.string(),
	kills: s.number(),
	deaths: s.number(),
	accuracy: s.number(), // 0-100
	timeElapsed: s.number(), // seconds
	timeLimit: s.number(),
	objectivesCompleted: s.number(),
	objectivesTotal: s.number(),
	damageTaken: s.number(),
	victory: s.boolean(),
	difficulty: s.string(),
});

const AgentOutput = s.object({
	summary: s.string(),
	performance: s.string(), // 'excellent', 'good', 'average', 'poor'
	strengths: s.array(s.string()),
	improvements: s.array(s.string()),
	nextMissionHint: s.string().optional(),
});

const agent = createAgent('debrief', {
	description: 'Generates post-mission debrief analysis',
	schema: {
		input: AgentInput,
		output: AgentOutput,
	},
	handler: async (ctx, input) => {
		ctx.logger.info('Generating debrief', { victory: input.victory, kills: input.kills });

		const systemPrompt = `You are a military debrief officer for VoxelCopter.
Analyze the pilot's mission performance and provide constructive feedback.
Be encouraging but honest. Use military terminology.
Keep responses concise - this is a game, not a real military debrief.`;

		const userPrompt = `Mission Debrief:
- Outcome: ${input.victory ? 'VICTORY' : 'MISSION FAILED'}
- Difficulty: ${input.difficulty}
- Time: ${Math.floor(input.timeElapsed)}s / ${input.timeLimit}s limit
- Kills: ${input.kills}
- Deaths: ${input.deaths}
- Accuracy: ${input.accuracy}%
- Objectives: ${input.objectivesCompleted}/${input.objectivesTotal}
- Damage Taken: ${input.damageTaken}%

Original briefing: "${input.missionBriefing}"

Provide a brief debrief with performance rating, 2-3 strengths, 2-3 areas for improvement, and optionally a hint for the next mission.`;

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

			return {
				summary: typeof generated.summary === 'string'
					? generated.summary
					: input.victory
						? 'Mission accomplished.'
						: 'Mission failed.',
				performance: typeof generated.performance === 'string' ? generated.performance : 'average',
				strengths: Array.isArray(generated.strengths)
					? (generated.strengths as string[]).slice(0, 3)
					: ['Completed mission'],
				improvements: Array.isArray(generated.improvements)
					? (generated.improvements as string[]).slice(0, 3)
					: ['Practice more'],
				nextMissionHint: typeof generated.nextMissionHint === 'string' ? generated.nextMissionHint : undefined,
			};
		} catch (error) {
			ctx.logger.error('Debrief generation failed:', error);

			return {
				summary: input.victory ? 'Mission accomplished. Good work, pilot.' : 'Mission failed. Better luck next time.',
				performance: input.victory ? 'good' : 'average',
				strengths: ['Showed determination'],
				improvements: ['Continue training'],
			};
		}
	},
});

export default agent;
