// =====================================================================
// VoxelCopter — Menu & Overlay UI Module
// Extracted from game.html into a standalone module.
// All state access goes through the G (game context) object.
// =====================================================================
(function() {
    'use strict';

    let G; // Game context — set via init()

    // ─── Pure Helpers ──────────────────────────────────────────────

    function hitTest(rect, x, y) {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    }

    function getDifficultyStars(difficulty) {
        const stars = {
            'easy': '★☆☆☆☆',
            'medium': '★★☆☆☆',
            'hard': '★★★☆☆',
            'extreme': '★★★★★'
        };
        return stars[difficulty] || '★☆☆☆☆';
    }
    

    function getStarString(stars) {
        const filled = Math.max(0, Math.min(3, stars));
        return `${'★'.repeat(filled)}${'☆'.repeat(3 - filled)}`;
    }
    

    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        G.ctx.font = '14px Courier New';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = G.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    

    function drawMenuPanel(boxX, boxY, boxWidth, boxHeight, title) {
        G.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
        G.ctx.strokeStyle = '#0f0'; G.ctx.lineWidth = 2;
        G.ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
        G.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        G.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        G.ctx.fillStyle = 'rgba(0, 40, 0, 0.9)';
        G.ctx.fillRect(boxX, boxY, boxWidth, 40);
        G.ctx.font = 'bold 18px Courier New'; G.ctx.fillStyle = '#0f0'; G.ctx.textAlign = 'center';
        G.ctx.fillText(title, boxX + boxWidth / 2, boxY + 26);
    }
    

    function drawMenuButton(label, rect, isSelected, isHovered) {
        const active = isSelected || isHovered;
        const pulse = isSelected ? Math.sin(performance.now() * 0.004) * 0.15 + 0.85 : 1;
        if (active) {
            const grad = G.ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
            grad.addColorStop(0, 'rgba(0, 100, 0, 0.8)'); grad.addColorStop(0.5, 'rgba(0, 70, 0, 0.7)'); grad.addColorStop(1, 'rgba(0, 50, 0, 0.8)');
            G.ctx.fillStyle = grad;
        } else { G.ctx.fillStyle = 'rgba(0, 30, 0, 0.6)'; }
        G.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        G.ctx.strokeStyle = active ? '#0f0' : '#0a0'; G.ctx.lineWidth = isSelected ? 3 : 2;
        G.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        if (isSelected) {
            G.ctx.fillStyle = '#0f0'; G.ctx.font = '14px Courier New';
            G.ctx.textAlign = 'left'; G.ctx.fillText('>', rect.x + 8, rect.y + rect.height / 2 + 5);
            G.ctx.textAlign = 'right'; G.ctx.fillText('<', rect.x + rect.width - 8, rect.y + rect.height / 2 + 5);
        }
        G.ctx.globalAlpha = pulse; G.ctx.fillStyle = active ? '#0f0' : '#0a0';
        G.ctx.font = 'bold 16px Courier New'; G.ctx.textAlign = 'center';
        G.ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2 + 6);
        G.ctx.globalAlpha = 1;
    }
    

    function drawModeToggleButton(rect, isSelected, isHovered) {
        const active = isSelected || isHovered;
        const isDelta = G.gameMode === G.GAME_MODES.DELTA;
        const modeLabel = isDelta ? 'MODE: DELTA FORCE' : 'MODE: COMANCHE';
        const baseColor = isDelta ? '#b8935e' : '#0f0';
        const activeColor = isDelta ? '#e0c190' : '#7dff7d';
        G.ctx.strokeStyle = active ? '#0f0' : '#0a0';
        G.ctx.lineWidth = 2;
        G.ctx.fillStyle = active ? 'rgba(0, 80, 0, 0.7)' : 'rgba(0, 30, 0, 0.6)';
        G.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        G.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        G.ctx.fillStyle = active ? activeColor : baseColor;
        G.ctx.font = 'bold 16px Courier New';
        G.ctx.textAlign = 'center';
        G.ctx.fillText(modeLabel, rect.x + rect.width / 2, rect.y + rect.height / 2 + 6);
    }
    

    // ─── Overlay Renderers ───────────────────────────────────────

    function renderTitleOverlay() {
        G.ctx.save();
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const scanY = (performance.now() * 0.05) % G.screenHeight;
        G.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
        G.ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
        G.ctx.fillRect(0, scanY, G.screenWidth, 2);
    
        G.ctx.font = 'bold 56px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.shadowColor = '#0f0';
        G.ctx.shadowBlur = 25;
        G.ctx.fillText('VOXELCOPTER', centerX, centerY - 80);
        G.ctx.shadowBlur = 0;
    
        G.ctx.font = '18px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('COMANCHE-STYLE COMBAT SIMULATION', centerX, centerY - 45);
    
        const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
        if (blinkOn) {
            G.ctx.font = 'bold 16px Courier New';
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('PRESS ANY KEY TO START', centerX, centerY + 40);
        }
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('© VoxelCopter Command — Tactical Interface Online', centerX, centerY + 70);
        G.ctx.restore();
    }
    

    function renderMainMenuOverlay() {
        G.ctx.save();
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 420;
        
        // Calculate box height based on number of menu options + space for high G.score/controls
        const menuSpacing = 42;
        const menuItemsHeight = G.MAIN_MENU_OPTIONS.length * menuSpacing;
        const boxHeight = menuItemsHeight + 140;  // 80 top padding + 60 bottom for high G.score/controls
        
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'MAIN MENU');
    
        G.ctx.font = 'bold 28px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('VOXELCOPTER', centerX, boxY - 20);
    
        let y = boxY + 70;
        for (let i = 0; i < G.MAIN_MENU_OPTIONS.length; i++) {
            const rect = { x: boxX + 60, y: y - 16, width: boxWidth - 120, height: 34 };
            const hovered = hitTest(rect, G.mouseX, G.mouseY);
            if (i === 0) {
                drawModeToggleButton(rect, i === G.menuSelectionIndex, hovered);
            } else {
                drawMenuButton(G.MAIN_MENU_OPTIONS[i], rect, i === G.menuSelectionIndex, hovered);
            }
            G.menuButtons.push({ ...rect, onClick: () => G.handleMainMenuSelection(i) });
            y += menuSpacing;
        }
    
        // High G.score and controls at bottom of box (inside the panel)
        const highScoreY = boxY + boxHeight - 45;
        const controlsY = boxY + boxHeight - 22;
    
        G.ctx.font = '14px Courier New';
        G.ctx.fillStyle = '#ff0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText(`HIGH SCORE: ${G.profile.highScore.toString().padStart(6, '0')}`, centerX, highScoreY);
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('ARROW KEYS + ENTER', centerX, controlsY);
    
        G.ctx.restore();
    }
    

    function renderAIMissionUI() {
        const panelX = 50;
        const panelY = G.screenHeight - 200;
        const panelW = 300;
        const panelH = 150;
    
        G.ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
        G.ctx.fillRect(panelX, panelY, panelW, panelH);
        G.ctx.strokeStyle = '#0f0';
        G.ctx.lineWidth = 2;
        G.ctx.strokeRect(panelX, panelY, panelW, panelH);
    
        G.ctx.font = 'bold 14px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        G.ctx.fillText('AI MISSION GENERATOR', panelX + 15, panelY + 25);
    
        G.ctx.font = '11px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('Press G to generate custom mission', panelX + 15, panelY + 50);
        G.ctx.fillText('Examples:', panelX + 15, panelY + 70);
        G.ctx.fillText('- "night raid on enemy base"', panelX + 15, panelY + 85);
        G.ctx.fillText('- "defend against air attack"', panelX + 15, panelY + 100);
        G.ctx.fillText('- "stealth mission, few enemies"', panelX + 15, panelY + 115);
    
        if (G.isGeneratingMission) {
            G.ctx.fillStyle = '#ff0';
            G.ctx.fillText('Generating mission...', panelX + 15, panelY + 135);
        } else if (G.aiMission) {
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('Mission ready! Press ENTER to start', panelX + 15, panelY + 135);
        }
    }
    

    function renderMissionGeneratorOverlay() {
        G.ctx.save();
        // Clear G.menuButtons for this overlay - we'll add our own
        G.menuButtons = [];
        
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 500;
        const boxHeight = 320;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'AI MISSION GENERATOR');
        
        // Instructions
        G.ctx.font = '14px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('Describe your custom mission scenario', centerX, boxY + 60);
        
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('The AI will generate enemies, objectives, and conditions', centerX, boxY + 85);
        
        // Examples
        G.ctx.textAlign = 'left';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('Examples:', boxX + 30, boxY + 115);
        G.ctx.font = '11px Courier New';
        G.ctx.fillText('• "Night raid on enemy base with heavy defenses"', boxX + 30, boxY + 135);
        G.ctx.fillText('• "Defend against incoming air attack"', boxX + 30, boxY + 150);
        G.ctx.fillText('• "Stealth mission, minimal enemies, fog"', boxX + 30, boxY + 165);
        
        // Input field
        const inputX = boxX + 30;
        const inputY = boxY + 195;
        const inputW = boxWidth - 60;
        const inputH = 30;
        
        G.ctx.fillStyle = 'rgba(0, 40, 0, 0.8)';
        G.ctx.fillRect(inputX, inputY, inputW, inputH);
        G.ctx.strokeStyle = '#0f0';
        G.ctx.lineWidth = 2;
        G.ctx.strokeRect(inputX, inputY, inputW, inputH);
        
        // Blinking cursor
        G.missionGeneratorCursorTime += 16;
        if (G.missionGeneratorCursorTime > 500) {
            G.missionGeneratorCursor = !G.missionGeneratorCursor;
            G.missionGeneratorCursorTime = 0;
        }
        
        G.ctx.font = '14px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        const displayText = G.missionGeneratorInput + (G.missionGeneratorCursor ? '_' : '');
        G.ctx.fillText(displayText, inputX + 8, inputY + 20);
        
        // Buttons
        G.ctx.textAlign = 'center';
        
        // Generate button
        const genBtnX = centerX - 120;
        const genBtnY = boxY + 245;
        const genBtnW = 100;
        const genBtnH = 32;
        
        const canGenerate = G.missionGeneratorInput.trim().length > 0 && !G.isGeneratingMission;
        const genBtnHovered = hitTest({ x: genBtnX, y: genBtnY, width: genBtnW, height: genBtnH }, G.mouseX, G.mouseY);
        G.ctx.fillStyle = canGenerate ? (genBtnHovered ? 'rgba(0, 100, 0, 0.8)' : 'rgba(0, 80, 0, 0.7)') : 'rgba(0, 30, 0, 0.5)';
        G.ctx.fillRect(genBtnX, genBtnY, genBtnW, genBtnH);
        G.ctx.strokeStyle = canGenerate ? '#0f0' : '#050';
        G.ctx.strokeRect(genBtnX, genBtnY, genBtnW, genBtnH);
        G.ctx.fillStyle = canGenerate ? '#0f0' : '#050';
        G.ctx.font = 'bold 14px Courier New';
        G.ctx.fillText('GENERATE', genBtnX + genBtnW / 2, genBtnY + 21);
        
        // Add generate button to G.menuButtons for click handling
        G.menuButtons.push({
            x: genBtnX, y: genBtnY, width: genBtnW, height: genBtnH,
            onClick: () => {
                if (canGenerate) {
                    G.generateAIMission(G.missionGeneratorInput.trim(), 'normal');
                }
            }
        });
        
        // Cancel button
        const cancelBtnX = centerX + 20;
        const cancelBtnHovered = hitTest({ x: cancelBtnX, y: genBtnY, width: genBtnW, height: genBtnH }, G.mouseX, G.mouseY);
        G.ctx.fillStyle = cancelBtnHovered ? 'rgba(0, 50, 0, 0.7)' : 'rgba(0, 30, 0, 0.6)';
        G.ctx.fillRect(cancelBtnX, genBtnY, genBtnW, genBtnH);
        G.ctx.strokeStyle = '#0a0';
        G.ctx.strokeRect(cancelBtnX, genBtnY, genBtnW, genBtnH);
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('CANCEL', cancelBtnX + genBtnW / 2, genBtnY + 21);
        
        // Add cancel button to G.menuButtons for click handling
        G.menuButtons.push({
            x: cancelBtnX, y: genBtnY, width: genBtnW, height: genBtnH,
            onClick: () => {
                G.missionGeneratorInput = '';
                G.startTransition(G.GAME_STATES.MENU, 400);
            }
        });
        
        // Status message
        G.ctx.font = '12px Courier New';
        G.ctx.textAlign = 'center';
        if (G.isGeneratingMission) {
            G.ctx.fillStyle = '#ff0';
            G.ctx.fillText('Generating mission... please wait', centerX, boxY + boxHeight - 25);
        } else if (G.aiMission) {
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('Mission ready! Return to menu and press ENTER to start', centerX, boxY + boxHeight - 25);
        } else {
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText('Press ENTER to generate, ESC to cancel', centerX, boxY + boxHeight - 25);
        }
        G.ctx.restore();
    }
    

    function renderCustomMissionOverlay() {
        G.menuButtons = [];
    
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 500;
        const boxHeight = 350;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
    
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'MAP EDITOR MISSION');
    
        G.ctx.font = '14px Courier New';
        G.ctx.textAlign = 'center';
    
        if (G.customMissionConfig) {
            // Show mission details
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('Custom mission loaded!', centerX, boxY + 60);
    
            G.ctx.font = '16px Courier New';
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText(G.customMissionConfig.name || 'Unnamed Mission', centerX, boxY + 95);
    
            G.ctx.font = '12px Courier New';
            G.ctx.textAlign = 'left';
            const detailsX = boxX + 40;
            let detailsY = boxY + 130;
    
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText(`Map: Map ${G.customMissionConfig.mapIndex || 1}`, detailsX, detailsY);
            detailsY += 25;
            G.ctx.fillText(`Difficulty: ${(G.customMissionConfig.difficulty || 'medium').toUpperCase()}`, detailsX, detailsY);
            detailsY += 25;
            G.ctx.fillText(`Weather: ${(G.customMissionConfig.weather || 'clear').toUpperCase()}`, detailsX, detailsY);
            detailsY += 25;
    
            // Count objects
            const airportCount = (G.customMissionConfig.airports || []).length;
            const baseCount = (G.customMissionConfig.bases || []).length;
            const helipadCount = (G.customMissionConfig.helipads || []).length;
            const zoneCount = (G.customMissionConfig.spawnZones || []).length;
    
            G.ctx.fillText(`Airports: ${airportCount}`, detailsX, detailsY);
            G.ctx.fillText(`Bases: ${baseCount}`, detailsX + 150, detailsY);
            detailsY += 25;
            G.ctx.fillText(`Helipads: ${helipadCount}`, detailsX, detailsY);
            G.ctx.fillText(`Spawn Zones: ${zoneCount}`, detailsX + 150, detailsY);
    
            // Launch button
            const launchBtnX = centerX - 60;
            const launchBtnY = boxY + boxHeight - 90;
            const launchBtnW = 120;
            const launchBtnH = 36;
    
            const launchHovered = hitTest({ x: launchBtnX, y: launchBtnY, width: launchBtnW, height: launchBtnH }, G.mouseX, G.mouseY);
            G.ctx.fillStyle = launchHovered ? 'rgba(0, 100, 0, 0.8)' : 'rgba(0, 80, 0, 0.7)';
            G.ctx.fillRect(launchBtnX, launchBtnY, launchBtnW, launchBtnH);
            G.ctx.strokeStyle = '#0f0';
            G.ctx.lineWidth = 2;
            G.ctx.strokeRect(launchBtnX, launchBtnY, launchBtnW, launchBtnH);
    
            G.ctx.textAlign = 'center';
            G.ctx.font = 'bold 16px Courier New';
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('LAUNCH', launchBtnX + launchBtnW / 2, launchBtnY + 24);
    
            G.menuButtons.push({
                x: launchBtnX, y: launchBtnY, width: launchBtnW, height: launchBtnH,
                onClick: () => {
                    G.playMenuConfirmSound();
                    G.startTransition(G.GAME_STATES.PLAYING, 700, {
                        onSwitch: () => G.startCustomMission()
                    });
                }
            });
    
            G.ctx.font = '12px Courier New';
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText('Press ENTER to launch, ESC to cancel', centerX, boxY + boxHeight - 30);
        } else {
            // No mission found
            G.ctx.fillStyle = '#f00';
            G.ctx.fillText('No custom mission found!', centerX, boxY + 80);
    
            G.ctx.font = '12px Courier New';
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText('Use the Map Editor to create and save a mission.', centerX, boxY + 120);
            G.ctx.fillText('Open: /src/web/mapeditor.html', centerX, boxY + 145);
            G.ctx.fillText('Click "Save to Browser" to store your mission.', centerX, boxY + 170);
    
            G.ctx.fillStyle = '#ff0';
            G.ctx.fillText('Press ESC to return to menu', centerX, boxY + boxHeight - 30);
        }
    
        // Back button
        const backBtnX = boxX + 20;
        const backBtnY = boxY + boxHeight - 50;
        const backBtnW = 80;
        const backBtnH = 30;
    
        const backHovered = hitTest({ x: backBtnX, y: backBtnY, width: backBtnW, height: backBtnH }, G.mouseX, G.mouseY);
        G.ctx.fillStyle = backHovered ? 'rgba(0, 50, 0, 0.7)' : 'rgba(0, 30, 0, 0.6)';
        G.ctx.fillRect(backBtnX, backBtnY, backBtnW, backBtnH);
        G.ctx.strokeStyle = '#0a0';
        G.ctx.lineWidth = 1;
        G.ctx.strokeRect(backBtnX, backBtnY, backBtnW, backBtnH);
    
        G.ctx.textAlign = 'center';
        G.ctx.font = '14px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.fillText('BACK', backBtnX + backBtnW / 2, backBtnY + 20);
    
        G.menuButtons.push({
            x: backBtnX, y: backBtnY, width: backBtnW, height: backBtnH,
            onClick: () => {
                G.playMenuConfirmSound();
                G.customMissionConfig = null;
                G.startTransition(G.GAME_STATES.MENU, 400);
            }
        });
    }
    

    function renderCampaignOverlay() {
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 480;
        const boxHeight = 400;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - 170;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'CAMPAIGN OPERATIONS');
    
        G.ctx.font = '16px Courier New';
        let y = boxY + 70;
        const availableMissions = G.getCampaignMissionIndices();
        for (let i = 0; i < availableMissions.length; i++) {
            const mission = G.MISSIONS[availableMissions[i]];
            const rect = { x: boxX + 20, y: y - 18, width: boxWidth - 40, height: 30 };
            const hovered = hitTest(rect, G.mouseX, G.mouseY);
            if (i === G.campaignSelectionIndex || hovered) {
                G.ctx.fillStyle = 'rgba(0, 90, 0, 0.6)';
                G.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
            G.ctx.fillStyle = i === G.campaignSelectionIndex ? '#0f0' : '#0a0';
            G.ctx.textAlign = 'left';
            const difficultyStars = getDifficultyStars(mission.difficulty);
            G.ctx.fillText(`[${i + 1}] MISSION ${i + 1}`, rect.x + 10, y + 4);
            G.ctx.textAlign = 'right';
            G.ctx.fillStyle = i === G.campaignSelectionIndex ? '#ff0' : '#880';
            G.ctx.fillText(difficultyStars, rect.x + rect.width - 10, y + 4);
            G.menuButtons.push({ ...rect, onClick: async () => {
                G.campaignSelectionIndex = i;
                G.currentMissionIndex = availableMissions[i];
                // Preload mission layout for accurate briefing display
                await G.preloadMissionLayout(G.currentMissionIndex);
                G.startTransition(G.GAME_STATES.BRIEFING, 600);
            }});
            y += 40;
        }
    
        const backRect = { x: boxX + 140, y: boxY + boxHeight - 55, width: boxWidth - 280, height: 32 };
        const backHover = hitTest(backRect, G.mouseX, G.mouseY);
        drawMenuButton('BACK TO MAIN MENU', backRect, false, backHover);
        G.menuButtons.push({ ...backRect, onClick: () => G.startTransition(G.GAME_STATES.MENU, 500) });
    
    }
    

    function renderFreePlayOverlay() {
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 440;
        const boxHeight = 260;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - 140;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'FREE PLAY');
    
        G.ctx.font = '14px Courier New';
        G.ctx.fillStyle = '#0c0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('SELECT MAP USING DROPDOWN (TOP RIGHT)', centerX, boxY + 80);
        G.ctx.fillText('NO TIME LIMIT  •  RANDOM TARGETS', centerX, boxY + 110);
    
        let y = boxY + 160;
        for (let i = 0; i < G.FREEPLAY_OPTIONS.length; i++) {
            const rect = { x: boxX + 80, y: y - 18, width: boxWidth - 160, height: 34 };
            const hovered = hitTest(rect, G.mouseX, G.mouseY);
            drawMenuButton(G.FREEPLAY_OPTIONS[i], rect, i === G.freePlaySelectionIndex, hovered);
            G.menuButtons.push({ ...rect, onClick: () => {
                if (i === 0) {
                    G.startTransition(G.GAME_STATES.PLAYING, 700, { onSwitch: () => G.startFreePlay() });
                } else {
                    G.startTransition(G.GAME_STATES.MENU, 500);
                }
            }});
            y += 50;
        }
    }
    

    function renderSettingsOverlay() {
        G.menuButtons = [];
        G.settingsControls = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 520;
        const boxHeight = 440;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - 220;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'SETTINGS');
    
        let y = boxY + 70;
        for (let i = 0; i < G.SETTINGS_ITEMS.length; i++) {
            const item = G.SETTINGS_ITEMS[i];
            const isSelected = i === G.settingsSelectionIndex;
            if (item.type === 'slider') {
                G.ctx.font = '14px Courier New';
                G.ctx.fillStyle = isSelected ? '#0f0' : '#0a0';
                G.ctx.textAlign = 'left';
                G.ctx.fillText(item.label, boxX + 30, y);
    
                const sliderX = boxX + 220;
                const sliderY = y - 12;
                const sliderWidth = 220;
                const sliderHeight = 12;
                G.ctx.fillStyle = 'rgba(0, 40, 0, 0.8)';
                G.ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);
                G.ctx.strokeStyle = '#0a0';
                G.ctx.strokeRect(sliderX, sliderY, sliderWidth, sliderHeight);
    
                const value = G.settings[item.key];
                const t = (value - item.min) / (item.max - item.min);
                const fillWidth = Math.max(0, Math.min(sliderWidth, t * sliderWidth));
                G.ctx.fillStyle = '#0f0';
                G.ctx.fillRect(sliderX, sliderY, fillWidth, sliderHeight);
    
                G.ctx.fillStyle = '#0f0';
                G.ctx.textAlign = 'right';
                let displayValue = '';
                if (item.key.includes('Volume')) {
                    displayValue = `${Math.round(value * 100)}%`;
                } else if (item.key === 'drawDistance') {
                    displayValue = `${Math.round(value)}`;
                } else {
                    displayValue = value.toFixed(2);
                }
                G.ctx.fillText(displayValue, boxX + boxWidth - 30, y);
    
                const controlRect = { x: sliderX, y: sliderY, width: sliderWidth, height: sliderHeight, type: 'slider', key: item.key, min: item.min, max: item.max, step: item.step };
                G.settingsControls.push(controlRect);
                y += 40;
            } else if (item.type === 'toggle') {
                const rect = { x: boxX + 30, y: y - 18, width: boxWidth - 60, height: 30, type: 'toggle', key: item.key };
                const hovered = hitTest(rect, G.mouseX, G.mouseY);
                if (isSelected || hovered) {
                    G.ctx.fillStyle = 'rgba(0, 80, 0, 0.5)';
                    G.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                }
                G.ctx.font = '14px Courier New';
                G.ctx.fillStyle = isSelected ? '#0f0' : '#0a0';
                G.ctx.textAlign = 'left';
                G.ctx.fillText(item.label, rect.x + 10, y + 4);
                G.ctx.textAlign = 'right';
                G.ctx.fillStyle = G.settings[item.key] ? '#0f0' : '#060';
                G.ctx.fillText(G.settings[item.key] ? 'ON' : 'OFF', rect.x + rect.width - 10, y + 4);
                G.settingsControls.push(rect);
                y += 40;
            } else if (item.type === 'action') {
                const rect = { x: boxX + 140, y: y - 18, width: boxWidth - 280, height: 34, type: 'action', onClick: () => G.startTransition(G.GAME_STATES.MENU, 500) };
                const hovered = hitTest(rect, G.mouseX, G.mouseY);
                drawMenuButton(item.label, rect, isSelected, hovered);
                G.settingsControls.push(rect);
                y += 50;
            }
        }
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('LEFT/RIGHT TO ADJUST  •  ENTER TO TOGGLE', centerX, boxY + boxHeight - 20);
    }
    

    function renderAchievementsOverlay() {
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 720;
        const boxHeight = 580;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'G.ACHIEVEMENTS & STATS');
    
        const achievementIds = Object.keys(G.ACHIEVEMENTS);
        const columns = 2;
        const rows = Math.ceil(achievementIds.length / columns);
        const colWidth = (boxWidth - 120) / columns;
        const rowHeight = 52;
        const startY = boxY + 70;
        const startX = boxX + 40;
    
        G.ctx.font = 'bold 13px Courier New';
        for (let i = 0; i < achievementIds.length; i++) {
            const id = achievementIds[i];
            const achievement = G.ACHIEVEMENTS[id];
            const unlocked = G.hasAchievement(id);
            const col = Math.floor(i / rows);
            const row = i % rows;
            const x = startX + col * colWidth;
            const y = startY + row * rowHeight;
    
            G.ctx.fillStyle = unlocked ? 'rgba(0, 70, 0, 0.6)' : 'rgba(0, 25, 0, 0.4)';
            G.ctx.fillRect(x - 10, y - 18, colWidth - 20, 40);
    
            G.ctx.fillStyle = unlocked ? '#ff0' : '#444';
            G.ctx.textAlign = 'left';
            G.ctx.fillText(achievement.icon, x, y);
    
            G.ctx.fillStyle = unlocked ? '#0f0' : '#070';
            G.ctx.fillText(achievement.name.toUpperCase(), x + 26, y);
    
            G.ctx.font = '12px Courier New';
            G.ctx.fillStyle = unlocked ? '#0c0' : '#050';
            const maxDescLen = 35;
            const descText = achievement.desc.length > maxDescLen ? achievement.desc.substring(0, maxDescLen - 2) + '..' : achievement.desc;
            G.ctx.fillText(descText, x + 26, y + 16);
            G.ctx.font = 'bold 13px Courier New';
        }
    
        const statsY = startY + rows * rowHeight + 10;
        G.ctx.strokeStyle = '#0a0';
        G.ctx.beginPath();
        G.ctx.moveTo(boxX + 30, statsY);
        G.ctx.lineTo(boxX + boxWidth - 30, statsY);
        G.ctx.stroke();
    
        G.ctx.font = 'bold 14px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        G.ctx.fillText('LIFETIME STATS', boxX + 30, statsY + 30);
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0c0';
        const statsLeftX = boxX + 30;
        let statsLineY = statsY + 50;
        G.ctx.fillText(`Total Kills: ${G.profile.stats.totalKills}`, statsLeftX, statsLineY);
        statsLineY += 18;
        G.ctx.fillText(`Total Deaths: ${G.profile.stats.totalDeaths}`, statsLeftX, statsLineY);
        statsLineY += 18;
        G.ctx.fillText(`Missions Completed: ${G.profile.stats.missionsCompleted}`, statsLeftX, statsLineY);
        statsLineY += 18;
        G.ctx.fillText(`Total Time Played: ${G.formatDuration(G.profile.stats.totalTimePlayed)}`, statsLeftX, statsLineY);
        statsLineY += 18;
        G.ctx.fillText(`High Score: ${G.profile.highScore}`, statsLeftX, statsLineY);
    
        G.ctx.font = 'bold 14px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        G.ctx.fillText('MISSION PROGRESS', boxX + boxWidth / 2 + 10, statsY + 30);
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0c0';
        let missionY = statsY + 50;
        for (const mission of G.MISSIONS) {
            const missionId = String(mission.id);
            const completed = G.profile.missionsCompleted.includes(missionId);
            const stars = G.profile.missionStars[missionId] || 0;
            const bestScore = G.profile.missionScores[missionId] || 0;
            G.ctx.fillStyle = completed ? '#0f0' : '#060';
            G.ctx.fillText(`M${mission.id}: ${mission.name}`, boxX + boxWidth / 2 + 10, missionY);
            G.ctx.textAlign = 'right';
            G.ctx.fillStyle = '#ff0';
            G.ctx.fillText(getStarString(stars), boxX + boxWidth - 30, missionY);
            G.ctx.textAlign = 'left';
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText(`Best: ${bestScore}`, boxX + boxWidth / 2 + 10, missionY + 16);
            missionY += 32;
        }
    
        const backRect = { x: boxX + 240, y: boxY + boxHeight - 50, width: boxWidth - 480, height: 32 };
        const backHover = hitTest(backRect, G.mouseX, G.mouseY);
        drawMenuButton('BACK TO MENU', backRect, false, backHover);
        G.menuButtons.push({ ...backRect, onClick: () => G.startTransition(G.GAME_STATES.MENU, 500) });
    }
    

    function renderLeaderboardOverlay() {
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 520;
        const boxHeight = 500;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'GLOBAL LEADERBOARD');
    
        const stats = G.cachedGlobalStats;
        G.ctx.textAlign = 'center';
        if (!stats || !stats.leaderboard || !stats.totals) {
            G.ctx.font = '14px Courier New';
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText('Fetching latest scores...', centerX, boxY + 90);
        } else {
            G.ctx.font = '12px Courier New';
            G.ctx.fillStyle = '#0a0';
            G.ctx.fillText(`Total Kills: ${stats.totals.kills}  •  Deaths: ${stats.totals.deaths}  •  Missions: ${stats.totals.missionsCompleted}`, centerX, boxY + 70);
    
            G.ctx.font = 'bold 14px Courier New';
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('TOP PILOTS', centerX, boxY + 95);
    
            // Scrollable leaderboard
            const visibleCount = 9; // Reduced to fit mission/map info per entry
            const totalEntries = stats.leaderboard.length;
            const maxScroll = Math.max(0, totalEntries - visibleCount);
            G.leaderboardScrollOffset = Math.max(0, Math.min(maxScroll, G.leaderboardScrollOffset));
    
            G.ctx.font = '12px Courier New';
            G.ctx.textAlign = 'left';
            let y = boxY + 125;
            const listX = boxX + 40;
            const scoreX = boxX + boxWidth - 40;
    
            // Show scroll indicator if there are more entries
            if (totalEntries > visibleCount) {
                G.ctx.textAlign = 'center';
                G.ctx.fillStyle = '#0a0';
                G.ctx.font = '11px Courier New';
                G.ctx.fillText(`Showing ${G.leaderboardScrollOffset + 1}-${Math.min(G.leaderboardScrollOffset + visibleCount, totalEntries)} of ${totalEntries}  (↑/↓ to scroll)`, centerX, boxY + 112);
                G.ctx.font = '12px Courier New';
                G.ctx.textAlign = 'left';
            }
    
            for (let i = G.leaderboardScrollOffset; i < Math.min(G.leaderboardScrollOffset + visibleCount, totalEntries); i++) {
                const entry = stats.leaderboard[i];
                const rank = i + 1;
                G.ctx.fillStyle = rank <= 3 ? '#ff0' : '#0f0';
                G.ctx.fillText(`${rank}.`, listX, y);
                G.ctx.fillStyle = '#0f0';
                G.ctx.fillText(entry.name.substring(0, 18), listX + 30, y);
                G.ctx.textAlign = 'right';
                G.ctx.fillStyle = '#0c0';
                G.ctx.fillText(entry.score.toLocaleString(), scoreX, y);
                G.ctx.textAlign = 'left';
                
                // Show mission/map info below each entry
                G.ctx.font = '10px Courier New';
                G.ctx.fillStyle = '#666';
                const missionInfo = entry.mission ? `Mission ${entry.mission}` : 'Free Play';
                const mapInfo = entry.map ? `Map ${entry.map}` : '?';
                const killsInfo = entry.kills !== undefined ? `${entry.kills} kills` : '';
                const detailText = killsInfo ? `${missionInfo} • ${mapInfo} • ${killsInfo}` : `${missionInfo} • ${mapInfo}`;
                G.ctx.fillText(detailText, listX + 30, y + 12);
                G.ctx.font = '12px Courier New';
                
                y += 38; // Increased spacing to fit the extra line
            }
    
            if (stats.leaderboard.length === 0) {
                G.ctx.textAlign = 'center';
                G.ctx.fillStyle = '#0a0';
                G.ctx.fillText('No scores yet - be the first!', centerX, boxY + 150);
            }
        }
    
        const backRect = { x: boxX + 160, y: boxY + boxHeight - 50, width: boxWidth - 320, height: 34 };
        const backHover = hitTest(backRect, G.mouseX, G.mouseY);
        drawMenuButton('BACK TO MENU', backRect, false, backHover);
        G.menuButtons.push({ ...backRect, onClick: () => G.startTransition(G.GAME_STATES.MENU, 500) });
    }
    

    function renderHowToOverlay() {
        G.menuButtons = [];
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        const boxWidth = 620;
        const boxHeight = 680;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        drawMenuPanel(boxX, boxY, boxWidth, boxHeight, 'HOW TO PLAY');
    
        G.ctx.font = '14px Courier New';
        G.ctx.textAlign = 'left';
        let y = boxY + 65;
    
        // === COMANCHE MODE ===
        G.ctx.fillStyle = '#ff0';
        G.ctx.fillText('═══ COMANCHE MODE (Helicopter) ═══', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('MOVEMENT', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('W/S - Forward/Back   A/D - Bank   J/L - Yaw', boxX + 30, y);
        y += 16;
        G.ctx.fillText('R/F - Altitude   Q/E - Look Up/Down   SPACE - Boost', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('WEAPONS', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('1-4 - Select Weapon (Cannon/Rockets/Hellfire/Stinger)', boxX + 30, y);
        y += 16;
        G.ctx.fillText("Z/X or [ ] - Cycle Weapons   ; - Chaff   ' - Flare", boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('TARGETING', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('T - Target Crosshairs   Tab - Cycle Targets', boxX + 30, y);
    
        // === DELTA MODE ===
        y += 28;
        G.ctx.fillStyle = '#ff0';
        G.ctx.fillText('═══ DELTA MODE (On Foot) ═══', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('MOVEMENT', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('WASD - Move   Mouse - Look/Aim   Shift - Sprint', boxX + 30, y);
        y += 16;
        G.ctx.fillText('Ctrl - Crouch   V - Prone', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('WEAPONS', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('Click - Fire   R - Reload', boxX + 30, y);
        y += 16;
        G.ctx.fillText('Z/X - Cycle Weapons   1-5 - Direct Select', boxX + 30, y);
        y += 16;
        G.ctx.fillText('(M4, Sniper, Pistol, Javelin, Stinger)', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('TARGETING', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('T - Target Crosshairs   Tab - Cycle Targets', boxX + 30, y);
    
        // === GENERAL ===
        y += 28;
        G.ctx.fillStyle = '#ff0';
        G.ctx.fillText('═══ GENERAL ═══', boxX + 30, y);
        y += 22;
        G.ctx.fillStyle = '#0c0';
        G.ctx.fillText('E - Exit/Enter Helicopter (when landed)', boxX + 30, y);
        y += 16;
        G.ctx.fillText('M - Weather   N - Night Vision   B - Sound', boxX + 30, y);
        y += 16;
        G.ctx.fillText('ESC - Pause   H - Toggle Controls   F1 - Tips', boxX + 30, y);
        y += 16;
        G.ctx.fillText('G - Generate AI Mission (in menu)', boxX + 30, y);
    
        // === TARGETING INFO ===
        y += 24;
        G.ctx.fillStyle = '#0f0';
        G.ctx.fillText('TARGETING SYSTEM', boxX + 30, y);
        G.ctx.fillStyle = '#0c0';
        y += 18;
        G.ctx.fillText('• Tab cycles through valid G.targets for current weapon', boxX + 30, y);
        y += 16;
        G.ctx.fillText('• Guided missiles auto-lock when target is selected', boxX + 30, y);
        y += 16;
        G.ctx.fillText('• Lock progress bar shows below target brackets', boxX + 30, y);
        y += 16;
        G.ctx.fillText('• Fire when "LOCK" appears for best accuracy', boxX + 30, y);
    
        const backRect = { x: boxX + 180, y: boxY + boxHeight - 55, width: boxWidth - 360, height: 34 };
        const hovered = hitTest(backRect, G.mouseX, G.mouseY);
        drawMenuButton('BACK TO MENU', backRect, false, hovered);
        G.menuButtons.push({ ...backRect, onClick: () => G.startTransition(G.GAME_STATES.MENU, 500) });
    }
    

    function renderBriefingOverlay() {
        G.ctx.save();
        const mission = G.getBriefingMission();
        const isDelta = G.gameMode === G.GAME_MODES.DELTA;
        const briefingText = isDelta
            ? (mission.briefingDelta || mission.briefing)
            : mission.briefing;
        const targetConfig = isDelta
            ? (mission.targetsDelta || mission.targets)
            : mission.targets;
        
        // Semi-transparent dark background
        G.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
        
        const centerX = G.screenWidth / 2;
        const boxWidth = 550;
        const boxHeight = 450;
        const boxX = centerX - boxWidth / 2;
        const boxY = (G.screenHeight - boxHeight) / 2;
        
        // Border
        G.ctx.strokeStyle = '#0f0';
        G.ctx.lineWidth = 3;
        G.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Header
        G.ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
        G.ctx.fillRect(boxX, boxY, boxWidth, 40);
        
        G.ctx.font = 'bold 20px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('MISSION BRIEFING', centerX, boxY + 27);
        
        let y = boxY + 70;
        
        // Mission name
        G.ctx.font = 'bold 24px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        G.ctx.fillText(`MISSION: ${mission.name}`, boxX + 30, y);
        y += 35;
        
        // Difficulty
        G.ctx.font = '16px Courier New';
        G.ctx.fillStyle = '#ff0';
        const stars = getDifficultyStars(mission.difficulty);
        G.ctx.fillText(`DIFFICULTY: ${stars} ${mission.difficulty.toUpperCase()}`, boxX + 30, y);
        y += 25;
        
        // Time limit
        if (mission.timeLimit) {
            const mins = Math.floor(mission.timeLimit / 60);
            const secs = mission.timeLimit % 60;
            G.ctx.fillStyle = '#f80';
            G.ctx.fillText(`TIME LIMIT: ${mins}:${secs.toString().padStart(2, '0')}`, boxX + 30, y);
        } else {
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('TIME LIMIT: NONE', boxX + 30, y);
        }
        y += 40;
        
        // Briefing text
        G.ctx.fillStyle = '#0f0';
        G.ctx.font = '14px Courier New';
        G.ctx.fillText('BRIEFING:', boxX + 30, y);
        y += 25;
        
        G.ctx.fillStyle = '#0c0';
        const briefingLines = wrapText(briefingText, boxWidth - 60);
        for (const line of briefingLines) {
            G.ctx.fillText(line, boxX + 30, y);
            y += 20;
        }
        y += 20;
        
        // Objectives
        G.ctx.fillStyle = '#0f0';
        G.ctx.font = '14px Courier New';
        G.ctx.fillText('OBJECTIVES:', boxX + 30, y);
        y += 22;
        
        G.ctx.fillStyle = '#0c0';
        for (const obj of mission.objectives) {
            G.ctx.fillText(`  * ${obj.description}`, boxX + 30, y);
            y += 20;
        }
        y += 20;
        
        // Expected resistance
        G.ctx.fillStyle = '#f00';
        G.ctx.font = '14px Courier New';
        G.ctx.fillText('EXPECTED RESISTANCE:', boxX + 30, y);
        y += 22;
        
        G.ctx.fillStyle = '#c00';
        if (isDelta) {
            const soldierCount = targetConfig.soldiers || targetConfig.tanks || 0;
            G.ctx.fillText(`  * ${soldierCount} Enemy Combatants`, boxX + 30, y);
        } else {
            G.ctx.fillText(`  * ${targetConfig.tanks} Tanks  * ${targetConfig.sams} SAM Sites`, boxX + 30, y);
        }
        y += 30;
        
        // Reward
        G.ctx.fillStyle = '#ff0';
        G.ctx.fillText(`MISSION REWARD: ${mission.rewards.score} points`, boxX + 30, y);
        
        // Instructions at bottom of screen (not inside the box)
        G.ctx.font = '14px Courier New';
        G.ctx.textAlign = 'center';
        const instructionY = G.screenHeight - 40;
        
        const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
        if (blinkOn) {
            G.ctx.fillStyle = '#0f0';
            G.ctx.fillText('[ENTER] Launch Mission', centerX - 100, instructionY);
        }
        G.ctx.fillStyle = '#888';
        const backLabel = G.pendingAIMission ? '[ESC] Back to Menu' : '[ESC] Back to Campaign';
        G.ctx.fillText(backLabel, centerX + 100, instructionY);
        G.ctx.restore();
    }
    

    function renderPauseOverlay() {
        G.pauseButtons = [];
        G.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
    
        const panelW = 300;
        const panelH = 350;
        const panelX = (G.screenWidth - panelW) / 2;
        const panelY = (G.screenHeight - panelH) / 2;
    
        G.ctx.fillStyle = 'rgba(0, 30, 0, 0.95)';
        G.ctx.fillRect(panelX, panelY, panelW, panelH);
        G.ctx.strokeStyle = '#0f0';
        G.ctx.lineWidth = 3;
        G.ctx.strokeRect(panelX, panelY, panelW, panelH);
    
        G.ctx.font = 'bold 24px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('PAUSED', G.screenWidth / 2, panelY + 40);
    
        G.ctx.font = '12px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.textAlign = 'left';
        let y = panelY + 70;
    
        G.ctx.fillText(`Kills: ${G.sessionStats.kills}`, panelX + 20, y); y += 20;
        G.ctx.fillText(`Score: ${G.sessionStats.score}`, panelX + 20, y); y += 20;
        G.ctx.fillText(`Accuracy: ${G.calculateAccuracy()}%`, panelX + 20, y); y += 20;
        const timeLabel = G.gameMode === G.GAME_MODES.COMANCHE ? 'Flight Time' : 'Ground Time';
        const timeValue = G.gameMode === G.GAME_MODES.COMANCHE ? G.telemetry.flightTime : G.telemetry.groundTime;
        G.ctx.fillText(`${timeLabel}: ${Math.floor(timeValue)}s`, panelX + 20, y); y += 20;
        G.ctx.fillText(`Distance: ${Math.floor(G.telemetry.distanceTraveled)}m`, panelX + 20, y); y += 30;
    
        G.ctx.font = 'bold 14px Courier New';
        G.ctx.textAlign = 'center';
    
        y = panelY + 220;
        for (let i = 0; i < G.PAUSE_OPTIONS.length; i++) {
            const rect = { x: panelX + 20, y: y - 14, width: panelW - 40, height: 26 };
            const hovered = hitTest(rect, G.mouseX, G.mouseY);
            const isActive = hovered || i === G.pauseSelectionIndex;
            G.ctx.fillStyle = isActive ? '#ff0' : '#0f0';
            G.ctx.fillText(G.PAUSE_OPTIONS[i], G.screenWidth / 2, y);
            G.pauseButtons.push({ ...rect, onClick: () => {
                if (i === 0) {
                    G.startTransition(G.GAME_STATES.PLAYING, 250, { onSwitch: () => G.resumeFromPause() });
                } else if (i === 1) {
                    G.startTransition(G.GAME_STATES.PLAYING, 900, { hold: true, onSwitch: () => G.restartCurrentMode() });
                } else {
                    G.startTransition(G.GAME_STATES.MENU, 700, { onSwitch: () => G.returnToMenu() });
                }
            }});
            y += 35;
        }
    
        G.ctx.font = '11px Courier New';
        G.ctx.fillStyle = '#0a0';
        G.ctx.textAlign = 'center';
        G.ctx.fillText('Use UP/DOWN to select, ENTER to confirm', G.screenWidth / 2, panelY + panelH - 20);
    }
    

    function renderVictoryOverlay() {
        const mission = G.getActiveMission();
        if (!mission) return;
        G.ctx.save();
        
        // Semi-transparent dark background
        G.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
        
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        
        const boxWidth = 400;
        const boxHeight = 350;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        
        // Border with glow effect
        G.ctx.shadowColor = '#0f0';
        G.ctx.shadowBlur = 20;
        G.ctx.strokeStyle = '#0f0';
        G.ctx.lineWidth = 3;
        G.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        G.ctx.shadowBlur = 0;
        
        G.ctx.fillStyle = 'rgba(0, 30, 0, 0.9)';
        G.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        G.ctx.font = 'bold 36px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'center';
        G.ctx.shadowColor = '#0f0';
        G.ctx.shadowBlur = 15;
        G.ctx.fillText('MISSION COMPLETE', centerX, boxY + 50);
        G.ctx.shadowBlur = 0;
        
        // Score breakdown
        let y = boxY + 100;
        G.ctx.font = '16px Courier New';
        G.ctx.textAlign = 'left';
    
        const scoreInfo = G.calculateMissionScore(mission);
        
        const targetsDestroyed = G.targets.filter(t => t.destroyed).length;
        G.ctx.fillStyle = '#0c0';
        G.ctx.fillText(`Targets Destroyed:`, boxX + 40, y);
        G.ctx.textAlign = 'right';
        G.ctx.fillText(`${targetsDestroyed}`, boxX + boxWidth - 40, y);
        y += 30;
        
        G.ctx.textAlign = 'left';
        G.ctx.fillText(`Combat Score:`, boxX + 40, y);
        G.ctx.textAlign = 'right';
        G.ctx.fillText(`${G.score}`, boxX + boxWidth - 40, y);
        y += 30;
        
        // Time bonus
        let timeBonus = 0;
        if (mission.timeLimit && scoreInfo.timeBonus > 0) {
            timeBonus = scoreInfo.timeBonus;
            G.ctx.textAlign = 'left';
            G.ctx.fillStyle = '#ff0';
            G.ctx.fillText(`Time Bonus:`, boxX + 40, y);
            G.ctx.textAlign = 'right';
            G.ctx.fillText(`+${timeBonus}`, boxX + boxWidth - 40, y);
            y += 30;
        }
        
        // Health bonus
        const healthBonus = scoreInfo.healthBonus;
        G.ctx.textAlign = 'left';
        G.ctx.fillStyle = '#0ff';
        G.ctx.fillText(`Health Bonus:`, boxX + 40, y);
        G.ctx.textAlign = 'right';
        G.ctx.fillText(`+${healthBonus}`, boxX + boxWidth - 40, y);
        y += 30;
        
        // Mission reward
        G.ctx.textAlign = 'left';
        G.ctx.fillStyle = '#f80';
        G.ctx.fillText(`Mission Reward:`, boxX + 40, y);
        G.ctx.textAlign = 'right';
        G.ctx.fillText(`+${scoreInfo.reward}`, boxX + boxWidth - 40, y);
        y += 40;
        
        // Total
        const totalScore = scoreInfo.totalScore;
        G.ctx.font = 'bold 20px Courier New';
        G.ctx.fillStyle = '#0f0';
        G.ctx.textAlign = 'left';
        G.ctx.fillText(`TOTAL SCORE:`, boxX + 40, y);
        G.ctx.textAlign = 'right';
        G.ctx.fillText(`${totalScore}`, boxX + boxWidth - 40, y);
        
        // Instructions
        G.ctx.font = '14px Courier New';
        G.ctx.textAlign = 'center';
        
        const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
        if (G.activeAIMission) {
            if (blinkOn) {
                G.ctx.fillStyle = '#0f0';
                G.ctx.fillText('[ENTER] Return to Menu', centerX, boxY + boxHeight - 35);
            }
        } else if (G.getCampaignMissionIndices().indexOf(G.currentMissionIndex) < G.getCampaignMissionIndices().length - 1) {
            if (blinkOn) {
                G.ctx.fillStyle = '#0f0';
                G.ctx.fillText('[ENTER] Next Mission', centerX, boxY + boxHeight - 40);
            }
        } else {
            if (blinkOn) {
                G.ctx.fillStyle = '#ff0';
                G.ctx.fillText('ALL G.MISSIONS COMPLETE!', centerX, boxY + boxHeight - 55);
                G.ctx.fillStyle = '#0f0';
                G.ctx.fillText('[ENTER] Return to Menu', centerX, boxY + boxHeight - 35);
            }
        }
        G.ctx.fillStyle = '#888';
        G.ctx.fillText('[ESC] Return to Menu', centerX, boxY + boxHeight - 15);
    
        G.ctx.restore();
    }
    

    function renderDefeatOverlay() {
        G.ctx.save();
        // Semi-transparent red background
        G.ctx.fillStyle = 'rgba(50, 0, 0, 0.85)';
        G.ctx.fillRect(0, 0, G.screenWidth, G.screenHeight);
        
        const centerX = G.screenWidth / 2;
        const centerY = G.screenHeight / 2;
        
        const boxWidth = 350;
        const boxHeight = 220;
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        
        // Border
        G.ctx.shadowColor = '#f00';
        G.ctx.shadowBlur = 20;
        G.ctx.strokeStyle = '#f00';
        G.ctx.lineWidth = 3;
        G.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        G.ctx.shadowBlur = 0;
        
        G.ctx.fillStyle = 'rgba(30, 0, 0, 0.9)';
        G.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        G.ctx.font = 'bold 36px Courier New';
        G.ctx.fillStyle = '#f00';
        G.ctx.textAlign = 'center';
        G.ctx.shadowColor = '#f00';
        G.ctx.shadowBlur = 15;
        G.ctx.fillText('MISSION FAILED', centerX, boxY + 50);
        G.ctx.shadowBlur = 0;
        
        // Reason
        G.ctx.font = '18px Courier New';
        G.ctx.fillStyle = '#f88';
        G.ctx.fillText(G.defeatReason, centerX, boxY + 90);
        
        // Score
        G.ctx.font = '16px Courier New';
        G.ctx.fillStyle = '#c00';
        G.ctx.fillText(`Final Score: ${G.score}`, centerX, boxY + 130);
        
        // Instructions
        G.ctx.font = '14px Courier New';
        const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
        if (blinkOn) {
            G.ctx.fillStyle = '#f00';
            G.ctx.fillText('[ENTER] Retry Mission', centerX, boxY + boxHeight - 45);
        }
        G.ctx.fillStyle = '#888';
        G.ctx.fillText('[ESC] Return to Menu', centerX, boxY + boxHeight - 20);
    
        G.ctx.restore();
    }
    

    // ─── Module Export ─────────────────────────────────────────

    window.GameUI = {
        init: function(g) { G = g; },
        renderTitleOverlay,
        renderMainMenuOverlay,
        renderAIMissionUI,
        renderMissionGeneratorOverlay,
        renderCustomMissionOverlay,
        renderCampaignOverlay,
        renderFreePlayOverlay,
        renderSettingsOverlay,
        renderAchievementsOverlay,
        renderLeaderboardOverlay,
        renderHowToOverlay,
        renderBriefingOverlay,
        renderPauseOverlay,
        renderVictoryOverlay,
        renderDefeatOverlay,
        // Helpers also available externally
        hitTest,
        drawMenuPanel,
        drawMenuButton,
        drawModeToggleButton,
        getDifficultyStars,
        getStarString,
        wrapText,
    };

})();
