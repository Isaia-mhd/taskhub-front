import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import useAuthStore from '@/stores/auth'
import WorkspaceLayout from '@/layouts/WorkspaceLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

import Main from '@/views/workspace/Main.vue'
import SpaceView from '@/views/workspace/space/SpaceView.vue'
import MembersView from '@/views/workspace/members/MembersView.vue'
import InvitationsView from '@/views/workspace/invitations/InvitationsView.vue'
import StatusesView from '@/views/workspace/statuses/StatusesView.vue'
import PrioritiesView from '@/views/workspace/priorities/PrioritiesView.vue'
import TagsView from '@/views/workspace/tags/TagsView.vue'
import InvitationView from '@/views/invitations/InvitationView.vue'

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
      {
        path: '/invitations/:token',
        name: 'invitation.show',
        component: InvitationView,
        props: true,
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
      },
      {
        path: 'spaces',
        name: 'workspace.spaces',
        component: SpaceView,
      },
      {
        path: 'spaces/:spaceId',
        name: 'workspace.space.show',
        component: () => import('@/views/workspace/space/SpaceDetailView.vue'),
        props: true,
      },
      {
        path: 'tasks/:taskId',
        name: 'workspace.task.show',
        component: () => import('@/views/workspace/tasks/TaskDetailView.vue'),
        props: true,
      },
      {
        path: 'members',
        name: 'workspace.members',
        component: MembersView,
      },
      {
        path: 'invitations',
        name: 'workspace.invitations',
        component: InvitationsView,
      },
      {
        path: 'statuses',
        name: 'workspace.statuses',
        component: StatusesView,
      },
      {
        path: 'priorities',
        name: 'workspace.priorities',
        component: PrioritiesView,
      },
      {
        path: 'tags',
        name: 'workspace.tags',
        component: TagsView,
      },
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
