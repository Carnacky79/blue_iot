// client/src/stores/positioningStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TagPosition, Employee, Asset } from '../types';
import blueIotService from '../services/blueiot';

export const usePositioningStore = defineStore('positioning', () => {
    // State
    const tagPositions = ref<Map<string, TagPosition>>(new Map());
    const employees = ref<Map<string, Employee>>(new Map());
    const assets = ref<Map<string, Asset>>(new Map());
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Actions
    async function init() {
        try {
            loading.value = true;
            error.value = null;

            // Configura gli event listener per BlueIOT
            blueIotService.on('positionUpdate', handlePositionUpdate);

            // Da implementare: caricare i dati iniziali tramite API RESTful
        } catch (err: any) {
            console.error('Positioning init error:', err);
            error.value = err.message || 'Failed to initialize positioning data';
        } finally {
            loading.value = false;
        }
    }

    function handlePositionUpdate(positions: TagPosition[]) {
        for (const position of positions) {
            tagPositions.value.set(position.tagId, position);
        }
    }

    function setEmployees(employeeList: Employee[]) {
        employees.value.clear();
        for (const employee of employeeList) {
            if (employee.id) {
                employees.value.set(employee.id, employee);
            }
        }
    }

    function setAssets(assetList: Asset[]) {
        assets.value.clear();
        for (const asset of assetList) {
            if (asset.id) {
                assets.value.set(asset.id, asset);
            }
        }
    }

    // Getters
    function getTagPosition(tagId: string): TagPosition | undefined {
        return tagPositions.value.get(tagId);
    }

    function getEmployeeById(employeeId: string): Employee | undefined {
        return employees.value.get(employeeId);
    }

    function getAssetById(assetId: string): Asset | undefined {
        return assets.value.get(assetId);
    }

    // Computed
    const allTagPositions = computed(() => Array.from(tagPositions.value.values()));

    const allEmployees = computed(() => Array.from(employees.value.values()));

    const allAssets = computed(() => Array.from(assets.value.values()));

    const employeePositions = computed(() => {
        const result: Array<{ employee: Employee; position: TagPosition }> = [];

        for (const employee of employees.value.values()) {
            if (employee.tagId) {
                const position = tagPositions.value.get(employee.tagId);
                if (position) {
                    result.push({ employee, position });
                }
            }
        }

        return result;
    });

    const assetPositions = computed(() => {
        const result: Array<{ asset: Asset; position: TagPosition }> = [];

        for (const asset of assets.value.values()) {
            if (asset.tagId) {
                const position = tagPositions.value.get(asset.tagId);
                if (position) {
                    result.push({ asset, position });
                }
            }
        }

        return result;
    });

    return {
        // State
        tagPositions,
        employees,
        assets,
        loading,
        error,

        // Actions
        init,
        handlePositionUpdate,
        setEmployees,
        setAssets,

        // Getters
        getTagPosition,
        getEmployeeById,
        getAssetById,

        // Computed
        allTagPositions,
        allEmployees,
        allAssets,
        employeePositions,
        assetPositions,
    };
});
