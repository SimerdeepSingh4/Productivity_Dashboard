export const statsManager = {
    KEYS: {
        STREAK: 'equa_user_streak',
        LAST_ACTIVITY: 'equa_last_activity',
        FOCUS_MINUTES: 'equa_total_focus_minutes',
        COMPLETIONS: 'equa_historical_completions',
        FOCUS_HISTORY: 'equa_historical_focus'
    },

    logActivity() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastActivity = localStorage.getItem(this.KEYS.LAST_ACTIVITY);
        let streak = parseInt(localStorage.getItem(this.KEYS.STREAK) || '0');

        if (!lastActivity) {
            streak = 1;
        } else if (lastActivity !== today) {
            const lastDate = new Date(lastActivity);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak += 1;
            } else if (diffDays > 1) {
                streak = 1;
            }
        }

        localStorage.setItem(this.KEYS.LAST_ACTIVITY, today);
        localStorage.setItem(this.KEYS.STREAK, streak.toString());
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    },

    addFocusMinutes(mins = 1) {
        let total = parseInt(localStorage.getItem(this.KEYS.FOCUS_MINUTES) || '0');
        total += mins;
        localStorage.setItem(this.KEYS.FOCUS_MINUTES, total.toString());
        
        // Track daily focus history
        const today = new Date().toISOString().split('T')[0];
        const focusHist = JSON.parse(localStorage.getItem(this.KEYS.FOCUS_HISTORY) || '{}');
        focusHist[today] = (focusHist[today] || 0) + mins;
        localStorage.setItem(this.KEYS.FOCUS_HISTORY, JSON.stringify(focusHist));

        this.logActivity(); // Focus session counts as activity
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    },

    recordTaskCompletion() {
        const today = new Date().toISOString().split('T')[0];
        const completions = JSON.parse(localStorage.getItem(this.KEYS.COMPLETIONS) || '{}');
        completions[today] = (completions[today] || 0) + 1;
        localStorage.setItem(this.KEYS.COMPLETIONS, JSON.stringify(completions));
        
        this.logActivity();
        window.dispatchEvent(new CustomEvent('dataUpdate'));
    },

    getStats() {
        const streak = parseInt(localStorage.getItem(this.KEYS.STREAK) || '0');
        const focusMinutes = parseInt(localStorage.getItem(this.KEYS.FOCUS_MINUTES) || '0');
        const focusHours = (focusMinutes / 60).toFixed(1);

        // Also count total historical completions
        const completions = JSON.parse(localStorage.getItem(this.KEYS.COMPLETIONS) || '{}');
        const totalCompletions = Object.values(completions).reduce((sum, val) => sum + val, 0);

        return {
            streak,
            focusHours,
            totalCompletions
        };
    },

    getSparklineData(type) {
        const now = new Date();
        const history = [];
        
        // Get last 7 days ending today
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            if (type === 'focus') {
                const focusHist = JSON.parse(localStorage.getItem(this.KEYS.FOCUS_HISTORY) || '{}');
                const mins = focusHist[dateStr] || 0;
                history.push(mins / 60); // convert to hours
            } else {
                const completions = JSON.parse(localStorage.getItem(this.KEYS.COMPLETIONS) || '{}');
                history.push(completions[dateStr] || 0);
            }
        }
        
        // Scale values to fit SVG height of 40 and width of 120
        const maxVal = Math.max(1, ...history);
        
        const points = history.map((val, idx) => {
            const x = idx * 20; // 6 intervals of 20 = 120px
            const y = 35 - (val / maxVal) * 28; // Keep points within range [7, 35]
            return { x, y };
        });
        
        const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
        const fillPath = `${linePath} L 120,40 L 0,40 Z`;
        
        return { linePath, fillPath };
    }
};
