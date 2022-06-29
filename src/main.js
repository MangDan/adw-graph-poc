import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import axios from 'axios'

//axios.defaults.baseURL = process.env.VUE_APP_BACKEND_SVC_URL;
axios.defaults.baseURL = 'http://132.226.238.127:7007'
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.get["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

const local = axios.create({
  baseURL: ''
});

Vue.prototype.$EventBus = new Vue();
Vue.prototype.$axios = axios;
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
