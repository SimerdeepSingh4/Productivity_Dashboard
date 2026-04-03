const PROFILE_KEY = 'equa_user_profile';

export const profileManager = {
    get() {
        const defaultProfile = { name: 'User', seed: 'Alex' };
        try {
            const stored = localStorage.getItem(PROFILE_KEY);
            return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
        } catch (e) {
            return defaultProfile;
        }
    },
    save(data) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        this.apply();
    },
    apply() {
        const { name, seed } = this.get();
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        
        // Update all name instances
        const greeting = document.querySelector('#user-greeting');
        if (greeting) greeting.textContent = `Hello, ${name}!`;
        
        const nameInput = document.querySelector('#user-name-input');
        if (nameInput) nameInput.value = name;

        // Update all avatar instances
        const avatars = document.querySelectorAll('#user-avatar, #edit-avatar');
        avatars.forEach(img => {
            img.src = avatarUrl;
        });
    }
};

export default function initProfile() {
    const openBtn = document.querySelector('#open-profile');
    const profileModal = document.querySelector('#tool-profile');
    const saveBtn = document.querySelector('#save-profile');
    const randomizeBtn = document.querySelector('#change-avatar');
    const nameInput = document.querySelector('#user-name-input');

    if (!profileModal || !openBtn) return;

    profileManager.apply();

    openBtn.addEventListener('click', () => {
        profileModal.style.display = 'grid';
    });

    randomizeBtn?.addEventListener('click', () => {
        const newSeed = Math.random().toString(36).substring(7);
        const { name } = profileManager.get();
        profileManager.save({ name, seed: newSeed });
    });

    saveBtn?.addEventListener('click', () => {
        const newName = nameInput.value.trim() || 'User';
        const { seed } = profileManager.get();
        profileManager.save({ name: newName, seed });
        
        // Use global closer to reset layout
        window.dispatchEvent(new CustomEvent('closeOverlays'));
        
        // Custom event to notify dashboard
        window.dispatchEvent(new CustomEvent('profileUpdate'));
    });
}
