// =====================================================================
// VoxelCopter — Targeting System Module
// Extracted from game.html into a standalone module.
// All state access goes through the T (targeting context) object.
// =====================================================================
(function() {
    'use strict';

    let T; // Targeting context — set via init()

    // ─── Targeting Functions ─────────────────────────────────────

    function getTargetsInView(cam, maxRange) {
        maxRange = maxRange || 800;
        const validTypes = T.targetingSystem.getValidTargetTypes();
        if (!validTypes.requiresLock) return [];
        const sinAngle = Math.sin(cam.angle), cosAngle = Math.cos(cam.angle);
        const pitchFactor = (cam.horizon - T.screenHeight / 2) / 240.0;
        const visibleTargets = [];
        for (const target of T.targets) {
            if (target.destroyed) continue;
            if (target.faction !== T.FACTIONS.ENEMY) continue;
            if (target.type === 'soldier') continue;
            if (validTypes.domain) {
                if (validTypes.domain === 'surface') { if (target.domain === T.DOMAINS.AIR) continue; }
                else if (target.domain !== validTypes.domain) continue;
            }
            let dx = target.x - cam.x, dy = target.y - cam.y;
            if (dx > T.CONFIG.MAP_SIZE / 2) dx -= T.CONFIG.MAP_SIZE;
            if (dx < -T.CONFIG.MAP_SIZE / 2) dx += T.CONFIG.MAP_SIZE;
            if (dy > T.CONFIG.MAP_SIZE / 2) dy -= T.CONFIG.MAP_SIZE;
            if (dy < -T.CONFIG.MAP_SIZE / 2) dy += T.CONFIG.MAP_SIZE;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxRange || dist < 10) continue;
            const rx = dx * cosAngle - dy * sinAngle;
            const ry = -dx * sinAngle - dy * cosAngle;
            if (ry < 10) continue;
            const angleToTarget = Math.atan2(rx, ry);
            if (Math.abs(angleToTarget) > 0.6) continue;
            const dz = target.z - cam.height;
            const verticalAngle = Math.atan2(dz, dist);
            const verticalDiff = verticalAngle - pitchFactor;
            // LOS check
            let hasLOS = true;
            for (let s = 1; s < 5; s++) {
                const t = s / 5;
                const cx2 = ((cam.x + dx * t) % T.CONFIG.MAP_SIZE + T.CONFIG.MAP_SIZE) % T.CONFIG.MAP_SIZE;
                const cy2 = ((cam.y + dy * t) % T.CONFIG.MAP_SIZE + T.CONFIG.MAP_SIZE) % T.CONFIG.MAP_SIZE;
                const th = T.currentMap.altitude[(Math.floor(cy2) << T.CONFIG.MAP_SHIFT) + Math.floor(cx2)];
                if ((cam.height + (target.z - cam.height) * t) < th + 5) { hasLOS = false; break; }
            }
            if (!hasLOS) continue;
            const totalAngle = Math.sqrt(angleToTarget * angleToTarget + verticalDiff * verticalDiff);
            visibleTargets.push({ target, dist, angleFromCrosshair: totalAngle, screenAngleX: angleToTarget, screenAngleY: verticalDiff, rx, ry });
        }
        visibleTargets.sort((a, b) => a.angleFromCrosshair - b.angleFromCrosshair);
        return visibleTargets;
    }

    function findTargetInCrosshair(cam, maxRange) {
        maxRange = maxRange || 500;
        const sinAngle = Math.sin(cam.angle), cosAngle = Math.cos(cam.angle);
        const pitchFactor = (cam.horizon - T.screenHeight / 2) / 240.0;
        let bestTarget = null, bestDist = maxRange;
        const crosshairTolerance = 0.15;
        for (const target of T.targets) {
            if (target.destroyed || target.faction !== T.FACTIONS.ENEMY) continue;
            let dx = target.x - cam.x, dy = target.y - cam.y;
            if (dx > T.CONFIG.MAP_SIZE / 2) dx -= T.CONFIG.MAP_SIZE; if (dx < -T.CONFIG.MAP_SIZE / 2) dx += T.CONFIG.MAP_SIZE;
            if (dy > T.CONFIG.MAP_SIZE / 2) dy -= T.CONFIG.MAP_SIZE; if (dy < -T.CONFIG.MAP_SIZE / 2) dy += T.CONFIG.MAP_SIZE;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxRange || dist < 10) continue;
            const rx = dx * cosAngle - dy * sinAngle;
            const ry = -dx * sinAngle - dy * cosAngle;
            if (ry < 10) continue;
            const angleToTarget = Math.atan2(rx, ry);
            const dz = target.z - cam.height;
            const verticalDiff = Math.abs(Math.atan2(dz, dist) - pitchFactor);
            const totalAngleDiff = Math.sqrt(angleToTarget * angleToTarget + verticalDiff * verticalDiff);
            if (totalAngleDiff < crosshairTolerance && dist < bestDist) { bestTarget = target; bestDist = dist; }
        }
        if (!bestTarget) {
            const coneTolerance = 0.4;
            bestDist = maxRange;
            for (const target of T.targets) {
                if (target.destroyed || target.faction !== T.FACTIONS.ENEMY) continue;
                let dx = target.x - cam.x, dy = target.y - cam.y;
                if (dx > T.CONFIG.MAP_SIZE / 2) dx -= T.CONFIG.MAP_SIZE; if (dx < -T.CONFIG.MAP_SIZE / 2) dx += T.CONFIG.MAP_SIZE;
                if (dy > T.CONFIG.MAP_SIZE / 2) dy -= T.CONFIG.MAP_SIZE; if (dy < -T.CONFIG.MAP_SIZE / 2) dy += T.CONFIG.MAP_SIZE;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > maxRange || dist < 10) continue;
                const rx = dx * cosAngle - dy * sinAngle;
                const ry = -dx * sinAngle - dy * cosAngle;
                if (ry < 10) continue;
                const angleToTarget = Math.atan2(rx, ry);
                if (Math.abs(angleToTarget) < coneTolerance && dist < bestDist) { bestTarget = target; bestDist = dist; }
            }
        }
        return bestTarget;
    }

    function findNearestTarget(x, y, options) {
        options = options || {};
        const { airToAir = false, faction = T.FACTIONS.ENEMY, maxRange = Infinity } = options;
        let nearest = null, nearestDist = maxRange;
        for (const target of T.targets) {
            if (target.destroyed) continue;
            if (faction && target.faction !== faction) continue;
            if (airToAir && target.domain !== T.DOMAINS.AIR) continue;
            let dx = target.x - x, dy = target.y - y;
            if (dx > T.CONFIG.MAP_SIZE / 2) dx -= T.CONFIG.MAP_SIZE; if (dx < -T.CONFIG.MAP_SIZE / 2) dx += T.CONFIG.MAP_SIZE;
            if (dy > T.CONFIG.MAP_SIZE / 2) dy -= T.CONFIG.MAP_SIZE; if (dy < -T.CONFIG.MAP_SIZE / 2) dy += T.CONFIG.MAP_SIZE;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) { nearestDist = dist; nearest = target; }
        }
        return nearest;
    }

    function cycleTarget(direction) {
        direction = direction || 1;
        const now = performance.now();
        if (now - T.targetingSystem.lastCycleTime < 200) return;
        T.targetingSystem.lastCycleTime = now;
        const cam = T.gameMode === T.GAME_MODES.DELTA ? T.getDeltaCamera() : T.camera;
        const visibleTargets = getTargetsInView(cam, T.targetingSystem.getTargetingRange());
        if (visibleTargets.length === 0) { T.targetingSystem.selectedTarget = null; T.targetingSystem.lockedTarget = null; return; }
        let currentIndex = -1;
        if (T.targetingSystem.selectedTarget) currentIndex = visibleTargets.findIndex(t => t.target === T.targetingSystem.selectedTarget);
        const newIndex = currentIndex === -1 ? 0 : (currentIndex + direction + visibleTargets.length) % visibleTargets.length;
        const newTarget = visibleTargets[newIndex]?.target;
        if (newTarget !== T.targetingSystem.selectedTarget) {
            T.targetingSystem.selectedTarget = newTarget;
            T.targetingSystem.lockedTarget = null; T.targetingSystem.lockProgress = 0; T.targetingSystem.isLocking = false;
        }
    }

    function selectTargetInCrosshairs() {
        const cam = T.gameMode === T.GAME_MODES.DELTA ? T.getDeltaCamera() : T.camera;
        const visibleTargets = getTargetsInView(cam, T.targetingSystem.getTargetingRange());
        if (visibleTargets.length === 0) return;
        if (visibleTargets[0].angleFromCrosshair > 0.26) return;
        const closestTarget = visibleTargets[0].target;
        if (closestTarget !== T.targetingSystem.selectedTarget) {
            T.targetingSystem.selectedTarget = closestTarget;
            T.targetingSystem.lockedTarget = null; T.targetingSystem.lockProgress = 0; T.targetingSystem.isLocking = false;
        }
    }

    function startLockAcquisition() {
        if (!T.targetingSystem.selectedTarget) return;
        const validTypes = T.targetingSystem.getValidTargetTypes();
        if (!validTypes.requiresLock) return;
        if (!T.targetingSystem.isLocking) { T.targetingSystem.isLocking = true; T.targetingSystem.lockStartTime = performance.now(); T.targetingSystem.lockProgress = 0; }
    }

    function stopLockAcquisition() { T.targetingSystem.isLocking = false; }

    function updateTargetingSystem(deltaTime) {
        const cam = T.gameMode === T.GAME_MODES.DELTA ? T.getDeltaCamera() : T.camera;
        const validTypes = T.targetingSystem.getValidTargetTypes();
        const targetingRange = T.targetingSystem.getTargetingRange();
        if (!T.targetingSystem.selectedTarget || T.targetingSystem.selectedTarget.destroyed) {
            const visible = getTargetsInView(cam, targetingRange);
            T.targetingSystem.selectedTarget = visible[0]?.target || null;
            T.targetingSystem.lockedTarget = null; T.targetingSystem.lockProgress = 0;
        }
        if (T.targetingSystem.selectedTarget) {
            const visible = getTargetsInView(cam, targetingRange);
            const stillVisible = visible.some(t => t.target === T.targetingSystem.selectedTarget);
            if (!stillVisible || T.targetingSystem.selectedTarget.destroyed) {
                T.targetingSystem.selectedTarget = visible[0]?.target || null;
                T.targetingSystem.lockedTarget = null; T.targetingSystem.lockProgress = 0; T.targetingSystem.isLocking = false;
            }
        }
        if (T.targetingSystem.selectedTarget && validTypes.requiresLock && !T.targetingSystem.isLocking && !T.targetingSystem.lockedTarget) {
            T.targetingSystem.isLocking = true; T.targetingSystem.lockStartTime = performance.now(); T.targetingSystem.lockProgress = 0;
        }
        if (T.targetingSystem.isLocking && T.targetingSystem.selectedTarget && validTypes.requiresLock) {
            const lockTime = T.targetingSystem.getLockTime();
            const elapsed = performance.now() - T.targetingSystem.lockStartTime;
            T.targetingSystem.lockProgress = Math.min(100, (elapsed / lockTime) * 100);
            const visible = getTargetsInView(cam, targetingRange);
            const targetInfo = visible.find(t => t.target === T.targetingSystem.selectedTarget);
            if (!targetInfo || targetInfo.angleFromCrosshair > 0.2) {
                T.targetingSystem.lockProgress = Math.max(0, T.targetingSystem.lockProgress - deltaTime * 0.1);
                if (T.targetingSystem.lockProgress <= 0) T.targetingSystem.isLocking = false;
            } else if (T.targetingSystem.lockProgress >= 100) {
                T.targetingSystem.lockedTarget = T.targetingSystem.selectedTarget; T.targetingSystem.isLocking = false;
            }
        }
        if (T.targetingSystem.lockedTarget?.destroyed) { T.targetingSystem.lockedTarget = null; T.targetingSystem.lockProgress = 0; }
    }

    // ─── Module Export ─────────────────────────────────────────

    window.GameTargeting = {
        init: function(t) { T = t; },
        getTargetsInView,
        findTargetInCrosshair,
        findNearestTarget,
        cycleTarget,
        selectTargetInCrosshairs,
        startLockAcquisition,
        stopLockAcquisition,
        updateTargetingSystem,
    };

})();
