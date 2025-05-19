<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

// Registrasi plugin Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props
const props = defineProps<{
  range?: string;
}>();

// State
const labels = ref<string[]>([]);
const data = ref<number[]>([]);
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


// Fetch API
const fetchPengeluaran = async () => {
  try {
    const response = await axios.get(`${API_URLS.FINANCE}/lapkeu/chart-pengeluaran`, {
      params: { range: props.range || 'THIS_YEAR' }
    });

    const json: ChartPengeluaranResponseDTO[] = response.data.data;

    const labelList = json.map(item => item.activityType);
    const valueList = json.map(item => item.totalPengeluaran);

    // Gabungkan label + value + warna ke satu array
    const combined = labelList.map((label, index) => ({
    label,
    value: valueList[index],
    }));

    // Urutkan dari terbesar ke terkecil
    combined.sort((a, b) => b.value - a.value);

    // Tentukan urutan warna dari index 0 sesuai urutan value
    const orderedColors = backgroundColors.slice(0, combined.length);

    // Update state
    labels.value = combined.map(item => item.label);
    data.value = combined.map(item => item.value);

    chartData.value = {
    labels: labels.value,
    datasets: [{
        data: data.value,
        backgroundColor: orderedColors,
        borderWidth: 1
    }]
    };

  } catch (err) {
    console.error('Gagal fetch data pengeluaran:', err);
  }
};

onMounted(fetchPengeluaran);
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto flex flex-col items-center"
  >
    <div class="flex items-center mb-4 w-full">
        <font-awesome-icon
            :icon="['fas', 'money-bill']"
            class="text-[24px] mr-2"
            style="color: #912018;"
        />
        <h2 class="text-lg font-bold font-lato text-left leading-tight">
            % Pengeluaran per Jenis Pengeluaran
        </h2>
    </div>


    <!-- Container dibatasi ukuran chart -->
    <div class="w-full h-[320px] max-w-[380px] relative">
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>

  </div>
</template>

