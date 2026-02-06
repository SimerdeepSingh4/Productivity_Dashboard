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

let form = document.querySelector(".addTask form")
let taskInput = document.querySelector(".addTask form input")
let taskDetailInput = document.querySelector(".addTask form textarea")
let taskCheckbox = document.querySelector(".addTask form #check")

let currentTask = []

if(localStorage.getItem('currentTask')){
    currentTask = JSON.parse(localStorage.getItem('currentTask'))
} else{
    console.log("Task list is empty");
}


function addTask(){
    form.addEventListener('submit', (e) => {
    e.preventDefault()
    currentTask.push({
        task: taskInput.value,
        details: taskDetailInput.value,
        imp: taskCheckbox.checked
    })
    localStorage.setItem('currentTask',JSON.stringify(currentTask))
    form.reset()
    renderTask()
})
}

function renderTask() {
    let allTask = document.querySelector('.allTask')


    let sum = ''

    currentTask.forEach((elem) => {
        sum += `<div class="task">
                        <h5>${elem.task} <span class=${elem.imp}>imp</span></h5>
                        <p>${elem.details}</p>
                        <button>Mark as completed</button>
                    </div>`
    })


    allTask.innerHTML = sum

}

renderTask()
addTask()

