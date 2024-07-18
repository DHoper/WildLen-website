import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoadingStore } from '@/stores/loading'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Help from '@/views/Help.vue'
import Articles from '@/views/Articles.vue'
import Explore from '@/views/Explore.vue'
import Gallery from '@/views/Gallery.vue'
import Community from '@/views/Community.vue'
import PhotoPost from '@/views/Gallery/Post.vue'
import CommunityPost from '@/views/Community/CommunityPost.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    { path: '/home', component: Home, name: 'Home' },
    {
      path: '/login',
      component: Login,
      name: 'Login',
      beforeEnter: (to, from, next) => {
        if (to || from) {
          //--問題--build問題 待解決
        }
        const userStore = useUserStore() //無法在global scope中/Pinia被掛載前使用
        if (userStore.isLogin) {
          next({ name: 'Articles' })
        } else {
          next()
        }
      }
    },
    {
      path: '/register',
      component: Register,
      name: 'Register',
      beforeEnter: (to, from, next) => {
        // if (to || from) {
        // }
        const userStore = useUserStore()
        if (userStore.isLogin) {
          next({ name: 'Articles' })
        } else {
          next()
        }
      }
    },
    {
      path: '/help',
      component: Help,
      name: 'Help'
    },
    {
      path: '/explore',
      component: Explore,
      name: 'Explore'
    },
    {
      path: '/articles',
      children: [
        {
          path: '',
          name: 'Articles',
          component: Articles
        },
        {
          path: ':id',
          name: 'Article',
          component: () => import('@/views/Articles/Article.vue'),
          props: true
        }
      ]
    },
    {
      path: '/gallery',
      children: [
        {
          path: '',
          name: 'Gallery',
          component: Gallery
        },
        {
          path: 'createPost',
          name: 'CreatePost',
          component: () => import('@/views/Gallery/CreatePost.vue')
        },
        {
          path: 'photoPost/:id',
          name: 'PhotoPost',
          component: PhotoPost,
          props: true
        },
        {
          path: 'photoPost/edit/:id',
          name: 'EditPhotoPost',
          component: () => import('@/views/Gallery/EditPost.vue'),
          props: true
        }
      ]
    },
    {
      path: '/community',
      children: [
        {
          component: Community,
          path: '',
          name: 'Community',
          meta: { requiresAuth: true }
        },
        {
          path: 'post/:id',
          name: 'CommunityPost',
          component: CommunityPost,
          meta: { requiresAuth: true },
          props: true
        },
        {
          path: 'createPost',
          name: 'CommunityCreatePost',
          component: () => import('@/views/Community/CreatePost.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'editPost/:id',
          name: 'EditCommunityPost',
          component: () => import('@/views/Community/EditPost.vue'),
          props: true
        },
        {
          path: 'createPostPreview',
          name: 'CreatePostPreview',
          component: () => import('@/views/Community/CreatePostPreview.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: 'createVote',
          name: 'CreateVote',
          component: () => import('@/views/Community/CreateVote.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'vote/:id',
          name: 'Vote',
          component: () => import('@/views/Community/CommunityVote.vue'),
          meta: { requiresAuth: true },
          props: true
        },
      ]
    },

    {
      path: '/user',
      children: [
        {
          path: 'personalInfo/:email',
          name: 'PersonalInfo',
          component: () => import('@/views/User/PersonalInfo.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: 'personalPosts',
          name: 'PersonalPosts',
          component: () => import('@/views/User/PersonalPosts.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/error',
      component: () => import('@/components/utils/Error.vue'),
      name: 'Error'
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/components/utils/NotFound.vue'),
      name: 'NotFound'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const loadingStore = useLoadingStore()

  // 等待登錄狀態檢查完成
  if (!userStore.isLoginCheck) {
    await userStore.checkLogin()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !userStore.isLogin) {
    next({ name: 'Login' })
  } else {
    loadingStore.setLoadingStatus(true)
    loadingStore.setIsCountingSeconds(true)
    next()
  }
})


router.afterEach(() => {
  useLoadingStore().setIsCountingSeconds(false)
})

export default router
