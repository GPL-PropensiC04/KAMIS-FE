import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import AddPurchaseStepOne from '@/views/AddPurchaseStepOne.vue'
import AddPurchaseResource from '@/views/AddPurchaseResource.vue'
import AddPurchaseResourceSummary from '@/views/AddPurchaseResourceSummary.vue'
import AddPurchaseAssetSummary from '@/views/AddPurchaseAssetSummary.vue'
import UpdatePurchaseResource from '@/views/UpdatePurchaseResource.vue'
import UpdatePurchaseAsset from '@/views/UpdatePurchaseAsset.vue'
import ListPurchase from '@/views/ListPurchase.vue'
// import AddPurchaseDetailsView from '@/views/AddPurchaseDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: () => import('@/views/DashboardView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/resource/add',
      name: 'add-resource',
      component: () => import('@/views/AddResourceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated
  
  // If the route requires authentication and the user is not logged in
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // If the user is logged in and trying to access login page
  else if (to.path === '/login' && isAuthenticated) {
    next('/home')
  } 
  else {
    next()
  }
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated
  
  // If the route requires authentication and the user is not logged in
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // If the user is logged in and trying to access login page
  else if (to.path === '/login' && isAuthenticated) {
    next('/home')
  } 
  else {
    next()
  }
})

export default router
