<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>400</h1>
      <h2>Permintaan Tidak Valid</h2>
      <p>Permintaan yang Anda kirimkan tidak valid atau terjadi kesalahan pada data.</p>
      <button @click="goToHomePage" class="home-button">Go to Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHomePage = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #d32f2f;
}

h2 {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: #666;
}

.home-button {
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.home-button:hover {
  background-color: #3a7bc8;
}
</style> 