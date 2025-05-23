<template>
    <Breadcrumb />
    <div class="min-h-screen bg-[#E5EAF2] p-6">
      <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <!-- Back Button -->
        <button 
          @click="router.back()" 
          class="hover:underline flex items-center mb-4 text-[28px] text-[#1E3A5F]"
        >
          <span>←</span>
        </button>
  
        <!-- Form -->
        <form @submit.prevent="updateAccount" class="space-y-6">
          <!-- Email & Username -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Email Akun -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email Akun
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full p-2 border border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#f8fafc]"
              />
              <div v-if="validationErrors.email" class="text-red-500 text-xs mt-1">
                {{ validationErrors.email }}
              </div>
            </div>
  
            <!-- Username Akun -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Username Akun
              </label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                class="w-full p-2 border border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#f8fafc]"
              />
              <div v-if="validationErrors.username" class="text-red-500 text-xs mt-1">
                {{ validationErrors.username }}
              </div>
            </div>
          </div>
  
          <!-- Password & Role -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Password Akun -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password Akun (Kosongkan jika tidak ingin mengubah)
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full p-2 border border-gray-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#f8fafc]"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500">
                    <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div v-if="validationErrors.password" class="text-red-500 text-xs mt-1">
                {{ validationErrors.password }}
              </div>
            </div>
  
            <!-- Role Akun (Locked) -->
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                Role Akun
              </label>
              <VLockedInput :value="role" />
            </div>
          </div>
  
          <!-- Update Button -->
          <div class="flex justify-end pt-6">
            <button 
              type="submit"
              class="px-10 py-2 bg-[#1E3A5F] text-white rounded 
                    hover:bg-[#1a325a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Memperbarui...' : 'Update Akun' }}
            </button>
          </div>
        </form>
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
  /* Add any additional styling here */
  </style>