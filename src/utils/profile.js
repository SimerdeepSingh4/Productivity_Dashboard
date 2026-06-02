const PROFILE_KEY = 'equa_user_profile';

export const profileManager = {
    get() {
        const defaultProfile = { name: 'Alex', seed: 'Alex' };
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
        if (greeting) {
            // Dashboard will handle the time-of-day greeting prefix,
            // but we can trigger a profile update event to keep it in sync.
        }
        
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
    const profileModal = document.querySelector('#modal-profile');
    const profileForm = document.querySelector('#form-profile');
    const randomizeBtn = document.querySelector('#change-avatar');
    const nameInput = document.querySelector('#user-name-input');

    if (!profileModal || !openBtn) return;

    profileManager.apply();

    // Bind form submit instead of button click
    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = nameInput.value.trim() || 'Alex';
        const { seed } = profileManager.get();
        profileManager.save({ name: newName, seed });
        
        // Close profile modal
        profileModal.style.display = 'none';
        
        // Custom event to notify dashboard
        window.dispatchEvent(new CustomEvent('profileUpdate'));
    });

    randomizeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const newSeed = Math.random().toString(36).substring(7);
        const { name } = profileManager.get();
        profileManager.save({ name, seed: newSeed });
    });
}
