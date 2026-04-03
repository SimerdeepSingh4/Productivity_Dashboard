export const statsManager = {
    KEYS: {
        STREAK: 'equa_user_streak',
        LAST_ACTIVITY: 'equa_last_activity',
        FOCUS_MINUTES: 'equa_total_focus_minutes',
        COMPLETIONS: 'equa_historical_completions'
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
        this.logActivity(); // Focus session counts as activity
    },

    recordTaskCompletion() {
        const today = new Date().toISOString().split('T')[0];
        const completions = JSON.parse(localStorage.getItem(this.KEYS.COMPLETIONS) || '{}');
        completions[today] = (completions[today] || 0) + 1;
        localStorage.setItem(this.KEYS.COMPLETIONS, JSON.stringify(completions));
        this.logActivity();
    },

    getHistory() {
        const completions = JSON.parse(localStorage.getItem(this.KEYS.COMPLETIONS) || '{}');
        const history = [];
        const now = new Date();
        
        // Get last 7 days starting from Sunday
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - now.getDay());
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            history.push(completions[dateStr] || 0);
        }
        
        return history;
    },

    getStats() {
        const streak = parseInt(localStorage.getItem(this.KEYS.STREAK) || '0');
        const focusMinutes = parseInt(localStorage.getItem(this.KEYS.FOCUS_MINUTES) || '0');
        const focusHours = (focusMinutes / 60).toFixed(1);

        return {
            streak,
            focusHours: focusHours.endsWith('.0') ? Math.round(focusHours) : focusHours
        };
    }
};
