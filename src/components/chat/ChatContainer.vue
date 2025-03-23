<template>
  <div class="chat-container">
    <div class="chat-header">
      <input type="text" value="TALK" readonly>
    </div>
    <div class="chat-body" id="chatMessageView">

    </div>
    <div class="chat-bottom">
      <label class="chat-bottom-label">
        <div class="chat-bottom-input-section">
          <input placeholder="메시지를 입력하세요" value="" id="chatMessage" onkeydown="">
          <div class="chat-bottom-function-section">
            <div class="chat-bottom-function">
              <div class="chat-bottom-function-btn">
                <button onclick="">
                  <div data-icon="Link" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"></path>
                    </svg>
                  </div>
                  <input class="display-none" type="file" id="fileMessage" onchange="">
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
    name: 'ChatContainer'
  }
</script>

<style scoped>
  @import "../../assets/css/chat/chat.css";
</style>