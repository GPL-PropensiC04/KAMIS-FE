<!-- filepath: e:\Propen\KAMIS-FE\kamis-fe\src\components\VBarTotalPemasukkanPengeluaran.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const pemasukkan = ref(0);
const pengeluaran = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

// Fix the chart data initialization to include all required properties
const chartData = ref({
  labels: ['Pemasukkan', 'Pengeluaran'],
  datasets: [{
    data: [0, 0],
    backgroundColor: ['#2E7D32', '#B42318'], // Green for income, Red for expenses
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
      }
    }
  }
};

// Update chart data with current values
const updateChartData = () => {
  // Log the values before updating
  console.log('Updating chart with values:', {
    pemasukkan: pemasukkan.value,
    pengeluaran: pengeluaran.value
  });
  
  // Ensure we're using integers or safe numbers
  const income = Number(pemasukkan.value) || 0;
  const expense = Number(pengeluaran.value) || 0;
  
  chartData.value = {
    labels: ['Pemasukkan', 'Pengeluaran'],
    datasets: [{
      data: [income, expense],
      backgroundColor: ['#14532D', '#912018'],
      borderWidth: 0
    }]
  };
  
  // Emit the data-loaded event with a small delay to ensure the chart has updated
  setTimeout(() => {
    console.log('Emitting data-loaded event with values:', {
      pemasukkan: income,
      pengeluaran: expense
    });
    
    emit('data-loaded', {
      pemasukkan: income,
      pengeluaran: expense
    });
    
    loading.value = false;
  }, 100);
};

// Update fetchData function to sum all values in the array
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  // Set default values before fetching
  pemasukkan.value = 0;
  pengeluaran.value = 0;
  
  console.log('Fetching bar chart data, range:', props.range);
  
  // Set a timeout to ensure loading doesn't last forever if the request hangs
  const timeoutId = setTimeout(() => {
    console.error('Request timeout for pemasukkan/pengeluaran data');
    updateChartData();
    error.value = 'Data tidak tersedia saat ini. Menampilkan placeholder.';
  }, 5000); // 5 second timeout
  
  try {
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available:', token ? 'Yes (redacted)' : 'No');
    
    const response = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-total-pemasukan-pengeluaran`, {
      params: { range: props.range || 'THIS_YEAR' },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    clearTimeout(timeoutId);
    console.log('Bar chart API response:', response.status, response.statusText);
    
    // Check if the response is valid
    if (response.data && response.data.status === 200 && response.data.data) {
      const responseData = response.data.data;
      console.log('Bar chart full response data:', responseData);
      
      // Handle different possible data formats
      if (Array.isArray(responseData) && responseData.length > 0) {
        // If it's an array, sum all items
        console.log('Summing array data with', responseData.length, 'items');
        
        // Sum up all totalPemasukan and totalPengeluaran values
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        
        responseData.forEach(item => {
          // Check for valid numbers and add them to running totals
          const itemPemasukan = parseFloat(item.totalPemasukan) || 0;
          const itemPengeluaran = parseFloat(item.totalPengeluaran) || 0;
          
          totalPemasukan += itemPemasukan;
          totalPengeluaran += itemPengeluaran;
          
          console.log(`Period: ${item.period}, Pemasukan: ${itemPemasukan}, Pengeluaran: ${itemPengeluaran}`);
        });
        
        pemasukkan.value = totalPemasukan;
        pengeluaran.value = totalPengeluaran;
        
        console.log('Total summed values:', {
          totalPemasukan: totalPemasukan,
          totalPengeluaran: totalPengeluaran
        });
      } else {
        // If it's a direct object with the fields
        console.log('Using direct object data');
        
        // Try both possible field names
        pemasukkan.value = parseFloat(responseData.totalPemasukan || 
                                    responseData.totalPemasukkan) || 0;
        pengeluaran.value = parseFloat(responseData.totalPengeluaran) || 0;
      }
      
      console.log('Final values for chart:', {
        pemasukkan: pemasukkan.value,
        pengeluaran: pengeluaran.value
      });
      

      
      // Update chart
      updateChartData();
    } else {
      console.warn('Invalid response format:', response.data);
      // Use default values
      updateChartData();
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Error fetching bar chart data:', err.message);
    updateChartData();
    error.value = 'Terjadi kesalahan saat memuat data';
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
  console.log('Bar chart component mounted');
  fetchData();
});
</script>

<template>
  <div class="w-full h-full">
    <!-- Loading State - Removed because parent already handles this -->
    
    <!-- Error State - Show a message but render the chart anyway with default data -->
    <div v-if="error" class="absolute top-0 left-0 right-0 p-2 text-center text-xs text-red-600 bg-red-50 rounded">
      {{ error }}
    </div>

    <!-- Chart Container - Always render the chart -->
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>