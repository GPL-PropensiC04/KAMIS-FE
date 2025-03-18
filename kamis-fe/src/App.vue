// filepath: d:\6th term\PROPENSI\Code\c4-gak-pake-lama-fe\kamis-fe\src\App.vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftBar from './components/LeftBar.vue'
</script>

<template>
  <div class="app-layout">
    <LeftBar />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: row;
  height: 100vh; /* Ensure it takes full height */
}

.content {
  flex: 1; /* Take the remaining space */
  overflow: auto; /* Allow scrolling if content overflows */
}
</style>