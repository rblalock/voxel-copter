// =====================================================================
// VoxelCopter — World Generation Module
// Extracted from game.html into a standalone module.
// All state access goes through the W (world-gen context) object.
// =====================================================================
(function() {
    'use strict';

    let W; // World-gen context — set via init()

    // ─── World Generation Functions ──────────────────────────────

    function findFlatSpot(tries, minHeight, maxSlope, avoidX, avoidY, minDist) {
        tries = tries || 200; minHeight = minHeight || 20; maxSlope = maxSlope || 20;
        avoidX = avoidX || 512; avoidY = avoidY || 512; minDist = minDist || 200;
        for (let i = 0; i < tries; i++) {
            const x = Math.random() * W.CONFIG.MAP_SIZE, y = Math.random() * W.CONFIG.MAP_SIZE;
            const h = W.getTerrainHeight(x, y);
            if (h < minHeight || h > 180) continue;
            if (W.isWaterAt(x, y, h)) continue;
            const s1 = W.estimateSlope(x, y, 15), s2 = W.estimateSlope(x, y, 30), s3 = W.estimateSlope(x, y, 50);
            if (s1 > maxSlope || s2 > maxSlope * 1.5 || s3 > maxSlope * 2.0) continue;
            const dx = x - avoidX, dy = y - avoidY;
            if (Math.sqrt(dx * dx + dy * dy) < minDist) continue;
            return { x, y, height: h };
        }
        return null;
    }

    function generateWorldStructures() {
        W.world.stamps = []; W.world.airports = []; W.world.bases = []; W.world.helipads = [];
        W.airportSpawnTimers = {}; W.helipadSpawnTimers = {};
        const airportCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < airportCount; i++) {
            const spot = findFlatSpot(300, 30, 15, 512, 512, 250 + i * 150);
            if (spot) {
                const result = generateAirport(spot.x, spot.y, Math.random() * Math.PI * 2);
                if (result.airport) W.world.stamps.push(...result.stamps);
            }
        }
        const baseCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < baseCount; i++) {
            const spot = findFlatSpot(300, 20, 20, 512, 512, 200 + i * 100);
            if (spot) {
                const sizes = ['small', 'medium', 'large'];
                const result = generateBase(spot.x, spot.y, W.FACTIONS.ENEMY, sizes[Math.floor(Math.random() * sizes.length)]);
                W.world.stamps.push(...result.stamps);
            }
        }
        const homeHelipad = generateHelipad(512, 512, W.FACTIONS.FRIENDLY);
        W.world.stamps.push(...homeHelipad.stamps);
        if (W.world.stamps.length > 0) applyMissionStamps(W.world.stamps);
    }

    function spawnTargetAt(typeKey, x, y, faction, baseHeight) {
        const template = W.TARGET_TYPES[typeKey];
        if (!template) return null;
        faction = faction || W.FACTIONS.ENEMY;
        const terrainH = baseHeight !== undefined && baseHeight !== null ? baseHeight : W.getTerrainHeight(x, y);
        const heightOffset = typeof template.heightOffset === 'number' ? template.heightOffset : template.size * 0.5;
        let aiState = null;
        if (template.ai) {
            if (template.ai.type === 'patrol') {
                aiState = { type: 'patrol', speed: template.ai.speed, patrolRadius: template.ai.patrolRadius, patrolCenter: {x, y}, patrolAngle: Math.random() * Math.PI * 2, patrolDirection: Math.random() > 0.5 ? 1 : -1, detectRange: template.ai.detectRange, engageRange: template.ai.engageRange, fireRate: template.ai.fireRate, bulletSpeed: template.ai.bulletSpeed, bulletDamage: template.ai.bulletDamage, lastFired: 0, state: 'patrol' };
            } else if (template.ai.type === 'sam') {
                aiState = { type: 'sam', fireRate: template.ai.fireRate, lastFired: 0, range: template.ai.range, missileSpeed: template.ai.missileSpeed, missileDamage: template.ai.missileDamage };
            } else if (template.ai.type === 'infantry') {
                aiState = { type: 'infantry', state: 'patrol', patrolCenter: {x, y}, patrolRadius: template.ai.patrolRadius, patrolAngle: Math.random() * Math.PI * 2, patrolSpeed: template.ai.patrolSpeed, detectRange: template.ai.detectRange, engageRange: template.ai.engageRange, fireRate: template.ai.fireRate, accuracy: template.ai.accuracy, bulletSpeed: template.ai.bulletSpeed, bulletDamage: template.ai.bulletDamage, lastFired: 0, facingAngle: Math.random() * Math.PI * 2, pose: 'stand' };
            }
        }
        const target = {
            id: 'target_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            x, y, z: terrainH + heightOffset, type: template.type,
            domain: template.domain, faction, health: template.health,
            maxHealth: template.health, size: template.size, hitHeight: template.hitHeight,
            color: template.color, points: template.points, destroyed: false, ai: aiState
        };
        W.targets.push(target);
        return target;
    }

    function spawnMissionTargets(mission) {
        const isDelta = W.gameMode === W.GAME_MODES.DELTA;
        const targetConfig = isDelta ? (mission.targetsDelta || mission.targets) : mission.targets;
        if (!targetConfig) return;
        for (let i = 0; i < (targetConfig.tanks || 0); i++) spawnTarget('TANK');
        for (let i = 0; i < (targetConfig.soldiers || 0); i++) spawnTarget(Math.random() < 0.1 ? 'SNIPER' : 'SOLDIER');
        for (let i = 0; i < (targetConfig.buildings || 0); i++) spawnTarget('BUILDING');
        for (let i = 0; i < (targetConfig.sams || 0); i++) spawnTarget('SAM_SITE');
    }

    function spawnTarget(typeKey) {
        let x, y, attempts = 0;
        do {
            x = 100 + Math.random() * (W.CONFIG.MAP_SIZE - 200);
            y = 100 + Math.random() * (W.CONFIG.MAP_SIZE - 200);
            attempts++;
        } while (Math.abs(x - 512) < 300 && Math.abs(y - 512) < 300 && attempts < 30);
        spawnTargetAt(typeKey, x, y);
    }

    function enforceEntityBudget() {
        const active = W.targets.filter(t => !t.destroyed);
        const ground = active.filter(t => t.domain === W.DOMAINS.GROUND);
        const air = active.filter(t => t.domain === W.DOMAINS.AIR);
        const struct = active.filter(t => t.domain === W.DOMAINS.STRUCTURE);
        const removeFarthest = (list, excess) => {
            if (excess <= 0) return;
            list.sort((a, b) => W.distance2D(b.x, b.y, W.camera.x, W.camera.y) - W.distance2D(a.x, a.y, W.camera.x, W.camera.y));
            for (let i = 0; i < excess && i < list.length; i++) list[i].destroyed = true;
        };
        removeFarthest(ground, ground.length - W.ENTITY_BUDGET.maxGround);
        removeFarthest(air, air.length - W.ENTITY_BUDGET.maxAir);
        removeFarthest(struct, struct.length - W.ENTITY_BUDGET.maxStructures);
        const remaining = W.targets.filter(t => !t.destroyed);
        if (remaining.length > W.ENTITY_BUDGET.maxTotal) {
            remaining.sort((a, b) => W.distance2D(b.x, b.y, W.camera.x, W.camera.y) - W.distance2D(a.x, a.y, W.camera.x, W.camera.y));
            for (let i = W.ENTITY_BUDGET.maxTotal; i < remaining.length; i++) remaining[i].destroyed = true;
        }
    }

    function stampFlattenRect(cx, cy, width, length, heading, heightValue, feather) {
        feather = feather === undefined ? 2 : feather;
        const cos = Math.cos(heading), sin = Math.sin(heading);
        const hw = width / 2, hl = length / 2;
        for (let dy = -hl - feather; dy <= hl + feather; dy++) {
            for (let dx = -hw - feather; dx <= hw + feather; dx++) {
                const rx = cx + dx * cos - dy * sin;
                const ry = cy + dx * sin + dy * cos;
                const ix = Math.floor(rx) & (W.CONFIG.MAP_SIZE - 1);
                const iy = Math.floor(ry) & (W.CONFIG.MAP_SIZE - 1);
                const idx = iy * W.CONFIG.MAP_SIZE + ix;
                const distFromEdgeX = Math.max(0, Math.abs(dx) - hw);
                const distFromEdgeY = Math.max(0, Math.abs(dy) - hl);
                const distFromEdge = Math.sqrt(distFromEdgeX * distFromEdgeX + distFromEdgeY * distFromEdgeY);
                if (distFromEdge <= feather) {
                    const blend = distFromEdge / feather;
                    W.currentMap.altitude[idx] = Math.round(W.currentMap.altitude[idx] * blend + heightValue * (1 - blend));
                }
            }
        }
    }

    function stampColorRect(cx, cy, width, length, heading, abgrColor, alpha) {
        alpha = alpha === undefined ? 1 : alpha;
        const cos = Math.cos(heading), sin = Math.sin(heading);
        const hw = width / 2, hl = length / 2;
        for (let dy = -hl; dy <= hl; dy++) {
            for (let dx = -hw; dx <= hw; dx++) {
                const rx = cx + dx * cos - dy * sin;
                const ry = cy + dx * sin + dy * cos;
                const ix = Math.floor(rx) & (W.CONFIG.MAP_SIZE - 1);
                const iy = Math.floor(ry) & (W.CONFIG.MAP_SIZE - 1);
                const idx = iy * W.CONFIG.MAP_SIZE + ix;
                if (alpha >= 1) {
                    W.currentMap.color[idx] = abgrColor;
                } else {
                    const existing = W.currentMap.color[idx];
                    const eR = existing & 0xFF, eG = (existing >> 8) & 0xFF, eB = (existing >> 16) & 0xFF;
                    const nR = abgrColor & 0xFF, nG = (abgrColor >> 8) & 0xFF, nB = (abgrColor >> 16) & 0xFF;
                    const r = Math.round(eR * (1 - alpha) + nR * alpha);
                    const g = Math.round(eG * (1 - alpha) + nG * alpha);
                    const b = Math.round(eB * (1 - alpha) + nB * alpha);
                    W.currentMap.color[idx] = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
                }
            }
        }
    }

    function applyMissionStamps(stamps) {
        W.restoreBaseMap();
        for (const stamp of stamps) {
            if (stamp.type === 'color') {
                stampColorRect(stamp.x, stamp.y, stamp.width, stamp.length, stamp.heading || 0, stamp.color, stamp.alpha || 1);
            }
            // 'flatten' stamps skipped — rely on naturally flat terrain
        }
    }

    function generateHelipad(x, y, faction) {
        faction = faction || W.FACTIONS.ENEMY;
        const helipad = { id: 'helipad_' + Date.now() + '_' + Math.random(), x, y, faction, radius: 15 };
        W.world.helipads.push(helipad);
        const target = spawnTargetAt('HELIPAD', x, y, faction);
        if (target) helipad.targetId = target.id;
        const stamps = [
            { type: 'color', x, y, width: 26, length: 26, heading: 0, color: 0xFF2a2a2a, alpha: 1 },
            { type: 'color', x, y, width: 18, length: 18, heading: 0, color: 0xFF3a3a3a, alpha: 1 }
        ];
        return { helipad, stamps };
    }

    function generateAirport(x, y, heading, faction) {
        faction = faction || W.FACTIONS.ENEMY;
        const id = 'airport_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const runwayLength = 60, runwayWidth = 20;
        const runwayHeight = W.getTerrainHeight(x, y);
        if (runwayHeight < 15 || W.isWaterAt(x, y, runwayHeight)) return { stamps: [], airport: null };
        const airport = { id, x, y, heading, faction, length: runwayLength, width: runwayWidth, entities: [], baseHeight: runwayHeight };
        const stamps = [
            { type: 'color', x, y, width: runwayWidth, length: runwayLength, heading, color: 0xFF2a2a2a, alpha: 1 },
            { type: 'color', x, y, width: 2, length: runwayLength - 10, heading, color: 0xFF4a4a4a, alpha: 1 }
        ];
        const cos = Math.cos(heading), sin = Math.sin(heading), sideOffset = runwayWidth + 15;
        const hangar = spawnTargetAt('HANGAR', x + cos * 20 + sin * sideOffset, y - sin * 20 + cos * sideOffset, faction, runwayHeight);
        if (hangar) airport.entities.push(hangar);
        const tower = spawnTargetAt('CONTROL_TOWER', x - cos * 8 + sin * sideOffset, y + sin * 8 + cos * sideOffset, faction, runwayHeight);
        if (tower) airport.entities.push(tower);
        const fuel = spawnTargetAt('FUEL_DEPOT', x + cos * 35 + sin * sideOffset, y - sin * 35 + cos * sideOffset, faction, runwayHeight);
        if (fuel) airport.entities.push(fuel);
        const sam = spawnTargetAt('SAM_SITE', x - cos * 30 - sin * (sideOffset + 20), y + sin * 30 - cos * (sideOffset + 20), faction);
        if (sam) airport.entities.push(sam);
        W.world.airports.push(airport);
        return { stamps, airport };
    }

    function generateBase(x, y, faction, size) {
        faction = faction || W.FACTIONS.ENEMY;
        size = size || 'medium';
        const id = 'base_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const baseRadius = size === 'small' ? 60 : size === 'large' ? 120 : 90;
        const base = { id, x, y, faction, size, buildings: [], defenses: [] };
        const stamps = [];
        const buildingCount = size === 'small' ? 2 : size === 'large' ? 5 : 3;
        for (let i = 0; i < Math.min(2, buildingCount); i++) {
            const angle = (i / buildingCount) * Math.PI * 2 + Math.random() * 0.3;
            const dist = baseRadius * 0.5 + Math.random() * baseRadius * 0.3;
            const b = spawnTargetAt('BARRACKS', x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, faction);
            if (b) base.buildings.push(b);
        }
        const hx = x + (Math.random() - 0.5) * baseRadius * 0.6;
        const hy = y + (Math.random() - 0.5) * baseRadius * 0.6;
        const hp = spawnTargetAt('HELIPAD', hx, hy, faction);
        if (hp) {
            base.buildings.push(hp);
            W.world.helipads.push({ id: hp.id, x: hx, y: hy, faction });
            stamps.push({ type: 'color', x: hx, y: hy, width: 26, length: 26, heading: 0, color: 0xFF2a2a2a, alpha: 1 });
        }
        for (let i = 0; i < 3; i++) {
            const a = Math.random() * Math.PI * 2, d = baseRadius * 0.7 + Math.random() * baseRadius * 0.2;
            const s = spawnTargetAt('SOLDIER', x + Math.cos(a) * d, y + Math.sin(a) * d, faction);
            if (s) base.defenses.push(s);
        }
        if (size !== 'small') {
            const ta = Math.random() * Math.PI * 2;
            const t = spawnTargetAt('TANK', x + Math.cos(ta) * baseRadius * 0.8, y + Math.sin(ta) * baseRadius * 0.8, faction);
            if (t) base.defenses.push(t);
        }
        const sa = Math.random() * Math.PI * 2;
        const sm = spawnTargetAt('SAM_SITE', x + Math.cos(sa) * baseRadius, y + Math.sin(sa) * baseRadius, faction);
        if (sm) base.defenses.push(sm);
        W.world.bases.push(base);
        return { stamps, base };
    }

    function spawnAircraftFromAirport(airport) {
        if (!airport || airport.faction !== W.FACTIONS.ENEMY) return null;
        const roll = Math.random();
        const typeKey = roll < 0.15 ? 'AIR_TRANSPORT' : roll < 0.55 ? 'AIR_FIGHTER' : 'AIR_ATTACK_HELI';
        const cos = Math.cos(airport.heading), sin = Math.sin(airport.heading);
        const spawnX = airport.x + cos * (airport.length / 2 + 20);
        const spawnY = airport.y + sin * (airport.length / 2 + 20);
        const aircraft = spawnTargetAt(typeKey, spawnX, spawnY, airport.faction);
        if (aircraft) {
            aircraft.z = W.getTerrainHeight(spawnX, spawnY) + 30;
            if (aircraft.ai) { aircraft.ai.heading = airport.heading; aircraft.ai.patrolCenter = { x: airport.x, y: airport.y }; }
        }
        return aircraft;
    }

    function spawnHeliFromHelipad(helipad) {
        if (!helipad || helipad.faction === W.FACTIONS.FRIENDLY || helipad.faction === 'friendly') return null;
        const aircraft = spawnTargetAt('AIR_ATTACK_HELI', helipad.x, helipad.y, W.FACTIONS.ENEMY);
        if (aircraft) {
            aircraft.z = W.getTerrainHeight(helipad.x, helipad.y) + 20;
            if (aircraft.ai) { aircraft.ai.heading = Math.random() * Math.PI * 2; aircraft.ai.patrolCenter = { x: helipad.x, y: helipad.y }; }
        }
        return aircraft;
    }

    // ─── Module Export ─────────────────────────────────────────

    window.GameWorldGen = {
        init: function(w) { W = w; },
        findFlatSpot,
        generateWorldStructures,
        spawnTargetAt,
        spawnMissionTargets,
        spawnTarget,
        enforceEntityBudget,
        stampFlattenRect,
        stampColorRect,
        applyMissionStamps,
        generateHelipad,
        generateAirport,
        generateBase,
        spawnAircraftFromAirport,
        spawnHeliFromHelipad,
    };

})();
