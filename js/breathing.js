// ==================== BREATHING EXERCISE FUNCTIONALITY ====================

// Breathing exercise state
let exerciseState = {
    isRunning: false,
    isPaused: false,
    duration: 0,
    remainingTime: 0,
    currentPhase: 'ready', // 'ready', 'inhale', 'hold', 'exhale'
    cycleTimer: null,
    countdownTimer: null,
    audioEnabled: true,
    audioContext: null,
    oscillator: null
};

// Breathing pattern timings (in seconds)
const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 1
};

// DOM elements
let exerciseSelection;
let breathingInterface;
let breathingCircle;
let breathingText;
let timeRemaining;
let pauseBtn;
let stopBtn;
let completionMessage;
let audioToggle;

// Initialize breathing exercise when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeBreathingExercise();
});

function initializeBreathingExercise() {
    // Get DOM elements
    exerciseSelection = document.getElementById('exercise-selection');
    breathingInterface = document.getElementById('breathing-interface');
    breathingCircle = document.getElementById('breathing-circle');
    breathingText = document.getElementById('breathing-text');
    timeRemaining = document.getElementById('time-remaining');
    pauseBtn = document.getElementById('pause-btn');
    stopBtn = document.getElementById('stop-btn');
    completionMessage = document.getElementById('completion-message');
    audioToggle = document.getElementById('audio-toggle');

    // Add event listeners
    setupEventListeners();
    
    // Initialize audio context (if supported)
    initializeAudio();
}

function setupEventListeners() {
    // Duration selection buttons
    const durationBtns = document.querySelectorAll('.duration-btn');
    durationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const duration = parseInt(this.dataset.duration);
            startExercise(duration);
        });
    });

    // Control buttons
    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopExercise);
    }

    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            resetToSelection();
        });
    }

    // Audio toggle
    if (audioToggle) {
        audioToggle.addEventListener('change', function() {
            exerciseState.audioEnabled = this.checked;
            if (!this.checked && exerciseState.oscillator) {
                stopCalmingSound();
            } else if (this.checked && exerciseState.isRunning) {
                playCalmingSound();
            }
        });
    }
}

function initializeAudio() {
    try {
        // Check if Web Audio API is supported
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
            exerciseState.audioContext = new AudioContext();
        }
    } catch (error) {
        console.log('Web Audio API not supported:', error);
        // Disable audio toggle if not supported
        if (audioToggle) {
            audioToggle.disabled = true;
            audioToggle.parentElement.style.opacity = '0.5';
        }
    }
}

function startExercise(duration) {
    exerciseState.duration = duration;
    exerciseState.remainingTime = duration;
    exerciseState.isRunning = true;
    exerciseState.isPaused = false;
    exerciseState.currentPhase = 'ready';

    // Hide selection, show interface
    if (exerciseSelection) exerciseSelection.style.display = 'none';
    if (breathingInterface) breathingInterface.style.display = 'block';
    if (completionMessage) completionMessage.style.display = 'none';

    // Start the exercise
    updateTimeDisplay();
    startBreathingCycle();
    startCountdownTimer();

    // Start calming sound if enabled
    if (exerciseState.audioEnabled) {
        playCalmingSound();
    }

    // Announce to screen readers
    announceToScreenReader(`Starting ${formatTime(duration)} breathing exercise`);
}

function startBreathingCycle() {
    if (!exerciseState.isRunning || exerciseState.isPaused) return;

    // Ready phase
    exerciseState.currentPhase = 'ready';
    updateBreathingText('Get Ready...');
    updateBreathingCircle('ready');

    setTimeout(() => {
        if (!exerciseState.isRunning || exerciseState.isPaused) return;
        inhalePhase();
    }, 2000);
}

function inhalePhase() {
    if (!exerciseState.isRunning || exerciseState.isPaused) return;

    exerciseState.currentPhase = 'inhale';
    updateBreathingText('Breathe In');
    updateBreathingCircle('inhale');

    exerciseState.cycleTimer = setTimeout(() => {
        if (!exerciseState.isRunning || exerciseState.isPaused) return;
        holdPhase();
    }, breathingPattern.inhale * 1000);
}

function holdPhase() {
    if (!exerciseState.isRunning || exerciseState.isPaused) return;

    exerciseState.currentPhase = 'hold';
    updateBreathingText('Hold');
    updateBreathingCircle('hold');

    exerciseState.cycleTimer = setTimeout(() => {
        if (!exerciseState.isRunning || exerciseState.isPaused) return;
        exhalePhase();
    }, breathingPattern.hold * 1000);
}

function exhalePhase() {
    if (!exerciseState.isRunning || exerciseState.isPaused) return;

    exerciseState.currentPhase = 'exhale';
    updateBreathingText('Breathe Out');
    updateBreathingCircle('exhale');

    exerciseState.cycleTimer = setTimeout(() => {
        if (!exerciseState.isRunning || exerciseState.isPaused) return;
        pausePhase();
    }, breathingPattern.exhale * 1000);
}

function pausePhase() {
    if (!exerciseState.isRunning || exerciseState.isPaused) return;

    exerciseState.currentPhase = 'pause';
    updateBreathingText('Rest');
    updateBreathingCircle('ready');

    exerciseState.cycleTimer = setTimeout(() => {
        if (!exerciseState.isRunning || exerciseState.isPaused) return;
        inhalePhase(); // Start next cycle
    }, breathingPattern.pause * 1000);
}

function updateBreathingText(text) {
    if (breathingText) {
        breathingText.textContent = text;
    }
}

function updateBreathingCircle(phase) {
    if (!breathingCircle) return;

    // Remove all phase classes
    breathingCircle.classList.remove('inhale', 'exhale', 'hold', 'ready');
    
    // Add current phase class
    switch (phase) {
        case 'inhale':
            breathingCircle.classList.add('inhale');
            break;
        case 'exhale':
            breathingCircle.classList.add('exhale');
            break;
        case 'hold':
        case 'ready':
        default:
            // No special class for hold/ready - returns to default size
            break;
    }
}

function startCountdownTimer() {
    exerciseState.countdownTimer = setInterval(() => {
        if (exerciseState.isPaused) return;
        
        exerciseState.remainingTime--;
        updateTimeDisplay();

        if (exerciseState.remainingTime <= 0) {
            completeExercise();
        }
    }, 1000);
}

function updateTimeDisplay() {
    if (timeRemaining) {
        timeRemaining.textContent = formatTime(exerciseState.remainingTime);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function togglePause() {
    if (!exerciseState.isRunning) return;

    if (exerciseState.isPaused) {
        // Resume
        exerciseState.isPaused = false;
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        
        // Resume breathing cycle based on current phase
        switch (exerciseState.currentPhase) {
            case 'inhale':
                inhalePhase();
                break;
            case 'hold':
                holdPhase();
                break;
            case 'exhale':
                exhalePhase();
                break;
            case 'pause':
                pausePhase();
                break;
            default:
                startBreathingCycle();
        }

        // Resume calming sound
        if (exerciseState.audioEnabled) {
            playCalmingSound();
        }

        announceToScreenReader('Exercise resumed');
    } else {
        // Pause
        exerciseState.isPaused = true;
        if (pauseBtn) pauseBtn.textContent = 'Resume';
        
        // Clear current cycle timer
        if (exerciseState.cycleTimer) {
            clearTimeout(exerciseState.cycleTimer);
        }

        // Update breathing elements for paused state
        updateBreathingText('Paused');
        updateBreathingCircle('ready');

        // Stop calming sound
        stopCalmingSound();

        announceToScreenReader('Exercise paused');
    }
}

function stopExercise() {
    // Clear timers
    if (exerciseState.cycleTimer) {
        clearTimeout(exerciseState.cycleTimer);
    }
    if (exerciseState.countdownTimer) {
        clearInterval(exerciseState.countdownTimer);
    }

    // Stop audio
    stopCalmingSound();

    // Reset state
    exerciseState.isRunning = false;
    exerciseState.isPaused = false;

    // Return to selection screen
    resetToSelection();

    announceToScreenReader('Exercise stopped');
}

function completeExercise() {
    // Clear timers
    if (exerciseState.cycleTimer) {
        clearTimeout(exerciseState.cycleTimer);
    }
    if (exerciseState.countdownTimer) {
        clearInterval(exerciseState.countdownTimer);
    }

    // Stop audio
    stopCalmingSound();

    // Update state
    exerciseState.isRunning = false;
    exerciseState.isPaused = false;

    // Show completion message
    if (completionMessage) {
        completionMessage.style.display = 'block';
        completionMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Update breathing elements
    updateBreathingText('Complete! 🌟');
    updateBreathingCircle('ready');

    announceToScreenReader('Breathing exercise completed! Well done.');
}

function resetToSelection() {
    // Hide interface and completion message
    if (breathingInterface) breathingInterface.style.display = 'none';
    if (completionMessage) completionMessage.style.display = 'none';
    
    // Show selection
    if (exerciseSelection) exerciseSelection.style.display = 'block';

    // Reset state
    exerciseState.isRunning = false;
    exerciseState.isPaused = false;
    exerciseState.remainingTime = 0;

    // Reset button text
    if (pauseBtn) pauseBtn.textContent = 'Pause';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playCalmingSound() {
    if (!exerciseState.audioContext || !exerciseState.audioEnabled) return;

    try {
        // Resume audio context if suspended
        if (exerciseState.audioContext.state === 'suspended') {
            exerciseState.audioContext.resume();
        }

        // Stop existing oscillator
        stopCalmingSound();

        // Create new oscillator for ambient sound
        exerciseState.oscillator = exerciseState.audioContext.createOscillator();
        const gainNode = exerciseState.audioContext.createGain();

        // Configure oscillator for calming ambient sound
        exerciseState.oscillator.type = 'sine';
        exerciseState.oscillator.frequency.setValueAtTime(220, exerciseState.audioContext.currentTime); // Low A note

        // Configure gain for subtle volume
        gainNode.gain.setValueAtTime(0, exerciseState.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, exerciseState.audioContext.currentTime + 0.5);

        // Connect and start
        exerciseState.oscillator.connect(gainNode);
        gainNode.connect(exerciseState.audioContext.destination);
        exerciseState.oscillator.start();

        // Add subtle frequency modulation for more natural sound
        const lfo = exerciseState.audioContext.createOscillator();
        const lfoGain = exerciseState.audioContext.createGain();
        
        lfo.frequency.setValueAtTime(0.1, exerciseState.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(5, exerciseState.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(exerciseState.oscillator.frequency);
        lfo.start();

    } catch (error) {
        console.log('Error playing calming sound:', error);
    }
}

function stopCalmingSound() {
    if (exerciseState.oscillator) {
        try {
            exerciseState.oscillator.stop();
        } catch (error) {
            console.log('Error stopping sound:', error);
        }
        exerciseState.oscillator = null;
    }
}

// Accessibility announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (exerciseState.isRunning) {
        switch (e.key) {
            case ' ':
            case 'p':
            case 'P':
                e.preventDefault();
                togglePause();
                break;
            case 'Escape':
                e.preventDefault();
                stopExercise();
                break;
        }
    }
});

// Prevent page from sleeping during exercise (if supported)
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
        } catch (error) {
            console.log('Wake lock request failed:', error);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log('Screen wake lock released');
    }
}

// Add wake lock management to exercise start/stop
const originalStartExercise = startExercise;
startExercise = function(duration) {
    requestWakeLock();
    originalStartExercise(duration);
};

const originalStopExercise = stopExercise;
stopExercise = function() {
    releaseWakeLock();
    originalStopExercise();
};

const originalCompleteExercise = completeExercise;
completeExercise = function() {
    releaseWakeLock();
    originalCompleteExercise();
};

// Release wake lock when page is hidden
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        releaseWakeLock();
    } else if (exerciseState.isRunning && !exerciseState.isPaused) {
        requestWakeLock();
    }
});

// Screen reader styles
const srOnlyStyles = `
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
`;

// Add screen reader styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = srOnlyStyles;
document.head.appendChild(styleSheet); 