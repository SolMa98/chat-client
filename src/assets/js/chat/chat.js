let stompClient = null;
let senderKey = Math.random().toString(36).substr(2,11);
let roomKey = "";

// 페이지 진입 시 이벤트
(function init() {
    connect();
})();

// 소켓 연결
function connect(event){
    let socket = new WebSocket('ws://localhost:8080/ws');
    stompClient  = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
}

function reConnect(roomId){
    // 기존 연결 종료
    if(stompClient && stompClient.connected){
        stompClient.disconnect(function (){
            console.log("소켓 연결이 끊어졌습니다.");

            let socket = new WebSocket('ws://localhost:8080/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function() {
                console.log("새로운 STOMP 연결이 완료되었습니다.");
                stompClient.subscribe('/sub/' + roomId, onMessageReceived);
                roomKey = roomId;

            }, onError);

        });
    }
}

// 채팅방 연결 : default => 새로운 채팅방을 생성
function onConnected() {
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
                roomKey = data.roomId;
                stompClient.subscribe('/sub/' + roomKey, onMessageReceived);

                // 새로운 채팅방 생성 공지
                stompClient.send("/pub/chat/new");
            } else {
                console.error('Data is undefined');
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function onError(error) {
    console.log('STOMP 연결 오류:', error);
}

// 메시지 리시버
function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);

    if(!message.sender === "system"){
        // 내가 보낸 메시지와 상대가 보낸 메시지 구분
        if(message.senderKey === senderKey){
            if(message.type === "file"){
                makeFileMessage(message.fileUrl, "me");
            }else{
                makeMyMessage(message.content);
            }
        }else{
            if(message.type === "file"){
                makeFileMessage(message.fileUrl, "them");
            }else{
                makeThemMessage(message.content);
            }
        }

        // 채팅창 스크롤
        const chatBox = document.getElementById("chatMessageView");
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
    }
}

// 메시지 전송
function sendMessage(event) {
    let messageInputElement = document.getElementById("chatMessage");

    let message = {
        roomId: roomKey,
        sender: "agent",
        senderKey: senderKey,
        type: "message",
        content: messageInputElement.value
    }

    messageInputElement.value = "";
    stompClient.send("/pub/chat/message", {}, JSON.stringify(message));
}

// 파일 전송 버튼 클릭
function sendFileMessage(){
    let fileElement = document.getElementById("fileMessage");
    fileElement.click();
}

// 파일 전송
function handleFileChange(e){
    console.log("ooo")
    let imgFormData = new FormData();
    imgFormData.append('file', e.target.files[0]);

    fetch('http://localhost:8080/chat/upload/file', {
        method: 'POST',
        body: imgFormData
    })
        .then(response => response.json())
        .then(data => {
            let message = {
                roomId: roomKey,
                sender: "agent",
                senderKey: senderKey,
                content: "",
                type: "file",
                fileUrl: data.fileUrl
            }

            // WebSocket을 통해 파일 URL 전송
            stompClient.send("/pub/chat/message", {}, JSON.stringify(message));
        })
        .catch(error => {
            console.error("파일 업로드 실패:", error);
        });
}

// 메시지 입력창 키다운 이벤트
function sendKeyDownEvent(event){
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 내가 보낸 채팅방 메시지
function makeMyMessage(message){
    let myMessageHtml = `<div class="chat-me">
                                    <div class="chat-me-message">
                                        <p class="chat-me-name">me</p>
                                        <p class="chat-me-text">${message}</p>
                                    </div>
                                    <div class="chat-me-profile-img"></div>
                                </div>`;

    document.getElementById("chatMessageView").innerHTML += (myMessageHtml);
}

function makeFileMessage(file, sender) {
    let senderClass = "me";
    let myProfileHtml = `<div class="chat-${senderClass}-profile-img"></div>`;
    let themProfileHtml = "";
    if(sender === "them"){
        senderClass = "them";
        myProfileHtml = "";
        themProfileHtml = `<div class="chat-${senderClass}-profile-img"></div>`;
    }

    let myFileMessageHtml = `<div class="chat-${senderClass}">
                                        ${themProfileHtml}
                                        <div class="chat-${senderClass}-message">
                                            <p class="chat-${senderClass}-name">User</p>
                                            <img class="chat-${senderClass}-file" src="${file}"  alt="이미지"/>
                                        </div>
                                        ${myProfileHtml}
                                    </div>`;
    document.getElementById("chatMessageView").innerHTML += (myFileMessageHtml);
}

// 상대방이 보낸 채팅방 메시지
function makeThemMessage(message){
    let themMessageHtml = `<div class="chat-them">
                                    <div class="chat-them-profile-img"></div>
                                    <div class="chat-them-message">
                                        <p class="chat-them-name">User</p>
                                        <p class="chat-them-text">${message}</p>
                                    </div>
                                </div>`;

    document.getElementById("chatMessageView").innerHTML += themMessageHtml;
}