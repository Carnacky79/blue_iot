// client/src/services/positioning/types.ts
import { TagPosition, Employee, Asset } from '../../types';

/**
 * Interfaccia per un provider di posizionamento
 * Questa astrazione consente di sostituire facilmente il provider
 * (ad es. da BlueIOT a un altro sistema di posizionamento)
 */
export interface PositioningProvider {
    /**
     * Inizializza la connessione con il provider di posizionamento
     */
    initialize(config: PositioningConfig): Promise<void>;

    /**
     * Disconnette dal provider di posizionamento
     */
    disconnect(): void;

    /**
     * Sottoscrive agli aggiornamenti di posizione per specifici tag
     * @param tagIds Array di ID tag da monitorare
     */
    subscribeToTags(tagIds: string[]): Promise<void>;

    /**
     * Annulla la sottoscrizione per specifici tag
     * @param tagIds Array di ID tag da non monitorare più
     */
    unsubscribeFromTags(tagIds: string[]): Promise<void>;

    /**
     * Registra un listener per gli eventi di posizionamento
     * @param eventType Tipo di evento
     * @param callback Funzione da chiamare quando l'evento viene emesso
     */
    on(eventType: string, callback: (data: any) => void): void;

    /**
     * Rimuove un listener per gli eventi di posizionamento
     * @param eventType Tipo di evento
     * @param callback Funzione registrata in precedenza
     */
    off(eventType: string, callback: (data: any) => void): void;

    /**
     * Ottiene le posizioni di tutti i tag monitorati
     * @returns Un array di posizioni dei tag
     */
    getAllPositions(): Promise<TagPosition[]>;

    /**
     * Ottiene lo storico delle posizioni per un tag specifico
     * @param tagId ID del tag
     * @param startTime Data/ora di inizio del periodo
     * @param endTime Data/ora di fine del periodo
     * @returns Un array di posizioni storiche del tag
     */
    getPositionHistory(tagId: string, startTime: Date, endTime: Date): Promise<TagPosition[]>;
}

/**
 * Configurazione per il provider di posizionamento
 */
export interface PositioningConfig {
    serverUrl: string;
    username?: string;
    password?: string;
    apiKey?: string;
    updateInterval?: number;
    reconnectInterval?: number;
    [key: string]: any; // Proprietà aggiuntive specifiche del provider
}

/**
 * Tipi di eventi emessi dal provider di posizionamento
 */
export enum PositioningEventType {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    CONNECTION_ERROR = 'connectionError',
    POSITION_UPDATE = 'positionUpdate',
    TAG_STATUS_CHANGE = 'tagStatusChange',
    BATTERY_UPDATE = 'batteryUpdate',
    ALARM = 'alarm'
}

/**
 * Interfaccia per il factory di provider di posizionamento
 */
export interface PositioningProviderFactory {
    createProvider(type: string): PositioningProvider;
}
