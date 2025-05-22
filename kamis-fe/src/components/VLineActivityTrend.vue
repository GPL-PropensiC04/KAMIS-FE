<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
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
import type { ActivityComparisonResponseDTO } from '@/interfaces/finance.report/lapkeu.interface';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps<{
  range?: string;
}>();

const periodType = ref('');
const status = ref('All');
const labels = ref<string[]>([]);
const pembelianData = ref<number[]>([]);
const penjualanData = ref<number[]>([]);
const distribusiData = ref<number[]>([]);

const chartData = ref<{
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
    fill: boolean;
  }>;
}>({
  labels: [],
  datasets: []
});

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.parsed.y}`
      }
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const fetchChartData = async () => {
  try {
    const res = await axios.get(`${API_URLS.FINANCE}/operational-report/activity-chart`, {
      params: {
        range: props.range,
        periodType: periodType.value || undefined,
        status: status.value || undefined
      }
    });
    const data: ActivityComparisonResponseDTO[] = res.data.data;

    labels.value = data.map(item => formatPeriodLabel(item.period));
    pembelianData.value = data.map(item => item.pembelianCount);
    penjualanData.value = data.map(item => item.penjualanCount);
    distribusiData.value = data.map(item => item.distribusiCount);

    chartData.value = {
      labels: labels.value,
      datasets: [
        {
          label: 'Pembelian',
          data: pembelianData.value,
          borderColor: '#912018',
          backgroundColor: '#912018',
          tension: 0.3,
          pointRadius: 4,
          fill: false,
        },
        {
          label: 'Penjualan',
          data: penjualanData.value,
          borderColor: '#8CC4A7',
          backgroundColor: '#8CC4A7',
          tension: 0.3,
          pointRadius: 4,
          fill: false
        },
        {
          label: 'Distribusi',
          data: distribusiData.value,
          borderColor: '#1E3A5F',
          backgroundColor: '#1E3A5F',
          tension: 0.3,
          pointRadius: 4,
          fill: false
        }
      ]
    };
  } catch (e) {
    console.error('Gagal fetch data perbandingan aktivitas', e);
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

const chartTitle = computed(() => {
  switch (props.range) {
    case 'THIS_MONTH':
      return 'Trend Aktivitas per Minggu';
    case 'THIS_QUARTER':
      return 'Trend Aktivitas per Bulan';
    case 'THIS_YEAR':
      return periodType.value === 'Quarterly'
        ? 'Trend Aktivitas per Kuartal'
        : 'Trend Aktivitas per Bulan';
    default:
      return 'Trend Aktivitas';
  }
});

watch([periodType, status], fetchChartData);
watch(
  () => props.range,
  (newRange) => {
    if (newRange === 'THIS_YEAR') {
      periodType.value = 'Monthly';
    } else {
      periodType.value = '';
    }
  },
  { immediate: true }
);
onMounted(fetchChartData);
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-7xl mx-auto flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <font-awesome-icon
          :icon="['fas', 'tasks']"
          class="text-[24px] mr-2"
          style="color: #1E3A5F;"
        />
        <h2 class="text-lg font-bold text-left">{{ chartTitle }}</h2>
      </div>

      <div class="flex gap-2 items-center">
        <!-- PeriodType Toggle -->
        <div
            v-if="props.range === 'THIS_YEAR'"
            class="flex border border-[#1E3A5F] font-inter text-sm"
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

        <!-- Status Toggle -->
        <div
            class="flex border border-[#1E3A5F] font-inter text-sm"
        >
            <button
            v-for="option in ['All', 'Done', 'Cancelled']"
            :key="option"
            @click="status = option"
            class="px-3 py-1 font-semibold"
            :class="[
                status === option
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-[#E5EAF2] text-[#1E3A5F]'
            ]"
            >
            {{ option }}
            </button>
        </div>
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
