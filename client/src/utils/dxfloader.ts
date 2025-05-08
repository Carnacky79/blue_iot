// client/src/utils/dxfLoader.ts
import * as THREE from 'three';

/**
 * Utility per il caricamento e la visualizzazione di file DXF in Three.js
 */
export class DXFLoader {
    private worker: Worker | null = null;
    private parser: any = null;
    private onProgress: ((event: ProgressEvent) => void) | null = null;

    constructor() {
        // Inizializza il parser (in un'implementazione reale, potrebbe utilizzare librerie come dxf-parser)
        this.setupParser();
    }

    /**
     * Configura il parser DXF (in un'implementazione reale questo utilizzerebbe una libreria DXF)
     */
    private setupParser() {
        // In un'implementazione reale, questo potrebbe caricare una libreria dedicata
        // Per scopi dimostrativi, useremo un parser semplificato
        this.parser = {
            parseSync: (data: string) => {
                // Parser semplificato che estrae informazioni di base dal file DXF
                return this.simpleParse(data);
            }
        };
    }

    /**
     * Carica un file DXF da URL e restituisce un oggetto Three.js Group
     * @param url URL del file DXF da caricare
     * @param onLoad Callback chiamato al completamento del caricamento
     * @param onProgress Callback per monitorare il progresso del caricamento
     * @param onError Callback per gli errori
     */
    load(
        url: string,
        onLoad?: (object: THREE.Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (error: Error) => void
    ): void {
        this.onProgress = onProgress || null;

        // Crea una richiesta per il file DXF
        const loader = new THREE.FileLoader();
        loader.setResponseType('text');
        loader.setRequestHeader({
            'Content-Type': 'text/plain'
        });

        loader.load(
            url,
            (data) => {
                try {
                    // Analizza i dati DXF
                    const dxfData = this.parser.parseSync(data as string);

                    // Crea un oggetto Three.js dalla struttura dati DXF
                    const object = this.createObject(dxfData);

                    // Chiama il callback onLoad con l'oggetto creato
                    if (onLoad) onLoad(object);
                } catch (error) {
                    if (onError) onError(error as Error);
                }
            },
            this.onProgress ? (event) => this.onProgress!(event) : undefined,
            (error) => {
                if (onError) onError(error);
            }
        );
    }

    /**
     * Carica un file DXF da un File o Blob e restituisce un oggetto Three.js Group
     * @param file File o Blob contenente i dati DXF
     * @param onLoad Callback chiamato al completamento del caricamento
     * @param onProgress Callback per monitorare il progresso del caricamento
     * @param onError Callback per gli errori
     */
    loadFile(
        file: File | Blob,
        onLoad?: (object: THREE.Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (error: Error) => void
    ): void {
        this.onProgress = onProgress || null;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = event.target?.result as string;

                // Analizza i dati DXF
                const dxfData = this.parser.parseSync(data);

                // Crea un oggetto Three.js dalla struttura dati DXF
                const object = this.createObject(dxfData);

                // Chiama il callback onLoad con l'oggetto creato
                if (onLoad) onLoad(object);
            } catch (error) {
                if (onError) onError(error as Error);
            }
        };

        reader.onerror = (event) => {
            if (onError) onError(new Error('Error reading file'));
        };

        // Leggi il file come testo
        reader.readAsText(file);
    }

    /**
     * Parser semplificato per file DXF (sostituire con una libreria reale di parsing DXF)
     * @param data Contenuto del file DXF
     * @returns Struttura dati contenente gli elementi DXF analizzati
     */
    private simpleParse(data: string): any {
        // Questo è un parser semplificato per scopi dimostrativi
        // In un'implementazione reale, dovresti utilizzare una libreria di parsing DXF

        const lines = data.split('\n');
        const entities: any[] = [];

        // Esempio molto semplificato di parsing per estrarre linee e punti
        let isEntity = false;
        let currentEntity: any = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Inizio di un'entità
            if (line === 'ENTITIES') {
                isEntity = true;
            }
            // Fine delle entità
            else if (line === 'ENDSEC' && isEntity) {
                isEntity = false;
            }
            // All'interno della sezione ENTITIES
            else if (isEntity) {
                // Inizio di una nuova entità
                if (line === 'LINE' || line === 'CIRCLE' || line === 'ARC' || line === 'POLYLINE' || line === 'TEXT') {
                    if (currentEntity.type) {
                        entities.push(currentEntity);
                    }
                    currentEntity = { type: line, points: [] };
                }
                // Coordinata X
                else if (line === '10') {
                    const x = parseFloat(lines[++i]);
                    currentEntity.points.push({ x, y: 0, z: 0 });
                }
                // Coordinata Y
                else if (line === '20') {
                    const y = parseFloat(lines[i]);
                    if (currentEntity.points.length > 0) {
                        currentEntity.points[currentEntity.points.length - 1].y = y;
                    }
                }
                // Coordinata Z
                else if (line === '30') {
                    const z = parseFloat(lines[i]);
                    if (currentEntity.points.length > 0) {
                        currentEntity.points[currentEntity.points.length - 1].z = z;
                    }
                }
                // Raggio (per cerchi e archi)
                else if (line === '40') {
                    currentEntity.radius = parseFloat(lines[++i]);
                }
                // Angolo iniziale (per archi)
                else if (line === '50') {
                    currentEntity.startAngle = parseFloat(lines[++i]) * Math.PI / 180;
                }
                // Angolo finale (per archi)
                else if (line === '51') {
                    currentEntity.endAngle = parseFloat(lines[++i]) * Math.PI / 180;
                }
                // Testo
                else if (line === '1' && currentEntity.type === 'TEXT') {
                    currentEntity.text = lines[++i];
                }
            }
        }

        // Aggiungi l'ultima entità
        if (currentEntity.type) {
            entities.push(currentEntity);
        }

        return { entities };
    }

    /**
     * Crea un oggetto Three.js Group basato sui dati DXF
     * @param dxfData Dati DXF analizzati
     * @returns Group Three.js contenente la geometria del file DXF
     */
    private createObject(dxfData: any): THREE.Group {
        const group = new THREE.Group();

        // Se non ci sono entità, restituisci un gruppo vuoto
        if (!dxfData || !dxfData.entities || !dxfData.entities.length) {
            return group;
        }

        // Materiali
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
        });

        const fillMaterial = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            side: THREE.DoubleSide
        });

        // Crea geometrie per tutte le entità
        dxfData.entities.forEach((entity: any) => {
            switch (entity.type) {
                case 'LINE':
                    if (entity.points?.length >= 2) {
                        const geometry = new THREE.BufferGeometry();
                        const positions = [];

                        positions.push(entity.points[0].x, entity.points[0].y, entity.points[0].z || 0);
                        positions.push(entity.points[1].x, entity.points[1].y, entity.points[1].z || 0);

                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

                        const line = new THREE.Line(geometry, lineMaterial);
                        group.add(line);
                    }
                    break;

                case 'CIRCLE':
                    if (entity.points?.[0] && entity.radius) {
                        const geometry = new THREE.CircleGeometry(entity.radius, 32);
                        geometry.translate(entity.points[0].x, entity.points[0].y, entity.points[0].z || 0);

                        const circle = new THREE.LineLoop(geometry, lineMaterial);
                        group.add(circle);
                    }
                    break;

                case 'ARC':
                    if (entity.points?.[0] && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
                        // Calcola l'angolo in radianti
                        const startAngle = entity.startAngle;
                        const endAngle = entity.endAngle;

                        const geometry = new THREE.BufferGeometry();
                        const positions = [];

                        // Crea una serie di punti per l'arco
                        const segments = 32;
                        const angleStep = (endAngle - startAngle) / segments;

                        for (let i = 0; i <= segments; i++) {
                            const angle = startAngle + angleStep * i;
                            const x = entity.points[0].x + entity.radius * Math.cos(angle);
                            const y = entity.points[0].y + entity.radius * Math.sin(angle);
                            positions.push(x, y, entity.points[0].z || 0);
                        }

                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

                        const arc = new THREE.Line(geometry, lineMaterial);
                        group.add(arc);
                    }
                    break;

                case 'POLYLINE':
                    if (entity.points?.length >= 2) {
                        const geometry = new THREE.BufferGeometry();
                        const positions = [];

                        entity.points.forEach((point: any) => {
                            positions.push(point.x, point.y, point.z || 0);
                        });

                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

                        const polyline = new THREE.Line(geometry, lineMaterial);
                        group.add(polyline);
                    }
                    break;

                case 'TEXT':
                    if (entity.points?.[0] && entity.text) {
                        // In un'implementazione reale, potresti utilizzare un sistema di testo per Three.js
                        // Per ora, creiamo un semplice placeholder per il testo
                        const geometry = new THREE.CircleGeometry(0.2, 8);
                        geometry.translate(entity.points[0].x, entity.points[0].y, entity.points[0].z || 0);

                        const text = new THREE.Mesh(geometry, fillMaterial);
                        group.add(text);
                    }
                    break;
            }
        });

        return group;
    }
}

/**
 * Factory function per creare un'istanza del DXFLoader
 */
export function createDXFLoader(): DXFLoader {
    return new DXFLoader();
}
