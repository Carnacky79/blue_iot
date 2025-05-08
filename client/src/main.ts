// client/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Importazione stili globali
import './assets/css/main.css';

// Fontawesome (se necessario)
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faUser, faCog, faPlus, faMinus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Aggiungi le icone alla libreria
library.add(faHome, faUser, faCog, faPlus, faMinus, faSpinner);

// Crea l'istanza dell'app Vue
const app = createApp(App);

// Registra Pinia per la gestione dello stato
const pinia = createPinia();
app.use(pinia);

// Registra il router
app.use(router);

// Registra componenti globali
app.component('font-awesome-icon', FontAwesomeIcon);

// Monta l'app
app.mount('#app');

// Handler globale per gli errori non gestiti
app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err);
    console.info('Vue Error Info:', info);
};
