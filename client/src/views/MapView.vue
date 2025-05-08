<!-- client/src/views/MapView.vue -->
<template>
  <div class="map-view">
    <div class="map-header">
      <h1>Map View</h1>
      <div class="map-actions">
        <ui-button
            variant="secondary"
            icon="fas fa-sync-alt"
            :loading="loading"
            @click="refreshData"
        >
          Refresh
        </ui-button>
        <div class="floor-selector">
          <label>Floor:</label>
          <select v-model="currentMapId">
            <option v-for="map in maps" :key="map.id" :value="map.id">
              {{ map.name }} (Floor {{ map.floorNumber }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="map-container">
      <div class="map-sidebar">
        <div class="sidebar-section">
          <h3>Filters</h3>
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.showEmployees">
              <span>Employees</span>
              <span class="badge">{{ employeeCount }}</span>
            </label>
          </div>
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.showAssets">
              <span>Assets</span>
              <span class="badge">{{ assetCount }}</span>
            </label>
          </div>
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.showGeofences">
              <span>Geofences</span>
            </label>
          </div>
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.showZones">
              <span>Zones</span>
            </label>
          </div>
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.showAntennas">
              <span>Antennas</span>
            </label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Search</h3>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Search employees or assets..."
            >
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <div
                v-for="result in searchResults"
                :key="result.id"
                class="search-result-item"
                @click="focusEntity(result)"
            >
              <div class="entity-icon" :class="result.type">
                <i :class="getEntityIcon(result)"></i>
              </div>
              <div class="entity-info">
                <div class="entity-name">{{ result.name }}</div>
                <div class="entity-type">{{ result.typeName }}</div>
              </div>
              <i class="fas fa-map-marker-alt locate-icon"></i>
            </div>
          </div>

          <div v-else-if="searchQuery && searchResults.length === 0" class="no-results">
            No results found
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Alerts</h3>
          <div v-if="activeAlerts.length === 0" class="no-alerts">
            No active alerts
          </div>
          <div v-else class="alert-list">
            <div
                v-for="alert in activeAlerts"
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
                @click="focusOnAlert(alert)"
            >
              <div class="alert-icon">
                <i :class="getAlertIcon(alert)"></i>
              </div>
              <div class="alert-details">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section" v-if="selectedEntity">
          <h3>Selected Entity</h3>
          <div class="entity-details">
            <div class="entity-header">
              <div class="entity-avatar" :class="selectedEntity.type">
                <i :class="getEntityIcon(selectedEntity)"></i>
              </div>
              <div class="entity-title">
                <h4>{{ selectedEntity.name }}</h4>
                <span>{{ selectedEntity.typeName }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>
                <strong>Position:</strong>
                X: {{ formatCoordinate(selectedEntity.position?.x) }},
                Y: {{ formatCoordinate(selectedEntity.position?.y) }}
              </span>
            </div>

            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>
                <strong>Last update:</strong>
                {{ formatTime(selectedEntity.position?.timestamp) }}
              </span>
            </div>

            <div v-if="selectedEntity.type === 'employee'" class="detail-item">
              <i class="fas fa-id-badge"></i>
              <span>
                <strong>Position:</strong> {{ selectedEntity.position || 'N/A' }}
              </span>
            </div>

            <div v-if="selectedEntity.type === 'employee'" class="detail-item">
              <i class="fas fa-phone"></i>
              <span>
                <strong>Phone:</strong> {{ selectedEntity.phone || 'N/A' }}
              </span>
            </div>

            <div v-if="selectedEntity.type === 'asset'" class="detail-item">
              <i class="fas fa-barcode"></i>
              <span>
                <strong>Serial:</strong> {{ selectedEntity.serialNumber || 'N/A' }}
              </span>
            </div>

            <div v-if="selectedEntity.tagId" class="detail-item">
              <i class="fas fa-tag"></i>
              <span>
                <strong>Tag ID:</strong> {{ selectedEntity.tagId }}
              </span>
            </div>

            <div v-if="selectedEntity.tagId" class="detail-item">
              <i class="fas fa-battery-half"></i>
              <span>
                <strong>Battery:</strong>
                <span :class="getBatteryLevelClass(selectedEntity.batteryLevel || 0)">
                  {{ selectedEntity.batteryLevel || 0 }}%
                </span>
              </span>
            </div>

            <div class="entity-actions">
              <ui-button
                  variant="primary"
                  size="sm"
                  icon="fas fa-history"
                  @click="showTrackingHistory = true"
              >
                History
              </ui-button>
              <ui-button
                  variant="secondary"
                  size="sm"
                  icon="fas fa-info-circle"
                  @click="viewEntityDetails(selectedEntity)"
              >
                Details
              </ui-button>
            </div>
          </div>
        </div>
      </div>

      <div class="map-content">
        <div v-if="loading" class="map-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading map data...</span>
        </div>

        <div v-else-if="!currentMapId" class="no-map-selected">
          <i class="fas fa-map"></i>
          <h3>No Map Selected</h3>
          <p>Please select a floor from the dropdown menu.</p>
        </div>

        <DxfMapViewer
            v-else
            :mapId="currentMapId"
            :highlightedTag="highlightedTag"
            @tag-clicked="handleTagClick"
        />

        <div class="map-tools">
          <button class="tool-button" @click="zoomIn" title="Zoom In">
            <i class="fas fa-plus"></i>
          </button>
          <button class="tool-button" @click="zoomOut" title="Zoom Out">
            <i class="fas fa-minus"></i>
          </button>
          <button class="tool-button" @click="resetView" title="Reset View">
            <i class="fas fa-home"></i>
          </button>
          <button class="tool-button" @click="toggleTracking" :class="{ active: liveTracking }" title="Live Tracking">
            <i class="fas fa-location-arrow"></i>
          </button>
          <button class="tool-button" @click="toggleFullscreen" title="Fullscreen">
            <i class="fas fa-expand"></i>
          </button>
        </div>

        <div class="map-legend">
          <div class="legend-item">
            <div class="legend-marker employee"></div>
            <span>Employee</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker asset"></div>
            <span>Asset</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker geofence"></div>
            <span>Geofence</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker antenna"></div>
            <span>Antenna</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog del tracking history -->
    <div v-if="showTrackingHistory && selectedEntity" class="modal-overlay" @click="showTrackingHistory = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Tracking History: {{ selectedEntity.name }}</h2>
          <button class="modal-close" @click="showTrackingHistory = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="history-filters">
            <div class="date-range">
              <label>Time Range:</label>
              <select v-model="historyTimeRange">
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div v-if="historyTimeRange === 'custom'" class="custom-range">
              <div class="date-input">
                <label>From:</label>
                <input type="datetime-local" v-model="historyCustomStart">
              </div>
              <div class="date-input">
                <label>To:</label>
                <input type="datetime-local" v-model="historyCustomEnd">
              </div>
            </div>

            <ui-button
                variant="primary"
                size="sm"
                icon="fas fa-search"
                :loading="loadingHistory"
                @click="fetchTrackingHistory"
            >
              Apply
            </ui-button>
          </div>

          <div v-if="loadingHistory" class="loading-history">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading history data...</span>
          </div>

          <div v-else-if="trackingHistory.length === 0" class="no-history">
            <i class="fas fa-history"></i>
            <p>No tracking history available for the selected time range.</p>
          </div>

          <div v-else class="history-content">
            <div class="history-map">
              <!-- Qui andrebbe una mini-mappa con la traccia dei movimenti -->
              <div class="placeholder-map">
                <p>History map visualization will be implemented here</p>
              </div>
            </div>

            <div class="history-timeline">
              <div class="timeline-header">
                <div>Time</div>
                <div>Location</div>
                <div>Zone</div>
              </div>

              <div class="timeline-items">
                <div
                    v-for="(point, index) in trackingHistory"
                    :key="index"
                    class="timeline-item"
                    @click="highlightHistoryPoint(point)"
                >
                  <div class="time-col">{{ formatTime(point.timestamp) }}</div>
                  <div class="location-col">
                    X: {{ formatCoordinate(point.x) }},
                    Y: {{ formatCoordinate(point.y) }}
                  </div>
                  <div class="zone-col">{{ point.zoneName || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ui-button variant="light" @click="showTrackingHistory = false">
            Close
          </ui-button>
          <ui-button
              variant="primary"
              icon="fas fa-download"
              @click="exportHistory"
          >
            Export Data
          </ui-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSiteConfigurationStore } from '../stores/siteConfigurationStore';
import { usePositioningStore } from '../stores/positioningStore';
import DxfMapViewer from '../components/map/DxfMapViewer.vue';
import UiButton from '../components/common/ui/Button.vue';
import { Employee, Asset, TagPosition } from '../types';
import blueIotService from '../services/blueiot';

// Router e stores
const router = useRouter();
const route = useRoute();
const siteConfigStore = useSiteConfigurationStore();
const positioningStore = usePositioningStore();

// State principale
const loading = ref(false);
const currentMapId = ref<string | null>(null);
const searchQuery = ref('');
const highlightedTag = ref<string | null>(null);
const selectedEntity = ref<any | null>(null);
const liveTracking = ref(false);
const filters = ref({
  showEmployees: true,
  showAssets: true,
  showGeofences: true,
  showZones: true,
  showAntennas: true
});

// State per tracking history
const showTrackingHistory = ref(false);
const loadingHistory = ref(false);
const historyTimeRange = ref('1h');
const historyCustomStart = ref('');
const historyCustomEnd = ref('');
const trackingHistory = ref<any[]>([]);

// Allarmi attivi (esempio)
const activeAlerts = ref([
  {
    id: 1,
    level: 'warning',
    title: 'Geofence Violation',
    entityId: '1',
    entityType: 'employee',
    timestamp: new Date().toISOString(),
    location: { x: 120, y: 85 }
  },
  {
    id: 2,
    level: 'critical',
    title: 'Emergency Button',
    entityId: '2',
    entityType: 'employee',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    location: { x: 150, y: 75 }
  }
]);

// Computed properties
const maps = computed(() => siteConfigStore.maps);

const employeeCount = computed(() => {
  if (!filters.value.showEmployees) return 0;
  return positioningStore.employeePositions.length;
});

const assetCount = computed(() => {
  if (!filters.value.showAssets) return 0;
  return positioningStore.assetPositions.length;
});

const searchResults = computed(() => {
  if (!searchQuery.value) return [];

  const query = searchQuery.value.toLowerCase();
  const results: any[] = [];

  // Cerca tra i dipendenti
  if (filters.value.showEmployees) {
    const employees = positioningStore.allEmployees;
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        (emp.tagId && emp.tagId.toLowerCase().includes(query))
    );

    results.push(...filteredEmployees.map(emp => ({
      id: emp.id,
      name: emp.name,
      type: 'employee',
      typeName: 'Employee',
      tagId: emp.tagId,
      position: positioningStore.getTagPosition(emp.tagId || ''),
      ...emp
    })));
  }

  // Cerca tra gli asset
  if (filters.value.showAssets) {
    const assets = positioningStore.allAssets;
    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query)) ||
        (asset.tagId && asset.tagId.toLowerCase().includes(query))
    );

    results.push(...filteredAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: 'asset',
      typeName: `Asset (${asset.type})`,
      tagId: asset.tagId,
      position: positioningStore.getTagPosition(asset.tagId || ''),
      ...asset
    })));
  }

  // Ordina i risultati per rilevanza (contiene nel nome)
  results.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(query);
    const bNameMatch = b.name.toLowerCase().includes(query);

    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return 0;
  });

  return results;
});

// Lifecycle hooks
onMounted(async () => {
  await initializeMap();

  // Configura il gestore di eventi per i dati di posizione in tempo reale
  blueIotService.on('positionUpdate', handlePositionUpdate);

  // Controlla se c'è un tag da evidenziare (da query params)
  const highlightTag = route.query.highlight as string;
  if (highlightTag) {
    highlightedTag.value = highlightTag;
    findAndSelectEntityByTag(highlightTag);
  }

  // Imposta valori predefiniti per la data history
  const now = new Date();
  historyCustomEnd.value = now.toISOString().slice(0, 16);

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  historyCustomStart.value = oneHourAgo.toISOString().slice(0, 16);
});

onUnmounted(() => {
  blueIotService.off('positionUpdate', handlePositionUpdate);
});

// Osserva i cambiamenti nei query params
watch(() => route.query.highlight, (newValue) => {
  if (newValue) {
    highlightedTag.value = newValue as string;
    findAndSelectEntityByTag(newValue as string);
  } else {
    highlightedTag.value = null;
  }
});

// Methods
async function initializeMap() {
  try {
    loading.value = true;

    // Carica configurazione se non ancora caricata
    if (siteConfigStore.maps.length === 0) {
      await siteConfigStore.fetchSiteConfiguration('current-site-id');
    }

    // Imposta la mappa corrente (prima mappa disponibile o dalla configurazione salvata)
    if (siteConfigStore.maps.length > 0) {
      if (siteConfigStore.currentMapId) {
        currentMapId.value = siteConfigStore.currentMapId;
      } else if (siteConfigStore.maps[0]) {
        currentMapId.value = siteConfigStore.maps[0].id;
      }
    }

    // Inizializza dati di posizionamento
    await positioningStore.init();

  } catch (error: any) {
    console.error('Error initializing map:', error);
    // Qui potrebbero essere gestiti gli errori di inizializzazione
  } finally {
    loading.value = false;
  }
}

function handlePositionUpdate(positions: TagPosition[]) {
  // Aggiorna le posizioni nel positioningStore
  positioningStore.handlePositionUpdate(positions);

  // Se il tracking in tempo reale è attivo e un'entità è selezionata
  if (liveTracking.value && selectedEntity.value && selectedEntity.value.tagId) {
    // Aggiorna le informazioni dell'entità selezionata con i nuovi dati
    updateSelectedEntityInfo();
  }
}

function updateSelectedEntityInfo() {
  if (!selectedEntity.value || !selectedEntity.value.tagId) return;

  const position = positioningStore.getTagPosition(selectedEntity.value.tagId);
  if (position) {
    selectedEntity.value.position = position;
    selectedEntity.value.batteryLevel = position.batteryLevel;
  }
}

function handleTagClick(tagId: string) {
  highlightedTag.value = tagId;
  findAndSelectEntityByTag(tagId);
}

function findAndSelectEntityByTag(tagId: string) {
  let entity = null;

  // Cerca tra i dipendenti
  const employee = positioningStore.allEmployees.find(emp => emp.tagId === tagId);
  if (employee) {
    entity = {
      id: employee.id,
      name: employee.name,
      type: 'employee',
      typeName: 'Employee',
      position: positioningStore.getTagPosition(tagId),
      tagId,
      batteryLevel: positioningStore.getTagPosition(tagId)?.batteryLevel || 0,
      ...employee
    };
  } else {
    // Cerca tra gli asset
    const asset = positioningStore.allAssets.find(a => a.tagId === tagId);
    if (asset) {
      entity = {
        id: asset.id,
        name: asset.name,
        type: 'asset',
        typeName: `Asset (${asset.type})`,
        position: positioningStore.getTagPosition(tagId),
        tagId,
        batteryLevel: positioningStore.getTagPosition(tagId)?.batteryLevel || 0,
        ...asset
      };
    }
  }

  if (entity) {
    selectedEntity.value = entity;
  }
}

function focusEntity(entity: any) {
  if (entity && entity.tagId) {
    highlightedTag.value = entity.tagId;
    selectedEntity.value = entity;

    // Aggiorna l'URL con il tag evidenziato
    router.replace({
      query: { ...route.query, highlight: entity.tagId }
    });
  }
}

function viewEntityDetails(entity: any) {
  if (!entity) return;

  // Naviga alla vista dettagli appropriata in base al tipo di entità
  if (entity.type === 'employee') {
    router.push({
      name: 'employees',
      query: { id: entity.id }
    });
  } else if (entity.type === 'asset') {
    router.push({
      name: 'assets',
      query: { id: entity.id }
    });
  }
}

function focusOnAlert(alert: any) {
  // Trova l'entità associata all'allarme e selezionala
  if (alert.entityId && alert.entityType) {
    let entity = null;

    if (alert.entityType === 'employee') {
      entity = positioningStore.getEmployeeById(alert.entityId);
    } else if (alert.entityType === 'asset') {
      entity = positioningStore.getAssetById(alert.entityId);
    }

    if (entity && entity.tagId) {
      focusEntity({
        ...entity,
        type: alert.entityType,
        tagId: entity.tagId,
        position: positioningStore.getTagPosition(entity.tagId),
        typeName: alert.entityType === 'employee' ? 'Employee' : 'Asset'
      });
    }
  }
}

function getEntityIcon(entity: any): string {
  if (entity.type === 'employee') {
    return 'fas fa-user';
  } else if (entity.type === 'asset') {
    // Icone diverse in base al tipo di asset
    const assetIcons: Record<string, string> = {
      'Heavy Equipment': 'fas fa-truck',
      'Tool': 'fas fa-tools',
      'Material': 'fas fa-box',
      'Vehicle': 'fas fa-car',
      'Safety Equipment': 'fas fa-hard-hat',
      'Electronic': 'fas fa-laptop',
    };

    return assetIcons[entity.assetType] || 'fas fa-box';
  }

  return 'fas fa-tag';
}

function getAlertIcon(alert: any): string {
  const icons: Record<string, string> = {
    'warning': 'fas fa-exclamation-triangle',
    'critical': 'fas fa-exclamation-circle',
    'info': 'fas fa-info-circle'
  };

  return icons[alert.level] || icons.info;
}

function getBatteryLevelClass(level: number): string {
  if (level < 20) return 'critical';
  if (level < 40) return 'low';
  return 'good';
}

// Funzioni per la gestione della mappa
function zoomIn() {
  // Implementa lo zoom in
  // Qui andrebbe un riferimento al metodo del componente DxfMapViewer
  console.log('Zoom in');
}

function zoomOut() {
  // Implementa lo zoom out
  // Qui andrebbe un riferimento al metodo del componente DxfMapViewer
  console.log('Zoom out');
}

function resetView() {
  // Implementa il reset della vista
  // Qui andrebbe un riferimento al metodo del componente DxfMapViewer
  console.log('Reset view');
}

function toggleTracking() {
  liveTracking.value = !liveTracking.value;
}

function toggleFullscreen() {
  const mapContainer = document.querySelector('.map-content');
  if (!mapContainer) return;

  if (!document.fullscreenElement) {
    mapContainer.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// Funzioni per il tracking history
async function fetchTrackingHistory() {
  if (!selectedEntity.value || !selectedEntity.value.tagId) return;

  try {
    loadingHistory.value = true;

    // Calcola l'intervallo di date in base alla selezione
    let startDate: Date;
    const endDate = historyTimeRange.value === 'custom'
        ? new Date(historyCustomEnd.value)
        : new Date();

    if (historyTimeRange.value === 'custom') {
      startDate = new Date(historyCustomStart.value);
    } else {
      // Calcola la data di inizio in base al range selezionato
      const now = new Date();
      switch (historyTimeRange.value) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
      }
    }

    // Qui andrebbe una chiamata API per recuperare i dati di tracking storici
    // Per ora, generare alcuni dati di esempio
    const tagId = selectedEntity.value.tagId;

    // Dati di esempio per la cronologia
    const historyData = [];
    let currentTime = startDate.getTime();
    const endTime = endDate.getTime();
    const interval = Math.floor((endTime - currentTime) / 20); // 20 punti nel periodo

    // Posizione iniziale (casuale)
    let x = 100 + Math.random() * 200;
    let y = 100 + Math.random() * 200;

    while (currentTime <= endTime) {
      // Simula un movimento con piccole variazioni casuali
      x += (Math.random() - 0.5) * 10;
      y += (Math.random() - 0.5) * 10;

      historyData.push({
        tagId,
        timestamp: new Date(currentTime).toISOString(),
        x,
        y,
        z: 0,
        mapId: currentMapId.value,
        batteryLevel: Math.floor(80 - (currentTime - startDate.getTime()) / (endTime - startDate.getTime()) * 20),
        zoneName: Math.random() > 0.7 ? 'Work Area' : Math.random() > 0.5 ? 'Break Room' : 'Storage Area'
      });

      currentTime += interval;
    }

    trackingHistory.value = historyData;

  } catch (error) {
    console.error('Error fetching tracking history:', error);
  } finally {
    loadingHistory.value = false;
  }
}

function highlightHistoryPoint(point: any) {
  // Evidenzia il punto sulla mappa di cronologia
  console.log('Highlight history point:', point);
}

function exportHistory() {
  if (trackingHistory.value.length === 0) return;

  // Crea un CSV con i dati della cronologia
  const headers = ['Timestamp', 'X', 'Y', 'Z', 'Map', 'Battery Level', 'Zone'];
  const csvRows = [headers.join(',')];

  trackingHistory.value.forEach(point => {
    const row = [
      new Date(point.timestamp).toLocaleString(),
      point.x.toFixed(2),
      point.y.toFixed(2),
      point.z.toFixed(2),
      point.mapId,
      point.batteryLevel,
      point.zoneName || 'N/A'
    ];

    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  // Crea un link per il download e lo attiva
  const a = document.createElement('a');
  const entityName = selectedEntity.value?.name || 'entity';
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${entityName}_history_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper functions
function formatTime(timestamp: string): string {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
}

function formatCoordinate(value: number | undefined): string {
  if (value === undefined) return 'N/A';
  return value.toFixed(2);
}

// Watch per aggiornare la mappa nello store quando cambia nella vista
watch(currentMapId, (newMapId) => {
  if (newMapId) {
    siteConfigStore.setCurrentMap(newMapId);
  }
});

async function refreshData() {
  try {
    loading.value = true;
    await positioningStore.init();
  } catch (error) {
    console.error('Error refreshing positioning data:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.map-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 15px;
}

.map-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.floor-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.floor-selector label {
  font-weight: 500;
}

.floor-selector select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: #fff;
}

.map-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-sidebar {
  width: 300px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-section h3 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.filter-group {
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 8px;
}

.badge {
  margin-left: auto;
  background-color: #f0f0f0;
  color: var(--text-color);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 0 10px;
  margin-bottom: 10px;
}

.search-box i {
  color: var(--light-text);
  margin-right: 8px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  outline: none;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 5px;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.entity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
  color: white;
}

.entity-icon.employee {
  background-color: var(--primary-color);
}

.entity-icon.asset {
  background-color: var(--secondary-color);
}

.entity-info {
  flex: 1;
  overflow: hidden;
}

.entity-name {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entity-type {
  font-size: 12px;
  color: var(--light-text);
}

.locate-icon {
  color: var(--primary-color);
  margin-left: 8px;
}

.no-results, .no-alerts {
  text-align: center;
  padding: 15px;
  color: var(--light-text);
  font-style: italic;
}

.alert-list {
  max-height: 150px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
}

.alert-item:hover {
  background-color: #f5f5f5;
}

.alert-item.warning {
  border-left: 3px solid var(--warning-color);
}

.alert-item.critical {
  border-left: 3px solid var(--danger-color);
}

.alert-item.info {
  border-left: 3px solid var(--primary-color);
}

.alert-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
}

.alert-item.warning .alert-icon {
  background-color: var(--warning-color);
}

.alert-item.critical .alert-icon {
  background-color: var(--danger-color);
}

.alert-item.info .alert-icon {
  background-color: var(--primary-color);
}

.alert-details {
  flex: 1;
}

.alert-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.alert-time {
  font-size: 12px;
  color: var(--light-text);
}

.entity-details {
  padding: 10px 0;
}

.entity-header {
  display: flex;
  margin-bottom: 15px;
}

.entity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  flex-shrink: 0;
}

.entity-avatar.employee {
  background-color: var(--primary-color);
}

.entity-avatar.asset {
  background-color: var(--secondary-color);
}

.entity-title {
  flex: 1;
}

.entity-title h4 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
}

.entity-title span {
  font-size: 13px;
  color: var(--light-text);
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-item i {
  width: 16px;
  margin-right: 10px;
  color: var(--light-text);
}

.detail-item .critical {
  color: var(--danger-color);
}

.detail-item .low {
  color: var(--warning-color);
}

.detail-item .good {
  color: var(--secondary-color);
}

.entity-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.map-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-loading, .no-map-selected {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  z-index: 10;
}

.map-loading i, .no-map-selected i {
  font-size: 48px;
  color: var(--light-text);
  margin-bottom: 15px;
}

.no-map-selected h3 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
}

.no-map-selected p {
  margin: 0;
  color: var(--light-text);
}

.map-tools {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tool-button {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

.tool-button:hover {
  background-color: #f5f5f5;
}

.tool-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.map-legend {
  position: absolute;
  bottom: 15px;
  left: 15px;
  z-index: 50;
  background-color: white;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-marker.employee {
  background-color: var(--primary-color);
}

.legend-marker.asset {
  background-color: var(--secondary-color);
}

.legend-marker.geofence {
  background-color: var(--warning-color);
}

.legend-marker.antenna {
  background-color: var(--danger-color);
}

/* Modal styles */
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
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
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.history-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range label {
  font-weight: 500;
}

.date-range select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: #fff;
}

.custom-range {
  display: flex;
  gap: 10px;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-input label {
  font-size: 13px;
  color: var(--light-text);
}

.date-input input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.loading-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  gap: 15px;
}

.loading-history i {
  font-size: 24px;
  color: var(--primary-color);
}

.no-history {
  text-align: center;
  padding: 30px;
  color: var(--light-text);
}

.no-history i {
  font-size: 36px;
  margin-bottom: 10px;
  color: var(--light-text);
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-map {
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.placeholder-map {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
}

.history-timeline {
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.timeline-header {
  display: grid;
  grid-template-columns: 150px 1fr 120px;
  padding: 10px 15px;
  background-color: #f5f5f5;
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
}

.timeline-items {
  max-height: 300px;
  overflow-y: auto;
}

.timeline-item {
  display: grid;
  grid-template-columns: 150px 1fr 120px;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-item:hover {
  background-color: #f5f5f5;
}

.time-col {
  font-weight: 500;
}

.location-col, .zone-col {
  color: var(--text-color);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .map-sidebar {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
  }

  .map-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 30vh;
  }

  .map-content {
    flex: 1;
  }

  .map-legend {
    flex-direction: column;
    gap: 5px;
  }

  .history-timeline {
    overflow-x: auto;
  }

  .timeline-header, .timeline-item {
    min-width: 600px;
  }
}
</style>
