export default function dailyPlanner() {
    const dayPlanner = document.querySelector('.day-planner');
    const fillButton = document.querySelector('.planner-fill');
    const clearButton = document.querySelector('.planner-clear');
    const exportButton = document.querySelector('.planner-export');

    if (!dayPlanner) return;

    function safeReadPlans() {
        try {
            const parsed = JSON.parse(localStorage.getItem('dayPlanData') || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    const dayPlanData = safeReadPlans();
    const hours = Array.from({ length: 14 }, (_, idx) => `${7 + idx}:00`);

    let debounceTimeout;
    function persistPlans() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData));
            window.dispatchEvent(new CustomEvent('dataUpdate'));
        }, 500); // 500ms debounce
    }

    function renderPlanner() {
        dayPlanner.innerHTML = '';
        hours.forEach((slot, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'planner-slot';

            const label = document.createElement('label');
            label.textContent = slot;

            const input = document.createElement('input');
            input.id = String(idx);
            input.type = 'text';
            input.placeholder = '...';
            input.value = String(dayPlanData[idx] || '');

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            dayPlanner.appendChild(wrapper);
        });
    }

    // Event delegation for inputs - moved OUT of render to avoid duplication
    dayPlanner.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        dayPlanData[target.id] = target.value;
        persistPlans();
    });

    if (fillButton) {
        fillButton.addEventListener('click', () => {
            const quickTemplate = {
                0: 'Wake up & morning routine',
                1: 'Deep Work Block 1',
                4: 'Lunch & walk',
                5: 'Deep Work Block 2',
                8: 'Workout / Reset',
                10: 'Plan for tomorrow'
            };
            Object.keys(quickTemplate).forEach((key) => {
                dayPlanData[key] = quickTemplate[key];
            });
            renderPlanner();
            persistPlans();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            Object.keys(dayPlanData).forEach((key) => {
                dayPlanData[key] = '';
            });
            renderPlanner();
            persistPlans();
        });
    }

    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const lines = hours.map((slot, idx) => `${slot}: ${dayPlanData[idx] || '---'}`);
            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'daily-plan.txt';
            anchor.click();
            URL.revokeObjectURL(url);
        });
    }

    renderPlanner();
}
