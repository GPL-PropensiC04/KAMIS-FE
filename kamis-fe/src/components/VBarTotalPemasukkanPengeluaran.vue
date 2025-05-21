<!-- filepath: e:\Propen\KAMIS-FE\kamis-fe\src\components\VBarTotalPemasukkanPengeluaran.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { API_URLS } from '@/config/api.config';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Props
const props = defineProps<{
  range?: string;
}>();

// State
const pemasukkan = ref(0);
const pengeluaran = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

const chartData = ref({
  labels: ['Pemasukkan', 'Pengeluaran'],
  datasets: [{
    data: [0, 0],
    backgroundColor: ['#2E7D32', '#D32F2F'], // Green for income, Red for expenses
    borderWidth: 0
  }]
});

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: false // Hide the legend since it's clear from context
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number;
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(value);
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: '#EEEEEE'
      },
      ticks: {
        callback: (value) => {
          if (typeof value === 'number') {
            if (value >= 1000000) {
              return (value / 1000000).toLocaleString() + ' Jt';
            } else if (value >= 1000) {
              return (value / 1000).toLocaleString() + ' Rb';
            }
            return value;
          }
          return '';
        }
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

// Fetch data from API - Updated to match VDonutPengeluaran approach
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-total-pemasukan-pengeluaran`, {
      params: { range: props.range || 'THIS_YEAR' }
    });

    if (response.data && response.data.status === 200) {
      const data = response.data.data;
      pemasukkan.value = data.totalPemasukkan || 0;
      pengeluaran.value = data.totalPengeluaran || 0;

      // Update chart data
      chartData.value = {
        labels: ['Pemasukkan', 'Pengeluaran'],
        datasets: [{
          data: [pemasukkan.value, pengeluaran.value],
          backgroundColor: ['#2E7D32', '#D32F2F'], // Green for income, Red for expenses
          borderWidth: 0
        }]
      };
    } else {
      error.value = 'Gagal memuat data: ' + (response.data?.message || 'Unknown error');
    }
  } catch (err) {
    console.error('Gagal fetch data pemasukkan dan pengeluaran:', err);
    error.value = 'Terjadi kesalahan saat memuat data';
  } finally {
    loading.value = false;
  }
};

// Initialize on component mount
onMounted(fetchData);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto flex flex-col items-center">
    <div class="flex items-center mb-4 w-full">
      <!-- Chart Title with Icon - Updated to match VDonutPengeluaran -->
      <font-awesome-icon
        :icon="['fas', 'chart-column']"
        class="text-[24px] mr-2"
        style="color: #1E3A5F;"
      />
      <h2 class="text-lg font-bold font-lato text-left leading-tight">
        Pemasukkan dan Pengeluaran
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="w-full h-[320px] flex justify-center items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full h-[320px] flex justify-center items-center text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Chart Container -->
    <div v-else class="w-full h-[320px] max-w-[380px] relative">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>