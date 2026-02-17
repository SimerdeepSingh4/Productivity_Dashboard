export default function motivationPage() {
    const motivationQuote = document.querySelector('.motivation-2 h1');
    const motivationAuthor = document.querySelector('.motivation-3 h2');
    const refreshButton = document.querySelector('.quote-refresh');
    const copyButton = document.querySelector('.quote-copy');
    if (!motivationQuote || !motivationAuthor) return;

    async function fetchQuote() {
        motivationQuote.textContent = 'Loading...';
        motivationAuthor.textContent = '';
        try {
            const response = await fetch('https://random-quotes-freeapi.vercel.app/api/random');
            if (!response.ok) throw new Error('Failed to fetch quote');

            const data = await response.json();
            motivationQuote.textContent = data.quote || 'Stay consistent. Progress compounds.';
            motivationAuthor.textContent = data.author || 'Unknown';
        } catch (error) {
            motivationQuote.textContent = 'Could not load quote right now.';
            motivationAuthor.textContent = 'Try again in a moment.';
        }
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', fetchQuote);
    }

    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            const payload = `${motivationQuote.textContent} — ${motivationAuthor.textContent}`;
            try {
                await navigator.clipboard.writeText(payload);
                copyButton.textContent = 'Copied';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Quote';
                }, 1200);
            } catch (error) {
                copyButton.textContent = 'Copy Failed';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Quote';
                }, 1200);
            }
        });
    }

    fetchQuote();
}
