export default function openFeatures() {
    const navItems = document.querySelectorAll('.nav-item');
    const toolOverlays = document.querySelectorAll('.tool-overlay');
    const closeButtons = document.querySelectorAll('.btn-close');
    const dashboard = document.querySelector('.dashboard-overview');
    const profileBtn = document.querySelector('#open-profile');
    const logoutBtn = document.querySelector('.logout');
    const confirmLogoutBtn = document.querySelector('#confirm-logout');

    function closeAllOverlays() {
        toolOverlays.forEach(overlay => overlay.style.display = 'none');
        if (dashboard) dashboard.style.display = 'block';
        
        // Reset active state to Overview if everything is closed
        navItems.forEach(nav => nav.classList.remove('active'));
        const overview = document.querySelector('[data-view="dashboard"]');
        if (overview) overview.classList.add('active');
    }

    function openOverlay(viewId) {
        const overlay = document.querySelector(`#tool-${viewId}`);
        if (overlay) {
            toolOverlays.forEach(o => o.style.display = 'none');
            if (dashboard) dashboard.style.display = 'none';
            overlay.style.display = 'grid'; // Using grid for modal alignment
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const view = item.getAttribute('data-view');
            if (!view) return; // Skip if no view specified (e.g. logout/theme)

            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (view === 'dashboard') {
                closeAllOverlays();
            } else {
                openOverlay(view);
            }
        });
    });

    // Profile Trigger
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            openOverlay('profile');
        });
    }

    // Logout Confirmation
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openOverlay('logout');
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });
    }

    // Close Buttons
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllOverlays();
        });
    });

    // Close on backdrop click (optional but good)
    toolOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllOverlays();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllOverlays();
        }
    });

    // Special Dashboard Actions (e.g. "Plan Now" button)
    const planNowBtn = document.querySelector('#action-reschedule');
    if (planNowBtn) {
        planNowBtn.addEventListener('click', () => {
             openOverlay('planner');
             navItems.forEach(nav => nav.classList.remove('active'));
             document.querySelector('[data-view="planner"]')?.classList.add('active');
        });
    }

    // Global listener for other components to trigger a layout reset
    window.addEventListener('closeOverlays', closeAllOverlays);
}
