import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueColumnsResizable from './plugins/vue-columns-resizable';

import App from './App.vue';

import './assets/styles/app.scss';

const iconsUsed = [faSortUp, faSortDown];
library.add(...iconsUsed);

const app = createApp(App);

app.use(VueColumnsResizable);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.mount('#app');
