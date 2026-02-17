export default function todoList() {
    const form = document.querySelector('.addTask form');
    const taskInput = document.querySelector('.addTask form input');
    const taskDetailInput = document.querySelector('.addTask form textarea');
    const taskCheckbox = document.querySelector('.addTask form #check');
    const allTask = document.querySelector('.allTask');
    const searchInput = document.querySelector('.todo-search');
    const filterButtons = document.querySelectorAll('.todo-filter');
    const totalStat = document.querySelector('.todo-total');
    const importantStat = document.querySelector('.todo-important');
    const clearAllButton = document.querySelector('.todo-clear');

    if (!form || !taskInput || !taskDetailInput || !taskCheckbox || !allTask) return;

    function safeReadTasks() {
        try {
            const parsed = JSON.parse(localStorage.getItem('currentTask') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function escapeHTML(value) {
        const container = document.createElement('div');
        container.textContent = value;
        return container.innerHTML;
    }

    let currentTask = safeReadTasks();
    let activeFilter = 'all';
    let searchTerm = '';

    function persistTasks() {
        localStorage.setItem('currentTask', JSON.stringify(currentTask));
    }

    function matchesFilters(task) {
        const title = String(task.task || '').toLowerCase();
        const details = String(task.details || '').toLowerCase();
        const textMatch = !searchTerm || title.includes(searchTerm) || details.includes(searchTerm);
        const filterMatch = activeFilter === 'all' ? true : Boolean(task.imp);
        return textMatch && filterMatch;
    }

    function renderTask() {
        const importantCount = currentTask.filter((task) => Boolean(task.imp)).length;
        if (totalStat) totalStat.textContent = `Total: ${currentTask.length}`;
        if (importantStat) importantStat.textContent = `Important: ${importantCount}`;

        const visibleTasks = currentTask
            .map((task, index) => ({ task, index }))
            .filter(({ task }) => matchesFilters(task));

        if (!currentTask.length || !visibleTasks.length) {
            allTask.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started.</p>';
            persistTasks();
            return;
        }

        let sum = '';
        visibleTasks.forEach(({ task: elem, index: id }) => {
            const taskTitle = escapeHTML(String(elem.task || 'Untitled Task'));
            const taskDetails = escapeHTML(String(elem.details || 'No details'));
            const isImportant = Boolean(elem.imp);

            sum += `
        <div class="task">
            <h5>
                ${taskTitle}
                <span class="${isImportant}">imp</span>
            </h5>
            <details>
                <summary>View details</summary>
                <p>${taskDetails}</p>
            </details>
            <button type="button" data-task-id="${id}">Mark as completed</button>
        </div>
    `;
        });

        allTask.innerHTML = sum;
        persistTasks();
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const taskValue = taskInput.value.trim();
        const detailValue = taskDetailInput.value.trim();
        if (!taskValue || !detailValue) return;

        currentTask.push({
            task: taskValue,
            details: detailValue,
            imp: taskCheckbox.checked
        });

        renderTask();
        taskCheckbox.checked = false;
        taskInput.value = '';
        taskDetailInput.value = '';
    });

    allTask.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.tagName !== 'BUTTON') return;

        const taskId = Number(target.dataset.taskId);
        if (!Number.isInteger(taskId)) return;

        currentTask.splice(taskId, 1);
        renderTask();
    });

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;
            searchTerm = target.value.trim().toLowerCase();
            renderTask();
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter === 'important' ? 'important' : 'all';
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            renderTask();
        });
    });

    if (clearAllButton) {
        clearAllButton.addEventListener('click', () => {
            currentTask = [];
            renderTask();
        });
    }

    renderTask();
}
