<!-- client/src/components/map/DxfMapViewer.vue -->
<template>
  <div class="dxf-map-container" ref="mapContainer">
    <div class="dxf-map-controls" v-if="map">
      <button @click="zoomIn" title="Zoom In">
        <i class="fas fa-plus"></i>
      </button>
      <button @click="zoomOut" title="Zoom Out">
        <i class="fas fa-minus"></i>
      </button>
      <button @click="resetView" title="Reset View">
        <i class="fas fa-home"></i>
      </button>
    </div>

    <div class="dxf-map-canvas-container">
      <canvas ref="mapCanvas" class="dxf-map-canvas"></canvas>

      <div v-if="isEditing" class="dxf-map-edit-overlay">
        <div
            v-for="antenna in antennas"
            :key="antenna.id"
            class="antenna-marker"
            :style="getAntennaMarkerStyle(antenna)"
            @mousedown="startDragAntenna($event, antenna)"
        >
          <div class="antenna-icon"></div>
          <div class="antenna-label">{{ antenna.name }}</div>
        </div>

        <div
            v-for="tagAssignment in tagAssignments"
            :key="tagAssignment.id"
            class="tag-marker"
            :class="getTagMarkerClass(tagAssignment)"
            :style="getTagMarkerStyle(tagAssignment)"
        >
          <div class="tag-icon"></div>
          <div class="tag-label">{{ getTagLabel(tagAssignment) }}</div>
        </div>
      </div>
    </div>

    <div v-if="!map" class="dxf-map-placeholder">
      <p>No map loaded. Please upload a map file.</p>
      <label class="upload-button">
        Upload Map
        <input type="file" accept=".dxf" @change="handleMapUpload" hidden>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSiteConfigurationStore } from '../../stores/siteConfigurationStore';
import { usePositioningStore } from '../../stores/positioningStore';
import { Antenna, TagAssignment } from '../../types';
import * as THREE from 'three';
import { DXFLoader } from '../../utils/dxfLoader';

const props = defineProps<{
  mapId?: string;
  isEditing?: boolean;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
const mapCanvas = ref<HTMLCanvasElement | null>(null);
const draggedAntenna = ref<Antenna | null>(null);
const dragStartPosition = ref({ x: 0, y: 0 });

const siteConfigStore = useSiteConfigurationStore();
const positioningStore = usePositioningStore();

// Three.js variables
let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let dxfObject: THREE.Group | null = null;

// Computed properties
const map = computed(() => {
  if (props.mapId) {
    return siteConfigStore.maps.find(m => m.id === props.mapId) || null;
  }
  return siteConfigStore.currentMap;
});

const antennas = computed(() => {
  if (!map.value) return [];
  return siteConfigStore.antennas.filter(a => a.mapId === map.value?.id);
});

const tagAssignments = computed(() => {
  if (!map.value) return [];

  // Get real-time positions for assigned tags
  return siteConfigStore.tagAssignments.filter(assignment => {
    const position = positioningStore.getTagPosition(assignment.tagId);
    return position && position.mapId === map.value?.id;
  });
});

// Methods for map rendering
function initializeThreeJs() {
  if (!mapCanvas.value) return;

  // Initialize scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Initialize camera (orthographic for 2D viewing)
  const width = mapContainer.value?.clientWidth || 800;
  const height = mapContainer.value?.clientHeight || 600;
  const aspectRatio = width / height;

  camera = new THREE.OrthographicCamera(
      -10 * aspectRatio, 10 * aspectRatio,
      10, -10,
      0.1, 1000
  );
  camera.position.z = 10;

  // Initialize renderer
  renderer = new THREE.WebGLRenderer({
    canvas: mapCanvas.value,
    antialias: true
  });
  renderer.setSize(width, height);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Start animation loop
  animate();
}

function loadDxfMap(mapUrl: string) {
  if (!scene) return;

  // Clear previous map if exists
  if (dxfObject) {
    scene.remove(dxfObject);
    dxfObject = null;
  }

  // Load new DXF file
  const loader = new DXFLoader();
  loader.load(mapUrl, (object) => {
    dxfObject = object;
    scene?.add(object);

    // Center and fit the map
    fitMapToView();
  });
}

function fitMapToView() {
  if (!dxfObject || !camera) return;

  // Calculate bounding box
  const boundingBox = new THREE.Box3().setFromObject(dxfObject);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  // Center the map
  dxfObject.position.x = -center.x;
  dxfObject.position.y = -center.y;

  // Adjust camera
  const maxDim = Math.max(size.x, size.y);
  const aspectRatio = mapContainer.value?.clientWidth || 1 / mapContainer.value?.clientHeight || 1;

  if (camera instanceof THREE.OrthographicCamera) {
    camera.left = -maxDim * aspectRatio / 2;
    camera.right = maxDim * aspectRatio / 2;
    camera.top = maxDim / 2;
    camera.bottom = -maxDim / 2;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  if (!renderer || !scene || !camera) return;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function zoomIn() {
  if (!camera || !(camera instanceof THREE.OrthographicCamera)) return;

  camera.left *= 0.8;
  camera.right *= 0.8;
  camera.top *= 0.8;
  camera.bottom *= 0.8;
  camera.updateProjectionMatrix();
}

function zoomOut() {
  if (!camera || !(camera instanceof THREE.OrthographicCamera)) return;

  camera.left *= 1.2;
  camera.right *= 1.2;
  camera.top *= 1.2;
  camera.bottom *= 1.2;
  camera.updateProjectionMatrix();
}

function resetView() {
  fitMapToView();
}

function handleMapUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file.name.toLowerCase().endsWith('.dxf')) {
    alert('Please upload a DXF file');
    return;
  }

  // Create a dialog to get map name and floor number
  const mapName = prompt('Enter map name:', file.name.replace('.dxf', ''));
  if (!mapName) return;

  const floorNumberStr = prompt('Enter floor number:', '1');
  if (!floorNumberStr) return;

  const floorNumber = parseInt(floorNumberStr, 10);
  if (isNaN(floorNumber)) {
    alert('Floor number must be a valid number');
    return;
  }

  // Upload map to server
  siteConfigStore.uploadMap('current-site-id', file, mapName, floorNumber)
      .then((newMap) => {
        alert(`Map "${mapName}" uploaded successfully!`);
        siteConfigStore.setCurrentMap(newMap.id);
      })
      .catch((error) => {
        alert(`Failed to upload map: ${error.message}`);
      });
}

// Methods for editing antennas
function getAntennaMarkerStyle(antenna: Antenna) {
  return {
    left: `${antenna.x}px`,
    top: `${antenna.y}px`
  };
}

function startDragAntenna(event: MouseEvent, antenna: Antenna) {
  if (!props.isEditing) return;

  draggedAntenna.value = antenna;
  dragStartPosition.value = {
    x: event.clientX,
    y: event.clientY
  };

  // Add event listeners for drag
  document.addEventListener('mousemove', handleAntennaDrag);
  document.addEventListener('mouseup', stopDragAntenna);

  event.preventDefault();
}

function handleAntennaDrag(event: MouseEvent) {
  if (!draggedAntenna.value) return;

  const dx = event.clientX - dragStartPosition.value.x;
  const dy = event.clientY - dragStartPosition.value.y;

  // Update antenna position in store
  siteConfigStore.updateAntenna(draggedAntenna.value.id, {
    x: draggedAntenna.value.x + dx,
    y: draggedAntenna.value.y + dy
  });

  // Update drag start position
  dragStartPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
}

function stopDragAntenna() {
  draggedAntenna.value = null;

  // Remove event listeners
  document.removeEventListener('mousemove', handleAntennaDrag);
  document.removeEventListener('mouseup', stopDragAntenna);
}

// Methods for tag markers
function getTagMarkerClass(tagAssignment: TagAssignment) {
  const entityType = tagAssignment.entityType;
  return {
    'tag-marker-employee': entityType === 'employee',
    'tag-marker-asset': entityType === 'asset'
  };
}

function getTagMarkerStyle(tagAssignment: TagAssignment) {
  const position = positioningStore.getTagPosition(tagAssignment.tagId);

  if (!position) return { display: 'none' };

  return {
    left: `${position.x}px`,
    top: `${position.y}px`
  };
}

function getTagLabel(tagAssignment: TagAssignment) {
  if (tagAssignment.entityType === 'employee') {
    const employee = positioningStore.getEmployeeById(tagAssignment.entityId);
    return employee ? employee.name : `Tag ${tagAssignment.tagId}`;
  } else if (tagAssignment.entityType === 'asset') {
    const asset = positioningStore.getAssetById(tagAssignment.entityId);
    return asset ? asset.name : `Tag ${tagAssignment.tagId}`;
  }

  return `Tag ${tagAssignment.tagId}`;
}

// Lifecycle hooks
onMounted(() => {
  initializeThreeJs();

  // Load map if available
  if (map.value && map.value.url) {
    loadDxfMap(map.value.url);
  }

  // Resize handler
  const handleResize = () => {
    if (!renderer || !camera || !mapContainer.value) return;

    const width = mapContainer.value.clientWidth;
    const height = mapContainer.value.clientHeight;

    renderer.setSize(width, height);

    if (camera instanceof THREE.OrthographicCamera) {
      const aspectRatio = width / height;

      const currentHeight = camera.top - camera.bottom;
      const currentWidth = camera.right - camera.left;

      const newWidth = currentHeight * aspectRatio;

      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.updateProjectionMatrix();
    }
  };

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);

  // Dispose Three.js resources
  if (renderer) {
    renderer.dispose();
  }
});
// Watch for map changes
watch(() => map.value?.url, (newUrl) => {
  if (newUrl) {
    loadDxfMap(newUrl);
  }
});
</script>

<style scoped>
.dxf-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dxf-map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dxf-map-controls button {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dxf-map-controls button:hover {
  background: #f5f5f5;
}

.dxf-map-canvas-container {
  width: 100%;
  height: 100%;
}

.dxf-map-canvas {
  width: 100%;
  height: 100%;
}

.dxf-map-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dxf-map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.upload-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.antenna-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: move;
}

.antenna-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff6b6b;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.antenna-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 4px;
  border-radius: 2px;
}

.tag-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.tag-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tag-marker-employee .tag-icon {
  background: #3498db;
  border: 2px solid white;
}

.tag-marker-asset .tag-icon {
  background: #2ecc71;
  border: 2px solid white;
}

.tag-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.8);
  padding: 1px 3px;
  border-radius: 2px;
}
</style>
