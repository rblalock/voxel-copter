/**
 * VoxelVibe Engine - Radar Renderer
 * Tactical radar, minimap, and terrain-following radar overlays.
 */

import { CONFIG } from '../core/constants';
import { DOMAINS } from '../data/targets';
import { GAME_MODES } from '../core/constants';

/** Canvas 2D context - set via init() */
let _ctx: CanvasRenderingContext2D;
let _screenWidth: number = 800;
let _screenHeight: number = 600;

/** Initialize the radar renderer. */
export function init(ctx: CanvasRenderingContext2D): void {
	_ctx = ctx;
}

/** Update screen dimensions (call from resizeCanvas). */
export function setScreenSize(width: number, height: number): void {
	_screenWidth = width;
	_screenHeight = height;
}

/** Minimal camera state needed for radar rendering. */
export interface RadarCamera {
	x: number;
	y: number;
	angle: number;
	height: number;
	distance: number;
}

/** Minimal target state needed for radar rendering. */
export interface RadarTarget {
	x: number;
	y: number;
	type: string;
	destroyed: boolean;
	domain: string;
}

/** Minimal projectile state needed for radar rendering. */
export interface RadarProjectile {
	x: number;
	y: number;
}

/** Objective progress state for radar markers. */
export interface RadarObjectiveState {
	objectives: Array<{
		type: string;
		complete: boolean;
		x?: number;
		y?: number;
	}>;
}

/** World structure data for minimap rendering. */
export interface RadarWorld {
	bases: Array<{ x: number; y: number }>;
	airports: Array<{ x: number; y: number }>;
}

/** Player helicopter state for minimap rendering. */
export interface RadarPlayerState {
	heli: { visible: boolean; x: number; y: number };
}

export function renderRadar(
	camera: RadarCamera,
	targets: RadarTarget[],
	enemyProjectiles: RadarProjectile[],
	objectiveState: RadarObjectiveState,
): void {
    const radarSize = CONFIG.RADAR_SIZE;
    const radarX = 10;
    const radarY = _screenHeight - radarSize - 10;
    const radarCenterX = radarX + radarSize / 2;
    const radarCenterY = radarY + radarSize / 2;
    
    // Radar background
    _ctx.fillStyle = 'rgba(0, 20, 0, 0.7)';
    _ctx.fillRect(radarX, radarY, radarSize, radarSize);
    
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 2;
    _ctx.strokeRect(radarX, radarY, radarSize, radarSize);
    
    // Radar circles
    _ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.arc(radarCenterX, radarCenterY, radarSize / 4, 0, Math.PI * 2);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.arc(radarCenterX, radarCenterY, radarSize / 2 - 5, 0, Math.PI * 2);
    _ctx.stroke();
    
    // Cross lines
    _ctx.beginPath();
    _ctx.moveTo(radarCenterX, radarY + 5);
    _ctx.lineTo(radarCenterX, radarY + radarSize - 5);
    _ctx.moveTo(radarX + 5, radarCenterY);
    _ctx.lineTo(radarX + radarSize - 5, radarCenterY);
    _ctx.stroke();
    
    // Draw targets on radar
    const scale = (radarSize / 2 - 5) / CONFIG.RADAR_RANGE;
    
    for (const target of targets) {
        if (target.destroyed) continue;
        
        // Calculate relative position (physical distance, no wrapping)
        const physicalDx = target.x - camera.x;
        const physicalDy = target.y - camera.y;
        const physicalDist = Math.sqrt(physicalDx * physicalDx + physicalDy * physicalDy);
        
        // Skip targets that are actually far away (on other side of map)
        // This prevents "wrapped" targets from appearing on radar
        if (physicalDist > CONFIG.RADAR_RANGE * 2) continue;
        
        // Calculate wrapped distance for radar display
        let dx = physicalDx;
        let dy = physicalDy;
        if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE;
        if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
        if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE;
        if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONFIG.RADAR_RANGE) continue;
        
        // Rotate to match camera heading (inverted so radar rotates with player view)
        const sinAngle = Math.sin(-camera.angle);
        const cosAngle = Math.cos(-camera.angle);
        const rx = dx * cosAngle - dy * sinAngle;
        const ry = dx * sinAngle + dy * cosAngle;
        
        const radarTargetX = radarCenterX + rx * scale;
        const radarTargetY = radarCenterY - ry * scale;
        
        // Draw target dot - different colors for different types
        if (target.type === 'sam') {
            _ctx.fillStyle = '#ff6600'; // Orange for SAM
        } else if (target.type === 'tank') {
            _ctx.fillStyle = '#ff0000'; // Red for tank
        } else if (target.type === 'soldier') {
            _ctx.fillStyle = '#ffcc00'; // Yellow-orange for infantry
        } else {
            _ctx.fillStyle = '#ffff00'; // Yellow for building
        }
        _ctx.beginPath();
        _ctx.arc(radarTargetX, radarTargetY, 3, 0, Math.PI * 2);
        _ctx.fill();
    }
    
    // Draw enemy missiles on radar
    for (const ep of enemyProjectiles) {
        // Physical distance check to skip wrapped projectiles
        const physicalDx = ep.x - camera.x;
        const physicalDy = ep.y - camera.y;
        const physicalDist = Math.sqrt(physicalDx * physicalDx + physicalDy * physicalDy);
        if (physicalDist > CONFIG.RADAR_RANGE * 2) continue;
        
        let dx = physicalDx;
        let dy = physicalDy;
        if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE;
        if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
        if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE;
        if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONFIG.RADAR_RANGE) continue;
        
        const sinAngle = Math.sin(-camera.angle);
        const cosAngle = Math.cos(-camera.angle);
        const rx = dx * cosAngle - dy * sinAngle;
        const ry = dx * sinAngle + dy * cosAngle;
        
        const radarX2 = radarCenterX + rx * scale;
        const radarY2 = radarCenterY - ry * scale;
        
        // Blinking missile indicator
        const blinkOn = Math.floor(performance.now() / 100) % 2 === 0;
        if (blinkOn) {
            _ctx.fillStyle = '#ff00ff'; // Magenta for incoming missiles
            _ctx.beginPath();
            _ctx.arc(radarX2, radarY2, 4, 0, Math.PI * 2);
            _ctx.fill();
        }
    }
    
    // Draw extraction/reach objectives on radar
    if (objectiveState.objectives.length > 0) {
        for (const obj of objectiveState.objectives) {
            if (obj.type === 'reach_location' && !obj.complete) {
                let dx = obj.x - camera.x;
                let dy = obj.y - camera.y;
                
                if (dx > CONFIG.MAP_SIZE / 2) dx -= CONFIG.MAP_SIZE;
                if (dx < -CONFIG.MAP_SIZE / 2) dx += CONFIG.MAP_SIZE;
                if (dy > CONFIG.MAP_SIZE / 2) dy -= CONFIG.MAP_SIZE;
                if (dy < -CONFIG.MAP_SIZE / 2) dy += CONFIG.MAP_SIZE;
                
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Rotate to match camera heading
                const sinAngle = Math.sin(-camera.angle);
                const cosAngle = Math.cos(-camera.angle);
                const rx = dx * cosAngle - dy * sinAngle;
                const ry = dx * sinAngle + dy * cosAngle;
                
                // Calculate radar position and clamp to edge if outside range
                const radarRx = rx * scale;
                const radarRy = ry * scale;
                const radarDist = Math.sqrt(radarRx * radarRx + radarRy * radarRy);
                const maxRadarDist = radarSize / 2 - 8;

                let finalRx, finalRy;
                if (radarDist > maxRadarDist && radarDist > 0) {
                    // Clamp to radar edge, preserving direction via normalization
                    const clampScale = maxRadarDist / radarDist;
                    finalRx = radarRx * clampScale;
                    finalRy = radarRy * clampScale;
                } else {
                    finalRx = radarRx;
                    finalRy = radarRy;
                }

                const objX = radarCenterX + finalRx;
                const objY = radarCenterY - finalRy;
                
                // Draw extraction point as blinking cyan diamond
                const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
                _ctx.fillStyle = blinkOn ? '#00ffff' : '#008888';
                _ctx.beginPath();
                _ctx.moveTo(objX, objY - 5);
                _ctx.lineTo(objX + 4, objY);
                _ctx.lineTo(objX, objY + 5);
                _ctx.lineTo(objX - 4, objY);
                _ctx.closePath();
                _ctx.fill();
            }
        }
    }
    
    // Draw player (triangle pointing up = forward)
    _ctx.fillStyle = '#0f0';
    _ctx.beginPath();
    _ctx.moveTo(radarCenterX, radarCenterY - 6);
    _ctx.lineTo(radarCenterX - 4, radarCenterY + 4);
    _ctx.lineTo(radarCenterX + 4, radarCenterY + 4);
    _ctx.closePath();
    _ctx.fill();
    
    // Radar label
    _ctx.font = '10px Courier New';
    _ctx.fillStyle = '#0f0';
    _ctx.textAlign = 'left';
    _ctx.fillText('RADAR', radarX + 5, radarY + 12);
}

export function renderMinimap(
	camera: RadarCamera,
	targets: RadarTarget[],
	world: RadarWorld,
	playerState: RadarPlayerState,
	gameMode: string,
): void {
    const mapSize = 120;
    const mapX = _screenWidth - mapSize - 15;
    const mapY = 50;  // Below top bar
    const scale = mapSize / CONFIG.MAP_SIZE;

    _ctx.fillStyle = 'rgba(0, 20, 0, 0.8)';
    _ctx.fillRect(mapX, mapY, mapSize, mapSize);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    _ctx.fillStyle = '#f00';
    for (const base of world.bases) {
        const bx = mapX + base.x * scale;
        const by = mapY + base.y * scale;
        _ctx.fillRect(bx - 2, by - 2, 4, 4);
    }

    _ctx.fillStyle = '#f80';
    for (const airport of world.airports) {
        const ax = mapX + airport.x * scale;
        const ay = mapY + airport.y * scale;
        _ctx.fillRect(ax - 3, ay - 1, 6, 2);
    }

    _ctx.fillStyle = '#f00';
    for (const target of targets) {
        if (target.destroyed) continue;
        if (target.domain === DOMAINS.AIR) {
            const tx = mapX + target.x * scale;
            const ty = mapY + target.y * scale;
            _ctx.beginPath();
            _ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            _ctx.fill();
        }
    }

    _ctx.fillStyle = '#0f0';
    const px = mapX + camera.x * scale;
    const py = mapY + camera.y * scale;

    _ctx.save();
    _ctx.translate(px, py);
    _ctx.rotate(-camera.angle + Math.PI / 2);
    _ctx.beginPath();
    _ctx.moveTo(0, -4);
    _ctx.lineTo(-3, 3);
    _ctx.lineTo(3, 3);
    _ctx.closePath();
    _ctx.fill();
    _ctx.restore();

    if (gameMode === GAME_MODES.DELTA && playerState.heli.visible) {
        _ctx.fillStyle = '#0ff';
        const hx = mapX + playerState.heli.x * scale;
        const hy = mapY + playerState.heli.y * scale;
        _ctx.fillRect(hx - 2, hy - 2, 4, 4);
    }

    _ctx.font = '9px Courier New';
    _ctx.fillStyle = '#0a0';
    _ctx.textAlign = 'left';
    _ctx.fillText('TACTICAL MAP', mapX + 3, mapY + mapSize - 3);
}

// ============================================
// TERRAIN FOLLOWING RADAR (Comanche-style)
// Shows terrain height profile ahead of helicopter
// ============================================
export function renderTerrainRadar(
	camera: RadarCamera,
	getTerrainHeight: (x: number, y: number) => number,
): void {
    if (!currentMap.altitude) return;
    
    // Position: bottom center, above the HUD bar
    const tfWidth = 200;
    const tfHeight = 60;
    const tfX = _screenWidth / 2 - tfWidth / 2;
    const tfY = _screenHeight - tfHeight - 85;  // Above countermeasures panel
    
    // Background panel
    _ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
    _ctx.fillRect(tfX, tfY, tfWidth, tfHeight);
    
    // Border
    _ctx.strokeStyle = '#0a0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(tfX + 1, tfY + 1, tfWidth - 2, tfHeight - 2);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 2;
    _ctx.strokeRect(tfX, tfY, tfWidth, tfHeight);
    
    // Corner accents
    const cornerSize = 5;
    _ctx.fillStyle = '#0f0';
    _ctx.fillRect(tfX, tfY, cornerSize, 2);
    _ctx.fillRect(tfX, tfY, 2, cornerSize);
    _ctx.fillRect(tfX + tfWidth - cornerSize, tfY, cornerSize, 2);
    _ctx.fillRect(tfX + tfWidth - 2, tfY, 2, cornerSize);
    _ctx.fillRect(tfX, tfY + tfHeight - 2, cornerSize, 2);
    _ctx.fillRect(tfX, tfY + tfHeight - cornerSize, 2, cornerSize);
    _ctx.fillRect(tfX + tfWidth - cornerSize, tfY + tfHeight - 2, cornerSize, 2);
    _ctx.fillRect(tfX + tfWidth - 2, tfY + tfHeight - cornerSize, 2, cornerSize);
    
    // Title
    _ctx.font = 'bold 9px Courier New';
    _ctx.fillStyle = '#0f0';
    _ctx.textAlign = 'center';
    _ctx.fillText('TERRAIN RADAR', tfX + tfWidth / 2, tfY + 10);
    
    // Scan range (how far ahead to look)
    const scanRange = 300;  // Units ahead
    const numSamples = 40;  // Number of terrain samples
    const graphX = tfX + 10;
    const graphWidth = tfWidth - 20;
    const graphY = tfY + 15;
    const graphHeight = tfHeight - 22;
    
    // Calculate direction vectors
    const sinAngle = Math.sin(camera.angle);
    const cosAngle = Math.cos(camera.angle);
    
    // Sample terrain heights ahead
    const terrainHeights = [];
    let maxHeight = camera.height;  // Track max for scaling
    let minHeight = 0;
    
    for (let i = 0; i < numSamples; i++) {
        const dist = (i / numSamples) * scanRange;
        
        // Calculate world position ahead of helicopter
        let sampleX = camera.x - sinAngle * dist;
        let sampleY = camera.y - cosAngle * dist;
        
        // Wrap around map
        sampleX = ((sampleX % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
        sampleY = ((sampleY % CONFIG.MAP_SIZE) + CONFIG.MAP_SIZE) % CONFIG.MAP_SIZE;
        
        const height = getTerrainHeight(sampleX, sampleY);
        terrainHeights.push(height);
        
        if (height > maxHeight) maxHeight = height;
    }
    
    // Add margin to max height for display
    maxHeight = Math.max(maxHeight + 50, camera.height + 100);
    minHeight = Math.max(0, Math.min(...terrainHeights) - 20);
    const heightRange = maxHeight - minHeight;
    
    // Draw altitude scale lines (horizontal reference lines)
    _ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
    _ctx.lineWidth = 1;
    for (let alt = 0; alt <= maxHeight; alt += 100) {
        if (alt < minHeight) continue;
        const y = graphY + graphHeight - ((alt - minHeight) / heightRange) * graphHeight;
        if (y >= graphY && y <= graphY + graphHeight) {
            _ctx.beginPath();
            _ctx.moveTo(graphX, y);
            _ctx.lineTo(graphX + graphWidth, y);
            _ctx.stroke();
        }
    }
    
    // Draw terrain profile (filled polygon)
    _ctx.fillStyle = 'rgba(139, 90, 43, 0.6)';  // Brown terrain fill
    _ctx.strokeStyle = '#8B5A2B';
    _ctx.lineWidth = 1;
    
    _ctx.beginPath();
    _ctx.moveTo(graphX, graphY + graphHeight);  // Start at bottom left
    
    for (let i = 0; i < numSamples; i++) {
        const x = graphX + (i / numSamples) * graphWidth;
        const normalizedHeight = (terrainHeights[i] - minHeight) / heightRange;
        const y = graphY + graphHeight - normalizedHeight * graphHeight;
        
        if (i === 0) {
            _ctx.lineTo(x, y);
        } else {
            _ctx.lineTo(x, y);
        }
    }
    
    _ctx.lineTo(graphX + graphWidth, graphY + graphHeight);  // Bottom right
    _ctx.closePath();
    _ctx.fill();
    _ctx.stroke();
    
    // Draw helicopter altitude line (current flight path)
    const heliAltY = graphY + graphHeight - ((camera.height - minHeight) / heightRange) * graphHeight;
    
    // Helicopter altitude as dashed line
    _ctx.setLineDash([4, 4]);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.moveTo(graphX, heliAltY);
    _ctx.lineTo(graphX + graphWidth, heliAltY);
    _ctx.stroke();
    _ctx.setLineDash([]);
    
    // Draw helicopter icon at left (current position)
    _ctx.fillStyle = '#0f0';
    _ctx.beginPath();
    _ctx.moveTo(graphX - 2, heliAltY);
    _ctx.lineTo(graphX + 6, heliAltY - 4);
    _ctx.lineTo(graphX + 6, heliAltY + 4);
    _ctx.closePath();
    _ctx.fill();
    
    // Collision warning - check if terrain ahead is higher than current altitude
    let collisionWarning = false;
    let warningDist = 0;
    for (let i = 0; i < numSamples; i++) {
        if (terrainHeights[i] > camera.height - 20) {  // 20 unit clearance
            collisionWarning = true;
            warningDist = (i / numSamples) * scanRange;
            break;
        }
    }
    
    if (collisionWarning) {
        const blinkOn = Math.floor(performance.now() / 200) % 2 === 0;
        if (blinkOn) {
            _ctx.fillStyle = '#ff0000';
            _ctx.font = 'bold 10px Courier New';
            _ctx.textAlign = 'center';
            _ctx.fillText('PULL UP', tfX + tfWidth / 2, tfY + tfHeight - 3);
            
            // Mark collision point on radar
            const warnX = graphX + (warningDist / scanRange) * graphWidth;
            _ctx.strokeStyle = '#ff0000';
            _ctx.lineWidth = 2;
            _ctx.beginPath();
            _ctx.moveTo(warnX, graphY);
            _ctx.lineTo(warnX, graphY + graphHeight);
            _ctx.stroke();
        }
    }
    
    // Current altitude readout
    _ctx.font = '9px Courier New';
    _ctx.fillStyle = '#0f0';
    _ctx.textAlign = 'left';
    _ctx.fillText(`ALT:${Math.floor(camera.height)}`, tfX + 4, tfY + tfHeight - 3);
    
    // Range indicator
    _ctx.textAlign = 'right';
    _ctx.fillText(`${scanRange}m`, tfX + tfWidth - 4, tfY + tfHeight - 3);
}

