<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import type { IncomeExpenseLineResponseDTO } from '@/interfaces/finance.report/lapkeu.interface';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps<{
  range?: string;
}>();

const periodType = ref(''); // <-- Default kosong

const labels = ref<string[]>([]);
const pemasukanData = ref<number[]>([]);
const pengeluaranData = ref<number[]>([]);

const chartData = ref<{
  labels: string[];
  datasets: any[];
}>({
  labels: [],
  datasets: []
});

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const val = context.parsed.y;
          return `Rp ${val.toLocaleString('id-ID')}`;
        }
      }
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `Rp${(+value).toLocaleString('id-ID')}`
      }
    }
  }
};

const fetchChartData = async () => {
  try {
    const res = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-pemasukan-pengeluaran`, {
      params: {
        range: props.range,
        periodType: periodType.value || undefined // Jangan kirim kalau kosong
      }
    });
    const data: IncomeExpenseLineResponseDTO[] = res.data.data;

    labels.value = data.map(item => formatPeriodLabel(item.period));
    pemasukanData.value = data.map(item => item.totalPemasukan);
    pengeluaranData.value = data.map(item => item.totalPengeluaran);

    chartData.value = {
      labels: labels.value,
      datasets: [
        {
          label: 'Pemasukan',
          data: pemasukanData.value,
          borderColor: '#14532D',
          backgroundColor: '#14532D',
          tension: 0.3,
          pointRadius: 4,
          fill: false
        },
        {
          label: 'Pengeluaran',
          data: pengeluaranData.value,
          borderColor: '#912018',
          backgroundColor: '#912018',
          tension: 0.3,
          pointRadius: 4,
          fill: false
        }
      ]
    };
  } catch (e) {
    console.error('Gagal fetch data pemasukan-pengeluaran', e);
  }
};

const formatPeriodLabel = (label: string): string => {
  if (periodType.value === 'Weekly' || props.range === 'THIS_MONTH') {
    return label.split('-W')[1] ? `Minggu ke-${label.split('-W')[1]}` : label;
  }

  if (periodType.value === 'Quarterly') {
    return label.split('-Q')[1] ? `Q${label.split('-Q')[1]}` : label;
  }

  if (periodType.value === 'Monthly' || props.range === 'THIS_QUARTER' || props.range === 'THIS_YEAR') {
    const monthMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
      '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
      '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };
    const [year, month] = label.split('-');
    return monthMap[month] || label;
  }

  return label;
};

watch(periodType, fetchChartData);
watch(
  () => props.range,
  (newRange) => {
    if (newRange === 'THIS_YEAR') {
      periodType.value = 'Monthly';
    } else {
      periodType.value = '';
    }
  },
  { immediate: true } // agar dijalankan saat onMounted juga
);
onMounted(fetchChartData);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md p-6 w-full max-w-5xl mx-auto flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <font-awesome-icon
            :icon="['fas', 'fa-chart-line']"
            class="text-[24px] mr-2"
            style="color: #1E3A5F;"
        />
        <h2 class="text-lg font-bold text-left">Total Pemasukan Distribusi dan Penjualan per Bulan</h2>
      </div>

      <!-- Tampilkan toggle HANYA jika range THIS_YEAR -->
      <div
        v-if="props.range === 'THIS_YEAR'"
        class="flex border border-[#1E3A5F] rounded-md overflow-hidden font-inter h-[38px] text-sm"
      >
        <button
          v-for="option in ['Monthly', 'Quarterly']"
          :key="option"
          @click="periodType = option"
          class="px-3 py-1 font-semibold"
          :class="[
            periodType === option
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-[#E5EAF2] text-[#1E3A5F]'
          ]"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="w-full h-[320px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
