<template>
    <div class="maintenance-container">
      <div class="maintenance-header">
        <h2 class="section-title">Maintenance</h2>
        <button v-if="showAddButton" class="btn btn-ajukan" @click="$emit('add-maintenance')">Ajukan</button>
      </div>
  
      <div class="divider"></div>
  
      <div class="riwayat-header">
        <h3 class="subsection-title">Riwayat Maintenance</h3>
      </div>
  
      <div class="table-container">
        <table class="maintenance-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Pengajuan</th>
              <th>Tanggal Selesai</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in maintenanceHistory" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.tanggalPengajuan }}</td>
              <td>{{ item.tanggalSelesai }}</td>
              <td>{{ item.catatan }}</td>
            </tr>
            <tr v-if="maintenanceHistory.length === 0">
              <td colspan="4" class="no-data">Tidak ada riwayat maintenance</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Maintenance } from '@/interfaces/asset/maintenance';
  import { formatDate } from '@/utils/formatters';
  
  defineProps<{
    maintenanceHistory: Maintenance[],
    showAddButton: boolean
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
    border-top: 2px solid #ccc;
  }
  
  .section-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .subsection-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .divider {
    height: 3px;
    background-color: #ccc;
    margin: 0;
    border: none;
  }
  
  .btn-ajukan {
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

  .maintenance-actions {
    display: flex;
    justify-content: flex-end;
    padding: 10px 20px;
  }

  .btn-add {
    background-color: #28a745;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
  </style>