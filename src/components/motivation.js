export default function motivationPage() {
    const quoteTextEl = document.querySelector('#dashboard-quote-text');
    const quoteAuthorEl = document.querySelector('#dashboard-quote-author');
    const refreshBtn = document.querySelector('#btn-refresh-quote-dashboard');

    if (!quoteTextEl || !quoteAuthorEl) return;

    const FALLBACK_QUOTES = [
        { quote: "Stay consistent. Progress compounds.", author: "Unknown" },
        { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
        { quote: "Your mind is for having ideas, not holding them.", author: "David Allen" },
        { quote: "Do not wait; the time will never be 'just right.'", author: "Napoleon Hill" },
        { quote: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" }
    ];

    function applyQuote(text, author) {
        quoteTextEl.textContent = `"${text}"`;
        quoteAuthorEl.textContent = `— ${author}`;
    }

    async function fetchQuote() {
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('spin-animation'); // visual cue
        }

        try {
            const response = await fetch('https://random-quotes-freeapi.vercel.app/api/random');
            if (!response.ok) throw new Error('API down');

            const data = await response.json();
            const text = data.quote || 'Stay consistent. Progress compounds.';
            const author = data.author || 'Unknown';

            // Cache quote
            localStorage.setItem('tracksy_cached_quote', JSON.stringify({ text, author }));
            applyQuote(text, author);
        } catch (error) {
            // Apply fallback
            const rand = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            applyQuote(rand.quote, rand.author);
        } finally {
            if (refreshBtn) {
                const icon = refreshBtn.querySelector('i');
                if (icon) icon.classList.remove('spin-animation');
            }
        }
    }

    // Refresh listener
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchQuote);
    }

    // Load from cache first for instant render, otherwise fetch
    const cached = localStorage.getItem('tracksy_cached_quote');
    if (cached) {
        try {
            const { text, author } = JSON.parse(cached);
            applyQuote(text, author);
        } catch (e) {
            fetchQuote();
        }
    } else {
        fetchQuote();
    }
}
