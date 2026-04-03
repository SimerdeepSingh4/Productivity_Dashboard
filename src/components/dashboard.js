import { profileManager } from '../utils/profile.js';
import { statsManager } from '../utils/stats.js';

export const dashboardManager = {
    update() {
        this.updateStats();
        this.updateCharts();
        this.updateReminders();
        profileManager.apply();
        if (window.lucide) lucide.createIcons();
    },

    updateStats() {
        const tasks = JSON.parse(localStorage.getItem('currentTask') || '[]');
        const ideas = JSON.parse(localStorage.getItem('currentIdeas') || '[]');
        const sessionStats = statsManager.getStats();
        
        const taskStat = document.querySelector('#stat-tasks .stat-value');
        const projectStat = document.querySelector('#stat-projects .stat-value');
        const focusStat = document.querySelector('#stat-focus .stat-value');
        const streakStat = document.querySelector('#stat-streak .stat-value');

        if (taskStat) taskStat.textContent = tasks.length;
        if (projectStat) projectStat.textContent = ideas.length;
        if (focusStat) focusStat.textContent = `${sessionStats.focusHours}h`;
        if (streakStat) streakStat.textContent = `${sessionStats.streak} days`;
        
        // Also update the legend in the balance card
        const tasksLegend = document.querySelector('#completed-tasks-count');
        if (tasksLegend) tasksLegend.textContent = tasks.length;
    },

    updateCharts() {
        const tasks = JSON.parse(localStorage.getItem('currentTask') || '[]');
        const totalPossible = Math.max(10, tasks.length + 5); 
        const percent = Math.round((tasks.length / totalPossible) * 100);
        
        const balanceCircle = document.querySelector('#balance-circle');
        const balancePercent = document.querySelector('#balance-percent');
        
        if (balanceCircle) {
            const dash = (percent / 100) * 251;
            balanceCircle.style.strokeDasharray = `${dash} 251`;
        }
        if (balancePercent) balancePercent.textContent = `${percent}%`;

        // Real Trends based on last 7 days (Sun-Sat)
        const history = statsManager.getHistory(); // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        
        // Find max in history for better scaling (or use a default minimum of 5)
        const maxVal = Math.max(5, ...history);

        days.forEach((day, idx) => {
            const bar = document.querySelector(`#bar-${day}`);
            if (bar) {
                const count = history[idx];
                const height = Math.max(10, (count / maxVal) * 100);
                bar.style.height = `${height}%`;
                bar.title = `${count} tasks completed`;
            }
        });
    },

    reminderIndex: 0,
    activeReminders: [],
    isManuallyNavigating: false,

    updateReminders() {
        const plans = JSON.parse(localStorage.getItem('dayPlanData') || '{}');
        const now = new Date();
        const currentHour = now.getHours();

        this.activeReminders = Object.keys(plans)
            .filter(k => plans[k].trim() !== '')
            .map(k => ({
                slot: parseInt(k),
                text: plans[k],
                time: `${7 + parseInt(k)}:00`,
                hour: 7 + parseInt(k)
            }));

        const nameEl = document.querySelector('#reminder-name');
        const descEl = document.querySelector('#reminder-details');
        const timeEl = document.querySelector('.tag-time');

        if (this.activeReminders.length > 0) {
            // Find the most relevant reminder (the next one) if not manually navigating
            if (!this.isManuallyNavigating) {
                const nextIdx = this.activeReminders.findIndex(r => r.hour >= currentHour);
                this.reminderIndex = nextIdx !== -1 ? nextIdx : 0;
            }

            if (this.reminderIndex >= this.activeReminders.length) this.reminderIndex = 0;
            if (this.reminderIndex < 0) this.reminderIndex = this.activeReminders.length - 1;

            const current = this.activeReminders[this.reminderIndex];
            nameEl.textContent = current.text;
            descEl.textContent = current.hour <= currentHour ? "Happening now / In progress" : "Upcoming in your schedule";
            timeEl.textContent = current.time;
        } else {
            nameEl.textContent = "No tasks planned";
            descEl.textContent = "Your schedule is clear.";
            timeEl.textContent = "--:--";
        }
    },

    navigateReminders(direction) {
        if (this.activeReminders.length === 0) return;
        this.isManuallyNavigating = true;
        this.reminderIndex += direction;
        this.updateReminders();
    }
};

export default function initDashboard() {
    // Initial update and periodic refresh for time-relevance
    dashboardManager.update();
    setInterval(() => {
        // Only auto-update if not manually navigating, to preserve relevance
        dashboardManager.updateReminders();
    }, 60000);
    
    // Setup Reminder Navigation
    const prevBtn = document.querySelector('#prev-reminder');
    const nextBtn = document.querySelector('#next-reminder');
    
    prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dashboardManager.navigateReminders(-1);
    });
    
    nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dashboardManager.navigateReminders(1);
    });

    // Listen for events from other components - with debounce to stop UI jumping
    let updateTimeout;
    window.addEventListener('dataUpdate', () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            dashboardManager.update();
        }, 500); // 500ms debounce
    });
    window.addEventListener('storage', () => dashboardManager.update());
    window.addEventListener('profileUpdate', () => dashboardManager.update());
}
