import { createRouter, createWebHashHistory } from 'vue-router'
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

const routes = [
  {
    name: 'layout',
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'contacts',
        path: '/contacts',
        component: () => import('@/views/contacts/index.vue'),
        meta: {
          requiresAuth: false,
        }
      }
    ]
  },
  // {
  //   name: 'login',
  //   path: '/login',
  //   component: () => import('@/views/login/index.vue'),
  //   meta: {
  //     requiresAuth: false,
  //   }
  // },
  // {
  //   name: 'register',
  //   path: '/register',
  //   component: () => import('@/views/register/index.vue'),
  //   meta: {
  //     requiresAuth: false,
  //   }
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  next()
  NProgress.done()
})

export default router