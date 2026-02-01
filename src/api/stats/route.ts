import { createRouter } from '@agentuity/runtime';

const router = createRouter();

const STATS_NAMESPACE = 'voxelcopter';
const TOTALS_KEY = 'stats:totals';
const LEADERBOARD_KEY = 'stats:leaderboard';
const MAX_LEADERBOARD = 20;

interface Totals {
	kills: number;
	deaths: number;
	missionsCompleted: number;
}

interface LeaderboardEntry {
	name: string;
	score: number;
	date: string;
}

interface GlobalStats {
	totals: Totals;
	leaderboard: LeaderboardEntry[];
	updatedAt: string;
}

router.get('/', async (c) => {
	try {
		const totalsResult = await c.var.kv.get<Totals>(STATS_NAMESPACE, TOTALS_KEY);
		const totals = totalsResult.exists
			? totalsResult.data
			: { kills: 0, deaths: 0, missionsCompleted: 0 };
		const leaderboardResult = await c.var.kv.get<LeaderboardEntry[]>(STATS_NAMESPACE, LEADERBOARD_KEY);
		const leaderboard = leaderboardResult.exists ? leaderboardResult.data : [];

		const stats: GlobalStats = {
			totals,
			leaderboard,
			updatedAt: new Date().toISOString(),
		};

		return c.json(stats);
	} catch (error) {
		c.var.logger.error('Failed to get stats:', error);
		return c.json({ error: 'Failed to retrieve stats' }, 500);
	}
});

router.post('/event', async (c) => {
	try {
		const body = await c.req.json();
		const { type, count = 1, name, score } = body;

		const totalsResult = await c.var.kv.get<Totals>(STATS_NAMESPACE, TOTALS_KEY);
		let totals = totalsResult.exists
			? totalsResult.data
			: { kills: 0, deaths: 0, missionsCompleted: 0 };

		switch (type) {
			case 'kill':
				totals.kills += count;
				break;
			case 'death':
				totals.deaths += count;
				break;
			case 'mission_complete':
				totals.missionsCompleted += count;
				break;
			case 'high_score':
				if (typeof score === 'number' && score > 0) {
				const leaderboardResult = await c.var.kv.get<LeaderboardEntry[]>(
					STATS_NAMESPACE,
					LEADERBOARD_KEY
				);
				let leaderboard = leaderboardResult.exists ? leaderboardResult.data : [];

					leaderboard.push({
						name: name || 'Anonymous',
						score,
						date: new Date().toISOString(),
					});

				leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
				leaderboard = leaderboard.slice(0, MAX_LEADERBOARD);

				await c.var.kv.set(STATS_NAMESPACE, LEADERBOARD_KEY, leaderboard);
			}
			break;
			default:
				return c.json({ error: 'Unknown event type' }, 400);
		}

		await c.var.kv.set(STATS_NAMESPACE, TOTALS_KEY, totals);

		c.var.logger.info('Stats event recorded', { type, count, name, score });

		return c.json({ success: true, totals });
	} catch (error) {
		c.var.logger.error('Failed to record stats event:', error);
		return c.json({ error: 'Failed to record event' }, 500);
	}
});

export default router;
