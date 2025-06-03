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
                @click="router.push('/account')"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Update Akun</h1>
                <p class="text-blue-100 mt-1">Perbarui informasi akun pengguna yang sudah ada</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <form @submit.prevent="updateAccount">
              <!-- Informasi Personal Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Informasi Personal</h2>
                </div>

                <!-- Grid dengan 2 kolom untuk form yang lebih kompak -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Email -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Email Akun</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="email"
                        v-model="formData.email"
                        type="email"
                        required
                        placeholder="contoh@email.com"
                        class="form-input pl-10"
                        :class="{ 'border-red-300 focus:ring-red-500': validationErrors.email }"
                      />
                    </div>
                    <div v-if="validationErrors.email" class="error-message">
                      {{ validationErrors.email }}
                    </div>
                  </div>

                  <!-- Username -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nama Pengguna</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="username"
                        v-model="formData.username"
                        type="text"
                        required
                        placeholder="Masukkan nama pengguna"
                        class="form-input pl-10"
                        :class="{ 'border-red-300 focus:ring-red-500': validationErrors.username }"
                      />
                    </div>
                    <div v-if="validationErrors.username" class="error-message">
                      {{ validationErrors.username }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Keamanan & Akses Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Keamanan & Akses</h2>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <!-- Password -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Password</span>
                      <span class="text-gray-500 text-xs">(Kosongkan jika tidak ingin mengubah)</span>
                    </label>
                    <div class="relative">
                      <input
                        id="password"
                        v-model="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Minimal 5 karakter"
                        class="form-input pl-10 pr-12"
                        :class="{ 'border-red-300 focus:ring-red-500': validationErrors.password }"
                      />
                      <button 
                        type="button" 
                        @click="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-900 transition-colors"
                      >
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    <div v-if="validationErrors.password" class="error-message">
                      {{ validationErrors.password }}
                    </div>
                  </div>

                  <!-- Role (Locked) -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Role Pengguna</span>
                    </label>
                    <div class="relative">
                      <VLockedInput :value="role" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Right Column - Summary & Actions -->
          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <!-- Preview Summary -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Data</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium text-gray-900 break-all">{{ formData.email || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Username:</span>
                    <span class="font-medium text-gray-900">{{ formData.username || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Password:</span>
                    <span class="font-medium text-gray-900">{{ formData.password ? '•'.repeat(formData.password.length) : 'Tidak diubah' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Role:</span>
                    <span class="font-medium text-gray-900">{{ role || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button 
                  type="submit"
                  @click="updateAccount"
                  class="btn-primary w-full justify-center"
                  :disabled="isLoading"
                >
                  <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{{ isLoading ? 'Memperbarui...' : 'Update Akun' }}</span>
                </button>
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Update:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Email harus valid dan unik</li>
                  <li>• Username minimal 3 karakter</li>
                  <li>• Password kosong = tidak diubah</li>
                  <li>• Role tidak dapat diubah</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/account';
import { useToast } from 'vue-toastification';
import VLockedInput from '@/components/VLockedInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import type { UpdateAccountInterface } from '@/interfaces/profile/account.interface';

const router = useRouter();
const route = useRoute();
const accountStore = useAccountStore();
const toast = useToast();

// Get account email from route parameters
const accountEmail = String(route.params.email);

// Setup form data and validation
const formData = ref<UpdateAccountInterface & { password?: string }>({
  email: '',
  username: '',
  password: ''
});

const role = ref('');
const showPassword = ref(false);
const isLoading = computed(() => accountStore.loading);

const validationErrors = ref({
  email: '',
  username: '',
  password: ''
});

// Fetch existing account data
onMounted(async () => {
  try {
    await accountStore.getAllAccounts();
    const account = accountStore.accounts.find(acc => acc.email === accountEmail);
    
    if (account) {
      formData.value.email = account.email;
      formData.value.username = account.username;
      role.value = account.role;
    } else {
      toast.error('Akun tidak ditemukan');
      router.push('/account');
    }
  } catch (error) {
    console.error('Error fetching account:', error);
    toast.error('Gagal mengambil data akun');
  }
});

// Validate form
const validateForm = (): boolean => {
  // Reset errors
  validationErrors.value = {
    email: '',
    username: '',
    password: ''
  };
  
  let isValid = true;

  // Email validation
  if (!formData.value.email.trim()) {
    validationErrors.value.email = 'Email harus diisi';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    validationErrors.value.email = 'Format email tidak valid';
    isValid = false;
  }

  // Username validation
  if (!formData.value.username.trim()) {
    validationErrors.value.username = 'Username harus diisi';
    isValid = false;
  } else if (formData.value.username.trim().length < 3) {
    validationErrors.value.username = 'Username minimal 3 karakter';
    isValid = false;
  }

  // Password validation - only if provided
  if (formData.value.password && formData.value.password.length > 0 && formData.value.password.length < 5) {
    validationErrors.value.password = 'Password minimal 5 karakter';
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const updateAccount = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    // Create update data object
    const updateData: UpdateAccountInterface = {
      email: formData.value.email,
      username: formData.value.username,
    };

    // Only include password if it's provided
    if (formData.value.password) {
      updateData.password = formData.value.password;
    }

    // Call the store method to update account
    await accountStore.updateAccount(accountEmail, updateData);
    
    // Show success message and navigate back
    router.push('/account');
  } catch (error) {
    console.error('Error updating account:', error);
    // Error already handled by the store with toast
  }
};
</script>

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

.form-dropdown {
    width: 100%;
}

.error-message {
    color: rgb(239 68 68);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
}

.error-message::before {
    content: "⚠";
    color: rgb(248 113 113);
}

/* Button Styling */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #1E3A5F;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
    background-color: #1a2c42;
    transform: scale(1.02);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

/* Loading animation */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
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
.form-input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Responsive improvements */
@media (max-width: 1024px) {
    .grid.grid-cols-12 {
        grid-template-columns: 1fr;
    }
    
    .col-span-8, .col-span-4 {
        grid-column: span 12;
    }
    
    .border-l {
        border-left: none;
        border-top: 1px solid #e5e7eb;
    }
}

@media (max-width: 640px) {
    .grid.grid-cols-2 {
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

.space-x-2 > * + * {
    margin-left: 0.5rem;
}

.space-x-4 > * + * {
    margin-left: 1rem;
}
</style>