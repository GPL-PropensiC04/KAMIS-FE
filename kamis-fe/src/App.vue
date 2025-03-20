<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftBar from './components/LeftBar.vue'
import { onMounted, onUnmounted } from 'vue';

// The visibility change approach
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // Tab is hidden, might be closing
    sessionStorage.setItem('tab_hidden_timestamp', Date.now().toString());
  } else if (document.visibilityState === 'visible') {
    // User came back to the tab, wasn't a close
    sessionStorage.removeItem('tab_hidden_timestamp');
  }
};

// Handle actual browser/tab close
const handleBeforeUnload = () => {
  // Store a flag indicating the app was closed (not refreshed)
  sessionStorage.setItem('app_was_closed', 'true');
  
  // When the tab/window is actually closing, we'll clear the token
  if (document.visibilityState === 'hidden') {
    localStorage.removeItem('auth_token');
  }
};

onMounted(() => {
  // Set up event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Check if the tab was hidden and then reopened
  const hiddenTimestamp = sessionStorage.getItem('tab_hidden_timestamp');
  if (hiddenTimestamp) {
    // Tab was hidden and now is visible again - this means it wasn't closed
    sessionStorage.removeItem('app_was_closed');
    sessionStorage.removeItem('tab_hidden_timestamp');
  }
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="app-layout">
    <template v-if="$route.name !== 'login'">
      <LeftBar />
    </template>
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