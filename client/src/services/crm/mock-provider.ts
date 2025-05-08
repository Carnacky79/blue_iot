// client/src/services/crm/mock-provider.ts
import { CRMProvider, CRMConfig } from './types';
import { Company, Employee, Asset } from '../../types';

/**
 * Provider CRM simulato
 * Implementa l'interfaccia CRMProvider per test e sviluppo
 */
export class MockCRMProvider implements CRMProvider {
    private config: CRMConfig | null = null;
    private mockToken: string | null = null;

    /**
     * Inizializza il provider CRM mock
     * @param config Configurazione per la simulazione
     */
    async initialize(config: CRMConfig): Promise<void> {
        this.config = { ...config };
        console.log('Mock CRM provider initialized with config:', this.config);
    }

    /**
     * Autentica un utente con il CRM mock
     * @param username Nome utente
     * @param password Password
     * @returns Token di autenticazione simulato
     */
    async authenticate(username: string, password: string): Promise<string> {
        // In un mock, accetta qualsiasi credenziale valida
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Simula un ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 800));

        // Genera un token fittizio
        this.mockToken = `mock-token-${Date.now()}`;
        return this.mockToken;
    }

    /**
     * Ottieni informazioni sulla compagnia simulata
     * @param companyId ID della compagnia
     */
    async getCompanyInfo(companyId: string): Promise<Company> {
        // Simula un ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Restituisci dati mock
        return {
            id: companyId,
            name: 'Mock Company Ltd.',
            address: '123 Mock Street, Mock City',
            contact: 'John Manager',
            phone: '+1234567890',
            email: 'info@mockcompany.com'
        };
    }

    /**
     * Ottieni i dipendenti di una compagnia simulata
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare i dipendenti
     */
    async getCompanyEmployees(companyId: string, siteId?: string): Promise<Employee[]> {
        // Simula un ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 700));

        // Esempio di dipendenti
        const employees: Employee[] = [
            {
                id: '1',
                companyId,
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                position: 'Construction Worker',
                department: 'Operations',
                siteId: siteId || 'site1',
                tagId: 'tag001'
            },
            {
                id: '2',
                companyId,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1234567891',
                position: 'Site Manager',
                department: 'Management',
                siteId: siteId || 'site1',
                tagId: 'tag002'
            },
            {
                id: '3',
                companyId,
                name: 'Robert Johnson',
                email: 'robert.johnson@example.com',
                phone: '+1234567892',
                position: 'Electrician',
                department: 'Technical',
                siteId: siteId || 'site1',
                tagId: 'tag003'
            },
            {
                id: '4',
                companyId,
                name: 'Maria Garcia',
                email: 'maria.garcia@example.com',
                phone: '+1234567893',
                position: 'Safety Officer',
                department: 'Safety',
                siteId: 'site2',
                tagId: 'tag004'
            },
            {
                id: '5',
                companyId,
                name: 'David Kim',
                email: 'david.kim@example.com',
                phone: '+1234567894',
                position: 'Architect',
                department: 'Design',
                siteId: 'site2',
                tagId: 'tag005'
            }
        ];

        // Filtra per sito se specificato
        if (siteId) {
            return employees.filter(emp => emp.siteId === siteId);
        }

        return employees;
    }

    /**
     * Ottieni gli asset di una compagnia simulata
     * @param companyId ID della compagnia
     * @param siteId ID opzionale del sito per filtrare gli asset
     */
    async getCompanyAssets(companyId: string, siteId?: string): Promise<Asset[]> {
        // Simula un ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 600));

        // Esempio di asset
        const assets: Asset[] = [
            {
                id: '101',
                companyId,
                name: 'Excavator #1',
                type: 'Heavy Equipment',
                serialNumber: 'EX-2023-001',
                description: 'Caterpillar 320 Excavator',
                siteId: siteId || 'site1',
                tagId: 'tag101'
            },
            {
                id: '102',
                companyId,
                name: 'Concrete Mixer',
                type: 'Heavy Equipment',
                serialNumber: 'CM-2023-002',
                description: 'Mobile concrete mixer truck',
                siteId: siteId || 'site1',
                tagId: 'tag102'
            },
            {
                id: '103',
                companyId,
                name: 'Power Generator',
                type: 'Equipment',
                serialNumber: 'PG-2023-003',
                description: 'Portable power generator 5000W',
                siteId: siteId || 'site1',
                tagId: 'tag103'
            },
            {
                id: '104',
                companyId,
                name: 'Toolbox A',
                type: 'Tool',
                serialNumber: 'TB-2023-004',
                description: 'Complete set of hand tools',
                siteId: siteId || 'site1',
                tagId: 'tag104'
            },
            {
                id: '105',
                companyId,
                name: 'Safety Equipment Kit',
                type: 'Safety Equipment',
                serialNumber: 'SE-2023-005',
                description: 'Safety helmets, vests and gear',
                siteId: 'site2',
                tagId: 'tag105'
            },
            {
                id: '106',
                companyId,
                name: 'Crane #2',
                type: 'Heavy Equipment',
                serialNumber: 'CR-2023-006',
                description: 'Mobile crane for heavy lifting',
                siteId: 'site2',
                tagId: 'tag106'
            }
        ];

        // Filtra per sito se specificato
        if (siteId) {
            return assets.filter(asset => asset.siteId === siteId);
        }

        return assets;
    }
}
