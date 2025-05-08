<!-- client/src/App.vue -->
<template>
  <div class="app-container">
    <app-header v-if="showHeader" />

    <main class="app-main">
      <app-sidebar v-if="showSidebar" />

      <div class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <app-footer v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import AppHeader from './components/common/AppHeader.vue';
import AppSidebar from './components/common/AppSidebar.vue';
import AppFooter from './components/common/AppFooter.vue';

const route = useRoute();
const authStore = useAuthStore();

// Determina quali componenti di layout mostrare in base alla route
const isLoginPage = computed(() => route.name === 'login');
const showHeader = computed(() => authStore.isAuthenticated && !isLoginPage.value);
const showSidebar = computed(() => authStore.isAuthenticated && !isLoginPage.value);
const showFooter = computed(() => authStore.isAuthenticated && !isLoginPage.value);
</script>

<style>
/* Stili globali di base */
:root {
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --text-color: #333;
  --light-text: #777;
  --very-light-text: #aaa;
  --border-color: #ddd;
  --light-bg: #f5f5f5;
  --white: #fff;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--light-bg);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  display: flex;
  flex: 1;
}

.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Transizioni di pagina */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
