<template>
    <div class="maintenance-container">
      <div class="maintenance-header">
        <h2>Maintenance</h2>
        <button class="btn btn-tambah" @click="$emit('add-maintenance')">Tambah</button>
      </div>
  
      <div class="riwayat-header">
        <h3>Riwayat Maintenance</h3>
      </div>
  
      <div class="table-container">
        <table class="maintenance-table">
          <thead>
            <tr>
              <th>Tanggal Pengajuan</th>
              <th>Tanggal Selesai</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in maintenanceHistory" :key="index">
              <td>{{ formatDate(item.tanggalPengajuan) }}</td>
              <td>{{ formatDate(item.tanggalSelesai) }}</td>
              <td>{{ item.catatan }}</td>
            </tr>
            <tr v-if="maintenanceHistory.length === 0">
              <td colspan="3" class="no-data">Tidak ada riwayat maintenance</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Maintenance } from '@/interfaces/maintenance';
  import { formatDate } from '@/utils/formatters';
  
  defineProps<{
    maintenanceHistory: Maintenance[]
  }>();
  
  defineEmits(['add-maintenance']);
  </script>
  
  <style scoped>
  .maintenance-container {
    background-color: white;
    border-radius: 4px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .maintenance-header, .riwayat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #1a3c61;
    color: white;
  }
  
  .riwayat-header {
    background-color: #1a3c61;
    padding: 10px 20px;
  }
  
  .riwayat-header h3 {
    margin: 0;
    font-size: 1rem;
  }
  
  .btn-tambah {
    background-color: #28a745;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
  
  .table-container {
    padding: 10px 20px 20px;
    overflow-x: auto;
  }
  
  .maintenance-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .maintenance-table th, .maintenance-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .maintenance-table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  
  .maintenance-table tbody tr:hover {
    background-color: #f8f9fa;
  }
  
  .no-data {
    text-align: center;
    color: #666;
    padding: 20px !important;
  }
  </style>