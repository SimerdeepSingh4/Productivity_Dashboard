export default function changeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const label = themeToggle.querySelector('span');

    let currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        }
        if (label) {
            label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        
        // Re-create lucide icons to show the new sun/moon
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    applyTheme(currentTheme);

    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    });
}
