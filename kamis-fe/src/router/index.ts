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
import AddPurchaseAsset from '@/views/AddPurchaseAsset.vue'
import ListPurchase from '@/views/ListPurchase.vue'
import ListResource from '@/views/ListResource.vue'
import UpdateResource from '@/views/UpdateResource.vue'
// import AddPurchaseDetailsView from '@/views/AddPurchaseDetailsView.vue'
import ListAsset from '@/views/ListAsset.vue'
import DetailPurchaseAssetView from '@/views/DetailPurchaseAssetView.vue'
import DetailPurchaseResourceView from '@/views/DetailPurchaseResourceView.vue'

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
      path: '/purchase',
      name: 'purchase',
      component:ListPurchase,
    },
    {
      path: '/purchase/add',
      name: 'addPurchase',
      component:AddPurchaseStepOne,
    },
    {
      path: '/purchase/add/asset',
      name: 'addPurchaseAsset',
      component:AddPurchaseAsset,
    },
    {
      path: '/purchase/add/resource',
      name: 'addPurchaseResource',
      component: AddPurchaseResource,
    },
    {
      path: '/purchase/add/resource-summary',
      name: 'addPurchaseResourceSummary',
      component: AddPurchaseResourceSummary,
    },
    {
      path: '/purchase/add/asset-summary',
      name: 'addPurchaseAssetSummary',
      component: AddPurchaseAssetSummary,
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
    },
    {
      path: '/purchase/update-asset/:purchaseId',
      name: 'updatePurchaseAsset',
      component: UpdatePurchaseAsset,
      props: true, // Kirim ID dari URL sebagai prop
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
    },
    {
      path: '/resource/update/:id',
      name: 'updateResource',
      component:UpdateResource,
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
    },
    {
      path: '/asset/:platNomor',
      name: 'DetailAset',
      component: () => DetailAssetView,
      meta: {
        title: 'Detail Aset'
      }
    },
    {
      path: '/asset/edit/:platNomor',
      name: 'EditAset',
      component: () => import('@/views/EditAssetView.vue'),
      meta: {
        title: 'Mengubah Aset'
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
