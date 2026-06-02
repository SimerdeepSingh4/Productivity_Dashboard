export default function initCommandPalette() {
    const trigger = document.querySelector('#search-trigger');
    const palette = document.querySelector('#modal-command-palette');
    const searchInput = document.querySelector('#palette-search-input');
    const closeBtn = document.querySelector('#btn-close-palette');
    const resultsContainer = document.querySelector('#palette-results');

    if (!trigger || !palette || !searchInput || !resultsContainer) return;

    let selectedIndex = 0;
    let currentItems = [];

    // Built-in commands
    const SYSTEM_COMMANDS = [
        {
            id: 'cmd-play-timer',
            icon: 'play',
            title: 'Start Focus Session',
            subtitle: 'Start Pomodoro count down',
            shortcut: '/start',
            action: () => {
                const playBtn = document.querySelector('#timer-play-pause');
                if (playBtn) playBtn.click();
            }
        },
        {
            id: 'cmd-reset-timer',
            icon: 'rotate-ccw',
            title: 'Reset Focus Session',
            subtitle: 'Reset Pomodoro timer',
            shortcut: '/reset',
            action: () => {
                const resetBtn = document.querySelector('#timer-reset');
                if (resetBtn) resetBtn.click();
            }
        },
        {
            id: 'cmd-new-task',
            icon: 'plus',
            title: 'Create New Task',
            subtitle: 'Open task creation modal',
            shortcut: '/task',
            action: () => {
                const btn = document.querySelector('#btn-new-task');
                if (btn) btn.click();
            }
        },
        {
            id: 'cmd-new-note',
            icon: 'file-text',
            title: 'Save New Note',
            subtitle: 'Open note creation modal',
            shortcut: '/note',
            action: () => {
                const card = document.querySelector('#btn-add-idea-card');
                if (card) card.click();
            }
        },
        {
            id: 'cmd-new-event',
            icon: 'calendar',
            title: 'Schedule Timeline Event',
            subtitle: 'Add item to planner timeline',
            shortcut: '/event',
            action: () => {
                const btn = document.querySelector('#btn-add-event');
                if (btn) btn.click();
            }
        },
        {
            id: 'cmd-toggle-theme',
            icon: 'sun',
            title: 'Toggle Color Theme',
            subtitle: 'Switch between light and dark modes',
            shortcut: '/theme',
            action: () => {
                const body = document.body;
                const current = body.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                body.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                
                // Dispatch event so theme toggle changes name
                window.dispatchEvent(new CustomEvent('dataUpdate'));
            }
        },
        {
            id: 'cmd-clear-data',
            icon: 'trash-2',
            title: 'Clear All Local Data',
            subtitle: 'Hard reset your application settings',
            shortcut: '/clear',
            action: () => {
                const logoutOverlay = document.querySelector('#modal-logout');
                if (logoutOverlay) logoutOverlay.style.display = 'flex';
            }
        }
    ];

    function openPalette() {
        palette.style.display = 'flex';
        searchInput.value = '';
        selectedIndex = 0;
        renderResults();
        setTimeout(() => searchInput.focus(), 50);
    }

    function closePalette() {
        palette.style.display = 'none';
    }

    function getTasks() {
        try {
            return JSON.parse(localStorage.getItem('tracksy_tasks') || '[]');
        } catch (e) {
            return [];
        }
    }

    function getIdeas() {
        try {
            return JSON.parse(localStorage.getItem('tracksy_ideas') || '[]');
        } catch (e) {
            return [];
        }
    }

    function renderResults() {
        resultsContainer.innerHTML = '';
        const value = searchInput.value.trim().toLowerCase();
        
        let matchingCommands = [];
        let matchingTasks = [];
        let matchingNotes = [];

        if (value === '') {
            // Show default commands list
            matchingCommands = SYSTEM_COMMANDS;
        } else {
            // Filter commands
            matchingCommands = SYSTEM_COMMANDS.filter(cmd => 
                cmd.title.toLowerCase().includes(value) || 
                cmd.subtitle.toLowerCase().includes(value) ||
                cmd.shortcut.includes(value)
            );

            // Filter tasks
            const tasks = getTasks();
            matchingTasks = tasks.filter(t => 
                t.title.toLowerCase().includes(value) || 
                (t.description && t.description.toLowerCase().includes(value))
            );

            // Filter notes
            const notes = getIdeas();
            matchingNotes = notes.filter(n => 
                n.title.toLowerCase().includes(value) || 
                n.content.toLowerCase().includes(value) ||
                n.tag.toLowerCase().includes(value)
            );
        }

        currentItems = [];

        // Build list of DOM items
        if (matchingCommands.length > 0) {
            const cmdTitle = document.createElement('div');
            cmdTitle.className = 'palette-section-title';
            cmdTitle.textContent = 'System Commands';
            resultsContainer.appendChild(cmdTitle);

            matchingCommands.forEach(cmd => {
                currentItems.push({
                    type: 'command',
                    data: cmd,
                    element: createItemNode(cmd.title, cmd.subtitle, cmd.shortcut)
                });
            });
        }

        if (matchingTasks.length > 0) {
            const taskTitle = document.createElement('div');
            taskTitle.className = 'palette-section-title';
            taskTitle.textContent = 'Tasks';
            resultsContainer.appendChild(taskTitle);

            matchingTasks.forEach(task => {
                currentItems.push({
                    type: 'task',
                    data: task,
                    element: createItemNode(task.title, `Focus Task — Priority: ${task.priority}`, task.completed ? 'Completed' : 'Active')
                });
            });
        }

        if (matchingNotes.length > 0) {
            const noteTitle = document.createElement('div');
            noteTitle.className = 'palette-section-title';
            noteTitle.textContent = 'Notes & Ideas';
            resultsContainer.appendChild(noteTitle);

            matchingNotes.forEach(note => {
                currentItems.push({
                    type: 'note',
                    data: note,
                    element: createItemNode(note.title, `Idea Board — Tag: ${note.tag}`, 'Note')
                });
            });
        }

        // If no results
        if (currentItems.length === 0) {
            resultsContainer.innerHTML = '<div class="palette-empty-state">No matching commands, tasks, or notes found.</div>';
            return;
        }

        // Append to container and highlight selected
        currentItems.forEach((item, index) => {
            if (index === selectedIndex) {
                item.element.classList.add('selected');
            }
            
            // Mouse click support
            item.element.addEventListener('click', () => {
                executeItemAction(item);
                closePalette();
            });

            resultsContainer.appendChild(item.element);
        });

        if (window.lucide) lucide.createIcons();
    }

    function createItemNode(title, subtitle, badge) {
        const node = document.createElement('div');
        node.className = 'palette-item';
        node.innerHTML = `
            <div class="palette-item-left">
                <div>
                    <strong>${title}</strong>
                    <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">${subtitle}</div>
                </div>
            </div>
            ${badge ? `<span class="palette-item-shortcut">${badge}</span>` : ''}
        `;
        return node;
    }

    function executeItemAction(item) {
        if (item.type === 'command') {
            item.data.action();
        } else if (item.type === 'task') {
            // Open task in edit modal
            const taskModal = document.querySelector('#modal-task');
            if (taskModal) {
                // Populate forms
                document.querySelector('#task-modal-title').textContent = 'Edit Task';
                document.querySelector('#task-edit-id').value = item.data.id;
                document.querySelector('#task-title-input').value = item.data.title;
                document.querySelector('#task-desc-input').value = item.data.description || '';
                document.querySelector('#task-priority-input').value = item.data.priority;
                document.querySelector('#task-due-input').value = item.data.due || '';
                taskModal.style.display = 'flex';
            }
        } else if (item.type === 'note') {
            // Open note in edit modal
            const noteModal = document.querySelector('#modal-note');
            if (noteModal) {
                document.querySelector('#note-modal-title').textContent = 'Edit Note';
                document.querySelector('#note-edit-id').value = item.data.id;
                document.querySelector('#note-title-input').value = item.data.title;
                document.querySelector('#note-content-input').value = item.data.content;
                document.querySelector('#note-tag-input').value = item.data.tag;
                noteModal.style.display = 'flex';
            }
        }
    }

    // Keyboard Listeners
    searchInput.addEventListener('keydown', (e) => {
        if (currentItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentItems[selectedIndex].element.classList.remove('selected');
            selectedIndex = (selectedIndex + 1) % currentItems.length;
            currentItems[selectedIndex].element.classList.add('selected');
            currentItems[selectedIndex].element.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentItems[selectedIndex].element.classList.remove('selected');
            selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
            currentItems[selectedIndex].element.classList.add('selected');
            currentItems[selectedIndex].element.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeItemAction(currentItems[selectedIndex]);
            closePalette();
        }
    });

    searchInput.addEventListener('input', () => {
        selectedIndex = 0;
        renderResults();
    });

    // Toggle Palette triggers
    trigger.addEventListener('click', openPalette);
    closeBtn?.addEventListener('click', closePalette);

    palette.addEventListener('click', (e) => {
        if (e.target === palette) closePalette();
    });

    // Global document listeners
    document.addEventListener('keydown', (e) => {
        // Open on Ctrl + K or Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
        }

        // Close on Esc
        if (e.key === 'Escape' && palette.style.display === 'flex') {
            closePalette();
        }
    });
}
