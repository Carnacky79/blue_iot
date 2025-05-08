// client/src/services/blueiot.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { TagPosition } from '../types';

interface BlueIOTEvent {
    type: string;
    data: any;
}

class BlueIOTService {
    private socket: WebSocket | null = null;
    private reconnectInterval = 5000;
    private reconnectTimer: number | null = null;
    private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
    private isConnected = ref(false);
    private connectionError = ref<string | null>(null);

    // Stato delle posizioni dei tag
    private tagPositions = ref<Map<string, TagPosition>>(new Map());

    constructor() {}

    connect(url: string): void {
        if (this.socket) {
            this.socket.close();
        }

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onerror = this.handleError.bind(this);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.connectionError.value = 'Failed to connect to BlueIOT server';
            this.scheduleReconnect();
        }
    }

    private handleOpen(event: Event): void {
        console.log('Connected to BlueIOT server');
        this.isConnected.value = true;
        this.connectionError.value = null;
        this.emitEvent('connected', null);
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data) as BlueIOTEvent;

            // Aggiorna lo stato delle posizioni dei tag se necessario
            if (data.type === 'positionUpdate') {
                this.updateTagPositions(data.data);
            }

            // Emetti l'evento a tutti i listener registrati per questo tipo
            this.emitEvent(data.type, data.data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data);
        }
    }

    private handleClose(event: CloseEvent): void {
        console.log('Disconnected from BlueIOT server', event.code, event.reason);
        this.isConnected.value = false;
        this.emitEvent('disconnected', { code: event.code, reason: event.reason });
        this.scheduleReconnect();
    }

    private handleError(event: Event): void {
        console.error('WebSocket error:', event);
        this.connectionError.value = 'Connection error with BlueIOT server';
        this.emitEvent('error', event);
    }

    private updateTagPositions(positions: TagPosition[]): void {
        const positionsMap = this.tagPositions.value;

        for (const position of positions) {
            positionsMap.set(position.tagId, position);
        }

        // Forza un aggiornamento dello stato reattivo
        this.tagPositions.value = new Map(positionsMap);
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = window.setTimeout(() => {
            console.log('Attempting to reconnect to BlueIOT server...');
            if (this.socket) {
                const url = this.socket.url;
                this.connect(url);
            }
        }, this.reconnectInterval);
    }

    // Metodi per la registrazione/rimozione di event listener
    on(eventType: string, callback: (data: any) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }

        this.eventListeners.get(eventType)!.add(callback);
    }

    off(eventType: string, callback: (data: any) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.eventListeners.delete(eventType);
            }
        }
    }

    private emitEvent(eventType: string, data: any): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            }
        }
    }

    // Metodi per inviare comandi a BlueIOT
    sendCommand(command: string, data: any): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('Cannot send command: WebSocket is not connected');
            return;
        }

        try {
            const message = JSON.stringify({
                command,
                data,
            });

            this.socket.send(message);
        } catch (error) {
            console.error('Error sending command:', error);
            throw new Error('Failed to send command to BlueIOT server');
        }
    }

    // Metodo per ottenere la posizione di un tag specifico
    getTagPosition(tagId: string): TagPosition | undefined {
        return this.tagPositions.value.get(tagId);
    }

    // Metodo per ottenere tutte le posizioni dei tag
    getAllTagPositions(): TagPosition[] {
        return Array.from(this.tagPositions.value.values());
    }

    // Risorsa Vue Composition API per usare le posizioni dei tag in modo reattivo
    useTagPositions() {
        return {
            tagPositions: this.tagPositions,
            getTagPosition: this.getTagPosition.bind(this),
            getAllTagPositions: this.getAllTagPositions.bind(this),
        };
    }

    // Risorsa Vue Composition API per la connessione WebSocket
    useWebSocketConnection() {
        return {
            isConnected: this.isConnected,
            connectionError: this.connectionError,
            connect: this.connect.bind(this),
            disconnect: this.disconnect.bind(this),
        };
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.isConnected.value = false;
    }
}

export default new BlueIOTService();

// Composable hook per utilizzare BlueIOT in componenti Vue
export function useBlueIOT(autoConnect = true, serverUrl?: string) {
    const service = new BlueIOTService();

    onMounted(() => {
        if (autoConnect && serverUrl) {
            service.connect(serverUrl);
        }
    });

    onUnmounted(() => {
        service.disconnect();
    });

    return {
        connect: service.connect.bind(service),
        disconnect: service.disconnect.bind(service),
        on: service.on.bind(service),
        off: service.off.bind(service),
        sendCommand: service.sendCommand.bind(service),
        ...service.useTagPositions(),
        ...service.useWebSocketConnection(),
    };
}
