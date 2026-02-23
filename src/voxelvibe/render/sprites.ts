/**
 * VoxelVibe Engine - Sprite Renderer
 * Billboard sprite drawing functions for all entity types.
 * Uses Canvas 2D API layered on top of the voxelspace terrain layer.
 */

import { CONFIG } from '../core/constants';

export { CONFIG };

/** Canvas 2D context - set via init() */
let _ctx: CanvasRenderingContext2D;

/** Camera angle for heading-relative sprite orientation */
let _cameraAngle: number = 0;

/**
 * Initialize the sprite renderer.
 * Call once when the canvas is ready, and setCameraAngle() each frame.
 */
export function init(ctx: CanvasRenderingContext2D): void {
    _ctx = ctx;
}

/**
 * Update the camera angle used for heading-relative sprite orientation.
 * Call this once per frame before rendering targets.
 */
export function setCameraAngle(angle: number): void {
    _cameraAngle = angle;
}


const SHADOW_SUN_ANGLE = Math.PI * 0.35;

function normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

export function drawAircraftShadow(screenX, groundScreenY, size, alpha, camAngle = 0) {
    if (alpha <= 0 || size <= 0) return;
    const sunAngle = SHADOW_SUN_ANGLE - camAngle;
    const offsetX = Math.cos(sunAngle) * size * 0.6;
    const offsetY = Math.sin(sunAngle) * size * 0.35;
    _ctx.save();
    _ctx.globalAlpha = alpha;
    _ctx.fillStyle = '#000';
    _ctx.beginPath();
    _ctx.ellipse(screenX + offsetX, groundScreenY + offsetY, size * 0.9, size * 0.35, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
}



export function normalizeHexColor(color) {
    if (!color) return '000000';
    let hex = color.replace('#', '').trim();
    if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
    }
    return hex.padEnd(6, '0').slice(0, 6);
}

export function hexToRgb(color) {
    const hex = normalizeHexColor(color);
    return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
    };
}

export function rgbToHex(color) {
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

// Blend two hex colors by factor (0 = color1, 1 = color2)
export function blendColors(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1,3), 16);
    const g1 = parseInt(color1.slice(3,5), 16);
    const b1 = parseInt(color1.slice(5,7), 16);
    const r2 = parseInt(color2.slice(1,3), 16);
    const g2 = parseInt(color2.slice(3,5), 16);
    const b2 = parseInt(color2.slice(5,7), 16);
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Get damage-adjusted color for buildings (darken based on damage)
export function getDamagedBuildingColor(baseColor, healthPercent) {
    if (healthPercent >= 1.0) return baseColor;
    const damageFactor = 1 - healthPercent;  // 0 = full health, 1 = almost dead
    // Blend toward dark gray, max 60% darkening
    return blendColors(baseColor, '#2a2a2a', damageFactor * 0.6);
}

export function rgbToCss(color) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function applyAmbientToHex(color, ambient) {
    const base = hexToRgb(color);
    return {
        r: Math.floor(base.r * ambient),
        g: Math.floor(base.g * ambient),
        b: Math.floor(base.b * ambient)
    };
}

export function blendColorWithFog(color, factor, skyColor) {
    const skyR = skyColor & 0xFF;
    const skyG = (skyColor >> 8) & 0xFF;
    const skyB = (skyColor >> 16) & 0xFF;
    return {
        r: Math.floor(color.r + (skyR - color.r) * factor),
        g: Math.floor(color.g + (skyG - color.g) * factor),
        b: Math.floor(color.b + (skyB - color.b) * factor)
    };
}

export function getSpriteColor(
    baseColor: string,
    distance: number,
    weather: { ambient: number; fogStart: number; fogDensity?: number; skyColor: number },
    camDistance: number,
    fogEnabled: boolean
): string {
    let color = applyAmbientToHex(baseColor, weather.ambient);
    const fogStart = weather.fogStart;
    const fogEnd = Math.min(camDistance, fogStart + (camDistance - fogStart) / (weather.fogDensity || 2));
    const fogFactor = fogEnabled ? Math.min(1, Math.max(0, (distance - fogStart) / (fogEnd - fogStart))) : 0;
    if (fogFactor > 0) {
        color = blendColorWithFog(color, fogFactor, weather.skyColor);
    }
    return rgbToCss(color);
}

export function getSpriteColorWithFog(baseColor, fogFactor, ambient, skyColor) {
    let color = applyAmbientToHex(baseColor, ambient);
    if (fogFactor > 0) {
        color = blendColorWithFog(color, fogFactor, skyColor);
    }
    return rgbToCss(color);
}

export function drawSoldier(x, y, size, color, pose = 'stand', fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 8);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // Proportions - military figure with gear detail
    const headW = Math.max(2, Math.floor(s * 0.18));
    const headH = Math.max(2, Math.floor(s * 0.16));
    const helmetH = Math.max(1, Math.floor(s * 0.06));
    const torsoW = Math.max(3, Math.floor(s * 0.26));
    const torsoH = Math.max(4, Math.floor(s * 0.32));
    const legW = Math.max(2, Math.floor(s * 0.1));
    const legH = Math.max(3, Math.floor(s * 0.28));
    const armW = Math.max(1, Math.floor(s * 0.08));
    const armH = Math.max(2, Math.floor(s * 0.22));
    const bootH = Math.max(1, Math.floor(s * 0.06));
    const packW = Math.max(2, Math.floor(s * 0.14));
    const packH = Math.max(2, Math.floor(s * 0.18));
    const helmetRadius = Math.max(2, Math.floor(headW * 0.65));
    const vestH = Math.max(2, Math.floor(torsoH * 0.45));
    const kneeH = Math.max(1, Math.floor(legH * 0.18));
    const bootToeH = Math.max(1, Math.floor(bootH * 0.5));

    // Colors with proper shading
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const skin = getSpriteColorWithFog('#8a6a5a', fogFactor, ambient, skyColor);
    const gear = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const gearDark = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
    const boot = getSpriteColorWithFog('#3a3020', fogFactor, ambient, skyColor);

    // Adjust positions based on pose
    const isCrouch = pose === 'crouch';
    const isShoot = pose === 'shoot';
    const crouchOffset = isCrouch ? Math.floor(s * 0.12) : 0;
    const legSpread = isCrouch ? Math.floor(s * 0.04) : Math.floor(s * 0.02);

    // Y positions (bottom-up construction)
    const bootY = iy - bootH + crouchOffset;
    const legY = bootY - legH + (isCrouch ? Math.floor(legH * 0.3) : 0);
    const torsoY = legY - torsoH + Math.floor(s * 0.04);
    const headY = torsoY - headH - helmetH + Math.floor(s * 0.02);
    const armY = torsoY + Math.floor(s * 0.02);
    const kneeY = legY + Math.floor(legH * 0.55);
    const vestY = torsoY + Math.floor(torsoH * 0.2);

    // Boots
    _ctx.fillStyle = boot;
    _ctx.fillRect(ix - legW - legSpread, bootY, legW + 1, bootH);
    _ctx.fillRect(ix + legSpread - 1, bootY, legW + 1, bootH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - legW - legSpread, bootY + bootH - bootToeH, legW + 1, bootToeH);
    _ctx.fillRect(ix + legSpread - 1, bootY + bootH - bootToeH, legW + 1, bootToeH);

    // Legs
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - legW - legSpread, legY, legW, legH);
    _ctx.fillRect(ix + legSpread, legY, legW, legH);
    // Leg highlight
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - legW - legSpread, legY, Math.max(1, Math.floor(legW * 0.4)), legH);

    // Knee pads
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - legW - legSpread, kneeY, legW, kneeH);
    _ctx.fillRect(ix + legSpread, kneeY, legW, kneeH);

    // Torso
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(torsoW / 2), torsoY, torsoW, torsoH);
    // Torso shadow (left side)
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2), torsoY, Math.max(1, Math.floor(torsoW * 0.25)), torsoH);
    // Torso highlight (right side)
    _ctx.fillStyle = highlight;
    _ctx.fillRect(ix + Math.floor(torsoW / 2) - 1, torsoY, 1, torsoH);

    // Tactical vest/plate carrier
    _ctx.fillStyle = gear;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) + 1, vestY, torsoW - 2, vestH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) + 1, vestY + Math.floor(vestH * 0.5), torsoW - 2, Math.max(1, Math.floor(vestH * 0.2)));
    _ctx.fillRect(ix - 1, vestY, 2, vestH);

    // Backpack/gear
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - packW + 1, torsoY + Math.floor(s * 0.04), packW, packH);
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - packW + 1, torsoY + Math.floor(s * 0.04), Math.max(1, Math.floor(packW * 0.3)), packH);

    // Arms
    const armOffsetY = isShoot ? -Math.floor(s * 0.06) : 0;
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - Math.floor(torsoW / 2) - armW, armY + armOffsetY, armW, armH);
    _ctx.fillRect(ix + Math.floor(torsoW / 2), armY + armOffsetY, armW, armH);

    // Helmet dome
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(ix, headY + helmetH, helmetRadius, Math.PI, 0);
    _ctx.lineTo(ix + helmetRadius, headY + helmetH + Math.floor(helmetH * 0.8));
    _ctx.lineTo(ix - helmetRadius, headY + helmetH + Math.floor(helmetH * 0.8));
    _ctx.closePath();
    _ctx.fill();
    // Helmet rim
    _ctx.fillStyle = gearDark;
    _ctx.fillRect(ix - Math.floor(headW / 2) - 1, headY + helmetH, headW + 2, Math.max(1, Math.floor(helmetH * 0.6)));

    // Head/face
    _ctx.fillStyle = skin;
    _ctx.fillRect(ix - Math.floor(headW / 2), headY + helmetH, headW, headH);

    // Weapon (rifle shape)
    const weaponLen = Math.max(3, Math.floor(s * 0.4));
    const weaponH = Math.max(1, Math.floor(s * 0.05));
    const stockLen = Math.max(2, Math.floor(s * 0.12));
    const magH = Math.max(1, Math.floor(s * 0.08));

    if (isShoot) {
        // Weapon raised, pointing forward
        const weaponX = ix + Math.floor(torsoW / 2) + armW - 1;
        const weaponY = armY + armOffsetY + Math.floor(armH * 0.3);
        _ctx.fillStyle = gear;
        _ctx.fillRect(weaponX, weaponY, weaponLen, weaponH);
        // Stock
        _ctx.fillStyle = gearDark;
        _ctx.fillRect(weaponX - stockLen, weaponY - 1, stockLen, weaponH + 2);
        // Magazine
        _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.3), weaponY + weaponH, Math.max(1, Math.floor(s * 0.04)), magH);
        // Muzzle
        _ctx.fillRect(weaponX + weaponLen, weaponY - 1, Math.max(1, Math.floor(s * 0.03)), weaponH + 2);
    } else {
        // Weapon at rest, angled down
        const weaponX = ix + Math.floor(torsoW / 2);
        const weaponY = armY + Math.floor(armH * 0.5);
        _ctx.fillStyle = gear;
        _ctx.fillRect(weaponX, weaponY, Math.floor(weaponLen * 0.7), weaponH);
        _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.2), weaponY + weaponH, weaponH, Math.floor(weaponLen * 0.4));
        // Stock
        _ctx.fillStyle = gearDark;
        _ctx.fillRect(weaponX - Math.floor(stockLen * 0.5), weaponY - 1, Math.floor(stockLen * 0.6), weaponH + 2);
        // Magazine
        _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.3), weaponY + weaponH, Math.max(1, Math.floor(s * 0.04)), magH);
        // Muzzle
        _ctx.fillRect(weaponX + Math.floor(weaponLen * 0.7), weaponY - 1, Math.max(1, Math.floor(s * 0.03)), weaponH + 2);
    }
}

export function drawHelicopter(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // Colors - military stealth helicopter palette
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const belly = getSpriteColorWithFog(darkenColor(color, 55), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog('#1a4a5a', fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog('#3a7a9a', fogFactor, ambient, skyColor);
    const rotor = getSpriteColorWithFog('#3a3a3a', fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const weapon = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const weaponDark = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Determine view type
    const showFront = sinRel > 0.7;   // ~45° to ~135° - nose toward camera
    const showBack = sinRel < -0.7;   // ~225° to ~315° - tail toward camera
    const showSide = !showFront && !showBack;  // Side profile
    const facingRight = cosRel >= 0;  // For side view mirroring
    const dir = facingRight ? 1 : -1;

    // EVE support unit render pass (override)
    {
        if (showFront) {
            _ctx.save();
            _ctx.translate(ix, iy);

            const fuseW = s * 0.3;
            const fuseH = s * 0.6;
            const shoulderW = s * 0.42;
            const wingSpan = s * 0.85;
            const rotorRadX = s * 0.8;
            const rotorRadY = s * 0.2;

            const rotorTime = performance.now() / 42;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.22;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 0.95, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.65;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.05));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.95 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;

            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.035, -fuseH * 0.78, s * 0.07, s * 0.2);
            _ctx.fillStyle = getSpriteColorWithFog('#2a3a3a', fogFactor, ambient, skyColor);
            _ctx.beginPath();
            _ctx.arc(0, -fuseH * 1.03, s * 0.1, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(-shoulderW * 0.7, -fuseH * 0.55);
            _ctx.lineTo(shoulderW * 0.7, -fuseH * 0.55);
            _ctx.lineTo(fuseW * 1.1, -fuseH * 0.05);
            _ctx.lineTo(fuseW * 0.9, fuseH * 0.52);
            _ctx.lineTo(-fuseW * 0.9, fuseH * 0.52);
            _ctx.lineTo(-fuseW * 1.1, -fuseH * 0.05);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = belly;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.7, fuseH * 0.05);
            _ctx.lineTo(fuseW * 0.7, fuseH * 0.05);
            _ctx.lineTo(fuseW * 0.55, fuseH * 0.55);
            _ctx.lineTo(-fuseW * 0.55, fuseH * 0.55);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = glass;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.4, -fuseH * 0.35);
            _ctx.lineTo(fuseW * 0.4, -fuseH * 0.35);
            _ctx.lineTo(fuseW * 0.32, fuseH * 0.05);
            _ctx.lineTo(-fuseW * 0.32, fuseH * 0.05);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = glassHighlight;
            _ctx.fillRect(-fuseW * 0.28, -fuseH * 0.28, fuseW * 0.2, s * 0.08);
            _ctx.fillRect(fuseW * 0.08, -fuseH * 0.28, fuseW * 0.2, s * 0.08);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-wingSpan * 0.45, -fuseH * 0.02, wingSpan * 0.3, s * 0.08);
            _ctx.fillRect(fuseW + s * 0.02, -fuseH * 0.02, wingSpan * 0.3, s * 0.08);

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.52, s * 0.08, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = exhaust;
            _ctx.fillRect(-s * 0.02, fuseH * 0.52, s * 0.04, s * 0.12);

            const wheelR = Math.max(1, Math.floor(s * 0.06));
            _ctx.fillStyle = darker;
            _ctx.fillRect(-fuseW - s * 0.05, fuseH * 0.3, s * 0.05, s * 0.18);
            _ctx.fillRect(fuseW, fuseH * 0.3, s * 0.05, s * 0.18);
            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.arc(-fuseW - s * 0.06, fuseH * 0.52, wheelR, 0, Math.PI * 2);
            _ctx.arc(fuseW + s * 0.03, fuseH * 0.52, wheelR, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.restore();
            return;
        }

        if (showBack) {
            _ctx.save();
            _ctx.translate(ix, iy);

            const fuseW = s * 0.3;
            const fuseH = s * 0.6;
            const wingSpan = s * 0.85;
            const rotorRadX = s * 0.8;
            const rotorRadY = s * 0.2;

            const rotorTime = performance.now() / 42;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.22;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 0.95, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.65;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.05));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.95 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;

            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.035, -fuseH * 0.78, s * 0.07, s * 0.2);

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.95, -fuseH * 0.55);
            _ctx.lineTo(fuseW * 0.95, -fuseH * 0.55);
            _ctx.lineTo(fuseW * 0.85, fuseH * 0.52);
            _ctx.lineTo(-fuseW * 0.85, fuseH * 0.52);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = belly;
            _ctx.fillRect(-fuseW * 0.65, fuseH * 0.05, fuseW * 1.3, fuseH * 0.45);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-wingSpan * 0.45, -fuseH * 0.02, wingSpan * 0.3, s * 0.08);
            _ctx.fillRect(fuseW + s * 0.02, -fuseH * 0.02, wingSpan * 0.3, s * 0.08);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-s * 0.05, fuseH * 0.35, s * 0.1, s * 0.35);
            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(0, fuseH * 0.5);
            _ctx.lineTo(-s * 0.14, fuseH * 0.88);
            _ctx.lineTo(s * 0.14, fuseH * 0.88);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = dark;
            _ctx.fillRect(-s * 0.32, fuseH * 0.7, s * 0.64, s * 0.06);

            const fenRadBack = s * 0.15;
            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.74, fenRadBack * 1.18, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.74, fenRadBack * 0.82, 0, Math.PI * 2);
            _ctx.fill();
            const fenTimeBack = performance.now() / 18;
            _ctx.strokeStyle = rotor;
            _ctx.lineWidth = Math.max(1, s * 0.015);
            for (let i = 0; i < 8; i++) {
                const fAngle = fenTimeBack + i * (Math.PI / 4);
                _ctx.beginPath();
                _ctx.moveTo(0, fuseH * 0.74);
                _ctx.lineTo(
                    Math.cos(fAngle) * fenRadBack * 0.7,
                    fuseH * 0.74 + Math.sin(fAngle) * fenRadBack * 0.7
                );
                _ctx.stroke();
            }
            _ctx.lineWidth = 1;
            _ctx.fillStyle = exhaust;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.74, fenRadBack * 0.18, 0, Math.PI * 2);
            _ctx.fill();

            const wheelR = Math.max(1, Math.floor(s * 0.06));
            _ctx.fillStyle = darker;
            _ctx.fillRect(-fuseW - s * 0.08, fuseH * 0.12, s * 0.06, s * 0.35);
            _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.12, s * 0.06, s * 0.35);
            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.arc(-fuseW - s * 0.06, fuseH * 0.52, wheelR, 0, Math.PI * 2);
            _ctx.arc(fuseW + s * 0.05, fuseH * 0.52, wheelR, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.restore();
            return;
        }

        if (showSide) {
            _ctx.save();
            _ctx.translate(ix, iy);
            _ctx.scale(dir, 1);

            const fuseLen = s * 1.7;
            const fuseH = s * 0.24;
            const tailLen = s * 1.05;
            const tailH = s * 0.08;
            const tailRise = s * 0.1;
            const finH = s * 0.3;
            const skidStrut = Math.max(1, Math.floor(s * 0.03));

            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.35, -tailH * 0.4 - tailRise);
            _ctx.lineTo(-fuseLen * 0.35 - tailLen, -tailH * 0.2 - tailRise);
            _ctx.lineTo(-fuseLen * 0.35 - tailLen, tailH * 0.3 - tailRise);
            _ctx.lineTo(-fuseLen * 0.35, tailH * 0.5 - tailRise);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.35 - tailLen + s * 0.1, -tailH * 0.2 - tailRise);
            _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.02, -finH - tailRise);
            _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.12, -finH - tailRise);
            _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.04, -tailH * 0.2 - tailRise);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = dark;
            _ctx.fillRect(-fuseLen * 0.35 - tailLen - s * 0.04, -tailRise, s * 0.26, s * 0.05);

            const fenestronRadius = s * 0.16;
            const fenestronX = -fuseLen * 0.35 - tailLen - s * 0.02;
            const fenestronY = -finH + s * 0.12 - tailRise;
            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.arc(fenestronX, fenestronY, fenestronRadius * 1.22, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.85, 0, Math.PI * 2);
            _ctx.fill();
            const fenTime = performance.now() / 18;
            _ctx.strokeStyle = rotor;
            _ctx.lineWidth = Math.max(1, s * 0.02);
            for (let i = 0; i < 8; i++) {
                const fAngle = fenTime + i * (Math.PI / 4);
                _ctx.beginPath();
                _ctx.moveTo(fenestronX, fenestronY);
                _ctx.lineTo(
                    fenestronX + Math.cos(fAngle) * fenestronRadius * 0.75,
                    fenestronY + Math.sin(fAngle) * fenestronRadius * 0.75
                );
                _ctx.stroke();
            }
            _ctx.lineWidth = 1;
            _ctx.fillStyle = exhaust;
            _ctx.beginPath();
            _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.22, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.45, -fuseH * 0.2);
            _ctx.lineTo(fuseLen * 0.55, 0);
            _ctx.lineTo(fuseLen * 0.45, fuseH * 0.35);
            _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5);
            _ctx.lineTo(-fuseLen * 0.35, -fuseH * 0.4);
            _ctx.lineTo(fuseLen * 0.2, -fuseH * 0.55);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = belly;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.35, fuseH * 0.15);
            _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5);
            _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.28);
            _ctx.lineTo(fuseLen * 0.3, fuseH * 0.1);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = highlight;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.35, -fuseH * 0.25);
            _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.55);
            _ctx.lineTo(-fuseLen * 0.2, -fuseH * 0.42);
            _ctx.lineTo(-fuseLen * 0.05, -fuseH * 0.22);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = glass;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.38, -fuseH * 0.18);
            _ctx.lineTo(fuseLen * 0.48, fuseH * 0.02);
            _ctx.lineTo(fuseLen * 0.34, fuseH * 0.24);
            _ctx.lineTo(fuseLen * 0.1, fuseH * 0.2);
            _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.22);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = glassHighlight;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.36, -fuseH * 0.12);
            _ctx.lineTo(fuseLen * 0.42, fuseH * 0.02);
            _ctx.lineTo(fuseLen * 0.28, fuseH * 0.06);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = getSpriteColorWithFog('#2a3a3a', fogFactor, ambient, skyColor);
            _ctx.beginPath();
            _ctx.arc(0, -fuseH * 0.95, s * 0.07, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.05, -fuseH * 0.05);
            _ctx.lineTo(fuseLen * 0.05 - s * 0.45, -fuseH * 0.18);
            _ctx.lineTo(fuseLen * 0.05 - s * 0.45, fuseH * 0.02);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = darker;
            _ctx.fillRect(fuseLen * 0.05 - s * 0.4, fuseH * 0.04, s * 0.18, s * 0.08);

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.arc(fuseLen * 0.35, fuseH * 0.35, s * 0.08, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = exhaust;
            _ctx.fillRect(fuseLen * 0.35, fuseH * 0.32, s * 0.16, s * 0.04);

            const wheelR = Math.max(1, Math.floor(s * 0.06));
            _ctx.fillStyle = darker;
            _ctx.fillRect(fuseLen * 0.15, fuseH * 0.42, skidStrut, s * 0.16);
            _ctx.fillRect(-fuseLen * 0.12, fuseH * 0.42, skidStrut, s * 0.16);
            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.arc(fuseLen * 0.2, fuseH * 0.6, wheelR, 0, Math.PI * 2);
            _ctx.arc(-fuseLen * 0.08, fuseH * 0.6, wheelR, 0, Math.PI * 2);
            _ctx.fill();

            const rotorTime = performance.now() / 42;
            const rotorRadX = fuseLen * 0.75;
            const rotorRadY = fuseLen * 0.22;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.25;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 0.72, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.7;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.06));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.72 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;
            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.04, -fuseH * 0.84, s * 0.08, s * 0.14);
            _ctx.fillStyle = exhaust;
            _ctx.beginPath();
            _ctx.arc(0, -fuseH * 0.86, s * 0.05, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.restore();
            return;
        }
    }

    // RHINO Tank Unit render pass (override)
    {
        if (showFront) {
            _ctx.save();
            _ctx.translate(ix, iy);

            const fuseW = s * 0.5;
            const fuseH = s * 0.45;
            const rotorRadX = s * 0.9;
            const rotorRadY = s * 0.3;

            const rotorTime = performance.now() / 36;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.25;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 1.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.7;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.08));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 1.9 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;

            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.06, -fuseH * 1.7, s * 0.12, s * 0.35);

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 1.1, -fuseH * 0.2);
            _ctx.lineTo(-fuseW * 0.8, -fuseH * 1.05);
            _ctx.lineTo(fuseW * 0.8, -fuseH * 1.05);
            _ctx.lineTo(fuseW * 1.1, -fuseH * 0.2);
            _ctx.lineTo(fuseW * 0.9, fuseH * 0.55);
            _ctx.lineTo(-fuseW * 0.9, fuseH * 0.55);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.25, -fuseH * 0.1);
            _ctx.lineTo(0, fuseH * 0.1);
            _ctx.lineTo(fuseW * 0.25, -fuseH * 0.1);
            _ctx.lineTo(0, -fuseH * 0.3);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = glass;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.22, -fuseH * 0.55);
            _ctx.lineTo(fuseW * 0.22, -fuseH * 0.55);
            _ctx.lineTo(fuseW * 0.18, -fuseH * 0.25);
            _ctx.lineTo(-fuseW * 0.18, -fuseH * 0.25);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = glassHighlight;
            _ctx.fillRect(-fuseW * 0.14, -fuseH * 0.5, fuseW * 0.12, s * 0.08);

            _ctx.fillStyle = weapon;
            _ctx.fillRect(-fuseW - s * 0.08, -fuseH * 0.8, s * 0.12, s * 0.3);
            _ctx.fillRect(fuseW - s * 0.04, -fuseH * 0.8, s * 0.12, s * 0.3);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-fuseW - s * 0.45, -fuseH * 0.18, s * 0.45, s * 0.12);
            _ctx.fillRect(fuseW, -fuseH * 0.18, s * 0.45, s * 0.12);

            _ctx.fillStyle = weaponDark;
            _ctx.fillRect(-fuseW - s * 0.4, -fuseH * 0.38, s * 0.18, s * 0.28);
            _ctx.fillRect(fuseW + s * 0.22, -fuseH * 0.38, s * 0.18, s * 0.28);

            _ctx.fillStyle = weapon;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.58, s * 0.16, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = weaponDark;
            _ctx.fillRect(-s * 0.05, fuseH * 0.7, s * 0.04, s * 0.12);
            _ctx.fillRect(s * 0.01, fuseH * 0.7, s * 0.04, s * 0.12);

            _ctx.fillStyle = darker;
            _ctx.fillRect(-fuseW - s * 0.12, fuseH * 0.25, s * 0.1, s * 0.5);
            _ctx.fillRect(-fuseW - s * 0.18, fuseH * 0.7, s * 0.24, s * 0.06);
            _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.25, s * 0.1, s * 0.5);
            _ctx.fillRect(fuseW - s * 0.06, fuseH * 0.7, s * 0.24, s * 0.06);

            _ctx.restore();
            return;
        }

        if (showBack) {
            _ctx.save();
            _ctx.translate(ix, iy);

            const fuseW = s * 0.5;
            const fuseH = s * 0.45;
            const rotorRadX = s * 0.9;
            const rotorRadY = s * 0.3;

            const rotorTime = performance.now() / 36;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.25;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 1.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.7;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.08));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 1.9 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;

            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.06, -fuseH * 1.7, s * 0.12, s * 0.35);

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(-fuseW * 0.95, -fuseH * 0.3);
            _ctx.lineTo(-fuseW * 0.7, -fuseH);
            _ctx.lineTo(fuseW * 0.7, -fuseH);
            _ctx.lineTo(fuseW * 0.95, -fuseH * 0.3);
            _ctx.lineTo(fuseW * 0.85, fuseH * 0.45);
            _ctx.lineTo(-fuseW * 0.85, fuseH * 0.45);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = weaponDark;
            _ctx.fillRect(-fuseW * 0.55, -fuseH * 0.55, s * 0.18, s * 0.12);
            _ctx.fillRect(fuseW * 0.37, -fuseH * 0.55, s * 0.18, s * 0.12);
            _ctx.fillStyle = getSpriteColorWithFog('#4a3a2f', fogFactor, ambient, skyColor);
            _ctx.fillRect(-fuseW * 0.5, -fuseH * 0.52, s * 0.08, s * 0.06);
            _ctx.fillRect(fuseW * 0.42, -fuseH * 0.52, s * 0.08, s * 0.06);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-fuseW - s * 0.4, -fuseH * 0.15, s * 0.4, s * 0.1);
            _ctx.fillRect(fuseW, -fuseH * 0.15, s * 0.4, s * 0.1);

            _ctx.fillStyle = dark;
            _ctx.fillRect(-s * 0.08, fuseH * 0.2, s * 0.16, s * 0.6);
            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(0, fuseH * 0.5);
            _ctx.lineTo(-s * 0.17, fuseH * 0.95);
            _ctx.lineTo(s * 0.17, fuseH * 0.95);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = dark;
            _ctx.fillRect(-s * 0.38, fuseH * 0.7, s * 0.76, s * 0.08);

            const fenRadBack = s * 0.16;
            _ctx.fillStyle = weapon;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.73, fenRadBack * 1.25, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.73, fenRadBack * 0.85, 0, Math.PI * 2);
            _ctx.fill();
            const fenTimeBack = performance.now() / 14;
            _ctx.strokeStyle = rotor;
            _ctx.lineWidth = Math.max(1, s * 0.02);
            for (let i = 0; i < 8; i++) {
                const fAngle = fenTimeBack + i * (Math.PI / 4);
                _ctx.beginPath();
                _ctx.moveTo(0, fuseH * 0.73);
                _ctx.lineTo(
                    Math.cos(fAngle) * fenRadBack * 0.72,
                    fuseH * 0.73 + Math.sin(fAngle) * fenRadBack * 0.72
                );
                _ctx.stroke();
            }
            _ctx.lineWidth = 1;
            _ctx.fillStyle = weaponDark;
            _ctx.beginPath();
            _ctx.arc(0, fuseH * 0.73, fenRadBack * 0.2, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.fillStyle = darker;
            _ctx.fillRect(-fuseW - s * 0.12, fuseH * 0.12, s * 0.1, s * 0.45);
            _ctx.fillRect(-fuseW - s * 0.2, fuseH * 0.52, s * 0.26, s * 0.07);
            _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.12, s * 0.1, s * 0.45);
            _ctx.fillRect(fuseW - s * 0.06, fuseH * 0.52, s * 0.26, s * 0.07);

            _ctx.restore();
            return;
        }

        if (showSide) {
            _ctx.save();
            _ctx.translate(ix, iy);
            _ctx.scale(dir, 1);

            const fuseLen = s * 1.6;
            const fuseH = s * 0.35;
            const tailLen = s * 1.05;
            const tailH = s * 0.12;
            const finH = s * 0.32;
            const wingSpan = s * 0.6;
            const skidH = Math.max(1, Math.floor(s * 0.05));

            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.32, -tailH * 0.7);
            _ctx.lineTo(-fuseLen * 0.32 - tailLen, -tailH * 0.35);
            _ctx.lineTo(-fuseLen * 0.32 - tailLen, tailH * 0.35);
            _ctx.lineTo(-fuseLen * 0.32, tailH * 0.7);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.32 - tailLen + s * 0.12, -tailH * 0.35);
            _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.02, -finH);
            _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.16, -finH);
            _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.06, -tailH * 0.35);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = dark;
            _ctx.fillRect(-fuseLen * 0.32 - tailLen - s * 0.08, -s * 0.04, s * 0.3, s * 0.08);

            const enemyFenRadius = s * 0.16;
            const enemyFenX = -fuseLen * 0.32 - tailLen - s * 0.02;
            const enemyFenY = -finH + s * 0.12;
            _ctx.fillStyle = weaponDark;
            _ctx.beginPath();
            _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 1.25, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.85, 0, Math.PI * 2);
            _ctx.fill();
            const enemyFenTime = performance.now() / 14;
            _ctx.strokeStyle = rotor;
            _ctx.lineWidth = Math.max(1, s * 0.025);
            for (let i = 0; i < 8; i++) {
                const fAngle = enemyFenTime + i * (Math.PI / 4);
                _ctx.beginPath();
                _ctx.moveTo(enemyFenX, enemyFenY);
                _ctx.lineTo(
                    enemyFenX + Math.cos(fAngle) * enemyFenRadius * 0.75,
                    enemyFenY + Math.sin(fAngle) * enemyFenRadius * 0.75
                );
                _ctx.stroke();
            }
            _ctx.lineWidth = 1;
            _ctx.fillStyle = weaponDark;
            _ctx.beginPath();
            _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.22, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.48, -fuseH * 0.08);
            _ctx.lineTo(fuseLen * 0.58, fuseH * 0.22);
            _ctx.lineTo(fuseLen * 0.46, fuseH * 0.55);
            _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.6);
            _ctx.lineTo(-fuseLen * 0.35, -fuseH * 0.42);
            _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.6);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = highlight;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.1, -fuseH * 0.25);
            _ctx.lineTo(fuseLen * 0.32, -fuseH * 0.25);
            _ctx.lineTo(fuseLen * 0.26, -fuseH * 0.45);
            _ctx.lineTo(fuseLen * 0.06, -fuseH * 0.45);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = dark;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.4, fuseH * 0.4);
            _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.6);
            _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.35);
            _ctx.lineTo(fuseLen * 0.34, fuseH * 0.25);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = darker;
            _ctx.fillRect(-fuseLen * 0.22, -fuseH * 0.7, s * 0.32, s * 0.14);
            _ctx.fillRect(-fuseLen * 0.3, -fuseH * 0.18, s * 0.14, s * 0.1);
            _ctx.fillRect(-fuseLen * 0.3, fuseH * 0.05, s * 0.14, s * 0.1);

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.05, -fuseH * 0.18);
            _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.28);
            _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.1);
            _ctx.closePath();
            _ctx.fill();
            _ctx.beginPath();
            _ctx.moveTo(-fuseLen * 0.05, fuseH * 0.22);
            _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.32);
            _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.14);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = weapon;
            _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, -fuseH * 0.35, s * 0.24, s * 0.14);
            _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, fuseH * 0.28, s * 0.26, s * 0.1);
            _ctx.fillStyle = weaponDark;
            _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.62, fuseH * 0.36, s * 0.14, s * 0.04);

            _ctx.fillStyle = glass;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.38, -fuseH * 0.1);
            _ctx.lineTo(fuseLen * 0.46, fuseH * 0.12);
            _ctx.lineTo(fuseLen * 0.32, fuseH * 0.32);
            _ctx.lineTo(fuseLen * 0.18, fuseH * 0.26);
            _ctx.lineTo(fuseLen * 0.16, -fuseH * 0.12);
            _ctx.closePath();
            _ctx.fill();
            _ctx.fillStyle = glassHighlight;
            _ctx.beginPath();
            _ctx.moveTo(fuseLen * 0.36, 0);
            _ctx.lineTo(fuseLen * 0.4, fuseH * 0.12);
            _ctx.lineTo(fuseLen * 0.3, fuseH * 0.16);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = weapon;
            _ctx.beginPath();
            _ctx.arc(fuseLen * 0.38, fuseH * 0.48, s * 0.12, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = weaponDark;
            _ctx.fillRect(fuseLen * 0.38, fuseH * 0.44, s * 0.24, s * 0.06);
            _ctx.fillRect(fuseLen * 0.6, fuseH * 0.42, s * 0.04, s * 0.1);

            _ctx.fillStyle = darker;
            _ctx.fillRect(fuseLen * 0.12, fuseH * 0.48, Math.max(1, s * 0.03), s * 0.2);
            _ctx.fillRect(-fuseLen * 0.18, fuseH * 0.48, Math.max(1, s * 0.03), s * 0.2);
            _ctx.fillRect(-fuseLen * 0.26, fuseH * 0.66, fuseLen * 0.5, skidH);

            const rotorTime = performance.now() / 36;
            const rotorRadX = fuseLen * 0.75;
            const rotorRadY = fuseLen * 0.24;
            _ctx.fillStyle = rotor;
            _ctx.globalAlpha = 0.25;
            _ctx.beginPath();
            _ctx.ellipse(0, -fuseH * 0.78, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.globalAlpha = 0.7;
            for (let i = 0; i < 4; i++) {
                const angle = rotorTime + i * (Math.PI / 2);
                const bx = Math.cos(angle) * rotorRadX;
                const by = Math.sin(angle) * rotorRadY;
                const bladeW = Math.max(2, Math.floor(s * 0.07));
                _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.78 + by - 1, bladeW, 2);
            }
            _ctx.globalAlpha = 1.0;
            _ctx.fillStyle = darker;
            _ctx.fillRect(-s * 0.05, -fuseH * 0.9, s * 0.1, s * 0.16);
            _ctx.fillStyle = weapon;
            _ctx.beginPath();
            _ctx.arc(0, -fuseH * 0.92, s * 0.06, 0, Math.PI * 2);
            _ctx.fill();

            _ctx.restore();
            return;
        }
    }

    // Strike plane render pass (override)
    {
        if (showFront) {
            const wingSpan = s * 1.15;
            const fuseH = s * 0.75;

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(ix, iy - fuseH * 0.55);
            _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.1);
            _ctx.lineTo(ix - wingSpan * 0.2, iy + fuseH * 0.5);
            _ctx.lineTo(ix + wingSpan * 0.2, iy + fuseH * 0.5);
            _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.1);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = highlight;
            _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);

            _ctx.fillStyle = dark;
            _ctx.fillRect(ix - wingSpan * 0.55, iy + fuseH * 0.05, s * 0.22, s * 0.1);
            _ctx.fillRect(ix + wingSpan * 0.33, iy + fuseH * 0.05, s * 0.22, s * 0.1);

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(ix - s * 0.2, iy + fuseH * 0.1);
            _ctx.lineTo(ix - s * 0.3, iy + fuseH * 0.45);
            _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.45);
            _ctx.closePath();
            _ctx.fill();
            _ctx.beginPath();
            _ctx.moveTo(ix + s * 0.2, iy + fuseH * 0.1);
            _ctx.lineTo(ix + s * 0.3, iy + fuseH * 0.45);
            _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.45);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = glass;
            _ctx.fillRect(ix - s * 0.08, iy - fuseH * 0.3, s * 0.16, s * 0.18);
            _ctx.fillStyle = glassHighlight;
            _ctx.fillRect(ix - s * 0.06, iy - fuseH * 0.26, s * 0.06, s * 0.08);
            return;
        }

        if (showBack) {
            const wingSpan = s * 1.15;
            const fuseH = s * 0.75;

            _ctx.fillStyle = body;
            _ctx.beginPath();
            _ctx.moveTo(ix, iy - fuseH * 0.55);
            _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.1);
            _ctx.lineTo(ix - wingSpan * 0.2, iy + fuseH * 0.5);
            _ctx.lineTo(ix + wingSpan * 0.2, iy + fuseH * 0.5);
            _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.1);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = dark;
            _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);

            _ctx.fillStyle = darker;
            _ctx.beginPath();
            _ctx.moveTo(ix, iy + fuseH * 0.15);
            _ctx.lineTo(ix - s * 0.12, iy + fuseH * 0.5);
            _ctx.lineTo(ix + s * 0.12, iy + fuseH * 0.5);
            _ctx.closePath();
            _ctx.fill();

            _ctx.fillStyle = exhaust;
            _ctx.beginPath();
            _ctx.arc(ix - s * 0.1, iy + fuseH * 0.38, s * 0.07, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.beginPath();
            _ctx.arc(ix + s * 0.1, iy + fuseH * 0.38, s * 0.07, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.fillStyle = exhaustGlow;
            _ctx.beginPath();
            _ctx.arc(ix - s * 0.1, iy + fuseH * 0.4, s * 0.04, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.beginPath();
            _ctx.arc(ix + s * 0.1, iy + fuseH * 0.4, s * 0.04, 0, Math.PI * 2);
            _ctx.fill();
            return;
        }

        _ctx.save();
        _ctx.translate(ix, iy);
        _ctx.scale(dir, 1);

        const fuseLen = s * 1.85;
        const fuseH = s * 0.22;

        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.55, 0);
        _ctx.lineTo(fuseLen * 0.35, -fuseH * 0.9);
        _ctx.lineTo(-fuseLen * 0.35, -fuseH * 0.7);
        _ctx.lineTo(-fuseLen * 0.52, 0);
        _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.7);
        _ctx.lineTo(fuseLen * 0.35, fuseH * 0.9);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseLen * 0.1, -s * 0.55, s * 0.6, s * 0.12);
        _ctx.fillRect(-fuseLen * 0.1, s * 0.43, s * 0.6, s * 0.12);

        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseLen * 0.4, -s * 0.35, s * 0.18, s * 0.16);
        _ctx.fillRect(-fuseLen * 0.4, s * 0.19, s * 0.18, s * 0.16);

        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen * 0.35, 0);
        _ctx.lineTo(-fuseLen * 0.52, -s * 0.42);
        _ctx.lineTo(-fuseLen * 0.52, 0);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.ellipse(fuseLen * 0.28, 0, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.ellipse(fuseLen * 0.3, -s * 0.02, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
        _ctx.fill();

        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseLen * 0.18, -s * 0.45, s * 0.18, s * 0.06);
        _ctx.fillRect(-fuseLen * 0.18, s * 0.39, s * 0.18, s * 0.06);

        _ctx.fillStyle = exhaustGlow;
        _ctx.globalAlpha = 0.6;
        _ctx.beginPath();
        _ctx.ellipse(-fuseLen * 0.54, 0, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 1.0;

        _ctx.restore();
        return;
    }

    if (showFront) {
        // FRONT VIEW - Apache-style attack helicopter facing camera
        // Narrow fuselage, tandem cockpit, stub wings with weapons
        _ctx.save();
        _ctx.translate(ix, iy);

        const fuseW = s * 0.28;  // Narrow fuselage (attack helicopters are slim)
        const fuseH = s * 0.55;  // Taller than wide from front
        const wingSpan = s * 0.9;  // Stub wings extend wide
        const rotorRadX = s * 0.75;
        const rotorRadY = s * 0.2;

        // Rotor disc (top-down perspective ellipse above)
        const rotorTime = performance.now() / 40;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.2;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH * 0.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
        _ctx.fill();
        
        // Rotor blades
        _ctx.globalAlpha = 0.6;
        for (let i = 0; i < 4; i++) {
            const angle = rotorTime + (i * Math.PI / 2);
            const bx = Math.cos(angle) * rotorRadX;
            const by = Math.sin(angle) * rotorRadY;
            const bladeW = Math.max(2, Math.floor(s * 0.05));
            _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1.0;

        // Rotor mast
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.03, -fuseH * 0.75, s * 0.06, s * 0.18);
        
        // Mast-mounted sensor dome (Comanche/EVE style)
        _ctx.fillStyle = getSpriteColorWithFog('#2a3a3a', fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(0, -fuseH * 1.0, s * 0.09, 0, Math.PI * 2);
        _ctx.fill();
        // Sensor lens
        _ctx.fillStyle = getSpriteColorWithFog('#1a2a2a', fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(0, -fuseH * 0.98, s * 0.045, Math.PI * 0.8, Math.PI * 2.2);
        _ctx.fill();

        // Engine housings (on top sides of fuselage - sleeker for Comanche style)
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseW - s * 0.12, -fuseH * 0.45, s * 0.14, s * 0.22);
        _ctx.fillRect(fuseW - s * 0.02, -fuseH * 0.45, s * 0.14, s * 0.22);

        // Main fuselage body (narrow, angular)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW, -fuseH * 0.5);  // Top left
        _ctx.lineTo(fuseW, -fuseH * 0.5);   // Top right
        _ctx.lineTo(fuseW * 1.1, fuseH * 0.1);  // Right side taper
        _ctx.lineTo(fuseW * 0.7, fuseH * 0.5);  // Bottom right
        _ctx.lineTo(-fuseW * 0.7, fuseH * 0.5); // Bottom left
        _ctx.lineTo(-fuseW * 1.1, fuseH * 0.1); // Left side taper
        _ctx.closePath();
        _ctx.fill();

        // Fuselage panel lines
        _ctx.strokeStyle = darker;
        _ctx.lineWidth = Math.max(1, Math.floor(s * 0.02));
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.7, -fuseH * 0.2);
        _ctx.lineTo(fuseW * 0.7, -fuseH * 0.25);
        _ctx.stroke();
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.6, fuseH * 0.2);
        _ctx.lineTo(fuseW * 0.6, fuseH * 0.18);
        _ctx.stroke();
        _ctx.lineWidth = 1;

        // Fuselage center line (angular detail)
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(0, -fuseH * 0.5);
        _ctx.lineTo(s * 0.03, fuseH * 0.3);
        _ctx.lineTo(-s * 0.03, fuseH * 0.3);
        _ctx.closePath();
        _ctx.fill();

        // Cockpit canopy (single elongated window - tandem seating)
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.5, -fuseH * 0.35);
        _ctx.lineTo(fuseW * 0.5, -fuseH * 0.35);
        _ctx.lineTo(fuseW * 0.4, fuseH * 0.15);
        _ctx.lineTo(-fuseW * 0.4, fuseH * 0.15);
        _ctx.closePath();
        _ctx.fill();

        // Canopy frame (horizontal divider for tandem seats)
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW * 0.45, -fuseH * 0.12, fuseW * 0.9, s * 0.02);

        // Glass highlight
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.35, -fuseH * 0.3);
        _ctx.lineTo(0, -fuseH * 0.3);
        _ctx.lineTo(-fuseW * 0.1, -fuseH * 0.15);
        _ctx.lineTo(-fuseW * 0.35, -fuseH * 0.15);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(fuseW * 0.1, -fuseH * 0.28);
        _ctx.lineTo(fuseW * 0.35, -fuseH * 0.2);
        _ctx.lineTo(fuseW * 0.2, -fuseH * 0.1);
        _ctx.closePath();
        _ctx.fill();

        // Stub wings with weapon pylons
        _ctx.fillStyle = dark;
        // Left wing
        _ctx.fillRect(-wingSpan * 0.5, -fuseH * 0.05, wingSpan * 0.35, s * 0.08);
        // Right wing
        _ctx.fillRect(fuseW + s * 0.02, -fuseH * 0.05, wingSpan * 0.35, s * 0.08);

        // Weapons on pylons (Hellfire missiles / rocket pods)
        _ctx.fillStyle = darker;
        // Left pylon weapons
        _ctx.fillRect(-wingSpan * 0.45, s * 0.02, s * 0.06, s * 0.15);
        _ctx.fillRect(-wingSpan * 0.32, s * 0.02, s * 0.06, s * 0.15);
        // Right pylon weapons
        _ctx.fillRect(wingSpan * 0.26, s * 0.02, s * 0.06, s * 0.15);
        _ctx.fillRect(wingSpan * 0.39, s * 0.02, s * 0.06, s * 0.15);

        // Chin turret (TADS/PNVS sensor + gun)
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-s * 0.08, fuseH * 0.35);
        _ctx.lineTo(s * 0.08, fuseH * 0.35);
        _ctx.lineTo(s * 0.05, fuseH * 0.55);
        _ctx.lineTo(-s * 0.05, fuseH * 0.55);
        _ctx.closePath();
        _ctx.fill();

        // Gun barrel (30mm chain gun)
        _ctx.fillStyle = exhaust;
        _ctx.fillRect(-s * 0.02, fuseH * 0.5, s * 0.04, s * 0.12);

        // Landing gear (wheels)
        const wheelR = Math.max(1, Math.floor(s * 0.06));
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.04, fuseH * 0.3, s * 0.04, s * 0.16);
        _ctx.fillRect(fuseW, fuseH * 0.3, s * 0.04, s * 0.16);
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(-fuseW - s * 0.05, fuseH * 0.52, wheelR, 0, Math.PI * 2);
        _ctx.arc(fuseW + s * 0.02, fuseH * 0.52, wheelR, 0, Math.PI * 2);
        _ctx.fill();

        _ctx.restore();
        return;
    }

    if (showBack) {
        // BACK VIEW - Apache-style, tail/exhausts facing camera
        _ctx.save();
        _ctx.translate(ix, iy);

        const fuseW = s * 0.28;  // Match front view proportions
        const fuseH = s * 0.55;
        const wingSpan = s * 0.9;
        const rotorRadX = s * 0.75;
        const rotorRadY = s * 0.2;

        // Rotor disc
        const rotorTime = performance.now() / 40;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.2;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH * 0.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
        _ctx.fill();
        
        // Rotor blades
        _ctx.globalAlpha = 0.6;
        for (let i = 0; i < 4; i++) {
            const angle = rotorTime + (i * Math.PI / 2);
            const bx = Math.cos(angle) * rotorRadX;
            const by = Math.sin(angle) * rotorRadY;
            const bladeW = Math.max(2, Math.floor(s * 0.05));
            _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1.0;

        // Rotor mast
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.03, -fuseH * 0.75, s * 0.06, s * 0.18);

        // Engine housings with exhausts
        _ctx.fillStyle = dark;
        _ctx.fillRect(-fuseW - s * 0.12, -fuseH * 0.45, s * 0.14, s * 0.22);
        _ctx.fillRect(fuseW - s * 0.02, -fuseH * 0.45, s * 0.14, s * 0.22);
        
        // Engine exhausts (rectangular, glowing)
        _ctx.fillStyle = exhaust;
        _ctx.fillRect(-fuseW - s * 0.1, -fuseH * 0.35, s * 0.1, s * 0.12);
        _ctx.fillRect(fuseW, -fuseH * 0.35, s * 0.1, s * 0.12);
        // Exhaust glow
        _ctx.fillStyle = getSpriteColorWithFog('#5a4a3a', fogFactor, ambient, skyColor);
        _ctx.fillRect(-fuseW - s * 0.08, -fuseH * 0.32, s * 0.06, s * 0.06);
        _ctx.fillRect(fuseW + s * 0.02, -fuseH * 0.32, s * 0.06, s * 0.06);

        // Main fuselage body (narrow, angular - rear view)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW, -fuseH * 0.5);
        _ctx.lineTo(fuseW, -fuseH * 0.5);
        _ctx.lineTo(fuseW * 1.1, fuseH * 0.1);
        _ctx.lineTo(fuseW * 0.7, fuseH * 0.5);
        _ctx.lineTo(-fuseW * 0.7, fuseH * 0.5);
        _ctx.lineTo(-fuseW * 1.1, fuseH * 0.1);
        _ctx.closePath();
        _ctx.fill();

        // Fuselage rear panel detail
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW * 0.6, -fuseH * 0.4, fuseW * 1.2, s * 0.04);
        _ctx.fillRect(-fuseW * 0.5, fuseH * 0.1, fuseW * 1.0, s * 0.03);

        // Stub wings (from behind)
        _ctx.fillStyle = dark;
        _ctx.fillRect(-wingSpan * 0.5, -fuseH * 0.05, wingSpan * 0.35, s * 0.08);
        _ctx.fillRect(fuseW + s * 0.02, -fuseH * 0.05, wingSpan * 0.35, s * 0.08);

        // Weapons on pylons (rear view)
        _ctx.fillStyle = darker;
        _ctx.fillRect(-wingSpan * 0.45, s * 0.02, s * 0.06, s * 0.15);
        _ctx.fillRect(-wingSpan * 0.32, s * 0.02, s * 0.06, s * 0.15);
        _ctx.fillRect(wingSpan * 0.26, s * 0.02, s * 0.06, s * 0.15);
        _ctx.fillRect(wingSpan * 0.39, s * 0.02, s * 0.06, s * 0.15);

        // Tail boom (foreshortened, going toward viewer)
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.05, fuseH * 0.35, s * 0.1, s * 0.35);

        // Tail fin (vertical stabilizer with fenestron)
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH * 0.5);
        _ctx.lineTo(-s * 0.12, fuseH * 0.85);
        _ctx.lineTo(s * 0.12, fuseH * 0.85);
        _ctx.closePath();
        _ctx.fill();
        
        // Horizontal stabilizer
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.28, fuseH * 0.68, s * 0.56, s * 0.05);

        // Fenestron (enclosed tail rotor) - seen from behind
        const fenRadBack = s * 0.12;
        // Shroud
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.72, fenRadBack * 1.15, 0, Math.PI * 2);
        _ctx.fill();
        // Inner disc
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.72, fenRadBack * 0.8, 0, Math.PI * 2);
        _ctx.fill();
        // Animated fan blades
        const fenTimeBack = performance.now() / 20;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.015);
        for (let i = 0; i < 8; i++) {
            const fAngle = fenTimeBack + (i * Math.PI / 4);
            _ctx.beginPath();
            _ctx.moveTo(0, fuseH * 0.72);
            _ctx.lineTo(
                Math.cos(fAngle) * fenRadBack * 0.7,
                fuseH * 0.72 + Math.sin(fAngle) * fenRadBack * 0.7
            );
            _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        // Center hub
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.72, fenRadBack * 0.18, 0, Math.PI * 2);
        _ctx.fill();

        // Landing gear (wheels)
        const wheelR = Math.max(1, Math.floor(s * 0.06));
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.08, fuseH * 0.12, s * 0.06, s * 0.35);
        _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.12, s * 0.06, s * 0.35);
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(-fuseW - s * 0.06, fuseH * 0.52, wheelR, 0, Math.PI * 2);
        _ctx.arc(fuseW + s * 0.05, fuseH * 0.52, wheelR, 0, Math.PI * 2);
        _ctx.fill();

        _ctx.restore();
        return;
    }

    // SIDE VIEW (existing code)
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);

    // Proportions - sleek Comanche/Apache-like profile
    const fuseLen = s * 1.5;
    const fuseH = s * 0.28;
    const noseLen = s * 0.35;
    const tailLen = s * 0.9;
    const tailH = s * 0.1;
    const finH = s * 0.22;
    const skidH = Math.max(1, Math.floor(s * 0.04));
    const skidStrut = Math.max(1, Math.floor(s * 0.03));

    // Tail boom (tapered)
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35, -tailH * 0.6);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen, -tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen, tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35, tailH * 0.6);
    _ctx.closePath();
    _ctx.fill();

    // Tail fin (vertical stabilizer)
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35 - tailLen + s * 0.08, -tailH * 0.3);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.04, -finH);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.12, -finH);
    _ctx.lineTo(-fuseLen * 0.35 - tailLen - s * 0.06, -tailH * 0.3);
    _ctx.closePath();
    _ctx.fill();

    // Horizontal stabilizer
    _ctx.fillStyle = dark;
    _ctx.fillRect(-fuseLen * 0.35 - tailLen - s * 0.02, -s * 0.02, s * 0.18, s * 0.04);

    // Fenestron (enclosed tail rotor) - Comanche/EVE style
    const fenestronRadius = s * 0.12;
    const fenestronX = -fuseLen * 0.35 - tailLen - s * 0.03;
    const fenestronY = -finH + s * 0.08;
    
    // Fenestron shroud (circular enclosure)
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 1.2, 0, Math.PI * 2);
    _ctx.fill();
    
    // Inner spinning fan
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.85, 0, Math.PI * 2);
    _ctx.fill();
    
    // Fan blade hints (animated)
    const fenTime = performance.now() / 20;
    _ctx.strokeStyle = rotor;
    _ctx.lineWidth = Math.max(1, s * 0.02);
    for (let i = 0; i < 8; i++) {
        const fAngle = fenTime + (i * Math.PI / 4);
        _ctx.beginPath();
        _ctx.moveTo(fenestronX, fenestronY);
        _ctx.lineTo(
            fenestronX + Math.cos(fAngle) * fenestronRadius * 0.75,
            fenestronY + Math.sin(fAngle) * fenestronRadius * 0.75
        );
        _ctx.stroke();
    }
    _ctx.lineWidth = 1;
    
    // Fenestron center hub
    _ctx.fillStyle = exhaust;
    _ctx.beginPath();
    _ctx.arc(fenestronX, fenestronY, fenestronRadius * 0.2, 0, Math.PI * 2);
    _ctx.fill();

    // Main fuselage (angular stealth shape)
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.2);  // Nose top
    _ctx.lineTo(fuseLen * 0.5, fuseH * 0.1);   // Nose tip
    _ctx.lineTo(fuseLen * 0.4, fuseH * 0.4);   // Nose bottom
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5); // Rear bottom
    _ctx.lineTo(-fuseLen * 0.35, -fuseH * 0.4);// Rear top
    _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.5); // Top spine
    _ctx.closePath();
    _ctx.fill();

    // Fuselage panel lines
    _ctx.strokeStyle = darker;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.02));
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.25, -fuseH * 0.25);
    _ctx.lineTo(-fuseLen * 0.05, -fuseH * 0.38);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.1, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.2, fuseH * 0.25);
    _ctx.stroke();
    _ctx.lineWidth = 1;

    // Fuselage top highlight
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.35, -fuseH * 0.25);
    _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.5);
    _ctx.lineTo(-fuseLen * 0.25, -fuseH * 0.4);
    _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();

    // Fuselage bottom shadow
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, fuseH * 0.35);
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.5);
    _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.3);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();

    // Engine intake (top)
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.15, -fuseH * 0.55, s * 0.2, s * 0.08);

    // Engine exhaust (rear sides)
    _ctx.fillStyle = exhaust;
    _ctx.fillRect(-fuseLen * 0.38, -fuseH * 0.2, s * 0.08, s * 0.12);
    _ctx.fillRect(-fuseLen * 0.38, fuseH * 0.1, s * 0.08, s * 0.12);

    // Cockpit glass (angular, multi-pane)
    _ctx.fillStyle = glass;
    // Main canopy
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.38, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.48, fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.25);
    _ctx.lineTo(fuseLen * 0.1, fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();
    // Glass highlight
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.36, -fuseH * 0.1);
    _ctx.lineTo(fuseLen * 0.42, fuseH * 0.0);
    _ctx.lineTo(fuseLen * 0.3, fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.28, -fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();

    // Mast-mounted sensor hint (side silhouette)
    _ctx.fillStyle = getSpriteColorWithFog('#2a3a3a', fogFactor, ambient, skyColor);
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.92, s * 0.06, 0, Math.PI * 2);
    _ctx.fill();

    // Chin sensor/gun turret
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.35, fuseH * 0.35, s * 0.08, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = exhaust;
    _ctx.fillRect(fuseLen * 0.35, fuseH * 0.32, s * 0.15, s * 0.04);

    // Landing gear (wheels)
    const wheelR = Math.max(1, Math.floor(s * 0.06));
    _ctx.fillStyle = darker;
    // Struts
    _ctx.fillRect(fuseLen * 0.16, fuseH * 0.4, skidStrut, s * 0.16);
    _ctx.fillRect(-fuseLen * 0.14, fuseH * 0.4, skidStrut, s * 0.16);
    // Wheels
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.2, fuseH * 0.58, wheelR, 0, Math.PI * 2);
    _ctx.arc(-fuseLen * 0.1, fuseH * 0.58, wheelR, 0, Math.PI * 2);
    _ctx.fill();

    // Main rotor disc (perspective ellipse)
    const rotorTime = performance.now() / 40;
    const rotorRadX = fuseLen * 0.7;
    const rotorRadY = fuseLen * 0.2;
    
    // Rotor blur disc
    _ctx.fillStyle = rotor;
    _ctx.globalAlpha = 0.25;
    _ctx.beginPath();
    _ctx.ellipse(0, -fuseH * 0.7, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
    _ctx.fill();
    
    // Rotor blades (4 blades)
    _ctx.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++) {
        const angle = rotorTime + (i * Math.PI / 2);
        const bx = Math.cos(angle) * rotorRadX;
        const by = Math.sin(angle) * rotorRadY;
        const bladeW = Math.max(2, Math.floor(s * 0.06));
        _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.7 + by - 1, bladeW, 2);
    }
    _ctx.globalAlpha = 1.0;

    // Rotor hub/mast
    _ctx.fillStyle = darker;
    _ctx.fillRect(-s * 0.04, -fuseH * 0.8, s * 0.08, s * 0.12);
    _ctx.fillStyle = exhaust;
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.82, s * 0.05, 0, Math.PI * 2);
    _ctx.fill();

    _ctx.restore();
}

export function drawFighterJet(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // Colors - sleek fighter jet palette
    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 15), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog('#2a4a6a', fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog('#4a7a9a', fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
    const exhaustGlow = getSpriteColorWithFog('#4a3a2a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Determine view type
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;

    if (showFront) {
        // FRONT VIEW - delta wing silhouette, nose toward camera
        const wingSpan = s * 1.1;
        const fuseH = s * 0.8;

        // Main delta wing shape
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.5);           // Nose
        _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15); // Left wing tip
        _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.4); // Left wing root
        _ctx.lineTo(ix, iy + fuseH * 0.5);           // Tail
        _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.4); // Right wing root
        _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15); // Right wing tip
        _ctx.closePath();
        _ctx.fill();

        // Wing top highlight
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.4);
        _ctx.lineTo(ix - wingSpan * 0.7, iy + fuseH * 0.05);
        _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.1);
        _ctx.lineTo(ix, iy - fuseH * 0.2);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.4);
        _ctx.lineTo(ix + wingSpan * 0.7, iy + fuseH * 0.05);
        _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.1);
        _ctx.lineTo(ix, iy - fuseH * 0.2);
        _ctx.closePath();
        _ctx.fill();

        // Fuselage spine
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);

        // Vertical tail fins (twin tails like F-22)
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix - s * 0.15, iy + fuseH * 0.2);
        _ctx.lineTo(ix - s * 0.25, iy + fuseH * 0.5);
        _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(ix + s * 0.15, iy + fuseH * 0.2);
        _ctx.lineTo(ix + s * 0.25, iy + fuseH * 0.5);
        _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.45);
        _ctx.closePath();
        _ctx.fill();

        // Cockpit canopy (front view)
        _ctx.fillStyle = glass;
        _ctx.fillRect(ix - s * 0.08, iy - fuseH * 0.3, s * 0.16, s * 0.18);
        _ctx.fillStyle = glassHighlight;
        _ctx.fillRect(ix - s * 0.06, iy - fuseH * 0.28, s * 0.06, s * 0.08);

        // Air intakes (visible from front)
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - s * 0.2, iy - fuseH * 0.05, s * 0.08, s * 0.12);
        _ctx.fillRect(ix + s * 0.12, iy - fuseH * 0.05, s * 0.08, s * 0.12);

        // Nose highlight
        _ctx.fillStyle = highlight;
        _ctx.fillRect(ix - s * 0.03, iy - fuseH * 0.5, s * 0.06, s * 0.1);

        return;
    }

    if (showBack) {
        // BACK VIEW - exhaust nozzles visible
        const wingSpan = s * 1.1;
        const fuseH = s * 0.8;

        // Main delta wing shape
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.5);           // Nose (away from camera)
        _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15);
        _ctx.lineTo(ix - wingSpan * 0.3, iy + fuseH * 0.4);
        _ctx.lineTo(ix, iy + fuseH * 0.5);           // Tail (toward camera)
        _ctx.lineTo(ix + wingSpan * 0.3, iy + fuseH * 0.4);
        _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15);
        _ctx.closePath();
        _ctx.fill();

        // Wing shading (darker from back)
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.3);
        _ctx.lineTo(ix - wingSpan * 0.8, iy + fuseH * 0.1);
        _ctx.lineTo(ix - wingSpan * 0.4, iy + fuseH * 0.2);
        _ctx.lineTo(ix, iy);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.3);
        _ctx.lineTo(ix + wingSpan * 0.8, iy + fuseH * 0.1);
        _ctx.lineTo(ix + wingSpan * 0.4, iy + fuseH * 0.2);
        _ctx.lineTo(ix, iy);
        _ctx.closePath();
        _ctx.fill();

        // Fuselage spine
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.1, iy - fuseH * 0.35, s * 0.2, fuseH * 0.7);

        // Vertical tail fins
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix - s * 0.15, iy + fuseH * 0.2);
        _ctx.lineTo(ix - s * 0.25, iy + fuseH * 0.5);
        _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.45);
        _ctx.closePath();
        _ctx.fill();
        _ctx.beginPath();
        _ctx.moveTo(ix + s * 0.15, iy + fuseH * 0.2);
        _ctx.lineTo(ix + s * 0.25, iy + fuseH * 0.5);
        _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.45);
        _ctx.closePath();
        _ctx.fill();

        // Engine exhausts (prominent from back - 2 circles with glow)
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.08, iy + fuseH * 0.42, s * 0.08, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.08, iy + fuseH * 0.42, s * 0.08, 0, Math.PI * 2);
        _ctx.fill();
        // Exhaust glow (inner)
        _ctx.fillStyle = exhaustGlow;
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.08, iy + fuseH * 0.44, s * 0.045, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.08, iy + fuseH * 0.44, s * 0.045, 0, Math.PI * 2);
        _ctx.fill();
        // Hot core
        _ctx.fillStyle = getSpriteColorWithFog('#6a5a4a', fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.08, iy + fuseH * 0.45, s * 0.025, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.08, iy + fuseH * 0.45, s * 0.025, 0, Math.PI * 2);
        _ctx.fill();

        return;
    }

    if (showSide) {
        // Side view - F-16/F-22 like profile
        _ctx.save();
        _ctx.translate(ix, iy);
        _ctx.scale(dir, 1);

        const fuseLen = s * 1.5;
        const fuseH = s * 0.22;
        const noseLen = s * 0.4;
        const wingChord = s * 0.35;

        // Main fuselage (sleek tapered shape)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.5, 0);           // Nose tip
        _ctx.lineTo(fuseLen * 0.35, -fuseH * 0.6); // Nose top
        _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.8); // Canopy peak
        _ctx.lineTo(-fuseLen * 0.5, -fuseH * 0.5); // Rear top
        _ctx.lineTo(-fuseLen * 0.55, 0);          // Exhaust
        _ctx.lineTo(-fuseLen * 0.5, fuseH * 0.5);  // Rear bottom
        _ctx.lineTo(fuseLen * 0.3, fuseH * 0.5);   // Belly
        _ctx.lineTo(fuseLen * 0.45, fuseH * 0.2);  // Nose bottom
        _ctx.closePath();
        _ctx.fill();

        // Fuselage top highlight
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.4);
        _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.75);
        _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.5);
        _ctx.lineTo(-fuseLen * 0.2, -fuseH * 0.4);
        _ctx.closePath();
        _ctx.fill();

        // Fuselage bottom shadow
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.35, fuseH * 0.4);
        _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.5);
        _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.2);
        _ctx.lineTo(fuseLen * 0.3, fuseH * 0.25);
        _ctx.closePath();
        _ctx.fill();

        // Wing (delta shape from side)
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen * 0.05, fuseH * 0.3);
        _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.9);
        _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.9);
        _ctx.lineTo(-fuseLen * 0.35, fuseH * 0.3);
        _ctx.closePath();
        _ctx.fill();

        // Horizontal stabilizer
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen * 0.4, fuseH * 0.2);
        _ctx.lineTo(-fuseLen * 0.55, fuseH * 0.5);
        _ctx.lineTo(-fuseLen * 0.55, fuseH * 0.35);
        _ctx.lineTo(-fuseLen * 0.45, fuseH * 0.2);
        _ctx.closePath();
        _ctx.fill();

        // Vertical tail fin
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseLen * 0.35, -fuseH * 0.5);
        _ctx.lineTo(-fuseLen * 0.5, -fuseH * 1.3);
        _ctx.lineTo(-fuseLen * 0.55, -fuseH * 1.3);
        _ctx.lineTo(-fuseLen * 0.55, -fuseH * 0.5);
        _ctx.closePath();
        _ctx.fill();

        // Cockpit canopy
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.3, -fuseH * 0.5);
        _ctx.lineTo(-fuseLen * 0.1, -fuseH * 0.75);
        _ctx.lineTo(-fuseLen * 0.15, -fuseH * 0.5);
        _ctx.lineTo(fuseLen * 0.2, -fuseH * 0.35);
        _ctx.closePath();
        _ctx.fill();
        // Canopy frame
        _ctx.fillStyle = darker;
        _ctx.fillRect(fuseLen * 0.05, -fuseH * 0.65, s * 0.02, fuseH * 0.25);
        // Canopy highlight
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.moveTo(fuseLen * 0.25, -fuseH * 0.45);
        _ctx.lineTo(fuseLen * 0.1, -fuseH * 0.6);
        _ctx.lineTo(fuseLen * 0.15, -fuseH * 0.45);
        _ctx.closePath();
        _ctx.fill();

        // Engine exhaust nozzle
        _ctx.fillStyle = exhaust;
        _ctx.fillRect(-fuseLen * 0.55, -fuseH * 0.3, s * 0.1, fuseH * 0.6);
        // Exhaust glow
        _ctx.fillStyle = exhaustGlow;
        _ctx.fillRect(-fuseLen * 0.58, -fuseH * 0.15, s * 0.05, fuseH * 0.3);

        // Air intake (under fuselage)
        _ctx.fillStyle = darker;
        _ctx.fillRect(fuseLen * 0.0, fuseH * 0.35, s * 0.2, s * 0.08);

        _ctx.restore();
    }
}

export function drawFriendlyAircraft(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 12);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 40), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog('#2a4a6a', fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog('#4a7a9a', fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
    const exhaustGlow = getSpriteColorWithFog('#ff7a2a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;

    if (showFront) {
        const wingSpan = s * 1.0;
        const fuseH = s * 0.7;

        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.5);
        _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15);
        _ctx.lineTo(ix, iy + fuseH * 0.5);
        _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = highlight;
        _ctx.fillRect(ix - s * 0.08, iy - fuseH * 0.35, s * 0.16, fuseH * 0.7);

        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - wingSpan * 0.55, iy + fuseH * 0.05, s * 0.18, s * 0.05);
        _ctx.fillRect(ix + wingSpan * 0.37, iy + fuseH * 0.05, s * 0.18, s * 0.05);

        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy + fuseH * 0.1);
        _ctx.lineTo(ix - s * 0.08, iy + fuseH * 0.5);
        _ctx.lineTo(ix + s * 0.08, iy + fuseH * 0.5);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = glass;
        _ctx.fillRect(ix - s * 0.07, iy - fuseH * 0.25, s * 0.14, s * 0.16);
        _ctx.fillStyle = glassHighlight;
        _ctx.fillRect(ix - s * 0.05, iy - fuseH * 0.22, s * 0.05, s * 0.08);
        return;
    }

    if (showBack) {
        const wingSpan = s * 1.0;
        const fuseH = s * 0.7;

        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - fuseH * 0.5);
        _ctx.lineTo(ix - wingSpan, iy + fuseH * 0.15);
        _ctx.lineTo(ix, iy + fuseH * 0.5);
        _ctx.lineTo(ix + wingSpan, iy + fuseH * 0.15);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.08, iy - fuseH * 0.35, s * 0.16, fuseH * 0.7);

        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy + fuseH * 0.15);
        _ctx.lineTo(ix - s * 0.1, iy + fuseH * 0.5);
        _ctx.lineTo(ix + s * 0.1, iy + fuseH * 0.5);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(ix, iy + fuseH * 0.38, s * 0.08, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = exhaustGlow;
        _ctx.beginPath();
        _ctx.arc(ix, iy + fuseH * 0.4, s * 0.05, 0, Math.PI * 2);
        _ctx.fill();
        return;
    }

    // Side view
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);

    const fuseLen = s * 1.8;
    const fuseH = s * 0.2;

    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.5, 0);
    _ctx.lineTo(fuseLen * 0.3, -fuseH);
    _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.8);
    _ctx.lineTo(-fuseLen * 0.5, 0);
    _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.8);
    _ctx.lineTo(fuseLen * 0.3, fuseH);
    _ctx.closePath();
    _ctx.fill();

    // Swept wings
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.05, -fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.25, -s * 0.6);
    _ctx.lineTo(-fuseLen * 0.4, -fuseH * 0.4);
    _ctx.closePath();
    _ctx.fill();
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.05, fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.25, s * 0.6);
    _ctx.lineTo(-fuseLen * 0.4, fuseH * 0.4);
    _ctx.closePath();
    _ctx.fill();

    // Tail fin
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.35, 0);
    _ctx.lineTo(-fuseLen * 0.5, -s * 0.4);
    _ctx.lineTo(-fuseLen * 0.5, 0);
    _ctx.closePath();
    _ctx.fill();

    // Cockpit
    _ctx.fillStyle = glass;
    _ctx.beginPath();
    _ctx.ellipse(fuseLen * 0.25, 0, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.ellipse(fuseLen * 0.28, -s * 0.02, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
    _ctx.fill();

    // Under-wing pylons
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.22, -s * 0.45, s * 0.16, s * 0.05);
    _ctx.fillRect(-fuseLen * 0.22, s * 0.4, s * 0.16, s * 0.05);

    // Afterburner glow
    _ctx.fillStyle = exhaustGlow;
    _ctx.globalAlpha = 0.6;
    _ctx.beginPath();
    _ctx.ellipse(-fuseLen * 0.52, 0, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 1.0;

    _ctx.restore();
}

export function drawTransportPlane(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 18);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const body = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const windowColor = getSpriteColorWithFog('#4a6a8a', fogFactor, ambient, skyColor);
    const exhaust = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Determine view type
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;

    if (showFront) {
        // FRONT VIEW - wide fuselage, high wings
        // Wide fuselage (oval)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.ellipse(ix, iy, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
        _ctx.fill();

        // Fuselage highlight
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.ellipse(ix - s * 0.08, iy - s * 0.15, s * 0.12, s * 0.25, 0, 0, Math.PI * 2);
        _ctx.fill();

        // High wings spanning across
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 1.0, iy - s * 0.35, s * 2.0, s * 0.16);

        // Wing highlight
        _ctx.fillStyle = highlight;
        _ctx.fillRect(ix - s * 0.9, iy - s * 0.35, s * 1.8, s * 0.04);

        // Cockpit windows at top
        _ctx.fillStyle = windowColor;
        _ctx.fillRect(ix - s * 0.12, iy - s * 0.4, s * 0.24, s * 0.1);
        // Window frame
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - s * 0.01, iy - s * 0.4, s * 0.02, s * 0.1);

        // Engines on wings (4 engines)
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.7, iy - s * 0.3, s * 0.16, s * 0.22);
        _ctx.fillRect(ix - s * 0.35, iy - s * 0.3, s * 0.16, s * 0.22);
        _ctx.fillRect(ix + s * 0.19, iy - s * 0.3, s * 0.16, s * 0.22);
        _ctx.fillRect(ix + s * 0.54, iy - s * 0.3, s * 0.16, s * 0.22);

        // Propeller discs (if prop plane) or intakes
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.ellipse(ix - s * 0.62, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.ellipse(ix - s * 0.27, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.ellipse(ix + s * 0.27, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.ellipse(ix + s * 0.62, iy - s * 0.19, s * 0.08, s * 0.08, 0, 0, Math.PI * 2);
        _ctx.fill();

        // Landing gear (nose gear visible)
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - s * 0.04, iy + s * 0.4, s * 0.08, s * 0.15);
        _ctx.beginPath();
        _ctx.arc(ix, iy + s * 0.55, s * 0.06, 0, Math.PI * 2);
        _ctx.fill();

        return;
    }

    if (showBack) {
        // BACK VIEW - rear cargo door, tail fin
        // Wide fuselage
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.ellipse(ix, iy, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
        _ctx.fill();

        // High wings
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 1.0, iy - s * 0.35, s * 2.0, s * 0.16);

        // Tail fin (T-tail style)
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(ix, iy - s * 0.45);
        _ctx.lineTo(ix - s * 0.08, iy - s * 0.9);
        _ctx.lineTo(ix + s * 0.08, iy - s * 0.9);
        _ctx.closePath();
        _ctx.fill();

        // Horizontal stabilizer on top of tail
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - s * 0.4, iy - s * 0.92, s * 0.8, s * 0.08);

        // Rear cargo door area (darker rectangle)
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - s * 0.2, iy + s * 0.1, s * 0.4, s * 0.35);

        // Cargo door frame
        _ctx.fillStyle = getSpriteColorWithFog('#3a3a3a', fogFactor, ambient, skyColor);
        _ctx.fillRect(ix - s * 0.18, iy + s * 0.12, s * 0.36, s * 0.04);

        // Engines on wings (from back - show exhausts)
        _ctx.fillStyle = exhaust;
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.62, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix - s * 0.27, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.27, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(ix + s * 0.62, iy - s * 0.19, s * 0.07, 0, Math.PI * 2);
        _ctx.fill();

        return;
    }

    if (showSide) {
        _ctx.save();
        _ctx.translate(ix, iy);
        _ctx.scale(dir, 1);

        // Large fuselage
        _ctx.fillStyle = body;
        _ctx.fillRect(-s * 0.95, -s * 0.22, s * 1.9, s * 0.44);

        // Nose
        _ctx.beginPath();
        _ctx.moveTo(s * 0.95, -s * 0.18);
        _ctx.lineTo(s * 1.1, 0);
        _ctx.lineTo(s * 0.95, s * 0.18);
        _ctx.closePath();
        _ctx.fill();

        // High wing
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.2, -s * 0.38, s * 0.8, s * 0.12);

        // Tail + fin
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 1.05, -s * 0.5, s * 0.2, s * 0.35);
        _ctx.fillRect(-s * 1.05, -s * 0.35, s * 0.45, s * 0.12);

        // Windows
        _ctx.fillStyle = windowColor;
        for (let i = 0; i < 5; i++) {
            _ctx.fillRect(-s * 0.5 + i * s * 0.22, -s * 0.12, s * 0.1, s * 0.08);
        }

        // Engines
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.05, -s * 0.1, s * 0.16, s * 0.12);
        _ctx.fillRect(s * 0.18, -s * 0.1, s * 0.16, s * 0.12);
        _ctx.fillRect(s * 0.41, -s * 0.1, s * 0.16, s * 0.12);

        _ctx.restore();
    }
}

export function drawAttackHelicopter(x, y, size, color, heading, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // Colors - aggressive attack helicopter palette (slightly different from player)
    const body = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 50), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 65), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 4), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog('#122a2a', fogFactor, ambient, skyColor);
    const glassHighlight = getSpriteColorWithFog('#2f5a5a', fogFactor, ambient, skyColor);
    const rotor = getSpriteColorWithFog('#3a3a3a', fogFactor, ambient, skyColor);
    const weapon = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const weaponDark = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Determine view type
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingRight = cosRel >= 0;
    const dir = facingRight ? 1 : -1;

    if (showFront) {
        // FRONT VIEW - nose/cockpit facing camera (Apache-style)
        _ctx.save();
        _ctx.translate(ix, iy);

        const fuseW = s * 0.45;
        const fuseH = s * 0.4;
        const rotorRadX = s * 0.85;
        const rotorRadY = s * 0.28;

        // Rotor disc
        const rotorTime = performance.now() / 38;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH * 1.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
        _ctx.fill();
        
        _ctx.globalAlpha = 0.7;
        for (let i = 0; i < 4; i++) {
            const angle = rotorTime + (i * Math.PI / 2);
            const bx = Math.cos(angle) * rotorRadX;
            const by = Math.sin(angle) * rotorRadY;
            const bladeW = Math.max(2, Math.floor(s * 0.07));
            _ctx.fillRect(bx - bladeW / 2, -fuseH * 1.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1.0;

        // Rotor mast
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.05, -fuseH * 1.7, s * 0.1, s * 0.35);

        // Engine housings (LARGER bulges for RHINO aggressive look)
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.28, -fuseH * 1.35, s * 0.56, s * 0.2);
        // Side engine intakes (more prominent)
        _ctx.fillStyle = weapon;
        _ctx.fillRect(-fuseW - s * 0.08, -fuseH * 0.9, s * 0.12, s * 0.25);
        _ctx.fillRect(fuseW - s * 0.04, -fuseH * 0.9, s * 0.12, s * 0.25);

        // Main fuselage (WIDER, more angular for RHINO)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 1.1, -fuseH * 0.25);  // Wider top
        _ctx.lineTo(-fuseW * 0.8, -fuseH * 1.05);
        _ctx.lineTo(fuseW * 0.8, -fuseH * 1.05);
        _ctx.lineTo(fuseW * 1.1, -fuseH * 0.25);   // Wider top
        _ctx.lineTo(fuseW * 0.9, fuseH * 0.55);
        _ctx.lineTo(-fuseW * 0.9, fuseH * 0.55);
        _ctx.closePath();
        _ctx.fill();

        // Fuselage highlight (subtle for dark RHINO look)
        _ctx.fillStyle = highlight;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.4, -fuseH * 0.95);
        _ctx.lineTo(fuseW * 0.4, -fuseH * 0.95);
        _ctx.lineTo(fuseW * 0.25, -fuseH * 0.55);
        _ctx.lineTo(-fuseW * 0.25, -fuseH * 0.55);
        _ctx.closePath();
        _ctx.fill();

        // Armored nose plate
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW * 0.18, -fuseH * 0.15);
        _ctx.lineTo(0, fuseH * 0.05);
        _ctx.lineTo(fuseW * 0.18, -fuseH * 0.15);
        _ctx.lineTo(0, -fuseH * 0.25);
        _ctx.closePath();
        _ctx.fill();

        // Stub wings with weapons (LARGER for RHINO)
        _ctx.fillStyle = body;
        // Left wing
        _ctx.fillRect(-fuseW - s * 0.42, -fuseH * 0.18, s * 0.42, s * 0.12);
        // Right wing
        _ctx.fillRect(fuseW, -fuseH * 0.18, s * 0.42, s * 0.12);

        // Weapon pylons (LARGER and MORE VISIBLE for RHINO - intimidating)
        _ctx.fillStyle = weapon;
        // Left pylon with multiple weapons
        _ctx.fillRect(-fuseW - s * 0.38, -fuseH * 0.4, s * 0.14, s * 0.25);
        _ctx.fillRect(-fuseW - s * 0.22, -fuseH * 0.35, s * 0.1, s * 0.2);
        // Right pylon with multiple weapons
        _ctx.fillRect(fuseW + s * 0.24, -fuseH * 0.4, s * 0.14, s * 0.25);
        _ctx.fillRect(fuseW + s * 0.12, -fuseH * 0.35, s * 0.1, s * 0.2);
        // Additional missile rails (visible from front)
        _ctx.fillStyle = weaponDark;
        _ctx.fillRect(-fuseW - s * 0.36, fuseH * 0.0, s * 0.08, s * 0.18);
        _ctx.fillRect(fuseW + s * 0.28, fuseH * 0.0, s * 0.08, s * 0.18);

        // Cockpit glass (SMALLER/more armored for RHINO - less exposed)
        _ctx.fillStyle = glass;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH * 0.15, fuseW * 0.35, fuseH * 0.35, 0, 0, Math.PI * 2);
        _ctx.fill();
        // Armored cockpit frame
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW * 0.4, -fuseH * 0.3, fuseW * 0.8, s * 0.03);
        _ctx.fillStyle = glassHighlight;
        _ctx.beginPath();
        _ctx.ellipse(-fuseW * 0.08, -fuseH * 0.35, fuseW * 0.1, fuseH * 0.1, 0, 0, Math.PI * 2);
        _ctx.fill();

        // Chin gun turret (LARGER for RHINO)
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.55, s * 0.15, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = weaponDark;
        // Dual gun barrels
        _ctx.fillRect(-s * 0.04, fuseH * 0.65, s * 0.03, s * 0.12);
        _ctx.fillRect(s * 0.01, fuseH * 0.65, s * 0.03, s * 0.12);

        // Landing skids (HEAVIER for RHINO)
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.12, fuseH * 0.25, s * 0.1, s * 0.5);
        _ctx.fillRect(-fuseW - s * 0.18, fuseH * 0.7, s * 0.22, s * 0.06);
        _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.25, s * 0.1, s * 0.5);
        _ctx.fillRect(fuseW - s * 0.04, fuseH * 0.7, s * 0.22, s * 0.06);

        _ctx.restore();
        return;
    }

    if (showBack) {
        // BACK VIEW - tail/exhausts facing camera
        _ctx.save();
        _ctx.translate(ix, iy);

        const fuseW = s * 0.45;
        const fuseH = s * 0.4;
        const rotorRadX = s * 0.85;
        const rotorRadY = s * 0.28;

        // Rotor disc
        const rotorTime = performance.now() / 38;
        _ctx.fillStyle = rotor;
        _ctx.globalAlpha = 0.25;
        _ctx.beginPath();
        _ctx.ellipse(0, -fuseH * 1.9, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
        _ctx.fill();
        
        _ctx.globalAlpha = 0.7;
        for (let i = 0; i < 4; i++) {
            const angle = rotorTime + (i * Math.PI / 2);
            const bx = Math.cos(angle) * rotorRadX;
            const by = Math.sin(angle) * rotorRadY;
            const bladeW = Math.max(2, Math.floor(s * 0.07));
            _ctx.fillRect(bx - bladeW / 2, -fuseH * 1.9 + by - 1, bladeW, 2);
        }
        _ctx.globalAlpha = 1.0;

        // Rotor mast
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.05, -fuseH * 1.7, s * 0.1, s * 0.35);

        // Engine housing
        _ctx.fillStyle = darker;
        _ctx.fillRect(-s * 0.22, -fuseH * 1.3, s * 0.44, s * 0.18);

        // Main fuselage (back view)
        _ctx.fillStyle = body;
        _ctx.beginPath();
        _ctx.moveTo(-fuseW, -fuseH * 0.3);
        _ctx.lineTo(-fuseW * 0.7, -fuseH);
        _ctx.lineTo(fuseW * 0.7, -fuseH);
        _ctx.lineTo(fuseW, -fuseH * 0.3);
        _ctx.lineTo(fuseW * 0.8, fuseH * 0.4);
        _ctx.lineTo(-fuseW * 0.8, fuseH * 0.4);
        _ctx.closePath();
        _ctx.fill();

        // Engine exhausts (prominent from back)
        _ctx.fillStyle = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(-fuseW * 0.4, -fuseH * 0.5, s * 0.1, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(fuseW * 0.4, -fuseH * 0.5, s * 0.1, 0, Math.PI * 2);
        _ctx.fill();
        // Exhaust glow
        _ctx.fillStyle = getSpriteColorWithFog('#5a4a3a', fogFactor, ambient, skyColor);
        _ctx.beginPath();
        _ctx.arc(-fuseW * 0.4, -fuseH * 0.5, s * 0.05, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.beginPath();
        _ctx.arc(fuseW * 0.4, -fuseH * 0.5, s * 0.05, 0, Math.PI * 2);
        _ctx.fill();

        // Stub wings (from back)
        _ctx.fillStyle = body;
        _ctx.fillRect(-fuseW - s * 0.35, -fuseH * 0.15, s * 0.35, s * 0.1);
        _ctx.fillRect(fuseW, -fuseH * 0.15, s * 0.35, s * 0.1);

        // Weapon pylons
        _ctx.fillStyle = weapon;
        _ctx.fillRect(-fuseW - s * 0.28, -fuseH * 0.3, s * 0.1, s * 0.18);
        _ctx.fillRect(fuseW + s * 0.18, -fuseH * 0.3, s * 0.1, s * 0.18);

        // Tail boom
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.07, fuseH * 0.2, s * 0.14, s * 0.55);

        // Tail fin
        _ctx.fillStyle = darker;
        _ctx.beginPath();
        _ctx.moveTo(0, fuseH * 0.5);
        _ctx.lineTo(-s * 0.15, fuseH * 0.9);
        _ctx.lineTo(s * 0.15, fuseH * 0.9);
        _ctx.closePath();
        _ctx.fill();

        // Horizontal stabilizer (heavier for RHINO)
        _ctx.fillStyle = dark;
        _ctx.fillRect(-s * 0.35, fuseH * 0.62, s * 0.7, s * 0.08);

        // Fenestron (enclosed tail rotor) - RHINO style back view
        const fenRadEnemyBack = s * 0.14;
        // Heavy shroud
        _ctx.fillStyle = weapon;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.7, fenRadEnemyBack * 1.2, 0, Math.PI * 2);
        _ctx.fill();
        // Inner disc
        _ctx.fillStyle = dark;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.7, fenRadEnemyBack * 0.82, 0, Math.PI * 2);
        _ctx.fill();
        // Animated fan blades (fast spin)
        const fenTimeEnemyBack = performance.now() / 15;
        _ctx.strokeStyle = rotor;
        _ctx.lineWidth = Math.max(1, s * 0.02);
        for (let i = 0; i < 8; i++) {
            const fAngle = fenTimeEnemyBack + (i * Math.PI / 4);
            _ctx.beginPath();
            _ctx.moveTo(0, fuseH * 0.7);
            _ctx.lineTo(
                Math.cos(fAngle) * fenRadEnemyBack * 0.72,
                fuseH * 0.7 + Math.sin(fAngle) * fenRadEnemyBack * 0.72
            );
            _ctx.stroke();
        }
        _ctx.lineWidth = 1;
        // Center hub
        _ctx.fillStyle = weaponDark;
        _ctx.beginPath();
        _ctx.arc(0, fuseH * 0.7, fenRadEnemyBack * 0.2, 0, Math.PI * 2);
        _ctx.fill();

        // Landing skids (heavier for RHINO)
        _ctx.fillStyle = darker;
        _ctx.fillRect(-fuseW - s * 0.12, fuseH * 0.12, s * 0.1, s * 0.45);
        _ctx.fillRect(-fuseW - s * 0.18, fuseH * 0.52, s * 0.22, s * 0.06);
        _ctx.fillRect(fuseW + s * 0.02, fuseH * 0.12, s * 0.1, s * 0.45);
        _ctx.fillRect(fuseW - s * 0.04, fuseH * 0.52, s * 0.22, s * 0.06);

        _ctx.restore();
        return;
    }

    // SIDE VIEW (existing code)
    _ctx.save();
    _ctx.translate(ix, iy);
    _ctx.scale(dir, 1);

    // Proportions - Apache/Hind-like aggressive profile
    const fuseLen = s * 1.5;
    const fuseH = s * 0.32;
    const tailLen = s * 0.95;
    const tailH = s * 0.12;
    const finH = s * 0.28;
    const wingSpan = s * 0.55;
    const skidH = Math.max(1, Math.floor(s * 0.04));

    // Tail boom (tapered, slightly thicker than player heli)
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.32, -tailH * 0.7);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen, -tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen, tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32, tailH * 0.7);
    _ctx.closePath();
    _ctx.fill();

    // Tail fin (larger, more aggressive)
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.32 - tailLen + s * 0.1, -tailH * 0.35);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.02, -finH);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.14, -finH);
    _ctx.lineTo(-fuseLen * 0.32 - tailLen - s * 0.08, -tailH * 0.35);
    _ctx.closePath();
    _ctx.fill();

    // Horizontal stabilizer (larger, more aggressive)
    _ctx.fillStyle = dark;
    _ctx.fillRect(-fuseLen * 0.32 - tailLen - s * 0.06, -s * 0.04, s * 0.26, s * 0.08);

    // Fenestron (enclosed tail rotor) - RHINO style, darker and more angular
    const enemyFenRadius = s * 0.14;
    const enemyFenX = -fuseLen * 0.32 - tailLen - s * 0.02;
    const enemyFenY = -finH + s * 0.1;
    
    // Fenestron shroud (heavier/darker for RHINO look)
    _ctx.fillStyle = weaponDark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 1.25, 0, Math.PI * 2);
    _ctx.fill();
    
    // Inner fan area
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.85, 0, Math.PI * 2);
    _ctx.fill();
    
    // Animated fan blades (faster spin for enemy)
    const enemyFenTime = performance.now() / 15;
    _ctx.strokeStyle = rotor;
    _ctx.lineWidth = Math.max(1, s * 0.025);
    for (let i = 0; i < 8; i++) {
        const fAngle = enemyFenTime + (i * Math.PI / 4);
        _ctx.beginPath();
        _ctx.moveTo(enemyFenX, enemyFenY);
        _ctx.lineTo(
            enemyFenX + Math.cos(fAngle) * enemyFenRadius * 0.75,
            enemyFenY + Math.sin(fAngle) * enemyFenRadius * 0.75
        );
        _ctx.stroke();
    }
    _ctx.lineWidth = 1;
    
    // Center hub
    _ctx.fillStyle = weaponDark;
    _ctx.beginPath();
    _ctx.arc(enemyFenX, enemyFenY, enemyFenRadius * 0.22, 0, Math.PI * 2);
    _ctx.fill();

    // Main fuselage (bulkier, more armored RHINO look)
    _ctx.fillStyle = body;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.45, -fuseH * 0.05);  // Flat nose top
    _ctx.lineTo(fuseLen * 0.55, fuseH * 0.18);   // Angular nose tip
    _ctx.lineTo(fuseLen * 0.45, fuseH * 0.48);   // Flat nose bottom
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.55);  // Rear bottom
    _ctx.lineTo(-fuseLen * 0.34, -fuseH * 0.42); // Rear top
    _ctx.lineTo(fuseLen * 0.05, -fuseH * 0.55);  // Top spine
    _ctx.closePath();
    _ctx.fill();

    // Armored side plate
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.1, -fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.3, -fuseH * 0.2);
    _ctx.lineTo(fuseLen * 0.28, -fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.08, -fuseH * 0.35);
    _ctx.closePath();
    _ctx.fill();

    // Fuselage top highlight
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.35, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.1, -fuseH * 0.52);
    _ctx.lineTo(-fuseLen * 0.2, -fuseH * 0.42);
    _ctx.lineTo(-fuseLen * 0.05, -fuseH * 0.2);
    _ctx.closePath();
    _ctx.fill();

    // Fuselage bottom shadow
    _ctx.fillStyle = dark;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, fuseH * 0.4);
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.55);
    _ctx.lineTo(-fuseLen * 0.32, fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();

    // Engine housing (bulge on top)
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.2, -fuseH * 0.65, s * 0.28, s * 0.12);

    // Thruster bay details
    _ctx.fillStyle = darker;
    _ctx.fillRect(-fuseLen * 0.28, -fuseH * 0.15, s * 0.12, s * 0.08);
    _ctx.fillRect(-fuseLen * 0.28, fuseH * 0.05, s * 0.12, s * 0.08);
    _ctx.fillStyle = highlight;
    _ctx.fillRect(-fuseLen * 0.26, -fuseH * 0.12, s * 0.06, s * 0.02);

    // Stub wings with weapon pylons
    _ctx.fillStyle = body;
    // Upper wing
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.05, -fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.25);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, -fuseH * 0.1);
    _ctx.lineTo(-fuseLen * 0.15, -fuseH * 0.05);
    _ctx.closePath();
    _ctx.fill();
    // Lower wing
    _ctx.beginPath();
    _ctx.moveTo(-fuseLen * 0.05, fuseH * 0.2);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.3);
    _ctx.lineTo(-fuseLen * 0.05 - wingSpan, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.15, fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();

    // Weapon pylons
    _ctx.fillStyle = weapon;
    // Rocket pods (upper wing)
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, -fuseH * 0.35, s * 0.22, s * 0.14);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.4, -fuseH * 0.32, s * 0.16, s * 0.12);
    // Missile rails (lower wing)
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.7, fuseH * 0.28, s * 0.24, s * 0.1);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.4, fuseH * 0.25, s * 0.18, s * 0.1);

    // Missiles on rails
    _ctx.fillStyle = weaponDark;
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.65, fuseH * 0.36, s * 0.14, s * 0.04);
    _ctx.fillRect(-fuseLen * 0.05 - wingSpan * 0.35, fuseH * 0.33, s * 0.12, s * 0.04);

    // Cockpit glass (tandem seating, angular)
    _ctx.fillStyle = glass;
    // Front gunner
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.4, -fuseH * 0.05);
    _ctx.lineTo(fuseLen * 0.48, fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.35, fuseH * 0.35);
    _ctx.lineTo(fuseLen * 0.2, fuseH * 0.3);
    _ctx.lineTo(fuseLen * 0.18, -fuseH * 0.1);
    _ctx.closePath();
    _ctx.fill();
    // Rear pilot
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.15, -fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.15, fuseH * 0.2);
    _ctx.lineTo(-fuseLen * 0.02, fuseH * 0.15);
    _ctx.lineTo(-fuseLen * 0.02, -fuseH * 0.25);
    _ctx.closePath();
    _ctx.fill();
    // Glass highlights
    _ctx.fillStyle = glassHighlight;
    _ctx.beginPath();
    _ctx.moveTo(fuseLen * 0.38, 0);
    _ctx.lineTo(fuseLen * 0.42, fuseH * 0.1);
    _ctx.lineTo(fuseLen * 0.32, fuseH * 0.15);
    _ctx.lineTo(fuseLen * 0.3, 0);
    _ctx.closePath();
    _ctx.fill();

    // Armored canopy frames
    _ctx.fillStyle = darker;
    _ctx.fillRect(fuseLen * 0.32, -fuseH * 0.02, s * 0.02, fuseH * 0.22);
    _ctx.fillRect(fuseLen * 0.18, -fuseH * 0.18, s * 0.02, fuseH * 0.28);

    // F89 marking
    if (s >= 16) {
        _ctx.fillStyle = highlight;
        const markX = -fuseLen * 0.02;
        const markY = -fuseH * 0.15;
        const markW = Math.max(1, Math.floor(s * 0.06));
        const markH = Math.max(1, Math.floor(s * 0.02));
        // F
        _ctx.fillRect(markX, markY, markW, markH);
        _ctx.fillRect(markX, markY, Math.max(1, Math.floor(markW * 0.35)), markH * 4);
        _ctx.fillRect(markX, markY + markH * 2, Math.max(1, Math.floor(markW * 0.7)), markH);
        // 8
        _ctx.fillRect(markX + markW + markH, markY, markH, markH * 4);
        _ctx.fillRect(markX + markW + markH * 2, markY, markH, markH * 4);
        _ctx.fillRect(markX + markW + markH, markY + markH * 2, markH * 2, markH);
        // 9
        _ctx.fillRect(markX + markW + markH * 4, markY, markW, markH);
        _ctx.fillRect(markX + markW + markH * 4, markY + markH * 2, markW, markH);
        _ctx.fillRect(markX + markW + markH * 4, markY + markH * 3, Math.max(1, Math.floor(markW * 0.6)), markH);
        _ctx.fillRect(markX + markW + markH * 4 + markW - markH, markY, markH, markH * 4);
    }

    // Chin-mounted gun turret
    _ctx.fillStyle = weapon;
    _ctx.beginPath();
    _ctx.arc(fuseLen * 0.38, fuseH * 0.45, s * 0.1, 0, Math.PI * 2);
    _ctx.fill();
    // Gun barrel
    _ctx.fillStyle = weaponDark;
    _ctx.fillRect(fuseLen * 0.38, fuseH * 0.42, s * 0.22, s * 0.05);
    // Gun barrel tip
    _ctx.fillRect(fuseLen * 0.58, fuseH * 0.4, s * 0.04, s * 0.08);

    // Landing gear (fixed skids)
    _ctx.fillStyle = darker;
    // Skid struts
    _ctx.fillRect(fuseLen * 0.12, fuseH * 0.45, Math.max(1, s * 0.03), s * 0.2);
    _ctx.fillRect(-fuseLen * 0.18, fuseH * 0.45, Math.max(1, s * 0.03), s * 0.2);
    // Skid rails
    _ctx.fillRect(-fuseLen * 0.25, fuseH * 0.62, fuseLen * 0.5, skidH);

    // Main rotor disc (perspective ellipse)
    const rotorTime = performance.now() / 38;
    const rotorRadX = fuseLen * 0.72;
    const rotorRadY = fuseLen * 0.22;
    
    // Rotor blur disc
    _ctx.fillStyle = rotor;
    _ctx.globalAlpha = 0.25;
    _ctx.beginPath();
    _ctx.ellipse(0, -fuseH * 0.75, rotorRadX, rotorRadY, 0, 0, Math.PI * 2);
    _ctx.fill();
    
    // Rotor blades (4 blades)
    _ctx.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++) {
        const angle = rotorTime + (i * Math.PI / 2);
        const bx = Math.cos(angle) * rotorRadX;
        const by = Math.sin(angle) * rotorRadY;
        const bladeW = Math.max(2, Math.floor(s * 0.07));
        _ctx.fillRect(bx - bladeW / 2, -fuseH * 0.75 + by - 1, bladeW, 2);
    }
    _ctx.globalAlpha = 1.0;

    // Rotor hub/mast
    _ctx.fillStyle = darker;
    _ctx.fillRect(-s * 0.05, -fuseH * 0.88, s * 0.1, s * 0.15);
    _ctx.fillStyle = weapon;
    _ctx.beginPath();
    _ctx.arc(0, -fuseH * 0.9, s * 0.06, 0, Math.PI * 2);
    _ctx.fill();

    _ctx.restore();
}

export function drawTank(x, y, size, color, heading = 0, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // Colors - M1 Abrams-like military tank palette
    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 18), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 32), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 12), fogFactor, ambient, skyColor);
    const track = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
    const trackMid = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const trackHighlight = getSpriteColorWithFog('#3a3a3a', fogFactor, ambient, skyColor);
    const wheel = getSpriteColorWithFog('#252525', fogFactor, ambient, skyColor);
    const wheelHighlight = getSpriteColorWithFog('#404040', fogFactor, ambient, skyColor);
    const metal = getSpriteColorWithFog('#2a2a2a', fogFactor, ambient, skyColor);
    const metalDark = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);

    const relAngle = normalizeAngle(heading - _cameraAngle);
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Determine view type
    const showFront = sinRel > 0.7;
    const showBack = sinRel < -0.7;
    const showSide = !showFront && !showBack;
    const facingToward = cosRel < -0.5;

    if (showSide) {
    // Dimensions - proper tank proportions
    const hullLen = s * 1.2;
    const hullH = s * 0.22;
    const trackH = Math.max(3, Math.floor(s * 0.24));
    const trackLen = s * 1.3;
    const turretLen = s * 0.55;
    const turretH = s * 0.2;
    const gunLen = s * 0.6;
    const gunH = Math.max(2, Math.floor(s * 0.06));
    const wheelRad = Math.max(2, Math.floor(trackH * 0.38));
    const wheelCount = Math.max(3, Math.floor(s / 12));

    // Y positions (bottom-up)
    const trackY = iy - Math.floor(trackH * 0.3);
    const hullY = trackY - hullH + Math.floor(trackH * 0.15);
    const turretY = hullY - turretH + Math.floor(s * 0.04);

    // Track assembly (with visible road wheels)
    // Track base
    _ctx.fillStyle = track;
    _ctx.fillRect(ix - trackLen * 0.5, trackY, trackLen, trackH);
    
    // Track top highlight
    _ctx.fillStyle = trackHighlight;
    _ctx.fillRect(ix - trackLen * 0.5, trackY, trackLen, Math.max(1, Math.floor(trackH * 0.15)));
    
    // Track guards/fenders
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - trackLen * 0.52, trackY - Math.floor(s * 0.04), trackLen * 1.04, Math.floor(s * 0.05));

    // Road wheels (visible between track sections)
    const wheelSpacing = trackLen / (wheelCount + 1);
    for (let i = 1; i <= wheelCount; i++) {
        const wx = ix - trackLen * 0.5 + wheelSpacing * i;
        const wy = trackY + trackH * 0.5;
        
        // Wheel body
        _ctx.fillStyle = wheel;
        _ctx.beginPath();
        _ctx.arc(wx, wy, wheelRad, 0, Math.PI * 2);
        _ctx.fill();
        
        // Wheel highlight (top)
        _ctx.fillStyle = wheelHighlight;
        _ctx.beginPath();
        _ctx.arc(wx, wy - wheelRad * 0.3, wheelRad * 0.5, 0, Math.PI * 2);
        _ctx.fill();
        
        // Wheel hub
        _ctx.fillStyle = trackMid;
        _ctx.beginPath();
        _ctx.arc(wx, wy, wheelRad * 0.35, 0, Math.PI * 2);
        _ctx.fill();
    }

    // Drive sprocket (rear)
    _ctx.fillStyle = wheel;
    _ctx.beginPath();
    _ctx.arc(ix - trackLen * 0.42, trackY + trackH * 0.4, wheelRad * 0.9, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = wheelHighlight;
    _ctx.beginPath();
    _ctx.arc(ix - trackLen * 0.42, trackY + trackH * 0.3, wheelRad * 0.4, 0, Math.PI * 2);
    _ctx.fill();

    // Idler wheel (front)
    _ctx.fillStyle = wheel;
    _ctx.beginPath();
    _ctx.arc(ix + trackLen * 0.42, trackY + trackH * 0.4, wheelRad * 0.9, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.fillStyle = wheelHighlight;
    _ctx.beginPath();
    _ctx.arc(ix + trackLen * 0.42, trackY + trackH * 0.3, wheelRad * 0.4, 0, Math.PI * 2);
    _ctx.fill();

    // Hull (sloped armor like M1 Abrams)
    _ctx.fillStyle = base;
    _ctx.beginPath();
    _ctx.moveTo(ix + hullLen * 0.5, hullY + hullH);        // Front bottom
    _ctx.lineTo(ix + hullLen * 0.55, hullY + hullH * 0.3); // Front slope
    _ctx.lineTo(ix + hullLen * 0.4, hullY);                // Front top
    _ctx.lineTo(ix - hullLen * 0.45, hullY);               // Rear top
    _ctx.lineTo(ix - hullLen * 0.5, hullY + hullH);        // Rear bottom
    _ctx.closePath();
    _ctx.fill();

    // Hull top highlight
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(ix + hullLen * 0.4, hullY);
    _ctx.lineTo(ix - hullLen * 0.45, hullY);
    _ctx.lineTo(ix - hullLen * 0.35, hullY + hullH * 0.25);
    _ctx.lineTo(ix + hullLen * 0.3, hullY + hullH * 0.25);
    _ctx.closePath();
    _ctx.fill();

    // Hull side shadow
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - hullLen * 0.5, hullY + hullH * 0.6, hullLen, hullH * 0.4);

    // Turret (angular, modern design)
    _ctx.fillStyle = base;
    _ctx.beginPath();
    _ctx.moveTo(ix + turretLen * 0.5, turretY + turretH);      // Front bottom
    _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.4);// Front slope
    _ctx.lineTo(ix + turretLen * 0.4, turretY);                // Front top
    _ctx.lineTo(ix - turretLen * 0.5, turretY);                // Rear top
    _ctx.lineTo(ix - turretLen * 0.55, turretY + turretH);     // Rear bottom
    _ctx.closePath();
    _ctx.fill();

    // Turret top highlight
    _ctx.fillStyle = highlight;
    _ctx.beginPath();
    _ctx.moveTo(ix + turretLen * 0.35, turretY);
    _ctx.lineTo(ix - turretLen * 0.45, turretY);
    _ctx.lineTo(ix - turretLen * 0.35, turretY + turretH * 0.3);
    _ctx.lineTo(ix + turretLen * 0.25, turretY + turretH * 0.3);
    _ctx.closePath();
    _ctx.fill();

    // Turret side shadow
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - turretLen * 0.55, turretY + turretH * 0.65, turretLen * 1.1, turretH * 0.35);

    // Commander's hatch
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - turretLen * 0.15, turretY - Math.floor(s * 0.05), s * 0.15, Math.floor(s * 0.06));
    _ctx.fillStyle = metalDark;
    _ctx.fillRect(ix - turretLen * 0.12, turretY - Math.floor(s * 0.04), s * 0.09, Math.floor(s * 0.04));

    // Loader's hatch
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - turretLen * 0.4, turretY - Math.floor(s * 0.03), s * 0.1, Math.floor(s * 0.04));

    // Main gun mantlet
    _ctx.fillStyle = darker;
    _ctx.beginPath();
    _ctx.moveTo(ix + turretLen * 0.45, turretY + turretH * 0.25);
    _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.4);
    _ctx.lineTo(ix + turretLen * 0.55, turretY + turretH * 0.7);
    _ctx.lineTo(ix + turretLen * 0.45, turretY + turretH * 0.85);
    _ctx.closePath();
    _ctx.fill();

    // Main gun barrel (long, with thermal sleeve)
    const gunY = turretY + turretH * 0.45;
    _ctx.fillStyle = metal;
    _ctx.fillRect(ix + turretLen * 0.5, gunY, gunLen, gunH);
    // Thermal sleeve sections
    _ctx.fillStyle = metalDark;
    _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.15, gunY - 1, gunLen * 0.15, gunH + 2);
    _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.45, gunY - 1, gunLen * 0.15, gunH + 2);
    // Muzzle brake
    _ctx.fillStyle = metalDark;
    _ctx.fillRect(ix + turretLen * 0.5 + gunLen - s * 0.06, gunY - Math.floor(s * 0.02), s * 0.08, gunH + Math.floor(s * 0.04));
    // Bore evacuator
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix + turretLen * 0.5 + gunLen * 0.3, gunY - Math.floor(s * 0.015), s * 0.08, gunH + Math.floor(s * 0.03));

    // Coaxial machine gun
    _ctx.fillStyle = metalDark;
    _ctx.fillRect(ix + turretLen * 0.48, gunY + gunH + Math.floor(s * 0.02), s * 0.2, Math.max(1, Math.floor(s * 0.025)));

    // Smoke grenade launchers (side of turret)
    _ctx.fillStyle = metalDark;
    for (let i = 0; i < 3; i++) {
        _ctx.fillRect(ix + turretLen * 0.25 + i * s * 0.06, turretY + turretH * 0.15, s * 0.04, s * 0.08);
    }
    } else if (showFront) {
        // FRONT VIEW - hull front armor, gun pointing toward camera
        const bodyW = s * 0.9;
        const bodyH = s * 0.45;
        const turretW = s * 0.5;
        const turretH = s * 0.25;

        // Tracks (front view)
        _ctx.fillStyle = track;
        _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, bodyH * 0.35);
        _ctx.fillStyle = trackHighlight;
        _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, Math.max(1, bodyH * 0.08));

        // Hull block (sloped front armor)
        _ctx.fillStyle = base;
        _ctx.beginPath();
        _ctx.moveTo(ix - bodyW * 0.5, iy + bodyH * 0.15);
        _ctx.lineTo(ix - bodyW * 0.4, iy - bodyH * 0.25);
        _ctx.lineTo(ix + bodyW * 0.4, iy - bodyH * 0.25);
        _ctx.lineTo(ix + bodyW * 0.5, iy + bodyH * 0.15);
        _ctx.closePath();
        _ctx.fill();
        _ctx.fillStyle = highlight;
        _ctx.fillRect(ix - bodyW * 0.35, iy - bodyH * 0.2, bodyW * 0.7, bodyH * 0.12);

        // Turret
        _ctx.fillStyle = base;
        _ctx.fillRect(ix - turretW * 0.5, iy - bodyH * 0.5, turretW, turretH);
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - turretW * 0.4, iy - bodyH * 0.5, turretW * 0.8, turretH * 0.25);

        // Gun barrel facing camera (foreshortened - small circle)
        _ctx.fillStyle = metal;
        _ctx.beginPath();
        _ctx.arc(ix, iy - bodyH * 0.45, s * 0.06, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.fillStyle = metalDark;
        _ctx.beginPath();
        _ctx.arc(ix, iy - bodyH * 0.45, s * 0.03, 0, Math.PI * 2);
        _ctx.fill();

    } else if (showBack) {
        // BACK VIEW - engine deck, exhaust grilles
        const bodyW = s * 0.9;
        const bodyH = s * 0.45;
        const turretW = s * 0.5;
        const turretH = s * 0.25;

        // Tracks (back view)
        _ctx.fillStyle = track;
        _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, bodyH * 0.35);
        _ctx.fillStyle = trackHighlight;
        _ctx.fillRect(ix - bodyW * 0.6, iy + bodyH * 0.15, bodyW * 1.2, Math.max(1, bodyH * 0.08));

        // Hull block (rear - engine deck)
        _ctx.fillStyle = base;
        _ctx.fillRect(ix - bodyW * 0.5, iy - bodyH * 0.2, bodyW, bodyH * 0.45);
        _ctx.fillStyle = dark;
        _ctx.fillRect(ix - bodyW * 0.45, iy - bodyH * 0.15, bodyW * 0.9, bodyH * 0.35);

        // Exhaust grilles (prominent from back)
        _ctx.fillStyle = metalDark;
        _ctx.fillRect(ix - bodyW * 0.3, iy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.18);
        _ctx.fillRect(ix + bodyW * 0.08, iy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.18);

        // Turret
        _ctx.fillStyle = base;
        _ctx.fillRect(ix - turretW * 0.5, iy - bodyH * 0.5, turretW, turretH);
        _ctx.fillStyle = darker;
        _ctx.fillRect(ix - turretW * 0.4, iy - bodyH * 0.5, turretW * 0.8, turretH * 0.25);

        // Gun barrel pointing away (just the base visible)
        _ctx.fillStyle = metal;
        _ctx.fillRect(ix - s * 0.04, iy - bodyH * 0.55, s * 0.08, s * 0.08);
    }
}

export function drawBuilding(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 16);
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const height = Math.floor(s * 1.6);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const shadow = getSpriteColorWithFog(darkenColor(color, 30), fogFactor, ambient, skyColor);
    const highlight = getSpriteColorWithFog(lightenColor(color, 10), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog(darkenColor(color, 45), fogFactor, ambient, skyColor);
    const trim = getSpriteColorWithFog('#444444', fogFactor, ambient, skyColor);
    const windowDark = getSpriteColorWithFog('#223344', fogFactor, ambient, skyColor);
    const windowLit = getSpriteColorWithFog('#c9b46a', fogFactor, ambient, skyColor);

    // Base/ground plate
    _ctx.fillStyle = trim;
    _ctx.fillRect(ix - Math.floor(s * 0.48), iy - Math.floor(s * 0.08), Math.floor(s * 0.96), Math.floor(s * 0.12));

    // Main block (shadow side + front)
    _ctx.fillStyle = shadow;
    _ctx.fillRect(ix - Math.floor(s * 0.45), iy - height, Math.floor(s * 0.32), height - Math.floor(s * 0.08));
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(s * 0.1), iy - height, Math.floor(s * 0.55), height - Math.floor(s * 0.08));
    _ctx.fillStyle = highlight;
    _ctx.fillRect(ix + Math.floor(s * 0.42), iy - height, Math.floor(s * 0.05), height - Math.floor(s * 0.08));

    // Roof slab
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - Math.floor(s * 0.5), iy - height - Math.floor(s * 0.08), Math.floor(s * 1.0), Math.floor(s * 0.12));

    // Windows (blocky grid)
    const rows = 3;
    const cols = 2;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const wx = ix - Math.floor(s * 0.02) + col * Math.floor(s * 0.2);
            const wy = iy - height + Math.floor(s * 0.18) + row * Math.floor(s * 0.4);
            _ctx.fillStyle = Math.random() > 0.6 ? windowLit : windowDark;
            _ctx.fillRect(wx, wy, Math.floor(s * 0.14), Math.floor(s * 0.18));
        }
    }

    // Door
    _ctx.fillStyle = trim;
    _ctx.fillRect(ix + Math.floor(s * 0.08), iy - Math.floor(s * 0.34), Math.floor(s * 0.2), Math.floor(s * 0.26));
}

export function drawHangar(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 20);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog(darkenColor(color, 10), fogFactor, ambient, skyColor);

    // Main structure (large rectangular building)
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.7, iy - s * 0.4, s * 1.4, s * 0.8);

    // Curved roof (simplified as darker top section)
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - s * 0.7, iy - s * 0.5, s * 1.4, s * 0.15);

    // Large door opening (dark)
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.4, iy - s * 0.1, s * 0.8, s * 0.5);

    // Door frame
    _ctx.fillStyle = getSpriteColorWithFog(darkenColor(color, 15), fogFactor, ambient, skyColor);
    _ctx.fillRect(ix - s * 0.45, iy - s * 0.15, s * 0.05, s * 0.55);
    _ctx.fillRect(ix + s * 0.4, iy - s * 0.15, s * 0.05, s * 0.55);
}

export function drawControlTower(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 15);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const glass = getSpriteColorWithFog('#4a8aaa', fogFactor, ambient, skyColor);

    // Tower base (wider at bottom)
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.3, iy, s * 0.6, s * 0.4);

    // Tower shaft
    _ctx.fillRect(ix - s * 0.2, iy - s * 0.8, s * 0.4, s * 0.8);

    // Control room (wider top with windows)
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.4, iy - s * 1.2, s * 0.8, s * 0.4);

    // Windows (glass)
    _ctx.fillStyle = glass;
    _ctx.fillRect(ix - s * 0.35, iy - s * 1.1, s * 0.7, s * 0.2);

    // Antenna
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.05, iy - s * 1.5, s * 0.1, s * 0.3);
}

export function drawBarracks(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 18);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);
    const roof = getSpriteColorWithFog('#4a3a2a', fogFactor, ambient, skyColor);

    // Main building
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.6, iy - s * 0.25, s * 1.2, s * 0.5);

    // Roof
    _ctx.fillStyle = roof;
    _ctx.fillRect(ix - s * 0.65, iy - s * 0.35, s * 1.3, s * 0.12);

    // Windows (row of small dark rectangles)
    _ctx.fillStyle = dark;
    for (let i = 0; i < 4; i++) {
        _ctx.fillRect(ix - s * 0.45 + i * s * 0.25, iy - s * 0.15, s * 0.12, s * 0.15);
    }

    // Door
    _ctx.fillRect(ix - s * 0.08, iy + s * 0.05, s * 0.16, s * 0.2);
}

export function drawFuelDepot(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 15);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 30), fogFactor, ambient, skyColor);
    const warning = getSpriteColorWithFog('#8a4a2a', fogFactor, ambient, skyColor);

    // Large cylindrical tank (simplified as rounded rectangle)
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.3, s, s * 0.6);

    // Tank top (darker)
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.35, s, s * 0.1);

    // Warning stripe
    _ctx.fillStyle = warning;
    _ctx.fillRect(ix - s * 0.5, iy - s * 0.1, s, s * 0.08);

    // Pipes
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + s * 0.4, iy - s * 0.15, s * 0.2, s * 0.1);
    _ctx.fillRect(ix + s * 0.55, iy - s * 0.15, s * 0.05, s * 0.4);
}

export function drawHelipad(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 20);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const marking = getSpriteColorWithFog('#8a8a2a', fogFactor, ambient, skyColor);
    const darkEdge = getSpriteColorWithFog(darkenColor(color, 20), fogFactor, ambient, skyColor);

    const padW = s * 0.95;
    const padH = s * 0.35;

    // Pad surface (flattened ellipse to read as horizontal)
    _ctx.fillStyle = base;
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.5, padH * 0.5, 0, 0, Math.PI * 2);
    _ctx.fill();

    // Edge ring
    _ctx.strokeStyle = darkEdge;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.05));
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.48, padH * 0.48, 0, 0, Math.PI * 2);
    _ctx.stroke();

    // H marking (compressed vertically for perspective, centered on pad)
    const hHeight = padH * 0.55;
    const hWidth = Math.max(1, Math.floor(padW * 0.08));
    const hGap = padW * 0.18;
    const hBarH = Math.max(1, Math.floor(padH * 0.15));

    _ctx.fillStyle = marking;
    // Left vertical bar of H
    _ctx.fillRect(ix - hGap - hWidth / 2, iy - hHeight / 2, hWidth, hHeight);
    // Right vertical bar of H
    _ctx.fillRect(ix + hGap - hWidth / 2, iy - hHeight / 2, hWidth, hHeight);
    // Horizontal bar of H (centered)
    _ctx.fillRect(ix - hGap, iy - hBarH / 2, hGap * 2, hBarH);

    // Outer outline
    _ctx.strokeStyle = marking;
    _ctx.lineWidth = Math.max(1, Math.floor(s * 0.04));
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, padW * 0.43, padH * 0.43, 0, 0, Math.PI * 2);
    _ctx.stroke();
}

export function drawResupplyGlow(x, y, size, fogFactor = 0) {
    // Subtle pulsing glow effect for friendly resupply points
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const time = performance.now() / 1000;
    
    // Pulse between 0.15 and 0.35 alpha
    const pulse = 0.25 + Math.sin(time * 2) * 0.1;
    const alpha = Math.max(0.05, pulse * (1 - fogFactor * 0.7));
    
    // Glow radius slightly larger than helipad
    const glowRadius = size * 0.6;
    const glowHeight = size * 0.25;  // Flattened ellipse for ground perspective
    
    // Draw multiple overlapping ellipses for soft glow effect
    // Outer glow (faint, large)
    _ctx.globalAlpha = alpha * 0.4;
    _ctx.fillStyle = '#88ff88';
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 1.4, glowHeight * 1.4, 0, 0, Math.PI * 2);
    _ctx.fill();
    
    // Middle glow
    _ctx.globalAlpha = alpha * 0.6;
    _ctx.fillStyle = '#aaffaa';
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 1.1, glowHeight * 1.1, 0, 0, Math.PI * 2);
    _ctx.fill();
    
    // Inner glow (brighter, smaller)
    _ctx.globalAlpha = alpha * 0.8;
    _ctx.fillStyle = '#ccffcc';
    _ctx.beginPath();
    _ctx.ellipse(ix, iy, glowRadius * 0.8, glowHeight * 0.8, 0, 0, Math.PI * 2);
    _ctx.fill();
    
    // Reset alpha
    _ctx.globalAlpha = 1.0;
}

export function drawSAMSite(x, y, size, color, fogFactor = 0, ambient = 1, skyColor = 0xff8090e0) {
    _ctx.imageSmoothingEnabled = false;
    const s = Math.max(Math.floor(size), 14);
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const base = getSpriteColorWithFog(color, fogFactor, ambient, skyColor);
    const dark = getSpriteColorWithFog(darkenColor(color, 25), fogFactor, ambient, skyColor);
    const darker = getSpriteColorWithFog(darkenColor(color, 35), fogFactor, ambient, skyColor);
    const platform = getSpriteColorWithFog('#3a3a3a', fogFactor, ambient, skyColor);
    const platformEdge = getSpriteColorWithFog('#4a4a4a', fogFactor, ambient, skyColor);
    const tube = getSpriteColorWithFog('#1a1a1a', fogFactor, ambient, skyColor);
    const radar = getSpriteColorWithFog('#666666', fogFactor, ambient, skyColor);
    const cabinGlass = getSpriteColorWithFog('#335566', fogFactor, ambient, skyColor);

    // Base platform
    _ctx.fillStyle = platform;
    _ctx.fillRect(ix - Math.floor(s * 0.6), iy - Math.floor(s * 0.05), Math.floor(s * 1.2), Math.floor(s * 0.15));
    _ctx.fillStyle = platformEdge;
    _ctx.fillRect(ix - Math.floor(s * 0.6), iy - Math.floor(s * 0.05), Math.floor(s * 1.2), Math.max(1, Math.floor(s * 0.03)));

    // Chassis
    _ctx.fillStyle = darker;
    _ctx.fillRect(ix - Math.floor(s * 0.4), iy - Math.floor(s * 0.15), Math.floor(s * 0.8), Math.floor(s * 0.12));

    // Wheels (blocky)
    _ctx.fillStyle = tube;
    _ctx.fillRect(ix - Math.floor(s * 0.28), iy - Math.floor(s * 0.02), Math.floor(s * 0.12), Math.floor(s * 0.08));
    _ctx.fillRect(ix + Math.floor(s * 0.16), iy - Math.floor(s * 0.02), Math.floor(s * 0.12), Math.floor(s * 0.08));

    // Launcher box
    _ctx.fillStyle = base;
    _ctx.fillRect(ix - Math.floor(s * 0.3), iy - Math.floor(s * 0.45), Math.floor(s * 0.6), Math.floor(s * 0.32));
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + Math.floor(s * 0.22), iy - Math.floor(s * 0.45), Math.floor(s * 0.08), Math.floor(s * 0.32));

    // Missile tubes (2x2 squares)
    _ctx.fillStyle = tube;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            const tubeX = ix - Math.floor(s * 0.2) + col * Math.floor(s * 0.22);
            const tubeY = iy - Math.floor(s * 0.42) + row * Math.floor(s * 0.14);
            _ctx.fillRect(tubeX, tubeY, Math.floor(s * 0.08), Math.floor(s * 0.08));
        }
    }

    // Radar mast and blocky dish
    _ctx.fillStyle = platformEdge;
    _ctx.fillRect(ix - Math.floor(s * 0.52), iy - Math.floor(s * 0.7), Math.floor(s * 0.05), Math.floor(s * 0.35));
    _ctx.fillStyle = radar;
    _ctx.fillRect(ix - Math.floor(s * 0.56), iy - Math.floor(s * 0.78), Math.floor(s * 0.12), Math.floor(s * 0.08));

    // Cabin
    _ctx.fillStyle = dark;
    _ctx.fillRect(ix + Math.floor(s * 0.35), iy - Math.floor(s * 0.35), Math.floor(s * 0.2), Math.floor(s * 0.22));
    _ctx.fillStyle = cabinGlass;
    _ctx.fillRect(ix + Math.floor(s * 0.38), iy - Math.floor(s * 0.32), Math.floor(s * 0.14), Math.floor(s * 0.08));
}

export function lightenColor(color, amount) {
    const base = hexToRgb(color);
    return rgbToHex({
        r: Math.min(255, base.r + amount),
        g: Math.min(255, base.g + amount),
        b: Math.min(255, base.b + amount)
    });
}

export function darkenColor(color, amount) {
    const base = hexToRgb(color);
    return rgbToHex({
        r: Math.max(0, base.r - amount),
        g: Math.max(0, base.g - amount),
        b: Math.max(0, base.b - amount)
    });
}
