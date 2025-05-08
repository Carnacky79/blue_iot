// client/src/stores/positioningStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TagPosition, Employee, Asset } from '../types';
import { positioningService } from '../services/positioning-service';
import { configService } from '../services/config-service';
import { PositioningEventType } from '../services/positioning/types';

export const usePositioningStore = defineStore('positioning', () => {
    // State
    const tagPositions = ref<Map<string, TagPosition>>(new Map());
    const employees = ref<Map<string, Employee>>(new Map());
    const assets = ref<Map<string, Asset>>(new Map());
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isConnected = ref(false);

    // Actions
    async function init() {
        try {
            loading.value = true;
            error.value = null;

            // Assicurati che il servizio di configurazione sia inizializzato
            configService.initialize();

            // Ottieni la configurazione del provider di posizionamento
            const positioningConfig = configService.getSetting('integrations.positioning');

            // Inizializza il servizio di posizionamento
            await positioningService.initialize(
                positioningConfig.provider,
                {
                    serverUrl: positioningConfig.serverUrl,
                    username: positioningConfig.username,
                    password: positioningConfig.password,
                    updateInterval: positioningConfig.updateInterval,
                    reconnectInterval: positioningConfig.reconnectInterval
                }
            );

            // Configura gli event listener
            setupEventListeners();

            // Da implementare: caricare i dati iniziali tramite API RESTful
            // Per ora, utilizziamo dati di esempio
            loadExampleData();
        } catch (err: any) {
            console.error('Positioning init error:', err);
            error.value = err.message || 'Failed to initialize positioning data';
        } finally {
            loading.value = false;
        }
    }

    function setupEventListeners() {
        // Rimuovi eventuali listener esistenti
        positioningService.off(PositioningEventType.POSITION_UPDATE, handlePositionUpdate);
        positioningService.off(PositioningEventType.CONNECTED, handleConnected);
        positioningService.off(PositioningEventType.DISCONNECTED, handleDisconnected);

        // Aggiungi i nuovi listener
        positioningService.on(PositioningEventType.POSITION_UPDATE, handlePositionUpdate);
        positioningService.on(PositioningEventType.CONNECTED, handleConnected);
        positioningService.on(PositioningEventType.DISCONNECTED, handleDisconnected);
    }

    function handleConnected() {
        isConnected.value = true;

        // Sottoscrivi ai tag associati agli asset e ai dipendenti
        const tagIds = getAllTagIds();
        if (tagIds.length > 0) {
            positioningService.subscribeToTags(tagIds)
                .catch(err => console.error('Error subscribing to tags:', err));
        }
    }

    function handleDisconnected() {
        isConnected.value = false;
    }

    function handlePositionUpdate(positions: TagPosition[]) {
        for (const position of positions) {
            tagPositions.value.set(position.tagId, position);
        }
    }

    function getAllTagIds(): string[] {
        const tagIds = new Set<string>();

        employees.value.forEach(employee => {
            if (employee.tagId) {
                tagIds.add(employee.tagId);
            }
        });

        assets.value.forEach(asset => {
            if (asset.tagId) {
                tagIds.add(asset.tagId);
            }
        });

        return Array.from(tagIds);
    }

    // Carica dati di esempio per lo sviluppo
    function loadExampleData() {
        // Esempio di dipendenti
        const exampleEmployees: Employee[] = [
            {
                id: '1',
                companyId: 'company1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                position: 'Construction Worker',
                department: 'Operations',
                siteId: 'site1',
                tagId: 'tag001'
            },
            {
                id: '2',
                companyId: 'company1',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1234567891',
                position: 'Site Manager',
                department: 'Management',
                siteId: 'site1',
                tagId: 'tag002'
            },
            {
                id: '3',
                companyId: 'company1',
                name: 'Robert Johnson',
                email: 'robert.johnson@example.com',
                phone: '+1234567892',
                position: 'Electrician',
                department: 'Technical',
                siteId: 'site1',
                tagId: 'tag003'
            },
            {
                id: '4',
                companyId: 'company1',
                name: 'Maria Garcia',
                email: 'maria.garcia@example.com',
                phone: '+1234567893',
                position: 'Safety Officer',
                department: 'Safety',
                siteId: 'site1',
                tagId: 'tag004'
            }
        ];

        // Esempio di asset
        const exampleAssets: Asset[] = [
            {
                id: '101',
                companyId: 'company1',
                name: 'Excavator #1',
                type: 'Heavy Equipment',
                serialNumber: 'EX-2023-001',
                description: 'Caterpillar 320 Excavator',
                siteId: 'site1',
                tagId: 'tag101'
            },
            {
                id: '102',
                companyId: 'company1',
                name: 'Concrete Mixer',
                type: 'Heavy Equipment',
                serialNumber: 'CM-2023-002',
                description: 'Mobile concrete mixer truck',
                siteId: 'site1',
                tagId: 'tag102'
            },
            {
                id: '103',
                companyId: 'company1',
                name: 'Power Generator',
                type: 'Equipment',
                serialNumber: 'PG-2023-003',
                description: 'Portable power generator 5000W',
                siteId: 'site1',
                tagId: 'tag103'
            },
            {
                id: '104',
                companyId: 'company1',
                name: 'Toolbox A',
                type: 'Tool',
                serialNumber: 'TB-2023-004',
                description: 'Complete set of hand tools',
                siteId: 'site1',
                tagId: 'tag104'
            }
        ];

        // Aggiorna le mappe
        employees.value.clear();
        exampleEmployees.forEach(employee => {
            employees.value.set(employee.id, employee);
        });

        assets.value.clear();
        exampleAssets.forEach(asset => {
            assets.value.set(asset.id, asset);
        });

        // Sottoscrivi ai tag degli asset e dei dipendenti
        if (isConnected.value) {
            const tagIds = getAllTagIds();
            if (tagIds.length > 0) {
                positioningService.subscribeToTags(tagIds)
                    .catch(err => console.error('Error subscribing to tags:', err));
            }
        }
    }

    function setEmployees(employeeList: Employee[]) {
        // Ottieni i vecchi tag ID per verificare quali tag non sono più necessari
        const oldTagIds = Array.from(employees.value.values())
            .filter(emp => emp.tagId)
            .map(emp => emp.tagId as string);

        // Aggiorna la mappa dei dipendenti
        employees.value.clear();
        for (const employee of employeeList) {
            if (employee.id) {
                employees.value.set(employee.id, employee);
            }
        }

        // Ottieni i nuovi tag ID
        const newTagIds = Array.from(employees.value.values())
            .filter(emp => emp.tagId)
            .map(emp => emp.tagId as string);

        // Calcola i tag da sottoscrivere e quelli da annullare
        const tagsToSubscribe = newTagIds.filter(tagId => !oldTagIds.includes(tagId));
        const tagsToUnsubscribe = oldTagIds.filter(tagId => !newTagIds.includes(tagId));

        // Aggiorna le sottoscrizioni
        if (isConnected.value) {
            if (tagsToSubscribe.length > 0) {
                positioningService.subscribeToTags(tagsToSubscribe)
                    .catch(err => console.error('Error subscribing to tags:', err));
            }

            if (tagsToUnsubscribe.length > 0) {
                positioningService.unsubscribeFromTags(tagsToUnsubscribe)
                    .catch(err => console.error('Error unsubscribing from tags:', err));
            }
        }
    }

    function setAssets(assetList: Asset[]) {
        // Ottieni i vecchi tag ID per verificare quali tag non sono più necessari
        const oldTagIds = Array.from(assets.value.values())
            .filter(asset => asset.tagId)
            .map(asset => asset.tagId as string);

        // Aggiorna la mappa degli asset
        assets.value.clear();
        for (const asset of assetList) {
            if (asset.id) {
                assets.value.set(asset.id, asset);
            }
        }

        // Ottieni i nuovi tag ID
        const newTagIds = Array.from(assets.value.values())
            .filter(asset => asset.tagId)
            .map(asset => asset.tagId as string);

        // Calcola i tag da sottoscrivere e quelli da annullare
        const tagsToSubscribe = newTagIds.filter(tagId => !oldTagIds.includes(tagId));
        const tagsToUnsubscribe = oldTagIds.filter(tagId => !newTagIds.includes(tagId));

        // Aggiorna le sottoscrizioni
        if (isConnected.value) {
            if (tagsToSubscribe.length > 0) {
                positioningService.subscribeToTags(tagsToSubscribe)
                    .catch(err => console.error('Error subscribing to tags:', err));
            }

            if (tagsToUnsubscribe.length > 0) {
                positioningService.unsubscribeFromTags(tagsToUnsubscribe)
                    .catch(err => console.error('Error unsubscribing from tags:', err));
            }
        }
    }

    // Gestori per l'assegnazione dei tag
    async function assignTagToEmployee(employeeId: string, tagId: string): Promise<void> {
        const employee = employees.value.get(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }

        // Se l'employee ha già un altro tag, annulla la sottoscrizione
        if (employee.tagId && employee.tagId !== tagId) {
            if (isConnected.value) {
                await positioningService.unsubscribeFromTags([employee.tagId]);
            }
        }

        // Aggiorna l'employee con il nuovo tag
        employee.tagId = tagId;
        employees.value.set(employeeId, employee);

        // Sottoscrivi al nuovo tag
        if (isConnected.value) {
            await positioningService.subscribeToTags([tagId]);
        }
    }

    async function assignTagToAsset(assetId: string, tagId: string): Promise<void> {
        const asset = assets.value.get(assetId);
        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found`);
        }

        // Se l'asset ha già un altro tag, annulla la sottoscrizione
        if (asset.tagId && asset.tagId !== tagId) {
            if (isConnected.value) {
                await positioningService.unsubscribeFromTags([asset.tagId]);
            }
        }

        // Aggiorna l'asset con il nuovo tag
        asset.tagId = tagId;
        assets.value.set(assetId, asset);

        // Sottoscrivi al nuovo tag
        if (isConnected.value) {
            await positioningService.subscribeToTags([tagId]);
        }
    }

    async function removeTagFromEmployee(employeeId: string): Promise<void> {
        const employee = employees.value.get(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }

        // Se l'employee ha un tag, annulla la sottoscrizione
        if (employee.tagId && isConnected.value) {
            await positioningService.unsubscribeFromTags([employee.tagId]);
        }

        // Rimuovi il tag dall'employee
        employee.tagId = undefined;
        employees.value.set(employeeId, employee);
    }

    async function removeTagFromAsset(assetId: string): Promise<void> {
        const asset = assets.value.get(assetId);
        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found`);
        }

        // Se l'asset ha un tag, annulla la sottoscrizione
        if (asset.tagId && isConnected.value) {
            await positioningService.unsubscribeFromTags([asset.tagId]);
        }

        // Rimuovi il tag dall'asset
        asset.tagId = undefined;
        assets.value.set(assetId, asset);
    }

    // Getter
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

    // Funzione per ottenere lo storico delle posizioni
    async function getPositionHistory(tagId: string, startTime: Date, endTime: Date): Promise<TagPosition[]> {
        try {
            if (!isConnected.value) {
                throw new Error('Positioning service not connected');
            }

            return await positioningService.getPositionHistory(tagId, startTime, endTime);
        } catch (err: any) {
            console.error('Error fetching position history:', err);
            error.value = err.message || 'Failed to fetch position history';
            return [];
        }
    }

    // Gestione della disconnessione
    function disconnect() {
        positioningService.disconnect();
        isConnected.value = false;
    }

    return {
        // State
        tagPositions,
        employees,
        assets,
        loading,
        error,
        isConnected,

        // Actions
        init,
        disconnect,
        handlePositionUpdate,
        setEmployees,
        setAssets,
        assignTagToEmployee,
        assignTagToAsset,
        removeTagFromEmployee,
        removeTagFromAsset,

        // Getter
        getTagPosition,
        getEmployeeById,
        getAssetById,
        getPositionHistory,

        // Computed
        allTagPositions,
        allEmployees,
        allAssets,
        employeePositions,
        assetPositions,
    };
});
