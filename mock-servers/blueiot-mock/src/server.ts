// mock-servers/blueiot-mock/src/server.ts
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from 'cors';

// Configurazione
const PORT = 4001;
const WS_PORT = 4002;

// Crea l'app Express per l'API REST
const app = express();
app.use(cors());
app.use(express.json());

// Rotte API
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'BlueIOT Mock Server is running' });
});

// Avvia il server HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`BlueIOT Mock REST API running on port ${PORT}`);
});

// Crea il server WebSocket
const wss = new WebSocket.Server({ port: WS_PORT });

// Variabili per la simulazione
let connectedClients = new Set<WebSocket>();
let subscribedTags = new Set<string>();
let simulationInterval: NodeJS.Timeout | null = null;

// Gestione delle connessioni WebSocket
wss.on('connection', (ws) => {
    console.log('Client connected to BlueIOT Mock WebSocket');
    connectedClients.add(ws);

    // Invia risposta di connessione
    ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
    }));

    // Gestione dei messaggi in arrivo
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received message:', data);

            // Gestione diversi tipi di messaggi
            switch (data.type) {
                case 'auth':
                    handleAuth(ws, data);
                    break;
                case 'subscribe':
                    handleSubscribe(ws, data);
                    break;
                case 'unsubscribe':
                    handleUnsubscribe(ws, data);
                    break;
                default:
                    console.log(`Unhandled message type: ${data.type}`);
            }
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    });

    // Gestione della disconnessione
    ws.on('close', () => {
        console.log('Client disconnected from BlueIOT Mock WebSocket');
        connectedClients.delete(ws);

        // Se non ci sono più client connessi, ferma la simulazione
        if (connectedClients.size === 0 && simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
    });

    // Avvia la simulazione se non è già in corso
    if (!simulationInterval) {
        startSimulation();
    }
});

// Funzioni di gestione messaggi
function handleAuth(ws: WebSocket, data: any) {
    console.log(`Authentication request from ${data.username}`);

    // Simulazione di risposta di autenticazione (sempre riuscita)
    ws.send(JSON.stringify({
        type: 'auth_response',
        success: true,
        timestamp: new Date().toISOString()
    }));
}

function handleSubscribe(ws: WebSocket, data: any) {
    if (!data.tagIds || !Array.isArray(data.tagIds)) {
        console.error('Invalid subscribe request: tagIds missing or not an array');
        return;
    }

    console.log(`Subscribing to tags: ${data.tagIds.join(', ')}`);

    // Aggiungi i tag all'insieme degli iscritti
    data.tagIds.forEach((tagId: string) => subscribedTags.add(tagId));

    // Invia conferma
    ws.send(JSON.stringify({
        type: 'subscription_response',
        success: true,
        tagIds: data.tagIds,
        timestamp: new Date().toISOString()
    }));
}

function handleUnsubscribe(ws: WebSocket, data: any) {
    if (!data.tagIds || !Array.isArray(data.tagIds)) {
        console.error('Invalid unsubscribe request: tagIds missing or not an array');
        return;
    }

    console.log(`Unsubscribing from tags: ${data.tagIds.join(', ')}`);

    // Rimuovi i tag dall'insieme degli iscritti
    data.tagIds.forEach((tagId: string) => subscribedTags.delete(tagId));

    // Invia conferma
    ws.send(JSON.stringify({
        type: 'unsubscription_response',
        success: true,
        tagIds: data.tagIds,
        timestamp: new Date().toISOString()
    }));
}

// Simulazione di dati
function startSimulation() {
    const defaultTags = ['TAG001', 'TAG002', 'TAG003', 'TAG004', 'TAG005', 'TAG101', 'TAG102', 'TAG103', 'TAG104'];

    // Aggiungi i tag di default all'insieme
    defaultTags.forEach(tag => subscribedTags.add(tag));

    // Genera posizioni casuali per ogni tag ogni 2 secondi
    simulationInterval = setInterval(() => {
        if (connectedClients.size === 0) return;

        const positions = Array.from(subscribedTags).map(tagId => {
            // Genera coordinate casuali
            // Basate sulla stessa posizione generale, con piccole variazioni
            const baseX = tagId.startsWith('TAG10') ? 250 : 150;
            const baseY = tagId.startsWith('TAG10') ? 180 : 120;

            return {
                tagId,
                x: baseX + (Math.random() - 0.5) * 20,
                y: baseY + (Math.random() - 0.5) * 20,
                z: 0,
                mapId: 'map1',
                batteryLevel: Math.round(70 + Math.random() * 30),
                timestamp: new Date().toISOString()
            };
        });

        // Invia l'aggiornamento di posizione a tutti i client connessi
        const positionUpdate = {
            type: 'position',
            data: positions,
            timestamp: new Date().toISOString()
        };

        broadcastToAll(positionUpdate);

        // Occasionalmente, invia aggiornamenti della batteria
        if (Math.random() < 0.2) {
            const batteryUpdates = generateBatteryUpdates();
            if (batteryUpdates.length > 0) {
                broadcastToAll({
                    type: 'battery',
                    data: batteryUpdates,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Molto raramente, genera un allarme
        if (Math.random() < 0.05) {
            generateAlarm();
        }
    }, 2000);
}

function generateBatteryUpdates() {
    const updates = [];

    // Seleziona casualmente alcuni tag per aggiornamenti batteria
    for (const tagId of subscribedTags) {
        if (Math.random() < 0.3) {
            updates.push({
                tagId,
                level: Math.round(20 + Math.random() * 80),
                timestamp: new Date().toISOString()
            });
        }
    }

    return updates;
}

function generateAlarm() {
    if (subscribedTags.size === 0) return;

    // Scegli un tag casuale
    const tagIds = Array.from(subscribedTags);
    const randomTagId = tagIds[Math.floor(Math.random() * tagIds.length)];

    // Tipi di allarme possibili
    const alarmTypes = ['geofence', 'emergency', 'lowBattery', 'tagOffline'];
    const randomType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];

    const alarm = {
        type: 'alarm',
        data: {
            alarmType: randomType,
            tagId: randomTagId,
            timestamp: new Date().toISOString(),
            message: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} alarm triggered for tag ${randomTagId}`
        }
    };

    broadcastToAll(alarm);
}

function broadcastToAll(data: any) {
    const message = JSON.stringify(data);

    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log(`BlueIOT Mock WebSocket server running on port ${WS_PORT}`);
