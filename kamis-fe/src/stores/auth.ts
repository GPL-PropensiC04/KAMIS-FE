import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginRequest, LoginResponse } from '@/interfaces/auth.interface';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<LoginResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value);

  // Initialize the auth header for axios
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  async function login(loginRequest: LoginRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post<LoginResponse>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, loginRequest);
      
      if (response.data && response.data.token) {
        token.value = response.data.token;
        localStorage.setItem('auth_token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        
        // Fetch user data if needed
        // await fetchUserProfile();
        
        return true;
      } else {
        error.value = 'Login failed. Please try again.';
        return false;
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
      } else {
        error.value = 'An error occurred during login. Please try again.';
      }
      console.error('Login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  }

  // Optional: Fetch user profile/details
  // async function fetchUserProfile() {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile/current`);
  //     user.value = response.data.data;
  //   } catch (err) {
  //     console.error('Error fetching user profile:', err);
  //   }
  // }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    // fetchUserProfile
  };
}); 