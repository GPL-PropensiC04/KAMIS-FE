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
import DetailClientView from '@/views/DetailClientView.vue'
// import AddPurchaseDetailsView from '@/views/AddPurchaseDetailsView.vue'
import ListAsset from '@/views/ListAsset.vue'
import DetailPurchaseAssetView from '@/views/DetailPurchaseAssetView.vue'
import DetailPurchaseResourceView from '@/views/DetailPurchaseResourceView.vue'
import EditAssetView from '@/views/EditAssetView.vue'
import AddClientView from '@/views/AddClientView.vue'
import UpdateClient from '@/views/UpdateClient.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, breadcrumb: 'Dashboard' }
    },
    {
      path: '/client',
      name: 'client',
      component:ListClient,
      meta: { requiresAuth: true, breadcrumb: 'List Klien' }
    },
    {
      path: '/client/add',
      name: 'client-add',
      component:AddClientView,
      meta: { requiresAuth: true, roles: ["Operational"], breadcrumb: 'Tambah Klien', parent: '/client' }
    },
    {
      path: '/client/:id',
      name: 'client-detail',
      component:DetailClientView,
      meta: { requiresAuth: true, breadcrumb: 'Detail Klien', parent: '/client' }
    },
    {
      path: '/client/update/:id',
      name: 'client-update',
      component:UpdateClient,
      meta: { requiresAuth: true, roles: ["Operational"], breadcrumb: 'Edit Klien', parent: '/client' }
    },
    {
      path: '/purchase',
      name: 'purchase',
      component:ListPurchase,
      meta: { requiresAuth: true, roles: ["Admin", "Operational", "Finance", "Direksi"], breadcrumb: 'List Pembelian' }
    },
    {
      path: '/purchase/add',
      name: 'purchase-add',
      component:AddPurchaseStepOne,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Tambah Pembelian', parent: '/purchase' }
    },
    {
      path: '/purchase/add/asset',
      name: 'purchase-addAsset',
      component:AddPurchaseAsset,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Tambah Pembelian Aset', parent: '/purchase' }
    },
    {
      path: '/purchase/add/resource',
      name: 'purchase-addResource',
      component: AddPurchaseResource,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Tambah Pembelian Resource', parent: '/purchase' }
    },
    {
      path: '/purchase/add/resource-summary',
      name: 'purchase-addResourceSummary',
      component: AddPurchaseResourceSummary,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Ringkasan Pembelian Resource', parent: '/purchase/add/resource' }
    },
    {
      path: '/purchase/add/asset-summary',
      name: 'purchase-addAssetSummary',
      component: AddPurchaseAssetSummary,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Ringkasan Pembelian Aset', parent: '/purchase/add/asset' }
    },
    {
      path: '/purchase/detail/resource/:id',
      name: 'purchase-detailResource',
      component: DetailPurchaseResourceView,
      meta: { requiresAuth: true, breadcrumb: 'Detail Pembelian Resource', parent: '/purchase' },
      props: true,
    },
    {
      path: '/purchase/detail/asset/:id',
      name: 'purchase-detailAsset',
      component: DetailPurchaseAssetView,
      meta: { requiresAuth: true, breadcrumb: 'Detail Pembelian Aset', parent: '/purchase' },
      props: true,
    },
    {
      path: '/purchase/update-resource/:purchaseId',
      name: 'purchase-updateResource',
      component: UpdatePurchaseResource,
      props: true,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Update Pembelian Resource', parent: '/purchase/detail/resource/:id' }
    },
    {
      path: '/purchase/update-asset/:purchaseId',
      name: 'purchase-updateAsset',
      component: UpdatePurchaseAsset,
      props: true, // Kirim ID dari URL sebagai prop
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Update Pembelian Resource', parent: '/purchase/detail/asset/:id' }
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
      name: 'resource-add',
      component: () => import('@/views/AddResourceView.vue'),
      meta: { requiresAuth: true, breadcrumb: 'Tambah Resource', parent: '/resource' }
    },
    {
      path: '/resource',
      name: 'resource',
      component:ListResource,
      meta: { requiresAuth: true, breadcrumb: 'List Resource' }
    },
    {
      path: '/resource/update/:id',
      name: 'resource-update',
      component:UpdateResource,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Edit Resource', parent: '/resource' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    },
    {
      path: '/assets',
      name: 'assets-list',
      component: ListAsset,
      meta: { requiresAuth: true, breadcrumb: 'List Aset' }
    },
    {
      path: '/asset/:platNomor',
      name: 'assets-detail',
      component: DetailAssetView,
      meta: { requiresAuth: true, breadcrumb: 'Detail Aset', parent: '/assets'}
    },
    {
      path: '/asset/edit/:platNomor',
      name: 'assets-edit',
      component: EditAssetView,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Edit Aset', parent: '/asset/:platNomor'}
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
