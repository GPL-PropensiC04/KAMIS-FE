<!-- filepath: e:\Propen\KAMIS-FE\kamis-fe\src\components\VBarTotalPemasukanPengeluaran.vue -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
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
import { useToast } from 'vue-toastification';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Props
const props = defineProps<{
  range?: string;
}>();

// Emit events for parent component
const emit = defineEmits(['data-loaded', 'error']);

const toast = useToast();

// State
const pemasukanBreakdown = ref<Record<string, number>>({});
const pengeluaranBreakdown = ref<Record<string, number>>({});
const loading = ref(true);
const error = ref<string | null>(null);

// Computed property to generate chart data from breakdown
const chartData = computed(() => {
  const datasets = [];
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColors: string[] = [];
  
  // Process pemasukan breakdown
  Object.entries(pemasukanBreakdown.value).forEach(([key, value]) => {
    if (value > 0) { // Only show categories with values > 0
      labels.push(`Pemasukan ${key}`);
      data.push(value);
      backgroundColors.push('#059669'); // Green for pemasukan
    }
  });
  
  // Process pengeluaran breakdown
  Object.entries(pengeluaranBreakdown.value).forEach(([key, value]) => {
    if (value > 0) { // Only show categories with values > 0
      labels.push(`Pengeluaran ${key}`);
      data.push(value);
      backgroundColors.push('#DC2626'); // Red for pengeluaran
    }
  });
  
  return {
    labels,
    datasets: [{
      label: 'Jumlah',
      data,
      backgroundColor: backgroundColors,
      borderWidth: 0,
    }]
  };
});

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: false // Hide legend since we use colors to distinguish
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number;
          const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(value);
          return `${context.label}: ${formatted}`;
        }
      }
    },
    datalabels: {
      display: false
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
              return `Rp${(value / 1000000).toLocaleString()}jt`;
            } else if (value >= 1000) {
              return `Rp${(value / 1000).toLocaleString()}rb`;
            }
            return `Rp${value}`;
          }
          return '';
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: {
          size: 10
        }
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
};

// Update chart data and emit event
const updateChartData = () => {
  console.log('Updating chart with breakdown data:', {
    pemasukanBreakdown: pemasukanBreakdown.value,
    pengeluaranBreakdown: pengeluaranBreakdown.value
  });
  
  // Calculate totals for emission
  const totalPemasukan = Object.values(pemasukanBreakdown.value).reduce((sum, val) => sum + val, 0);
  const totalPengeluaran = Object.values(pengeluaranBreakdown.value).reduce((sum, val) => sum + val, 0);
  
  // Emit the data-loaded event with breakdown data
  setTimeout(() => {
    console.log('Emitting data-loaded event with breakdown:', {
      pemasukanBreakdown: pemasukanBreakdown.value,
      pengeluaranBreakdown: pengeluaranBreakdown.value,
      totalPemasukan,
      totalPengeluaran
    });
    
    emit('data-loaded', {
      pemasukanBreakdown: pemasukanBreakdown.value,
      pengeluaranBreakdown: pengeluaranBreakdown.value,
      totalPemasukan,
      totalPengeluaran
    });
    
    loading.value = false;
  }, 100);
};

// Fetch breakdown data from API
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  // Reset data
  pemasukanBreakdown.value = {};
  pengeluaranBreakdown.value = {};
  
  console.log('Fetching breakdown data, range:', props.range);
  
  try {
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available:', token ? 'Yes (redacted)' : 'No');
    
    // API endpoint for breakdown data
    const response = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-total-pemasukan-pengeluaran`, {
      params: { range: props.range || 'THIS_YEAR' },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Breakdown API response:', response.status, response.statusText);
    
    if (response.data && response.data.status === 200 && response.data.data) {
      const responseData = response.data.data;
      console.log('Breakdown response data:', responseData);
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        // Process breakdown data from the first item (assuming single period)
        const item = responseData[0];
        
        // Set pemasukan breakdown
        if (item.pemasukanBreakdown) {
          pemasukanBreakdown.value = { ...item.pemasukanBreakdown };
        }
        
        // Set pengeluaran breakdown
        if (item.pengeluaranBreakdown) {
          pengeluaranBreakdown.value = { ...item.pengeluaranBreakdown };
        }
        
        console.log('Final breakdown data:', {
          pemasukan: pemasukanBreakdown.value,
          pengeluaran: pengeluaranBreakdown.value
        });
      } else {
        console.warn('Invalid response format or empty data:', responseData);
      }
      
      updateChartData();
    } else {
      console.warn('Invalid response format:', response.data);
      updateChartData();
    }
  } catch (err: any) {
    console.error('Error fetching breakdown data:', err.message);
    
    
    updateChartData();
    error.value = 'Terjadi kesalahan saat memuat data (menampilkan data sample)';
    emit('error', error.value);
  }
};

// Watch for changes in range prop
watch(() => props.range, (newRange) => {
  console.log('Range changed to:', newRange);
  fetchData();
}, { immediate: false });

// Initialize on component mount
onMounted(() => {
  console.log('Breakdown bar chart component mounted');
  fetchData();
});
</script>

<template>
  <div class="w-full h-full">
    <!-- Error State -->
    <div v-if="error" class="absolute top-0 left-0 right-0 p-2 text-center text-xs text-red-600 bg-red-50 rounded z-10">
      {{ error }}
    </div>

    <!-- Chart Container -->
    <Bar :data="chartData" :options="chartOptions" />
    
    <!-- Data Summary -->
    <div v-if="!loading" class="mt-2 text-xs text-gray-600">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-green-700 mb-1">Pemasukan</h4>
          <ul class="space-y-1">
            <li v-for="(value, key) in pemasukanBreakdown" :key="`pemasukan-${key}`" 
                v-show="value > 0"
                class="flex justify-between">
              <span>{{ key }}:</span>
              <span class="font-medium">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value) }}</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-red-700 mb-1">Pengeluaran</h4>
          <ul class="space-y-1">
            <li v-for="(value, key) in pengeluaranBreakdown" :key="`pengeluaran-${key}`" 
                v-show="value > 0"
                class="flex justify-between">
              <span>{{ key }}:</span>
              <span class="font-medium">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>