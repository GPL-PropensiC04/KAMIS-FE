<template>
  <div :class="['leftbar', { collapsed: isCollapsed }]">
    <!-- Logo KAM -->
    <div class="logo-container">
      <img :src="logoImage" alt="Logo KAM" :class="['logo', { collapsed: isCollapsed }]" />
    </div>
    <!-- Top Icons -->
    <div class="top-icons">
      <div :class="['icon-item', { active: isActive('dashboard') }]" @click="goTo('dashboard')">
        <BaseIcon icon="fa-solid fa-chart-simple" clickable />
        <span v-if="!isCollapsed" class="icon-label">Dashboard</span>
      </div>
      <div :class="['icon-item', { active: isActive('laporan') }]" @click="goTo('laporan')">
        <BaseIcon icon="fa-solid fa-file" clickable />
        <span v-if="!isCollapsed" class="icon-label">Laporan</span>
      </div>
      <div :class="['icon-item', { active: isActive('purchase') }]" @click="goTo('purchase')">
        <BaseIcon icon="fa-solid fa-bag-shopping" clickable />
        <span v-if="!isCollapsed" class="icon-label">Pembelian</span>
      </div>
      <div :class="['icon-item', { active: isActive('list-assets') }]" @click="goTo('list-assets')">
        <BaseIcon icon="fa-solid fa-truck" clickable />
        <span v-if="!isCollapsed" class="icon-label">Asset</span>
      </div>
      <div :class="['icon-item', { active: isActive('resource') }]" @click="goTo('resource')">
        <BaseIcon icon="fa-solid fa-screwdriver-wrench" clickable />
        <span v-if="!isCollapsed" class="icon-label">Resource</span>
      </div>
      <div :class="['icon-item', { active: isActive('project') }]" @click="goTo('project')">
        <BaseIcon icon="fa-solid fa-helmet-safety" clickable />
        <span v-if="!isCollapsed" class="icon-label">Proyek</span>
      </div>
      <div :class="['icon-item', { active: isActive('klien') }]" @click="goTo('klien')">
        <BaseIcon icon="fa-solid fa-user" clickable />
        <span v-if="!isCollapsed" class="icon-label">Klien</span>
      </div>
    </div>

    <!-- Bottom Icon -->
    <div class="bottom-icon">
      <div class="icon-item" @click="logout">
        <BaseIcon icon="fa-solid fa-right-from-bracket" clickable />
        <span v-if="!isCollapsed" class="icon-label">Logout</span>
      </div>
      <div class="icon-item" @click="toggleSidebar">
        <BaseIcon icon="fa-solid fa-bars" clickable />
        <span v-if="!isCollapsed" class="icon-label">Menu</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import logoImage from '@/assets/LogoKAM.jpg'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const goTo = (routeName: string) => {
  router.push({ name: routeName })
}

const logout = () => {
  console.log('Logging out...')
  const authStore = useAuthStore()
  authStore.logout()
}

const isActive = (routeName: string) => {
  return route.name === routeName
}
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

.top-icons, .bottom-icon {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 10px;
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
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 24px;     /* Menyesuaikan dengan tinggi ikon */
  display: flex;         /* Memastikan alignment vertikal */
  align-items: center;   /* Ratakan secara vertikal */
}

/* Logo Styling */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
}

.logo {
  max-width: 100px;
  height: auto;
  transition: all 0.3s ease;
  margin-bottom: 10px; /* Tambahkan ini untuk jarak ke icon */
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
</style>