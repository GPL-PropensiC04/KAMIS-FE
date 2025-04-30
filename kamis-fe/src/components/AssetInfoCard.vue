<template>
    <div class="info-aset-container">
      <div class="info-header">
        <h2 class="section-title">Informasi Aset</h2>
        <div v-if="showActionButtons" class="action-buttons">
          <button 
            class="btn btn-hapus" 
            @click="$emit('delete')"
          >Hapus</button>
          <button 
            class="btn btn-ubah" 
            @click="$emit('edit')"
          >Ubah</button>
        </div>
      </div>
  
      <div class="info-content">
        <div class="info-row">
          <div class="info-col">
            <h4 class="info-label">Nama Aset</h4>
            <p class="info-value">{{ aset.nama }}</p>
          </div>
          <div class="info-col">
            <h4 class="info-label">Jenis Aset</h4>
            <p class="info-value">{{ aset.jenisAset }}</p>
          </div>
          <div class="info-col">
            <h4 class="info-label">No Polisi</h4>
            <p class="info-value">{{ aset.platNomor }}</p>
          </div>
        </div>
  
        <div class="info-row">
          <div v-if="showFinancialInfo" class="info-col">
            <h4 class="info-label">Nilai Perolehan</h4>
            <p class="info-value">{{ formatCurrency(aset.nilaiPerolehan) }}</p>
          </div>
          <div v-if="showFinancialInfo" class="info-col">
            <h4 class="info-label">Tanggal Perolehan</h4>
            <p class="info-value">{{ formatDate(aset.tanggalPerolehan) }}</p>
          </div>
          <div class="info-col" :class="{ 'full-width': !showFinancialInfo }">
            <h4 class="info-label">Status</h4>
            <p class="info-value" :class="getStatusClass(aset.status)">{{ aset.status }}</p>
          </div>
        </div>
  
        <div class="info-row">
          <div class="info-col full-width">
            <h4 class="info-label">Deskripsi</h4>
            <p class="info-value">{{ aset.deskripsi }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { AsetInterface } from '@/interfaces/asset/asset.interface';
  import { formatCurrency, formatDate } from '@/utils/formatters';
  import { StatusColorMap } from '@/config/status.config';

  
defineProps<{
    aset: AsetInterface,
    showFinancialInfo: boolean,
    showActionButtons: boolean
  }>();
  
  defineEmits(['edit', 'delete']);

  const getStatusClass = (status: string) => {
    return StatusColorMap[status as keyof typeof StatusColorMap] || '';
  };
  </script>
  
  <style scoped>
  .info-aset-container {
    background-color: white;
    border-radius: 4px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #1a3c61;
    color: white;
  }
  
  .section-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .btn {
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
  
  .btn-hapus {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-ubah {
    background-color: #28a745;
    color: white;
  }
  
  .info-content {
    padding: 20px;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 20px;
  }
  
  .info-col {
    flex: 1;
    padding: 0 10px;
  }
  
  .full-width {
    flex: 3;
  }
  
  .info-label {
    margin: 0 0 5px 0;
    color: #666;
    font-size: 0.9rem;
    font-weight: normal;
  }
  
  .info-value {
    margin: 0;
    font-weight: bold;
    color: #333;
    font-size: 1.1rem;
  }
  
  .status-tersedia {
    color: #28a745;
  }
  
  .status-dipinjam {
    color: #ffc107;
  }
  
  .status-maintenance {
    color: #dc3545;
  }
  </style>