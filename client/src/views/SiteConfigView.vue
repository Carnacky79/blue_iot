<!-- client/src/views/SiteConfigView.vue -->
<template>
  <div class="site-config-view">
    <div class="config-header">
      <h1>Site Configuration</h1>
      <div class="header-actions">
        <ui-button
            variant="secondary"
            icon="fas fa-download"
            @click="exportConfiguration"
        >
          Export Configuration
        </ui-button>
        <ui-button
            variant="primary"
            icon="fas fa-save"
            :loading="saving"
            @click="saveConfiguration"
        >
          Save Changes
        </ui-button>
      </div>
    </div>

    <ui-alert v-if="successMessage" type="success" :autoDismiss="5000" @dismissed="successMessage = ''">
      {{ successMessage }}
    </ui-alert>

    <ui-alert v-if="error" type="danger" dismissible @dismissed="error = ''">
      {{ error }}
    </ui-alert>

    <div class="config-tabs">
      <div class="tab-header">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="tab-content">
        <!-- Sezione Mappe -->
        <div v-if="activeTab === 'maps'" class="tab-panel">
          <div class="section-header">
            <h2>Site Maps</h2>
            <ui-button
                variant="primary"
                size="sm"
                icon="fas fa-plus"
                @click="showMapUploadDialog = true"
            >
              Upload New Map
            </ui-button>
          </div>

          <div v-if="loading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading maps...</span>
          </div>

          <div v-else-if="maps.length === 0" class="empty-state">
            <i class="fas fa-map"></i>
            <h3>No Maps Available</h3>
            <p>Upload a DXF map to get started.</p>
            <ui-button
                variant="primary"
                icon="fas fa-upload"
                @click="showMapUploadDialog = true"
            >
              Upload Map
            </ui-button>
          </div>

          <div v-else class="maps-grid">
            <div
                v-for="map in maps"
                :key="map.id"
                class="map-card"
                :class="{ active: currentMapId === map.id }"
                @click="selectMap(map.id)"
            >
              <div class="map-preview">
                <img :src="map.previewUrl || '/map-placeholder.png'" :alt="map.name">
                <div class="map-actions">
                  <button class="map-action-btn edit" @click.stop="editMap(map)">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button class="map-action-btn delete" @click.stop="confirmDeleteMap(map)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="map-info">
                <h3>{{ map.name }}</h3>
                <p>Floor {{ map.floorNumber }}</p>
                <p class="map-date">Updated: {{ formatDate(map.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sezione Antenne -->
        <div v-if="activeTab === 'antennas'" class="tab-panel">
          <div class="section-header">
            <h2>BlueIOT Antennas</h2>
            <ui-button
                variant="primary"
                size="sm"
                icon="fas fa-plus"
                @click="showNewAntennaDialog = true"
                :disabled="!currentMapId"
            >
              Add Antenna
            </ui-button>
          </div>

          <ui-alert v-if="!currentMapId" type="info">
            Please select a map first to configure antennas.
          </ui-alert>

          <div v-else-if="loading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading antennas...</span>
          </div>

          <div v-else-if="antennasForCurrentMap.length === 0" class="empty-state">
            <i class="fas fa-broadcast-tower"></i>
            <h3>No Antennas Configured</h3>
            <p>Add antennas to enable precise positioning.</p>
            <ui-button
                variant="primary"
                icon="fas fa-plus"
                @click="showNewAntennaDialog = true"
            >
              Add Antenna
            </ui-button>
          </div>

          <div v-else>
            <div class="map-with-antennas">
              <DxfMapViewer
                  :mapId="currentMapId"
                  :isEditing="true"
              />
            </div>

            <div class="antennas-table">
              <table>
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Anchor ID</th>
                  <th>Coordinates</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="antenna in antennasForCurrentMap" :key="antenna.id">
                  <td>{{ antenna.name }}</td>
                  <td>{{ antenna.anchorId }}</td>
                  <td>
                    X: {{ antenna.x.toFixed(2) }},
                    Y: {{ antenna.y.toFixed(2) }},
                    Z: {{ antenna.z.toFixed(2) }}
                  </td>
                  <td>
                      <span class="status-badge" :class="antenna.status">
                        {{ antenna.status }}
                      </span>
                  </td>
                  <td>{{ formatDate(antenna.lastSeenAt) }}</td>
                  <td class="actions-cell">
                    <button class="table-action-btn edit" @click="editAntenna(antenna)">
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="table-action-btn delete" @click="confirmDeleteAntenna(antenna)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sezione Tag -->
        <div v-if="activeTab === 'tags'" class="tab-panel">
          <div class="section-header">
            <h2>Tag Assignments</h2>
            <ui-button
                variant="primary"
                size="sm"
                icon="fas fa-plus"
                @click="showNewTagAssignmentDialog = true"
            >
              Assign Tag
            </ui-button>
          </div>

          <div class="filter-options">
            <div class="filter-group">
              <label>Filter by:</label>
              <select v-model="tagFilter">
                <option value="all">All Tags</option>
                <option value="employee">Employee Tags</option>
                <option value="asset">Asset Tags</option>
                <option value="unassigned">Unassigned Tags</option>
              </select>
            </div>

            <div class="search-group">
              <i class="fas fa-search"></i>
              <input
                  type="text"
                  v-model="tagSearchQuery"
                  placeholder="Search by tag ID or name..."
              />
            </div>
          </div>

          <div v-if="loading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading tag assignments...</span>
          </div>

          <div v-else-if="filteredTagAssignments.length === 0" class="empty-state">
            <i class="fas fa-tags"></i>
            <h3>No Tag Assignments Found</h3>
            <p v-if="tagSearchQuery || tagFilter !== 'all'">
              Try changing your search or filter criteria.
            </p>
            <p v-else>
              Assign tags to employees and assets to start tracking.
            </p>
            <ui-button
                variant="primary"
                icon="fas fa-plus"
                @click="showNewTagAssignmentDialog = true"
            >
              Assign Tag
            </ui-button>
          </div>

          <div v-else class="tags-table">
            <table>
              <thead>
              <tr>
                <th>Tag ID</th>
                <th>Type</th>
                <th>Assigned To</th>
                <th>Assigned Date</th>
                <th>Battery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="assignment in filteredTagAssignments" :key="assignment.id">
                <td>{{ assignment.tagId }}</td>
                <td>
                    <span class="tag-type" :class="assignment.entityType">
                      <i :class="getEntityTypeIcon(assignment.entityType)"></i>
                      {{ capitalize(assignment.entityType) }}
                    </span>
                </td>
                <td>{{ getEntityName(assignment) }}</td>
                <td>{{ formatDate(assignment.assignedAt) }}</td>
                <td>
                  <div class="battery-indicator" :data-level="getTagBatteryLevel(assignment.tagId)">
                    <div
                        class="battery-level"
                        :style="{ width: `${getTagBatteryLevel(assignment.tagId)}%` }"
                        :class="getBatteryClass(getTagBatteryLevel(assignment.tagId))"
                    ></div>
                    <span>{{ getTagBatteryLevel(assignment.tagId) }}%</span>
                  </div>
                </td>
                <td>
                    <span class="status-badge" :class="getTagStatus(assignment.tagId)">
                      {{ getTagStatus(assignment.tagId) }}
                    </span>
                </td>
                <td class="actions-cell">
                  <button class="table-action-btn edit" @click="editTagAssignment(assignment)">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button class="table-action-btn delete" @click="confirmDeleteTagAssignment(assignment)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sezione Impostazioni Geofence -->
        <div v-if="activeTab === 'geofence'" class="tab-panel">
          <div class="section-header">
            <h2>Geofence Settings</h2>
            <ui-button
                variant="primary"
                size="sm"
                icon="fas fa-plus"
                @click="showNewGeofenceDialog = true"
                :disabled="!currentMapId"
            >
              Add Geofence
            </ui-button>
          </div>

          <ui-alert v-if="!currentMapId" type="info">
            Please select a map first to configure geofences.
          </ui-alert>

          <div v-else class="geofence-editor">
            <!-- Qui andrebbe l'editor di geofence -->
            <p>Geofence editor to be implemented...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog per upload mappa -->
    <div v-if="showMapUploadDialog" class="modal-overlay" @click="showMapUploadDialog = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Upload Map</h2>
          <button class="modal-close" @click="showMapUploadDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="map-name">Map Name</label>
            <input
                type="text"
                id="map-name"
                v-model="newMap.name"
                placeholder="Enter map name"
            />
          </div>

          <div class="form-group">
            <label for="floor-number">Floor Number</label>
            <input
                type="number"
                id="floor-number"
                v-model="newMap.floorNumber"
                placeholder="Enter floor number"
            />
          </div>

          <div class="form-group">
            <label>Map File (DXF)</label>
            <div class="file-upload-container">
              <div
                  class="file-upload-area"
                  :class="{ 'has-file': newMap.file }"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
              >
                <input
                    type="file"
                    ref="fileInput"
                    accept=".dxf"
                    style="display: none"
                    @change="handleFileChange"
                />

                <div v-if="newMap.file" class="file-preview">
                  <i class="fas fa-file-alt"></i>
                  <span>{{ newMap.file.name }}</span>
                  <button class="remove-file" @click.stop="newMap.file = null">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div v-else class="file-upload-message">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Drag and drop a DXF file here, or click to browse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <ui-button variant="light" @click="showMapUploadDialog = false">
            Cancel
          </ui-button>
          <ui-button
              variant="primary"
              icon="fas fa-upload"
              :loading="uploading"
              :disabled="!canUploadMap"
              @click="uploadMap"
          >
            Upload Map
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Altri dialog per antenne e tag (nella prossima implementazione) -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useSiteConfigurationStore } from '../stores/siteConfigurationStore';
import { usePositioningStore } from '../stores/positioningStore';
import DxfMapViewer from '../components/map/DxfMapViewer.vue';
import UiButton from '../components/common/ui/Button.vue';
import UiAlert from '../components/common/ui/Alert.vue';
import { SiteMap, Antenna, TagAssignment } from '../types';

// Stores
const siteConfigStore = useSiteConfigurationStore();
const positioningStore = usePositioningStore();

// State
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const error = ref('');
const successMessage = ref('');
const activeTab = ref('maps');
const tagFilter = ref('all');
const tagSearchQuery = ref('');
const currentMapId = computed(() => siteConfigStore.currentMapId);

// Dialog state
const showMapUploadDialog = ref(false);
const showNewAntennaDialog = ref(false);
const showNewTagAssignmentDialog = ref(false);
const showNewGeofenceDialog = ref(false);

// Tabs config
const tabs = [
  { id: 'maps', label: 'Maps', icon: 'fas fa-map' },
  { id: 'antennas', label: 'Antennas', icon: 'fas fa-broadcast-tower' },
  { id: 'tags', label: 'Tag Assignments', icon: 'fas fa-tags' },
  { id: 'geofence', label: 'Geofence', icon: 'fas fa-draw-polygon' },
];

// Form state per nuovo upload mappa
const newMap = reactive({
  name: '',
  floorNumber: 1,
  file: null as File | null,
});

const fileInput = ref<HTMLInputElement | null>(null);

// Computed
const maps = computed(() => siteConfigStore.maps);
const antennasForCurrentMap = computed(() => siteConfigStore.antennasForCurrentMap);
const tagAssignments = computed(() => siteConfigStore.tagAssignments);

const filteredTagAssignments = computed(() => {
  let result = tagAssignments.value;

  // Filtra per tipo
  if (tagFilter.value !== 'all') {
    if (tagFilter.value === 'unassigned') {
      // Logica per tag non assegnati da implementare
    } else {
      result = result.filter(assignment => assignment.entityType === tagFilter.value);
    }
  }

  // Filtra per ricerca
  if (tagSearchQuery.value) {
    const query = tagSearchQuery.value.toLowerCase();
    result = result.filter(assignment => {
      // Cerca per ID tag
      if (assignment.tagId.toLowerCase().includes(query)) {
        return true;
      }

      // Cerca per nome entità
      const entityName = getEntityName(assignment).toLowerCase();
      return entityName.includes(query);
    });
  }

  return result;
});

const canUploadMap = computed(() => {
  return !!newMap.name && !!newMap.file;
});

// Methods
function selectMap(mapId: string) {
  siteConfigStore.setCurrentMap(mapId);
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function editMap(map: SiteMap) {
  // Implementare dialog di modifica mappa
  console.log('Edit map:', map);
}

function confirmDeleteMap(map: SiteMap) {
  if (confirm(`Are you sure you want to delete the map "${map.name}"?`)) {
    // Implementare delete mappa
    console.log('Delete map:', map);
  }
}

function editAntenna(antenna: Antenna) {
  // Implementare dialog di modifica antenna
  console.log('Edit antenna:', antenna);
}

function confirmDeleteAntenna(antenna: Antenna) {
  if (confirm(`Are you sure you want to delete the antenna "${antenna.name}"?`)) {
    // Implementare delete antenna
    console.log('Delete antenna:', antenna);
  }
}

function getEntityTypeIcon(type: string): string {
  return type === 'employee' ? 'fas fa-user' : 'fas fa-box';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEntityName(assignment: TagAssignment): string {
  if (assignment.entityType === 'employee') {
    const employee = positioningStore.getEmployeeById(assignment.entityId);
    return employee ? employee.name : 'Unknown Employee';
  } else if (assignment.entityType === 'asset') {
    const asset = positioningStore.getAssetById(assignment.entityId);
    return asset ? asset.name : 'Unknown Asset';
  }
  return 'Unknown';
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

  if (!position) return 'offline';

  // Considera online se l'ultima posizione è entro 5 minuti
  const lastUpdate = new Date(position.timestamp).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  return diffMinutes <= 5 ? 'online' : 'offline';
}

function editTagAssignment(assignment: TagAssignment) {
  // Implementare dialog di modifica assegnazione tag
  console.log('Edit tag assignment:', assignment);
}

function confirmDeleteTagAssignment(assignment: TagAssignment) {
  if (confirm(`Are you sure you want to remove this tag assignment?`)) {
    // Implementare delete assegnazione tag
    console.log('Delete tag assignment:', assignment);
  }
}

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    newMap.file = input.files[0];
  }
}

function handleFileDrop(event: DragEvent) {
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0];

    if (file.name.toLowerCase().endsWith('.dxf')) {
      newMap.file = file;
    } else {
      error.value = 'Please upload a DXF file';
    }
  }
}

async function uploadMap() {
  if (!newMap.name || !newMap.file) return;

  try {
    uploading.value = true;
    error.value = '';

    // Chiamata API per upload mappa
    const uploadedMap = await siteConfigStore.uploadMap(
        'current-site-id', // In un'app reale questo verrebbe dal router o dallo store
        newMap.file,
        newMap.name,
        newMap.floorNumber
    );

    successMessage.value = `Map "${newMap.name}" uploaded successfully`;
    showMapUploadDialog.value = false;

    // Reset form
    newMap.name = '';
    newMap.floorNumber = 1;
    newMap.file = null;

    // Seleziona la nuova mappa
    siteConfigStore.setCurrentMap(uploadedMap.id);
  } catch (err: any) {
    console.error('Error uploading map:', err);
    error.value = err.message || 'Failed to upload map';
  } finally {
    uploading.value = false;
  }
}

async function saveConfiguration() {
  try {
    saving.value = true;
    error.value = '';

    // Implementare salvataggio completo configurazione
    // Attendi un po' per simulare il salvataggio
    await new Promise(resolve => setTimeout(resolve, 1000));

    successMessage.value = 'Configuration saved successfully';
  } catch (err: any) {
    console.error('Error saving configuration:', err);
    error.value = err.message || 'Failed to save configuration';
  } finally {
    saving.value = false;
  }
}

function exportConfiguration() {
  // Implementare export configurazione
  console.log('Export configuration');

  // Esempio: crea un oggetto di configurazione
  const config = {
    maps: maps.value,
    antennas: antennasForCurrentMap.value,
    tagAssignments: tagAssignments.value,
    // Altre impostazioni...
  };

  // Crea un file JSON da scaricare
  const dataStr = JSON.stringify(config, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = 'site-configuration.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';

    await siteConfigStore.fetchSiteConfiguration('current-site-id');
  } catch (err: any) {
    console.error('Error loading site configuration:', err);
    error.value = err.message || 'Failed to load site configuration';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.site-config-view {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-tabs {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.tab-button {
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #343a40;
  background-color: rgba(0, 0, 0, 0.03);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background-color: white;
}

.tab-button i {
  font-size: 16px;
}

.tab-content {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
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

.maps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .maps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .maps-grid {
    grid-template-columns: 1fr;
  }
}

.map-card {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.map-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.map-card.active {
  border-color: var(--primary-color);
}

.map-preview {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.map-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f8f9fa;
}

.map-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.map-preview:hover .map-actions {
  opacity: 1;
}

.map-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: #6c757d;
}

.map-action-btn:hover {
  color: var(--primary-color);
}

.map-action-btn.delete:hover {
  color: var(--danger-color);
}

.map-info {
  padding: 12px;
}

.map-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 500;
}

.map-info p {
  margin: 0;
  font-size: 14px;
  color: var(--light-text);
}

.map-date {
  font-size: 12px;
  color: var(--very-light-text);
  margin-top: 5px;
}

.map-with-antennas {
  height: 400px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.antennas-table, .tags-table {
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

.status-badge.offline {
  background-color: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.actions-cell {
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
  color: #6c757d;
}

.table-action-btn:hover {
  background-color: #f8f9fa;
}

.table-action-btn.edit:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.table-action-btn.delete:hover {
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.filter-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
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

.search-group {
  display: flex;
  align-items: center;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0 12px;
  background-color: white;
  flex: 1;
  max-width: 300px;
}

.search-group i {
  color: var(--light-text);
  margin-right: 8px;
}

.search-group input {
  border: none;
  padding: 8px 0;
  font-size: 14px;
  width: 100%;
  outline: none;
}

.tag-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.tag-type.employee {
  color: var(--primary-color);
}

.tag-type.asset {
  color: var(--secondary-color);
}

.battery-indicator {
  width: 120px;
  height: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.battery-level {
  height: 100%;
  border-radius: 6px;
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.file-upload-container {
  margin-top: 10px;
}

.file-upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-upload-area:hover {
  border-color: var(--primary-color);
}

.file-upload-area.has-file {
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.05);
}

.file-upload-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--light-text);
}

.file-upload-message i {
  font-size: 24px;
}

.file-upload-message p {
  margin: 0;
  font-size: 14px;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-preview i {
  font-size: 24px;
  color: var(--primary-color);
}

.remove-file {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  padding: 0;
  margin-left: auto;
}

.tab-panel {
  min-height: 300px;
}
</style>
