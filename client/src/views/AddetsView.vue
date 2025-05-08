<!-- client/src/views/AssetsView.vue -->
<template>
  <div class="assets-view">
    <div class="view-header">
      <h1>Assets</h1>
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
            icon="fas fa-plus"
            @click="showAssignAssetDialog = true"
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
              placeholder="Search assets..."
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Type:</label>
          <select v-model="typeFilter">
            <option value="all">All Types</option>
            <option v-for="type in assetTypes" :key="type" :value="type">
              {{ type }}
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
        <span>Loading assets...</span>
      </div>

      <div v-else-if="filteredAssets.length === 0" class="empty-state">
        <i class="fas fa-boxes"></i>
        <h3>No Assets Found</h3>
        <p v-if="hasFilters">
          Try changing your search or filter criteria.
        </p>
        <p v-else>
          No assets are currently assigned to this site.
        </p>
        <ui-button
            variant="primary"
            icon="fas fa-plus"
            @click="showAssignAssetDialog = true"
        >
          Assign Asset to Site
        </ui-button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="assets-grid">
        <div
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="asset-card"
            :class="{ 'has-tag': !!asset.tagId }"
        >
          <div class="asset-header">
            <div class="asset-icon">
              <i :class="getAssetTypeIcon(asset.type)"></i>
            </div>
            <div v-if="getAssetStatus(asset)"
                 class="asset-status"
                 :class="getAssetStatus(asset)">
              {{ getAssetStatus(asset) }}
            </div>
          </div>

          <div class="asset-info">
            <h3>{{ asset.name }}</h3>
            <p class="asset-type">{{ asset.type }}</p>
            <p class="asset-serial">Serial: {{ asset.serialNumber }}</p>

            <div class="asset-description">
              {{ asset.description }}
            </div>

            <div class="tag-info" v-if="asset.tagId">
              <div class="tag-label">
                <i class="fas fa-tag"></i>
                <span>Tag ID: {{ asset.tagId }}</span>
              </div>

              <div class="battery-indicator"
                   :data-level="getTagBatteryLevel(asset.tagId)">
                <div
                    class="battery-level"
                    :style="{ width: `${getTagBatteryLevel(asset.tagId)}%` }"
                    :class="getBatteryClass(getTagBatteryLevel(asset.tagId))"
                ></div>
                <span>{{ getTagBatteryLevel(asset.tagId) }}%</span>
              </div>
            </div>
          </div>

          <div class="asset-actions">
            <button class="card-action-btn" @click="viewAssetDetails(asset)">
              <i class="fas fa-info-circle"></i>
              Details
            </button>
            <button class="card-action-btn"
                    @click="showAssignTagDialog(asset)"
                    :disabled="!!asset.tagId">
              <i class="fas fa-tag"></i>
              {{ asset.tagId ? 'Tagged' : 'Assign Tag' }}
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="assets-table">
        <table>
          <thead>
          <tr>
            <th>Asset</th>
            <th>Type</th>
            <th>Serial Number</th>
            <th>Description</th>
            <th>Tag ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="asset in filteredAssets" :key="asset.id">
            <td>
              <div class="asset-name-cell">
                <div class="asset-icon small">
                  <i :class="getAssetTypeIcon(asset.type)"></i>
                </div>
                <span>{{ asset.name }}</span>
              </div>
            </td>
            <td>{{ asset.type }}</td>
            <td>{{ asset.serialNumber }}</td>
            <td class="description-cell">
              <div class="truncate-text">{{ asset.description }}</div>
            </td>
            <td>
              <div v-if="asset.tagId" class="tag-info-cell">
                <span class="tag-id">{{ asset.tagId }}</span>
                <div class="battery-indicator small"
                     :data-level="getTagBatteryLevel(asset.tagId)">
                  <div
                      class="battery-level"
                      :style="{ width: `${getTagBatteryLevel(asset.tagId)}%` }"
                      :class="getBatteryClass(getTagBatteryLevel(asset.tagId))"
                  ></div>
                  <span>{{ getTagBatteryLevel(asset.tagId) }}%</span>
                </div>
              </div>
              <span v-else class="no-tag">Not assigned</span>
            </td>
            <td>
                <span
                    v-if="getAssetStatus(asset)"
                    class="status-badge"
                    :class="getAssetStatus(asset)"
                >
                  {{ getAssetStatus(asset) }}
                </span>
              <span v-else class="status-badge inactive">Inactive</span>
            </td>
            <td>
              <div class="table-actions">
                <button class="table-action-btn" @click="viewAssetDetails(asset)">
                  <i class="fas fa-info-circle"></i>
                </button>
                <button
                    class="table-action-btn"
                    @click="showAssignTagDialog(asset)"
                    :disabled="!!asset.tagId"
                >
                  <i class="fas fa-tag"></i>
                </button>
                <button class="table-action-btn delete" @click="confirmRemoveFromSite(asset)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </ui-card>

    <!-- Dialog per dettagli asset -->
    <div v-if="selectedAsset" class="modal-overlay" @click="selectedAsset = null">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Asset Details</h2>
          <button class="modal-close" @click="selectedAsset = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="asset-profile">
            <div class="profile-header">
              <div class="asset-icon large">
                <i :class="getAssetTypeIcon(selectedAsset.type)"></i>
              </div>
              <div class="profile-info">
                <h3>{{ selectedAsset.name }}</h3>
                <p>{{ selectedAsset.type }}</p>
                <p>Serial: {{ selectedAsset.serialNumber }}</p>
              </div>
            </div>

            <div class="profile-details">
              <div class="detail-group">
                <h4>Description</h4>
                <p class="asset-description-text">{{ selectedAsset.description }}</p>
              </div>

              <div class="detail-group">
                <h4>Tag Information</h4>
                <div v-if="selectedAsset.tagId" class="tag-details">
                  <div class="detail-item">
                    <i class="fas fa-tag"></i>
                    <span>Tag ID: {{ selectedAsset.tagId }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-battery-half"></i>
                    <span>Battery: {{ getTagBatteryLevel(selectedAsset.tagId) }}%</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-signal"></i>
                    <span>Status: {{ getTagStatus(selectedAsset.tagId) }}</span>
                  </div>
                </div>
                <div v-else class="no-tag-details">
                  <p>No tag assigned to this asset.</p>
                  <ui-button
                      variant="primary"
                      size="sm"
                      icon="fas fa-tag"
                      @click="showAssignTagDialog(selectedAsset)"
                  >
                    Assign Tag
                  </ui-button>
                </div>
              </div>

              <div v-if="selectedAsset.tagId" class="detail-group">
                <h4>Current Location</h4>
                <div class="location-preview">
                  <!-- Qui andrebbe una mini-mappa con la posizione dell'asset -->
                  <p>Map view to be implemented...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ui-button variant="light" @click="selectedAsset = null">
            Close
          </ui-button>
          <ui-button
              v-if="selectedAsset.tagId"
              variant="primary"
              icon="fas fa-map-marked-alt"
              @click="viewOnMap(selectedAsset)"
          >
            View on Map
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Altri dialog per assegnazione tag e asset -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePositioningStore } from '../stores/positioningStore';
import UiButton from '../components/common/ui/Button.vue';
import UiCard from '../components/common/ui/Card.vue';
import UiAlert from '../components/common/ui/Alert.vue';
import { Asset } from '../types';

// Router e store
const router = useRouter();
const positioningStore = usePositioningStore();

// State
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');
const viewMode = ref('grid');
const selectedAsset = ref<Asset | null>(null);
const showAssignAssetDialog = ref(false);

// Computed
const assets = computed(() => positioningStore.allAssets);

const assetTypes = computed(() => {
  const types = new Set<string>();
  for (const asset of assets.value) {
    if (asset.type) {
      types.add(asset.type);
    }
  }
  return Array.from(types).sort();
});

const filteredAssets = computed(() => {
  let result = assets.value;

  // Filtra per ricerca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(asset => {
      return (
          asset.name.toLowerCase().includes(query) ||
          asset.type.toLowerCase().includes(query) ||
          asset.serialNumber.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query)
      );
    });
  }

  // Filtra per stato
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'active') {
      result = result.filter(asset => {
        if (!asset.tagId) return false;
        const status = getAssetStatus(asset);
        return status && status !== 'inactive';
      });
    } else if (statusFilter.value === 'inactive') {
      result = result.filter(asset => {
        if (!asset.tagId) return true;
        const status = getAssetStatus(asset);
        return !status || status === 'inactive';
      });
    }
  }

  // Filtra per tipo
  if (typeFilter.value !== 'all') {
    result = result.filter(asset =>
        asset.type === typeFilter.value
    );
  }

  return result;
});

const hasFilters = computed(() => {
  return (
      searchQuery.value !== '' ||
      statusFilter.value !== 'all' ||
      typeFilter.value !== 'all'
  );
});

// Methods
function getAssetTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'Heavy Equipment': 'fas fa-truck',
    'Tool': 'fas fa-tools',
    'Material': 'fas fa-box',
    'Vehicle': 'fas fa-car',
    'Safety Equipment': 'fas fa-hard-hat',
    'Electronic': 'fas fa-laptop',
  };

  return icons[type] || 'fas fa-box';
}

function getAssetStatus(asset: Asset): string | null {
  if (!asset.tagId) return null;

  const position = positioningStore.getTagPosition(asset.tagId);

  if (!position) return 'inactive';

  // Considera attivo se l'ultima posizione è entro 5 minuti
  const lastUpdate = new Date(position.timestamp).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  if (diffMinutes > 5) return 'inactive';

  // Qui potremmo implementare anche altri stati come "in_use" in base a regole di business
  return 'active';
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

function viewAssetDetails(asset: Asset) {
  selectedAsset.value = asset;
}

function showAssignTagDialog(asset: Asset) {
  // Qui implementare logica per l'assegnazione tag
  console.log('Assign tag to asset:', asset);
}

function confirmRemoveFromSite(asset: Asset) {
  if (confirm(`Are you sure you want to remove ${asset.name} from this site?`)) {
    // Qui implementare logica per la rimozione dal sito
    console.log('Remove asset from site:', asset);
  }
}

function viewOnMap(asset: Asset) {
  if (asset.tagId) {
    router.push({
      name: 'map',
      query: { highlight: asset.tagId, type: 'asset' }
    });
  }
}

async function refreshData() {
  try {
    loading.value = true;
    error.value = '';

    await positioningStore.init();
  } catch (err: any) {
    console.error('Error refreshing asset data:', err);
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
.assets-view {
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
.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.asset-card {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e9ecef;
}

.asset-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.asset-card.has-tag {
  border-left: 3px solid var(--secondary-color);
}

.asset-header {
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
}

.asset-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
}

.asset-icon.small {
  width: 36px;
  height: 36px;
  font-size: 14px;
  margin-bottom: 0;
  margin-right: 10px;
}

.asset-icon.large {
  width: 80px;
  height: 80px;
  font-size: 30px;
  margin-bottom: 0;
  margin-right: 20px;
}

.asset-status {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 500;
}

.asset-status.active {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--secondary-color);
}

.asset-status.in_use {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
}

.asset-status.inactive {
  background-color: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.asset-info {
  padding: 15px 20px;
}

.asset-info h3 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 600;
}

.asset-type {
  margin: 0 0 2px;
  font-size: 14px;
  color: var(--text-color);
}

.asset-serial {
  margin: 0 0 15px;
  font-size: 14px;
  color: var(--light-text);
}

.asset-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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
  color: var(--secondary-color);
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

.asset-actions {
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
  color: var(--secondary-color);
  transition: background-color 0.2s;
}

.card-action-btn:hover {
  background-color: rgba(46, 204, 113, 0.05);
}

.card-action-btn:disabled {
  color: var(--light-text);
  cursor: not-allowed;
}

.card-action-btn:first-child {
  border-right: 1px solid #e9ecef;
}

/* Table View */
.assets-table {
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

.asset-name-cell {
  display: flex;
  align-items: center;
}

.description-cell {
  max-width: 250px;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tag-info-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tag-id {
  font-size: 14px;
  color: var(--secondary-color);
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

.status-badge.active {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--secondary-color);
}

.status-badge.in_use {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
}

.status-badge.inactive {
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
  color: var(--secondary-color);
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

.asset-profile {
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

.asset-description-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.6;
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
