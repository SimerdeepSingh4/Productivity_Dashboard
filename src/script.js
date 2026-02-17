function openFeatures() {
    let allElems = document.querySelectorAll('.elem');
    let fullElemPage = document.querySelectorAll('.fullElem')
    let fullElemPageBackBtn = document.querySelectorAll('.fullElem .back')


    allElems.forEach(function (elem) {
        elem.addEventListener('click', function () {
            fullElemPage[elem.id].style.display = 'block'

        })
    })

    fullElemPageBackBtn.forEach(function (back) {
        back.addEventListener('click', function () {
            fullElemPage[back.id].style.display = 'none'
        })

    })
}

function todoList() {
    let form = document.querySelector(".addTask form")
    let taskInput = document.querySelector(".addTask form input")
    let taskDetailInput = document.querySelector(".addTask form textarea")
    let taskCheckbox = document.querySelector(".addTask form #check")

    let currentTask = []

    if (localStorage.getItem('currentTask')) {
        currentTask = JSON.parse(localStorage.getItem('currentTask'))
    } else {
        console.log("Task list is empty");
    }


    function addTask() {
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            currentTask.push({
                task: taskInput.value,
                details: taskDetailInput.value,
                imp: taskCheckbox.checked
            })
            renderTask()
            taskCheckbox.checked = 'false'
            taskInput.value = ''
            taskDetailInput.value = ''
        })
    }

    function renderTask() {
        localStorage.setItem('currentTask', JSON.stringify(currentTask))
        let allTask = document.querySelector('.allTask')


        let sum = ''

        currentTask.forEach((elem, id) => {
            sum += `
        <div class="task">
            <h5>
                ${elem.task}
                <span class="${elem.imp}">imp</span>
            </h5>

            <details>
                <summary>View details</summary>
                <p>${elem.details}</p>
            </details>

            <button id=${id}>Mark as completed</button>
        </div>
    `;
        });


        allTask.innerHTML = sum

        localStorage.setItem('currentTask', JSON.stringify(currentTask))

        document.querySelectorAll('.task button').forEach((btn) => {
            btn.addEventListener("click", (e) => {
                currentTask.splice(btn.id, 1)
                renderTask()
            })
        })
    }

    renderTask()
    addTask()


}

function dailyPlanner() {
    let dayPlanData = JSON.parse(localStorage.getItem('dayPlanData')) || {}
    let dayPlanner = document.querySelector('.day-planner')

    let hours = Array.from({ length: 18 }, (elem, idx) =>
        `${6 + idx}:00 - ${7 + idx}:00`
    )

    let sum = ''
    hours.forEach(function (elem, idx) {
        let savedData = dayPlanData[idx] || ''
        sum += `<div class="day-planner-time">
                <p>${elem}</p>
                <input id=${idx} type="text" placeholder="..." value =${savedData} >
            </div>`

    })
    dayPlanner.innerHTML = sum

    let dayPlannerInput = document.querySelectorAll('.day-planner input')

    dayPlannerInput.forEach(function (elem) {
        elem.addEventListener('change', () => {
            dayPlanData[elem.id] = elem.value
            console.log(dayPlanData);
            localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData))
        })

    })
}

function motivationPage() {
    let motivationQuote = document.querySelector('.motivation-2 h1')
    let motivationAuthor = document.querySelector('.motivation-3 h2')
    async function fetchQoute() {
        let response = await fetch(
            "https://random-quotes-freeapi.vercel.app/api/random"
        );
        let val = await response.json();

        motivationQuote.innerHTML = val.quote
        motivationAuthor.innerHTML = val.author


    }
    fetchQoute()
}

function pomodoroTimer() {
    let timer = document.querySelector('.pomo-timer h1')

    let startBtn = document.querySelector('.pomo-timer .start-timer')
    let pauseBtn = document.querySelector('.pomo-timer .pause-timer')
    let resetBtn = document.querySelector('.pomo-timer .reset-timer')
    let session = document.querySelector('.pomodoro-fullpage .session')

    let isWorkSession = true;


    let totalSeconds = 25 * 60


    let timerInterval = null;
    function updateTimer() {

        let minutes = Math.floor(totalSeconds / 60)
        let seconds = totalSeconds % 60

        timer.innerHTML = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    function startTimer() {
        clearInterval(timerInterval)
        if (isWorkSession) {
            timerInterval = setInterval(() => {
                if (totalSeconds > 0) {
                    totalSeconds--
                    updateTimer()
                } else {
                    isWorkSession = false
                    clearInterval(timerInterval)
                    timer.innerHTML = '05:00'
                    session.innerHTML = 'Take a Break'
                    session.style.backgroundColor = 'var(--blue)'
                    totalSeconds = 5 * 60;

                }
            }, 1000);
        } else {
            timerInterval = setInterval(() => {
                if (totalSeconds > 0) {
                    totalSeconds--
                    updateTimer()
                } else {
                    isWorkSession = true
                    clearInterval(timerInterval)
                    timer.innerHTML = '25:00'
                    session.innerHTML = 'Work Session'
                    session.style.backgroundColor = 'var(--green)'
                    totalSeconds = 25 * 60;

                }
            }, 1000);
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval)
    }

    function resetTimer() {
        clearInterval(timerInterval)
        totalSeconds = 25 * 60
        updateTimer()
    }

    startBtn.addEventListener('click', startTimer)
    pauseBtn.addEventListener('click', pauseTimer)
    resetBtn.addEventListener('click', resetTimer)

}

function IdeasList() {
    let form = document.querySelector(".addIdeas form")
    let ideaInput = document.querySelector(".addIdeas form input")

    let currentIdeas = []

    if (localStorage.getItem('currentIdeas')) {
        currentIdeas = JSON.parse(localStorage.getItem('currentIdeas'))
    } else {
        console.log("Ideas list is empty");
    }


    function addIdeas() {
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            currentIdeas.push({
                ideas: ideaInput.value,
            })
            renderIdeas()
            ideaInput.value = ''
        })
    }

    function renderIdeas() {
        localStorage.setItem('currentIdeas', JSON.stringify(currentIdeas))
        let allIdeas = document.querySelector('.allIdeas')


        let sum = ''

        currentIdeas.forEach((elem, id) => {
            sum += `
        <div class="ideas">
                        <h5>
                            ${elem.ideas}
                        </h5>
                        <button id="${id}">X</button>
                    </div>
    `;
        });


        allIdeas.innerHTML = sum

        localStorage.setItem('currentIdeas', JSON.stringify(currentIdeas))

        document.querySelectorAll('.ideas button').forEach((btn) => {
            btn.addEventListener("click", (e) => {
                currentIdeas.splice(btn.id, 1)
                renderIdeas()
            })
        })
    }

    renderIdeas()
    addIdeas()


}

let data = null;


async function getWeather() {
    let apiKey = "e14e105c8eb24b31b0a155937260201";
    let temp = document.querySelector(".temp");
    let condition = document.querySelector(".condition");
    let location = document.querySelector(".location");
    let icon = document.querySelector(".icon");
    let humidity = document.querySelector(".humidity");
    let wind = document.querySelector(".wind");
    let feelLike = document.querySelector(".feelLike");
    let pm2 = document.querySelector(".pm2");
    let uv = document.querySelector(".uv");
    let visibility = document.querySelector(".visibility");

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoRes.json();

        const city =
            geoData.address.city ||
            geoData.address.town ||
            geoData.address.county;

        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`

        );

        const data = await response.json();
        console.log(data);

        // icon.src = data.current.condition.icon;
        location.innerHTML = `${data.location.name}, ${data.location.region}`;
        temp.innerHTML = `${Math.floor(data.current.temp_c)}°C`;
        condition.innerHTML = data.current.condition.text;
        humidity.innerHTML = `Humidity: ${Math.floor(data.current.humidity)}`;
        wind.innerHTML = `Wind: ${Math.floor(
            data.current.wind_kph
        )}<span class="km">km/h</span> `;
        feelLike.innerHTML = `Feels Like: ${Math.floor(
            data.current.feelslike_c
        )}<span class="celcius">°C</span>`;
        pm2.innerHTML = `${Math.floor(data.current.air_quality.pm2_5)}`;
        uv.innerHTML = data.current.uv;
    });
}

getWeather();

function timeDate() {
    let dateH2 = document.querySelector(".date");
    let dayH1 = document.querySelector(".day");
    const totalDaysofWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const totalMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let daysOfWeek = totalDaysofWeek[date.getDay()]
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    let day = date.getDate();
    let month = totalMonths[date.getMonth()];
    let year = date.getFullYear();
    dateH2.innerHTML = `${day} ${month}, ${year}`
    if (hours >= 12) {
        dayH1.innerHTML = `${daysOfWeek}, ${hours-12}:${minutes}:${seconds} PM`
    } else {
        dayH1.innerHTML = `${daysOfWeek}, ${hours}:${minutes}:${seconds} AM`
    }

}

setInterval(() => {
    timeDate()
}, 1000);


openFeatures()
todoList()
dailyPlanner()
motivationPage()
pomodoroTimer()
IdeasList()
