// client/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // Opzionale: AutoImport per importare automaticamente le API di Vue
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'src/auto-imports.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        proxy: {
            // Proxy per le chiamate API al backend
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            // Proxy per il mock server BlueIOT
            '/blueiot-api': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/blueiot-api/, ''),
            },
            // Proxy per le chiamate al CRM
            '/crm-api': {
                target: 'http://localhost:4002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/crm-api/, ''),
            },
        },
    },
    define: {
        // Variabili globali disponibili nell'app
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
});
