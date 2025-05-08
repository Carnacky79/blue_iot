// server/src/services/blueiot/websocket-client.ts
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { calculateCRC16 } from '../../utils/crc';

export class BlueIOTWebSocketClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private serverUrl: string;
    private username: string;
    private password: string;
    private salt: string;
    private reconnectInterval: number = 5000;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(serverUrl: string, username: string, password: string, salt: string) {
        super();
        this.serverUrl = serverUrl;
        this.username = username;
        this.password = password;
        this.salt = salt;
    }

    connect(): void {
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(this.serverUrl, 'localSensePush-protocol');

        this.ws.on('open', () => {
            console.log('Connected to BlueIOT WebSocket server');
            this.emit('connected');
            this.authenticate();
        });

        this.ws.on('message', (data: Buffer) => {
            this.handleMessage(data);
        });

        this.ws.on('close', () => {
            console.log('Disconnected from BlueIOT WebSocket server');
            this.emit('disconnected');
            this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        });
    }

    private authenticate(): void {
        if (!this.ws) return;

        // Implementation of BlueIOT authentication based on the documentation
        // Create authentication frame with MD5 password + salt
        const md5Password = this.createMD5Password();
        const authFrame = this.createAuthFrame(this.username, md5Password);

        this.ws.send(authFrame);
    }

    private createMD5Password(): string {
        // MD5 password implementation based on BlueIOT docs
        // MD5(MD5(password) + salt)
        const crypto = require('crypto');
        const md5Pass = crypto.createHash('md5').update(this.password).digest('hex');
        return crypto.createHash('md5').update(md5Pass + this.salt).digest('hex');
    }

    private createAuthFrame(username: string, password: string): Buffer {
        // Implementation of auth frame based on BlueIOT protocol docs
        // Frame structure: frame header (0xCC5F) + frame type (0x27) + username length + username + password length + password + CRC16 + frame tail (0xAABB)

        // Example implementation (needs to be adjusted based on exact protocol)
        const frameHeader = Buffer.from([0xCC, 0x5F]);
        const frameType = Buffer.from([0x27]);

        const usernameBuffer = Buffer.from(username);
        const usernameLengthBuffer = Buffer.alloc(4);
        usernameLengthBuffer.writeUInt32BE(usernameBuffer.length, 0);

        const passwordBuffer = Buffer.from(password);
        const passwordLengthBuffer = Buffer.alloc(4);
        passwordLengthBuffer.writeUInt32BE(passwordBuffer.length, 0);

        const dataForCRC = Buffer.concat([
            frameType,
            usernameLengthBuffer,
            usernameBuffer,
            passwordLengthBuffer,
            passwordBuffer
        ]);

        const crc = calculateCRC16(dataForCRC);
        const crcBuffer = Buffer.alloc(2);
        crcBuffer.writeUInt16BE(crc, 0);

        const frameTail = Buffer.from([0xAA, 0xBB]);

        return Buffer.concat([
            frameHeader,
            dataForCRC,
            crcBuffer,
            frameTail
        ]);
    }

    private handleMessage(data: Buffer): void {
        // Parse incoming BlueIOT messages based on documentation
        // Extract frame type, payload, etc.

        // Basic example (would need to be expanded based on actual protocol)
        if (data.length < 4) return; // Too short to be valid

        const frameHeader = data.readUInt16BE(0);
        if (frameHeader !== 0xCC5F) return; // Invalid frame header

        const frameType = data.readUInt8(2);

        switch (frameType) {
            case 0x81: // Tag position data
                this.handleTagPositionData(data);
                break;
            case 0x85: // Battery info
                this.handleBatteryInfo(data);
                break;
            case 0x89: // Alarm info
                this.handleAlarmInfo(data);
                break;
            // Additional cases for other frame types
            default:
                console.log(`Received unhandled frame type: 0x${frameType.toString(16)}`);
        }
    }

    private handleTagPositionData(data: Buffer): void {
        // Parse position data according to BlueIOT protocol
        // Extract tag IDs, coordinates, etc.
        // Emit appropriate events with parsed data

        // Basic structure (to be expanded)
        const tagCount = data.readUInt8(3);

        const tags = [];
        let offset = 4;

        for (let i = 0; i < tagCount; i++) {
            // Extract tag data based on protocol (example extraction)
            const tagId = data.readBigUInt64BE(offset);
            offset += 8;

            const xCoord = data.readFloatBE(offset);
            offset += 4;

            const yCoord = data.readFloatBE(offset);
            offset += 4;

            const zCoord = data.readInt16BE(offset);
            offset += 2;

            const mapId = data.readUInt8(offset);
            offset += 1;

            // Extract remaining fields...

            tags.push({
                tagId: tagId.toString(),
                coordinates: {
                    x: xCoord,
                    y: yCoord,
                    z: zCoord / 100, // Convert to meters if in cm
                },
                mapId,
                // Add other fields
            });
        }

        this.emit('positionData', tags);
    }

    // Additional handler methods for different frame types

    subscribeToTagIds(tagIds: string[]): void {
        if (!this.ws) return;

        // Create subscription frame based on BlueIOT protocol
        // Frame structure for tag subscription

        // Example implementation
        const frameHeader = Buffer.from([0xCC, 0x5F]);
        const frameType = Buffer.from([0xA9]);

        const subscriptionType = Buffer.from([0x00, 0x00]); // Tag set

        const tagCountBuffer = Buffer.alloc(2);
        tagCountBuffer.writeUInt16BE(tagIds.length, 0);

        let tagBuffers = [];
        for (const tagId of tagIds) {
            // Convert tag ID string to 8-byte buffer
            const tagBuffer = Buffer.alloc(8);
            const tagIdBigInt = BigInt(tagId);
            tagBuffer.writeBigUInt64BE(tagIdBigInt, 0);
            tagBuffers.push(tagBuffer);
        }

        const dataForCRC = Buffer.concat([
            frameType,
            subscriptionType,
            tagCountBuffer,
            ...tagBuffers
        ]);

        const crc = calculateCRC16(dataForCRC);
        const crcBuffer = Buffer.alloc(2);
        crcBuffer.writeUInt16BE(crc, 0);

        const frameTail = Buffer.from([0xAA, 0xBB]);

        const subscriptionFrame = Buffer.concat([
            frameHeader,
            dataForCRC,
            crcBuffer,
            frameTail
        ]);

        this.ws.send(subscriptionFrame);
    }

    // Other subscription methods for different entity types

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect to BlueIOT WebSocket server...');
            this.connect();
        }, this.reconnectInterval);
    }
}
