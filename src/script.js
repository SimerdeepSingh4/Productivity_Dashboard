import openFeatures from './components/features.js';
import todoList from './components/todo.js';
import dailyPlanner from './components/planner.js';
import motivationPage from './components/motivation.js';
import pomodoroTimer from './components/pomodoro.js';
import IdeasList from './components/ideas.js';
import getWeather from './utils/weather.js';
import timeDate from './utils/time.js';
import changeTheme from './utils/theme.js';

changeTheme()
getWeather()
timeDate()
setInterval(() => {
    timeDate()
}, 1000);
openFeatures()
todoList()
dailyPlanner()
motivationPage()
pomodoroTimer()
IdeasList()
