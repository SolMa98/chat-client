<script setup>
  import "../../assets/js/common/sockjs.js";
  import "../../assets/js/common/stomp.js";
</script>
<template>
  <div class="chat-container">
    <div class="chat-header">
      <input type="text" value="TALK" readonly>
    </div>
    <div class="chat-body" id="chatMessageView">
      <div v-for="(message, index) in messages" :key="index" v-html="message">
      </div>
    </div>
    <div class="chat-bottom">
      <label class="chat-bottom-label">
        <div class="chat-bottom-input-section">
          <input placeholder="메시지를 입력하세요" value="" id="chatMessage" v-on:keydown="sendKeyDownEvent">
          <div class="chat-bottom-function-section">
            <div class="chat-bottom-function">
              <div class="chat-bottom-function-btn">
                <button onclick="sendFileMessage()">
                  <div data-icon="Link" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"></path>
                    </svg>
                  </div>
                  <input class="display-none" type="file" id="fileMessage" onchange="handleFileChange(event)">
                </button>
                <button>
                  <div data-icon="Smiley" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Zm-1.07,48c-10.29,17.79-27.4,28-46.93,28s-36.63-10.2-46.92-28a8,8,0,1,1,13.84-8c7.47,12.91,19.21,20,33.08,20s25.61-7.1,33.07-20a8,8,0,0,1,13.86,8Z"></path>
                    </svg>
                  </div>
                </button>
              </div>
              <button class="chat-bottom-send-btn">
                <span class="truncate">Send</span>
              </button>
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ChatContainer',
    data() {
      return {
        messages: [],
        stompClient: null,
        senderKey: Math.random().toString(36).substr(2,11),
        roomKey: ""
      }
    },
    mounted() {
      this.connect();
    },
    methods: {
      connect(event) {
        let socket = new WebSocket('ws://localhost:8080/ws');
        this.stompClient  = Stomp.over(socket);
        this.stompClient.connect({}, this.onConnected, this.onError);
      },

      reConnect(roomId) {
        if(this.stompClient && this.stompClient.connected){
          this.stompClient.disconnect(function (){
            console.log("소켓 연결이 끊어졌습니다.");

            let socket = new WebSocket('ws://localhost:8080/ws');
            this.stompClient = Stomp.over(socket);

            this.stompClient.connect({}, function() {
              console.log("새로운 STOMP 연결이 완료되었습니다.");
              this.stompClient.subscribe('/sub/' + roomId, this.onMessageReceived);
              this.roomKey = roomId;

            }, this.onError);
          });
        }
      },

      onConnected() {
        fetch("http://localhost:8080/chat/room", {
          method: "POST"
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to create room");
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            this.roomKey = data.roomId;
            this.stompClient.subscribe('/sub/' + this.roomKey, this.onMessageReceived);

            // 새로운 채팅방 생성 공지
            this.stompClient.send("/pub/chat/new");
          } else {
            console.error('Data is undefined');
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      },

      onError(error) {
        console.log('STOMP 연결 오류:', error);
      },

      onMessageReceived(payload) {
        let message = JSON.parse(payload.body);

        if(!(message.sender === "system")){
          // 내가 보낸 메시지와 상대가 보낸 메시지 구분
          if(message.senderKey === this.senderKey){
            if(message.type === "file"){
              this.makeFileMessage(message.fileUrl, "me");
            }else{
              this.makeMyMessage(message.content);
            }
          }else{
            if(message.type === "file"){
              this.makeFileMessage(message.fileUrl, "them");
            }else{
              this.makeThemMessage(message.content);
            }
          }

          // 채팅창 스크롤 DOM이 업데이트 된 이후에 발동 되도록 설정
          this.$nextTick(() => {
            const chatBox = document.getElementById("chatMessageView");
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
          });
        }
      },

      sendMessage(event) {
        let messageInputElement = document.getElementById("chatMessage");

        let message = {
          roomId: this.roomKey,
          sender: "agent",
          senderKey: this.senderKey,
          type: "message",
          content: messageInputElement.value
        }

        messageInputElement.value = "";
        this.stompClient.send("/pub/chat/message", {}, JSON.stringify(message));
      },

      sendFileMessage() {
        let fileElement = document.getElementById("fileMessage");
        fileElement.click();
      },

      handleFileChange(e) {
        let imgFormData = new FormData();
        imgFormData.append('file', e.target.files[0]);

        fetch('http://localhost:8080/chat/upload/file', {
          method: 'POST',
          body: imgFormData
        })
        .then(response => response.json())
        .then(data => {
          let message = {
            roomId: this.roomKey,
            sender: "agent",
            senderKey: this.senderKey,
            content: "",
            type: "file",
            fileUrl: data.fileUrl
          }

          // WebSocket을 통해 파일 URL 전송
          this.stompClient.send("/pub/chat/message", {}, JSON.stringify(message));
        })
        .catch(error => {
          console.error("파일 업로드 실패:", error);
        });
      },

      sendKeyDownEvent(event) {
        if (event.key === 'Enter') {
          this.sendMessage();
        }
      },

      makeMyMessage(message) {
        let myMessageHtml = `<div class="chat-me">
                                        <div class="chat-me-message">
                                            <p class="chat-me-name">me</p>
                                            <p class="chat-me-text">${message}</p>
                                        </div>
                                        <div class="chat-me-profile-img"></div>
                                    </div>`;
        this.messages = [...this.messages, myMessageHtml];
      },

      makeFileMessage(file, sender) {
        let senderClass = "me";
        let myProfileHtml = `<div class="chat-${senderClass}-profile-img"></div>`;
        let themProfileHtml = "";
        if(sender === "them"){
          senderClass = "them";
          myProfileHtml = "";
          themProfileHtml = `<div class="chat-${senderClass}-profile-img"></div>`;
        }

        let fileMessageHtml = `<div class="chat-${senderClass}">
                                            ${themProfileHtml}
                                            <div class="chat-${senderClass}-message">
                                                <p class="chat-${senderClass}-name">User</p>
                                                <img class="chat-${senderClass}-file" src="${file}"  alt="이미지"/>
                                            </div>
                                            ${myProfileHtml}
                                        </div>`;
        this.messages = [...this.messages, fileMessageHtml];
      },

      makeThemMessage(message) {
        let themMessageHtml = `<div class="chat-them">
                                        <div class="chat-them-profile-img"></div>
                                        <div class="chat-them-message">
                                            <p class="chat-them-name">User</p>
                                            <p class="chat-them-text">${message}</p>
                                        </div>
                                    </div>`;

        this.messages = [...this.messages, themMessageHtml];
      }
    }
  }
</script>

<style>
  @import "../../assets/css/chat/chat.css";
</style>