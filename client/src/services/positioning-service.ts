// client/src/services/positioning-service.ts
import { PositioningProvider, PositioningConfig, PositioningEventType } from './positioning/types';
import { positioningProviderFactory } from './positioning/provider-factory';
import { TagPosition } from '../types';
import { EventEmitter } from 'events';

/**
 * Servizio principale di posizionamento
 * Gestisce la comunicazione con il provider di posizionamento
 */
class PositioningService {
    private provider: PositioningProvider | null = null;
    private providerType: string = 'mock'; // Default a mock per sviluppo
    private config: PositioningConfig | null = null;
    private isInitialized: boolean = false;
    private eventEmitter = new EventEmitter();

    /**
     * Inizializza il servizio di posizionamento
     * @param providerType Tipo di provider da utilizzare (blueiot, mock, ecc.)
     * @param config Configurazione per il provider
     */
    async initialize(providerType: string, config: PositioningConfig): Promise<void> {
        // Se già inizializzato con lo stesso tipo di provider, non fare nulla
        if (this.isInitialized && this.providerType === providerType) {
            return;
        }

        // Se c'è già un provider, disconnettilo prima
        if (this.provider) {
            this.provider.disconnect();
            this.unregisterProviderEvents();
            this.provider = null;
        }

        try {
            // Crea un nuovo provider del tipo specificato
            this.provider = positioningProviderFactory.createProvider(providerType);
            this.providerType = providerType;
            this.config = { ...config };

            // Registra gli eventi del provider
            this.registerProviderEvents();

            // Inizializza il provider
            await this.provider.initialize(config);

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing positioning service:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Registra i gestori di eventi per il provider
     */
    private registerProviderEvents(): void {
        if (!this.provider) return;

        // Passa gli eventi del provider all'EventEmitter del servizio
        const events = Object.values(PositioningEventType);

        events.forEach(eventType => {
            const handler = (data: any) => {
                this.eventEmitter.emit(eventType, data);
            };

            this.provider?.on(eventType, handler);
        });
    }

    /**
     * Rimuove i gestori di eventi per il provider
     */
    private unregisterProviderEvents(): void {
        if (!this.provider) return;

        // Rimuovi tutti gli ascoltatori
        const events = Object.values(PositioningEventType);

        events.forEach(eventType => {
            this.provider?.off(eventType, () => {}); // Rimuove tutti gli handler
        });
    }

    /**
     * Disconnette dal provider di posizionamento
     */
    disconnect(): void {
        if (this.provider) {
            this.provider.disconnect();
            this.unregisterProviderEvents();
            this.provider = null;
        }

        this.isInitialized = false;
    }

    /**
     * Ottiene le posizioni di tutti i tag monitorati
     * @returns Un array di posizioni dei tag
     */
    async getAllPositions(): Promise<TagPosition[]> {
        if (!this.provider || !this.isInitialized) {
            throw new Error('Positioning service not initialized');
        }

        return this.provider.getAllPositions();
    }

    /**
     * Sottoscrive agli aggiornamenti di posizione per specifici tag
     * @param tagIds Array di ID tag da monitorare
     */
    async subscribeToTags(tagIds: string[]): Promise<void> {
        if (!this.provider || !this.isInitialized) {
            throw new Error('Positioning service not initialized');
        }

        await this.provider.subscribeToTags(tagIds);
    }

    /**
     * Annulla la sottoscrizione per specifici tag
     * @param tagIds Array di ID tag da non monitorare più
     */
    async unsubscribeFromTags(tagIds: string[]): Promise<void> {
        if (!this.provider || !this.isInitialized) {
            throw new Error('Positioning service not initialized');
        }

        await this.provider.unsubscribeFromTags(tagIds);
    }

    /**
     * Ottiene lo storico delle posizioni per un tag specifico
     * @param tagId ID del tag
     * @param startTime Data/ora di inizio del periodo
     * @param endTime Data/ora di fine del periodo
     * @returns Un array di posizioni storiche del tag
     */
    async getPositionHistory(tagId: string, startTime: Date, endTime: Date): Promise<TagPosition[]> {
        if (!this.provider || !this.isInitialized) {
            throw new Error('Positioning service not initialized');
        }

        return this.provider.getPositionHistory(tagId, startTime, endTime);
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
}

// Esporta un'istanza singleton del servizio
export const positioningService = new PositioningService();
