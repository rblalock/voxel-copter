// =====================================================================
// VoxelCopter — Audio System Module
// Extracted from game.html into a standalone module.
// All state access goes through the A (audio context) object.
// =====================================================================
(function() {
    'use strict';

    let A; // Audio context — set via init()
    let masterVolume = null;
    let sfxVolume = null;

    // ─── Audio Functions ───────────────────────────────────────────

    function initAudio() {
        try {
            A.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterVolume = A.audioCtx.createGain();
            sfxVolume = A.audioCtx.createGain();
            masterVolume.connect(A.audioCtx.destination);
            sfxVolume.connect(masterVolume);
            applyAudioSettings();
        } catch (e) {
            console.warn('Web Audio API not supported');
            A.soundEnabled = false;
        }
    }
    

    function initAudioOnInteraction() {
        if (!A.audioCtx) {
            initAudio();
        }
        if (A.audioCtx && A.audioCtx.state === 'suspended') {
            A.audioCtx.resume();
        }
    }
    

    function toggleSound() {
        A.soundEnabled = !A.soundEnabled;
        if (!A.soundEnabled) {
            stopRotorSound();
            stopWarningAlarm();
            stopWindSound();
        }
        if (A.soundEnabled) {
            if (A.gameState === A.GAME_STATES.PLAYING) {
                startRotorSound();
                startWindSound();
            }
        }
    }
    

    function applyAudioSettings() {
        if (!masterVolume || !sfxVolume) return;
        masterVolume.gain.value = A.settings.masterVolume;
        sfxVolume.gain.value = A.settings.sfxVolume;
    }
    

    function getNoiseBuffer() {
        if (A.noiseBuffer || !A.audioCtx) return A.noiseBuffer;
        const bufferSize = Math.floor(A.audioCtx.sampleRate * 2);
        const buffer = A.audioCtx.createBuffer(1, bufferSize, A.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        A.noiseBuffer = buffer;
        return A.noiseBuffer;
    }
    

    function startWindSound() {
        if (!A.soundEnabled || !A.audioCtx || A.windSource) return;
        const buffer = getNoiseBuffer();
        if (!buffer) return;
        A.windSource = A.audioCtx.createBufferSource();
        A.windFilter = A.audioCtx.createBiquadFilter();
        A.windGain = A.audioCtx.createGain();
        A.windSource.buffer = buffer;
        A.windSource.loop = true;
        A.windFilter.type = 'highpass';
        A.windFilter.frequency.value = 180;
        A.windGain.gain.value = 0;
        A.windSource.connect(A.windFilter);
        A.windFilter.connect(A.windGain);
        A.windGain.connect(sfxVolume);
        A.windSource.start();
    }
    

    function stopWindSound() {
        try {
            if (A.windSource) {
                A.windSource.stop();
                A.windSource.disconnect();
                A.windSource = null;
            }
            if (A.windFilter) {
                A.windFilter.disconnect();
                A.windFilter = null;
            }
            if (A.windGain) {
                A.windGain.disconnect();
                A.windGain = null;
            }
        } catch (e) {
            // Ignore errors
        }
    }
    

    function updateWindSound() {
        if (!A.windGain || !A.audioCtx) return;
        const maxSpeed = Math.max(0.01, A.HELI_PHYSICS.MAX_FORWARD_SPEED);
        const speedNorm = Math.min(1, Math.abs(A.camera.forwardSpeed) / maxSpeed);
        const targetGain = 0.02 + speedNorm * 0.12;
        const targetFilter = 180 + speedNorm * 1000;
        A.windGain.gain.setTargetAtTime(targetGain, A.audioCtx.currentTime, 0.08);
        if (A.windFilter) {
            A.windFilter.frequency.setTargetAtTime(targetFilter, A.audioCtx.currentTime, 0.08);
        }
    }
    

    function updateRotorSound() {
        if (!A.rotorOscillator || !A.rotorGain || !A.audioCtx) return;
        const maxSpeed = Math.max(0.01, A.HELI_PHYSICS.MAX_FORWARD_SPEED);
        const speedNorm = Math.min(1, Math.abs(A.camera.forwardSpeed) / maxSpeed);
        const climbNorm = Math.min(1, Math.abs(A.camera.verticalSpeed) / (A.CONFIG.CLIMB_SPEED || 1));
        const baseFreq = 38;
        const targetFreq = baseFreq * (1 + speedNorm * 0.6 + climbNorm * 0.4);
        const targetGain = 0.09 + speedNorm * 0.05 + climbNorm * 0.04;
        A.rotorOscillator.frequency.setTargetAtTime(targetFreq, A.audioCtx.currentTime, 0.07);
        A.rotorGain.gain.setTargetAtTime(targetGain, A.audioCtx.currentTime, 0.08);
        if (A.rotorLfo) {
            A.rotorLfo.frequency.setTargetAtTime(8 + speedNorm * 4, A.audioCtx.currentTime, 0.1);
        }
    }
    

    function startRotorSound() {
        // Don't play rotor sound in Delta (soldier) mode
        if (A.gameMode === A.GAME_MODES.DELTA) return;
        if (!A.soundEnabled || !A.audioCtx || A.rotorOscillator) return;
        
        try {
            // Create low-frequency "thwop thwop" helicopter rotor
            A.rotorOscillator = A.audioCtx.createOscillator();
            A.rotorGain = A.audioCtx.createGain();
            
            A.rotorOscillator.type = 'sawtooth';
            A.rotorOscillator.frequency.value = 40;  // Low frequency
            
            // Create modulation for "chopping" effect
            A.rotorLfo = A.audioCtx.createOscillator();
            const lfoGain = A.audioCtx.createGain();
            A.rotorLfo.frequency.value = 8;  // 8 Hz modulation (blade frequency)
            lfoGain.gain.value = 20;
            
            A.rotorLfo.connect(lfoGain);
            lfoGain.connect(A.rotorOscillator.frequency);
            
            A.rotorOscillator.connect(A.rotorGain);
            A.rotorGain.gain.value = 0.12;
            A.rotorGain.connect(sfxVolume);
            
            A.rotorOscillator.start();
            A.rotorLfo.start();
        } catch (e) {
            console.warn('Error starting rotor sound:', e);
        }
    }
    

    function stopRotorSound() {
        try {
            if (A.rotorOscillator) {
                A.rotorOscillator.stop();
                A.rotorOscillator.disconnect();
                A.rotorOscillator = null;
            }
            if (A.rotorLfo) {
                A.rotorLfo.stop();
                A.rotorLfo.disconnect();
                A.rotorLfo = null;
            }
            if (A.rotorGain) {
                A.rotorGain.disconnect();
                A.rotorGain = null;
            }
        } catch (e) {
            // Ignore errors when stopping
        }
    }
    

    function playMenuNavigateSound() { A.VVAudio.playMenuNavigateSound(A.audioProxy); }
    
    

    function playMenuConfirmSound() { A.VVAudio.playMenuConfirmSound(A.audioProxy); }
    
    

    function playAchievementSound() { A.VVAudio.playAchievementSound(A.audioProxy); }
    
    

    function playVictoryStinger() { A.VVAudio.playVictoryStinger(A.audioProxy); }
    
    

    function playDefeatStinger() { A.VVAudio.playDefeatStinger(A.audioProxy); }
    
    

    function playCannonSound() { A.VVAudio.playCannonSound(A.audioProxy); }
    
    

    function playRocketSound() { A.VVAudio.playRocketSound(A.audioProxy); }
    
    

    function playMissileSound() { A.VVAudio.playMissileSound(A.audioProxy); }
    
    

    function playExplosionSound(size = 'medium') { A.VVAudio.playExplosionSound(A.audioProxy, size); }
    
    

    function playHitSound() { A.VVAudio.playHitSound(A.audioProxy); }
    
    

    function playMissileWarningBeep() { A.VVAudio.playMissileWarningBeep(A.audioProxy); }
    
    

    function playDamageSound() { A.VVAudio.playDamageSound(A.audioProxy); }
    
    

    function playCountermeasureSound() { A.VVAudio.playCountermeasureSound(A.audioProxy); }
    function showMissileWarning() {
        A.missileWarning = true;
        A.missileWarningTime = 3000; // 3 seconds of warning
        startWarningAlarm();  // Start audio warning
    }
    

    function startWarningAlarm() {
        if (A.warningInterval || !A.soundEnabled) return;
        playMissileWarningBeep();
        A.warningInterval = setInterval(playMissileWarningBeep, 500);  // Beep every 500ms
    }
    

    function stopWarningAlarm() {
        if (A.warningInterval) {
            clearInterval(A.warningInterval);
            A.warningInterval = null;
        }
    }
    

    function updateMissileWarning(deltaTime) {
        if (A.missileWarning) {
            A.missileWarningTime -= deltaTime;
            if (A.missileWarningTime <= 0 || A.enemyProjectiles.length === 0) {
                A.missileWarning = false;
                stopWarningAlarm();  // Stop audio warning
            }
        }
    }
    

    // ─── Module Export ─────────────────────────────────────────

    window.GameAudio = {
        init: function(a) { A = a; },
        initAudio,
        initAudioOnInteraction,
        toggleSound,
        applyAudioSettings,
        getNoiseBuffer,
        startWindSound,
        stopWindSound,
        updateWindSound,
        updateRotorSound,
        startRotorSound,
        stopRotorSound,
        playMenuNavigateSound,
        playMenuConfirmSound,
        playAchievementSound,
        playVictoryStinger,
        playDefeatStinger,
        playCannonSound,
        playRocketSound,
        playMissileSound,
        playExplosionSound,
        playHitSound,
        playMissileWarningBeep,
        playDamageSound,
        playCountermeasureSound,
        startWarningAlarm,
        stopWarningAlarm,
        updateMissileWarning,
        showMissileWarning,
    };

})();
