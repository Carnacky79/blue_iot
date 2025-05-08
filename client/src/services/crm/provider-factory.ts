// client/src/services/crm/provider-factory.ts
import { CRMProvider, CRMProviderFactory } from './types';
import { DefaultCRMProvider } from './default-provider';
import { MockCRMProvider } from './mock-provider';

/**
 * Factory per creare provider CRM
 */
export class CRMProviderFactoryImpl implements CRMProviderFactory {
    /**
     * Crea un provider CRM basato sul tipo specificato
     * @param type Tipo di provider (default, mock, ecc.)
     * @returns Un'istanza di CRMProvider
     */
    createProvider(type: string): CRMProvider {
        switch (type.toLowerCase()) {
            case 'default':
                return new DefaultCRMProvider();

            case 'mock':
                return new MockCRMProvider();

            default:
                throw new Error(`Unknown CRM provider type: ${type}`);
        }
    }
}

// Esporta un'istanza singleton del factory
export const crmProviderFactory = new CRMProviderFactoryImpl();
