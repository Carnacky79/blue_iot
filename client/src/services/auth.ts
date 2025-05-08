// client/src/services/auth.ts
import axios, { AxiosInstance } from 'axios';
import { User } from '../types';

interface AuthResponse {
    token: string;
    user: User;
}

class AuthService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: '/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Recupera il token dal localStorage e configura l'header di Authorization
        const authData = localStorage.getItem('auth');
        if (authData) {
            try {
                const { token } = JSON.parse(authData);
                if (token) {
                    this.setAuthHeader(token);
                }
            } catch (err) {
                console.error('Error parsing auth data:', err);
            }
        }
    }

    async login(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await this.api.post<AuthResponse>('/auth/login', {
                username,
                password,
            });

            this.setAuthHeader(response.data.token);
            return response.data;
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Authentication failed');
        }
    }

    setAuthHeader(token: string): void {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    clearAuthHeader(): void {
        delete this.api.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
    }

    async getUserProfile(): Promise<User> {
        try {
            const response = await this.api.get<User>('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to retrieve user profile');
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        try {
            await this.api.post('/auth/change-password', {
                oldPassword,
                newPassword,
            });
        } catch (error: any) {
            console.error('Change password error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to change password');
        }
    }
}

export default new AuthService();
