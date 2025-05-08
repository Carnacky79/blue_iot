<!-- client/src/views/EmployeesView.vue -->
<template>
  <div class="employees-view">
    <div class="view-header">
      <h1>Employees</h1>
      <div class="header-actions">
        <ui-button
            variant="secondary"
            icon="fas fa-sync-alt"
            :loading="loading"
            @click="refreshData"
        >
          Refresh
        </ui-button>
        <ui-button
            variant="primary"
            icon="fas fa-user-plus"
            @click="showAssignEmployeeDialog = true"
        >
          Assign to Site
        </ui-button>
      </div>
    </div>

    <ui-alert v-if="error" type="danger" dismissible>
      {{ error }}
    </ui-alert>

    <ui-card>
      <div class="filter-bar">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Search employees..."
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter">
            <option value="all">All</option>
            <option value="onsite">On Site</option>
            <option value="offsite">Off Site</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Department:</label>
          <select v-model="departmentFilter">
            <option value="all">All</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>

        <div class="view-options">
          <button
              class="view-option-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
          >
            <i class="fas fa-th-large"></i>
          </button>
          <button
              class="view-option-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading employees...</span>
      </div>

      <div v-else-if="filteredEmployees.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <h3>No Employees Found</h3>
        <p v-if="hasFilters">
          Try changing your search or filter criteria.
        </p>
        <p v-else>
          No employees are currently assigned to this site.
        </p>
        <ui-button
            variant="primary"
            icon="fas fa-user-plus"
            @click="showAssignEmployeeDialog = true"
        >
          Assign Employee to Site
        </ui-button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="employees-grid">
        <div
            v-for="employee in filteredEmployees"
            :key="employee.id"
            class="employee-card"
            :class="{ 'has-tag': !!employee.tagId }"
        >
          <div class="employee-header">
            <div class="employee-avatar">
              <span>{{ getEmployeeInitials(employee) }}</span>
            </div>
            <div v-if="getEmployeeStatus(employee)"
                 class="employee-status"
                 :class="getEmployeeStatus(employee)">
              {{ getEmployeeStatus(employee) }}
            </div>
          </div>

          <div class="employee-info">
            <h3>{{ employee.name }}</h3>
            <p class="employee-position">{{ employee.position }}</p>
            <p class="employee-department">{{ employee.department }}</p>

            <div class="employee-contact">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>{{ employee.email }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>{{ employee.phone }}</span>
              </div>
            </div>

            <div class="tag-info" v-if="employee.tagId">
              <div class="tag-label">
                <i class="fas fa-tag"></i>
                <span>Tag ID: {{ employee.tagId }}</span>
              </div>

              <div class="battery-indicator"
                   :data-level="getTagBatteryLevel(employee.tagId)">
                <div
                    class="battery-level"
                    :style="{ width: `${getTagBatteryLevel(employee.tagId)}%` }"
                    :class="getBatteryClass(getTagBatteryLevel(employee.tagId))"
                ></div>
                <span>{{ getTagBatteryLevel(employee.tagId) }}%</span>
              </div>
            </div>
          </div>

          <div class="employee-actions">
            <button class="card-action-btn" @click="viewEmployeeDetails(employee)">
              <i class="fas fa-info-circle"></i>
              Details
            </button>
            <button class="card-action-btn"
                    @click="showAssignTagDialog(employee)"
                    :disabled="!!employee.tagId">
              <i class="fas fa-tag"></i>
              {{ employee.tagId ? 'Tagged' : 'Assign Tag' }}
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="employees-table">
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Contact</th>
            <th>Tag ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="employee in filteredEmployees" :key="employee.id">
            <td>
              <div class="employee-name-cell">
                <div class="employee-avatar small">
                  <span>{{ getEmployeeInitials(employee) }}</span>
                </div>
                <span>{{ employee.name }}</span>
              </div>
            </td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.department }}</td>
            <td>
              <div class="contact-info">
                <span class="contact-email">{{ employee.email }}</span>
                <span class="contact-phone">{{ employee.phone }}</span>
              </div>
            </td>
            <td>
              <div v-if="employee.tagId" class="tag-info-cell">
                <span class="tag-id">{{ employee.tagId }}</span>
                <div class="battery-indicator small"
                     :data-level="getTagBatteryLevel(employee.tagId)">
                  <div
                      class="battery-level"
                      :style="{ width: `${getTagBatteryLevel(employee.tagId)}%` }"
                      :class="getBatteryClass(getTagBatteryLevel(employee.tagId))"
                  ></div>
                  <span>{{ getTagBatteryLevel(employee.tagId) }}%</span>
                </div>
              </div>
              <span v-else class="no-tag">Not assigned</span>
            </td>
            <td>
                <span
                    v-if="getEmployeeStatus(employee)"
                    class="status-badge"
                    :class="getEmployeeStatus(employee)"
                >
                  {{ getEmployeeStatus(employee) }}
                </span>
              <span v-else class="status-badge offline">Offline</span>
            </td>
            <td>
              <div class="table-actions">
                <button class="table-action-btn" @click="viewEmployeeDetails(employee)">
                  <i class="fas fa-info-circle"></i>
                </button>
                <button
                    class="table-action-btn"
                    @click="showAssignTagDialog(employee)"
                    :disabled="!!employee.tagId"
                >
                  <i class="fas fa-tag"></i>
                </button>
                <button class="table-action-btn delete" @click="confirmRemoveFromSite(employee)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </ui-card>

    <!-- Dialog per dettagli dipendente -->
    <div v-if="selectedEmployee" class="modal-overlay" @click="selectedEmployee = null">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Employee Details</h2>
          <button class="modal-close" @click="selectedEmployee = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="employee-profile">
            <div class="profile-header">
              <div class="employee-avatar large">
                <span>{{ getEmployeeInitials(selectedEmployee) }}</span>
              </div>
              <div class="profile-info">
                <h3>{{ selectedEmployee.name }}</h3>
                <p>{{ selectedEmployee.position }}</p>
                <p>{{ selectedEmployee.department }}</p>
              </div>
            </div>

            <div class="profile-details">
              <div class="detail-group">
                <h4>Contact Information</h4>
                <div class="detail-item">
                  <i class="fas fa-envelope"></i>
                  <span>{{ selectedEmployee.email }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-phone"></i>
                  <span>{{ selectedEmployee.phone }}</span>
                </div>
              </div>

              <div class="detail-group">
                <h4>Tag Information</h4>
                <div v-if="selectedEmployee.tagId" class="tag-details">
                  <div class="detail-item">
                    <i class="fas fa-tag"></i>
                    <span>Tag ID: {{ selectedEmployee.tagId }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-battery-half"></i>
                    <span>Battery: {{ getTagBatteryLevel(selectedEmployee.tagId) }}%</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-signal"></i>
                    <span>Status: {{ getTagStatus(selectedEmployee.tagId) }}</span>
                  </div>
                </div>
                <div v-else class="no-tag-details">
                  <p>No tag assigned to this employee.</p>
                  <ui-button
                      variant="primary"
                      size="sm"
                      icon="fas fa-tag"
                      @click="showAssignTagDialog(selectedEmployee)"
                  >
                    Assign Tag
                  </ui-button>
                </div>
              </div>

              <div v-if="selectedEmployee.tagId" class="detail-group">
                <h4>Current Location</h4>
                <div class="location-preview">
                  <!-- Qui andrebbe una mini-mappa con la posizione del dipendente -->
                  <p>Map view to be implemented...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ui-button variant="light" @click="selectedEmployee = null">
            Close
          </ui-button>
          <ui-button
              v-if="selectedEmployee.tagId"
              variant="primary"
              icon="fas fa-map-marked-alt"
              @click="viewOnMap(selectedEmployee)"
          >
            View on Map
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Altri dialog per assegnazione tag e dipendenti -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePositioningStore } from '../stores/positioningStore';
import UiButton from '../components/common/ui/Button.vue';
import UiCard from '../components/common/ui/Card.vue';
import UiAlert from '../components/common/ui/Alert.vue';
import { Employee } from '../types';

// Router e store
const router = useRouter();
const positioningStore = usePositioningStore();

// State
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('all');
const departmentFilter = ref('all');
const viewMode = ref('grid');
const selectedEmployee = ref<Employee | null>(null);
const showAssignEmployeeDialog = ref(false);

// Computed
const employees = computed(() => positioningStore.allEmployees);

const departments = computed(() => {
  const depts = new Set<string>();
  for (const employee of employees.value) {
    if (employee.department) {
      depts.add(employee.department);
    }
  }
  return Array.from(depts).sort();
});

const filteredEmployees = computed(() => {
  let result = employees.value;

  // Filtra per ricerca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(employee => {
      return (
          employee.name.toLowerCase().includes(query) ||
          employee.position.toLowerCase().includes(query) ||
          employee.department.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query)
      );
    });
  }

  // Filtra per stato
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'onsite') {
      result = result.filter(employee => {
        if (!employee.tagId) return false;
        const status = getEmployeeStatus(employee);
        return status && status !== 'offline';
      });
    } else if (statusFilter.value === 'offsite') {
      result = result.filter(employee => {
        if (!employee.tagId) return true;
        const status = getEmployeeStatus(employee);
        return !status || status === 'offline';
      });
    }
  }

  // Filtra per reparto
  if (departmentFilter.value !== 'all') {
    result = result.filter(employee =>
        employee.department === departmentFilter.value
    );
  }

  return result;
});

const hasFilters = computed(() => {
  return (
      searchQuery.value !== '' ||
      statusFilter.value !== 'all' ||
      departmentFilter.value !== 'all'
  );
});

// Methods
function getEmployeeInitials(employee: Employee): string {
  if (!employee.name) return '';

  const parts = employee.name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getEmployeeStatus(employee: Employee): string | null {
  if (!employee.tagId) return null;

  const position = positioningStore.getTagPosition(employee.tagId);

  if (!position) return 'offline';

  // Considera online se l'ultima posizione è entro 5 minuti
  const lastUpdate = new Date(position.timestamp).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  if (diffMinutes > 5) return 'offline';

  // Qui potremmo implementare anche altri stati come "break" in base a regole di business
  return 'online';
}

function getTagBatteryLevel(tagId: string): number {
  const position = positioningStore.getTagPosition(tagId);
  return position ? position.batteryLevel : 0;
}

function getBatteryClass(level: number): string {
  if (level < 20) return 'critical';
  if (level < 40) return 'low';
  return 'good';
}

function getTagStatus(tagId: string): string {
  const position = positioningStore.getTagPosition(tagId);

  if (!position) return 'Offline';

  // Considera online se l'ultima posizione è entro 5 minuti
  const lastUpdate = new Date(position.timestamp).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  return diffMinutes <= 5 ? 'Online' : 'Offline';
}

function viewEmployeeDetails(employee: Employee) {
  selectedEmployee.value = employee;
}

function showAssignTagDialog(employee: Employee) {
  // Qui implementare logic per l'assegnazione tag
  console.log('Assign tag to employee:', employee);
}

function confirmRemoveFromSite(employee: Employee) {
  if (confirm(`Are you sure you want to remove ${employee.name} from this site?`)) {
    // Qui implementare logic per la rimozione dal sito
    console.log('Remove employee from site:', employee);
  }
}

function viewOnMap(employee: Employee) {
  if (employee.tagId) {
    router.push({
      name: 'map',
      query: { highlight: employee.tagId, type: 'employee' }
    });
  }
}

async function refreshData() {
  try {
    loading.value = true;
    error.value = '';

    await positioningStore.init();
  } catch (err: any) {
    console.error('Error refreshing employee data:', err);
    error.value = err.message || 'Failed to refresh data';
  } finally {
    loading.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.employees-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
}

.search-input input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
}

.search-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: var(--light-text);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.view-options {
  display: flex;
  gap: 5px;
  margin-left: auto;
}

.view-option-btn {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #e9ecef;
  cursor: pointer;
  color: var(--light-text);
}

.view-option-btn:hover {
  background-color: #f8f9fa;
}

.view-option-btn.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.05);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: var(--light-text);
  gap: 15px;
}

.loading-container i {
  font-size: 24px;
  color: var(--primary-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #ced4da;
  margin-bottom: 15px;
}

.empty-state h3 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 20px;
  color: var(--light-text);
}

/* Grid View */
.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.employee-card {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e9ecef;
}

.employee-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.employee-card.has-tag {
  border-left: 3px solid var(--primary-color);
}

.employee-header {
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
}

.employee-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 15px;
}

.employee-avatar.small {
  width: 36px;
  height: 36px;
  font-size: 14px;
  margin-bottom: 0;
  margin-right: 10px;
}

.employee-avatar.large {
  width: 80px;
  height: 80px;
  font-size: 30px;
  margin-bottom: 0;
  margin-right: 20px;
}

.employee-status {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 500;
}

.employee-status.online {
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

.employee-info {
  padding: 15px 20px;
}

.employee-info h3 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 600;
}

.employee-position {
  margin: 0 0 2px;
  font-size: 14px;
  color: var(--text-color);
}

.employee-department {
  margin: 0 0 15px;
  font-size: 14px;
  color: var(--light-text);
}

.employee-contact {
  margin-bottom: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

.contact-item i {
  width: 16px;
  margin-right: 8px;
  color: var(--light-text);
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.tag-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.tag-label i {
  margin-right: 8px;
  color: var(--primary-color);
}

.battery-indicator {
  width: 100%;
  height: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.battery-indicator.small {
  width: 80px;
  height: 6px;
}

.battery-level {
  height: 100%;
  border-radius: 4px;
}

.battery-level.good {
  background-color: var(--secondary-color);
}

.battery-level.low {
  background-color: var(--warning-color);
}

.battery-level.critical {
  background-color: var(--danger-color);
}

.battery-indicator span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: black;
  font-weight: 600;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.employee-actions {
  display: flex;
  border-top: 1px solid #e9ecef;
}

.card-action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--primary-color);
  transition: background-color 0.2s;
}

.card-action-btn:hover {
  background-color: rgba(52, 152, 219, 0.05);
}

.card-action-btn:disabled {
  color: var(--light-text);
  cursor: not-allowed;
}

.card-action-btn:first-child {
  border-right: 1px solid #e9ecef;
}

/* Table View */
.employees-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  font-weight: 500;
  color: var(--light-text);
  background-color: #f8f9fa;
  font-size: 14px;
}

td {
  font-size: 14px;
}

.employee-name-cell {
  display: flex;
  align-items: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-email {
  font-size: 14px;
}

.contact-phone {
  font-size: 12px;
  color: var(--light-text);
}

.tag-info-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tag-id {
  font-size: 14px;
  color: var(--primary-color);
}

.no-tag {
  font-size: 14px;
  color: var(--light-text);
  font-style: italic;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.online {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--secondary-color);
}

.status-badge.break {
  background-color: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.status-badge.offline {
  background-color: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.table-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #e9ecef;
  cursor: pointer;
  color: var(--primary-color);
}

.table-action-btn:hover {
  background-color: #f8f9fa;
}

.table-action-btn:disabled {
  color: var(--light-text);
  cursor: not-allowed;
}

.table-action-btn.delete {
  color: var(--danger-color);
}

.table-action-btn.delete:hover {
  border-color: var(--danger-color);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--light-text);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.employee-profile {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  margin: 0 0 5px;
  font-size: 20px;
  font-weight: 600;
}

.profile-info p {
  margin: 0;
  color: var(--light-text);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-group {
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.detail-group h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-item i {
  width: 16px;
  margin-right: 10px;
  color: var(--light-text);
}

.tag-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-tag-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.no-tag-details p {
  margin: 0;
  color: var(--light-text);
  font-style: italic;
}

.location-preview {
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
}
</style>
