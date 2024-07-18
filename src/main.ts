import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useLoadingStore } from './stores/loading'
import { useErrorStore } from './stores/error'
import Dialog from '@/components/utils/Dialog.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.errorHandler = (err) => {
  console.error(err);
  const loadingStore = useLoadingStore();
  const errorStore = useErrorStore();
  loadingStore.setInRequest(false);
  loadingStore.setLoadingStatus(false);
  errorStore.setData(err);

  if (router.currentRoute.value.name !== 'Error') {
    router.replace({ name: 'Error' });
  }
}



app.mount('#app')

app.component('Dialog', Dialog)
