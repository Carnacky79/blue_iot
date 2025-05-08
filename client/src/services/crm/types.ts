// client/src/services/crm/types.ts
import { Company, Employee, Asset } from '../../types';

/**
 * Interfaccia per un provider CRM
 * Questa astrazione consente di sostituire facilmente il provider CRM
 */
export interface CRMProvider {
    /**
     * Inizializza la connessione con il provider CRM
     */
    initialize(config: CRMConfig): Promise<void>;

    /**
     * Ottieni informazioni sulla compagnia
     * @param companyId ID della compagnia
     */
    getCompanyInfo(companyId: string): Promise<Company>;

    /**
     * Ottieni i dipendenti di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare i dipendenti
     */
    getCompanyEmployees(companyId: string, siteId?: string): Promise<Employee[]>;

    /**
     * Ottieni gli asset di una compagnia
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare gli asset
     */
    getCompanyAssets(companyId: string, siteId?: string): Promise<Asset[]>;

    /**
     * Autentica un utente con il CRM
     * @param username Nome utente
     * @param password Password
     * @returns Token di autenticazione
     */
    authenticate(username: string, password: string): Promise<string>;
}

/**
 * Configurazione per il provider CRM
 */
export interface CRMConfig {
    apiUrl: string;
    apiKey?: string;
    authToken?: string;
    [key: string]: any; // Proprietà aggiuntive specifiche del provider
}

/**
 * Interfaccia per il factory di provider CRM
 */
export interface CRMProviderFactory {
    createProvider(type: string): CRMProvider;
}
