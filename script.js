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
openFeatures()




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
todoList()