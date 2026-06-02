import { statsManager } from '../utils/stats.js';

export default function pomodoroTimer() {
    const timeDisplay = document.querySelector('#timer-time-display');
    const phaseLabel = document.querySelector('#timer-label-phase');
    const sessionDisplay = document.querySelector('#timer-session-display');
    const progressRing = document.querySelector('#timer-progress-ring');
    
    const playPauseBtn = document.querySelector('#timer-play-pause');
    const resetBtn = document.querySelector('#timer-reset');
    const skipBtn = document.querySelector('#timer-skip');

    if (!timeDisplay || !progressRing || !playPauseBtn) return;

    // Config durations in seconds
    const DURATIONS = {
        WORK: 25 * 60,
        SHORT_BREAK: 5 * 60,
        LONG_BREAK: 15 * 60
    };

    // State Variables
    let state = {
        phase: 'WORK', // 'WORK', 'SHORT_BREAK', 'LONG_BREAK'
        sessionIndex: 1, // 1 to 4
        totalSeconds: DURATIONS.WORK,
        initialSeconds: DURATIONS.WORK,
        isRunning: false
    };

    let timerInterval = null;
    let focusTickCounter = 0;

    const CIRCUMFERENCE = 2 * Math.PI * 85; // ~534.07

    // Read stored state if any
    function loadTimerState() {
        const stored = localStorage.getItem('tracksy_pomodoro_state');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                state = { ...state, ...parsed };
                // Keep running state false on reload
                state.isRunning = false;
            } catch (e) {
                // Ignore
            }
        }
    }

    function saveTimerState() {
        localStorage.setItem('tracksy_pomodoro_state', JSON.stringify({
            phase: state.phase,
            sessionIndex: state.sessionIndex,
            totalSeconds: state.totalSeconds,
            initialSeconds: state.initialSeconds
        }));
    }

    // Play notification sound
    function playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const playSound = (freq, duration, delay) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
                osc.start(audioCtx.currentTime + delay);
                osc.stop(audioCtx.currentTime + delay + duration);
            };
            playSound(660, 0.15, 0);
            playSound(880, 0.25, 0.12);
        } catch (e) {
            // AudioContext not allowed or unsupported
        }
    }

    function updateUI() {
        // Display time MM:SS
        const mins = Math.floor(state.totalSeconds / 60);
        const secs = state.totalSeconds % 60;
        timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        // Phase Text
        if (state.phase === 'WORK') {
            phaseLabel.textContent = 'DEEP WORK';
            phaseLabel.style.color = 'var(--purple)';
        } else if (state.phase === 'SHORT_BREAK') {
            phaseLabel.textContent = 'SHORT BREAK';
            phaseLabel.style.color = 'var(--cyan)';
        } else {
            phaseLabel.textContent = 'LONG BREAK';
            phaseLabel.style.color = 'var(--green)';
        }

        // Sessions Display
        sessionDisplay.textContent = `Session ${state.sessionIndex} of 4`;

        // Progress Ring Arc
        const progress = state.totalSeconds / state.initialSeconds;
        // 0 offset means full ring, CIRCUMFERENCE offset means empty ring
        const offset = CIRCUMFERENCE * (1 - progress);
        progressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
        progressRing.style.strokeDashoffset = `${offset}`;

        // Play/Pause button icon
        const iconEl = playPauseBtn.querySelector('i');
        if (iconEl) {
            if (state.isRunning) {
                iconEl.setAttribute('data-lucide', 'pause');
                playPauseBtn.classList.add('playing');
            } else {
                iconEl.setAttribute('data-lucide', 'play');
                playPauseBtn.classList.remove('playing');
            }
            if (window.lucide) lucide.createIcons();
        }
    }

    function stepTimer() {
        if (state.totalSeconds > 0) {
            state.totalSeconds -= 1;

            if (state.phase === 'WORK') {
                focusTickCounter++;
                if (focusTickCounter >= 60) {
                    statsManager.addFocusMinutes(1);
                    focusTickCounter = 0;
                }
            }

            saveTimerState();
            updateUI();
        } else {
            // Completed current session!
            playBeep();
            
            if (state.phase === 'WORK') {
                // If finished Work session 4, take a Long Break, else Short Break
                if (state.sessionIndex === 4) {
                    state.phase = 'LONG_BREAK';
                    state.totalSeconds = DURATIONS.LONG_BREAK;
                } else {
                    state.phase = 'SHORT_BREAK';
                    state.totalSeconds = DURATIONS.SHORT_BREAK;
                }
            } else {
                // Completed a break, return to work and advance session
                state.phase = 'WORK';
                state.totalSeconds = DURATIONS.WORK;
                if (state.sessionIndex === 4) {
                    state.sessionIndex = 1; // loop back
                } else {
                    state.sessionIndex += 1;
                }
            }

            state.initialSeconds = state.totalSeconds;
            focusTickCounter = 0;
            state.isRunning = false;
            clearInterval(timerInterval);
            timerInterval = null;

            saveTimerState();
            updateUI();
        }
    }

    function togglePlay() {
        if (state.isRunning) {
            // Pause
            clearInterval(timerInterval);
            timerInterval = null;
            state.isRunning = false;
        } else {
            // Start
            state.isRunning = true;
            timerInterval = setInterval(stepTimer, 1000);
        }
        saveTimerState();
        updateUI();
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        state.isRunning = false;
        state.phase = 'WORK';
        state.totalSeconds = DURATIONS.WORK;
        state.initialSeconds = DURATIONS.WORK;
        state.sessionIndex = 1;
        focusTickCounter = 0;
        saveTimerState();
        updateUI();
    }

    function skipTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        state.isRunning = false;
        
        // Skip current phase
        if (state.phase === 'WORK') {
            if (state.sessionIndex === 4) {
                state.phase = 'LONG_BREAK';
                state.totalSeconds = DURATIONS.LONG_BREAK;
            } else {
                state.phase = 'SHORT_BREAK';
                state.totalSeconds = DURATIONS.SHORT_BREAK;
            }
        } else {
            state.phase = 'WORK';
            state.totalSeconds = DURATIONS.WORK;
            if (state.sessionIndex === 4) {
                state.sessionIndex = 1;
            } else {
                state.sessionIndex += 1;
            }
        }
        state.initialSeconds = state.totalSeconds;
        focusTickCounter = 0;
        saveTimerState();
        updateUI();
    }

    // Set up listeners
    playPauseBtn.addEventListener('click', togglePlay);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipTimer);

    // Initial Loading
    loadTimerState();
    updateUI();
}
