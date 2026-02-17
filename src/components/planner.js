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
    const hours = Array.from({ length: 18 }, (_, idx) => `${6 + idx}:00 - ${7 + idx}:00`);

    dayPlanner.innerHTML = '';
    hours.forEach((slot, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'day-planner-time';

        const label = document.createElement('p');
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

    function persistPlans() {
        localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData));
    }

    function updateInputsFromData() {
        dayPlanner.querySelectorAll('input').forEach((input) => {
            if (!(input instanceof HTMLInputElement)) return;
            input.value = String(dayPlanData[input.id] || '');
        });
    }

    let persistTimeout = null;
    dayPlanner.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        dayPlanData[target.id] = target.value;

        clearTimeout(persistTimeout);
        persistTimeout = setTimeout(() => {
            persistPlans();
        }, 250);
    });

    if (fillButton) {
        fillButton.addEventListener('click', () => {
            const quickTemplate = {
                0: 'Wake up and stretch',
                1: 'Deep work block',
                4: 'Lunch + short walk',
                5: 'Meetings / communication',
                8: 'Workout / reset',
                10: 'Review and plan tomorrow'
            };
            Object.keys(quickTemplate).forEach((key) => {
                dayPlanData[key] = quickTemplate[key];
            });
            updateInputsFromData();
            persistPlans();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            Object.keys(dayPlanData).forEach((key) => {
                dayPlanData[key] = '';
            });
            updateInputsFromData();
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
}
