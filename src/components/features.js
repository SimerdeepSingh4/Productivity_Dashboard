export default function openFeatures() {
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Trigger buttons
    const profileBtn = document.querySelector('#open-profile');
    const weatherBtn = document.querySelector('#open-weather');
    const themeToggleBtn = document.querySelector('#btn-theme-toggle');
    const historyBtn = document.querySelector('#btn-history');
    const confirmLogoutBtn = document.querySelector('#confirm-logout');

    // Open Modals
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            document.querySelector('#modal-profile').style.display = 'flex';
        });
    }

    if (weatherBtn) {
        weatherBtn.addEventListener('click', () => {
            document.querySelector('#modal-weather').style.display = 'flex';
        });
    }

    if (themeToggleBtn) {
        const syncThemeIcon = () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', currentTheme === 'dark' ? 'sun' : 'moon');
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        };

        // Sync initial state
        syncThemeIcon();

        // Listen for updates (from button click or command palette)
        themeToggleBtn.addEventListener('click', () => {
            const body = document.body;
            const current = body.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            syncThemeIcon();
            window.dispatchEvent(new CustomEvent('dataUpdate'));
        });

        window.addEventListener('dataUpdate', syncThemeIcon);
    }

    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            alert('📅 History Logs:\n\nFocus sessions and completed tasks are tracked automatically in local storage to power your productivity trends graphs.');
        });
    }

    // Close Modals Helper
    function closeAllModals() {
        modalOverlays.forEach(overlay => {
            // Don't close the command palette if it is handled separately, but closing everything is fine too
            overlay.style.display = 'none';
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) {
                const modal = document.querySelector(`#modal-${target}`);
                if (modal) modal.style.display = 'none';
            } else {
                closeAllModals();
            }
        });
    });

    // Backdrop Click
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });

    // Escape Key Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Confirm Logout Reset
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });
    }
}
