<template>
    <div class="container">
        <div class="page-header text-center" style="margin-top: 20px">
            <h1>채팅</h1>
        </div>
    </div>

    <v-container>
        email : 
        <input
            v-model="email"
            type="text"
        >
        message : 
        <input
            v-model="message"
            type="text"
            @keyup="sendMessage"
        >
        <div
            class="mt-2"
            v-for="(item, idx) in recvList"
            :key="idx"
        >
            <v-card
                class="mt-2 mb-2"
                color="teal lighten-3"
                dark
                max-width="400"
            >
                <v-card-text>
                    <div> email : {{ item.user.id }}</div>
                    <div>{{ item.message }}</div>
                    <div>{{ item.sendAt }}</div>
                </v-card-text>
            </v-card>
        </div>
    </v-container>
</template>

<script lang="js">
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
    data() {
        return {
            id: '',
            message: '',
            recvList: []
            }
    },
    created() {
        this.connect() // ChattingView.vue 생성 시 소켓 연결 시도
    },
    methods: {
        sendMessage(e) {
            if(e.keyCode === 13 && this.id !== '' && this.message !== '') {
                this.send();
                this.message = '';
            }
        },
        send() {
            console.log("Send message:" + this.message);
            if (this.stompClient && this.stompClient.connected) {
                const msg = { 
                user: {
                    id: this.uid
                },
                message: this.message,
                sendAt: Date.now(),
                isRequest: false,
                };
                this.stompClient.send("/receive", JSON.stringify(msg), {});
            }
        }, 
        connect() {
            this.socket = new SockJS('http://localhost:8080');
            let options = {debug: false, protocols: Stomp.VERSIONS.supportedProtocols()};
            this.stompClient = Stomp.over(this.socket, options);
            console.log(`소켓 연결을 시도합니다.`);
            console.log(localStorage.getItem('token'));
            // 이렇게 별도의 헤더를 생성한 뒤 
            let headers = {Authorization: localStorage.getItem('token')};
            console.log({headers})
            // STOMP Client의 header 부분에 집어넣어줍니다.
            this.stompClient.connect(headers, (frame) => {
                this.connected = true
                console.log('소켓 연결 성공', frame);
                this.stompClient.subscribe('/exchange/chat-exchange/msg.' + this.chatRequestDto.roomId, (tick) => {
                    console.log(tick.body);
                    this.chatLogs.push(JSON.parse(tick.body));
                })
            }, (error) => {
                console.log('연결실패');
                console.log(error)
                this.connected = false
            })
        },
    }
}
</script>