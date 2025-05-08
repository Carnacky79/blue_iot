// client/src/services/crm/default-provider.ts
import { CRMProvider, CRMConfig } from './types';
import { Company, Employee, Asset } from '../../types';
import axios, { AxiosInstance } from 'axios';

/**
 * Provider CRM predefinito
 * Implementa l'interfaccia CRMProvider per l'integrazione standard
 */
export class DefaultCRMProvider implements CRMProvider {
    private api: AxiosInstance | null = null;
    private config: CRMConfig | null = null;

    /**
     * Inizializza il provider CRM
     * @param config Configurazione per la connessione
     */
    async initialize(config: CRMConfig): Promise<void> {
        this.config = { ...config };

        // Crea l'istanza di axios per le richieste API
        this.api = axios.create({
            baseURL: config.apiUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Imposta l'header di autorizzazione se disponibile
        if (config.apiKey) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`;
        } else if (config.authToken) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${config.authToken}`;
        }

        // Configura l'interceptor per gestire gli errori
        this.api.interceptors.response.use(
            response => response,
            error => {
                console.error('CRM API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Autentica un utente con il CRM
     * @param username Nome utente
     * @param password Password
     * @returns Token di autenticazione
     */
    async authenticate(username: string, password: string): Promise<string> {
        if (!this.api) {
            throw new Error('CRM provider not initialized');
        }

        try {
            const response = await this.api.post('/auth/login', { username, password });

            // Aggiorna l'header di autorizzazione
            const token = response.data.token;
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return token;
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * Ottieni informazioni sulla compagnia
     * @param companyId ID della compagnia
     */
    async getCompanyInfo(companyId: string): Promise<Company> {
        if (!this.api) {
            throw new Error('CRM provider not initialized');
        }

        try {
            const response = await this.api.get<Company>(`/companies/${companyId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch company info:', error);
            throw new Error('Failed to fetch company information');
        }
    }

    /**
     * Ottieni i dipendenti di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare i dipendenti
     */
    async getCompanyEmployees(companyId: string, siteId?: string): Promise<Employee[]> {
        if (!this.api) {
            throw new Error('CRM provider not initialized');
        }

        try {
            let url = `/companies/${companyId}/employees`;
            if (siteId) {
                url += `?siteId=${siteId}`;
            }

            const response = await this.api.get<Employee[]>(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            throw new Error('Failed to fetch employee information');
        }
    }

    /**
     * Ottieni gli asset di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare gli asset
     */
    async getCompanyAssets(companyId: string, siteId?: string): Promise<Asset[]> {
        if (!this.api) {
            throw new Error('CRM provider not initialized');
        }

        try {
            let url = `/companies/${companyId}/assets`;
            if (siteId) {
                url += `?siteId=${siteId}`;
            }

            const response = await this.api.get<Asset[]>(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            throw new Error('Failed to fetch asset information');
        }
    }
}
