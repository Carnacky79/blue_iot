// client/src/services/positioning/mock-provider.ts
import { PositioningProvider, PositioningConfig, PositioningEventType } from './types';
import { TagPosition } from '../../types';
import { EventEmitter } from 'events';

/**
 * Provider di posizionamento simulato
 * Implementa l'interfaccia PositioningProvider per test e sviluppo
 */
export class MockPositioningProvider implements PositioningProvider {
    private config: PositioningConfig | null = null;
    private isConnected = false;
    private tagPositions = new Map<string, TagPosition>();
    private subscribedTags = new Set<string>();
    private eventEmitter = new EventEmitter();
    private updateInterval: number | null = null;

    /**
     * Inizializza il provider simulato
     * @param config Configurazione per la simulazione
     */
    async initialize(config: PositioningConfig): Promise<void> {
        this.config = { ...config };

        return new Promise<void>((resolve) => {
            // Simula un ritardo di connessione
            setTimeout(() => {
                this.isConnected = true;
                this.eventEmitter.emit(PositioningEventType.CONNECTED, null);

                // Inizia la simulazione di aggiornamenti di posizione
                this.startPositionSimulation();

                resolve();
            }, 500);
        });
    }

    /**
     * Disconnette dal provider simulato
     */
    disconnect(): void {
        this.isConnected = false;

        // Ferma la simulazione di aggiornamenti
        if (this.updateInterval !== null) {
            window.clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.eventEmitter.emit(PositioningEventType.DISCONNECTED, null);
    }

    /**
     * Inizia la simulazione di aggiornamenti di posizione
     */
    private startPositionSimulation(): void {
        // Ferma eventuali simulazioni precedenti
        if (this.updateInterval !== null) {
            window.clearInterval(this.updateInterval);
        }

        // Avvia una nuova simulazione
        const updateFrequency = this.config?.updateInterval || 2000;

        this.updateInterval = window.setInterval(() => {
            if (!this.isConnected) {
                return;
            }

            // Genera aggiornamenti di posizione simulati
            this.generatePositionUpdates();

            // Occasionalmente genera altri tipi di eventi
            if (Math.random() < 0.1) {
                this.generateBatteryUpdates();
            }

            if (Math.random() < 0.05) {
                this.generateTagStatusUpdates();
            }

            if (Math.random() < 0.02) {
                this.generateAlarmEvents();
            }
        }, updateFrequency);
    }

    /**
     * Genera aggiornamenti di posizione simulati
     */
    private generatePositionUpdates(): void {
        if (this.subscribedTags.size === 0) {
            return;
        }

        const positions: TagPosition[] = [];

        this.subscribedTags.forEach(tagId => {
            // Ottieni la posizione corrente o genera una nuova posizione iniziale
            let position = this.tagPositions.get(tagId);

            if (!position) {
                // Posizione iniziale casuale
                position = {
                    tagId,
                    x: 100 + Math.random() * 300,
                    y: 100 + Math.random() * 200,
                    z: 0,
                    mapId: 'map-1', // ID mappa di esempio
                    timestamp: new Date().toISOString(),
                    batteryLevel: 80 + Math.floor(Math.random() * 20)
                };
            } else {
                // Aggiorna la posizione con piccoli spostamenti casuali
                position = {
                    ...position,
                    x: position.x + (Math.random() - 0.5) * 10,
                    y: position.y + (Math.random() - 0.5) * 10,
                    timestamp: new Date().toISOString()
                };
            }

            // Aggiorna la mappa delle posizioni
            this.tagPositions.set(tagId, position);

            // Aggiungi alla lista di posizioni aggiornate
            positions.push(position);
        });

        // Emetti evento di aggiornamento posizione
        if (positions.length > 0) {
            this.eventEmitter.emit(PositioningEventType.POSITION_UPDATE, positions);
        }
    }

    /**
     * Genera aggiornamenti di batteria simulati
     */
    private generateBatteryUpdates(): void {
        if (this.subscribedTags.size === 0) {
            return;
        }

        const batteryUpdates: any[] = [];

        // Seleziona alcuni tag casuali per gli aggiornamenti
        const tagsToUpdate = Array.from(this.subscribedTags)
            .filter(() => Math.random() < 0.3);

        tagsToUpdate.forEach(tagId => {
            const position = this.tagPositions.get(tagId);

            if (position) {
                // Riduce un po' il livello della batteria
                const newLevel = Math.max(0, position.batteryLevel - Math.random() * 2);

                // Aggiorna la mappa delle posizioni
                position.batteryLevel = newLevel;
                this.tagPositions.set(tagId, position);

                // Aggiungi alla lista di aggiornamenti
                batteryUpdates.push({
                    tagId,
                    level: newLevel,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Emetti evento di aggiornamento batteria
        if (batteryUpdates.length > 0) {
            this.eventEmitter.emit(PositioningEventType.BATTERY_UPDATE, batteryUpdates);
        }
    }

    /**
     * Genera aggiornamenti di stato dei tag simulati
     */
    private generateTagStatusUpdates(): void {
        if (this.subscribedTags.size === 0) {
            return;
        }

        const statusUpdates: any[] = [];

        // Seleziona alcuni tag casuali per gli aggiornamenti
        const tagsToUpdate = Array.from(this.subscribedTags)
            .filter(() => Math.random() < 0.2);

        tagsToUpdate.forEach(tagId => {
            // Stati possibili
            const statuses = ['active', 'inactive', 'warning'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            statusUpdates.push({
                tagId,
                status: randomStatus,
                timestamp: new Date().toISOString()
            });
        });

        // Emetti evento di cambio stato
        if (statusUpdates.length > 0) {
            this.eventEmitter.emit(PositioningEventType.TAG_STATUS_CHANGE, statusUpdates);
        }
    }

    /**
     * Genera eventi di allarme simulati
     */
    private generateAlarmEvents(): void {
        if (this.subscribedTags.size === 0) {
            return;
        }

        // Seleziona un tag casuale
        const tags = Array.from(this.subscribedTags);
        const randomTagId = tags[Math.floor(Math.random() * tags.length)];

        // Tipi di allarme possibili
        const alarmTypes = ['geofence', 'emergency', 'lowBattery', 'tagOffline'];
        const randomAlarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];

        const position = this.tagPositions.get(randomTagId);

        if (position) {
            const alarm = {
                type: randomAlarmType,
                tagId: randomTagId,
                location: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    mapId: position.mapId
                },
                timestamp: new Date().toISOString(),
                message: `Simulated ${randomAlarmType} alarm`
            };

            // Emetti evento di allarme
            this.eventEmitter.emit(PositioningEventType.ALARM, alarm);
        }
    }

    /**
     * Sottoscrive agli aggiornamenti di posizione per specifici tag
     * @param tagIds Array di ID tag da monitorare
     */
    async subscribeToTags(tagIds: string[]): Promise<void> {
        // Aggiungi i tag alla lista di sottoscrizioni
        tagIds.forEach(tagId => {
            this.subscribedTags.add(tagId);
        });

        return Promise.resolve();
    }

    /**
     * Annulla la sottoscrizione per specifici tag
     * @param tagIds Array di ID tag da non monitorare più
     */
    async unsubscribeFromTags(tagIds: string[]): Promise<void> {
        // Rimuovi i tag dalla lista di sottoscrizioni
        tagIds.forEach(tagId => {
            this.subscribedTags.delete(tagId);
            this.tagPositions.delete(tagId);
        });

        return Promise.resolve();
    }

    /**
     * Registra un listener per gli eventi di posizionamento
     * @param eventType Tipo di evento
     * @param callback Funzione da chiamare quando l'evento viene emesso
     */
    on(eventType: string, callback: (data: any) => void): void {
        this.eventEmitter.on(eventType, callback);
    }

    /**
     * Rimuove un listener per gli eventi di posizionamento
     * @param eventType Tipo di evento
     * @param callback Funzione registrata in precedenza
     */
    off(eventType: string, callback: (data: any) => void): void {
        this.eventEmitter.off(eventType, callback);
    }

    /**
     * Ottiene le posizioni di tutti i tag monitorati
     * @returns Un array di posizioni dei tag
     */
    async getAllPositions(): Promise<TagPosition[]> {
        return Promise.resolve(Array.from(this.tagPositions.values()));
    }

    /**
     * Ottiene lo storico delle posizioni per un tag specifico
     * @param tagId ID del tag
     * @param startTime Data/ora di inizio del periodo
     * @param endTime Data/ora di fine del periodo
     * @returns Un array di posizioni storiche del tag
     */
    async getPositionHistory(tagId: string, startTime: Date, endTime: Date): Promise<TagPosition[]> {
        // Simula un ritardo di rete
        return new Promise((resolve) => {
            setTimeout(() => {
                const historyData: TagPosition[] = [];
                let currentTime = startTime.getTime();
                const endTimeMs = endTime.getTime();
                const interval = Math.max(30000, Math.floor((endTimeMs - currentTime) / 100)); // almeno 30 secondi

                // Inizia da un punto di riferimento o dalla posizione attuale
                const currentPosition = this.tagPositions.get(tagId);
                let x = currentPosition?.x || 150 + Math.random() * 100;
                let y = currentPosition?.y || 150 + Math.random() * 100;

                while (currentTime <= endTimeMs) {
                    // Simula un percorso casuale
                    x += (Math.random() - 0.5) * 10;
                    y += (Math.random() - 0.5) * 10;

                    historyData.push({
                        tagId,
                        x,
                        y,
                        z: 0,
                        mapId: 'map-1', // ID mappa di esempio
                        timestamp: new Date(currentTime).toISOString(),
                        batteryLevel: Math.floor(100 - (currentTime - startTime.getTime()) / (endTimeMs - startTime.getTime()) * 30)
                    });

                    currentTime += interval;
                }

                resolve(historyData);
            }, 800);
        });
    }
}
