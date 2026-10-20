import { createApp } from 'vue';
import App from './App.vue';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { prepareDownloads } from './pdf/save.js';

createApp(App).mount('#app');

// Siapkan jalur unduhan sejak awal (di claude.ai memakai izin unduhan, di komputer memakai unduhan browser)
prepareDownloads();
