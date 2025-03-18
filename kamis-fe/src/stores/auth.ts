import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginRequest, LoginResponse, UserRole } from '@/interfaces/auth.interface';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

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
  
  // Hanya Admin dan Operasional yang dapat mengelola aset (hapus, ubah, tambah)
  const canManageAssets = computed(() => 
    userRole.value === 'Admin' || userRole.value === 'Operasional'
  );
  
  // Hanya Direksi dan Finance yang dapat melihat informasi finansial
  const canViewFinancialInfo = computed(() => 
    userRole.value === 'Direksi' || userRole.value === 'Finance'
  );

  // Initialize the auth header and user from token
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    try {
      const decoded = jwtDecode<JwtPayload>(token.value);
      user.value = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    } catch (err) {
      console.error('Error decoding token:', err);
      // Invalid token, clear it
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async function login(loginRequest: LoginRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post<LoginResponse>(`http://localhost:8080/api/auth/login`, loginRequest);
      console.log('Login response:', response.data);
      
      if (response.data?.data?.token) {
        // Set token
        token.value = response.data.data.token;
        localStorage.setItem('auth_token', response.data.data.token);
        
        // DEBUGGING: Hard-coded role for testing purposes
        // For Admin testing
        userRole.value = 'Admin';
        localStorage.setItem('user_role', 'Admin');
        console.log('Role set to:', userRole.value);
        
        // Save username if available
        if (response.data.data.username) {
          username.value = response.data.data.username;
          localStorage.setItem('username', response.data.data.username);
        } else {
          // Fallback username
          username.value = loginRequest.email;
          localStorage.setItem('username', loginRequest.email);
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        
        console.log('Authentication successful, role:', userRole.value);
        return true;
      } else {
        error.value = 'Login failed. Please try again.';
        return false;
      }
    } catch (err: unknown) {
      if (err instanceof Error && axios.isAxiosError(err) && err.response?.data?.message) {
        error.value = 'Email atau password salah';
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

  // For testing purposes only - set role manually
  function setUserRole(role: UserRole) {
    userRole.value = role;
    localStorage.setItem('user_role', role);
    console.log('Role manually set to:', role);
  }

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
    setUserRole
  };
}); 