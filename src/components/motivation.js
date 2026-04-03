export default function motivationPage() {
    // Dashboard Inspiration Bubble
    const inspirationBubble = document.querySelector('#insight-text');
    const refreshBtn = document.querySelector('#refresh-quote');
    
    // Overlay Selectors
    const motivationQuote = document.querySelector('.motivation-2');
    const motivationAuthor = document.querySelector('.motivation-3');
    const overlayRefresh = document.querySelector('.quote-refresh');
    const copyButton = document.querySelector('.quote-copy');

    async function fetchQuote() {
        const loadingMsg = 'Finding your inspiration...';
        if (inspirationBubble) inspirationBubble.textContent = loadingMsg;
        if (motivationQuote) motivationQuote.textContent = 'Loading...';
        
        try {
            const response = await fetch('https://random-quotes-freeapi.vercel.app/api/random');
            if (!response.ok) throw new Error('Failed to fetch quote');

            const data = await response.json();
            const quoteText = data.quote || 'Stay consistent. Progress compounds.';
            const author = data.author || 'Unknown';

            if (inspirationBubble) {
                inspirationBubble.innerHTML = `"${quoteText}" <br><small>— ${author}</small>`;
            }
            
            if (motivationQuote) motivationQuote.textContent = `"${quoteText}"`;
            if (motivationAuthor) motivationAuthor.textContent = `— ${author}`;
        } catch (error) {
            const errorMsg = 'Could not load inspiration right now. Stay focused!';
            if (inspirationBubble) inspirationBubble.textContent = errorMsg;
            if (motivationQuote) motivationQuote.textContent = errorMsg;
        }
    }

    if (refreshBtn) refreshBtn.addEventListener('click', fetchQuote);
    if (overlayRefresh) overlayRefresh.addEventListener('click', fetchQuote);

    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            const payload = `${motivationQuote.textContent} ${motivationAuthor.textContent}`;
            try {
                await navigator.clipboard.writeText(payload);
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1200);
            } catch (error) {
                copyButton.textContent = 'Failed';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Quote';
                }, 1200);
            }
        });
    }

    // Refresh once on start
    fetchQuote();
}
