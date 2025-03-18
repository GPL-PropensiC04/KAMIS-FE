<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftBar from './components/LeftBar.vue'
</script>

<template>
  <div class="app-layout">
    <LeftBar />
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: row;
}
</style>
