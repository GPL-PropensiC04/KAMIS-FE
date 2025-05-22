<template>
  <div :class="['leftbar', { collapsed: isCollapsed }]" @click="handleSidebarClick">
    <!-- Logo KAM -->
    <div class="logo-container">
      <img :src="logoImage" alt="Logo KAM" :class="['logo', { collapsed: isCollapsed }]" />
      <div v-if="!isCollapsed" class="logo-text">
        <div class="title">KAMIS</div>
        <div class="subtitle">Karina Aka Madina Integrated System</div>
      </div>
    </div>
    <!-- Top Icons -->
    <div class="top-icons">
      <div v-if = "!isAdmin" :class="['icon-item', { active: isActive('dashboard') }]" @click="goTo('dashboard')">
        <BaseIcon icon="fa-solid fa-chart-simple" clickable />
        <span v-if="!isCollapsed" class="icon-label">Dashboard</span>
      </div>
      <div v-if = "isFinance || isDireksi" :class="['icon-item', { active: isActive('finance') }]" @click="goTo('finance-report')">
        <BaseIcon icon="fa-solid fa-file" clickable />
        <span v-if="!isCollapsed" class="icon-label">Laporan</span>
      </div>
      <div :class="['icon-item', { active: isActive('purchase') }]" @click="goTo('purchase')">
        <BaseIcon icon="fa-solid fa-bag-shopping" clickable />
        <span v-if="!isCollapsed" class="icon-label">Pembelian</span>
      </div>
      <div :class="['icon-item', { active: isActive('assets') }]" @click="goTo('assets')">
        <BaseIcon icon="fa-solid fa-truck" clickable />
        <span v-if="!isCollapsed" class="icon-label">Asset</span>
      </div>
      <div :class="['icon-item', { active: isActive('resource') }]" @click="goTo('resource')">
        <BaseIcon icon="fa-solid fa-screwdriver-wrench" clickable />
        <span v-if="!isCollapsed" class="icon-label">Resource</span>
      </div>
      <div :class="['icon-item', { active: isActive('project') }]" @click="goTo('project')">
        <BaseIcon icon="fa-solid fa-helmet-safety" clickable />
        <span v-if="!isCollapsed" class="icon-label">Distribusi & Penjualan</span>
      </div>
      <div :class="['icon-item', { active: isActive('client') }]" @click="goTo('client')">
        <BaseIcon icon="fa-solid fa-users" clickable />
        <span v-if="!isCollapsed" class="icon-label">Klien</span>
      </div>
      <div :class="['icon-item', { active: isActive('supplier') }]" @click="goTo('supplier')">
        <BaseIcon icon="fa-solid fa-boxes-stacked" clickable />
        <span v-if="!isCollapsed" class="icon-label">Supplier</span>
      </div>
      <div v-if = "isAdmin" :class="['icon-item', { active: isActive('account') }]" @click="goTo('account')">
        <BaseIcon icon="fa-solid fa-gear" clickable />
        <span v-if="!isCollapsed" class="icon-label">Manajemen Akun</span>
      </div>
    </div>

    <div class="bottom-icon">
      <!-- User Info Section -->
      <div v-if="userInfo" class="user-info mb-2">
        <div class="user-avatar">
          <BaseIcon icon="fa-solid fa-circle-user" />
        </div>
        <div class="user-meta" v-if="!isCollapsed">
          <div class="user-name">{{ userInfo.username }}</div>
          <div class="user-role">{{ userInfo.role }}</div>
        </div>
      </div>
      <div class="icon-item" @click="logout">
        <BaseIcon icon="fa-solid fa-right-from-bracket" clickable />
        <span v-if="!isCollapsed" class="icon-label">Logout</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import logoImage from '@/assets/LogoKAM.jpg'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleSidebarClick = (event: MouseEvent) => {
  // Cek jika klik berasal dari elemen dengan class 'icon-item' atau turunannya
  let target = event.target as HTMLElement | null
  while (target && target !== event.currentTarget) {
    if (target.classList && target.classList.contains('icon-item')) {
      return // Jangan expand/collapse jika klik di icon-item
    }
    target = target.parentElement
  }
  toggleSidebar()
}

const goTo = (routeName: string) => {
  if (routeName === 'dashboard') {
    if (authStore.userRole === 'Finance') {
      router.push({ name: 'dashboard-finance' });
    } else if (authStore.userRole === 'Direksi') {
      router.push({ name: 'dashboard-direksi' });
    } else {
      router.push({ name: 'operasional' }); // atau 'home' jika ingin ke /
    }
  } else {
    router.push({ name: routeName });
  }
}

const logout = () => {
  console.log('Logging out...')
  const authStore = useAuthStore()
  authStore.logout()
}

const isActive = (routeName: string) => {
  // Map menu ke nama route yang valid
  const menuRouteNames: Record<string, string[]> = {
    dashboard: ['dashboard-finance', 'dashboard-direksi', 'dashboard-operasional'],
    'finance': ['finance-report'],
    'purchase': ['purchase'],
    'assets': ['assets'],
    'resource': ['resource'],
    'project': ['project'],
    'client': ['client'],
    'supplier': ['supplier'],
    'account': ['account'],
  };
  return route.name && menuRouteNames[routeName]?.includes(route.name.toString());
};

const isAdmin = computed(() => {
  return authStore.userRole === 'Admin';
});

const isFinance = computed(() => {
  return authStore.userRole === 'Finance';
});

const isDireksi = computed(() => {
  return authStore.userRole === 'Direksi';
});

const userInfo = computed(() => {
  if (!authStore.user) return null
  return {
    username: authStore.user.username || authStore.user.email || '-',
    role: authStore.userRole || '-'
  }
})
</script>

<style scoped>
.leftbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #1E3A5F;
  padding: 10px 0;
  width: 180px;
  min-height: 100vh;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: relative;
}

/* Collapsed Style */
.leftbar.collapsed {
  width: 60px;
  align-items: center;
}

.top-icons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bottom-icon {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: auto;
  padding-bottom: 10px;
}

.leftbar.collapsed .top-icons,
.leftbar.collapsed .bottom-icon {
  padding-left: 0;
  align-items: center;
}

/* Default style */
.icon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 6px;
  transition: background 0.2s ease, color 0.2s ease, font-weight 0.2s ease;
  width: calc(100% - 20px);
  margin: 0 10px;
  box-sizing: border-box;
  color: white; /* Warna default teks */
}

/* Target ikon Font Awesome di dalam .icon-item */
.icon-item :deep(svg) {
  color: white; /* Warna default ikon */
  transition: color 0.2s ease;
}

/* Hover Effect */
.icon-item:hover {
  background-color: #ffffff; /* Background putih saat hover */
  color: #1E3A5F; /* Warna teks jadi biru */
}

.icon-item:hover .icon-label {
  color: #1E3A5F; /* Warna teks jadi biru saat hover */
  font-weight: bold; /* Teks jadi tebal saat hover */
}

/* Target ikon Font Awesome saat hover */
.icon-item:hover :deep(svg) {
  color: #1E3A5F; /* Warna ikon berubah jadi biru */
}

/* Active State */
.icon-item.active {
  background-color: #ffffff; /* Background putih saat aktif */
  color: #1E3A5F !important; /* Warna teks jadi biru */
  font-weight: bold; /* Tulisan jadi bold */
}

.icon-item.active :deep(svg) {
  color: #1E3A5F !important; /* Warna ikon berubah jadi biru */
}

.icon-item.active :deep(i),
.icon-item.active .icon-label {
  color: #1E3A5F;
}

.leftbar.collapsed .icon-item {
  justify-content: center;
  padding: 10px;        /* Samakan padding dengan non-collapsed */
  width: 40px;          /* Sesuaikan dengan lebar collapsed sidebar */
  margin: 0;            /* Hapus margin untuk collapsed */
}

.icon-label {
  font-size: 14px;
  color: #ffffff;
  white-space: normal; /* Changed from nowrap to normal */
  flex-shrink: 0;
  line-height: 1.2; /* Changed from 24px to 1.2 for better wrapping */
  display: flex;
  align-items: center;
  max-width: 100px; /* Add max-width to control wrapping width */
  word-wrap: break-word; /* Ensure long words wrap */
}


/* Logo Styling */
.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 18px;
  margin-bottom: 20px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Pastikan teks rata tengah secara vertikal */
  color: white;
}

.logo-text .title {
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
}

.logo-text .subtitle {
  font-size: 8px;
  opacity: 0.8;
  max-width: 100px;
  line-height: 1.2;
}

.logo {
  max-width: 40px;
  height: auto;
  transition: all 0.3s ease;
}

/* Saat sidebar collapse, kecilkan logo */
.logo.collapsed {
  max-width: 40px;
  margin-bottom: 10px; /* Sama juga di mode collapsed */
}

/* Toggle Button Styling */
.toggle-button {
  position: absolute;
  top: 10px;
  right: -15px;
  background: #ecf0f1;
  border: 1px solid #dcdde1;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 10;
  
}

.toggle-button:hover {
  background-color: #dfe6e9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  padding: 10px 8px;
  margin: 0 10px;
  box-sizing: border-box;
  min-height: 48px;
  transition: background 0.2s;
}

.leftbar.collapsed .user-info {
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  margin: 0;
  min-height: 40px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #fff;
}

.user-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-size: 13px;
  color: #fff;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #cbd5e1;
  font-style: italic;
  line-height: 1.1;
}
</style>