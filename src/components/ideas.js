export default function IdeasList() {
    const form = document.querySelector('.addIdeas form');
    const ideaInput = document.querySelector('.addIdeas form input');
    const allIdeas = document.querySelector('.allIdeas');
    const searchInput = document.querySelector('.idea-search');
    const randomButton = document.querySelector('.idea-random');
    const highlight = document.querySelector('.idea-highlight');

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
    }

    function renderIdeas() {
        const filteredIdeas = currentIdeas
            .map((idea, index) => ({ idea, index }))
            .filter(({ idea }) => String(idea.ideas || '').toLowerCase().includes(searchTerm));

        if (!currentIdeas.length || !filteredIdeas.length) {
            allIdeas.innerHTML = '<p class="empty-state">No ideas saved yet.</p>';
            persistIdeas();
            return;
        }

        let sum = '';
        filteredIdeas.forEach(({ idea: elem, index: id }) => {
            sum += `
        <div class="ideas">
            <h5>${escapeHTML(String(elem.ideas || 'Untitled idea'))}</h5>
            <button type="button" data-idea-id="${id}" aria-label="Delete idea">X</button>
        </div>
    `;
        });

        allIdeas.innerHTML = sum;
        persistIdeas();
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = ideaInput.value.trim();
        if (!value) return;

        currentIdeas.push({ ideas: value });
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

    if (randomButton && highlight) {
        randomButton.addEventListener('click', () => {
            const source = currentIdeas.filter((idea) =>
                String(idea.ideas || '').toLowerCase().includes(searchTerm)
            );
            if (!source.length) {
                highlight.textContent = 'No matching ideas available.';
                return;
            }
            const choice = source[Math.floor(Math.random() * source.length)];
            highlight.textContent = `Random Pick: ${choice.ideas}`;
        });
    }

    renderIdeas();
}
