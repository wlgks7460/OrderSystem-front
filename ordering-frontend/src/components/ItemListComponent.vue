<template>
    <div class="container">
        <div class="page-header text-center" style="margin-top: 20px">
            <h1>{{pageTitle}}</h1>
        </div>
        <div class="d-flex justify-content-between" style="margin-top:20px;">
            <form @submit.prevent="searchItems()">
                <select v-model="searchType" style="display: inline-block; width:auto; margin-right:5px">
                    <option value="optional">선택</option>
                    <option value="name">상품명</option>
                    <option value="category">카테고리</option>
                </select>
                <input v-model="searchValue" type="text"/>
                <button type="submit">검색</button>
            </form>
            <div v-if="!isAdmin">
                <button @click="addCart" class="btn btn-secondary">장바구니</button>
                <button @click="placeOrder" class="btn btn-success">주문하기</button>
            </div>
            <div v-if="isAdmin">
                <a href="/item/create"><button class="btn btn-secondary">상품등록</button></a>
            </div>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th v-if="!isAdmin"></th>
                    <th>제품사진</th>
                    <th>제품명</th>
                    <th>가격</th>
                    <th>재고수량</th>
                    <th v-if="!isAdmin">주문수량</th>
                    <th v-if="isAdmin">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in itemList" :key="item.id">
                    <!-- 체크박스를 선택하면 value가 true가 담기게 됨 -->
                    <td v-if="!isAdmin"><input type="checkbox" v-model="selectedItems[item.id]"/></td>
                    <td><img :src="getImage(item.id)" style="hegith:100px; width:auto;"/></td>
                    <td>{{item.name}}</td>
                    <td>{{item.price}}</td>
                    <td>{{item.stockQuantity}}</td>
                    <td v-if="!isAdmin"><input min="1" type="number" v-model="item.quantity" style="width: 60px"/></td>
                    <td v-if="isAdmin"><button @click.stop="deleteItem(item.id)" class="btn btn-success">삭제</button></td>

                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    props: ['isAdmin', 'pageTitle'],
    data(){
        return{
            itemList: [],
            pageSize: 10,
            currentPage: 0,
            searchType: 'optional',
            searchValue: '',
            isLastPage: false,
            isLoading: false,
            selectedItems: {},
        }


    },
    created(){
        this.loadItems();
    },
    // mounted : window dom객체가 생성된 이후에 실행되는 hook함수
    mounted(){
        // scroll 동작이 발생할 때마다 scrollPagination함수 호출된다는 의미
        window.addEventListener('scroll', this.scrollPagination);
    },
    methods:{
        addCart(){
            const orderItems = Object.keys(this.selectedItems)
                                    .filter(key=>this.selectedItems[key]===true)
                                    .map(key => {
                                        const item = this.itemList.find(item => item.id == key);
                                        return {itemId:item.id, name:item.name, count:item.quantity};
                                    });
            orderItems.forEach(item => this.$store.commit('addToCart', item));
        },
        async deleteItem(itemId){
            if(confirm("정말로 삭제하시겠습니까?")){
                try{
                    const token = localStorage.getItem('token');
                    const headers = token ? {Authorization: `Bearer ${token}`} : {};
                    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/item/${itemId}/delete`,{headers})
                    alert("상품 삭제 성공.");
                    window.location.reload();
                }catch(error){
                    console.log(error);
                    alert("상품 삭제 실패");
                }
            }
        },
        scrollPagination(){
            // innerHeight : 뷰포트 창의 내부높이르 픽셀단위로 변환
            // scrollY : 스크로를 통해 Y축을 이동한 거리
            // offestHeight : 전체브라우저 창의 높이
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
            if(nearBottom && !this.isLastPage && !this.isLoading){
                this.currentPage++;
                this.loadItems();
            }
        },
        getImage(id){
            return `${process.env.VUE_APP_API_BASE_URL}/item/${id}/image`
        },
        async loadItems(){
            this.isLoading = true;
            try{
                // params라는 키워드 사용해야 파라미터 방식으로 axios요청 가능
                const params = {
                    page: this.currentPage,
                    size: this.pageSize,
                    // [this.searchType]: this.searchValue,
                }
                if (this.searchType === "name") {
                    params.name = this.searchValue;
                }
                else if (this.searchType === "category") {
                    params.category = this.searchValue;
                }
                console.log("data 호출");
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/items`, {params});
                const addItemList = response.data.map(item=>({...item, quantity:1}));
                if(addItemList.length < this.pageSize){
                    this.isLastPage = true;
                }
                this.itemList = [...this.itemList, ...addItemList];
            }catch(error){
                console.log(error);
            }
            this.isLoading = false;
        },
        searchItems(){
            this.itemList=[];
            this.currentPage=0;
            this.isLastPage = false;
            this.loadItems();
        },
        async placeOrder(){
            // {
            //     "1":true,
            //     "2":false
            // }
            // Object.keys : 위의 데이터구조에서 1,2,등 key값 추출하는 매서드
            const orderItems = Object.keys(this.selectedItems)
                                    .filter(key=>this.selectedItems[key]===true)
                                    .map(key => {
                                        const item = this.itemList.find(item => item.id == key);
                                        return {itemId:item.id, count:item.quantity};
                                    });
            const token = localStorage.getItem('token');
            const headers = token ? {Authorization: `Bearer ${token}`} : {};
            try{
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/order/create`, orderItems ,{headers});
                console.log(orderItems);
                alert("주문완료되었습니다.");
                window.location.reload();
            }catch(error){
                console.log(orderItems);
                alert("주문이 실패되었습니다.")
            }

        }

    }
}
</script>
