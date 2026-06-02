export default function IdeasList() {
    const ideasGrid = document.querySelector('#ideas-card-grid');
    const searchInput = document.querySelector('#ideas-search-input');
    const addIdeaCard = document.querySelector('#btn-add-idea-card');
    
    // Note Modal Selectors
    const noteModal = document.querySelector('#modal-note');
    const noteForm = document.querySelector('#form-note');
    const noteEditId = document.querySelector('#note-edit-id');
    const noteTitleInput = document.querySelector('#note-title-input');
    const noteContentInput = document.querySelector('#note-content-input');
    const noteTagInput = document.querySelector('#note-tag-input');
    const modalCloseButtons = document.querySelectorAll('.modal-close[data-target="note"]');

    if (!ideasGrid || !noteModal || !noteForm) return;

    let ideas = [];

    // Relative time helper
    function getRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        const secs = Math.floor(diff / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    }

    function loadIdeas() {
        try {
            const raw = localStorage.getItem('tracksy_ideas');
            if (raw) {
                ideas = JSON.parse(raw);
            } else {
                // Check if old data format exists for compatibility
                const oldRaw = localStorage.getItem('currentIdeas');
                if (oldRaw) {
                    const oldIdeas = JSON.parse(oldRaw);
                    ideas = oldIdeas.map((i, idx) => ({
                        id: Date.now() + idx,
                        title: 'Captured Idea',
                        content: i.ideas || '',
                        tag: 'PRODUCT',
                        timestamp: Date.now()
                    }));
                    persistIdeas();
                } else {
                    // Seed layout ideas matching the screenshot
                    const now = Date.now();
                    ideas = [
                        {
                            id: 1,
                            title: 'Q3 Strategy Notes',
                            content: 'Key objectives for the next quarter including platform expansion..',
                            tag: 'STRATEGY',
                            timestamp: now - 2 * 60 * 60 * 1000 // 2h ago
                        },
                        {
                            id: 2,
                            title: 'New Feature Ideas',
                            content: 'Brainstorming sessions on AI-powered task automation..',
                            tag: 'PRODUCT',
                            timestamp: now - 24 * 60 * 60 * 1000 // 1d ago
                        },
                        {
                            id: 3,
                            title: 'Research: User Workflows',
                            content: 'Observational data from recent user testing sessions...',
                            tag: 'UX RESEARCH',
                            timestamp: now - 3 * 24 * 60 * 60 * 1000 // 3d ago
                        }
                    ];
                    persistIdeas();
                }
            }
        } catch (e) {
            ideas = [];
        }
    }

    function persistIdeas() {
        localStorage.setItem('tracksy_ideas', JSON.stringify(ideas));
        // Keep legacy sync
        localStorage.setItem('currentIdeas', JSON.stringify(ideas.map(i => ({
            ideas: `${i.title}: ${i.content}`
        }))));
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    function renderIdeas() {
        // Clear all elements except the "Add New Note" dotted card
        const cards = Array.from(ideasGrid.querySelectorAll('.idea-card'));
        cards.forEach(card => {
            if (card !== addIdeaCard) {
                ideasGrid.removeChild(card);
            }
        });

        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const filtered = ideas.filter(idea => 
            idea.title.toLowerCase().includes(searchTerm) || 
            idea.content.toLowerCase().includes(searchTerm) ||
            idea.tag.toLowerCase().includes(searchTerm)
        );

        filtered.forEach(idea => {
            const card = document.createElement('div');
            card.className = 'idea-card';
            card.dataset.id = idea.id;

            const tagClass = idea.tag.toLowerCase().replace(' ', '-');
            const timeStr = getRelativeTime(idea.timestamp);

            card.innerHTML = `
                <div class="idea-card-header">
                    <h4>${escapeHTML(idea.title)}</h4>
                    <p>${escapeHTML(idea.content)}</p>
                </div>
                <div class="idea-card-footer">
                    <span class="idea-tag tag-${tagClass}">${escapeHTML(idea.tag)}</span>
                    <span class="idea-time">${timeStr}</span>
                </div>
                <button type="button" class="icon-btn-lite btn-delete-idea" style="position: absolute; top: 12px; right: 12px; width: 22px; height: 22px;" title="Delete Note">
                    <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                </button>
            `;

            // Click on delete button
            const deleteBtn = card.querySelector('.btn-delete-idea');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ideas = ideas.filter(i => i.id !== idea.id);
                persistIdeas();
                renderIdeas();
            });

            // Click on card to Edit
            card.addEventListener('click', () => {
                openNoteModal(idea);
            });

            // Insert before the Add Note card
            ideasGrid.insertBefore(card, addIdeaCard);
        });

        if (window.lucide) lucide.createIcons();
    }

    // Modal Operations
    function openNoteModal(noteToEdit = null) {
        if (noteToEdit) {
            // Edit
            document.querySelector('#note-modal-title').textContent = 'Edit Note';
            noteEditId.value = noteToEdit.id;
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;
            noteTagInput.value = noteToEdit.tag;
        } else {
            // Create
            document.querySelector('#note-modal-title').textContent = 'Save Note';
            noteEditId.value = '';
            noteTitleInput.value = '';
            noteContentInput.value = '';
            noteTagInput.value = 'PRODUCT';
        }
        noteModal.style.display = 'flex';
        noteTitleInput.focus();
    }

    function closeNoteModal() {
        noteModal.style.display = 'none';
        noteForm.reset();
    }

    // Submit form
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const tag = noteTagInput.value;

        if (!title || !content) return;

        const editId = noteEditId.value;
        if (editId) {
            // Update
            const matched = ideas.find(i => String(i.id) === String(editId));
            if (matched) {
                matched.title = title;
                matched.content = content;
                matched.tag = tag;
                // keep original timestamp
            }
        } else {
            // Add new
            ideas.unshift({
                id: Date.now(),
                title,
                content,
                tag,
                timestamp: Date.now()
            });
        }

        persistIdeas();
        renderIdeas();
        closeNoteModal();
    });

    // Event hooks
    addIdeaCard.addEventListener('click', () => openNoteModal());
    modalCloseButtons.forEach(btn => btn.addEventListener('click', closeNoteModal));
    
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) closeNoteModal();
    });

    if (searchInput) {
        searchInput.addEventListener('input', renderIdeas);
    }

    // Run initial
    loadIdeas();
    renderIdeas();
}
