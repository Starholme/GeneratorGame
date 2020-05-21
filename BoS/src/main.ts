import Vue from 'vue';
import App from './App.vue';
import { Engine } from './engine/Engine';

declare global {
    interface Window {
        Ui: Vue;
        Engine: Engine;
        DEBUG: boolean;
    }
}

window.DEBUG = true;

Vue.config.productionTip = true;

const app = new Vue({
    render: h => h(App)
});
app.$mount('#app');

window.Ui = app;
window.Engine = new Engine();