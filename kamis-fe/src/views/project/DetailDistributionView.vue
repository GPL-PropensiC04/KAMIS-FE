<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg text-gray-600">Memuat data aktivitas distribusi...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-8 py-6">
      <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div class="flex items-center space-x-3 mb-4">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-red-700 font-semibold">Terjadi Kesalahan</p>
        </div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadData" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Coba Lagi</span>
        </button>
      </div>
    </div>

    <!-- Distribution Details -->
    <template v-else>
      <div class="max-w-full mx-auto px-8 py-6">
        <!-- Header Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div class="bg-[#1E3A5F] px-8 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <router-link to="/project" class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </router-link>
                <div>
                  <h1 class="text-2xl font-bold text-white">Detail Distribusi</h1>
                  <p class="text-blue-100 mt-1">{{ projectData.projectName }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div v-if="!isLoading && !error" class="flex space-x-3">
                <!-- Payment Status Button (only for Finance) -->
                <button 
                  v-if="(canEditFinancial) && showPaymentUpdateButton && projectData.projectPaymentStatus === 0" 
                  @click="openPaymentModal"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Konfirmasi Pembayaran</span>
                </button>
                <button 
                  v-if="(canEditFinancial) && projectData.projectStatus === 3 && projectData.projectPaymentStatus === 1" 
                  @click="openPaymentModal"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                  </svg>
                  <span>Konfirmasi Pengembalian</span>
                </button>
                
                <!-- Project Action Buttons (only for Operasional and Admin) -->
                <template v-if="canEditProject">
                  <button 
                    v-if="projectData.projectStatus < 2" 
                    @click="openCancelModal"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Batal</span>
                  </button>
                  <button 
                    v-if="projectData.projectStatus < 2" 
                    @click="updateProject"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Update Status</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <!-- Project Information Header -->
          <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Informasi Distribusi</h3>
              </div>
              
              <!-- Edit button only for authorized roles -->
              <button
                v-if="canEditProject && projectData.projectStatus < 2"
                @click="editDistributionInfo"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>Ubah</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Project Name -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Nama Kegiatan</p>
                  <p class="text-[#1E3A5F] font-bold">{{ projectData.projectName }}</p>
                </div>
              </div>

              <!-- Client Name -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Nama Klien</p>
                  <p class="text-[#1E3A5F] font-bold">{{ projectData.projectClientName || 'Unknown Client' }}</p>
                </div>
              </div>

              <!-- Start Date -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Tanggal Mulai</p>
                  <p class="text-[#1E3A5F] font-bold">{{ formatDate(projectData.projectStartDate) }}</p>
                </div>
              </div>

              <!-- PHL Count -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Jumlah PHL</p>
                  <p class="text-[#1E3A5F] font-bold">{{ projectData.projectPHLCount }}</p>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <span :class="getStatusColor(projectData.projectStatus)" class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full">
                    {{ formatStatus(projectData.projectStatus) }}
                  </span>
                </div>
              </div>

              <!-- End Date -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Tanggal Selesai</p>
                  <p class="text-[#1E3A5F] font-bold">{{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Addresses Section -->
          <div class="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Pickup Address -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Alamat Pengambilan</p>
                  <p class="text-[#1E3A5F] font-semibold">{{ projectData.projectPickupAddress }}</p>
                </div>
              </div>

              <!-- Delivery Address -->
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Alamat Pengiriman</p>
                  <p class="text-[#1E3A5F] font-semibold">{{ projectData.projectDeliveryAddress }}</p>
                </div>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="mt-6">
              <div class="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm max-w-md">
                <div class="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mt-1">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Status Pembayaran</p>
                  <span :class="getPaymentStatusColor(projectData.projectPaymentStatus)" class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full">
                    {{ formatPaymentStatus(projectData.projectPaymentStatus) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assets Used Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-[#1E3A5F] px-8 py-5 flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
              </svg>
              <h2 class="text-xl font-bold text-white">Aset Yang Digunakan</h2>
            </div>
          </div>
          
          <div class="p-8">
            <div class="rounded-xl overflow-hidden border border-gray-200">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#1E3A5F] text-white">
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center space-x-2">
                        <span>No</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center space-x-2">
                        <span>Tipe Aset</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center space-x-2">
                        <span>Nomor Polisi</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center space-x-2">
                        <span>Jenis</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(asset, index) in projectData.projectUseAsset" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <span class="text-blue-600 font-semibold text-sm">{{ index + 1 }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-medium text-gray-900">{{ asset.tipeAset }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-medium text-gray-900">{{ asset.platNomor }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="assetTypes[asset.platNomor]">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {{ assetTypes[asset.platNomor] }}
                        </span>
                      </template>
                      <template v-else>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          Loading...
                        </span>
                      </template>
                    </td>
                  </tr>
                  <tr v-if="!projectData.projectUseAsset || projectData.projectUseAsset.length === 0">
                    <td colspan="3" class="px-6 py-8 text-center">
                      <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        <span class="text-gray-500">Tidak ada data aset yang digunakan</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div v-if="canViewFinancialInfo" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-[#1E3A5F] px-8 py-5">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              <h2 class="text-xl font-bold text-white">Informasi Keuangan</h2>
            </div>
          </div>
          
          <div class="p-8">
            <div class="rounded-xl overflow-hidden border border-gray-200">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#1E3A5F] text-white">
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Nama Akun</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Pemasukkan</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Pengeluaran</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Income items -->
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 font-medium text-gray-900">Total Pemasukkan</td>
                    <td class="px-6 py-4 text-right font-bold text-green-600">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                    <td class="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  
                  <!-- Expense items -->
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 font-medium text-gray-900">Biaya Pakai Kendaraan</td>
                    <td class="px-6 py-4 text-right text-gray-400">-</td>
                    <td class="px-6 py-4 text-right font-bold text-red-600">{{ formatCurrency(totalAssetUseCost) }}</td>
                  </tr>
                  
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 font-medium text-gray-900">Biaya Bensin</td>
                    <td class="px-6 py-4 text-right text-gray-400">-</td>
                    <td class="px-6 py-4 text-right font-bold text-red-600">{{ formatCurrency(totalAssetFuelCost) }}</td>
                  </tr>
                  
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 font-medium text-gray-900">Upah PHL</td>
                    <td class="px-6 py-4 text-right text-gray-400">-</td>
                    <td class="px-6 py-4 text-right font-bold text-red-600">{{ formatCurrency(projectData.projectPHLPay * projectData.projectPHLCount) }}</td>
                  </tr>
                  
                  <!-- Totals row with border-top -->
                  <tr class="border-t-2 border-gray-300 bg-gray-50">
                    <td class="px-6 py-4 font-bold text-gray-900">Total</td>
                    <td class="px-6 py-4 text-right font-bold text-green-600">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                    <td class="px-6 py-4 text-right font-bold text-red-600">{{ formatCurrency(projectData.projectTotalPengeluaran) }}</td>
                  </tr>
                  
                  <!-- Profit/Loss row with special styling -->
                  <tr class="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <td class="px-6 py-4 font-bold text-gray-900">Total Profit</td>
                    <td colspan="2" :class="{
                      'px-6 py-4 text-right font-bold text-xl': true,
                      'text-red-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) < 0,
                      'text-green-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) > 0
                    }">
                      {{ formatCurrency(projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Distribution Log Card -->
        <div v-if="projectData.projectLogs && projectData.projectLogs.length" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-[#1E3A5F] px-8 py-5">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h2 class="text-xl font-bold text-white">Log Distribusi</h2>
            </div>
          </div>

          <div class="p-8">
            <!-- Loading State for Logs -->
            <div v-if="logsLoading" class="flex flex-col items-center justify-center py-12">
              <svg class="animate-spin w-8 h-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Memuat log distribusi...</p>
            </div>

            <!-- Logs Content -->
            <div v-else>
              <div class="flex flex-col space-y-6 relative">
                <div 
                  v-for="(log) in paginatedLogs" 
                  :key="log.id" 
                  class="relative flex items-start gap-4"
                  :class="{
                    'flex-row-reverse pr-6': log.user === currentUsername,
                    'pl-6': log.user !== currentUsername
                  }"
                >
                  <!-- Icon -->
                  <div class="w-4 h-4 bg-[#1E3A5F] rounded-full mt-2 flex-shrink-0"></div>

                  <!-- Log Content -->
                  <div class="flex flex-col max-w-[80%]">
                    <p class="text-[#1E3A5F] font-semibold text-sm mb-2"
                    :class="{
                    'text-right': log.user === currentUsername,
                    'text-left': log.user !== currentUsername
                    }">
                      {{ formatTime(log.actionDate) }} - {{ formatDate(log.actionDate) }}
                    </p>
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-gray-200 text-sm whitespace-pre-line shadow-sm">
                      <p class="mb-2">
                        <strong class="text-[#1E3A5F]">User : </strong> 
                        <span class="text-gray-700">{{ log.user === currentUsername ? log.user + ' (You)': log.user }}</span>
                      </p>
                      <p class="text-gray-700">{{ log.action }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search + Pagination -->
              <div class="flex flex-wrap justify-between items-center mt-8 gap-4 pt-6 border-t border-gray-200">
                <!-- Search Input -->
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <input 
                    v-model="searchLog" 
                    placeholder="Cari log..." 
                    class="w-full sm:w-[300px] px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <!-- Pagination Controls -->
                <div class="flex items-center space-x-3">
                  <button
                    @click="currentPage--"
                    :disabled="currentPage === 1"
                    class="px-4 py-2 rounded-lg bg-[#1E3A5F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a325a] transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    <span>Prev</span>
                  </button>

                  <span class="text-sm font-semibold text-[#1E3A5F] px-4 py-2 bg-blue-50 rounded-lg">
                    Halaman {{ currentPage }} dari {{ totalPages }}
                  </span>

                  <button
                    @click="currentPage++"
                    :disabled="currentPage === totalPages"
                    class="px-4 py-2 rounded-lg bg-[#1E3A5F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a325a] transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Modals -->
  <VModal v-model="showPaymentModal">
    <div class="bg-white rounded-xl p-8 max-w-md mx-auto border border-gray-200 shadow-2xl">
      <div class="flex items-center space-x-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800">Konfirmasi Perubahan Status Pembayaran</h3>
      </div>
      <p class="mb-6 text-gray-600">{{ getPaymentModalMessage }}</p>
      
      <div class="flex justify-end space-x-3">
        <VCancelButton label="Tidak" @click="closePaymentModal" />
        <VSuccessButton label="Ya" @click="updatePaymentStatus" />
      </div>
    </div>
  </VModal>

  <VModal v-model="showStatusModal">
    <div class="bg-white rounded-xl p-8 max-w-md mx-auto border border-gray-200 shadow-2xl">
      <div class="flex items-center space-x-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800">Konfirmasi Update Status</h3>
      </div>
      <p class="mb-6 text-gray-600">{{ getStatusModalMessage }}</p>
      
      <div class="flex justify-end space-x-3">
        <VCancelButton label="Tidak" @click="closeStatusModal" />
        <VSuccessButton label="Ya" @click="confirmStatusUpdate" />
      </div>
    </div>
  </VModal>

  <VModal v-model="showCancelModal">
    <div class="bg-white rounded-xl p-8 max-w-md mx-auto border border-gray-200 shadow-2xl">
      <div class="flex items-center space-x-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800">Konfirmasi Pembatalan Proyek</h3>
      </div>
      <p class="mb-6 text-gray-600">Apakah Anda yakin ingin membatalkan proyek ini?</p>
      
      <div class="flex justify-end space-x-3">
        <VCancelButton label="Tidak" @click="closeCancelModal" />
        <VSuccessButton label="Ya" @click="confirmCancelProject" />
      </div>
    </div>
  </VModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import { useAuthStore } from '@/stores/auth';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VModal from '@/components/VModal.vue';
import type { AssetUsageDTO, DistributionProjectData } from '@/interfaces/project/project.interface';
import type { LogProjectInterface } from '@/interfaces/project/logproject.interface';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const projectId = route.params.id as string;

const project = ref<DistributionProjectData>({} as DistributionProjectData);
const projectData = ref<DistributionProjectData> ({} as DistributionProjectData);
const isLoading = ref(true);
const error = ref('');
const logsLoading = ref(false);
const assetsLoading = ref(false); // For DetailDistributionView only

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Direksi' || userRole === 'Finance';
});

const canEditProject = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Operasional';
});

const canEditFinancial = computed(() => {
  return authStore.userRole === 'Finance';
});

const showPaymentModal = ref(false);
const showStatusModal = ref(false);
const showCancelModal = ref(false);
const newStatusToUpdate = ref<number | null>(null);
const projectStore = useProjectStore();

// Add these methods
const openCancelModal = () => {
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
};

const confirmCancelProject = async () => {
  await cancelProject();
};

const getStatusModalMessage = computed(() => {
  const nextStatus = formatStatus(newStatusToUpdate.value || 0);
  return `Apakah Anda yakin ingin mengubah status proyek menjadi "${nextStatus}"?`;
});

// Add these computed properties
const showPaymentUpdateButton = computed(() => {
  if (!projectData.value) return false;
  
  const paymentStatus = projectData.value.projectPaymentStatus;
  const projectStatus = projectData.value.projectStatus;
  
  // Show "Lunasi" button if: payment status is 0 (unpaid) and project is not cancelled
  if (paymentStatus === 0 && projectStatus !== 3) return true;
  
  // Show "Kembalikan" button if: payment status is 1 (paid) and project status is 3 (cancelled)
  if (paymentStatus === 1 && projectStatus === 3) return true;
  
  return false;
});

const getPaymentModalMessage = computed(() => {
  if (!projectData.value) return '';
  
  return projectData.value.projectPaymentStatus === 0 
    ? 'Apakah Anda yakin ingin update status pembayaran ini?' 
    : 'Apakah Anda yakin ingin mengembalikan pembayaran ini?';
});


// Now update both computed properties with proper type annotations
const totalAssetUseCost = computed(() => {
  if (!projectData.value || !projectData.value.projectUseAsset) return 0;
  
  return projectData.value.projectUseAsset.reduce((total: number, asset: AssetUsageDTO) => {
    return total + (asset.assetUseCost || 0);
  }, 0);
});

const totalAssetFuelCost = computed(() => {
  if (!projectData.value || !projectData.value.projectUseAsset) return 0;
  
  return projectData.value.projectUseAsset.reduce((total: number, asset: AssetUsageDTO) => {
    return total + (asset.assetFuelCost || 0);
  }, 0);
});

const openPaymentModal = () => {
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const updatePaymentStatus = async () => {
  try {
    const newStatus = projectData.value.projectPaymentStatus === 0 ? 1 : 2;
    await projectStore.updateProjectPayment(projectData.value.id, newStatus);
    
    // Refresh project data
    await loadData();
    closePaymentModal();
  } catch (error) {
    console.error('Failed to update payment status:', error);
  }
};

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format currency function
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Format status function
const formatStatus = (status: number): string => {
  switch (status) {
    case 0: return 'Direncanakan';
    case 1: return 'Dalam Pengiriman';
    case 2: return 'Selesai';
    case 3: return 'Dibatalkan';
    default: return 'Unknown';
  }
};

// Status color helper
const getStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    0: 'bg-blue-100 text-blue-800',      // Direncanakan
    1: 'bg-yellow-100 text-yellow-800',  // Dalam Pengiriman
    2: 'bg-green-100 text-green-800',    // Selesai
    3: 'bg-red-100 text-red-800'         // Dibatalkan
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatPaymentStatus = (paymentStatus: number): string => {
  switch (paymentStatus) {
    case 0: return 'Belum bayar';
    case 1: return 'Sudah bayar';
    case 2: return 'Dikembalikan';
    default: return 'Unknown';
  }
};

// Payment status color helper
const getPaymentStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    0: 'bg-red-100 text-red-800',      // Belum bayar
    1: 'bg-green-100 text-green-800',  // Sudah bayar
    2: 'bg-gray-100 text-gray-800'     // Dikembalikan
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Add this new ref to store asset types
const assetTypes = ref<Record<string, string>>({});

// Updated fetchAssetTypes function
const fetchAssetTypes = async () => {
  if (!projectData.value || !projectData.value.projectUseAsset) return;
  
  assetsLoading.value = true;
  
  try {
    for (const asset of projectData.value.projectUseAsset) {
      if (!asset.platNomor) continue;
      
      // Skip if we already have this asset type
      if (assetTypes.value[asset.platNomor]) continue;
      
      console.log(`Fetching asset type for plate number: ${asset.platNomor}`);
      
      // Fetch asset details from API
      const response = await axios.get(`${API_URLS.ASSET}/asset/${asset.platNomor}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log(`Response for ${asset.platNomor}:`, response.data);
      
      if (response.data && response.data.status === 200 && response.data.data) {
        // Extract the jenisAset field from the response
        const assetData = response.data.data;
        
        if (assetData.jenisAset) {
          assetTypes.value[asset.platNomor] = assetData.jenisAset;
          console.log(`Found jenisAset: ${assetData.jenisAset} for ${asset.platNomor}`);
        } else if (assetData.assetType) {
          assetTypes.value[asset.platNomor] = assetData.assetType;
          console.log(`Using assetType fallback: ${assetData.assetType} for ${asset.platNomor}`);
        } else if (assetData.type) {
          assetTypes.value[asset.platNomor] = assetData.type;
          console.log(`Using type fallback: ${assetData.type} for ${asset.platNomor}`);
        } else {
          // Only if all possible fields are missing
          assetTypes.value[asset.platNomor] = '-';
          console.log(`No type information found for ${asset.platNomor}`);
        }
      } else {
        console.error(`Failed to get asset data for ${asset.platNomor}:`, response.data);
        assetTypes.value[asset.platNomor] = 'Error';
      }
    }
  } catch (err) {
    console.error('Error fetching asset types:', err);
    // In case of error, don't set any default values
  } finally {
    assetsLoading.value = false;
  }
};

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';
  logsLoading.value = true;

  try {
    // Fetch project data
    const response = await axios.get(`${API_URLS.PROJECT}/project/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200) {
      project.value = response.data.data;
      // Extract the nested data object
      projectData.value = response.data.data.data || {};
      
      // Verify this is a distribution project
      if (projectData.value.projectType !== true) {
        router.replace(`/project/sale/${projectId}`);
        return;
      }
      

      // Fetch asset types if assets are available
      if (projectData.value.projectUseAsset && projectData.value.projectUseAsset.length > 0) {
        await fetchAssetTypes();
      }
      
      console.log('Project data loaded:', projectData.value);
    } else {
      error.value = 'Gagal memuat data proyek';
    }
    
    logsLoading.value = false;
  } catch (err) {
    console.error('Error loading project data:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      router.replace('/not-found');
      return;
    }
    
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
    logsLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

// Update cancelProject method
const cancelProject = async () => {
  try {
    await projectStore.updateProjectStatus(projectData.value.id, 3); // 3 is cancelled status
    await loadData(); // Refresh data after cancellation
    closeCancelModal();
  } catch (error) {
    console.error('Failed to cancel project:', error);
  }
};

const updateProject = async () => {
  try {
    // Get current status
    const currentStatus = projectData.value.projectStatus;

    // Sequential status update logic
    if (currentStatus === 0) { // Direncanakan -> Kirim
      newStatusToUpdate.value = 1;
    } else if (currentStatus === 1) { // Kirim -> Selesai
      newStatusToUpdate.value = 2;
    } else {
      return;
    }
    showStatusModal.value = true;
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  newStatusToUpdate.value = null;
};

const confirmStatusUpdate = async () => {
  try {
    if (newStatusToUpdate.value === null) return;
    
    await projectStore.updateProjectStatus(projectData.value.id, newStatusToUpdate.value);
    await loadData(); // Refresh data after update
    closeStatusModal();
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
};

const editDistributionInfo = () => {
  // Navigate to the update distribution view
  router.push(`/project/update/distribution/${projectData.value.id}`);
};

const searchLog = ref('');

const currentUsername = computed(() => authStore.currentUsername);

// Format Jam dari ISO (jam:menit)
const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

// Urutkan log terbaru ke terlama
const sortedLogs = computed(() => {
    console.log(projectData.value.projectLogs)
    return [...(projectData.value?.projectLogs || [])].sort((a, b) =>
        new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
    );
});

const logsPerPage = 3;
const currentPage = ref(1);

const filteredLogs = computed(() => {
    const search = searchLog.value.toLowerCase();
    return sortedLogs.value.filter(log =>
        log.action.toLowerCase().includes(search) || 
        log.user.toLowerCase().includes(search)
    );
});

const totalPages = computed(() => {
    return Math.ceil(filteredLogs.value.length / logsPerPage);
});

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * logsPerPage;
    return filteredLogs.value.slice(start, start + logsPerPage);
});

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Custom animations */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.grid > div {
    animation: slideIn 0.3s ease-out;
}

/* Smooth transitions */
button, input, textarea {
    transition: all 0.2s ease;
}

/* Responsive design */
@media (max-width: 1024px) {
    .grid-cols-12 .col-span-7,
    .grid-cols-12 .col-span-5 {
        grid-column: span 12;
    }
}

@media (max-width: 768px) {
    .grid-cols-2,
    .grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .lg\:grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .overflow-x-auto {
        overflow-x: scroll;
    }
}

@media (max-width: 640px) {
    .flex-col {
        flex-direction: column;
    }
    
    .space-x-3 > * + * {
        margin-left: 0;
        margin-top: 0.75rem;
    }
}
</style>