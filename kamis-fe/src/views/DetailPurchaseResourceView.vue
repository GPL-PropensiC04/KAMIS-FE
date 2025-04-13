<template>
  <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md mb-6">
      <p class="text-red-700">{{ error }}</p>
      <button @click="loadPurchaseData" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
        Coba Lagi
      </button>
    </div>

    <!-- Purchase Details -->
    <div v-else-if="purchase" class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between mb-2">
        <button @click="router.back()" class="hover:underline flex items-center mb-2 text-[28px]">
          <span>←</span>
        </button>
        <div v-if="purchase.purchaseStatus !== 'Ditolak' && purchase.purchaseStatus !== 'Dibatalkan'" class="flex justify-end gap-2 mb-2">
          <template v-if="purchase.purchaseStatus === 'Diajukan'">
            <template v-if="userRole === 'Operasional'">
              <VButton label="Ubah Detail" @click="handleEditDetail" />
            </template>
            <template v-else>
              <VCancelButton label="Tolak" @click="openModal(false)" />
              <VSuccessButton label="Setujui" @click="openModal(true)" />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Disetujui'">
            <template v-if="userRole === 'Operasional'">
              <VButton label="Proses Pembelian" @click="openModal(true)" />
            </template>
            <template v-else-if="userRole === 'Admin'">
              <VCancelButton label="Batalkan" @click="openModal(false)" />
              <VButton label="Proses Pembelian" @click="openModal(true)" />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Diproses'">
            <template v-if="userRole === 'Operasional'">
              <VCancelButton label="Batalkan" @click="openModal(false)" />
              <VButton label="Selesaikan Pembelian" @click="openModal(true)" />
            </template>
            <template v-else-if="userRole === 'Finance'">
              <VSuccessButton 
                v-if="!purchase.purchasePaymentDate" 
                label="Konfirmasi Pembayaran" 
                @click="openPaymentModal()" 
              />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Selesai'">
            <template v-if="userRole === 'Finance'">
              <VSuccessButton 
                v-if="!purchase.purchasePaymentDate" 
                label="Konfirmasi Pembayaran" 
                @click="openPaymentModal()" 
              />
            </template>
          </template>
        </div>
      </div>

      <!-- Info -->
      <div class="grid grid-cols-3 gap-4 mb-4 border-b pb-4">   
        <div>
          <p class="text-lg font-bold font-lato">ID Transaksi</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseId }}</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Supplier</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseSupplier }}</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Tipe Barang</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">Resource</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Tanggal Pengajuan</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchaseSubmissionDate) }}</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Tanggal Terakhir Diperbarui</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchaseUpdateDate) }}</p>
        </div>
        <div v-if="purchase.purchasePaymentDate">
          <p class="text-lg font-bold font-lato">Tanggal Pembayaran</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchasePaymentDate) }}</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Status Pembelian</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseStatus }}</p>
        </div>
      </div>

      <!-- Resource Table -->
      <div v-if="purchase.purchaseResource?.length">
        <table class="w-full border-collapse border border-[#1E3A5F] mb-4">
          <thead>
            <tr class="bg-[#1E3A5F] text-white">
              <th class="p-2 border border-[#1E3A5F] text-left">Nama Barang</th>
              <th class="p-2 border border-[#1E3A5F] text-center">Jumlah</th>
              <th v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">Harga Satuan</th>
              <th v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in purchase.purchaseResource" :key="resource.resourceId">
              <td class="p-2 border border-[#1E3A5F]">{{ resource.resourceName }}</td>
              <td class="p-2 border border-[#1E3A5F] text-center">{{ resource.resourceTotal }}</td>
              <td v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">{{ formatCurrency(resource.resourcePrice) }}</td>
              <td v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">{{ formatCurrency(resource.resourcePrice * resource.resourceTotal) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="userRole !== 'Operasional'">
          <div class="flex justify-end">
            <p class="text-lg font-bold font-lato pr-10">Total Harga:</p>
            <p class="text-black text-lg font-lato font-bold">{{ formatCurrency(purchase.purchasePrice) }}</p>
          </div>
        </div>
      </div>

      <!-- Note Section -->
      <div class="mb-6">
        <VLockedInput label="Catatan" placeholder="Tidak ada catatan" :value="purchase.purchaseNote" />
      </div>
    </div>

    <!-- Modal Konfirmasi -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h3 class="text-xl font-semibold mb-4">Konfirmasi Update Status</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium">Catatan <span class="text-red-500">*</span></label>
          <textarea v-model="note" rows="3" class="w-full border border-gray-300 p-2 rounded"></textarea>
        </div>
        <p v-if="modalError" class="text-red-500 text-sm">{{ modalError }}</p>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showModal = false" class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">Batal</button>
          <button @click="submitUpdateStatus" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Kirim</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchase'
import { useAuthStore } from '@/stores/auth'
import VButton from '@/components/VButton.vue'
import VSuccessButton from '@/components/VSuccessButton.vue'
import VCancelButton from '@/components/VCancelButton.vue'
import VLockedInput from '@/components/VLockedInput.vue'
import type { UpdatePurchaseStatusRequestInterface } from '@/interfaces/purchase.interface'

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()
const authStore = useAuthStore()

const purchaseId = ref(route.params.id as string)
const loading = computed(() => purchaseStore.loading)
const error = computed(() => purchaseStore.error)
const purchase = computed(() => purchaseStore.currentPurchase)
const userRole = computed(() => authStore.userRole)

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID')
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)

const canViewFinancialInfo = computed(() => userRole.value !== 'Operasional')

// Modal State
const showModal = ref(false)
const isNextStatus = ref(true)
const isPaymentModal = ref(false)
const note = ref('')
const modalError = ref('')

const openModal = (next: boolean) => {
  isNextStatus.value = next
  isPaymentModal.value = false
  note.value = ''
  showModal.value = true
}

const openPaymentModal = () => {
  isPaymentModal.value = true
  isNextStatus.value = false // payment tidak pakai next status flow
  note.value = ''
  showModal.value = true
}

const submitUpdateStatus = async () => {
  if (!note.value.trim()) {
    modalError.value = 'Catatan wajib diisi ❗'
    return
  }

  const body: UpdatePurchaseStatusRequestInterface = {
    purchaseNote: note.value,
  }

  if (isPaymentModal.value) {
    await purchaseStore.updatePurchaseStatusPembayaran(purchaseId.value, body)
  } else {
    await purchaseStore.updatePurchaseStatus(purchaseId.value, isNextStatus.value, body)
  }

  showModal.value = false
  await loadPurchaseData()
}

const handleEditDetail = () => router.push(`/purchase/update-resource/${purchaseId.value}`)

const loadPurchaseData = async () => {
  if (!purchaseId.value) return
  await purchaseStore.getPurchaseById(purchaseId.value)
}

onMounted(() => loadPurchaseData())
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
.font-lato {
  font-family: 'Lato', sans-serif;
}
</style>
