import { statsManager } from '../utils/stats.js';

export default function todoList() {
    const form = document.querySelector('.addTask form');
    const taskInput = document.querySelector('#task-input');
    const taskDetailInput = document.querySelector('#task-detail');
    const taskCheckbox = document.querySelector('#check');
    const allTask = document.querySelector('.allTask');
    const searchInput = document.querySelector('.todo-search');
    const filterButtons = document.querySelectorAll('.todo-filter');
    const clearAllButton = document.querySelector('.todo-clear');

    if (!form || !taskInput || !taskDetailInput || !allTask) return;

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
        statsManager.logActivity(); // Track activity for streak
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    }

    function matchesFilters(task) {
        const title = String(task.task || '').toLowerCase();
        const details = String(task.details || '').toLowerCase();
        const textMatch = !searchTerm || title.includes(searchTerm) || details.includes(searchTerm);
        const filterMatch = activeFilter === 'all' ? true : Boolean(task.imp);
        return textMatch && filterMatch;
    }

    function renderTask() {
        const visibleTasks = currentTask
            .map((task, index) => ({ task, index }))
            .filter(({ task }) => matchesFilters(task));

        if (!currentTask.length || !visibleTasks.length) {
            allTask.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started.</p>';
            return;
        }

        let sum = '';
        visibleTasks.forEach(({ task: elem, index: id }) => {
            const taskTitle = escapeHTML(String(elem.task || 'Untitled Task'));
            const isImportant = Boolean(elem.imp);

            sum += `
                <div class="task-item">
                    <div class="task-info">
                        <h5>
                            ${taskTitle}
                            ${isImportant ? '<span class="tag-important">IMP</span>' : ''}
                        </h5>
                    </div>
                    <button type="button" data-task-id="${id}" class="btn-secondary">Complete</button>
                </div>
            `;
        });

        allTask.innerHTML = sum;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const taskValue = taskInput.value.trim();
        const detailValue = taskDetailInput.value.trim();
        if (!taskValue) return;

        currentTask.push({
            task: taskValue,
            details: detailValue,
            imp: taskCheckbox ? taskCheckbox.checked : false
        });

        persistTasks();
        renderTask();
        if (taskCheckbox) taskCheckbox.checked = false;
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
        statsManager.recordTaskCompletion(); 
        persistTasks();
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
            persistTasks();
            renderTask();
        });
    }

    renderTask();
}
