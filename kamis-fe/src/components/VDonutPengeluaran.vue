<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { ChartPengeluaranResponseDTO } from '@/interfaces/finance.report/lapkeu.interface';
import { API_URLS } from '@/config/api.config';
import axios from 'axios';
import { useToast } from 'vue-toastification';

// Registrasi plugin Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props
const props = defineProps<{
  range?: string;
}>();

// Add emit events
const emit = defineEmits(['data-loaded', 'error']);

const toast = useToast();

// State
const labels = ref<string[]>([]);
const data = ref<number[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const backgroundColors = ['#912018', '#F04438', '#FDA29B'];

const chartData = ref({
  labels: [] as string[],
  datasets: [{
    data: [] as number[],
    backgroundColor: backgroundColors,
    borderWidth: 1
  }]
});

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '50%',
  layout: {
    padding: {
        top: 20,
        bottom: 40,
        left: 40,
        right: 40
    }
},
  plugins: {
    legend: { display: false },
    tooltip: {
    enabled: true,
    callbacks: {
        label: (context) => {
        const value = context.parsed;
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
        return `Jumlah: ${formatted}`;
        }
    }
    },
    datalabels: {
      color: '#000',
      font: { size: 12 , weight: 'bold' },
      align: 'end',
      anchor: 'end',
      textAlign: 'center',
      clamp: true,
      clip: false,
      formatter: (value, context) => {
        if (!value) return ''; // Jangan tampilkan label untuk value 0
        const label = context.chart.data.labels?.[context.dataIndex] || '';
        const dataset = context.chart.data.datasets[0].data as number[];
        const total = dataset.reduce((sum, val) => sum + val, 0);
        const percentage = total ? (value / total * 100).toFixed(1) : '0';
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
        return `${label}\n${percentage}%`;
      }
    }
  }
};

// Update chart data with current values
const updateChartData = () => {
  chartData.value = {
    labels: labels.value,
    datasets: [{
      data: data.value,
      backgroundColor: backgroundColors.slice(0, labels.value.length),
      borderWidth: 1
    }]
  };
  
  // Emit the data-loaded event to notify parent component
  emit('data-loaded', {
    labels: labels.value,
    data: data.value
  });
};

// Fetch API with improved error handling and timeout
const fetchPengeluaran = async () => {
  loading.value = true;
  error.value = null;
  
  // Set a timeout to ensure loading doesn't last forever if the request hangs
  const timeoutId = setTimeout(() => {
    console.error('Request timeout for pengeluaran data');
    
    // Set default values on timeout
    labels.value = ['Jasa', 'Material', 'Lainnya'];
    data.value = [0, 0, 0];
    
    // Update chart data with default values
    updateChartData();
    
    loading.value = false;
    error.value = 'Data tidak tersedia saat ini. Menampilkan placeholder.';
    emit('error', error.value);
  }, 5000); // 5 second timeout
  
  try {
    console.log('Requesting pengeluaran data from:', `${API_URLS.FINANCE}/lapkeu/chart-pengeluaran`);
    console.log('With params:', { range: props.range || 'THIS_YEAR' });
    
    try {
      const response = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-pengeluaran`, {
        params: { range: props.range || 'THIS_YEAR' },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      // Debug full response to check if we're getting HTML instead of JSON
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON. The API endpoint might be incorrect or returning an error page.');
        error.value = 'Terjadi kesalahan pada server. Mohon hubungi administrator.';
        emit('error', error.value);
        
        // Set default values
        labels.value = ['Jasa', 'Material', 'Lainnya'];
        data.value = [0, 0, 0];
        
        // Update chart data with default values
        updateChartData();
        
        loading.value = false;
        return;
      }
      
      if (response.data && response.data.status === 200 && response.data.data) {
        const json: ChartPengeluaranResponseDTO[] = response.data.data;
        
        if (json.length === 0) {
          // No data, use placeholders
          labels.value = ['Jasa', 'Material', 'Lainnya'];
          data.value = [0, 0, 0];
        } else {
          const labelList = json.map(item => item.activityType);
          const valueList = json.map(item => item.totalPengeluaran);

          // Gabungkan label + value + warna ke satu array
          const combined = labelList.map((label, index) => ({
            label,
            value: valueList[index],
          }));

          // Urutkan dari terbesar ke terkecil
          combined.sort((a, b) => b.value - a.value);

          // Update state
          labels.value = combined.map(item => item.label);
          data.value = combined.map(item => item.value);
        }
        
        // Update chart data
        updateChartData();
      } else {
        const errorMsg = 'Gagal memuat data: ' + (response.data?.message || 'Unknown error');
        error.value = errorMsg;
        emit('error', errorMsg);
        
        // Set default values
        labels.value = ['Jasa', 'Material', 'Lainnya'];
        data.value = [0, 0, 0];
        
        // Update chart data with default values
        updateChartData();
      }
    } catch (err) {
      // Clear timeout since we got an error
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (err) {
    const errorMsg = 'Terjadi kesalahan saat memuat data pengeluaran';
    console.error(errorMsg, err);
    error.value = errorMsg;
    emit('error', errorMsg);
    
    // Set default values
    labels.value = ['Jasa', 'Material', 'Lainnya'];
    data.value = [0, 0, 0];
    
    // Update chart data with default values
    updateChartData();
  } finally {
    loading.value = false;
  }
};

// Watch for changes in range prop
watch(() => props.range, (newRange) => {
  if (newRange) {
    fetchPengeluaran();
  }
}, { immediate: false });

// Initialize on component mount
onMounted(fetchPengeluaran);
</script>

<template>
  <div class="w-full h-full">
    <!-- Loading State -->
    <div v-if="loading" class="w-full h-full flex justify-center items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full h-full flex justify-center items-center text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Chart Container -->
    <div v-else class="w-full h-full relative">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

