import {createRouter, createWebHistory} from "vue-router";
import ChatView from '@/components/chat/ChatContainer.vue';

const routes = [
    {
        path: '/chat',
        component: ChatView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;