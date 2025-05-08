<!-- client/src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="BlueIOT Site Monitor" class="logo">
        <h1>Site Monitor</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="isLoading"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
          >
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Logging in...
          </span>
          <span v-else>Log In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter both username and password';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    await authStore.login(username.value, password.value);

    // Redirect to dashboard
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Invalid username or password';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.login-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.error-message {
  background-color: #fff2f2;
  color: #e74c3c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-button {
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
</style>
