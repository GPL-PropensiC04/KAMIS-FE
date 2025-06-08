<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import axios from "axios";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VNumberInput from "@/components/VNumberInput.vue";
import VPriceInput from "@/components/VPriceInput.vue";
import VLockedInput from "@/components/VLockedInput.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import { useToast } from "vue-toastification";
import type { ResourceTempInterface } from "@/interfaces/purchase/resourcetemp.interface";
import { API_URLS } from "@/config/api.config";
import type { UUID } from "crypto";
import VSpecialDropDown from "@/components/VSpecialDropDown.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Router & Store
const router = useRouter();
const route = useRoute();
const purchaseStore = usePurchaseStore();

// **Ambil purchaseId dari route**
const purchaseId = route.params.purchaseId as string;

// **Data Purchase**
const purchaseDate = ref("");
const selectedSupplier = ref("");
const purchaseType = ref("");
const purchaseNote = ref("");

// **Data Resource**
const resources = ref<{ id: number; name: string }[]>([]);
const selectedResource = ref("");
const quantity = ref(1);
const price = ref(0);
const resourceList = ref<ResourceTempInterface[]>([]);

const supplierOptions = ref<{ label: string; value: UUID }[]>([]);

const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/all`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierOptions.value = response.data.data.map((item: { id: UUID; companySupplier: string; }) => ({
            label: item.companySupplier, // untuk ditampilkan
            value: item.id // untuk disimpan
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// **Format Tanggal (dd / MM / yyyy)**
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
};

// **Fetch Detail Purchase dari API**
const fetchPurchaseDetail = async () => {
    try {
        const response = await axios.get(`${API_URLS.PURCHASE}/purchase/detail/${purchaseId}`, {
            headers: { "Content-Type": "application/json" }
        });

        const data = response.data.data;

        // **Prefill Data**
        purchaseDate.value = formatDate(data.purchaseSubmissionDate);
        selectedSupplier.value = data.purchaseSupplier;
        purchaseType.value = data.purchaseType ? "Resource" : "Aset";
        purchaseNote.value = data.purchaseNote;

        resourceList.value = data.purchaseResource.map((item: { resourceId: number; resourceName: string; resourceTotal: number; resourcePrice: number }) => ({
            resourceId: item.resourceId,
            resourceName: item.resourceName,
            quantity: item.resourceTotal,
            resourcePrice: item.resourcePrice
        }));

        // **Simpan ke Pinia & LocalStorage**
        updateDraftPurchase();
    } catch (error) {
        console.error("Error fetching purchase details:", error);
    }
};

// **Fetch Data Resource dari API**
const fetchResources = async () => {
    try {
        const response = await axios.get(`${API_URLS.RESOURCE}/resource/viewall`, {
            headers: { "Content-Type": "application/json" }
        });

        resources.value = response.data.data.map((item: { id: number; resourceName: string }) => ({
            id: item.id,
            name: item.resourceName
        }));
    } catch (error) {
        console.error("Error fetching resources:", error);
    }
};

// **Format ke Rupiah**
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// **Hitung Total Harga**
const totalPrice = computed(() => {
    return resourceList.value.reduce((sum, item) => sum + item.resourcePrice * item.quantity, 0);
});

// **Hapus Resource dari List**
const removeResource = (index: number) => {
    resourceList.value.splice(index, 1);
    updateDraftPurchase();
};

// **Simpan Perubahan ke Store & LocalStorage**
const updateDraftPurchase = () => {
    // Create a structure that matches PurchaseInterface
    const draftData = {
        id: purchaseId,
        purchaseId: purchaseId,
        purchaseSupplier: selectedSupplier.value,
        purchaseType: purchaseType.value, // Keep as string for now
        purchaseStatus: '',
        purchasePrice: totalPrice.value,
        purchaseNote: purchaseNote.value,
        purchaseSubmissionDate: '', 
        purchaseUpdateDate: '',
        purchaseResource: resourceList.value,
        purchaseAsset: null,
        purchaseLogs: [] // Add empty logs array to fix type error
    };
    
    purchaseStore.setDraftPurchase(draftData);
    localStorage.setItem("draftPurchase", JSON.stringify(draftData));
};

// **Tambah Resource ke List**
const addResource = () => {
    if (!selectedResource.value || quantity.value <= 0 || price.value <= 0) {
        useToast().error("Harap isi semua field dengan benar!");
        return;
    }

    const selectedItem = resources.value.find((item) => item.name === selectedResource.value);
    if (!selectedItem) {
        useToast().error("Resource tidak valid!");
        return;
    }

    const existingItem = resourceList.value.find((item) => item.resourceId === selectedItem.id);
    if (existingItem) {
        useToast().error("Resource ini sudah ditambahkan!");
        return;
    }

    resourceList.value.push({
        resourceId: selectedItem.id,
        resourceName: selectedItem.name,
        quantity: quantity.value,
        resourceTotal: quantity.value,
        resourcePrice: price.value
    });

    updateDraftPurchase();

    selectedResource.value = "";
    quantity.value = 1;
    price.value = 0;
};

const handleUpdatePurchase = async () => {
    if (resourceList.value.length === 0) {
        useToast().error("Harap tambahkan resource!");
        return;
    }
    
    const body = {
        purchaseSupplier: selectedSupplier.value,
        purchaseNote: purchaseNote.value,
        purchaseResource: resourceList.value,
    };

    await purchaseStore.updatePurchase(body, purchaseId);
    router.push(`/purchase/detail/resource/${purchaseId}`);
};

// Fungsi untuk menambah jumlah
const increaseQuantity = (index: number) => {
    resourceList.value[index].quantity++;
    resourceList.value[index].resourceTotal = resourceList.value[index].quantity;
    updateDraftPurchase();
};

// Fungsi untuk mengurangi jumlah (minimal 1)
const decreaseQuantity = (index: number) => {
    if (resourceList.value[index].quantity > 1) {
        resourceList.value[index].quantity--;
        resourceList.value[index].resourceTotal = resourceList.value[index].quantity;
        updateDraftPurchase();
    }
};

// Fungsi untuk validasi input jumlah
const validateQuantity = (index: number) => {
    if (resourceList.value[index].quantity < 1 || isNaN(resourceList.value[index].quantity)) {
        resourceList.value[index].quantity = 1;
    }
    resourceList.value[index].resourceTotal = resourceList.value[index].quantity;
    updateDraftPurchase();
};

// **Pastikan Data Prefilled setelah Refresh**
onMounted(() => {
    fetchPurchaseDetail();
    fetchResources();
    fetchSuppliers();
});

// Handle cancel
const handleCancel = () => {
    router.push(`/purchase/detail/resource/${purchaseId}`);
};

// Form validation
const isFormValid = computed(() => {
    return selectedResource.value.trim() !== '' && 
           quantity.value > 0 && 
           price.value > 0;
});

</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Main Content -->
    <div class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="handleCancel" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Update Pembelian Resource</h1>
                <p class="text-blue-100 mt-1">Perbarui item resource untuk pembelian</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <VSuccessButton label="Update" @click="handleUpdatePurchase"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card with Horizontal Layout -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
            
            <!-- Purchase Info Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Purchase</h2>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <!-- Purchase Date -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Tanggal Pengajuan</span>
                  </label>
                  <div class="form-input bg-gray-50 text-gray-600 font-medium">{{ purchaseDate || 'Loading...' }}</div>
                </div>

                <!-- Supplier -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Supplier</span>
                  </label>
                  <VSpecialDropDown v-model="selectedSupplier" :options="supplierOptions" class="form-dropdown" />
                </div>

                <!-- Type -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Tipe Barang</span>
                  </label>
                  <VLockedInput :value="purchaseType" class="form-input bg-gray-50 text-gray-600" />
                </div>
              </div>
            </div>

            <!-- Add Item Form Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Tambah Item Resource</h2>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <!-- Resource Selection -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Nama Resource</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <VDropDownInput 
                    v-model="selectedResource" 
                    :options="resources.map(item => item.name)" 
                    placeholder="Pilih Resource"
                    class="form-dropdown"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <!-- Quantity -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Jumlah</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <VNumberInput v-model="quantity" :min="1" placeholder="1" class="w-full" />
                  </div>

                  <!-- Price -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Harga Satuan</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <VPriceInput v-model="price" placeholder="Rp0,00" class="w-full" />
                  </div>
                </div>

                <!-- Add Button -->
                <div class="form-group">
                  <VSuccessButton 
                    :label="isFormValid ? 'Tambah Item' : 'Lengkapi Data'"
                    @click="addResource" 
                    :class="isFormValid ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                    :disabled="!isFormValid"
                  />
                </div>
              </div>
            </div>

            <!-- Items List Section -->
            <div class="mb-6" v-if="resourceList.length > 0">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Daftar Item ({{ resourceList.length }})</h2>
              </div>

              <div class="overflow-hidden rounded-lg border border-gray-200">
                <table class="w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in resourceList" :key="index" class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.resourceName }}</td>
                      <td class="px-4 py-3 text-center">
                        <div class="flex items-center justify-center space-x-2">
                          <button 
                            @click="decreaseQuantity(index)" 
                            class="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold transition-colors"
                            :disabled="resourceList[index].quantity <= 1"
                          >
                            −
                          </button>
                          <input 
                            type="number"
                            v-model.number="resourceList[index].quantity"
                            @change="validateQuantity(index)"
                            class="w-12 text-center border border-gray-300 rounded text-xs py-1"
                            min="1"
                          />
                          <button 
                            @click="increaseQuantity(index)" 
                            class="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 text-green-600 text-xs font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right text-sm text-gray-900">{{ formatCurrency(item.resourcePrice) }}</td>
                      <td class="px-4 py-3 text-right text-sm font-bold text-blue-600">{{ formatCurrency(item.resourcePrice * item.quantity) }}</td>
                      <td class="px-4 py-3 text-center">
                        <button 
                          @click="removeResource(index)" 
                          class="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        >
                          <svg class="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="mb-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada item</h3>
              <p class="text-gray-500">Tambahkan item resource menggunakan form di atas</p>
            </div>

            <!-- Purchase Note Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Catatan Pembelian</h2>
              </div>

              <div class="form-group">
                <textarea 
                  v-model="purchaseNote" 
                  placeholder="Tambahkan catatan pembelian..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column - Summary & Actions -->
          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <!-- Preview Summary -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Form</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Resource:</span>
                    <span class="font-medium text-gray-900">{{ selectedResource || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Jumlah:</span>
                    <span class="font-medium text-gray-900">{{ quantity || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Harga:</span>
                    <span class="font-medium text-gray-900">{{ price > 0 ? formatCurrency(price) : '-' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Subtotal:</span>
                      <span class="font-bold text-blue-600">{{ (price > 0 && quantity > 0) ? formatCurrency(price * quantity) : '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items Summary -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Summary Items</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Items:</span>
                    <span class="font-medium text-gray-900">{{ resourceList.length }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Grand Total:</span>
                      <span class="font-bold text-green-600 text-lg">{{ resourceList.length > 0 ? formatCurrency(totalPrice) : 'Rp 0' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Validation Status -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
                <h4 class="text-sm font-medium text-gray-800 mb-3">Status Form</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center">
                    <div :class="selectedResource.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="selectedResource.trim()" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Pilih Resource</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="quantity > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="quantity > 0" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Isi Jumlah</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="price > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="price > 0" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Isi Harga</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <VSuccessButton 
                  :label="resourceList.length > 0 ? 'Update Purchase' : 'Tambah Item Dulu'"
                  @click="handleUpdatePurchase" 
                  :class="resourceList.length > 0 ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                  :disabled="resourceList.length === 0"
                />
              </div>

              <!-- Purchase Info -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Info Purchase:</h4>
                <div class="text-xs text-blue-800 space-y-1">
                  <div>• Tanggal: {{ purchaseDate }}</div>
                  <div>• Supplier: {{ supplierOptions.find(s => s.value === selectedSupplier)?.label || '-' }}</div>
                  <div>• Tipe: {{ purchaseType }}</div>
                </div>
              </div>

              <!-- Help Text -->
              <div class="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h4 class="text-sm font-medium text-yellow-900 mb-2">Tips Update:</h4>
                <ul class="text-xs text-yellow-800 space-y-1">
                  <li>• Edit supplier jika diperlukan</li>
                  <li>• Tambah/hapus item resource</li>
                  <li>• Update catatan pembelian</li>
                  <li>• Pastikan data sudah benar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Form Styling */
.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.label-text {
    color: #374151;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    transition: all 0.2s ease;
    color: #111827;
    font-size: 0.875rem;
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-input:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
}

.form-input:hover:not(:disabled) {
    border-color: #d1d5db;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    transition: all 0.2s ease;
    color: #111827;
    font-size: 0.875rem;
    resize: vertical;
    min-height: 100px;
}

.form-textarea::placeholder {
    color: #9ca3af;
}

.form-textarea:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
}

.form-textarea:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
}

/* Button Styling */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    text-decoration: none;
}

.btn-primary:hover {
    transform: scale(1.02);
}

.btn-disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #9ca3af;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: white;
    color: #374151;
    font-weight: 500;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.btn-secondary:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

.btn-secondary:focus {
    outline: none;
    box-shadow: 0 0 0 2px #6b7280, 0 0 0 4px rgba(107, 114, 128, 0.1);
}

/* Disabled state for company field */
.form-input:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
}

/* Responsive improvements */
@media (max-width: 640px) {
    .grid.grid-cols-1.lg\\:grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .form-input {
        font-size: 1rem; /* Prevents zoom on iOS */
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}

/* Custom animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-group {
    animation: slideIn 0.3s ease-out;
}

/* Focus states for accessibility */
.form-input:focus-visible,
.form-textarea:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Hover effects */
.form-group:hover .input-icon {
    color: #6b7280;
}

.space-x-2 > * + * {
    margin-left: 0.5rem;
}

.space-x-4 > * + * {
    margin-left: 1rem;
}

/* Responsive grid */
@media (min-width: 1024px) {
    .lg\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 640px) {
    .sm\\:flex-row {
        flex-direction: row;
    }
    
    .sm\\:order-1 {
        order: 1;
    }
    
    .sm\\:order-2 {
        order: 2;
    }
    
    .sm\\:flex {
        display: flex;
    }
}

/* Order utilities */
.order-1 {
    order: 1;
}

.order-2 {
    order: 2;
}
</style>