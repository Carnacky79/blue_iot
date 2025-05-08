// client/src/services/crm-service.ts
import { CRMProvider, CRMConfig } from './crm/types';
import { crmProviderFactory } from './crm/provider-factory';
import { Company, Employee, Asset } from '../types';
import { configService } from './config-service';

/**
 * Servizio principale CRM
 * Gestisce la comunicazione con il provider CRM
 */
class CRMService {
    private provider: CRMProvider | null = null;
    private providerType: string = 'mock'; // Default a mock per sviluppo
    private isInitialized: boolean = false;

    /**
     * Inizializza il servizio CRM
     * @param providerType Tipo di provider da utilizzare (default, mock, ecc.)
     * @param config Configurazione per il provider
     */
    async initialize(providerType?: string, config?: CRMConfig): Promise<void> {
        // Se non vengono forniti providerType e config, utilizza i valori della configurazione
        if (!providerType || !config) {
            // Assicurati che il servizio di configurazione sia inizializzato
            configService.initialize();

            // Ottieni la configurazione dal servizio di configurazione
            const crmConfig = configService.getSetting('integrations.crm');
            providerType = providerType || crmConfig.provider;
            config = config || {
                apiUrl: crmConfig.apiUrl,
                apiKey: crmConfig.apiKey
            };
        }

        // Se già inizializzato con lo stesso tipo di provider, non fare nulla
        if (this.isInitialized && this.providerType === providerType) {
            return;
        }

        try {
            // Crea un nuovo provider del tipo specificato
            this.provider = crmProviderFactory.createProvider(providerType);
            this.providerType = providerType;

            // Inizializza il provider
            await this.provider.initialize(config);

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing CRM service:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Verifica che il servizio sia inizializzato
     */
    private checkInitialized(): void {
        if (!this.isInitialized || !this.provider) {
            throw new Error('CRM service not initialized. Call initialize() first.');
        }
    }

    /**
     * Autentica un utente con il CRM
     * @param username Nome utente
     * @param password Password
     * @returns Token di autenticazione
     */
    async authenticate(username: string, password: string): Promise<string> {
        this.checkInitialized();
        return this.provider!.authenticate(username, password);
    }

    /**
     * Ottieni informazioni sulla compagnia
     * @param companyId ID della compagnia
     */
    async getCompanyInfo(companyId: string): Promise<Company> {
        this.checkInitialized();
        return this.provider!.getCompanyInfo(companyId);
    }

    /**
     * Ottieni i dipendenti di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare i dipendenti
     */
    async getCompanyEmployees(companyId: string, siteId?: string): Promise<Employee[]> {
        this.checkInitialized();
        return this.provider!.getCompanyEmployees(companyId, siteId);
    }

    /**
     * Ottieni gli asset di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare gli asset
     */
    async getCompanyAssets(companyId: string, siteId?: string): Promise<Asset[]> {
        this.checkInitialized();
        return this.provider!.getCompanyAssets(companyId, siteId);
    }

    /**
     * Sincronizza i dati con il CRM
     * Questo metodo recupera i dati più recenti dal CRM
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito
     * @returns Oggetto con i dati sincronizzati
     */
    async syncWithCRM(companyId: string, siteId?: string): Promise<{
        company: Company;
        employees: Employee[];
        assets: Asset[];
    }> {
        this.checkInitialized();

        // Esegui le richieste in parallelo per migliorare le prestazioni
        const [company, employees, assets] = await Promise.all([
            this.getCompanyInfo(companyId),
            this.getCompanyEmployees(companyId, siteId),
            this.getCompanyAssets(companyId, siteId)
        ]);

        return {
            company,
            employees,
            assets
        };
    }
}

// Esporta un'istanza singleton del servizio
export const crmService = new CRMService();
