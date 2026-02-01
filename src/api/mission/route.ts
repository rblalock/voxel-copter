import { createRouter } from '@agentuity/runtime';
import missionAgent from '@agent/mission';
import debriefAgent from '@agent/debrief';

const router = createRouter();

// POST /api/mission/generate - Generate a new mission
router.post('/generate', missionAgent.validator(), async (c) => {
	try {
		const data = c.req.valid('json');
		const result = await missionAgent.run(data);
		return c.json({ success: true, mission: result });
	} catch (error) {
		c.var.logger.error('Mission generation failed:', error);
		return c.json({ success: false, error: 'Failed to generate mission' }, 500);
	}
});

// POST /api/mission/debrief - Generate mission debrief
router.post('/debrief', debriefAgent.validator(), async (c) => {
	try {
		const data = c.req.valid('json');
		const result = await debriefAgent.run(data);
		return c.json({ success: true, debrief: result });
	} catch (error) {
		c.var.logger.error('Debrief generation failed:', error);
		return c.json({ success: false, error: 'Failed to generate debrief' }, 500);
	}
});

export default router;
