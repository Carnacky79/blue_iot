<!-- client/src/views/NotFoundView.vue -->
<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <ui-button variant="primary" @click="goHome">
        Go to Dashboard
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import UiButton from '../components/common/ui/Button.vue';

const router = useRouter();

function goHome() {
  router.push({ name: 'dashboard' });
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 20px;
}

.not-found-content {
  max-width: 400px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 20px;
  opacity: 0.5;
}

h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--text-color);
}

p {
  margin-bottom: 24px;
  color: var(--light-text);
}
</style>
