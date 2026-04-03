import { statsManager } from '../utils/stats.js';

export default function IdeasList() {
    const form = document.querySelector('.addIdeas form');
    const ideaInput = document.querySelector('#idea-input');
    const allIdeas = document.querySelector('.allIdeas');
    const searchInput = document.querySelector('.idea-search');
    const clearButton = document.querySelector('.idea-clear');

    if (!form || !ideaInput || !allIdeas) return;

    function safeReadIdeas() {
        try {
            const parsed = JSON.parse(localStorage.getItem('currentIdeas') || '[]');
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

    let currentIdeas = safeReadIdeas();
    let searchTerm = '';

    function persistIdeas() {
        localStorage.setItem('currentIdeas', JSON.stringify(currentIdeas));
        statsManager.logActivity(); // Track activity for streak
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    }

    function renderIdeas() {
        const filteredIdeas = currentIdeas
            .filter(({ ideas }) => String(ideas || '').toLowerCase().includes(searchTerm));

        if (!currentIdeas.length || !filteredIdeas.length) {
            allIdeas.innerHTML = '<p class="empty-state">No ideas saved yet.</p>';
            return;
        }

        let sum = '';
        filteredIdeas.forEach((elem, index) => {
            sum += `
                <div class="task-item">
                    <div class="task-info">
                        <h5>${escapeHTML(String(elem.ideas || 'Untitled idea'))}</h5>
                    </div>
                    <button type="button" data-idea-id="${index}" class="btn-secondary">&times;</button>
                </div>
            `;
        });

        allIdeas.innerHTML = sum;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = ideaInput.value.trim();
        if (!value) return;

        currentIdeas.push({ ideas: value });
        persistIdeas();
        renderIdeas();
        ideaInput.value = '';
    });

    allIdeas.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.tagName !== 'BUTTON') return;

        const ideaId = Number(target.dataset.ideaId);
        if (!Number.isInteger(ideaId)) return;

        currentIdeas.splice(ideaId, 1);
        persistIdeas();
        renderIdeas();
    });

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;
            searchTerm = target.value.trim().toLowerCase();
            renderIdeas();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            currentIdeas = [];
            persistIdeas();
            renderIdeas();
        });
    }

    renderIdeas();
}
