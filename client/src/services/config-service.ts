// client/src/services/config-service.ts
/**
 * Interfaccia per la configurazione dell'applicazione
 */
export interface AppConfig {
    // Impostazioni generali
    general: {
        theme: 'light' | 'dark' | 'system';
        language: string;
        sidebarPosition: 'left' | 'right';
        dateFormat: string;
        timeFormat: '12h' | '24h';
    };

    // Impostazioni della mappa
    map: {
        defaultView: 'blueprint' | 'satellite' | 'hybrid';
        distanceUnit: 'meters' | 'feet';
        showCoordinates: boolean;
        showGrid: boolean;
        defaultZoomLevel: number;
    };

    // Impostazioni di visualizzazione
    display: {
        showEmployees: boolean;
        showAssets: boolean;
        showAntennas: boolean;
        showZones: boolean;
        showTrails: boolean;
        trailLength: number; // in seconds
    };

    // Impostazioni di notifica
    notifications: {
        showInApp: boolean;
        sound: string; // ID del suono di notifica
        emailAlerts: boolean;
        emailFrequency: 'immediate' | 'hourly' | 'daily';
        alertTypes: {
            [key: string]: boolean; // Tipi di allarme abilitati
        };
    };

    // Impostazioni di integrazione
    integrations: {
        positioning: {
            provider: string; // 'blueiot', 'mock', ecc.
            serverUrl: string;
            username: string;
            password: string;
            updateInterval: number; // in millisecondi
            reconnectInterval: number; // in millisecondi
        };
        crm: {
            provider: string; // 'default', 'mock', ecc.
            apiUrl: string;
            apiKey: string;
            syncEnabled: boolean;
            syncFrequency: string; // '15m', '30m', '1h', ecc.
        };
    };

    // Impostazioni di sistema
    system: {
        dataRetentionPeriod: string; // '30', '60', '90', '180', '365', 'forever'
        logLevel: 'error' | 'warn' | 'info' | 'debug';
        enableAnalytics: boolean;
    };
}

/**
 * Configurazione predefinita dell'applicazione
 */
const defaultConfig: AppConfig = {
    general: {
        theme: 'light',
        language: 'en',
        sidebarPosition: 'left',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h'
    },
    map: {
        defaultView: 'blueprint',
        distanceUnit: 'meters',
        showCoordinates: true,
        showGrid: true,
        defaultZoomLevel: 1
    },
    display: {
        showEmployees: true,
        showAssets: true,
        showAntennas: true,
        showZones: true,
        showTrails: true,
        trailLength: 300 // 5 minuti
    },
    notifications: {
        showInApp: true,
        sound: 'default',
        emailAlerts: false,
        emailFrequency: 'immediate',
        alertTypes: {
            geofence: true,
            emergency: true,
            battery: true,
            connection: true,
            system: true
        }
    },
    integrations: {
        positioning: {
            provider: 'mock', // Default a mock per sviluppo
            serverUrl: 'wss://blueiot.example.com/ws',
            username: '',
            password: '',
            updateInterval: 2000,
            reconnectInterval: 5000
        },
        crm: {
            provider: 'mock', // Default a mock per sviluppo
            apiUrl: 'https://crm.example.com/api',
            apiKey: '',
            syncEnabled: false,
            syncFrequency: '1h'
        }
    },
    system: {
        dataRetentionPeriod: '90',
        logLevel: 'info',
        enableAnalytics: true
    }
};

/**
 * Servizio di configurazione dell'applicazione
 * Gestisce il caricamento, il salvataggio e l'accesso alle impostazioni di configurazione
 */
class ConfigService {
    private config: AppConfig = { ...defaultConfig };
    private readonly storageKey = 'blue_site_monitor_config';
    private initialized = false;

    /**
     * Inizializza il servizio di configurazione
     */
    initialize(): void {
        if (this.initialized) {
            return;
        }

        this.loadConfig();
        this.initialized = true;
    }

    /**
     * Carica la configurazione dal localStorage o utilizza i valori predefiniti
     */
    private loadConfig(): void {
        try {
            const storedConfig = localStorage.getItem(this.storageKey);

            if (storedConfig) {
                const parsedConfig = JSON.parse(storedConfig);

                // Unisce la configurazione salvata con i valori predefiniti per assicurarsi che tutti i campi siano presenti
                this.config = this.mergeConfigs(defaultConfig, parsedConfig);
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
            // In caso di errore, utilizza i valori predefiniti
            this.config = { ...defaultConfig };
        }
    }

    /**
     * Unisce due oggetti di configurazione
     * @param target Configurazione di base
     * @param source Configurazione da unire
     * @returns Configurazione unita
     */
    private mergeConfigs(target: any, source: any): any {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    // Se è un oggetto e non un array, unisci ricorsivamente
                    result[key] = this.mergeConfigs(target[key] || {}, source[key]);
                } else {
                    // Altrimenti, sostituisci il valore
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * Salva la configurazione corrente nel localStorage
     */
    saveConfig(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    }

    /**
     * Ottiene la configurazione completa
     * @returns Configurazione dell'applicazione
     */
    getConfig(): AppConfig {
        return { ...this.config };
    }

    /**
     * Aggiorna parte della configurazione
     * @param path Percorso della configurazione (ad es. 'map.showGrid')
     * @param value Nuovo valore
     */
    updateConfig(path: string, value: any): void {
        const parts = path.split('.');
        let current: any = this.config;

        // Naviga nella struttura della configurazione fino al penultimo elemento
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }

            current = current[part];
        }

        // Imposta il valore per l'ultimo elemento
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;

        // Salva la configurazione aggiornata
        this.saveConfig();
    }

    /**
     * Aggiorna una sezione della configurazione
     * @param section Nome della sezione (ad es. 'map')
     * @param values Nuovi valori per la sezione
     */
    updateSection(section: keyof AppConfig, values: Partial<AppConfig[keyof AppConfig]>): void {
        this.config[section] = { ...this.config[section], ...values };
        this.saveConfig();
    }

    /**
     * Ripristina la configurazione predefinita
     */
    resetToDefault(): void {
        this.config = { ...defaultConfig };
        this.saveConfig();
    }

    /**
     * Ottiene un'impostazione specifica dalla configurazione
     * @param path Percorso della configurazione (ad es. 'map.showGrid')
     * @returns Valore dell'impostazione
     */
    getSetting<T>(path: string): T {
        const parts = path.split('.');
        let current: any = this.config;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined as unknown as T;
            }

            current = current[part];
        }

        return current as T;
    }
}

// Esporta un'istanza singleton del servizio di configurazione
export const configService = new ConfigService();
