import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';

import './assets/styles.scss';

const iconsUsed = [faSortUp, faSortDown];
library.add(...iconsUsed);

const app = createApp(App);

app.component('FontAwesomeIcon', FontAwesomeIcon);
app.mount('#app');
