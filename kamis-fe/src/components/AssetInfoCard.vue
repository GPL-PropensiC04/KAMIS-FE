<template>
    <div class="info-aset-container">
      <div class="info-header">
        <h2>Informasi Aset</h2>
        <div class="action-buttons">
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
            <h4>Nama Aset</h4>
            <p>{{ aset.nama }}</p>
          </div>
          <div class="info-col">
            <h4>Jenis Aset</h4>
            <p>{{ aset.jenisAset }}</p>
          </div>
          <div class="info-col">
            <h4>No Polisi</h4>
            <p>{{ aset.platNomor }}</p>
          </div>
        </div>
  
        <div class="info-row">
          <div class="info-col">
            <h4>Nilai Perolehan</h4>
            <p>{{ formatCurrency(aset.nilaiPerolehan) }}</p>
          </div>
          <div class="info-col">
            <h4>Tanggal Perolehan</h4>
            <p>{{ formatDate(aset.tanggalPerolehan) }}</p>
          </div>
          <div class="info-col">
            <h4>Status</h4>
            <p :class="getStatusClass(aset.status)">{{ aset.status }}</p>
          </div>
        </div>
  
        <div class="info-row">
          <div class="info-col full-width">
            <h4>Deskripsi</h4>
            <p>{{ aset.deskripsi }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import type { Aset } from '@/interfaces/asset';
  import { formatCurrency, formatDate } from '@/utils/formatters';
  import { StatusColorMap } from '@/config/status.config';
  
  const props = defineProps<{
    aset: Aset
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
  
  .info-col h4 {
    margin: 0 0 5px 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .info-col p {
    margin: 0;
    font-weight: bold;
    color: #333;
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