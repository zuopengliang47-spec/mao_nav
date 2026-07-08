import { createRouter, createWebHistory } from 'vue-router'
import NavHomeView from '../views/NavHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NavHomeView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || '导航站 — Zuopengliang'
  next()
})

export default router
