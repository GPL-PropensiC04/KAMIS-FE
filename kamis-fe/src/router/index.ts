import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AddPurchaseStepOne from '@/views/AddPurchaseStepOne.vue'
import AddPurchaseResource from '@/views/AddPurchaseResource.vue'
// import AddPurchaseDetailsView from '@/views/AddPurchaseDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/add-purchase',
      name: 'addPurchase',
      component:AddPurchaseStepOne,
    },
    {
      path: '/add-purchase-resource',
      name: 'addPurchaseResource',
      component: AddPurchaseResource,
    },
    // {
    //   path: '/purchase',
    //   name: 'purchaseList',
    //   component: PurchaseListView,
    // },
  ],
})

export default router
