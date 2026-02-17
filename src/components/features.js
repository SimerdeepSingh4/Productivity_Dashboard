export default function openFeatures() {
    const allElems = document.querySelectorAll('.elem');
    const fullElemPage = document.querySelectorAll('.fullElem');
    const fullElemPageBackBtn = document.querySelectorAll('.fullElem .back');

    if (!allElems.length || !fullElemPage.length) return;

    function closeAllPanels() {
        fullElemPage.forEach((panel) => {
            panel.style.display = 'none';
        });
    }

    allElems.forEach((elem) => {
        elem.addEventListener('click', () => {
            const panelIndex = Number(elem.id);
            if (!Number.isInteger(panelIndex) || !fullElemPage[panelIndex]) return;
            closeAllPanels();
            fullElemPage[panelIndex].style.display = 'block';
        });
    });

    fullElemPageBackBtn.forEach((back) => {
        back.addEventListener('click', () => {
            const panelIndex = Number(back.id);
            if (!Number.isInteger(panelIndex) || !fullElemPage[panelIndex]) return;
            fullElemPage[panelIndex].style.display = 'none';
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllPanels();
        }
    });
}
