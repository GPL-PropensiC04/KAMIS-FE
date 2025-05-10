<template>
  <div class="flex min-h-screen">
    <!-- Left side with background image -->
    <div class="hidden md:flex w-1/2 relative bg-[url('@/assets/BackgroundLogin.png')] bg-cover bg-center">
      <div class="absolute inset-0 "></div>
      <!-- Optional: text overlay if needed -->
      <div class="z-10 m-auto text-center px-10 text-white">
        <!-- Bisa tambahkan teks atau slogan di sini -->
      </div>
    </div>

    <!-- Right side: Login form -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
      <div class="w-full max-w-md">
        <!-- ✅ Branding -->
        <div class="flex justify-center mb-8">
          <img src="@/assets/LogoKAM.jpg" alt="KAMIS Logo" class="w-28 h-28" />
          <div class="text-left pl-4 pt-6 mb-6">
            <h1 class="text-3xl font-bold text-black">KAMIS</h1>
            <p class="text-lg text-black">Karina Aka Madina Integrated System</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {{ authStore.error }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="Enter your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                placeholder="Enter your password"
                class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              >
                <font-awesome-icon v-if="showPassword" icon="fa-solid fa-eye-slash" />
                <font-awesome-icon v-else icon="fa-solid fa-eye" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <VButton
            type="submit"
            :label="authStore.loading ? 'Logging in...' : 'Login'"
            :disabled="authStore.loading"
            class="w-full"
          />
        </form>
      </div>
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
const showPassword = ref(false);

const handleLogin = async () => {
  const success = await authStore.login({ email: email.value, password: password.value });
  if (success) {
    router.push('/');
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>