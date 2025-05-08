// client/src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Importa le viste
import LoginView from '../views/LoginView.vue';

// Lazy-load delle viste per migliorare le performance
const DashboardView = () => import('../views/DashboardView.vue');
const SiteConfigView = () => import('../views/SiteConfigView.vue');
const EmployeesView = () => import('../views/EmployeesView.vue');
const AssetsView = () => import('../views/AssetsView.vue');
const MapView = () => import('../views/MapView.vue');
const SettingsView = () => import('../views/SettingsView.vue');
const NotFoundView = () => import('../views/NotFoundView.vue');

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false },
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true },
    },
    {
        path: '/site-config',
        name: 'site-config',
        component: SiteConfigView,
        meta: { requiresAuth: true },
    },
    {
        path: '/employees',
        name: 'employees',
        component: EmployeesView,
        meta: { requiresAuth: true },
    },
    {
        path: '/assets',
        name: 'assets',
        component: AssetsView,
        meta: { requiresAuth: true },
    },
    {
        path: '/map',
        name: 'map',
        component: MapView,
        meta: { requiresAuth: true },
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView,
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

// Guardia di navigazione per controllare l'autenticazione
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
        // Reindirizza alla pagina di login se l'utente non è autenticato
        next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        // Reindirizza alla dashboard se l'utente è già autenticato
        next({ name: 'dashboard' });
    } else {
        // Procedi normalmente
        next();
    }
});

export default router;
