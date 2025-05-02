import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/profile/LoginView.vue'
import AddPurchaseStepOne from '@/views/purchase/AddPurchaseStepOne.vue'
import AddPurchaseResource from '@/views/purchase/AddPurchaseResource.vue'
import AddPurchaseResourceSummary from '@/views/purchase/AddPurchaseResourceSummary.vue'
import AddPurchaseAssetSummary from '@/views/purchase/AddPurchaseAssetSummary.vue'
import DetailAssetView from '@/views/asset/DetailAssetView.vue'
import UpdatePurchaseResource from '@/views/purchase/UpdatePurchaseResource.vue'
import UpdatePurchaseAsset from '@/views/purchase/UpdatePurchaseAsset.vue'
import ListPurchase from '@/views/purchase/ListPurchase.vue'
import AddPurchaseAsset from '@/views/purchase/AddPurchaseAsset.vue'
import ListResource from '@/views/resource/ListResource.vue'
import UpdateResource from '@/views/resource/UpdateResource.vue'
import ListClient from '@/views/profile/ListClient.vue'
import DetailClientView from '@/views/profile/DetailClientView.vue'
import ListAsset from '@/views/asset/ListAsset.vue'
import DetailPurchaseAssetView from '@/views/purchase/DetailPurchaseAssetView.vue'
import DetailPurchaseResourceView from '@/views/purchase/DetailPurchaseResourceView.vue'
import EditAssetView from '@/views/asset/EditAssetView.vue'
import AddClientView from '@/views/profile/AddClientView.vue'
import UpdateClient from '@/views/profile/UpdateClient.vue'
import AddSupplierView from '@/views/profile/AddSupplierView.vue';
import ListProject from '@/views/project/ListProject.vue';
import AddDistributionView from '@/views/project/AddDistributionView.vue';
import AddSalesView from '@/views/project/AddSalesView.vue';
import DistributionSummaryView from '@/views/project/DistributionSummaryView.vue';
import SalesSummaryView from '@/views/project/SalesSummaryView.vue';
import UpdateDistributionView from '@/views/project/UpdateDistributionView.vue';
import UpdateSalesView from '@/views/project/UpdateSalesView.vue';
import ListSupplierView from '@/views/profile/ListSupplierView.vue';
import DetailSupplierView from '@/views/profile/DetailSupplierView.vue';
import DetailDistributionView from '@/views/project/DetailDistributionView.vue'
import DetailSellView from '@/views/project/DetailSellView.vue'
import type { RouteLocationNormalized } from 'vue-router'

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
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/supplier/add',
      name: 'supplier-add',
      component: AddSupplierView,
      meta: { requiresAuth: true, roles: ["Operational", "Admin"], breadcrumb: 'Tambah Supplier', parent: '/supplier'}
    },
    {
      path: '/supplier',
      name: 'supplier',
      component: ListSupplierView,
      meta: { requiresAuth: true, breadcrumb: 'List Supplier' }
    },    
    {
      path: '/supplier/detail/:id',
      name: 'supplier-detail',
      component: DetailSupplierView,
      meta: { requiresAuth: true, roles: ["Operational", "Admin"], breadcrumb: 'Detail Supplier', parent: '/supplier' },
      props: true
    },
    {
      path: '/supplier/update/:id',
      name: 'supplier-update',
      component: () => import('@/views/profile/UpdateSupplierView.vue'),
      meta: { requiresAuth: true, roles: ["Operational", "Admin"], breadcrumb: 'Update Supplier', parent: (route: RouteLocationNormalized) => ({ name: 'supplier-detail', params: { id: route.params.id } }) },
      props: true
    },
    {
      path: '/client',
      name: 'client',
      component: ListClient,
      meta: { requiresAuth: true, breadcrumb: 'List Klien' }
    },
    {
      path: '/client/add',
      name: 'client-add',
      component: AddClientView,
      meta: { requiresAuth: true, roles: ["Operational"], breadcrumb: 'Tambah Klien', parent: '/client' }
    },
    {
      path: '/client/update/:id',
      name: 'client-update', 
      component: UpdateClient,
      props: true,
      meta: { requiresAuth: true, roles: ["Operational"], breadcrumb: 'Edit Klien', parent: (route: RouteLocationNormalized) => ({ name: 'client-detail', params: { id: route.params.id } }) }
    },
    {
      path: '/client/:id',
      name: 'client-detail',
      component: DetailClientView,
      props: true,
      meta: { requiresAuth: true, breadcrumb: 'Detail Klien', parent: '/client' }
    },
    {
      path: '/client/update/:id',
      name: 'update-client',
      component:UpdateClient,
      meta: { requiresAuth: true, roles: ["Operational"] }
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
      path: '/purchase/update-resource/:purchaseId',
      name: 'purchase-updateResource',
      component: UpdatePurchaseResource,
      props: true,
      meta: { 
        requiresAuth: true, 
        roles: ["Admin", "Operational"], 
        breadcrumb: 'Edit Pembelian Resource', 
        parent: (route: RouteLocationNormalized) => ({ name: 'purchase-detailResource', params: { id: route.params.id } }) 
      }
    },
    {
      path: '/purchase/update-asset/:purchaseId',
      name: 'purchase-updateAsset',
      component: UpdatePurchaseAsset,
      props: true,
      meta: { 
        requiresAuth: true, 
        roles: ["Admin", "Operational"], 
        breadcrumb: 'Edit Pembelian Aset', 
        parent: (route: RouteLocationNormalized) => ({ name: 'purchase-detailAsset', params: { id: route.params.id } }) 
      }
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
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: () => import('@/views/DashboardView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/resource/add',
      name: 'resource-add',
      component: () => import('@/views/resource/AddResourceView.vue'),
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
      props: true,
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], breadcrumb: 'Edit Resource', parent: '/resource' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    },
    {
      path: '/assets',
      name: 'assets',
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
      meta: { requiresAuth: true, roles: ["Admin", "Operational"], 
        breadcrumb: 'Edit Aset', parent: (route: RouteLocationNormalized) => ({ name: 'assets-detail', params: { platNomor: route.params.platNomor }}) }
    },
    {
      path: '/project',
      name: 'project',
      component: ListProject,
      meta: { requiresAuth: true, 
        breadcrumb: 'List Distribusi dan Penjualan' }
    },
    {
      path: '/project/add/distribution',
      name: 'add-distribution',
      component: AddDistributionView,
      meta: { requiresAuth: true, 
        roles: ["Admin", "Operational"], 
        breadcrumb: 'Tambah Distribusi', parent: '/project' }
    },
    {
      path: '/project/add/distribution-summary',
      name: 'distribution-summary',
      component: DistributionSummaryView,
      meta: { requiresAuth: true, 
        roles: ["Admin", "Operational"],
        breadcrumb: 'Ringkasan Distribusi', parent: '/project/add/distribution' }
    },
    {
      path: '/project/add/sales',
      name: 'add-sales',
      component: AddSalesView,
      meta: { requiresAuth: true, 
        roles: ["Admin", "Operational"], 
        breadcrumb: 'Tambah Penjualan', parent: '/project' }
    },
    {
      path: '/project/add/sales-summary',
      name: 'sales-summary',
      component: SalesSummaryView,
      meta: { requiresAuth: true, 
        roles: ["Admin", "Operational"], 
        breadcrumb: 'Konfirmasi Penjualan', parent: '/project/add/sales' }
    },
    {
      path: '/project/distribution/:id',
      name: 'project-detailDistribution',
      component: DetailDistributionView,
      props: true,
      meta: { requiresAuth: true, 
        breadcrumb: 'Detail Distribusi', parent: '/project' }
    },
    {
      path: '/project/sale/:id',
      name: 'project-detailSale',
      component: DetailSellView,
      props: true,
      meta: { requiresAuth: true, 
        breadcrumb: 'Detail Penjualan', parent: '/project' }
    },
    {
      path: '/project/update/distribution/:id',
      name: 'update-distribution',
      component: UpdateDistributionView,
      props: true,
      meta: { requiresAuth: true, 
        roles: ["Admin", "Finance"], 
        breadcrumb: 'Edit Distribusi', parent: (route: RouteLocationNormalized) => ({ name: 'project-detailDistribution', params: { id: route.params.id } }) }
    },
    {
      path: '/project/update/sales/:id',
      name: 'update-sales',
      component: UpdateSalesView,
      props: true,
      meta: { 
        requiresAuth: true, 
        roles: ["Admin", "Finance"], 
        breadcrumb: 'Edit Penjualan', 
        parent: (route: RouteLocationNormalized) => ({ name: 'project-detailSale', params: { id: route.params.id } }) 
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