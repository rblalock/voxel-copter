// =====================================================================
// VoxelCopter — HUD & In-Game UI Module
// Extracted from game.html into a standalone module.
// All state access goes through the H (HUD context) object.
// =====================================================================
(function() {
    'use strict';

    let H; // HUD context — set via init()

    // ─── HUD Rendering Functions ───────────────────────────────────

    function renderScopeOverlay() {
        if (H.gameMode !== H.GAME_MODES.DELTA) return;
        if (!H.soldierScope.active) return;
        if (H.soldierWeapon.current !== 'sniper') return;
    
        const alpha = 0.85 * H.soldierScope.transitionTime;
        if (alpha <= 0) return;
    
        const cx = H.screenWidth / 2;
        const cy = H.screenHeight / 2;
        // Larger scope circle for better visibility (Delta Force style)
        const radius = Math.min(H.screenWidth, H.screenHeight) * 0.42;
    
        H.ctx.save();
        
        // Draw scope vignette - thinner black border around scope
        H.ctx.globalAlpha = alpha;
        
        // Create a path that covers the screen except for the scope circle
        H.ctx.beginPath();
        H.ctx.rect(0, 0, H.screenWidth, H.screenHeight);
        H.ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);  // Counter-clockwise to cut out
        H.ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        H.ctx.fill();
    
        // Scope ring (outer edge)
        H.ctx.strokeStyle = 'rgba(20, 20, 20, 0.95)';
        H.ctx.lineWidth = 8;
        H.ctx.beginPath();
        H.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        H.ctx.stroke();
        
        // Inner scope ring highlight
        H.ctx.strokeStyle = 'rgba(0, 255, 120, 0.6)';
        H.ctx.lineWidth = 1;
        H.ctx.beginPath();
        H.ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
        H.ctx.stroke();
    
        // Crosshair reticle
        H.ctx.strokeStyle = 'rgba(0, 255, 120, 0.9)';
        H.ctx.lineWidth = 1.5;
        const gap = 8;
        const lineLen = radius * 0.7;
        H.ctx.beginPath();
        // Horizontal lines
        H.ctx.moveTo(cx - lineLen, cy);
        H.ctx.lineTo(cx - gap, cy);
        H.ctx.moveTo(cx + gap, cy);
        H.ctx.lineTo(cx + lineLen, cy);
        // Vertical lines
        H.ctx.moveTo(cx, cy - lineLen);
        H.ctx.lineTo(cx, cy - gap);
        H.ctx.moveTo(cx, cy + gap);
        H.ctx.lineTo(cx, cy + lineLen);
        H.ctx.stroke();
        
        // Mil-dots on crosshair
        H.ctx.fillStyle = 'rgba(0, 255, 120, 0.8)';
        const dotSpacing = radius * 0.15;
        for (let i = 1; i <= 3; i++) {
            // Horizontal dots
            H.ctx.beginPath();
            H.ctx.arc(cx - gap - dotSpacing * i, cy, 2, 0, Math.PI * 2);
            H.ctx.fill();
            H.ctx.beginPath();
            H.ctx.arc(cx + gap + dotSpacing * i, cy, 2, 0, Math.PI * 2);
            H.ctx.fill();
            // Vertical dots
            H.ctx.beginPath();
            H.ctx.arc(cx, cy - gap - dotSpacing * i, 2, 0, Math.PI * 2);
            H.ctx.fill();
            H.ctx.beginPath();
            H.ctx.arc(cx, cy + gap + dotSpacing * i, 2, 0, Math.PI * 2);
            H.ctx.fill();
        }
    
        // Center dot
        H.ctx.fillStyle = 'rgba(0, 255, 120, 0.95)';
        H.ctx.beginPath();
        H.ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        H.ctx.fill();
    
        // Range finder display
        const rangeData = H.calculateRangeToTarget();
        const targetLabel = rangeData.target ? rangeData.target.type.toUpperCase() : '';
        const label = targetLabel ? `RNG: ${rangeData.distance}m | ${targetLabel}` : `RNG: ${rangeData.distance}m`;
    
        H.ctx.font = 'bold 13px Courier New';
        H.ctx.fillStyle = '#00ff88';
        H.ctx.textAlign = 'center';
        H.ctx.fillText(label, cx, cy + radius + 25);
        
        // Zoom indicator
        H.ctx.font = '11px Courier New';
        H.ctx.fillStyle = '#00aa55';
        H.ctx.fillText(`${H.soldierScope.zoom}x ZOOM`, cx, cy - radius - 15);
    
        H.ctx.restore();
    }
    

    function renderDeltaHUD() {
        const weapon = H.WEAPONS_DELTA[H.soldierWeapon.current];
        const state = H.soldierWeapon.weapons[H.soldierWeapon.current];
        if (!weapon || !state) return;
        const headingData = H.getDeltaHeadingData();
    
        const weaponPanelW = 200;
        const weaponPanelH = 95;
        const weaponPanelX = 10;
        const weaponPanelY = 10;
    
        H.drawHUDPanel(weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH, 'WEAPON');
    
        H.ctx.font = 'bold 14px Courier New';
        H.ctx.fillStyle = weapon.color;
        H.ctx.textAlign = 'left';
        H.ctx.fillText(weapon.name.toUpperCase(), weaponPanelX + 12, weaponPanelY + 35);
    
        H.ctx.font = '12px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.textAlign = 'right';
        const ammoDisplay = H.soldierWeapon.current === 'airstrike'
            ? `STR ${H.getAirstrikeCharges(state)}`
            : `${state.mag}/${state.mags}`;
        H.ctx.fillText(ammoDisplay, weaponPanelX + weaponPanelW - 12, weaponPanelY + 35);
    
        // Magazine icon
        H.ctx.strokeStyle = '#0f0';
        H.ctx.lineWidth = 1.5;
        H.ctx.strokeRect(weaponPanelX + 14, weaponPanelY + 43, 30, 12);
        H.ctx.fillStyle = '#0a0';
        H.ctx.fillRect(weaponPanelX + 18, weaponPanelY + 47, 18, 4);
        H.ctx.fillRect(weaponPanelX + 32, weaponPanelY + 45, 12, 2);
    
        // Weapon keys - reorganized to fit in panel
        H.ctx.font = '9px Courier New';
        H.ctx.fillStyle = '#0a0';
        H.ctx.textAlign = 'left';
        H.ctx.fillText('[1]M4 [2]SNP [3]PST [4]JAV', weaponPanelX + 12, weaponPanelY + 68);
        H.ctx.fillText('[5]STG [6]C4 [7]AIR [R]RLD', weaponPanelX + 12, weaponPanelY + 80);
        
        // Show C4 status if C4 is selected
        if (H.soldierWeapon.current === 'c4' && H.placedC4Charges.length > 0) {
            H.ctx.font = 'bold 10px Courier New';
            H.ctx.fillStyle = '#ff4400';
            H.ctx.fillText(`[FIRE TO DETONATE ${H.placedC4Charges.length}]`, weaponPanelX + 12, weaponPanelY + 92);
        }
    
        const compassPanelW = 220;
        const compassPanelH = 60;
        const compassPanelX = H.screenWidth - compassPanelW - 10;
        const compassPanelY = 10;
        H.drawHUDPanel(compassPanelX, compassPanelY, compassPanelW, compassPanelH, 'COMPASS');
    
        H.ctx.font = 'bold 18px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.textAlign = 'center';
        H.ctx.fillText(`${headingData.cardinal}`, compassPanelX + compassPanelW / 2, compassPanelY + 38);
    
        H.ctx.font = '12px Courier New';
        H.ctx.fillStyle = '#0a0';
        H.ctx.fillText(`HDG ${headingData.heading.toString().padStart(3, '0')}°`, compassPanelX + compassPanelW / 2, compassPanelY + 54);
    
        const statusPanelW = 220;
        const statusPanelH = 70;
        const statusPanelX = 10;
        const statusPanelY = H.screenHeight - statusPanelH - 10;
        H.drawHUDPanel(statusPanelX, statusPanelY, statusPanelW, statusPanelH, 'STATUS');
    
        const healthPercent = H.playerHealth / H.maxPlayerHealth;
        H.ctx.fillStyle = '#111';
        H.ctx.fillRect(statusPanelX + 12, statusPanelY + 30, statusPanelW - 24, 12);
        H.ctx.strokeStyle = '#0a0';
        H.ctx.strokeRect(statusPanelX + 12, statusPanelY + 30, statusPanelW - 24, 12);
        const healthColor = healthPercent > 0.6 ? '#00ff55' : healthPercent > 0.3 ? '#ffcc00' : '#ff3333';
        H.ctx.fillStyle = healthColor;
        H.ctx.fillRect(statusPanelX + 12, statusPanelY + 30, (statusPanelW - 24) * healthPercent, 12);
    
        H.ctx.font = '11px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.textAlign = 'left';
        H.ctx.fillText(`HP ${Math.round(H.playerHealth)}`, statusPanelX + 12, statusPanelY + 26);
        const alertTexts = ['UNDETECTED', 'SUSPICIOUS', 'ALERT', 'ALARM!'];
        const alertColors = ['#00ff66', '#ffff00', '#ff8800', '#ff3333'];
        H.ctx.fillStyle = alertColors[H.alertLevel] || '#00ff66';
        H.ctx.fillText(alertTexts[H.alertLevel] || 'UNDETECTED', statusPanelX + 12, statusPanelY + 54);
        H.ctx.textAlign = 'right';
        H.ctx.fillStyle = '#0f0';
        H.ctx.fillText(`STANCE: ${H.SOLDIER.stance.toUpperCase()}`, statusPanelX + statusPanelW - 12, statusPanelY + 54);
    
        const showCrosshair = !H.soldierScope.active || H.soldierWeapon.current !== 'sniper';
        if (showCrosshair) {
            const cx = H.screenWidth / 2;
            const cy = H.screenHeight / 2;
            const scale = H.soldierScope.active ? 0.7 : 1.0;
            H.ctx.strokeStyle = '#00ff88';
            H.ctx.lineWidth = 1.5;
            H.ctx.beginPath();
            H.ctx.moveTo(cx - 10 * scale, cy);
            H.ctx.lineTo(cx - 2 * scale, cy);
            H.ctx.moveTo(cx + 2 * scale, cy);
            H.ctx.lineTo(cx + 10 * scale, cy);
            H.ctx.moveTo(cx, cy - 10 * scale);
            H.ctx.lineTo(cx, cy - 2 * scale);
            H.ctx.moveTo(cx, cy + 2 * scale);
            H.ctx.lineTo(cx, cy + 10 * scale);
            H.ctx.stroke();
        }
    
        if (H.soldierWeapon.isReloading) {
            const blinkOn = Math.floor(performance.now() / 200) % 2 === 0;
            if (blinkOn) {
                H.ctx.font = 'bold 20px Courier New';
                H.ctx.fillStyle = '#ff0';
                H.ctx.textAlign = 'center';
                H.ctx.fillText('RELOADING', H.screenWidth / 2, H.screenHeight * 0.35);
            }
        }
    
        renderScopeOverlay();
        
        // Targeting overlay for Delta mode (same system as Comanche)
        renderTargetingOverlay();
        
        // C4 charges indicator (always visible when charges placed)
        if (H.placedC4Charges.length > 0 && H.soldierWeapon.current !== 'c4') {
            const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
            if (blinkOn) {
                H.ctx.font = 'bold 12px Courier New';
                H.ctx.fillStyle = '#ff4400';
                H.ctx.textAlign = 'left';
                H.ctx.fillText(`C4 ARMED: ${H.placedC4Charges.length} [6]`, 10, H.screenHeight - 100);
            }
        }
    
        const now = performance.now();
        const showInbound = H.airstrikeState.planesInbound.length > 0 || now < H.airstrikeState.inboundMessageUntil;
    
        if (H.airstrikeState.designating) {
            H.ctx.font = 'bold 18px Courier New';
            H.ctx.fillStyle = '#66ccff';
            H.ctx.textAlign = 'center';
            H.ctx.fillText('DESIGNATING TARGET', H.screenWidth / 2, H.screenHeight * 0.28);
        }
    
        if (showInbound) {
            H.ctx.font = 'bold 16px Courier New';
            H.ctx.fillStyle = '#66ccff';
            H.ctx.textAlign = 'center';
            H.ctx.fillText('AIRSTRIKE INBOUND', H.screenWidth / 2, H.screenHeight * 0.32);
        }
    
        // Only show targeting crosshair while designating (not after calling strike)
        if (H.airstrikeState.designating) {
            const markerPoint = H.getAirstrikeAimPoint();
            if (markerPoint) {
                const projection = H.projectWorldToScreen(H.camera, markerPoint.x, markerPoint.y, markerPoint.z);
                if (projection) {
                    const markerSize = Math.max(6, 16 * projection.scaleY);
                    H.ctx.save();
                    H.ctx.strokeStyle = '#66ccff';
                    H.ctx.lineWidth = 2;
                    H.ctx.beginPath();
                    H.ctx.arc(projection.screenX, projection.screenY, markerSize, 0, Math.PI * 2);
                    H.ctx.stroke();
                    H.ctx.beginPath();
                    H.ctx.moveTo(projection.screenX - markerSize, projection.screenY);
                    H.ctx.lineTo(projection.screenX + markerSize, projection.screenY);
                    H.ctx.moveTo(projection.screenX, projection.screenY - markerSize);
                    H.ctx.lineTo(projection.screenX, projection.screenY + markerSize);
                    H.ctx.stroke();
                    H.ctx.restore();
                }
            }
        }
        
        // Resupply indicator
        renderResupplyIndicator();
    }
    

    function renderHUD() {
        if (H.gameMode === H.GAME_MODES.DELTA) {
            renderDeltaHUD();
        } else {
            // Get heading in degrees
            let heading = Math.round((-H.camera.angle * 180 / Math.PI) % 360);
            if (heading < 0) heading += 360;
    
            const remaining = H.targets.filter(t => !t.destroyed).length;
            const healthPercent = H.playerHealth / H.maxPlayerHealth;
    
            // ========================================
            // TOP BAR - Flight info, Health, Score
            // ========================================
            H.ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
            H.ctx.fillRect(0, 0, H.screenWidth, 45);
            H.ctx.strokeStyle = '#0f0';
            H.ctx.lineWidth = 2;
            H.ctx.beginPath();
            H.ctx.moveTo(0, 45);
            H.ctx.lineTo(H.screenWidth, 45);
            H.ctx.stroke();
    
            // Flight data (left side)
            H.ctx.font = 'bold 14px Courier New';
            H.ctx.fillStyle = '#0f0';
            H.ctx.textAlign = 'left';
            H.ctx.fillText(`ALT`, 10, 15);
            H.ctx.fillText(`SPD`, 90, 15);
            H.ctx.fillText(`HDG`, 170, 15);
    
            H.ctx.font = 'bold 18px Courier New';
            H.ctx.fillStyle = '#0f0';
            H.ctx.fillText(`${Math.floor(H.camera.height).toString().padStart(4, ' ')}`, 10, 35);
            H.ctx.fillText(`${Math.abs(H.currentSpeed).toFixed(0).padStart(3, ' ')}`, 90, 35);
            H.ctx.fillText(`${heading.toString().padStart(3, '0')}°`, 170, 35);
    
            // Health bar (center-left area)
            const healthBarX = 260;
            const healthBarWidth = 200;
            const healthBarHeight = 20;
            const healthBarY = 12;
    
            // Health label
            H.ctx.font = 'bold 12px Courier New';
            H.ctx.fillStyle = '#0f0';
            H.ctx.textAlign = 'right';
            H.ctx.fillText('HULL', healthBarX - 5, healthBarY + 14);
    
            // Health bar background
            H.ctx.fillStyle = '#111';
            H.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            H.ctx.strokeStyle = '#0a0';
            H.ctx.lineWidth = 1;
            H.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
            // Health bar fill with gradient color
            let healthColor;
            if (healthPercent > 0.6) {
                healthColor = '#0f0';
            } else if (healthPercent > 0.3) {
                healthColor = '#ff0';
            } else {
                // Blinking red when critical
                const blinkOn = Math.floor(performance.now() / 250) % 2 === 0;
                healthColor = blinkOn ? '#f00' : '#800';
            }
            H.ctx.fillStyle = healthColor;
            H.ctx.fillRect(healthBarX + 2, healthBarY + 2, (healthBarWidth - 4) * healthPercent, healthBarHeight - 4);
    
            // Health segments (tick marks)
            H.ctx.strokeStyle = '#0a0';
            H.ctx.lineWidth = 1;
            for (let i = 1; i < 10; i++) {
                const tickX = healthBarX + (healthBarWidth / 10) * i;
                H.ctx.beginPath();
                H.ctx.moveTo(tickX, healthBarY);
                H.ctx.lineTo(tickX, healthBarY + 4);
                H.ctx.moveTo(tickX, healthBarY + healthBarHeight - 4);
                H.ctx.lineTo(tickX, healthBarY + healthBarHeight);
                H.ctx.stroke();
            }
    
            // Health percentage text
            H.ctx.font = 'bold 14px Courier New';
            H.ctx.textAlign = 'center';
            H.ctx.strokeStyle = '#000';
            H.ctx.lineWidth = 2;
            H.ctx.strokeText(`${Math.ceil(healthPercent * 100)}%`, healthBarX + healthBarWidth / 2, healthBarY + 15);
            H.ctx.fillStyle = '#fff';
            H.ctx.fillText(`${Math.ceil(healthPercent * 100)}%`, healthBarX + healthBarWidth / 2, healthBarY + 15);
    
            // Score and H.targets (right side)
            H.ctx.font = 'bold 14px Courier New';
            H.ctx.fillStyle = '#0f0';
            H.ctx.textAlign = 'right';
            // Show FREE PLAY indicator or H.targets count
            if (H.currentMissionIndex === -1) {
                H.ctx.fillStyle = '#0af';
                H.ctx.fillText('FREE PLAY', H.screenWidth - 10, 15);
            } else {
                H.ctx.fillText(`TARGETS: ${remaining}`, H.screenWidth - 10, 15);
            }
            H.ctx.font = 'bold 18px Courier New';
            H.ctx.fillStyle = '#ff0';
            H.ctx.fillText(`SCORE: ${H.score.toString().padStart(6, '0')}`, H.screenWidth - 10, 35);
    
            // Sound indicator
            if (!H.soundEnabled) {
                H.ctx.font = '12px Courier New';
                H.ctx.fillStyle = '#f00';
                H.ctx.textAlign = 'right';
                H.ctx.fillText('MUTED [B]', H.screenWidth - 150, 35);
            }
    
            // God mode indicator
            if (H.godMode) {
                H.ctx.font = 'bold 12px Courier New';
                H.ctx.fillStyle = '#ff0';
                H.ctx.textAlign = 'left';
                H.ctx.fillText('GOD MODE [G]', 480, 15);
            }
    
            // Night vision indicator
            if (H.nightVisionMode) {
                H.ctx.font = 'bold 14px Courier New';
                H.ctx.fillStyle = '#0f0';
                H.ctx.textAlign = 'left';
                H.ctx.fillText('◉ IR MODE [N]', 10, H.screenHeight - 130);
            }
    
            // Simple controls indicator
            if (H.simpleControls) {
                H.ctx.font = 'bold 12px Courier New';
                H.ctx.fillStyle = '#0af';
                H.ctx.textAlign = 'left';
                H.ctx.fillText('SIMPLE CTRL [T]', 580, 15);
            }
    
            // Weather indicator (show if not clear)
            if (H.weatherCondition !== 'clear') {
                const weather = H.WEATHER_PRESETS[H.weatherCondition];
                H.ctx.font = 'bold 12px Courier New';
                H.ctx.fillStyle = H.weatherCondition === 'night' ? '#448' :
                               H.weatherCondition === 'storm' ? '#f80' : '#aaa';
                H.ctx.textAlign = 'left';
                H.ctx.fillText(`☁ ${weather.name} [M]`, 580, 35);
    
                // Warning if visibility is very low and no night vision
                if (weather.ambient < 0.3 && !H.nightVisionMode) {
                    const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
                    if (blinkOn) {
                        H.ctx.fillStyle = '#f00';
                        H.ctx.fillText('LOW VIS - USE NV [N]', 10, H.screenHeight - 150);
                    }
                }
            }
    
            // Heading compass at top center
            H.renderCompass(heading);
    
            // Altitude ladder on right side
            H.renderAltitudeLadder(H.camera.height, H.camera.verticalSpeed, H.camera.distance);
    
            // ========================================
            // MISSILE WARNING (center screen)
            // ========================================
            if (H.missileWarning) {
                const blinkOn = Math.floor(performance.now() / 150) % 2 === 0;
                if (blinkOn) {
                    // Warning box
                    H.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    H.ctx.fillRect(H.screenWidth / 2 - 100, 75, 200, 35);
                    H.ctx.strokeStyle = '#f00';
                    H.ctx.lineWidth = 2;
                    H.ctx.strokeRect(H.screenWidth / 2 - 100, 75, 200, 35);
    
                    H.ctx.fillStyle = '#ff0000';
                    H.ctx.font = 'bold 20px Courier New';
                    H.ctx.textAlign = 'center';
                    H.ctx.fillText('⚠ MISSILE LOCK ⚠', H.screenWidth / 2, 98);
                }
            }
    
            // Flight path predictor (trajectory line)
            H.renderFlightPathPredictor(H.camera.bank, H.camera.forwardSpeed, H.camera.yawRate);
    
            // Targeting reticle in center
            renderReticle();
    
            // ========================================
            // WEAPON PANEL (bottom-left, above radar)
            // ========================================
            const radarSize = H.CONFIG.RADAR_SIZE; // 100px
            const weaponPanelX = 10;
            const weaponPanelY = H.screenHeight - radarSize - 10 - 125; // Above radar
            const weaponPanelW = 200;
            const weaponPanelH = 120;
    
            H.drawHUDPanel(weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH, 'H.WEAPONS');
    
            // Weapon list
            let weaponY = weaponPanelY + 28;
            for (let i = 0; i < H.weaponOrder.length; i++) {
                const wKey = H.weaponOrder[i];
                const w = H.WEAPONS[wKey];
                const state = H.weaponState[wKey];
                const isSelected = i === H.currentWeaponIndex;
    
                // Selection indicator
                if (isSelected) {
                    // Highlight background
                    H.ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
                    H.ctx.fillRect(weaponPanelX + 4, weaponY - 11, weaponPanelW - 8, 18);
    
                    // Selection arrow
                    H.ctx.fillStyle = '#0f0';
                    H.ctx.beginPath();
                    H.ctx.moveTo(weaponPanelX + 8, weaponY - 5);
                    H.ctx.lineTo(weaponPanelX + 14, weaponY);
                    H.ctx.lineTo(weaponPanelX + 8, weaponY + 5);
                    H.ctx.closePath();
                    H.ctx.fill();
                }
            
            // Weapon color bar
            H.ctx.fillStyle = w.color;
            H.ctx.fillRect(weaponPanelX + 18, weaponY - 8, 4, 14);
            
            // Weapon key and name
            H.ctx.font = isSelected ? 'bold 13px Courier New' : '12px Courier New';
            H.ctx.fillStyle = isSelected ? '#0f0' : '#0a0';
            H.ctx.textAlign = 'left';
            H.ctx.save();
            H.ctx.beginPath();
            H.ctx.rect(weaponPanelX + 22, weaponY - 12, weaponPanelW - 90, 18);
            H.ctx.clip();
            H.ctx.fillText(`[${w.key}] ${w.name}`, weaponPanelX + 26, weaponY + 3);
            H.ctx.restore();
            
            // Ammo display
            H.ctx.textAlign = 'right';
            if (state.ammo === Infinity) {
                H.ctx.fillStyle = isSelected ? '#0f0' : '#0a0';
                H.ctx.fillText('∞', weaponPanelX + weaponPanelW - 10, weaponY + 3);
            } else {
                // Ammo bar background
                const ammoBarX = weaponPanelX + weaponPanelW - 55;
                const ammoBarW = 40;
                const maxAmmo = H.WEAPONS[wKey].maxAmmo;
                const ammoPercent = state.ammo / maxAmmo;
                
                H.ctx.fillStyle = '#111';
                H.ctx.fillRect(ammoBarX, weaponY - 6, ammoBarW, 10);
                
                // Ammo bar fill
                let ammoColor = '#0f0';
                if (ammoPercent <= 0.25) ammoColor = '#f00';
                else if (ammoPercent <= 0.5) ammoColor = '#ff0';
                H.ctx.fillStyle = isSelected ? ammoColor : (ammoPercent <= 0.25 ? '#800' : '#080');
                H.ctx.fillRect(ammoBarX + 1, weaponY - 5, (ammoBarW - 2) * ammoPercent, 8);
                
                // Ammo count
                H.ctx.font = 'bold 10px Courier New';
                H.ctx.fillStyle = isSelected ? '#fff' : '#888';
                H.ctx.textAlign = 'center';
                H.ctx.fillText(state.ammo.toString(), ammoBarX + ammoBarW / 2, weaponY + 2);
            }
            
            weaponY += 22;
        }
        
        // ========================================
        // COUNTERMEASURES PANEL (bottom, next to radar)
        // ========================================
        const cmPanelX = radarSize + 20; // Right of radar (100 + 20 = 120)
        const cmPanelY = H.screenHeight - 75;
        const cmPanelW = 140;
        const cmPanelH = 65;
        
        H.drawHUDPanel(cmPanelX, cmPanelY, cmPanelW, cmPanelH, 'COUNTERMEASURES');
        
        // Chaff
        H.ctx.font = '12px Courier New';
        H.ctx.textAlign = 'left';
        H.ctx.fillStyle = '#0af';
        H.ctx.fillText('[;] CHAFF', cmPanelX + 8, cmPanelY + 35);
        
        // Chaff count boxes
        const chaffCount = H.countermeasures.chaff.count;
        for (let i = 0; i < 10; i++) {
            const boxX = cmPanelX + 80 + i * 5;
            H.ctx.fillStyle = i < chaffCount ? '#0af' : '#222';
            H.ctx.fillRect(boxX, cmPanelY + 26, 4, 10);
        }
        
        // Flare
        H.ctx.fillStyle = '#fa0';
        H.ctx.fillText("['] FLARE", cmPanelX + 8, cmPanelY + 52);
        
        // Flare count boxes
        const flareCount = H.countermeasures.flare.count;
        for (let i = 0; i < 10; i++) {
            const boxX = cmPanelX + 80 + i * 5;
            H.ctx.fillStyle = i < flareCount ? '#fa0' : '#222';
            H.ctx.fillRect(boxX, cmPanelY + 43, 4, 10);
        }
        
        // ========================================
        // STATUS PANEL (bottom-right)
        // ========================================
        const statusPanelX = H.screenWidth - 160;
        const statusPanelY = H.screenHeight - 75;
        const statusPanelW = 150;
        const statusPanelH = 65;
        
        H.drawHUDPanel(statusPanelX, statusPanelY, statusPanelW, statusPanelH, 'STATUS');
        
        // Current weapon display
        const currentWeaponName = H.WEAPONS[H.weaponOrder[H.currentWeaponIndex]].name;
        H.ctx.font = 'bold 14px Courier New';
        H.ctx.fillStyle = H.WEAPONS[H.weaponOrder[H.currentWeaponIndex]].color;
        H.ctx.textAlign = 'center';
        H.ctx.fillText(currentWeaponName.toUpperCase(), statusPanelX + statusPanelW / 2, statusPanelY + 35);
        
        // Armed indicator
        H.ctx.font = '11px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.fillText('▶ ARMED ◀', statusPanelX + statusPanelW / 2, statusPanelY + 52);
        
        // Radar minimap
        H.renderRadar(H.camera, H.targets, H.enemyProjectiles, H.objectiveState);
        
        // Terrain following radar (Comanche-style forward-looking)
        H.renderTerrainRadar(H.camera, H.getTerrainHeight);
    }
    
    if (H.gameState === H.GAME_STATES.PLAYING) {
        renderOnboardingHint();
    }
    }
    

    function renderOnboardingHint() {
        if (!H.showOnboardingHints || H.gameState !== H.GAME_STATES.PLAYING) return;
    
        for (const hint of H.ONBOARDING_HINTS) {
            if (hint.condition()) {
                H.ctx.font = 'bold 14px Courier New';
                H.ctx.fillStyle = '#ff0';
                H.ctx.textAlign = 'center';
                H.ctx.fillText('TIP: ' + hint.text, H.screenWidth / 2, H.screenHeight - 170);
                return;
            }
        }
    }
    

    function renderObjectivesPanel() {
        if (H.gameState !== H.GAME_STATES.PLAYING) return;
        if (H.currentMissionIndex < 0) return; // No panel for free play
        if (!H.objectiveState.objectives || H.objectiveState.objectives.length === 0) return;
        
        const panelX = 10;
        // In Delta mode, position below the weapon panel (which ends at ~105px)
        // In Comanche mode, position below the standard HUD elements
        const panelY = (H.gameMode === H.GAME_MODES.DELTA) ? 115 : 55;
        const panelWidth = 240;
        const lineHeight = 20;
        const padding = 10;
        const headerHeight = 26;
        const panelHeight = headerHeight + padding * 2 + H.objectiveState.objectives.length * lineHeight + 4;
        
        // Panel background with gradient
        const grad = H.ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        grad.addColorStop(0, 'rgba(0, 25, 0, 0.9)');
        grad.addColorStop(1, 'rgba(0, 15, 0, 0.85)');
        H.ctx.fillStyle = grad;
        H.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Border with subtle glow
        H.ctx.strokeStyle = '#0a0';
        H.ctx.lineWidth = 1;
        H.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        H.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        H.ctx.strokeRect(panelX - 1, panelY - 1, panelWidth + 2, panelHeight + 2);
        
        // Header with accent bar
        H.ctx.fillStyle = 'rgba(0, 50, 0, 0.95)';
        H.ctx.fillRect(panelX, panelY, panelWidth, headerHeight);
        H.ctx.fillStyle = '#0f0';
        H.ctx.fillRect(panelX, panelY + headerHeight - 2, panelWidth, 2);
        
        H.ctx.font = 'bold 13px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.textAlign = 'left';
        H.ctx.fillText('MISSION OBJECTIVES', panelX + padding, panelY + 17);
        
        // Objectives list
        let y = panelY + headerHeight + padding + 14;
        
        for (const obj of H.objectiveState.objectives) {
            // Status indicator with better icons
            let statusIcon, statusColor, bgColor;
            if (obj.complete) {
                statusIcon = '\u2713'; // Checkmark
                statusColor = '#0f0';
                bgColor = 'rgba(0, 100, 0, 0.3)';
            } else if (obj.failed) {
                statusIcon = '\u2717'; // X mark
                statusColor = '#f00';
                bgColor = 'rgba(100, 0, 0, 0.3)';
            } else {
                statusIcon = '\u25cb'; // Circle
                statusColor = '#888';
                bgColor = null;
            }
            
            // Row background for completed/failed
            if (bgColor) {
                H.ctx.fillStyle = bgColor;
                H.ctx.fillRect(panelX + 2, y - 12, panelWidth - 4, lineHeight - 2);
            }
            
            // Status icon
            H.ctx.font = '12px Courier New';
            H.ctx.fillStyle = statusColor;
            H.ctx.fillText(statusIcon, panelX + padding, y);
            
            // Objective description (truncated if needed)
            const descMaxLen = 20;
            let desc = obj.description || 'Unknown objective';
            if (desc.length > descMaxLen) {
                desc = desc.substring(0, descMaxLen - 2) + '..';
            }
            
            H.ctx.font = '11px Courier New';
            H.ctx.fillStyle = obj.complete ? '#0a0' : (obj.failed ? '#800' : '#0c0');
            H.ctx.fillText(desc, panelX + padding + 18, y);
            
            // Progress (right-aligned) with highlight
            const progress = H.getObjectiveProgressText(obj);
            H.ctx.textAlign = 'right';
            H.ctx.font = 'bold 11px Courier New';
            H.ctx.fillStyle = obj.complete ? '#0f0' : (obj.failed ? '#f00' : '#ff0');
            H.ctx.fillText(progress, panelX + panelWidth - padding, y);
            H.ctx.textAlign = 'left';
            
            y += lineHeight;
        }
    }
    

    function renderMissionTimer() {
        const mission = H.getActiveMission();
        if (!mission || !mission.timeLimit) return;
        
        const mins = Math.floor(H.missionTime / 60);
        const secs = Math.floor(H.missionTime % 60);
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        // Flash red when under 30 seconds
        const isLowTime = H.missionTime < 30;
        const blinkOn = Math.floor(performance.now() / 250) % 2 === 0;
        
        H.ctx.font = 'bold 28px Courier New';
        H.ctx.textAlign = 'center';
        
        if (isLowTime) {
            H.ctx.fillStyle = blinkOn ? '#ff0000' : '#880000';
        } else {
            H.ctx.fillStyle = '#00ff00';
        }
        
        // Draw timer below compass
        H.ctx.fillText(timeStr, H.screenWidth / 2, 85);
        
        // Label
        H.ctx.font = '12px Courier New';
        H.ctx.fillStyle = '#0a0';
        H.ctx.fillText('TIME', H.screenWidth / 2, 98);
    }
    

    function renderReticle() {
        const cx = H.screenWidth / 2;
        const cy = H.screenHeight / 2;
        const size = 30;
        const bankAngle = H.camera.bank || 0;
        const hitAlpha = H.hitMarkerTime > 0 ? Math.min(1, H.hitMarkerTime / 140) : 0;
        const hitPulse = hitAlpha * H.hitMarkerIntensity;
        
        H.ctx.save();
        H.ctx.translate(cx, cy);
        H.ctx.rotate(bankAngle);  // Rotate reticle with bank angle
        
        H.ctx.strokeStyle = hitAlpha > 0 ? `rgba(255, 255, 255, ${0.6 + 0.4 * hitAlpha})` : '#0f0';
        H.ctx.lineWidth = hitAlpha > 0 ? 3 : 2;
        
        // Outer circle
        H.ctx.beginPath();
        H.ctx.arc(0, 0, size, 0, Math.PI * 2);
        H.ctx.stroke();
        
        // Crosshair lines (rotate with bank)
        H.ctx.beginPath();
        // Top
        H.ctx.moveTo(0, -size - 10);
        H.ctx.lineTo(0, -size + 10);
        // Bottom
        H.ctx.moveTo(0, size - 10);
        H.ctx.lineTo(0, size + 10);
        // Left
        H.ctx.moveTo(-size - 10, 0);
        H.ctx.lineTo(-size + 10, 0);
        // Right
        H.ctx.moveTo(size - 10, 0);
        H.ctx.lineTo(size + 10, 0);
        H.ctx.stroke();
        
        // Center dot
        H.ctx.fillStyle = hitAlpha > 0 ? `rgba(255, 80, 80, ${0.8 * hitAlpha})` : '#0f0';
        H.ctx.beginPath();
        H.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        H.ctx.fill();
    
        // Hit marker brackets
        if (hitAlpha > 0) {
            H.ctx.strokeStyle = `rgba(255, 80, 80, ${0.8 * hitPulse})`;
            H.ctx.lineWidth = 2;
            const markerSize = size + 8;
            H.ctx.beginPath();
            H.ctx.moveTo(-markerSize, -markerSize);
            H.ctx.lineTo(-markerSize + 10, -markerSize + 10);
            H.ctx.moveTo(markerSize, -markerSize);
            H.ctx.lineTo(markerSize - 10, -markerSize + 10);
            H.ctx.moveTo(-markerSize, markerSize);
            H.ctx.lineTo(-markerSize + 10, markerSize - 10);
            H.ctx.moveTo(markerSize, markerSize);
            H.ctx.lineTo(markerSize - 10, markerSize - 10);
            H.ctx.stroke();
        }
        
        H.ctx.restore();
        
        // === ATTITUDE INDICATOR (Bank/Pitch) ===
        // Position at bottom center of screen, above the controls area
        H.renderAttitudeIndicator(H.screenWidth / 2, H.screenHeight - 60, H.camera.bank, H.camera.pitch);
        
        // === TARGETING SYSTEM OVERLAY ===
        renderTargetingOverlay();
        
        // === H.RESUPPLY INDICATOR ===
        renderResupplyIndicator();
    }
    

    function renderResupplyIndicator() {
        const nearest = H.getNearestFriendlyHelipad(H.camera.x, H.camera.y);
        if (!nearest) return;
        
        const range = nearest.isBase ? H.RESUPPLY.range * 1.5 : H.RESUPPLY.range;
        const atResupply = H.isAtResupplyPoint();
        
        // Show distance to nearest friendly base if within 200 units
        if (nearest.distance < 200) {
            const cx = H.screenWidth / 2;
            const cy = H.screenHeight - 140;
            
            if (atResupply) {
                // Resupplying indicator
                const blinkOn = Math.floor(performance.now() / 300) % 2 === 0;
                H.ctx.font = 'bold 16px Courier New';
                H.ctx.textAlign = 'center';
                H.ctx.fillStyle = blinkOn ? '#00ff00' : '#00aa00';
                H.ctx.fillText('>>> RESUPPLYING <<<', cx, cy);
                H.ctx.font = '12px Courier New';
                H.ctx.fillStyle = '#0a0';
                H.ctx.fillText('Ammo and health restoring...', cx, cy + 18);
            } else if (nearest.distance < 100) {
                // Close to base but not resupplying (need to land in Comanche)
                H.ctx.font = 'bold 14px Courier New';
                H.ctx.textAlign = 'center';
                H.ctx.fillStyle = '#ffaa00';
                if (H.gameMode === H.GAME_MODES.COMANCHE) {
                    H.ctx.fillText('LAND TO H.RESUPPLY', cx, cy);
                } else {
                    H.ctx.fillText('MOVE CLOSER TO H.RESUPPLY', cx, cy);
                }
                H.ctx.font = '11px Courier New';
                H.ctx.fillStyle = '#aa8800';
                H.ctx.fillText(`Distance: ${Math.round(nearest.distance)}m`, cx, cy + 15);
            }
        }
    }
    

    function renderTargetingOverlay() {
        const validTypes = H.targetingSystem.getValidTargetTypes();
        
        // Don't show targeting overlay for weapons that don't need lock
        if (!validTypes.requiresLock) return;
        
        const cam = H.gameMode === H.GAME_MODES.DELTA ? H.getDeltaCamera() : H.camera;
        const sinAngle = Math.sin(cam.angle);
        const cosAngle = Math.cos(cam.angle);
        const pitchFactor = (cam.horizon - H.screenHeight / 2) / 240.0;
        
        // Get all visible H.targets using weapon-appropriate range
        // H.getTargetsInView already filters by domain based on current weapon
        const visibleTargets = H.getTargetsInView(cam, H.targetingSystem.getTargetingRange());
        
        for (const targetInfo of visibleTargets) {
            const target = targetInfo.target;
            const isSelected = target === H.targetingSystem.selectedTarget;
            const isLocked = target === H.targetingSystem.lockedTarget;
            
            // Calculate screen position
            let dx = target.x - cam.x;
            let dy = target.y - cam.y;
            if (dx > H.CONFIG.MAP_SIZE / 2) dx -= H.CONFIG.MAP_SIZE;
            if (dx < -H.CONFIG.MAP_SIZE / 2) dx += H.CONFIG.MAP_SIZE;
            if (dy > H.CONFIG.MAP_SIZE / 2) dy -= H.CONFIG.MAP_SIZE;
            if (dy < -H.CONFIG.MAP_SIZE / 2) dy += H.CONFIG.MAP_SIZE;
            
            const dist = Math.sqrt(dx * dx + dy * dy);
            const rx = dx * cosAngle - dy * sinAngle;
            const ry = -dx * sinAngle - dy * cosAngle;
            
            if (ry < 10) continue;
            
            const scaleX = (H.screenWidth / 2) / ry;
            const scaleY = 240.0 / ry;
            const screenX = H.screenWidth / 2 + rx * scaleX;
            
            // Apply bank tilt
            const bankTiltFactor = Math.sin(cam.bank || 0) * 0.3;
            const bankOffset = (screenX - H.screenWidth / 2) * bankTiltFactor;
            const screenY = (cam.height - target.z) * scaleY + cam.horizon + bankOffset;
            
            // Skip if off screen
            if (screenX < 0 || screenX > H.screenWidth || screenY < 50 || screenY > H.screenHeight - 50) continue;
            
            // Calculate bracket size based on distance
            const bracketSize = Math.max(15, Math.min(40, 800 / dist));
            
            H.ctx.save();
            
            if (isLocked) {
                // LOCKED - Diamond shape, bright red/orange
                H.ctx.strokeStyle = '#ff4400';
                H.ctx.fillStyle = 'rgba(255, 68, 0, 0.2)';
                H.ctx.lineWidth = 3;
                
                // Diamond
                H.ctx.beginPath();
                H.ctx.moveTo(screenX, screenY - bracketSize);
                H.ctx.lineTo(screenX + bracketSize, screenY);
                H.ctx.lineTo(screenX, screenY + bracketSize);
                H.ctx.lineTo(screenX - bracketSize, screenY);
                H.ctx.closePath();
                H.ctx.fill();
                H.ctx.stroke();
                
                // "LOCK" text
                H.ctx.font = 'bold 10px Courier New';
                H.ctx.fillStyle = '#ff4400';
                H.ctx.textAlign = 'center';
                H.ctx.fillText('LOCK', screenX, screenY - bracketSize - 8);
                
            } else if (isSelected) {
                // SELECTED - Square brackets, yellow, with lock progress
                const lockProgress = H.targetingSystem.lockProgress / 100;
                H.ctx.strokeStyle = H.targetingSystem.isLocking ? '#ffaa00' : '#ffff00';
                H.ctx.lineWidth = 2;
                
                // Animated brackets that shrink as lock progresses
                const animSize = bracketSize * (1.5 - lockProgress * 0.5);
                const cornerLen = animSize * 0.4;
                
                // Top-left corner
                H.ctx.beginPath();
                H.ctx.moveTo(screenX - animSize, screenY - animSize + cornerLen);
                H.ctx.lineTo(screenX - animSize, screenY - animSize);
                H.ctx.lineTo(screenX - animSize + cornerLen, screenY - animSize);
                H.ctx.stroke();
                
                // Top-right corner
                H.ctx.beginPath();
                H.ctx.moveTo(screenX + animSize - cornerLen, screenY - animSize);
                H.ctx.lineTo(screenX + animSize, screenY - animSize);
                H.ctx.lineTo(screenX + animSize, screenY - animSize + cornerLen);
                H.ctx.stroke();
                
                // Bottom-left corner
                H.ctx.beginPath();
                H.ctx.moveTo(screenX - animSize, screenY + animSize - cornerLen);
                H.ctx.lineTo(screenX - animSize, screenY + animSize);
                H.ctx.lineTo(screenX - animSize + cornerLen, screenY + animSize);
                H.ctx.stroke();
                
                // Bottom-right corner
                H.ctx.beginPath();
                H.ctx.moveTo(screenX + animSize - cornerLen, screenY + animSize);
                H.ctx.lineTo(screenX + animSize, screenY + animSize);
                H.ctx.lineTo(screenX + animSize, screenY + animSize - cornerLen);
                H.ctx.stroke();
                
                // Lock progress bar (if locking)
                if (H.targetingSystem.isLocking && validTypes.requiresLock) {
                    const barWidth = animSize * 2;
                    const barHeight = 4;
                    const barY = screenY + animSize + 8;
                    
                    // Background
                    H.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    H.ctx.fillRect(screenX - barWidth/2, barY, barWidth, barHeight);
                    
                    // Progress fill
                    H.ctx.fillStyle = lockProgress > 0.8 ? '#00ff00' : '#ffaa00';
                    H.ctx.fillRect(screenX - barWidth/2, barY, barWidth * lockProgress, barHeight);
                    
                    // Border
                    H.ctx.strokeStyle = '#ffaa00';
                    H.ctx.lineWidth = 1;
                    H.ctx.strokeRect(screenX - barWidth/2, barY, barWidth, barHeight);
                }
                
                // Target info
                H.ctx.font = '9px Courier New';
                H.ctx.fillStyle = '#ffff00';
                H.ctx.textAlign = 'center';
                const typeName = target.type.replace('_', ' ').toUpperCase();
                H.ctx.fillText(`${typeName}`, screenX, screenY - animSize - 12);
                H.ctx.fillText(`${Math.round(dist)}m`, screenX, screenY + animSize + 22);
                
            } else {
                // UNSELECTED - Simple brackets, dim green
                H.ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
                H.ctx.lineWidth = 1;
                
                const cornerLen = bracketSize * 0.3;
                
                // Just corners
                H.ctx.beginPath();
                // Top-left
                H.ctx.moveTo(screenX - bracketSize, screenY - bracketSize + cornerLen);
                H.ctx.lineTo(screenX - bracketSize, screenY - bracketSize);
                H.ctx.lineTo(screenX - bracketSize + cornerLen, screenY - bracketSize);
                // Top-right
                H.ctx.moveTo(screenX + bracketSize - cornerLen, screenY - bracketSize);
                H.ctx.lineTo(screenX + bracketSize, screenY - bracketSize);
                H.ctx.lineTo(screenX + bracketSize, screenY - bracketSize + cornerLen);
                // Bottom-left
                H.ctx.moveTo(screenX - bracketSize, screenY + bracketSize - cornerLen);
                H.ctx.lineTo(screenX - bracketSize, screenY + bracketSize);
                H.ctx.lineTo(screenX - bracketSize + cornerLen, screenY + bracketSize);
                // Bottom-right
                H.ctx.moveTo(screenX + bracketSize - cornerLen, screenY + bracketSize);
                H.ctx.lineTo(screenX + bracketSize, screenY + bracketSize);
                H.ctx.lineTo(screenX + bracketSize, screenY + bracketSize - cornerLen);
                H.ctx.stroke();
            }
            
            H.ctx.restore();
        }
        
        // Targeting system status in HUD
        renderTargetingStatus();
    }
    

    function renderTargetingStatus() {
        const validTypes = H.targetingSystem.getValidTargetTypes();
        const weapon = H.gameMode === H.GAME_MODES.DELTA 
            ? H.soldierWeapon.current 
            : H.weaponOrder[H.currentWeaponIndex];
        
        // Only show targeting status for lock-on weapons
        if (!validTypes.requiresLock) return;
        
        const statusX = H.screenWidth / 2;
        const statusY = 70;
        
        H.ctx.save();
        H.ctx.font = 'bold 12px Courier New';
        H.ctx.textAlign = 'center';
        
        if (H.targetingSystem.lockedTarget) {
            // Locked - diamond indicator on target is sufficient, no text needed
        } else if (H.targetingSystem.selectedTarget && H.targetingSystem.isLocking) {
            // Acquiring lock
            H.ctx.fillStyle = '#ffaa00';
            const progress = Math.round(H.targetingSystem.lockProgress);
            H.ctx.fillText(`ACQUIRING LOCK... ${progress}%`, statusX, statusY);
        } else if (H.targetingSystem.selectedTarget) {
            // Target selected but not locking
            H.ctx.fillStyle = '#00ff00';
            H.ctx.fillText('[F] HOLD TO LOCK', statusX, statusY);
        } else {
            // No target
            H.ctx.fillStyle = '#888888';
            const targetType = validTypes.domain === H.DOMAINS.AIR ? 'AIR' : 'GROUND';
            H.ctx.fillText(`NO ${targetType} TARGET`, statusX, statusY);
        }
        
        H.ctx.restore();
    }
    

    function renderLeaderboard(stats) {
        if (!stats || !stats.leaderboard || !stats.totals) return;
    
        // Position in top-right corner
        const panelW = 300;
        const panelH = 300;
        const panelX = H.screenWidth - panelW - 20;  // Right side with margin
        const panelY = 10;                          // Top with small margin
    
        H.ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
        H.ctx.fillRect(panelX, panelY, panelW, panelH);
        H.ctx.strokeStyle = '#0f0';
        H.ctx.lineWidth = 2;
        H.ctx.strokeRect(panelX, panelY, panelW, panelH);
    
        H.ctx.font = 'bold 16px Courier New';
        H.ctx.fillStyle = '#0f0';
        H.ctx.textAlign = 'center';
        H.ctx.fillText('GLOBAL LEADERBOARD', panelX + panelW / 2, panelY + 25);
    
        H.ctx.font = '12px Courier New';
        H.ctx.fillStyle = '#0a0';
        H.ctx.fillText(`Total Kills: ${stats.totals.kills} | Deaths: ${stats.totals.deaths}`, panelX + panelW / 2, panelY + 45);
        H.ctx.fillText(`Missions Completed: ${stats.totals.missionsCompleted}`, panelX + panelW / 2, panelY + 60);
    
        H.ctx.textAlign = 'left';
        H.ctx.font = '11px Courier New';
        let y = panelY + 85;
    
        for (let i = 0; i < Math.min(10, stats.leaderboard.length); i++) {
            const entry = stats.leaderboard[i];
            const rank = i + 1;
            H.ctx.fillStyle = rank <= 3 ? '#ff0' : '#0f0';
            H.ctx.fillText(`${rank}.`, panelX + 15, y);
            H.ctx.fillText(entry.name.substring(0, 12), panelX + 40, y);
            H.ctx.textAlign = 'right';
            H.ctx.fillText(entry.score.toLocaleString(), panelX + panelW - 15, y);
            H.ctx.textAlign = 'left';
            y += 18;
        }
    
        if (stats.leaderboard.length === 0) {
            H.ctx.fillStyle = '#0a0';
            H.ctx.textAlign = 'center';
            H.ctx.fillText('No scores yet - be the first!', panelX + panelW / 2, panelY + 100);
        }
    }
    

    // ─── Module Export ─────────────────────────────────────────

    window.GameHUD = {
        init: function(h) { H = h; },
        renderScopeOverlay,
        renderDeltaHUD,
        renderHUD,
        renderOnboardingHint,
        renderObjectivesPanel,
        renderMissionTimer,
        renderReticle,
        renderResupplyIndicator,
        renderTargetingOverlay,
        renderTargetingStatus,
        renderLeaderboard,
    };

})();
