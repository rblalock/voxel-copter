/**
 * Simplified App component - kept for reference.
 * 
 * The main game is served directly from index.html.
 * This React app can be used for future UI features like:
 * - Settings menus
 * - Leaderboards
 * - Multiplayer lobbies
 * - Agent-powered features
 */

import { useState } from 'react';
import './App.css';

export function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="text-white flex flex-col items-center justify-center min-h-screen font-sans gap-8 p-8">
			<h1 className="text-4xl font-thin">Voxel World</h1>
			<p className="text-gray-400">
				This React app is available for future features.
			</p>
			<div className="flex flex-col items-center gap-4">
				<button
					className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg transition-colors"
					onClick={() => setCount((c) => c + 1)}
					type="button"
				>
					Count: {count}
				</button>
				<p className="text-gray-500 text-sm">
					Edit <code className="text-cyan-400">src/web/App.tsx</code> to customize
				</p>
			</div>
		</div>
	);
}
