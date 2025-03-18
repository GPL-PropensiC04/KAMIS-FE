<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { onMounted } from 'vue';

onMounted(() => {
  console.log('App.vue mounted');
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template> 