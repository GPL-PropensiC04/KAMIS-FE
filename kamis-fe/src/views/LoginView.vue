<template>
  <div class="flex justify-center items-center min-h-screen bg-[url('@/assets/BackgroundLogin.jpg')] bg-cover bg-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-md p-24">
      <div class="flex justify-center mb-12">
        <img src="@/assets/LogoKAM.jpg" alt="KAMIS Logo" class="w-28 h-28" />
        <div class="text-left pl-4 pt-6 mb-6">
          <h1 class="text-3xl font-bold text-black">KAMIS</h1>
          <p class="text-lg text-black">Karina Asa Madina Integrated System</p>
        </div>  
      </div>
      
      <div v-if="authStore.error" class="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-8">
        <div>
          <label for="email" class="block text-base font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
            class="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        
        <div>
          <label for="password" class="block text-base font-medium text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter your password"
            class="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
        
        <VButton
          type="submit"
          :label="authStore.loading ? 'Logging in...' : 'Login'"
          :disabled="authStore.loading"
          class="w-full"
        />
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';

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