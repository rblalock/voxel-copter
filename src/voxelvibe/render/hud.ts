/**
 * VoxelVibe Engine - HUD Renderer
 * Cockpit HUD utility functions: panels, compass, altitude ladder,
 * flight path predictor, and attitude indicator.
 */

/** Canvas 2D context - set via init() */
let _ctx: CanvasRenderingContext2D;
let _canvas: HTMLCanvasElement | null = null;
let _screenWidth: number = 800;
let _screenHeight: number = 600;

/** Initialize the HUD renderer. */
export function init(ctx: CanvasRenderingContext2D, canvas?: HTMLCanvasElement): void {
	_ctx = ctx;
	if (canvas) _canvas = canvas;
}

/** Update screen dimensions (call from resizeCanvas). */
export function setScreenSize(width: number, height: number): void {
	_screenWidth = width;
	_screenHeight = height;
}

export function drawHUDPanel(x: number, y: number, width: number, height: number, title: string | null = null): void {
    // Panel background
    _ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
    _ctx.fillRect(x, y, width, height);
    
    // Panel border (double line effect)
    _ctx.strokeStyle = '#0a0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 2;
    _ctx.strokeRect(x, y, width, height);
    
    // Corner accents
    const cornerSize = 6;
    _ctx.fillStyle = '#0f0';
    // Top-left
    _ctx.fillRect(x, y, cornerSize, 2);
    _ctx.fillRect(x, y, 2, cornerSize);
    // Top-right
    _ctx.fillRect(x + width - cornerSize, y, cornerSize, 2);
    _ctx.fillRect(x + width - 2, y, 2, cornerSize);
    // Bottom-left
    _ctx.fillRect(x, y + height - 2, cornerSize, 2);
    _ctx.fillRect(x, y + height - cornerSize, 2, cornerSize);
    // Bottom-right
    _ctx.fillRect(x + width - cornerSize, y + height - 2, cornerSize, 2);
    _ctx.fillRect(x + width - 2, y + height - cornerSize, 2, cornerSize);
    
    // Title bar if provided
    if (title) {
        _ctx.fillStyle = 'rgba(0, 80, 0, 0.5)';
        _ctx.fillRect(x + 2, y + 2, width - 4, 16);
        _ctx.font = 'bold 11px Courier New';
        _ctx.fillStyle = '#0f0';
        _ctx.textAlign = 'center';
        _ctx.fillText(title, x + width / 2, y + 13);
    }
}

export function renderCompass(heading: number): void {
    const compassWidth = 250;
    const compassX = _screenWidth / 2 - compassWidth / 2;
    const compassY = 8;
    const compassHeight = 28;
    
    // Background
    _ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    _ctx.fillRect(compassX, compassY, compassWidth, compassHeight);
    
    // Border
    _ctx.strokeStyle = '#0a0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(compassX, compassY, compassWidth, compassHeight);
    
    // Clip to compass bounds
    _ctx.save();
    _ctx.beginPath();
    _ctx.rect(compassX + 1, compassY + 1, compassWidth - 2, compassHeight - 2);
    _ctx.clip();
    
    // Draw tick marks and labels for every 10 degrees
    const pixelsPerDegree = 2;
    _ctx.font = 'bold 11px Courier New';
    _ctx.textAlign = 'center';
    
    // Cardinal and ordinal directions
    const cardinals = {
        0: 'N', 45: 'NE', 90: 'E', 135: 'SE',
        180: 'S', 225: 'SW', 270: 'W', 315: 'NW'
    };
    
    for (let deg = -180; deg <= 540; deg += 5) {
        let normDeg = ((deg % 360) + 360) % 360;
        let diff = deg - heading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        if (Math.abs(diff) < compassWidth / 2 / pixelsPerDegree) {
            const x = _screenWidth / 2 + diff * pixelsPerDegree;
            
            // Draw tick
            _ctx.strokeStyle = '#0f0';
            _ctx.lineWidth = 1;
            _ctx.beginPath();
            
            if (deg % 10 === 0) {
                // Long tick for every 10 degrees
                _ctx.moveTo(x, compassY + compassHeight - 10);
                _ctx.lineTo(x, compassY + compassHeight - 2);
                _ctx.stroke();
                
                // Label
                if (cardinals[normDeg]) {
                    _ctx.fillStyle = '#0f0';
                    _ctx.fillText(cardinals[normDeg], x, compassY + 14);
                } else if (deg % 30 === 0) {
                    // Show degree number every 30 degrees
                    _ctx.fillStyle = '#0a0';
                    _ctx.font = '9px Courier New';
                    _ctx.fillText(normDeg.toString(), x, compassY + 14);
                    _ctx.font = 'bold 11px Courier New';
                }
            } else {
                // Short tick for every 5 degrees
                _ctx.moveTo(x, compassY + compassHeight - 6);
                _ctx.lineTo(x, compassY + compassHeight - 2);
                _ctx.stroke();
            }
        }
    }
    
    _ctx.restore();
    
    // Center marker (current heading indicator)
    _ctx.fillStyle = '#ff0';
    _ctx.beginPath();
    _ctx.moveTo(_screenWidth / 2, compassY - 2);
    _ctx.lineTo(_screenWidth / 2 - 6, compassY + 6);
    _ctx.lineTo(_screenWidth / 2 + 6, compassY + 6);
    _ctx.closePath();
    _ctx.fill();
    
    // Heading readout (removed - keep compass visual only)
    // _ctx.font = 'bold 12px Courier New';
    // _ctx.fillStyle = '#0f0';
    // _ctx.textAlign = 'center';
    // const headingStr = Math.round(heading).toString().padStart(3, '0');
    // _ctx.fillText(headingStr + '°', _screenWidth / 2, compassY + compassHeight + 12);
}


export function renderAltitudeLadder(altitude: number, verticalSpeed: number, _camDistance: number): void {
    // Altitude ladder on right side (like Comanche)
    const ladderX = _screenWidth - 50;
    const ladderY = _screenHeight / 2 - 100;
    const ladderHeight = 200;
    const ladderWidth = 40;
    
    // Background
    _ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    _ctx.fillRect(ladderX, ladderY, ladderWidth, ladderHeight);
    _ctx.strokeStyle = '#0a0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(ladderX, ladderY, ladderWidth, ladderHeight);
    
    // Current altitude
    altitude = Math.round(altitude);
    const altPerPixel = 2;  // Altitude units per pixel
    
    // Draw tick marks and altitude labels
    _ctx.save();
    _ctx.beginPath();
    _ctx.rect(ladderX, ladderY, ladderWidth, ladderHeight);
    _ctx.clip();
    
    const centerY = ladderY + ladderHeight / 2;
    
    // Draw altitude scale
    for (let alt = Math.floor((altitude - 100) / 10) * 10; alt <= altitude + 100; alt += 10) {
        const yOffset = (altitude - alt) / altPerPixel;
        const y = centerY + yOffset;
        
        if (y >= ladderY && y <= ladderY + ladderHeight) {
            _ctx.strokeStyle = '#0f0';
            _ctx.lineWidth = 1;
            _ctx.beginPath();
            
            if (alt % 50 === 0) {
                // Long tick with label
                _ctx.moveTo(ladderX, y);
                _ctx.lineTo(ladderX + 15, y);
                _ctx.stroke();
                
                _ctx.font = '10px Courier New';
                _ctx.fillStyle = '#0f0';
                _ctx.textAlign = 'left';
                _ctx.fillText(alt.toString(), ladderX + 18, y + 3);
            } else {
                // Short tick
                _ctx.moveTo(ladderX, y);
                _ctx.lineTo(ladderX + 8, y);
                _ctx.stroke();
            }
        }
    }
    
    _ctx.restore();
    
    // Current altitude indicator (center reference) - REMOVED: caused floating line artifact
    // _ctx.strokeStyle = '#ff0';
    // _ctx.lineWidth = 2;
    // _ctx.beginPath();
    // _ctx.moveTo(ladderX - 5, centerY);
    // _ctx.lineTo(ladderX + 5, centerY - 5);
    // _ctx.lineTo(ladderX + 5, centerY + 5);
    // _ctx.closePath();
    // _ctx.stroke();
    
    // Digital altitude readout
    _ctx.fillStyle = '#0f0';
    _ctx.font = 'bold 14px Courier New';
    _ctx.textAlign = 'center';
    _ctx.fillText(altitude.toString(), ladderX + ladderWidth / 2, ladderY + ladderHeight + 18);
    
    // Vertical speed indicator
    const vspeed = Math.round((verticalSpeed || 0) * 10);
    if (vspeed !== 0) {
        _ctx.font = '10px Courier New';
        _ctx.fillStyle = vspeed > 0 ? '#0f0' : '#f80';
        const vspeedStr = (vspeed > 0 ? '+' : '') + vspeed;
        _ctx.fillText(vspeedStr, ladderX + ladderWidth / 2, ladderY - 5);
    }
}


export function renderFlightPathPredictor(bank: number, forwardSpeed: number, yawRate: number): void {
    // Flight path predictor shows where helicopter will fly based on current bank/speed
    // Inspired by Comanche's trajectory indicator
    
    const cx = _screenWidth / 2;
    const cy = _screenHeight / 2;
    const bankAngle = bank || 0;
    forwardSpeed = Math.abs(forwardSpeed || 0);
    yawRate = yawRate || 0;
    
    // Only show when moving
    if (forwardSpeed < 0.5) return;
    
    _ctx.save();
    
    // Dashed line style
    _ctx.setLineDash([5, 5]);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 1;
    
    _ctx.beginPath();
    _ctx.moveTo(cx, cy);
    
    // Predict path over next ~2 seconds
    let px = cx;
    let py = cy;
    let angle = 0;  // Relative to screen center
    const steps = 30;
    const timeStep = 0.07;  // Time per step
    
    for (let i = 0; i < steps; i++) {
        // Integrate position based on current yaw rate
        // Yaw rate causes curving path on screen
        const turnFactor = yawRate * 800;  // Scale for screen
        const advanceFactor = forwardSpeed * 3;
        
        angle += turnFactor * timeStep;
        
        // Move forward (up on screen) and curve based on bank/yaw
        px += Math.sin(angle) * advanceFactor;
        py -= Math.cos(angle) * advanceFactor * 0.5;  // Less vertical movement
        
        _ctx.lineTo(px, py);
        
        // Fade out towards the end
        if (i > steps * 0.7) {
            _ctx.globalAlpha = 1 - (i - steps * 0.7) / (steps * 0.3);
        }
    }
    
    _ctx.stroke();
    
    // Prediction marker at end
    _ctx.globalAlpha = 0.5;
    _ctx.setLineDash([]);
    _ctx.beginPath();
    _ctx.arc(px, py, 5, 0, Math.PI * 2);
    _ctx.stroke();
    
    _ctx.restore();
}


export function renderAttitudeIndicator(cx: number, cy: number, bank: number, pitch: number): void {
    const width = 120;
    const height = 40;
    const bankAngle = bank || 0;
    const pitchOffset = (pitch || 0) * 30;
    
    // Background
    _ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    _ctx.fillRect(cx - width/2, cy - height/2, width, height);
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 1;
    _ctx.strokeRect(cx - width/2, cy - height/2, width, height);
    
    // Clip to indicator bounds
    _ctx.save();
    _ctx.beginPath();
    _ctx.rect(cx - width/2 + 2, cy - height/2 + 2, width - 4, height - 4);
    _ctx.clip();
    
    // Draw artificial horizon line (tilted by bank, offset by pitch)
    _ctx.save();
    _ctx.translate(cx, cy + pitchOffset);
    _ctx.rotate(bankAngle);
    
    // Sky (above horizon)
    _ctx.fillStyle = '#234';
    _ctx.fillRect(-width, -height * 2, width * 2, height * 2);
    
    // Ground (below horizon)
    _ctx.fillStyle = '#432';
    _ctx.fillRect(-width, 0, width * 2, height * 2);
    
    // Horizon line
    _ctx.strokeStyle = '#fff';
    _ctx.lineWidth = 2;
    _ctx.beginPath();
    _ctx.moveTo(-width, 0);
    _ctx.lineTo(width, 0);
    _ctx.stroke();
    
    // Pitch ladder lines
    _ctx.strokeStyle = '#888';
    _ctx.lineWidth = 1;
    for (let p = -20; p <= 20; p += 10) {
        if (p !== 0) {
            const y = -p * 1.5;
            _ctx.beginPath();
            _ctx.moveTo(-20, y);
            _ctx.lineTo(20, y);
            _ctx.stroke();
        }
    }
    
    _ctx.restore();
    _ctx.restore();
    
    // Aircraft reference symbol (fixed, doesn't rotate)
    _ctx.strokeStyle = '#ff0';
    _ctx.lineWidth = 2;
    _ctx.beginPath();
    // Left wing
    _ctx.moveTo(cx - 25, cy);
    _ctx.lineTo(cx - 10, cy);
    // Right wing
    _ctx.moveTo(cx + 10, cy);
    _ctx.lineTo(cx + 25, cy);
    // Center mark
    _ctx.moveTo(cx - 3, cy);
    _ctx.lineTo(cx + 3, cy);
    _ctx.moveTo(cx, cy - 3);
    _ctx.lineTo(cx, cy + 3);
    _ctx.stroke();
    
    // Bank angle indicator arc at top
    _ctx.strokeStyle = '#0f0';
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.arc(cx, cy - height/2 + 5, 35, Math.PI * 1.25, Math.PI * 1.75);
    _ctx.stroke();
    
    // Bank angle marker (triangle pointing to current bank)
    _ctx.save();
    _ctx.translate(cx, cy - height/2 + 5);
    _ctx.rotate(bankAngle);
    _ctx.fillStyle = '#0f0';
    _ctx.beginPath();
    _ctx.moveTo(0, -35);
    _ctx.lineTo(-4, -28);
    _ctx.lineTo(4, -28);
    _ctx.closePath();
    _ctx.fill();
    _ctx.restore();
}

/**
 * Applies a night vision post-processing effect to the canvas.
 * @param ambient Weather ambient light level (0=dark, 1=full daylight).
 */
export function applyNightVisionEffect(ambient: number): void {
    const boostFactor = Math.min(4.0, Math.max(1.5, 1.5 / ambient));

    _ctx.save();

    // Step 1: Brighten the image (simulate light amplification)
    _ctx.globalCompositeOperation = 'lighter';
    _ctx.globalAlpha = (boostFactor - 1) * 0.5;
    if (_canvas) _ctx.drawImage(_canvas, 0, 0);

    if (ambient < 0.4) {
        _ctx.globalAlpha = 0.3;
        if (_canvas) _ctx.drawImage(_canvas, 0, 0);
    }

    // Step 2: Green tint
    _ctx.globalCompositeOperation = 'multiply';
    _ctx.globalAlpha = 1.0;
    _ctx.fillStyle = '#60ff60';
    _ctx.fillRect(0, 0, _screenWidth, _screenHeight);

    // Step 3: Contrast boost
    _ctx.globalCompositeOperation = 'overlay';
    _ctx.globalAlpha = 0.2;
    _ctx.fillStyle = '#00ff00';
    _ctx.fillRect(0, 0, _screenWidth, _screenHeight);

    // Step 4: Screen blend
    _ctx.globalCompositeOperation = 'screen';
    _ctx.globalAlpha = 0.15;
    _ctx.fillStyle = '#003300';
    _ctx.fillRect(0, 0, _screenWidth, _screenHeight);

    _ctx.restore();

    // Step 5: Scanlines
    _ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < _screenHeight; y += 4) {
        _ctx.fillRect(0, y, _screenWidth, 1);
    }

    // Step 6: Noise/grain
    _ctx.fillStyle = 'rgba(0, 255, 0, 0.02)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * _screenWidth;
        const y = Math.random() * _screenHeight;
        _ctx.fillRect(x, y, 2, 2);
    }

    // Step 7: Vignette
    const gradient = _ctx.createRadialGradient(
        _screenWidth / 2, _screenHeight / 2, _screenHeight * 0.4,
        _screenWidth / 2, _screenHeight / 2, _screenHeight * 0.9
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    _ctx.fillStyle = gradient;
    _ctx.fillRect(0, 0, _screenWidth, _screenHeight);

    // Step 8: Edge glow
    _ctx.strokeStyle = 'rgba(0, 255, 0, 0.12)';
    _ctx.lineWidth = 3;
    _ctx.strokeRect(2, 2, _screenWidth - 4, _screenHeight - 4);
}
