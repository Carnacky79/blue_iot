// client/src/stores/siteConfigurationStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SiteMap, Antenna, TagAssignment } from '../types';
import apiService from '../services/api';

export const useSiteConfigurationStore = defineStore('siteConfiguration', () => {
    // State
    const maps = ref<SiteMap[]>([]);
    const currentMapId = ref<string | null>(null);
    const antennas = ref<Antenna[]>([]);
    const tagAssignments = ref<TagAssignment[]>([]);
    const isConfiguring = ref(false);

    // Getters
    const currentMap = computed(() => {
        return maps.value.find(map => map.id === currentMapId.value) || null;
    });

    const antennasForCurrentMap = computed(() => {
        if (!currentMapId.value) return [];
        return antennas.value.filter(antenna => antenna.mapId === currentMapId.value);
    });

    // Actions
    async function fetchSiteConfiguration(siteId: string) {
        try {
            isConfiguring.value = true;

            // Fetch maps
            const fetchedMaps = await apiService.getMaps(siteId);
            maps.value = fetchedMaps;

            if (fetchedMaps.length > 0 && !currentMapId.value) {
                currentMapId.value = fetchedMaps[0].id;
            }

            // Fetch antennas
            const fetchedAntennas = await apiService.getAntennas(siteId);
            antennas.value = fetchedAntennas;

            // Fetch tag assignments
            const fetchedAssignments = await apiService.getTagAssignments(siteId);
            tagAssignments.value = fetchedAssignments;
        } catch (error) {
            console.error('Failed to fetch site configuration:', error);
            throw new Error('Failed to load site configuration');
        } finally {
            isConfiguring.value = false;
        }
    }

    async function uploadMap(siteId: string, file: File, mapName: string, floorNumber: number) {
        try {
            isConfiguring.value = true;

            const newMap = await apiService.uploadMap(siteId, file, mapName, floorNumber);
            maps.value.push(newMap);

            if (!currentMapId.value) {
                currentMapId.value = newMap.id;
            }

            return newMap;
        } catch (error) {
            console.error('Failed to upload map:', error);
            throw new Error('Failed to upload map');
        } finally {
            isConfiguring.value = false;
        }
    }

    async function addAntenna(antenna: Omit<Antenna, 'id'>) {
        try {
            isConfiguring.value = true;

            const newAntenna = await apiService.createAntenna(antenna);
            antennas.value.push(newAntenna);

            return newAntenna;
        } catch (error) {
            console.error('Failed to add antenna:', error);
            throw new Error('Failed to add antenna');
        } finally {
            isConfiguring.value = false;
        }
    }

    async function assignTag(assignment: Omit<TagAssignment, 'id'>) {
        try {
            isConfiguring.value = true;

            const newAssignment = await apiService.createTagAssignment(assignment);
            tagAssignments.value.push(newAssignment);

            return newAssignment;
        } catch (error) {
            console.error('Failed to assign tag:', error);
            throw new Error('Failed to assign tag');
        } finally {
            isConfiguring.value = false;
        }
    }

    async function updateAntenna(antennaId: string, updates: Partial<Antenna>) {
        try {
            isConfiguring.value = true;

            const updatedAntenna = await apiService.updateAntenna(antennaId, updates);

            const index = antennas.value.findIndex(a => a.id === antennaId);
            if (index !== -1) {
                antennas.value[index] = updatedAntenna;
            }

            return updatedAntenna;
        } catch (error) {
            console.error('Failed to update antenna:', error);
            throw new Error('Failed to update antenna');
        } finally {
            isConfiguring.value = false;
        }
    }

    async function removeAntenna(antennaId: string) {
        try {
            isConfiguring.value = true;

            await apiService.deleteAntenna(antennaId);

            antennas.value = antennas.value.filter(a => a.id !== antennaId);
        } catch (error) {
            console.error('Failed to remove antenna:', error);
            throw new Error('Failed to remove antenna');
        } finally {
            isConfiguring.value = false;
        }
    }

    function setCurrentMap(mapId: string) {
        currentMapId.value = mapId;
    }

    return {
        // State
        maps,
        currentMapId,
        antennas,
        tagAssignments,
        isConfiguring,

        // Getters
        currentMap,
        antennasForCurrentMap,

        // Actions
        fetchSiteConfiguration,
        uploadMap,
        addAntenna,
        assignTag,
        updateAntenna,
        removeAntenna,
        setCurrentMap
    };
});
