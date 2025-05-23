<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSupplierStore } from "@/stores/supplier";
import { useResourceStore } from "@/stores/resource";
import VButton from "@/components/VButton.vue";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { useToast } from "vue-toastification";
import type { UpdateSupplierRequestInterface } from "@/interfaces/profile/supplier.interface";

// Interface untuk item dalam daftar gabungan
interface ListItem {
  id: number | string; // id resource (number) atau id asset (string, cth: platNomor)
  name: string;
  price: number;
  type: 'resource' | 'asset';
}

// Asumsi struktur asset dari supplierDetail (sesuaikan jika berbeda dari backend Anda)
interface AssetInDetail {
  platNomor: string;
  nama: string;
  nilaiPerolehan: number;
  // properti lain jika ada
}
// Asumsi struktur resource dari supplierDetail
interface ResourceInDetail {
  id: number;
  resourceName: string;
  resourcePrice: number;
  // properti lain jika ada
}


const router = useRouter();
const route = useRoute();
const supplierStore = useSupplierStore();
const resourceStore = useResourceStore();
const toast = useToast();

const supplierId = route.params.id as string;

// Form State (tetap sama)
const nameSupplier = ref("");
const companySupplier = ref("");
const noTelpSupplier = ref("");
const emailSupplier = ref("");
const addressSupplier = ref("");

// Dropdown state (tetap sama, untuk memilih resource baru)
const selectedResourceName = ref("");
const selectedResourceId = ref<number | null>(null);
const selectedResourcePrice = ref<number | null>(null);

// Mengubah assignedResources untuk menampung ListItem
const assignedResources = ref<ListItem[]>([]);

// Fetch data on mount
onMounted(async () => {
  await supplierStore.getSupplierDetail(supplierId);
  await resourceStore.fetchResources(); // Untuk dropdown

  if (supplierStore.supplierDetail) {
    const detail = supplierStore.supplierDetail;
    nameSupplier.value = detail.supplierName;
    companySupplier.value = detail.supplierCompany;
    noTelpSupplier.value = detail.supplierPhone;
    emailSupplier.value = detail.supplierEmail;
    addressSupplier.value = detail.supplierAddress;

    const combinedItems: ListItem[] = [];

    // Proses resources dari supplierDetail
    if (detail.resources && Array.isArray(detail.resources)) {
      (detail.resources as ResourceInDetail[]).forEach(res => {
        combinedItems.push({
          id: res.id,
          name: res.resourceName,
          price: res.resourcePrice,
          type: 'resource',
        });
      });
    }

    // Proses assets dari supplierDetail
    // Asumsikan detail.assets adalah array [{ platNomor: string, nama: string, nilaiPerolehan: number }]
    // Jika struktur berbeda, sesuaikan di sini
    if (detail.assets && Array.isArray(detail.assets)) {
      (detail.assets as AssetInDetail[]).forEach(asset => {
        combinedItems.push({
          id: asset.platNomor, // Menggunakan platNomor sebagai ID unik untuk asset
          name: asset.nama,
          price: asset.nilaiPerolehan,
          type: 'asset',
        });
      });
    }
    assignedResources.value = combinedItems;

  } else {
    toast.error("Gagal memuat data supplier");
    router.back();
  }
});

// Computed options (tetap sama)
const resourceOptions = computed(() => resourceStore.resources.map(res => res.resourceName));

// Handler saat pilih resource (tetap sama)
function handleSelectResource(name: string) {
  const selected = resourceStore.resources.find(r => r.resourceName === name);
  if (selected) {
    selectedResourceId.value = selected.id ?? null;
    selectedResourcePrice.value = selected.resourcePrice;
    selectedResourceName.value = selected.resourceName;
  } else {
    selectedResourceId.value = null;
    selectedResourcePrice.value = null;
  }
}

// Tambahkan resource (modifikasi untuk type dan pengecekan)
function addResource() {
  if (!selectedResourceId.value) {
    toast.error("Silahkan pilih barang (resource) terlebih dahulu!");
    return;
  }

  // Pengecekan hanya untuk resource dengan ID yang sama
  const exists = assignedResources.value.some(
    r => r.type === 'resource' && r.id === selectedResourceId.value
  );
  if (exists) {
    toast.error("Barang (resource) sudah ditambahkan!");
    return;
  }

  assignedResources.value.push({
    id: selectedResourceId.value, // ID resource (number)
    name: selectedResourceName.value,
    price: selectedResourcePrice.value!,
    type: 'resource', // Set type sebagai resource
  });

  selectedResourceName.value = "";
  selectedResourcePrice.value = null;
  selectedResourceId.value = null;
}

// Hapus resource (hanya menghapus item dengan type 'resource')
function removeResource(resourceIdToRemove: number) {
  assignedResources.value = assignedResources.value.filter(
    r => !(r.type === 'resource' && r.id === resourceIdToRemove)
  );
}

// Email validation (tetap sama)
function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Submit update (modifikasi untuk mengirim resourceIds yang benar)
async function handleUpdate() {
  if (!nameSupplier.value || !noTelpSupplier.value || !emailSupplier.value || !addressSupplier.value) {
    toast.error("Semua field harus diisi!");
    return;
  }
  if (!/^\d+$/.test(noTelpSupplier.value)) {
    toast.error("Nomor telepon hanya boleh angka!");
    return;
  }
  if (!isValidEmail(emailSupplier.value)) {
    toast.error("Format email tidak valid!");
    return;
  }

  const body: UpdateSupplierRequestInterface = {
    id: supplierId,
    nameSupplier: nameSupplier.value,
    noTelpSupplier: noTelpSupplier.value,
    emailSupplier: emailSupplier.value,
    addressSupplier: addressSupplier.value,
    resourceIds: assignedResources.value
      .filter(res => res.type === 'resource')
      .map(res => res.id as number), // Ambil ID hanya dari resource
  };

  await supplierStore.updateSupplier(body);
}
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="bg-white shadow-sm border-b border-gray-100">
    </div>

    <div class="max-w-full mx-auto px-8 py-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                @click="router.back()"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Edit Supplier</h1>
                <p class="text-blue-100 mt-1">Perbarui informasi supplier dan barang yang disediakan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <div class="col-span-8 p-8 pr-6">
            <div class="mb-8">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Supplier</h2>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Nama PIC</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="nameSupplier"
                      class="form-input pl-10"
                      placeholder="Nama lengkap PIC"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text text-gray-400">Nama Perusahaan</span>
                  </label>
                  <div class="relative">
                    <input
                      :value="companySupplier"
                      disabled
                      class="form-input pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Nama perusahaan supplier"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-8">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Kontak</h2>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Nomor Telepon</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="noTelpSupplier"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      @input="noTelpSupplier = noTelpSupplier.replace(/\D/g, '')"
                      class="form-input pl-10"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Alamat Email</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="emailSupplier"
                      type="email"
                      class="form-input pl-10"
                      placeholder="supplier@perusahaan.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-8">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Alamat Perusahaan</h2>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Alamat Lengkap</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  v-model="addressSupplier"
                  rows="3"
                  class="form-textarea"
                  placeholder="Masukkan alamat lengkap perusahaan termasuk kode pos..."
                ></textarea>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Barang yang Disediakan</h2>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="form-group col-span-1">
                  <label class="form-label">
                    <span class="label-text">Nama Barang (Resource)</span>
                  </label>
                  <VDropDownInput
                    v-model="selectedResourceName"
                    :options="resourceOptions"
                    @update:modelValue="handleSelectResource"
                    class="form-dropdown"
                  />
                </div>
                <div class="form-group col-span-1">
                  <label class="form-label">
                    <span class="label-text">Harga Jual Barang</span>
                  </label>
                  <div class="relative">
                    <input
                      :value="selectedResourcePrice !== null ? `Rp${selectedResourcePrice.toLocaleString('id-ID')}` : ''"
                      disabled
                      class="form-input bg-gray-50"
                      placeholder="Harga Jual Barang"
                    />
                  </div>
                </div>
                <div class="form-group col-span-1 flex items-end">
                  <VButton
                    label="Tambah ke Daftar"
                    @click="addResource"
                    class="btn-secondary w-full"
                  />
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 class="text-sm font-medium text-gray-700">Daftar Barang ({{ assignedResources.length }} item)</h3>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-[#1E3A5F] text-white">
                      <tr>
                        <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Nama Barang</th>
                        <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Harga</th>
                        <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Tipe</th>
                        <th class="py-3 px-4 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="assignedResources.length === 0">
                        <td colspan="4" class="py-8 px-4 text-center text-gray-500">
                          <p class="text-sm">Belum ada barang yang ditambahkan</p>
                        </td>
                      </tr>
                      <tr v-for="item in assignedResources" :key="item.type + '-' + item.id" class="hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ item.name }}</td>
                        <td class="py-3 px-4 text-sm text-gray-900">Rp {{ item.price.toLocaleString('id-ID') }}</td>
                        <td class="py-3 px-4 text-sm text-gray-500 capitalize">{{ item.type }}</td>
                        <td class="py-3 px-4 text-center">
                          <button
                            v-if="item.type === 'resource'"
                            @click="removeResource(item.id as number)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium hover:underline transition-colors duration-200"
                          >
                            Hapus
                          </button>
                          <span v-else class="text-xs text-gray-400">-</span> </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div>

          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Data</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nama PIC:</span>
                    <span class="font-medium text-gray-900">{{ nameSupplier || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Perusahaan:</span>
                    <span class="font-medium text-gray-900">{{ companySupplier || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Telepon:</span>
                    <span class="font-medium text-gray-900">{{ noTelpSupplier || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium text-gray-900 break-all">{{ emailSupplier || '-' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Alamat:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ addressSupplier || '-' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Jumlah Barang:</span>
                    <span class="font-medium text-gray-900">{{ assignedResources.length }} item</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <VSuccessButton
                  label="Update Supplier"
                  @click="handleUpdate"
                  class="btn-primary w-full justify-center"
                />
              </div>

              <div class="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 class="text-sm font-medium text-amber-900 mb-2">Catatan Perubahan:</h4>
                <ul class="text-xs text-amber-800 space-y-1">
                  <li>• Nama perusahaan tidak dapat diubah</li>
                  <li>• Pastikan data kontak masih aktif</li>
                  <li>• Periksa kembali daftar barang yang disediakan (Asset tidak bisa dihapus dari sini)</li>
                  <li>• Simpan perubahan untuk memperbarui data</li>
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
/* STYLE TETAP SAMA SEPERTI YANG ANDA BERIKAN DI AWAL */
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
  transform: translateY(-1px);
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280, 0 0 0 4px rgba(107, 114, 128, 0.1);
}

/* Disabled state */
.form-input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .grid.grid-cols-12 {
    grid-template-columns: 1fr;
  }

  .col-span-8, .col-span-4 {
    grid-column: span 12 / span 12;
  }

  .border-l {
    border-left: none;
    border-top: 1px solid #e5e7eb;
  }
}

@media (max-width: 640px) {
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .grid.grid-cols-3 {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1 / span 1;
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