import initDashboard from './components/dashboard.js';
import initProfile from './utils/profile.js';
import openFeatures from './components/features.js';
import todoList from './components/todo.js';
import dailyPlanner from './components/planner.js';
import motivationPage from './components/motivation.js';
import pomodoroTimer from './components/pomodoro.js';
import IdeasList from './components/ideas.js';
import getWeather from './utils/weather.js';
import timeDate from './utils/time.js';
import changeTheme from './utils/theme.js';

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Utilities
    changeTheme();
    getWeather();
    timeDate();
    initProfile();
    initDashboard();

    // Features
    openFeatures();
    todoList();
    dailyPlanner();
    motivationPage();
    pomodoroTimer();
    IdeasList();

    // Mobile Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const sidebarOpen = document.querySelector('#sidebar-open');
    const sidebarClose = document.querySelector('#sidebar-close');

    if (sidebarOpen && sidebarOverlay && sidebarClose) {
        const toggleSidebar = (state) => {
            sidebar.classList.toggle('active', state);
            sidebarOverlay.classList.toggle('active', state);
        };

        sidebarOpen.addEventListener('click', () => toggleSidebar(true));
        sidebarClose.addEventListener('click', () => toggleSidebar(false));
        sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

        // Auto-close on navigation (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) toggleSidebar(false);
            });
        });
    }

    // Dynamic Updates
    setInterval(() => {
        timeDate();
    }, 1000); // 1-second interval for real-time clock
});
