import { statsManager } from '../utils/stats.js';

export default function pomodoroTimer() {
    const timerText = document.querySelector('.timer-text');
    const progressBar = document.querySelector('#tracker-progress');
    const startBtn = document.querySelector('.ctrl-btn.start');
    const pauseBtn = document.querySelector('.ctrl-btn.pause');
    const stopBtn = document.querySelector('.ctrl-btn.stop');
    
    if (!timerText) return;

    let isWorkSession = true;
    let workSeconds = 25 * 60;
    let breakSeconds = 5 * 60;
    let totalSeconds = workSeconds;
    let initialSeconds = workSeconds;
    let timerInterval = null;
    let isPaused = true;
    let focusTickCounter = 0;

    const ARC_LENGTH = 126; 

    function updateTimer() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (progressBar) {
            const progress = totalSeconds / initialSeconds;
            const offset = ARC_LENGTH * (1 - progress);
            progressBar.style.strokeDashoffset = offset;
        }
    }

    function startTimer() {
        if (timerInterval) return;
        isPaused = false;
        
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds -= 1;
                
                // Track focus time if in work session
                if (isWorkSession) {
                    focusTickCounter++;
                    if (focusTickCounter >= 60) {
                        statsManager.addFocusMinutes(1);
                        focusTickCounter = 0;
                    }
                }

                updateTimer();
                return;
            }

            isWorkSession = !isWorkSession;
            totalSeconds = isWorkSession ? workSeconds : breakSeconds;
            initialSeconds = totalSeconds;
            
            // Broadcast update for balance chart if needed
            window.dispatchEvent(new CustomEvent('dataUpdate'));
            updateTimer();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
    }

    function resetTimer() {
        pauseTimer();
        isWorkSession = true;
        totalSeconds = workSeconds;
        initialSeconds = workSeconds;
        updateTimer();
    }

    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startTimer();
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pauseTimer();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetTimer();
        });
    }

    updateTimer();
}
