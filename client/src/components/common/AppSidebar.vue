<!-- client/src/components/common/AppSidebar.vue -->
<template>
  <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
        >
          <router-link :to="item.path" class="nav-link" :title="item.label">
            <i :class="item.icon" class="nav-icon"></i>
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="collapse-btn" @click="toggleCollapse" :title="collapseTitle">
        <i :class="collapseIcon"></i>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useAuthStore } from '../../stores/authStore';

const route = useRoute();
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();

// Stato del sidebar
const isCollapsed = computed(() => sidebarStore.isCollapsed);

// Titolo del pulsante di collapse
const collapseTitle = computed(() =>
    isCollapsed.value ? 'Expand Sidebar' : 'Collapse Sidebar'
);

// Icona del pulsante di collapse
const collapseIcon = computed(() =>
    isCollapsed.value ? 'fas fa-chevron-right' : 'fas fa-chevron-left'
);

// Elementi di navigazione
const navItems = computed(() => {
  const items = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
    },
    {
      path: '/map',
      label: 'Map View',
      icon: 'fas fa-map-marked-alt',
    },
    {
      path: '/employees',
      label: 'Employees',
      icon: 'fas fa-users',
    },
    {
      path: '/assets',
      label: 'Assets',
      icon: 'fas fa-boxes',
    }
  ];

  // Aggiungi la voce di configurazione solo per gli admin
  if (authStore.isAdmin) {
    items.push({
      path: '/site-config',
      label: 'Configuration',
      icon: 'fas fa-cogs',
    });
  }

  // Aggiungi la voce delle impostazioni in fondo
  items.push({
    path: '/settings',
    label: 'Settings',
    icon: 'fas fa-sliders-h',
  });

  return items;
});

// Verifica se un percorso è attivo
function isActive(path: string): boolean {
  // Corrispondenza esatta
  if (route.path === path) {
    return true;
  }

  // Corrispondenza per percorsi nidificati (se necessario)
  if (path !== '/' && route.path.startsWith(path)) {
    return true;
  }

  return false;
}

// Toggle del collapse della sidebar
function toggleCollapse() {
  sidebarStore.toggle();
}
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: #ecf0f1;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 60px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background-color 0.2s, border-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active .nav-link {
  background-color: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

.nav-icon {
  width: 20px;
  text-align: center;
  margin-right: 15px;
  font-size: 16px;
}

.app-sidebar.collapsed .nav-text {
  display: none;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  display: flex;
  justify-content: center;
}

.collapse-btn {
  background: none;
  border: none;
  color: #ecf0f1;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
