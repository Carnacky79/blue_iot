<!-- client/src/views/DashboardView.vue -->
<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="header-actions">
        <ui-button variant="primary" icon="fas fa-sync-alt" :loading="loading" @click="refreshData">
          Refresh
        </ui-button>
      </div>
    </div>

    <ui-alert v-if="error" type="danger" dismissible>
      {{ error }}
    </ui-alert>

    <div class="dashboard-grid">
      <!-- Stats Cards -->
      <div class="stats-row">
        <ui-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon employee-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-data">
              <h2>{{ employeeCount }}</h2>
              <p>Employees on Site</p>
            </div>
          </div>
        </ui-card>

        <ui-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon asset-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="stat-data">
              <h2>{{ assetCount }}</h2>
              <p>Assets Tracked</p>
            </div>
          </div>
        </ui-card>

        <ui-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon alert-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-data">
              <h2>{{ alertCount }}</h2>
              <p>Active Alerts</p>
            </div>
          </div>
        </ui-card>

        <ui-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon status-icon" :class="{ 'connected': isConnected }">
              <i class="fas fa-signal"></i>
            </div>
            <div class="stat-data">
              <h2>{{ connectionStatus }}</h2>
              <p>BlueIOT Status</p>
            </div>
          </div>
        </ui-card>
      </div>

      <!-- Map Overview -->
      <ui-card>
        <template #header>
          <div class="card-header-content">
            <h3>Real-time Map Overview</h3>
            <router-link to="/map" class="view-all">
              Full Map <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </template>

        <div class="map-container">
          <DxfMapViewer />
        </div>
      </ui-card>

      <div class="dashboard-columns">
        <!-- Recent Alerts -->
        <ui-card>
          <template #header>
            <div class="card-header-content">
              <h3>Recent Alerts</h3>
              <router-link to="/alerts" class="view-all">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </template>

          <div v-if="recentAlerts.length === 0" class="no-data">
            <p>No recent alerts</p>
          </div>

          <ul v-else class="alert-list">
            <li v-for="alert in recentAlerts" :key="alert.id" class="alert-item">
              <div class="alert-icon" :class="alert.type">
                <i :class="getAlertTypeIcon(alert.type)"></i>
              </div>
              <div class="alert-details">
                <h4>{{ alert.title }}</h4>
                <p>{{ alert.description }}</p>
                <span class="alert-time">{{ formatAlertTime(alert.timestamp) }}</span>
              </div>
            </li>
          </ul>
        </ui-card>

        <!-- Active Employees -->
        <ui-card>
          <template #header>
            <div class="card-header-content">
              <h3>Active Employees</h3>
              <router-link to="/employees" class="view-all">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </template>

          <div v-if="activeEmployees.length === 0" class="no-data">
            <p>No active employees</p>
          </div>

          <ul v-else class="employee-list">
            <li v-for="employee in activeEmployees" :key="employee.id" class="employee-item">
              <div class="employee-avatar">
                <span>{{ getEmployeeInitials(employee) }}</span>
              </div>
              <div class="employee-details">
                <h4>{{ employee.name }}</h4>
                <p>{{ employee.position }}</p>
              </div>
              <div class="employee-status" :class="employee.status">
                {{ employee.status }}
              </div>
            </li>
          </ul>
        </ui-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePositioningStore } from '../stores/positioningStore';
import DxfMapViewer from '../components/map/DxfMapViewer.vue';
import UiButton from '../components/common/ui/Button.vue';
import UiCard from '../components/common/ui/Card.vue';
import UiAlert from '../components/common/ui/Alert.vue';
import { Employee } from '../types';

const positioningStore = usePositioningStore();
const loading = ref(false);
const error = ref<string | null>(null);
const isConnected = ref(false);

// Dati di esempio per il mockup della dashboard
const alertCount = ref(3);
const recentAlerts = ref([
  {
    id: 1,
    type: 'warning',
    title: 'Geofence Violation',
    description: 'Employee John Doe entered restricted area.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'danger',
    title: 'Emergency Button Pressed',
    description: 'Emergency button pressed by employee Mark Smith.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'info',
    title: 'Low Battery',
    description: 'Asset tag A1023 has low battery (15%).',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]);

// Computed
const employeeCount = computed(() => positioningStore.allEmployees.length);
const assetCount = computed(() => positioningStore.allAssets.length);
const connectionStatus = computed(() => isConnected.value ? 'Connected' : 'Disconnected');

// Esempio di dipendenti attivi
const activeEmployees = ref([
  {
    id: '1',
    name: 'John Doe',
    position: 'Construction Worker',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mark Smith',
    position: 'Electrician',
    status: 'active',
  },
  {
    id: '3',
    name: 'Anna Johnson',
    position: 'Site Manager',
    status: 'break',
  },
  {
    id: '4',
    name: 'Robert Brown',
    position: 'Equipment Operator',
    status: 'active',
  },
]);

// Helper functions
function getAlertTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle',
    success: 'fas fa-check-circle',
  };

  return icons[type] || icons.info;
}

function formatAlertTime(timestamp: string): string {
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

function getEmployeeInitials(employee: { name: string }): string {
  if (!employee.name) return '';

  const parts = employee.name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Actions
async function refreshData() {
  try {
    loading.value = true;
    error.value = null;

    // Aggiorna i dati
    await positioningStore.init();

    // Esempio: simulare controllo dello stato di connessione
    isConnected.value = Math.random() > 0.2; // 80% di probabilità di essere connesso

  } catch (err: any) {
    console.error('Error refreshing dashboard data:', err);
    error.value = err.message || 'Failed to refresh data';
  } finally {
    loading.value = false;
  }
}

// Ciclo di vita
onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  margin: 0;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.employee-icon {
  background-color: var(--primary-color);
}

.asset-icon {
  background-color: var(--secondary-color);
}

.alert-icon {
  background-color: var(--warning-color);
}

.status-icon {
  background-color: var(--danger-color);
}

.status-icon.connected {
  background-color: var(--secondary-color);
}

.stat-data h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.stat-data p {
  margin: 4px 0 0;
  color: var(--light-text);
  font-size: 14px;
}

.map-container {
  height: 400px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 992px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
}

.view-all i {
  margin-left: 4px;
  font-size: 12px;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: var(--light-text);
}

.alert-list, .employee-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.alert-icon.info {
  background-color: var(--primary-color);
}

.alert-icon.warning {
  background-color: var(--warning-color);
}

.alert-icon.danger {
  background-color: var(--danger-color);
}

.alert-icon.success {
  background-color: var(--secondary-color);
}

.alert-details {
  flex: 1;
}

.alert-details h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
}

.alert-details p {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--text-color);
}

.alert-time {
  font-size: 12px;
  color: var(--light-text);
}

.employee-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
}

.employee-item:last-child {
  border-bottom: none;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 12px;
  flex-shrink: 0;
}

.employee-details {
  flex: 1;
}

.employee-details h4 {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 500;
}

.employee-details p {
  margin: 0;
  font-size: 13px;
  color: var(--light-text);
}

.employee-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 500;
}

.employee-status.active {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--secondary-color);
}

.employee-status.break {
  background-color: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.employee-status.offline {
  background-color: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}
</style>
