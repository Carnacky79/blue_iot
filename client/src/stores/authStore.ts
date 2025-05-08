// client/src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, AuthState } from '../types';
import authService from '../services/auth';

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Inizializza lo stato dai dati persistenti (localStorage)
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
        try {
            const parsedAuth = JSON.parse(storedAuth) as AuthState;
            token.value = parsedAuth.token;
            user.value = parsedAuth.user;
        } catch (err) {
            console.error('Error parsing stored auth data:', err);
            // In caso di errore, cancella i dati persistenti
            localStorage.removeItem('auth');
        }
    }

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');
    const userCompanyId = computed(() => user.value?.companyId);
    const userFullName = computed(() => {
        if (!user.value) return '';
        return `${user.value.firstName} ${user.value.lastName}`;
    });

    // Actions
    async function login(username: string, password: string) {
        try {
            loading.value = true;
            error.value = null;

            const authResponse = await authService.login(username, password);
            token.value = authResponse.token;
            user.value = authResponse.user;

            // Salva l'autenticazione nel localStorage
            persistAuth();

            // Configura l'header di autorizzazione per le future richieste API
            authService.setAuthHeader(authResponse.token);

            return authResponse;
        } catch (err: any) {
            console.error('Login error:', err);
            error.value = err.message || 'Authentication failed';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        // Cancella il token e le informazioni utente
        token.value = null;
        user.value = null;

        // Rimuovi i dati dal localStorage
        localStorage.removeItem('auth');

        // Rimuovi l'header di autorizzazione
        authService.clearAuthHeader();
    }

    function persistAuth() {
        if (token.value && user.value) {
            localStorage.setItem('auth', JSON.stringify({
                token: token.value,
                user: user.value,
            }));
        }
    }

    function updateUser(userData: Partial<User>) {
        if (user.value) {
            user.value = { ...user.value, ...userData };
            persistAuth();
        }
    }

    return {
        // State
        token,
        user,
        loading,
        error,

        // Getters
        isAuthenticated,
        isAdmin,
        userCompanyId,
        userFullName,

        // Actions
        login,
        logout,
        updateUser,
    };
});
