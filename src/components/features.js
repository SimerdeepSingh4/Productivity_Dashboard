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
        const themeModal = document.querySelector('#modal-theme');
        const themeCards = document.querySelectorAll('.theme-card');

        const syncThemeSelection = () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            themeCards.forEach(card => {
                if (card.getAttribute('data-theme-val') === currentTheme) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        };

        // Open Theme Selection Modal
        themeToggleBtn.addEventListener('click', () => {
            if (themeModal) {
                syncThemeSelection();
                themeModal.style.display = 'flex';
            }
        });

        // Set Theme Card Clicks
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                const selectedTheme = card.getAttribute('data-theme-val');
                document.body.setAttribute('data-theme', selectedTheme);
                localStorage.setItem('theme', selectedTheme);
                syncThemeSelection();
                window.dispatchEvent(new CustomEvent('dataUpdate'));
            });
        });

        // React to external theme changes (like command palette cycling)
        window.addEventListener('dataUpdate', syncThemeSelection);
    }

    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            const historyModal = document.querySelector('#modal-history');
            const container = document.querySelector('#history-items-container');
            if (historyModal && container) {
                container.innerHTML = '';
                
                // Get historical data
                let focusHistory = {};
                let completionsHistory = {};
                try {
                    focusHistory = JSON.parse(localStorage.getItem('equa_focus_history') || localStorage.getItem('equa_historical_focus') || '{}');
                    completionsHistory = JSON.parse(localStorage.getItem('equa_historical_completions') || '{}');
                } catch (e) {
                    console.error("Failed to parse history data", e);
                }

                const now = new Date();
                let hasHistory = false;

                // Loop for the last 7 days
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    
                    const focusMins = focusHistory[dateStr] || 0;
                    const tasksDone = completionsHistory[dateStr] || 0;

                    if (focusMins > 0 || tasksDone > 0) {
                        hasHistory = true;
                    }

                    // Format date
                    const options = { weekday: 'long', month: 'short', day: 'numeric' };
                    const formattedDate = d.toLocaleDateString('en-US', options);

                    const focusHrs = (focusMins / 60).toFixed(1);

                    const itemRow = document.createElement('div');
                    itemRow.className = 'history-item-row';
                    itemRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--inner-bg); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px;';
                    itemRow.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${formattedDate}</span>
                            <span style="font-size: 11px; color: var(--text-muted);">${focusMins > 0 || tasksDone > 0 ? 'Active session logs' : 'No recorded activity'}</span>
                        </div>
                        <div style="display: flex; gap: 16px; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary);">
                                <i data-lucide="clock" style="width: 14px; height: 14px; color: var(--purple);"></i>
                                <span>${focusHrs} hrs</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary);">
                                <i data-lucide="check-circle" style="width: 14px; height: 14px; color: var(--green);"></i>
                                <span>${tasksDone} tasks</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(itemRow);
                }

                if (!hasHistory) {
                    container.innerHTML = '<p class="empty-state" style="text-align: center; color: var(--text-secondary); font-size: 13px; padding: 20px 0;">No productivity history found yet. Start tracking focus time or completing tasks!</p>';
                }

                if (window.lucide) {
                    lucide.createIcons();
                }

                historyModal.style.display = 'flex';
            }
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
