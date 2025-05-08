// client/src/services/positioning/provider-factory.ts
import { PositioningProvider, PositioningProviderFactory } from './types';
import { BlueIOTPositioningProvider } from './blueiot-provider';
import { MockPositioningProvider } from './mock-provider';

/**
 * Factory per creare provider di posizionamento
 */
export class PositioningProviderFactoryImpl implements PositioningProviderFactory {
    /**
     * Crea un provider di posizionamento basato sul tipo specificato
     * @param type Tipo di provider (blueiot, mock, ecc.)
     * @returns Un'istanza di PositioningProvider
     */
    createProvider(type: string): PositioningProvider {
        switch (type.toLowerCase()) {
            case 'blueiot':
                return new BlueIOTPositioningProvider();

            case 'mock':
                return new MockPositioningProvider();

            default:
                throw new Error(`Unknown positioning provider type: ${type}`);
        }
    }
}

// Esporta un'istanza singleton del factory
export const positioningProviderFactory = new PositioningProviderFactoryImpl();
