/**
 * VoxelVibe Engine - Game Loop
 * requestAnimationFrame-based game loop with delta time and FPS tracking.
 */

/** Frame timing state. */
export interface FrameState {
	lastTime: number;
	frameCount: number;
	fps: number;
	fpsUpdateTime: number;
}

/** Creates initial frame state. */
export function createFrameState(): FrameState {
	return {
		lastTime: 0,
		frameCount: 0,
		fps: 0,
		fpsUpdateTime: 0,
	};
}

/**
 * Computes delta time and updates FPS counter.
 * Returns clamped delta time in milliseconds.
 */
export function computeDeltaTime(frame: FrameState, timestamp: number): number {
	const rawDelta = timestamp - frame.lastTime;
	const deltaTime = Math.min(50, Math.max(0, rawDelta));
	frame.lastTime = timestamp;

	// FPS calculation
	frame.frameCount++;
	if (timestamp - frame.fpsUpdateTime >= 1000) {
		frame.fps = frame.frameCount;
		frame.frameCount = 0;
		frame.fpsUpdateTime = timestamp;
	}

	return deltaTime;
}
