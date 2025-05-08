<!-- client/src/components/map/TagAssignmentDialog.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading available tags...</span>
        </div>

        <div v-else>
          <div class="form-group">
            <label>{{ entityLabel }}</label>
            <div class="entity-card">
              <div v-if="entityType === 'employee'" class="entity-avatar">
                <span>{{ getEmployeeInitials(entity) }}</span>
              </div>
              <div v-else class="entity-icon">
                <i :class="getAssetIcon(entity)"></i>
              </div>
              <div class="entity-info">
                <h3>{{ entity.name }}</h3>
                <p>{{ entityType === 'employee' ? entity.position : entity.type }}</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="tag-id">Select Tag</label>

            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by tag ID..."
              />
            </div>

            <div v-if="filteredTags.length === 0" class="no-tags">
              No available tags found. Please add tags to the system.
            </div>

            <div v-else class="tags-list">
              <div
                  v-for="tag in filteredTags"
                  :key="tag.id"
                  class="tag-item"
                  :class="{ 'selected': selectedTagId === tag.id }"
                  @click="selectTag(tag.id)"
              >
                <div class="tag-check">
                  <i v-if="selectedTagId === tag.id" class="fas fa-check-circle"></i>
                  <i v-else class="far fa-circle"></i>
                </div>
                <div class="tag-info">
                  <div class="tag-id">{{ tag.id }}</div>
                  <div v-if="tag.status" class="tag-status" :class="tag.status">
                    {{ tag.status }}
                  </div>
                </div>
                <div v-if="tag.battery !== undefined" class="tag-battery" :class="getBatteryClass(tag.battery)">
                  <i class="fas fa-battery-half"></i>
                  <span>{{ tag.battery }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <ui-button variant="light" @click="$emit('close')">
          Cancel
        </ui-button>
        <ui-button
            variant="primary"
            :disabled="!selectedTagId || assigning"
            :loading="assigning"
            @click="assignTag"
        >
          Assign Tag
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import UiButton from '../common/ui/Button.vue';
import { Employee, Asset } from '../../types';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ['employee', 'asset'].includes(value)
  },
  entity: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'assign']);

// State
const loading = ref(false);
const assigning = ref(false);
const selectedTagId = ref<string | null>(null);
const searchQuery = ref('');
const availableTags = ref<{ id: string, status?: string, battery?: number }[]>([]);

// Computed
const title = computed(() => {
  return `Assign Tag to ${props.entityType === 'employee' ? 'Employee' : 'Asset'}`;
});

const entityLabel = computed(() => {
  return props.entityType === 'employee' ? 'Employee' : 'Asset';
});

const filteredTags = computed(() => {
  if (!searchQuery.value) {
    return availableTags.value;
  }

  const query = searchQuery.value.toLowerCase();
  return availableTags.value.filter(tag =>
      tag.id.toLowerCase().includes(query)
  );
});

// Methods
function getEmployeeInitials(employee: any): string {
  if (!employee || !employee.name) return '';

  const parts = employee.name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAssetIcon(asset: any): string {
  if (!asset || !asset.type) return 'fas fa-box';

  const icons: Record<string, string> = {
    'Heavy Equipment': 'fas fa-truck',
    'Tool': 'fas fa-tools',
    'Material': 'fas fa-box',
    'Vehicle': 'fas fa-car',
    'Safety Equipment': 'fas fa-hard-hat',
    'Electronic': 'fas fa-laptop',
  };

  return icons[asset.type] || 'fas fa-box';
}

function getBatteryClass(level: number): string {
  if (level < 20) return 'critical';
  if (level < 40) return 'low';
  return 'good';
}

function selectTag(tagId: string): void {
  selectedTagId.value = tagId;
}

async function assignTag(): Promise<void> {
  if (!selectedTagId.value) return;

  try {
    assigning.value = true;

    // Simula un ritardo di rete
    await new Promise(resolve => setTimeout(resolve, 800));

    // Emetti l'evento di assegnazione
    emit('assign', {
      entityId: props.entity.id,
      entityType: props.entityType,
      tagId: selectedTagId.value
    });

    // Chiudi il dialogo
    emit('close');
  } catch (error) {
    console.error('Error assigning tag:', error);
  } finally {
    assigning.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;

    // In una implementazione reale, qui avremo una chiamata API per ottenere i tag disponibili
    // Per ora, creiamo alcuni dati di esempio
    await new Promise(resolve => setTimeout(resolve, 800));

    availableTags.value = [
      { id: 'TAG001', status: 'online', battery: 90 },
      { id: 'TAG002', status: 'online', battery: 85 },
      { id: 'TAG003', status: 'offline', battery: 25 },
      { id: 'TAG004', status: 'online', battery: 70 },
      { id: 'TAG005', status: 'online', battery: 60 },
      { id: 'TAG006', status: 'offline', battery: 15 },
      { id: 'TAG007', status: 'online', battery: 95 },
    ];

    // Se l'entità ha già un tag assegnato, selezionalo
    if (props.entity.tagId) {
      selectedTagId.value = props.entity.tagId;
    }
  } catch (error) {
    console.error('Error loading available tags:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  gap: 15px;
}

.loading-container i {
  font-size: 24px;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.entity-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.entity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  margin-right: 15px;
  flex-shrink: 0;
}

.entity-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 15px;
  flex-shrink: 0;
}

.entity-info {
  flex: 1;
}

.entity-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 500;
}

.entity-info p {
  margin: 0;
  color: var(--light-text);
  font-size: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0 15px;
  margin-bottom: 15px;
}

.search-box i {
  color: var(--light-text);
  margin-right: 10px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 0;
  font-size: 14px;
}

.no-tags {
  padding: 20px;
  text-align: center;
  color: var(--light-text);
  font-style: italic;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.tags-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag-item:last-child {
  border-bottom: none;
}

.tag-item:hover {
  background-color: #f8f9fa;
}

.tag-item.selected {
  background-color: rgba(52, 152, 219, 0.05);
}

.tag-check {
  margin-right: 15px;
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}

.tag-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-id {
  font-weight: 500;
  font-size: 14px;
}

.tag-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.tag-status.online {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--secondary-color);
}

.tag-status.offline {
  background-color: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.tag-battery {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-left: 15px;
}

.tag-battery.good {
  color: var(--secondary-color);
}

.tag-battery.low {
  color: var(--warning-color);
}

.tag-battery.critical {
  color: var(--danger-color);
}
</style>
