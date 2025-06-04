<script setup lang="ts">
import { ref, watch } from "vue";
import { useClientStore } from "@/stores/client";
import VDropDownInput from "@/components/VDropDownInput.vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from '@/components/Breadcrumb.vue'
import VSuccessButton from "@/components/VSuccessButton.vue";

const router = useRouter();
const clientStore = useClientStore();
const toast = useToast();

// Form State
const nameClient = ref("");
const companyClient = ref("");
const noTelpClient = ref("");
const emailClient = ref("");
const typeClientLabel = ref("Perusahaan");
const addressClient = ref("");

// Opsi Tipe Client
const clientTypeOptions = ["Perusahaan", "Perorangan"];
const getTypeClient = () => typeClientLabel.value === "Perusahaan";

// Reset perusahaan jika tipe perorangan
watch(typeClientLabel, (newVal) => {
  if (newVal === "Perorangan") {
    companyClient.value = "";
  }
});

// Validasi Email Format
const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Submit Handler
const handleSubmit = async () => {
  if (!nameClient.value || !noTelpClient.value || !emailClient.value || !addressClient.value) {
    toast.error("Harap isi semua field dengan benar!");
    return;
  }

  if (!/^\d+$/.test(noTelpClient.value)) {
    toast.error("Nomor telepon hanya boleh berisi angka!");
    return;
  }

  if (!isValidEmail(emailClient.value)) {
    toast.error("Format email tidak valid!");
    return;
  }

  if (getTypeClient() && !companyClient.value) {
    toast.error("Perusahaan asal harus diisi!");
    return;
  }

  const body = {
    nameClient: nameClient.value,
    noTelpClient: noTelpClient.value,
    emailClient: emailClient.value,
    typeClient: getTypeClient(),
    companyClient: companyClient.value,
    addressClient: addressClient.value,
  };

  await clientStore.addClient(body);
};
</script>

<template>
    <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-100">
    </div>

    <!-- Main Content -->
    <div class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="router.push('/client')"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Tambah Klien Baru</h1>
                <p class="text-blue-100 mt-1">Lengkapi informasi klien dengan detail yang akurat</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card with Horizontal Layout -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
            <!-- Informasi Dasar Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Dasar</h2>
              </div>

              <!-- Grid dengan 3 kolom untuk form yang lebih kompak -->
              <div class="grid grid-cols-3 gap-4 mb-4">
                <!-- Nama Klien -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Nama Klien</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input 
                      v-model="nameClient" 
                      class="form-input pl-10"
                      placeholder="Nama lengkap klien"
                    />
                  </div>
                </div>

                <!-- Tipe Klien -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Tipe Klien</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <VDropDownInput 
                    v-model="typeClientLabel" 
                    :options="clientTypeOptions" 
                    class="form-dropdown"
                  />
                </div>

                <!-- Perusahaan -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Nama Perusahaan</span>
                    <span class="text-red-500 ml-1" v-if="typeClientLabel === 'Perusahaan'">*</span>
                  </label>
                  <div class="relative">
                    <input 
                      v-model="companyClient" 
                      :disabled="typeClientLabel === 'Perorangan'"
                      :class="typeClientLabel === 'Perorangan' ? 'form-input pl-10 disabled' : 'form-input pl-10'"
                      placeholder="Nama perusahaan"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Informasi Kontak Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Kontak</h2>
              </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Nomor Telepon -->
                    <div class="form-group">
                    <label class="form-label">
                        <span class="label-text">Nomor Telepon</span>
                        <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                    <input 
                        v-model="noTelpClient" 
                        inputmode="numeric"
                        pattern="[0-9]*"
                        @input="noTelpClient = noTelpClient.replace(/\D/g, '')"
                        class="form-input pl-10"
                        placeholder="08xxxxxxxxxx"
                    />
                </div>
            </div>

                <!-- Email -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Alamat Email</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input 
                      v-model="emailClient" 
                      type="email"
                      class="form-input pl-10"
                      placeholder="nama@perusahaan.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Alamat Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Alamat</h2>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Alamat Lengkap</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <textarea 
                  v-model="addressClient"
                  rows="3"
                  class="form-textarea"
                  placeholder="Masukkan alamat lengkap termasuk kode pos..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column - Summary & Actions -->
          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <!-- Preview Summary -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Data</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nama:</span>
                    <span class="font-medium text-gray-900">{{ nameClient || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tipe:</span>
                    <span class="font-medium text-gray-900">{{ typeClientLabel }}</span>
                  </div>
                  <div class="flex justify-between" v-if="typeClientLabel === 'Perusahaan'">
                    <span class="text-gray-600">Perusahaan:</span>
                    <span class="font-medium text-gray-900">{{ companyClient || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Telepon:</span>
                    <span class="font-medium text-gray-900">{{ noTelpClient || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium text-gray-900 break-all">{{ emailClient || '-' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Alamat:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ addressClient || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <VSuccessButton 
                  label="Simpan Klien" 
                  @click="handleSubmit" 
                  class="btn-primary w-full justify-center"
                />
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Pengisian:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Pastikan email aktif untuk komunikasi</li>
                  <li>• Nomor telepon digunakan untuk konfirmasi</li>
                  <li>• Alamat lengkap memudahkan pengiriman</li>
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