export default function changeTheme() {
    const themeButton = document.querySelector('.theme');
    if (!themeButton) return;

    const themeLabel = themeButton.querySelector('h4');
    const themeNames = ['Cyber Blue', 'Neon Magenta', 'Matrix Mint'];

    let currentTheme = Number(localStorage.getItem('themeIndex') || 0);
    if (Number.isNaN(currentTheme) || currentTheme < 0 || currentTheme > 2) {
        currentTheme = 0;
    }

    function applyTheme(index) {
        document.body.dataset.theme = String(index);
        if (themeLabel) {
            themeLabel.textContent = `Theme: ${themeNames[index]}`;
        }
        localStorage.setItem('themeIndex', String(index));
    }

    applyTheme(currentTheme);

    themeButton.addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % themeNames.length;
        applyTheme(currentTheme);
    });
}
