import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import AddPurchaseStepOne from '@/views/AddPurchaseStepOne.vue'
import AddPurchaseResource from '@/views/AddPurchaseResource.vue'
import AddPurchaseResourceSummary from '@/views/AddPurchaseResourceSummary.vue'
import AddPurchaseAssetSummary from '@/views/AddPurchaseAssetSummary.vue'
import DetailAssetView from '@/views/DetailAssetView.vue'
import UpdatePurchaseResource from '@/views/UpdatePurchaseResource.vue'
import UpdatePurchaseAsset from '@/views/UpdatePurchaseAsset.vue'
import ListPurchase from '@/views/ListPurchase.vue'
import AddPurchaseAsset from '@/views/AddPurchaseAsset.vue'
import ListResource from '@/views/ListResource.vue'
import UpdateResource from '@/views/UpdateResource.vue'
import ListClient from '@/views/ListClient.vue'
// import AddPurchaseDetailsView from '@/views/AddPurchaseDetailsView.vue'
import ListAsset from '@/views/ListAsset.vue'
import DetailPurchaseAssetView from '@/views/DetailPurchaseAssetView.vue'
import DetailPurchaseResourceView from '@/views/DetailPurchaseResourceView.vue'
import EditAssetView from '@/views/EditAssetView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/client',
      name: 'client',
      component:ListClient,
      meta: { requiresAuth: true }
    },
    {
      path: '/purchase',
      name: 'purchase',
      component:ListPurchase,
      meta: { requiresAuth: true, roles: ["Admin", "Operational", "Finance", "Direksi"] }
    },
    {
      path: '/purchase/add',
      name: 'addPurchase',
      component:AddPurchaseStepOne,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/add/asset',
      name: 'addPurchaseAsset',
      component:AddPurchaseAsset,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/add/resource',
      name: 'addPurchaseResource',
      component: AddPurchaseResource,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/add/resource-summary',
      name: 'addPurchaseResourceSummary',
      component: AddPurchaseResourceSummary,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/add/asset-summary',
      name: 'addPurchaseAssetSummary',
      component: AddPurchaseAssetSummary,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/detail/resource/:id',
      name: 'detailPurchaseResource',
      component: DetailPurchaseResourceView,
      props: true,
    },
    {
      path: '/purchase/detail/asset/:id',
      name: 'detailPurchaseAsset',
      component: DetailPurchaseAssetView,
      props: true,
    },
    {
      path: '/purchase/update-resource/:purchaseId',
      name: 'updatePurchaseResource',
      component: UpdatePurchaseResource,
      props: true, // Kirim ID dari URL sebagai prop
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/purchase/update-asset/:purchaseId',
      name: 'updatePurchaseAsset',
      component: UpdatePurchaseAsset,
      props: true, // Kirim ID dari URL sebagai prop
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
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
      path: '/resource',
      name: 'resource',
      component:ListResource,
      meta: { requiresAuth: true }
    },
    {
      path: '/resource/update/:id',
      name: 'updateResource',
      component:UpdateResource,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"] }
    },
    {
      path: '/resource/add',
      name: 'addResource',
      component: () => import('@/views/AddResourceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    },
    {
      path: '/assets',
      name: 'list-assets',
      component: ListAsset,
      meta: { requiresAuth: true }
    },
    {
      path: '/asset/:platNomor',
      name: 'DetailAset',
      component: DetailAssetView,
      meta: {
        title: 'Detail Aset', requiresAuth: true
      }
    },
    {
      path: '/asset/edit/:platNomor',
      name: 'EditAset',
      component: EditAssetView,
      meta: {
        title: 'Mengubah Aset', requiresAuth: true
      }
    },
    {
      path: '/coming-soon',
      name: 'ComingSoon',
      component: () => import('@/views/ComingSoonView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated
  
  // Check if app was previously closed
  const appWasClosed = sessionStorage.getItem('app_was_closed')
  if (appWasClosed === 'true') {
    // Clear the flag
    sessionStorage.removeItem('app_was_closed')
    
    // Only logout if this wasn't a browser refresh (handled in App.vue)
    // The localStorage auth_token would have been removed already on real close
    if (localStorage.getItem('auth_token') === null) {
      console.log('Session ended due to tab/browser close')
      // Complete the logout process but we don't need to remove the token
      // as it was already removed during the close event
      authStore.logout(false) // passing false to avoid removing token again
      return next('/login')
    }
  }
  
  // Regular auth checks
  // If the route requires authentication and the user is not logged in
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // If the user is logged in and trying to access login page
  else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})
export default router
