// client/src/stores/sidebarStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
    // Stato
    const isCollapsed = ref(false);

    // Recupera lo stato dal localStorage (se disponibile)
    try {
        const storedState = localStorage.getItem('sidebar_collapsed');
        if (storedState !== null) {
            isCollapsed.value = storedState === 'true';
        }
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }

    // Actions
    function toggle() {
        isCollapsed.value = !isCollapsed.value;

        // Salva lo stato nel localStorage
        try {
            localStorage.setItem('sidebar_collapsed', isCollapsed.value.toString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    return {
        isCollapsed,
        toggle,
    };
});
