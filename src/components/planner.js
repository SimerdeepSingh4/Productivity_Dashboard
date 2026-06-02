export default function dailyPlanner() {
    const timelineContainer = document.querySelector('#timeline-container');
    const currentLine = document.querySelector('#timeline-current-line');
    const btnAddEvent = document.querySelector('#btn-add-event');
    
    // Modal Selectors
    const eventModal = document.querySelector('#modal-event');
    const eventForm = document.querySelector('#form-event');
    const eventEditId = document.querySelector('#task-edit-id'); // Note: index.html has event-edit-id inside form-event
    const eventTitleInput = document.querySelector('#event-title-input');
    const eventDescInput = document.querySelector('#event-desc-input');
    const eventStartSelect = document.querySelector('#event-start-input');
    const eventEndSelect = document.querySelector('#event-end-input');
    const eventColorSelect = document.querySelector('#event-color-input');
    const btnDeleteEvent = document.querySelector('#btn-delete-event');
    
    const modalCloseButtons = document.querySelectorAll('.modal-close[data-target="event"]');

    if (!timelineContainer || !eventModal || !eventForm) return;

    let events = [];

    // Helper: Parse hour float (e.g. "09:30" -> 9.5)
    function parseTimeToFloat(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h + m / 60;
    }

    // Helper: Format hour float back to string (e.g. 9.5 -> "09:30")
    function formatFloatToTime(val) {
        const h = Math.floor(val);
        const m = Math.round((val - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Generate dropdown options for times (7:00 AM to 8:00 PM)
    function populateDropdowns() {
        if (!eventStartSelect || !eventEndSelect) return;
        eventStartSelect.innerHTML = '';
        eventEndSelect.innerHTML = '';

        for (let i = 7.0; i <= 20.0; i += 0.5) {
            const timeStr = formatFloatToTime(i);
            const optStart = document.createElement('option');
            optStart.value = timeStr;
            optStart.textContent = timeStr;
            eventStartSelect.appendChild(optStart);

            const optEnd = document.createElement('option');
            optEnd.value = formatFloatToTime(i + 0.5);
            optEnd.textContent = formatFloatToTime(i + 0.5);
            eventEndSelect.appendChild(optEnd);
        }
    }

    function loadEvents() {
        try {
            const raw = localStorage.getItem('tracksy_events');
            if (raw) {
                events = JSON.parse(raw);
            } else {
                // Seed layout events matching the screenshot
                events = [
                    {
                        id: 1,
                        title: 'Morning Sync',
                        description: 'Design Team',
                        start: '09:00',
                        end: '10:00',
                        color: 'dark'
                    },
                    {
                        id: 2,
                        title: 'Deep Work Block',
                        description: 'No interruptions',
                        start: '10:00',
                        end: '11:30',
                        color: 'purple'
                    },
                    {
                        id: 3,
                        title: 'Review PRs',
                        description: 'GitHub reviews',
                        start: '11:30',
                        end: '12:30',
                        color: 'dark'
                    },
                    {
                        id: 4,
                        title: 'Lunch Break',
                        description: 'Offline break',
                        start: '13:00',
                        end: '14:00',
                        color: 'blue'
                    }
                ];
                persistEvents();
            }
        } catch (e) {
            events = [];
        }
    }

    function persistEvents() {
        localStorage.setItem('tracksy_events', JSON.stringify(events));
        // Sync with legacy planner data for compatibility
        const legacyPlan = {};
        events.forEach(ev => {
            const startHour = parseInt(ev.start.split(':')[0]);
            const legacyIdx = startHour - 7;
            if (legacyIdx >= 0 && legacyIdx < 14) {
                legacyPlan[legacyIdx] = `${ev.title} (${ev.description})`;
            }
        });
        localStorage.setItem('dayPlanData', JSON.stringify(legacyPlan));
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    }

    function updateTimeIndicator() {
        if (!currentLine) return;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMins = now.getMinutes();
        const decimalHour = currentHour + currentMins / 60;

        const startHour = 7.0;
        const endHour = 20.0;

        if (decimalHour >= startHour && decimalHour <= endHour) {
            const ratio = (decimalHour - startHour) / (endHour - startHour);
            // Position percentage in track
            currentLine.style.top = `${ratio * 100}%`;
            currentLine.style.display = 'block';
        } else {
            currentLine.style.display = 'none';
        }
    }

    function renderTimeline() {
        // Find existing rows and clear or rebuild them
        // We will rebuild the inner contents of timeline-track (retaining the current-line element)
        const track = timelineContainer.querySelector('.timeline-track');
        if (!track) return;

        // Clear everything EXCEPT currentLine
        const children = Array.from(track.children);
        children.forEach(child => {
            if (child !== currentLine) {
                track.removeChild(child);
            }
        });

        // 14 hours range: 7:00 AM to 8:00 PM
        for (let h = 7; h <= 20; h++) {
            const timeStr = `${String(h).padStart(2, '0')}:00`;
            const row = document.createElement('div');
            row.className = 'timeline-slot-row';
            row.dataset.hour = h;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'slot-time';
            timeSpan.textContent = timeStr;

            const blockContainer = document.createElement('div');
            blockContainer.className = 'slot-block-container';
            blockContainer.dataset.hour = h;

            // Find event starting in this hour slot
            const matchedEvent = events.find(ev => {
                const evStartHour = parseInt(ev.start.split(':')[0]);
                return evStartHour === h;
            });

            if (matchedEvent) {
                // Render Event Block
                const eventDiv = document.createElement('div');
                eventDiv.className = `event-block color-${matchedEvent.color}`;
                eventDiv.innerHTML = `
                    <div class="event-info">
                        <strong>${matchedEvent.title}</strong>
                        ${matchedEvent.description ? `<span class="event-details"> — ${matchedEvent.description}</span>` : ''}
                    </div>
                    <div class="event-time-range">${matchedEvent.start} - ${matchedEvent.end}</div>
                `;
                eventDiv.addEventListener('click', () => openEventModal(matchedEvent));
                blockContainer.appendChild(eventDiv);
            } else {
                // Render empty placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'event-placeholder';
                placeholder.addEventListener('click', () => {
                    const defaultStart = `${String(h).padStart(2, '0')}:00`;
                    openEventModal(null, defaultStart);
                });
                blockContainer.appendChild(placeholder);
            }

            row.appendChild(timeSpan);
            row.appendChild(blockContainer);
            track.appendChild(row);
        }

        updateTimeIndicator();
    }

    // Modal Operations
    const realEditId = document.querySelector('#event-edit-id'); // Hidden input
    
    function openEventModal(eventToEdit = null, defaultStart = null) {
        populateDropdowns();
        
        if (eventToEdit) {
            // Edit Mode
            document.querySelector('#event-modal-title').textContent = 'Edit Event';
            realEditId.value = eventToEdit.id;
            eventTitleInput.value = eventToEdit.title;
            eventDescInput.value = eventToEdit.description || '';
            eventStartSelect.value = eventToEdit.start;
            eventEndSelect.value = eventToEdit.end;
            eventColorSelect.value = eventToEdit.color;
            btnDeleteEvent.style.display = 'block';
        } else {
            // Create Mode
            document.querySelector('#event-modal-title').textContent = 'Schedule Event';
            realEditId.value = '';
            eventTitleInput.value = '';
            eventDescInput.value = '';
            eventStartSelect.value = defaultStart || '09:00';
            
            // Default end time to start time + 1 hour
            const startVal = parseTimeToFloat(eventStartSelect.value);
            eventEndSelect.value = formatFloatToTime(startVal + 1);
            
            eventColorSelect.value = 'dark';
            btnDeleteEvent.style.display = 'none';
        }
        eventModal.style.display = 'flex';
        eventTitleInput.focus();
    }

    function closeEventModal() {
        eventModal.style.display = 'none';
        eventForm.reset();
    }

    // Form Submit
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = eventTitleInput.value.trim();
        const description = eventDescInput.value.trim();
        const start = eventStartSelect.value;
        const end = eventEndSelect.value;
        const color = eventColorSelect.value;

        if (!title) return;

        // Validation: end time must be after start time
        if (parseTimeToFloat(end) <= parseTimeToFloat(start)) {
            alert('End time must be after start time.');
            return;
        }

        const editId = realEditId.value;
        if (editId) {
            // Update
            const matched = events.find(ev => String(ev.id) === String(editId));
            if (matched) {
                matched.title = title;
                matched.description = description;
                matched.start = start;
                matched.end = end;
                matched.color = color;
            }
        } else {
            // Create
            events.push({
                id: Date.now(),
                title,
                description,
                start,
                end,
                color
            });
        }

        persistEvents();
        renderTimeline();
        closeEventModal();
    });

    // Delete Event Handler
    btnDeleteEvent.addEventListener('click', () => {
        const editId = realEditId.value;
        if (editId) {
            events = events.filter(ev => String(ev.id) !== String(editId));
            persistEvents();
            renderTimeline();
            closeEventModal();
        }
    });

    // Event hooks
    btnAddEvent?.addEventListener('click', () => openEventModal());
    modalCloseButtons.forEach(btn => btn.addEventListener('click', closeEventModal));
    
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });

    // Run tick updates every 30 seconds
    setInterval(updateTimeIndicator, 30000);

    // Run initial loads
    loadEvents();
    renderTimeline();
}
