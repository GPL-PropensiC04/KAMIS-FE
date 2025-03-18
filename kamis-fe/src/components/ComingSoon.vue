<template>
  <div class="coming-soon-container">
    <div class="coming-soon-content">
      <h1>Coming Soon</h1>
      <p>Fitur ini sedang dalam pengembangan</p>
      <button class="btn-back" @click="$router.back()">Kembali</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Tidak ada logic yang diperlukan
</script>

<style scoped>
.coming-soon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f5f5f5;
}

.coming-soon-content {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #1a3c61;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.btn-back {
  background-color: #1a3c61;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background-color: #2c5a8f;
}
</style> 