import { statsManager } from '../utils/stats.js';

export default function todoList() {
    const taskListContainer = document.querySelector('#focus-task-list');
    const taskCountBadge = document.querySelector('#focus-task-count');
    const cleanCompletedBtn = document.querySelector('#btn-clean-tasks');
    
    // Add/Edit Modal and Form
    const taskModal = document.querySelector('#modal-task');
    const taskForm = document.querySelector('#form-task');
    const btnNewTask = document.querySelector('#btn-new-task');
    const btnAddTaskInline = document.querySelector('#btn-add-task-inline');
    
    const taskEditId = document.querySelector('#task-edit-id');
    const taskTitleInput = document.querySelector('#task-title-input');
    const taskDescInput = document.querySelector('#task-desc-input');
    const taskPriorityInput = document.querySelector('#task-priority-input');
    const taskDueInput = document.querySelector('#task-due-input');
    const modalCloseButtons = document.querySelectorAll('.modal-close[data-target="task"]');
    const btnDeleteTask = document.querySelector('#btn-delete-task');

    if (!taskListContainer || !taskModal || !taskForm) return;

    let tasks = [];

    // Helper: Safe load from localStorage and migrate old data if needed
    function loadTasks() {
        try {
            const raw = localStorage.getItem('tracksy_tasks');
            if (raw) {
                tasks = JSON.parse(raw);
            } else {
                // Check if old data format exists for compatibility
                const oldRaw = localStorage.getItem('currentTask');
                if (oldRaw) {
                    const oldTasks = JSON.parse(oldRaw);
                    tasks = oldTasks.map((t, idx) => ({
                        id: Date.now() + idx,
                        title: t.task || 'Untitled Task',
                        description: t.details || '',
                        priority: t.imp ? 'high' : 'medium',
                        due: 'Due Tomorrow',
                        completed: false
                    }));
                    persistTasks();
                } else {
                    // Seed some default tasks if empty
                    tasks = [
                        {
                            id: 1,
                            title: 'Prepare Q3 Presentation',
                            description: 'Board meeting deck updates',
                            priority: 'high',
                            due: 'Due 2:00 PM',
                            completed: false
                        },
                        {
                            id: 2,
                            title: 'Review Design System',
                            description: 'Check new component specs',
                            priority: 'medium',
                            due: 'Due Tomorrow',
                            completed: false
                        },
                        {
                            id: 3,
                            title: 'Email Weekly Update',
                            description: 'Team sync summary',
                            priority: 'low',
                            due: 'Due Yesterday',
                            completed: true
                        }
                    ];
                    persistTasks();
                }
            }
        } catch (e) {
            tasks = [];
        }
    }

    function persistTasks() {
        localStorage.setItem('tracksy_tasks', JSON.stringify(tasks));
        // Also keep legacy sync if needed
        localStorage.setItem('currentTask', JSON.stringify(tasks.map(t => ({
            task: t.title,
            details: t.description,
            imp: t.priority === 'high'
        }))));
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    function renderTasks() {
        taskListContainer.innerHTML = '';
        const remainingCount = tasks.filter(t => !t.completed).length;
        
        // Update remaining count badge
        if (taskCountBadge) {
            taskCountBadge.textContent = remainingCount === 0 
                ? 'All caught up!' 
                : `${remainingCount} remaining`;
        }

        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p class="empty-state">No focus tasks today. Add one below!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-list-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            taskEl.dataset.id = task.id;

            // Priority Indicator Dot/Mark
            let priorityMark = '';
            if (task.priority === 'high') {
                priorityMark = '<span class="priority-icon-high" title="High Priority">!</span>';
            } else if (task.priority === 'medium') {
                priorityMark = '<span class="priority-dot-medium" title="Medium Priority"></span>';
            }

            taskEl.innerHTML = `
                <div class="task-checkbox-wrapper">
                    <div class="task-checker">
                        <i data-lucide="check"></i>
                    </div>
                </div>
                <div class="task-info-content">
                    <div class="task-title-line">
                        <h4>${escapeHTML(task.title)}</h4>
                        ${priorityMark}
                    </div>
                    ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
                    ${task.due ? `<span class="task-meta-tag"><i data-lucide="clock" style="width: 10px; height: 10px; margin-right: 2px;"></i> ${escapeHTML(task.due)}</span>` : ''}
                </div>
                <button type="button" class="icon-btn-lite btn-delete-task-row" title="Delete Task" style="flex-shrink: 0; align-self: center; margin-left: 12px;">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--red);"></i>
                </button>
            `;

            // Click listener for checking off tasks
            const checker = taskEl.querySelector('.task-checkbox-wrapper');
            checker.addEventListener('click', (e) => {
                e.stopPropagation();
                task.completed = !task.completed;
                if (task.completed) {
                    statsManager.recordTaskCompletion();
                }
                persistTasks();
                renderTasks();
            });

            // Click listener for row delete button
            const deleteBtn = taskEl.querySelector('.btn-delete-task-row');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering edit modal
                tasks = tasks.filter(t => t.id !== task.id);
                persistTasks();
                renderTasks();
            });

            // Click listener on body to EDIT task
            taskEl.addEventListener('click', () => {
                openTaskModal(task);
            });

            taskListContainer.appendChild(taskEl);
        });

        if (window.lucide) lucide.createIcons();
    }

    // Modal Operations
    function openTaskModal(taskToEdit = null) {
        if (taskToEdit) {
            // Edit Mode
            document.querySelector('#task-modal-title').textContent = 'Edit Task';
            taskEditId.value = taskToEdit.id;
            taskTitleInput.value = taskToEdit.title;
            taskDescInput.value = taskToEdit.description || '';
            taskPriorityInput.value = taskToEdit.priority;
            taskDueInput.value = taskToEdit.due || '';
            if (btnDeleteTask) btnDeleteTask.style.display = 'block';
        } else {
            // Create Mode
            document.querySelector('#task-modal-title').textContent = 'Create New Task';
            taskEditId.value = '';
            taskTitleInput.value = '';
            taskDescInput.value = '';
            taskPriorityInput.value = 'medium';
            taskDueInput.value = '';
            if (btnDeleteTask) btnDeleteTask.style.display = 'none';
        }
        taskModal.style.display = 'flex';
        taskTitleInput.focus();
    }

    function closeTaskModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
    }

    // Form Submit Handler
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const description = taskDescInput.value.trim();
        const priority = taskPriorityInput.value;
        const due = taskDueInput.value.trim();

        if (!title) return;

        const editId = taskEditId.value;
        if (editId) {
            // Update existing
            const task = tasks.find(t => String(t.id) === String(editId));
            if (task) {
                task.title = title;
                task.description = description;
                task.priority = priority;
                task.due = due;
            }
        } else {
            // Add new
            tasks.push({
                id: Date.now(),
                title,
                description,
                priority,
                due,
                completed: false
            });
            statsManager.logActivity();
        }

        persistTasks();
        renderTasks();
        closeTaskModal();
    });

    // Button Triggers
    btnNewTask?.addEventListener('click', () => openTaskModal());
    btnAddTaskInline?.addEventListener('click', () => openTaskModal());
    
    cleanCompletedBtn?.addEventListener('click', () => {
        // Remove completed tasks
        tasks = tasks.filter(t => !t.completed);
        persistTasks();
        renderTasks();
    });

    // Modal Delete Button Click
    btnDeleteTask?.addEventListener('click', () => {
        const editId = taskEditId.value;
        if (editId) {
            tasks = tasks.filter(t => String(t.id) !== String(editId));
            persistTasks();
            renderTasks();
            closeTaskModal();
        }
    });

    // Close buttons
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', closeTaskModal);
    });

    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeTaskModal();
    });

    // Listen for outside triggers (like Command Palette actions)
    window.addEventListener('openAddTaskModal', () => {
        openTaskModal();
    });

    // Load and Render
    loadTasks();
    renderTasks();
}
