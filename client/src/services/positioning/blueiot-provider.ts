// client/src/services/positioning/blueiot-provider.ts
import { PositioningProvider, PositioningConfig, PositioningEventType } from './types';
import { TagPosition } from '../../types';
import { EventEmitter } from 'events';

/**
 * Provider di posizionamento per BlueIOT
 * Implementa l'interfaccia PositioningProvider per integrare con il sistema BlueIOT
 */
export class BlueIOTPositioningProvider implements PositioningProvider {
    private config: PositioningConfig | null = null;
    private websocket: WebSocket | null = null;
    private isConnected = false;
    private reconnectTimer: number | null = null;
    private eventEmitter = new EventEmitter();
    private tagPositions = new Map<string, TagPosition>();
    private authenticating = false;

    /**
     * Inizializza il provider BlueIOT
     * @param config Configurazione per la connessione
     */
    async initialize(config: PositioningConfig): Promise<void> {
        this.config = { ...config };

        // Verifica che config.serverUrl sia definito
        if (!config.serverUrl) {
            throw new Error('Server URL is required for BlueIOT connection');
        }

        // Connessione al server BlueIOT
        return this.connect();
    }

    /**
     * Connette al server BlueIOT
     */
    private async connect(): Promise<void> {
        if (!this.config?.serverUrl) {
            throw new Error('Cannot connect: Server URL not configured');
        }

        return new Promise((resolve, reject) => {
            try {
                // Chiudi la connessione esistente se presente
                if (this.websocket) {
                    this.websocket.close();
                }

                this.authenticating = true;

                // Crea una nuova connessione WebSocket
                this.websocket = new WebSocket(this.config.serverUrl);

                // Configura i gestori eventi
                this.websocket.onopen = () => {
                    console.log('BlueIOT WebSocket connected');
                    this.isConnected = true;
                    this.authenticating = false;
                    this.eventEmitter.emit(PositioningEventType.CONNECTED, null);

                    // Autentica con BlueIOT
                    this.authenticate()
                        .then(() => resolve())
                        .catch(err => {
                            console.error('BlueIOT authentication failed:', err);
                            this.eventEmitter.emit(PositioningEventType.CONNECTION_ERROR, {
                                message: 'Authentication failed',
                                error: err
                            });
                            reject(err);
                        });
                };

                this.websocket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.websocket.onclose = (event) => {
                    console.log(`BlueIOT WebSocket disconnected: ${event.code} ${event.reason}`);
                    this.isConnected = false;
                    this.eventEmitter.emit(PositioningEventType.DISCONNECTED, {
                        code: event.code,
                        reason: event.reason
                    });

                    // Non tentare riconnessione durante autenticazione
                    if (!this.authenticating) {
                        this.scheduleReconnect();
                    }
                };

                this.websocket.onerror = (error) => {
                    console.error('BlueIOT WebSocket error:', error);
                    this.eventEmitter.emit(PositioningEventType.CONNECTION_ERROR, {
                        message: 'WebSocket error',
                        error
                    });

                    if (this.authenticating) {
                        reject(error);
                    }
                };
            } catch (error) {
                console.error('BlueIOT connection error:', error);
                this.eventEmitter.emit(PositioningEventType.CONNECTION_ERROR, {
                    message: 'Failed to connect to BlueIOT server',
                    error
                });
                reject(error);
            }
        });
    }

    /**
     * Autentica con il server BlueIOT
     */
    private async authenticate(): Promise<void> {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            throw new Error('Cannot authenticate: WebSocket not connected');
        }

        // In un'implementazione reale, qui andrebbe la logica di autenticazione specifica di BlueIOT
        // Per ora, inviamo un payload generico di autenticazione
        const authPayload = {
            type: 'auth',
            username: this.config?.username || '',
            password: this.config?.password || '',
            timestamp: new Date().toISOString()
        };

        this.websocket.send(JSON.stringify(authPayload));

        // In un'implementazione reale, aspetteremo una risposta di autenticazione
        // Per ora, simuliamo un'autenticazione riuscita
        return Promise.resolve();
    }

    /**
     * Gestisce i messaggi in arrivo dal server BlueIOT
     */
    private handleMessage(data: any): void {
        try {
            // Parsing del messaggio (adattare al formato reale di BlueIOT)
            let message;
            if (typeof data === 'string') {
                message = JSON.parse(data);
            } else if (data instanceof ArrayBuffer) {
                // Logica per decodificare ArrayBuffer (formato binario)
                // L'implementazione esatta dipende dal formato dei dati BlueIOT
                console.log('Received binary data from BlueIOT');
                return;
            } else {
                console.error('Unsupported message format from BlueIOT');
                return;
            }

            // Gestione dei diversi tipi di messaggi
            switch (message.type) {
                case 'position':
                    this.handlePositionUpdate(message.data);
                    break;
                case 'battery':
                    this.handleBatteryUpdate(message.data);
                    break;
                case 'status':
                    this.handleStatusUpdate(message.data);
                    break;
                case 'alarm':
                    this.handleAlarm(message.data);
                    break;
                case 'auth_response':
                    this.handleAuthResponse(message.data);
                    break;
                default:
                    console.log(`Received unhandled message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error processing BlueIOT message:', error);
        }
    }

    /**
     * Gestisce gli aggiornamenti di posizione
     */
    private handlePositionUpdate(data: any[]): void {
        if (!Array.isArray(data)) {
            console.error('Invalid position data format');
            return;
        }

        const positions: TagPosition[] = [];

        data.forEach(item => {
            if (!item.tagId) return;

            const position: TagPosition = {
                tagId: item.tagId,
                x: item.x || 0,
                y: item.y || 0,
                z: item.z || 0,
                mapId: item.mapId || '',
                timestamp: item.timestamp || new Date().toISOString(),
                batteryLevel: item.batteryLevel !== undefined ? item.batteryLevel : 100
            };

            // Aggiorna la cache delle posizioni
            this.tagPositions.set(position.tagId, position);
            positions.push(position);
        });

        if (positions.length > 0) {
            this.eventEmitter.emit(PositioningEventType.POSITION_UPDATE, positions);
        }
    }

    /**
     * Gestisce gli aggiornamenti di batteria
     */
    private handleBatteryUpdate(data: any[]): void {
        if (!Array.isArray(data)) {
            console.error('Invalid battery data format');
            return;
        }

        // Aggiorna i livelli di batteria nelle posizioni memorizzate
        data.forEach(item => {
            if (!item.tagId || item.level === undefined) return;

            const position = this.tagPositions.get(item.tagId);
            if (position) {
                position.batteryLevel = item.level;
                this.tagPositions.set(item.tagId, position);
            }
        });

        this.eventEmitter.emit(PositioningEventType.BATTERY_UPDATE, data);
    }

    /**
     * Gestisce gli aggiornamenti di stato dei tag
     */
    private handleStatusUpdate(data: any[]): void {
        this.eventEmitter.emit(PositioningEventType.TAG_STATUS_CHANGE, data);
    }

    /**
     * Gestisce gli allarmi
     */
    private handleAlarm(data: any): void {
        this.eventEmitter.emit(PositioningEventType.ALARM, data);
    }

    /**
     * Gestisce la risposta di autenticazione
     */
    private handleAuthResponse(data: any): void {
        if (data.success) {
            console.log('BlueIOT authentication successful');
        } else {
            console.error('BlueIOT authentication failed:', data.message);
            this.eventEmitter.emit(PositioningEventType.CONNECTION_ERROR, {
                message: 'Authentication failed',
                error: new Error(data.message)
            });
        }
    }

    /**
     * Programma un tentativo di riconnessione
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
        }

        const reconnectInterval = this.config?.reconnectInterval || 5000;

        this.reconnectTimer = window.setTimeout(() => {
            console.log('Attempting to reconnect to BlueIOT...');
            this.connect().catch(err => {
                console.error('BlueIOT reconnection failed:', err);
            });
        }, reconnectInterval);
    }

    /**
     * Disconnette dal provider BlueIOT
     */
    disconnect(): void {
        // Annulla eventuali timer di riconnessione
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Chiudi la connessione WebSocket
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        this.isConnected = false;
    }

    /**
     * Sottoscrive agli aggiornamenti di posizione per specifici tag
     * @param tagIds Array di ID tag da monitorare
     */
    async subscribeToTags(tagIds: string[]): Promise<void> {
        if (!this.isConnected || !this.websocket) {
            throw new Error('Cannot subscribe: WebSocket not connected');
        }

        // Invia la richiesta di sottoscrizione
        const subscriptionPayload = {
            type: 'subscribe',
            tagIds
        };

        this.websocket.send(JSON.stringify(subscriptionPayload));
        return Promise.resolve();
    }

    /**
     * Annulla la sottoscrizione per specifici tag
     * @param tagIds Array di ID tag da non monitorare più
     */
    async unsubscribeFromTags(tagIds: string[]): Promise<void> {
        if (!this.isConnected || !this.websocket) {
            throw new Error('Cannot unsubscribe: WebSocket not connected');
        }

        // Invia la richiesta di annullamento sottoscrizione
        const unsubscriptionPayload = {
            type: 'unsubscribe',
            tagIds
        };

        this.websocket.send(JSON.stringify(unsubscriptionPayload));
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
        if (!this.isConnected || !this.websocket) {
            throw new Error('Cannot fetch history: WebSocket not connected');
        }

        // In un'implementazione reale, qui andrebbe una richiesta al server BlueIOT
        // Per ora, restituiamo dati simulati
        return new Promise((resolve) => {
            // Simula una richiesta di rete
            setTimeout(() => {
                const historyData: TagPosition[] = [];
                let currentTime = startTime.getTime();
                const endTimeMs = endTime.getTime();
                const interval = Math.max(30000, Math.floor((endTimeMs - currentTime) / 50));

                // Genera posizioni simulate basate sulla posizione corrente
                const currentPosition = this.tagPositions.get(tagId);
                let x = currentPosition?.x || 150;
                let y = currentPosition?.y || 150;

                while (currentTime <= endTimeMs) {
                    // Simula un percorso con piccole variazioni casuali
                    x += (Math.random() - 0.5) * 5;
                    y += (Math.random() - 0.5) * 5;

                    historyData.push({
                        tagId,
                        x,
                        y,
                        z: 0,
                        mapId: currentPosition?.mapId || 'map-1',
                        timestamp: new Date(currentTime).toISOString(),
                        batteryLevel: 100 - (currentTime - startTime.getTime()) / (endTimeMs - startTime.getTime()) * 20
                    });

                    currentTime += interval;
                }

                resolve(historyData);
            }, 800);
        });
    }
}
