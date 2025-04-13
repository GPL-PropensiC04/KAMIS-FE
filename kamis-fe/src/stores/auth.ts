import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginRequest, LoginResponse } from '@/interfaces/auth.interface';
import { API_URLS } from '@/config/api.config';
interface JwtPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<{ id: number; email: string; role: string } | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

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
      const response = await axios.post<LoginResponse>(`${API_URLS.AUTH}/login`, loginRequest);
      console.log(response.data);
      if (response.data?.data?.token) {
        token.value = response.data.data.token;
        localStorage.setItem('auth_token', response.data.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        
        // Decode the token to get user info including role
        try {
          const decoded = jwtDecode<JwtPayload>(token.value);
          user.value = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
          };
        } catch (err) {
          console.error('Error decoding token:', err);
        }
        
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

  function logout(removeToken: boolean = true) {
    token.value = null;
    user.value = null;
    
    // Only remove token from localStorage if specified (default true)
    if (removeToken) {
      localStorage.removeItem('auth_token');
    }
    
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  }
  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    logout,

  };
});