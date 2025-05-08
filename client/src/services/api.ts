// client/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SiteMap, Antenna, TagAssignment } from '../types';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: '/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor per la gestione degli errori
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Gestione errori globale
                console.error('API Error:', error);

                // Gestione specifica degli errori di autenticazione (401)
                if (error.response && error.response.status === 401) {
                    // Potenzialmente reindirizzare alla pagina di login o aggiornare lo stato dell'autenticazione
                    localStorage.removeItem('auth');
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        );
    }

    // API per la gestione delle mappe
    async getMaps(siteId: string): Promise<SiteMap[]> {
        try {
            const response = await this.api.get<SiteMap[]>(`/sites/${siteId}/maps`);
            return response.data;
        } catch (error) {
            console.error('Error fetching maps:', error);
            throw new Error('Failed to fetch maps');
        }
    }

    async uploadMap(siteId: string, file: File, mapName: string, floorNumber: number): Promise<SiteMap> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', mapName);
            formData.append('floorNumber', floorNumber.toString());

            const response = await this.api.post<SiteMap>(
                `/sites/${siteId}/maps`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error uploading map:', error);
            throw new Error('Failed to upload map');
        }
    }

    // API per la gestione delle antenne
    async getAntennas(siteId: string): Promise<Antenna[]> {
        try {
            const response = await this.api.get<Antenna[]>(`/sites/${siteId}/antennas`);
            return response.data;
        } catch (error) {
            console.error('Error fetching antennas:', error);
            throw new Error('Failed to fetch antennas');
        }
    }

    async createAntenna(antenna: Omit<Antenna, 'id'>): Promise<Antenna> {
        try {
            const response = await this.api.post<Antenna>(`/sites/${antenna.siteId}/antennas`, antenna);
            return response.data;
        } catch (error) {
            console.error('Error creating antenna:', error);
            throw new Error('Failed to create antenna');
        }
    }

    async updateAntenna(antennaId: string, updates: Partial<Antenna>): Promise<Antenna> {
        try {
            const response = await this.api.patch<Antenna>(`/antennas/${antennaId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating antenna:', error);
            throw new Error('Failed to update antenna');
        }
    }

    async deleteAntenna(antennaId: string): Promise<void> {
        try {
            await this.api.delete(`/antennas/${antennaId}`);
        } catch (error) {
            console.error('Error deleting antenna:', error);
            throw new Error('Failed to delete antenna');
        }
    }

    // API per la gestione delle assegnazioni dei tag
    async getTagAssignments(siteId: string): Promise<TagAssignment[]> {
        try {
            const response = await this.api.get<TagAssignment[]>(`/sites/${siteId}/tag-assignments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tag assignments:', error);
            throw new Error('Failed to fetch tag assignments');
        }
    }

    async createTagAssignment(assignment: Omit<TagAssignment, 'id'>): Promise<TagAssignment> {
        try {
            const response = await this.api.post<TagAssignment>(
                `/sites/${assignment.siteId}/tag-assignments`,
                assignment
            );
            return response.data;
        } catch (error) {
            console.error('Error creating tag assignment:', error);
            throw new Error('Failed to create tag assignment');
        }
    }

    async deleteTagAssignment(assignmentId: string): Promise<void> {
        try {
            await this.api.delete(`/tag-assignments/${assignmentId}`);
        } catch (error) {
            console.error('Error deleting tag assignment:', error);
            throw new Error('Failed to delete tag assignment');
        }
    }

    // Metodo generico per le richieste API
    async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.api.request<T>(config);
            return response.data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
}

export default new ApiService();
