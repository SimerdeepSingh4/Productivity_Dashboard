import initDashboard from './components/dashboard.js';
import initProfile from './utils/profile.js';
import openFeatures from './components/features.js';
import todoList from './components/todo.js';
import dailyPlanner from './components/planner.js';
import pomodoroTimer from './components/pomodoro.js';
import IdeasList from './components/ideas.js';
import initCommandPalette from './components/commandCenter.js';
import motivationPage from './components/motivation.js';
import getWeather from './utils/weather.js';
import timeDate from './utils/time.js';

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Apply Theme (Defaults to dark theme to match screenshot style)
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', currentTheme);

    // Bootstrap Utilities
    timeDate();
    getWeather();
    initProfile();
    initDashboard();

    // Bootstrap Widgets & Modules
    openFeatures();
    todoList();
    dailyPlanner();
    pomodoroTimer();
    IdeasList();
    initCommandPalette();
    motivationPage();

    // Live clock updates every second
    setInterval(() => {
        timeDate();
    }, 1000);
});
