import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import useAuthStore from '@/stores/auth'
import WorkspaceLayout from '@/layouts/WorkspaceLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

import Main from '@/views/workspace/Main.vue'


const routes = [
  {
    path: '/',
    name: 'public',
    component: PublicLayout,
    children: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
          guest: true
        }
      },
      {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
          guest: true
        }
      },
    ]
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspaceLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'workspace.main',
        component: Main,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async(to) => {
  const auth = useAuthStore()

  if(!auth.user)
  {
    await auth.getUser()
  }

  if(to.meta.requiresAuth && !auth.isAuthenticated)
  {
    return { name: 'login' }
  }

  if(to.meta.guest && auth.isAuthenticated)
  {
    return { name: 'workspace' }
  }

})

export default router
