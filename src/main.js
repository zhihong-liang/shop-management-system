import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

// 导入全局样式表
import './assets/css/global.css'

Vue.use(ElementUI);

Vue.config.productionTip = false

// 创建事件总线
Vue.prototype.$bus = new Vue()

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
