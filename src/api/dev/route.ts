import { createRouter } from '@agentuity/runtime';

const router = createRouter();

// POST /api/dev/save-mission - Save mission to filesystem (dev only)
router.post('/save-mission', async (c) => {
	// Only allow in development
	const isDev = process.env.NODE_ENV !== 'production' && !process.env.AGENTUITY_CLOUD;

	if (!isDev) {
		return c.json({ success: false, error: 'This endpoint is only available in development mode' }, 403);
	}

	try {
		const { missionId, mission } = await c.req.json();

		// Validate missionId (1-99 to prevent path traversal)
		const id = parseInt(missionId, 10);
		if (isNaN(id) || id < 1 || id > 99) {
			return c.json({ success: false, error: 'Invalid mission ID (must be 1-99)' }, 400);
		}

		// Validate mission has required fields
		if (!mission || typeof mission !== 'object' || !mission.mapIndex) {
			return c.json({ success: false, error: 'Invalid mission data' }, 400);
		}

		// Write to file
		const filePath = `src/web/public/missions/mission-${id}.json`;
		const jsonContent = JSON.stringify(mission, null, 2);

		await Bun.write(filePath, jsonContent);

		c.var.logger.info(`Mission ${id} saved to ${filePath}`);
		return c.json({ success: true, path: filePath, missionId: id });
	} catch (error) {
		c.var.logger.error('Failed to save mission:', error);
		return c.json({ success: false, error: 'Failed to save mission file' }, 500);
	}
});

export default router;
