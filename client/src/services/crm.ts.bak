// client/src/services/crm.ts
import axios, { AxiosInstance } from 'axios';
import { Company, Employee, Asset } from '../types';

export class CrmService {
    private api: AxiosInstance;

    constructor(baseURL: string, apiKey: string) {
        this.api = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async authenticate(username: string, password: string): Promise<string> {
        try {
            const response = await this.api.post('/auth/login', { username, password });
            return response.data.token;
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Authentication failed');
        }
    }

    async getCompanyInfo(companyId: string): Promise<Company> {
        try {
            const response = await this.api.get(`/companies/${companyId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch company info:', error);
            throw new Error('Failed to fetch company information');
        }
    }

    async getCompanyEmployees(companyId: string, siteId?: string): Promise<Employee[]> {
        try {
            let url = `/companies/${companyId}/employees`;
            if (siteId) {
                url += `?siteId=${siteId}`;
            }

            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            throw new Error('Failed to fetch employee information');
        }
    }

    async getCompanyAssets(companyId: string, siteId?: string): Promise<Asset[]> {
        try {
            let url = `/companies/${companyId}/assets`;
            if (siteId) {
                url += `?siteId=${siteId}`;
            }

            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            throw new Error('Failed to fetch asset information');
        }
    }
}

export default new CrmService(
    import.meta.env.VITE_CRM_API_URL,
    import.meta.env.VITE_CRM_API_KEY
);
