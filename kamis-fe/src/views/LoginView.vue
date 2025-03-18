<template>
  <div class="flex justify-center items-center min-h-screen bg-[#f5f5f5]">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <div class="flex justify-center mb-6">
        <img src="@/assets/LogoKAM.jpg" alt="KAMIS Logo" class="w-24 h-24" />
      </div>
      
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-[#1E3A5F]">KAMIS</h1>
        <p class="text-gray-600">Karina Asa Madina Integrated System</p>
      </div>
      
      <div v-if="authStore.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter your password"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full py-3 bg-[#1E3A5F] text-white rounded-md hover:bg-[#1a325a] transition-colors"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login({ email: email.value, password: password.value });
  if (success) {
    router.push('/');
  }
};
</script> 