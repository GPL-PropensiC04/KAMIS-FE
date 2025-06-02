<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Notification -->
    <div 
      v-if="showNotification" 
      class="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ notificationMessage }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg text-gray-600">Memuat data aset...</p>
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

    <!-- Asset Details -->
    <template v-else>
      <div class="max-w-full mx-auto px-8 py-6">
        <!-- Header Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div class="bg-[#1E3A5F] px-8 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <router-link to="/assets" class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </router-link>
                <div>
                  <h1 class="text-2xl font-bold text-white">Detail Aset</h1>
                  <p class="text-blue-100 mt-1">{{ aset.nama }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div v-if="canEditAsset" class="flex space-x-3">
                <button @click="handleEditAset" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <span>Ubah</span>
                </button>
                <button @click="showDeleteModal = true" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <!-- Asset Information Header -->
          <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Jenis Aset</p>
                  <p class="text-[#1E3A5F] text-lg font-bold">{{ aset.jenisAset }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">No Polisi</p>
                  <p class="text-[#1E3A5F] text-lg font-bold">{{ aset.platNomor }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <span :class="getStatusColor(aset.status)" class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full">
                    {{ aset.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dates and Financial Information -->
          <div class="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Tanggal Perolehan</p>
                  <p class="text-[#1E3A5F] font-semibold">{{ formatDate(aset.tanggalPerolehan) }}</p>
                </div>
              </div>

              <div v-if="canViewFinancialInfo" class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Nilai Perolehan</p>
                  <p class="text-emerald-700 text-lg font-bold">{{ formatCurrency(aset.nilaiPerolehan) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Asset Details -->
          <div class="p-8">
            <div class="grid grid-cols-12 gap-8">
              <!-- Left Column - Asset Information -->
              <div class="col-span-12 lg:col-span-7">
                <div class="flex items-center mb-6">
                  <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Informasi Aset</h3>
                </div>

                <div class="space-y-6">
                  <!-- Asset Name -->
                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mt-1">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-600 mb-1">Nama Aset</p>
                      <p class="text-[#1E3A5F] text-lg font-bold">{{ aset.nama }}</p>
                    </div>
                  </div>

                  <!-- Asset Description -->
                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mt-1">
                      <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-600 mb-2">Deskripsi Aset</p>
                      <p class="text-gray-800 text-sm leading-relaxed">{{ aset.deskripsi || 'Tidak ada deskripsi' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column - Asset Image -->
              <div class="col-span-12 lg:col-span-5">
                <div class="flex items-center mb-6">
                  <div class="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Foto Aset</h3>
                </div>

                <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <div class="relative group">
                    <div v-if="imageLoading" class="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
                      <svg class="animate-spin w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <img 
                      v-else
                      :src="assetImage || '/placeholder-image.jpg'" 
                      alt="Gambar Aset" 
                      class="w-full h-80 object-cover rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                      @error="handleImageError"
                      @load="imageLoading = false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Maintenance History Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-[#1E3A5F] px-8 py-5 flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
              <h2 class="text-xl font-bold text-white">Riwayat Maintenance</h2>
            </div>
            <button 
              v-if="canEditAsset && aset.status === 'Tersedia'" 
              @click="showMaintenanceModal = true" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Tambah</span>
            </button>
          </div>
          
          <!-- Maintenance History Table -->
          <div class="p-8">
            <!-- Loading State for Maintenance -->
            <div v-if="maintenanceLoading" class="flex flex-col items-center justify-center py-12">
              <svg class="animate-spin w-8 h-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Memuat data maintenance...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="maintenanceHistory.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Belum Ada Data Maintenance</h3>
              <p class="text-gray-500">Data maintenance akan muncul di sini setelah ditambahkan</p>
            </div>

            <!-- Maintenance Table -->
            <div v-else class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-[#1E3A5F] text-white">
                      <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                          </svg>
                          <span>Tanggal Dibuat</span>
                        </div>
                      </th>
                      <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Tanggal Selesai</span>
                        </div>
                      </th>
                      <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <span>Deskripsi Pekerjaan</span>
                        </div>
                      </th>
                      <th v-if="canViewFinancialInfo" class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                        <div class="flex items-center justify-end space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                          <span>Biaya</span>
                        </div>
                      </th>
                      <th v-if="canEditAsset" class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
                        <div class="flex items-center justify-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>Aksi</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in sortedMaintenanceHistory" :key="item.id" class="hover:bg-gray-50 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-3">
                          <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                            </svg>
                          </div>
                          <span class="text-sm font-medium text-gray-900">{{ formatDate(item.tanggalMulaiMaintenance) }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span v-if="item.tanggalSelesaiMaintenance" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {{ formatDate(item.tanggalSelesaiMaintenance) }}
                        </span>
                        <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Belum Selesai
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <p class="text-sm text-gray-900 leading-relaxed">{{ item.deskripsiPekerjaan }}</p>
                      </td>
                      <td v-if="canViewFinancialInfo" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {{ formatCurrency(item.biaya) }}
                      </td>
                      <td v-if="canEditAsset" class="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          v-if="item.tanggalSelesaiMaintenance === null"
                          @click="openCompleteModal(item.id, item.tanggalMulaiMaintenance)"
                          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Selesai</span>
                        </button>
                        <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {{ calculateMaintenanceDuration(item.tanggalMulaiMaintenance, item.tanggalSelesaiMaintenance) }} hari
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 m-4">
          <div class="flex items-center space-x-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Konfirmasi Hapus</h3>
          </div>

          <p class="text-gray-700 text-lg mb-6 text-center">Apakah anda yakin ingin menghapus aset ini?</p>
          
          <div class="flex justify-center space-x-4">
            <button 
              @click="showDeleteModal = false"
              class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              Tidak
            </button>
            <button 
              @click="confirmDelete"
              class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              <span>Ya, Hapus</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Maintenance Modal -->
      <div v-if="showMaintenanceModal" class="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 m-4">
          <div class="flex items-center space-x-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Tambah Maintenance</h3>
          </div>

          <form @submit.prevent="submitMaintenance" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Pekerjaan <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="newMaintenance.deskripsiPekerjaan" 
                rows="4" 
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                required
                placeholder="Masukkan deskripsi pekerjaan maintenance..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Biaya <span class="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                v-model="newMaintenance.biaya" 
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
                min="0"
                placeholder="Masukkan biaya maintenance"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Mulai Maintenance <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                v-model="newMaintenance.tanggalMulaiMaintenance"
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <p v-if="maintenanceError" class="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
              {{ maintenanceError }}
            </p>
            
            <div class="flex justify-end space-x-3 mt-8">
              <button 
                type="button"
                @click="showMaintenanceModal = false" 
                class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                Batal
              </button>
              <button 
                type="submit"
                class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Tambah</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Complete Maintenance Modal -->
      <div v-if="showCompleteModal" class="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 m-4">
          <div class="flex items-center space-x-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Selesaikan Maintenance</h3>
          </div>
          <form @submit.prevent="submitCompleteMaintenance" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Selesai Maintenance <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                v-model="completeMaintenanceDate"
                :min="completeMaintenanceStartDate"
                :max="new Date().toISOString().slice(0, 10)"
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <p v-if="completeMaintenanceError" class="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
              {{ completeMaintenanceError }}
            </p>
            <div class="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                @click="showCompleteModal = false"
                class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Selesaikan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AsetInterface } from '@/interfaces/asset/asset.interface';
import { AsetService } from '@/stores/assetservices';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const platNomor = route.params.platNomor as string;

// State variables
const aset = ref<AsetInterface>({} as AsetInterface);
const maintenanceHistory = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');
const assetImage = ref('');
const imageLoading = ref(true);

// Modal states
const showDeleteModal = ref(false);
const showMaintenanceModal = ref(false);
const showCompleteModal = ref(false);
const completeMaintenanceId = ref<number | null>(null);
const completeMaintenanceStartDate = ref('');
const completeMaintenanceDate = ref(new Date().toISOString().slice(0, 10));
const completeMaintenanceError = ref('');

// New maintenance form
const newMaintenance = ref({
  platNomor: '',
  deskripsiPekerjaan: '',
  biaya: 0,
  tanggalMulaiMaintenance: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
});

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');

// Maintenance loading state
const maintenanceLoading = ref(false);
const maintenanceError = ref('');

// Function to show notification
const showSuccessNotification = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format currency function
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  // Only Direksi and Finance can see financial info
  return userRole === 'Direksi' || userRole === 'Finance';
});

const canEditAsset = computed(() => {
  const userRole = authStore.userRole;
  // Only Staf Operasional can edit assets
  return userRole === 'Operasional' || userRole === 'Admin';
});

// Status color helper
const getStatusColor = (status: string) => {
  const colors = {
    'Tersedia': 'bg-green-100 text-green-800',
    'Tidak Tersedia': 'bg-red-100 text-red-800',
    'Maintenance': 'bg-yellow-100 text-yellow-800'
  };
  return (status in colors ? colors[status as keyof typeof colors] : 'bg-gray-100 text-gray-800');
};

// Add this computed property after your other computed properties
const sortedMaintenanceHistory = computed(() => {
  // Make a copy of the array to avoid mutation issues
  return [...maintenanceHistory.value].sort((a, b) => {
    // Compare dates in descending order (newest first)
    const dateA = new Date(a.tanggalMulaiMaintenance);
    const dateB = new Date(b.tanggalMulaiMaintenance);
    return dateB.getTime() - dateA.getTime();
  });
});

// Calculate maintenance duration in days
const calculateMaintenanceDuration = (startDate: string, endDate: string): string | number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  // Return "<1" if the duration is less than 1 day
  return differenceInDays < 1 ? "<1" : differenceInDays;
};

// Fetch maintenance data
const fetchMaintenanceHistory = async () => {
  maintenanceLoading.value = true;
  maintenanceError.value = '';
  
  try {
    // Remove the duplicated 'api' segment in the URL
    const maintenanceUrl = `${API_URLS.ASSET}/maintenance/${platNomor}`;
    console.log(`Fetching maintenance for ${platNomor} from ${maintenanceUrl}`);
    
    const response = await axios.get(maintenanceUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('Maintenance API response:', response);
    
    if (response.data && response.data.data) {
      maintenanceHistory.value = response.data.data;
      console.log('Maintenance history loaded:', maintenanceHistory.value.length, 'records');
    } else {
      console.warn('No data property in API response');
      maintenanceHistory.value = [];
    }
  } catch (err) {
    console.error('Error loading maintenance data:', err);
    
    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status;
      const errorMsg = err.response?.data?.message || err.message;
      
      // More specific error message based on status code
      if (statusCode === 401 || statusCode === 403) {
        maintenanceError.value = 'Anda tidak memiliki akses untuk melihat data maintenance';
      } else if (statusCode === 404) {
        maintenanceError.value = 'Data maintenance tidak ditemukan';
      } else {
        maintenanceError.value = `Gagal memuat data: ${errorMsg}`;
      }
    } else {
      maintenanceError.value = 'Gagal memuat data maintenance';
    }
    
    maintenanceHistory.value = [];
  } finally {
    maintenanceLoading.value = false;
  }
};

// Submit new maintenance
const submitMaintenance = async () => {
  maintenanceError.value = '';
  const loadingToastId = toast.info('Menambah maintenance...', { timeout: false });

  try {
    newMaintenance.value.platNomor = platNomor;

    const payload = {
      ...newMaintenance.value,
      tanggalMulaiMaintenance: newMaintenance.value.tanggalMulaiMaintenance
    };

    const response = await axios.post(`${API_URLS.ASSET}/maintenance/`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (response.data && response.data.status === 201) {
      toast.dismiss(loadingToastId);
      toast.success('Maintenance berhasil ditambah');
      showMaintenanceModal.value = false;

      // Reset form
      newMaintenance.value = {
        platNomor: '',
        deskripsiPekerjaan: '',
        biaya: 0,
        tanggalMulaiMaintenance: new Date().toISOString().slice(0, 10)
      };

      // Refresh data
      await Promise.all([
        loadData(),
        fetchMaintenanceHistory()
      ]);
    }
  } catch (err: any) {
    toast.dismiss(loadingToastId);
    console.error('Error submitting maintenance:', err);

    if (err.response && err.response.data && err.response.data.message) {
      maintenanceError.value = err.response.data.message;
    } else {
      maintenanceError.value = 'Gagal menambah maintenance. Silakan coba lagi.';
    }
  }
};

// Complete maintenance
const completeMaintenance = async (id: number) => {
  const loadingToastId = toast.info('Menyelesaikan maintenance...', { timeout: false });
  
  try {
    const response = await axios.patch(`${API_URLS.ASSET}/maintenance/${id}/complete`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200) {
      toast.dismiss(loadingToastId);
      toast.success('Maintenance berhasil diselesaikan');
      
      // Refresh data
      await Promise.all([
        loadData(),
        fetchMaintenanceHistory()
      ]);
    }
  } catch (err: any) {
    toast.dismiss(loadingToastId);
    console.error('Error completing maintenance:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error('Gagal menyelesaikan maintenance. Silakan coba lagi.');
    }
  }
};

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Load asset details
    const response = await AsetService.getAsetByPlatNomor(platNomor);
    
    // Check if the asset exists or has been deleted
    if (!response || response.isDeleted) {
      // Redirect to NotFoundView if asset is deleted or doesn't exist
      router.replace('/not-found');
      return;
    }
    
    aset.value = response;
    
    // Fetch asset image
    if (aset.value && aset.value.platNomor) {
      await fetchAssetImage(aset.value.platNomor);
    } else {
      assetImage.value = '/placeholder-image.jpg';
    }

  } catch (err) {
    console.error('Error loading data:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      router.replace('/not-found');
      return;
    }
    
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
    assetImage.value = '/placeholder-image.jpg';
  } finally {
    isLoading.value = false;
  }
};

// Fetch asset image from backend
const fetchAssetImage = async (id: string) => {
  imageLoading.value = true;
  
  try {
    if (!id || id === 'undefined' || id === 'null') {
      assetImage.value = '/placeholder-image.jpg';
      return;
    }

    const response = await axios.get(`${API_URLS.ASSET}/asset/${id}/foto`, {
      responseType: 'blob',
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    
    if (response.data && response.data.size > 0) {
      assetImage.value = URL.createObjectURL(response.data);
    } else {
      assetImage.value = '/placeholder-image.jpg';
    }
  } catch (error) {
    console.error("Error fetching asset image:", error);
    assetImage.value = '/placeholder-image.jpg';
  } finally {
    // Set to false in case the image load event doesn't fire
    setTimeout(() => {
      imageLoading.value = false;
    }, 300);
  }
};

// Event handlers
const handleImageError = () => {
  assetImage.value = '/placeholder-image.jpg';
};

const handleEditAset = () => {
  router.push(`/asset/edit/${platNomor}`);
};

const confirmDelete = async () => {
  try {
    await AsetService.deleteAset(platNomor);
    showSuccessNotification('Aset berhasil dihapus');
    
    setTimeout(() => {
      router.push({
        path: '/assets',
        query: { deleted: 'true', platNomor: platNomor }
      });
    }, 1500);
  } catch (err) {
    console.error('Error deleting asset:', err);
    error.value = 'Gagal menghapus aset. Silakan coba lagi.';
  } finally {
    showDeleteModal.value = false;
  }
};

// Open complete maintenance modal
const openCompleteModal = (id: number, tanggalMulai: string) => {
  completeMaintenanceId.value = id;
  completeMaintenanceStartDate.value = tanggalMulai;
  // Default tanggal selesai: hari ini, tapi tidak boleh sebelum tanggalMulai
  const today = new Date().toISOString().slice(0, 10);
  completeMaintenanceDate.value = today < tanggalMulai ? tanggalMulai : today;
  showCompleteModal.value = true;
  completeMaintenanceError.value = '';
};

// Submit complete maintenance form
const submitCompleteMaintenance = async () => {
  completeMaintenanceError.value = '';
  if (!completeMaintenanceId.value) return;
  const tanggalSelesai = completeMaintenanceDate.value;

  // Validasi: tanggal selesai harus >= tanggal mulai dan <= hari ini
  if (
    tanggalSelesai < completeMaintenanceStartDate.value ||
    tanggalSelesai > new Date().toISOString().slice(0, 10)
  ) {
    completeMaintenanceError.value = 'Tanggal selesai harus di antara tanggal mulai dan hari ini.';
    return;
  }

  const loadingToastId = toast.info('Menyelesaikan maintenance...', { timeout: false });
  
  try {
    const response = await axios.patch(
      `${API_URLS.ASSET}/maintenance/${completeMaintenanceId.value}/complete`, 
      { tanggalSelesaiMaintenance: completeMaintenanceDate.value },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    if (response.data && response.data.status === 200) {
      toast.dismiss(loadingToastId);
      toast.success('Maintenance berhasil diselesaikan');
      showCompleteModal.value = false;
      
      // Refresh data
      await Promise.all([
        loadData(),
        fetchMaintenanceHistory()
      ]);
    }
  } catch (err: any) {
    toast.dismiss(loadingToastId);
    console.error('Error completing maintenance:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      completeMaintenanceError.value = err.response.data.message;
    } else {
      completeMaintenanceError.value = 'Gagal menyelesaikan maintenance. Silakan coba lagi.';
    }
  }
};

onMounted(async () => {
  await loadData();
  await fetchMaintenanceHistory();
  
  // Check if coming from edit page
  if (route.query.edited === 'true') {
    showSuccessNotification('Berhasil Mengubah Detail Aset');
    router.replace({ path: route.path });
  }
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

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
    width: 6px;
}

textarea::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
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