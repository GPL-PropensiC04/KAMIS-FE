import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginRequest, LoginResponse, UserRole } from '@/interfaces/auth.interface';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<LoginResponse | null>(null);
  const userRole = ref<UserRole | null>(localStorage.getItem('user_role') as UserRole | null);
  const username = ref<string | null>(localStorage.getItem('username'));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value);
  const role = computed(() => userRole.value);
  
  // Role-based permission checks
  const hasAdminAccess = computed(() => userRole.value === 'Admin');
  const hasOperasionalAccess = computed(() => userRole.value === 'Operasional');
  const hasFinanceAccess = computed(() => userRole.value === 'Finance');
  const hasDireksiAccess = computed(() => userRole.value === 'Direksi');
  
  const canManageAssets = computed(() => 
    userRole.value === 'Admin' || userRole.value === 'Operasional'
  );
  
  const canViewFinancialInfo = computed(() => 
    userRole.value === 'Direksi' || userRole.value === 'Finance'
  );

  // Initialize the auth header for axios
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  async function login(loginRequest: LoginRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post<LoginResponse>(`http://localhost:8080/api/auth/login`, loginRequest);
      console.log(response.data);
      if (response.data?.data?.token) {
        token.value = response.data.data.token;
        localStorage.setItem('auth_token', response.data.data.token);
        
        // Save role and username
        if (response.data.data.role) {
          userRole.value = response.data.data.role;
          localStorage.setItem('user_role', response.data.data.role);
        }
        
        if (response.data.data.username) {
          username.value = response.data.data.username;
          localStorage.setItem('username', response.data.data.username);
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        
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
    userRole.value = null;
    username.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
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
    userRole,
    username,
    loading,
    error,
    isAuthenticated,
    role,
    hasAdminAccess,
    hasOperasionalAccess,
    hasFinanceAccess,
    hasDireksiAccess,
    canManageAssets,
    canViewFinancialInfo,
    login,
    logout,
    // fetchUserProfile
  };
}); 