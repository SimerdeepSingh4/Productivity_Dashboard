export default function pomodoroTimer() {
    const timer = document.querySelector('.pomo-timer h1');
    const startBtn = document.querySelector('.pomo-timer .start-timer');
    const pauseBtn = document.querySelector('.pomo-timer .pause-timer');
    const resetBtn = document.querySelector('.pomo-timer .reset-timer');
    const session = document.querySelector('.pomodoro-fullpage .session');
    const workMinutesInput = document.querySelector('.work-minutes');
    const breakMinutesInput = document.querySelector('.break-minutes');
    const applyDurationButton = document.querySelector('.apply-duration');
    const completedCycles = document.querySelector('.completed-cycles');

    if (!timer || !startBtn || !pauseBtn || !resetBtn || !session) return;

    let isWorkSession = true;
    let workSeconds = 25 * 60;
    let breakSeconds = 5 * 60;
    let totalSeconds = workSeconds;
    let timerInterval = null;
    let cycleCount = 0;

    function updateTimer() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateSessionUI() {
        if (isWorkSession) {
            session.textContent = 'Work Session';
            session.style.backgroundColor = 'var(--green)';
        } else {
            session.textContent = 'Take a Break';
            session.style.backgroundColor = 'var(--blue)';
        }
        if (completedCycles) {
            completedCycles.textContent = `Completed Cycles: ${cycleCount}`;
        }
    }

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds -= 1;
                updateTimer();
                return;
            }

            isWorkSession = !isWorkSession;
            if (isWorkSession) {
                cycleCount += 1;
            }
            totalSeconds = isWorkSession ? workSeconds : breakSeconds;
            updateSessionUI();
            updateTimer();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function resetTimer() {
        pauseTimer();
        isWorkSession = true;
        totalSeconds = workSeconds;
        cycleCount = 0;
        updateSessionUI();
        updateTimer();
    }

    if (applyDurationButton && workMinutesInput && breakMinutesInput) {
        applyDurationButton.addEventListener('click', () => {
            const workValue = Number(workMinutesInput.value);
            const breakValue = Number(breakMinutesInput.value);

            if (!Number.isFinite(workValue) || !Number.isFinite(breakValue)) return;
            workSeconds = Math.min(120, Math.max(1, Math.floor(workValue))) * 60;
            breakSeconds = Math.min(60, Math.max(1, Math.floor(breakValue))) * 60;

            resetTimer();
        });
    }

    updateSessionUI();
    updateTimer();
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
}
