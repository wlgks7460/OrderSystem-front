<template>
    <div class="container">
        <div class="page-header text-center" style="margin-top: 20px"><h1>회원 정보</h1></div>
        <table class="table">
            <tr>
                <td>이름</td>
                <td>{{myInfo.id}}</td>
            </tr>
            <tr>
                <td>email</td>
                <td>{{myInfo.email}}</td>
            </tr>
            <tr>
                <td>도시</td>
                <td>{{myInfo.city}}</td>
            </tr>
            <tr>
                <td>상세주소</td>
                <td>{{myInfo.street}}</td>
            </tr>
            <tr>
                <td>우편번호</td>
                <td>{{myInfo.zipcode}}</td>
            </tr>
        </table>
    </div>
    <OrderListComponent
    :isAdmin="false"
    apiUrl="/member/myorders"  
    />
</template>

<script>
import OrderListComponent from '@/components/OrderListComponent.vue';
import axios from 'axios';

export default {
    data(){
        return{
            myInfo:{},
        }
    },
    components:{
        OrderListComponent
    },
    created(){
        this.fetchMember();
    },
    methods:{
        async fetchMember(){
            try{
                const token = localStorage.getItem('token');
                const headers = token ? {Authorization: `Bearer ${token}`} : {};
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member/myInfo`, {headers});
                this.myInfo = response.data;
            }catch(error){
                console.log(error);
            }
        }
    }
}
</script>