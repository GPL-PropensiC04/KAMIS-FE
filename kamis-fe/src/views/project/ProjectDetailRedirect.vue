<template>
  <div class="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
    <div class="bg-[#E5EAF2] rounded-lg shadow-md p-8 text-center">
      <p>Sedang mengalihkan...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;

// Determine project type and redirect
const redirectToCorrectView = async () => {
  try {
    const response = await axios.get(`${API_URLS.PROJECT}/project/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data?.status === 200) {
      const projectType = response.data.data.data.projectType;
      
      if (projectType === true) {
        router.replace(`/project/distribution/${projectId}`);
      } else {
        router.replace(`/project/sale/${projectId}`);
      }
    } else {
      router.replace('/not-found');
    }
  } catch (err) {
    console.error('Error determining project type:', err);
    router.replace('/not-found');
  }
};

onMounted(() => {
  redirectToCorrectView();
});
</script>