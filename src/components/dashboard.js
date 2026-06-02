import { statsManager } from '../utils/stats.js';

export const dashboardManager = {
    update() {
        this.updateStats();
        this.updateCharts();
        this.updateGreeting();
    },

    updateGreeting() {
        const greetingEl = document.querySelector('#user-greeting');
        if (!greetingEl) return;

        // Fetch name from profile
        let name = 'User';
        try {
            const stored = localStorage.getItem('equa_user_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.name) name = parsed.name;
            }
        } catch (e) {}

        // Get greeting prefix based on local time
        const hour = new Date().getHours();
        let prefix = 'Good evening';
        if (hour < 12) {
            prefix = 'Good morning';
        } else if (hour < 18) {
            prefix = 'Good afternoon';
        }

        greetingEl.textContent = `${prefix}, ${name}`;
    },

    updateStats() {
        const stats = statsManager.getStats();
        
        const focusVal = document.querySelector('#stats-focus-val');
        const tasksVal = document.querySelector('#stats-tasks-val');
        const streakVal = document.querySelector('#stats-streak-val');

        if (focusVal) focusVal.textContent = stats.focusHours;
        if (tasksVal) tasksVal.textContent = stats.totalCompletions;
        if (streakVal) streakVal.textContent = `${stats.streak} Day Streak`;
    },

    updateCharts() {
        // Update Focus Sparkline
        const focusData = statsManager.getSparklineData('focus');
        const focusLine = document.querySelector('#focus-spark-line');
        const focusFill = document.querySelector('#focus-spark-fill');

        if (focusLine) focusLine.setAttribute('d', focusData.linePath);
        if (focusFill) focusFill.setAttribute('d', focusData.fillPath);

        // Update Tasks Sparkline
        const tasksData = statsManager.getSparklineData('tasks');
        const tasksLine = document.querySelector('#tasks-spark-line');
        const tasksFill = document.querySelector('#tasks-spark-fill');

        if (tasksLine) tasksLine.setAttribute('d', tasksData.linePath);
        if (tasksFill) tasksFill.setAttribute('d', tasksData.fillPath);
    }
};

export default function initDashboard() {
    // Run initial update
    dashboardManager.update();

    // Listen for data updates to refresh UI immediately
    window.addEventListener('dataUpdate', () => {
        dashboardManager.update();
    });

    window.addEventListener('profileUpdate', () => {
        dashboardManager.updateGreeting();
    });
}
