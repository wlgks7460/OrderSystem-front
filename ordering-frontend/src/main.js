import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index.js';
import '@/assets/css/bootstrap.min.css';
import axios from 'axios';
import store from './store/cart.js'


// index.html의 id인 app에 마운트 되도록하는 코드
// createApp(App).mount('#app')
const app = createApp(App);

// 401응답의 경우 interceptor를 통해 공통적으로 토큰 제거 후 로그아웃처리
axios.interceptors.response.use(response => response, error =>{
    if(error.response && error.response.status === 401){
        localStorage.clear();
        window.location.href = "/login";
    }
    return Promise.reject(error);
})

// vue어플리케이션에서 전역적으로 기능 사용할 겨우에 아래와 같이 use문법 사용
app.use(router);
app.use(store);
app.mount('#app');