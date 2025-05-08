<!-- client/src/components/common/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
      </button>
      <div class="logo">
        <img src="@/assets/logo.svg" alt="BlueIOT Site Monitor" />
        <span>BlueIOT Site Monitor</span>
      </div>
    </div>

    <div class="header-center">
      <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="header-right">
      <div class="connection-status" :class="{ connected: isConnected }">
        <span class="status-indicator"></span>
        <span class="status-text">{{ connectionStatusText }}</span>
      </div>

      <div class="notifications">
        <button class="notification-btn" @click="toggleNotifications">
          <i class="fas fa-bell"></i>
          <span v-if="unreadNotificationsCount > 0" class="notification-badge">
            {{ unreadNotificationsCount }}
          </span>
        </button>

        <div v-if="showNotifications" class="notifications-dropdown">
          <div class="dropdown-header">
            <h3>Notifications</h3>
            <button v-if="hasUnreadNotifications" @click="markAllAsRead">
              Mark all as read
            </button>
          </div>

          <div v-if="notifications.length === 0" class="no-notifications">
            No notifications
          </div>

          <ul v-else class="notifications-list">
            <li
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon" :class="notification.type">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              <div class="notification-content">
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ formatNotificationTime(notification.timestamp) }}</span>
              </div>
            </li>
          </ul>

          <div class="dropdown-footer">
            <router-link to="/notifications">View all notifications</router-link>
          </div>
        </div>
      </div>

      <div class="user-menu">
        <button class="user-menu-btn" @click="toggleUserMenu">
          <div class="user-avatar">
            <span v-if="!userAvatar">{{ userInitials }}</span>
            <img v-else :src="userAvatar" :alt="userFullName" />
          </div>
          <span class="user-name">{{ userFullName }}</span>
          <i class="fas fa-chevron-down"></i>
        </button>

        <div v-if="showUserMenu" class="user-dropdown">
          <ul class="dropdown-menu">
            <li>
              <router-link to="/profile">
                <i class="fas fa-user"></i> Profile
              </router-link>
            </li>
            <li>
              <router-link to="/settings">
                <i class="fas fa-cog"></i> Settings
              </router-link>
            </li>
            <li class="divider"></li>
            <li>
              <button @click="logout">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import blueIotService from '../../services/blueiot';

// Stores
const authStore = useAuthStore();
const sidebarStore = useSidebarStore();
const route = useRoute();
const router = useRouter();

// User info
const userFullName = computed(() => authStore.userFullName || 'User');
const userAvatar = ref<string | null>(null);
const userInitials = computed(() => {
  if (!authStore.user) return 'U';
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`;
});

// Page title
const pageTitle = computed(() => {
  const currentRoute = route.name as string;
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    'site-config': 'Site Configuration',
    employees: 'Employees',
    assets: 'Assets',
    map: 'Map View',
    settings: 'Settings',
  };

  return titles[currentRoute] || '';
});

// Connection status
const isConnected = ref(false);
const connectionStatusText = computed(() =>
    isConnected.value ? 'Connected to BlueIOT' : 'Disconnected'
);

// Notifications
const notifications = ref<any[]>([]); // Sostituire con il tipo corretto
const showNotifications = ref(false);
const unreadNotificationsCount = computed(() =>
    notifications.value.filter(n => !n.read).length
);
const hasUnreadNotifications = computed(() => unreadNotificationsCount.value > 0);

// User menu
const showUserMenu = ref(false);

// Event handlers
function toggleSidebar() {
  sidebarStore.toggle();
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showUserMenu.value) showUserMenu.value = false;
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
  if (showNotifications.value) showNotifications.value = false;
}

function handleNotificationClick(notification: any) {
  // Implementare la logica di gestione delle notifiche
  if (!notification.read) {
    // Marca la notifica come letta
    notification.read = true;
  }

  // Naviga alla pagina pertinente se necessario
  if (notification.link) {
    router.push(notification.link);
  }

  showNotifications.value = false;
}

function markAllAsRead() {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
}

function logout() {
  authStore.logout();
  router.push('/login');
}

// Helper functions
function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    alert: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
  };

  return icons[type] || 'fas fa-bell';
}

function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Meno di un'ora fa
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  }
  // Oggi
  else if (date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()) {
    return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  // Ieri
  else if (date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()) {
    return `Yesterday at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  // Altro
  else {
    return date.toLocaleDateString();
  }
}

// Lifecycle hooks
onMounted(() => {
  // Imposta il gestore di eventi per la connessione BlueIOT
  blueIotService.on('connected', () => {
    isConnected.value = true;
  });

  blueIotService.on('disconnected', () => {
    isConnected.value = false;
  });

  // Aggiungi handler per chiudere i menu quando si fa clic all'esterno
  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Chiudi menu notifiche se clic all'esterno
    if (showNotifications.value &&
        !target.closest('.notifications')) {
      showNotifications.value = false;
    }

    // Chiudi menu utente se clic all'esterno
    if (showUserMenu.value &&
        !target.closest('.user-menu')) {
      showUserMenu.value = false;
    }
  };

  document.addEventListener('click', handleOutsideClick);

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
    blueIotService.off('connected', () => {});
    blueIotService.off('disconnected', () => {});
  });
});
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: var(--white);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-right: 15px;
  color: var(--text-color);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 32px;
  margin-right: 10px;
}

.logo span {
  font-weight: 600;
  font-size: 18px;
  color: var(--primary-color);
}

.header-center {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--danger-color);
}

.connection-status.connected {
  color: var(--secondary-color);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--danger-color);
}

.connection-status.connected .status-indicator {
  background-color: var(--secondary-color);
}

.status-text {
  white-space: nowrap;
}

.notifications, .user-menu {
  position: relative;
}

.notification-btn, .user-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: var(--text-color);
}

.notification-btn {
  position: relative;
  padding: 8px;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--danger-color);
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-dropdown, .user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: var(--shadow);
  width: 300px;
  z-index: 101;
  margin-top: 5px;
}

.user-dropdown {
  width: 200px;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.dropdown-header button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 14px;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: var(--light-text);
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
}

.notification-item {
  display: flex;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}

.notification-item:hover {
  background-color: var(--light-bg);
}

.notification-item.unread {
  background-color: rgba(52, 152, 219, 0.05);
}

.notification-icon {
  margin-right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.notification-icon.alert {
  background-color: var(--danger-color);
}

.notification-icon.warning {
  background-color: var(--warning-color);
}

.notification-icon.info {
  background-color: var(--primary-color);
}

.notification-icon.success {
  background-color: var(--secondary-color);
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin: 0 0 5px;
  font-size: 14px;
}

.notification-time {
  font-size: 12px;
  color: var(--light-text);
}

.dropdown-footer {
  padding: 10px 15px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.dropdown-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 8px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  margin-right: 5px;
  font-weight: 500;
}

.dropdown-menu {
  list-style: none;
  padding: 0;
}

.dropdown-menu li {
  padding: 0;
}

.dropdown-menu a, .dropdown-menu button {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--text-color);
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-menu a i, .dropdown-menu button i {
  margin-right: 10px;
  width: 16px;
  text-align: center;
}

.dropdown-menu a:hover, .dropdown-menu button:hover {
  background-color: var(--light-bg);
}

.dropdown-menu .divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 5px 0;
}
</style>
