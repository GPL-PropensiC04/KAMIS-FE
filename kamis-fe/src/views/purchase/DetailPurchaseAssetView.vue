<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg text-gray-600">Memuat data...</p>
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
        <button @click="loadPurchaseData" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Coba Lagi</span>
        </button>
      </div>
    </div>

    <!-- Purchase Details -->
    <div v-else-if="purchase" class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="router.back()" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Detail Pembelian Aset</h1>
                <p class="text-blue-100 mt-1">ID Transaksi: {{ purchase.purchaseId }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="purchase.purchaseStatus !== 'Ditolak' && purchase.purchaseStatus !== 'Dibatalkan'" class="flex space-x-3">
              <template v-if="purchase.purchaseStatus === 'Diajukan'">
                <template v-if="userRole === 'Operasional'">
                  <button @click="handleEditDetail" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Ubah Detail</span>
                  </button>
                </template>
                <template v-else>
                  <button @click="openModal(false)" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Tolak</span>
                  </button>
                  <button @click="openModal(true)" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Setujui</span>
                  </button>
                </template>
              </template>

              <template v-else-if="purchase.purchaseStatus === 'Disetujui'">
                <template v-if="userRole === 'Operasional'">
                  <button @click="openModal(true)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span>Proses Pembelian</span>
                  </button>
                </template>
                <template v-else-if="userRole === 'Admin'">
                  <button @click="openModal(false)" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Batalkan</span>
                  </button>
                  <button @click="openModal(true)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span>Proses Pembelian</span>
                  </button>
                </template>
              </template>

              <template v-else-if="purchase.purchaseStatus === 'Diproses'">
                <template v-if="userRole === 'Operasional'">
                  <button @click="openModal(false)" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Batalkan</span>
                  </button>
                  <button @click="openModal(true)" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Selesaikan Pembelian</span>
                  </button>
                </template>
                <template v-else-if="userRole === 'Finance'">
                  <button v-if="!purchase.purchasePaymentDate" @click="openPaymentModal()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span>Konfirmasi Pembayaran</span>
                  </button>
                </template>
              </template>

              <template v-else-if="purchase.purchaseStatus === 'Selesai'">
                <template v-if="userRole === 'Finance'">
                  <button v-if="!purchase.purchasePaymentDate" @click="openPaymentModal()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span>Konfirmasi Pembayaran</span>
                  </button>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Purchase Information Header -->
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Supplier</p>
                <p class="text-[#1E3A5F] text-lg font-bold">{{ supplierName || 'Loading...' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Tipe Barang</p>
                <span class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                  {{ purchase.purchaseType }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Status Pembelian</p>
                <span :class="getStatusColor(purchase.purchaseStatus)" class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full">
                  <template v-if="(userRole === 'Finance' || userRole === 'Direksi') && purchase.purchaseStatus === 'Diajukan'">
                    Menunggu Persetujuan
                  </template>
                  <template v-else-if="(userRole === 'Finance' || userRole === 'Direksi') && (purchase.purchaseStatus === 'Diproses' || purchase.purchaseStatus === 'Selesai') && purchase.purchasePaymentDate === null">
                    Menunggu Konfirmasi Pembayaran
                  </template>
                  <template v-else>
                    {{ purchase.purchaseStatus }}
                  </template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates Information -->
        <div class="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Tanggal Pengajuan</p>
                <p class="text-[#1E3A5F] font-semibold">{{ formatDate(purchase.purchaseSubmissionDate) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg">
                <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Terakhir Diperbarui</p>
                <p class="text-[#1E3A5F] font-semibold">{{ formatDate(purchase.purchaseUpdateDate) }}</p>
              </div>
            </div>

            <div v-if="purchase.purchasePaymentDate" class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Tanggal Pembayaran</p>
                <p class="text-[#1E3A5F] font-semibold">{{ formatDate(purchase.purchasePaymentDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Details -->
        <div v-if="purchase.purchaseAsset" class="p-8">
          <div class="grid grid-cols-12 gap-8">
            <!-- Left Column - Asset Information -->
            <div class="col-span-12 lg:col-span-7">
              <div class="flex items-center mb-6">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Detail Aset</h3>
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
                    <p class="text-[#1E3A5F] text-lg font-bold">{{ purchase.purchaseAsset.assetNameString }}</p>
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
                    <p class="text-gray-800 text-sm leading-relaxed">{{ purchase.purchaseAsset.assetDescription }}</p>
                  </div>
                </div>

                <!-- Asset Price -->
                <div v-if="canViewFinancialInfo" class="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mt-1">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-600 mb-1">Total Harga</p>
                    <p class="text-green-700 text-2xl font-bold">{{ formatCurrency(purchase.purchaseAsset.assetPrice) }}</p>
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
                  <img 
                    :src="imageUrl || '/placeholder-asset.jpg'"
                    :alt="purchase.purchaseAsset.assetNameString"
                    class="w-full h-80 object-cover rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Purchase Notes -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="flex items-center mb-4">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Catatan Pembelian</h3>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p class="text-gray-800 text-sm leading-relaxed">
                {{ purchase.purchaseNote || 'Tidak ada catatan' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Purchase Logs -->
        <div v-if="purchase.purchaseLogs?.length" class="px-8 py-6 border-t border-gray-200">
          <div class="flex items-center mb-6">
            <div class="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Log Pembelian</h3>
          </div>

          <!-- Search Input -->
          <div class="mb-6">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                v-model="searchLog" 
                placeholder="Cari log..." 
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <!-- Timeline -->
          <div class="space-y-6">
            <div 
              v-for="(log) in paginatedLogs" 
              :key="log.id" 
              class="relative flex items-start gap-4"
              :class="{
                'flex-row-reverse': log.user === currentUsername,
                '': log.user !== currentUsername
              }"
            >
              <!-- Timeline dot -->
              <div class="w-4 h-4 bg-[#1E3A5F] rounded-full mt-2 flex-shrink-0 border-4 border-white shadow-md"></div>

              <!-- Log content -->
              <div class="flex flex-col max-w-[80%]">
                <p class="text-[#1E3A5F] font-semibold text-sm mb-2"
                   :class="{
                     'text-right': log.user === currentUsername,
                     'text-left': log.user !== currentUsername
                   }">
                  {{ formatTime(log.actionDate) }} - {{ formatDate(log.actionDate) }}
                </p>
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm">
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="font-semibold text-gray-800">
                      {{ log.user === currentUsername ? log.user + ' (You)' : log.user }}
                    </span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <p class="text-gray-700 leading-relaxed">{{ log.action }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Menampilkan {{ paginatedLogs.length }} dari {{ filteredLogs.length }} log</span>
            </div>

            <div class="flex items-center space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E3A5F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A4A6F] transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>

              <span class="text-sm font-semibold text-[#1E3A5F] px-3">
                {{ currentPage }} / {{ totalPages }}
              </span>

              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E3A5F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A4A6F] transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Update Status -->
    <div v-if="showUpdateModal" class="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 m-4">
        <div class="flex items-center space-x-3 mb-6">
          <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Konfirmasi Update Status</h3>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Catatan <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="noteUpdate" 
              rows="4" 
              class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Masukkan catatan untuk update status..."
            ></textarea>
          </div>

          <div v-if="isNextStatus && purchase?.purchaseStatus === 'Diproses'">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Plat Nomor <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="platNomor" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Masukkan plat nomor kendaraan..."
            />
          </div>

          <p v-if="errorUpdate" class="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
            {{ errorUpdate }}
          </p>
        </div>

        <div class="flex justify-end space-x-3 mt-8">
          <button 
            @click="showUpdateModal = false" 
            class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Batal
          </button>
          <button 
            @click="submitUpdateStatus" 
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <span>Kirim</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Pembayaran -->
    <div v-if="showPaymentModal" class="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 m-4">
        <div class="flex items-center space-x-3 mb-6">
          <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h3>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Catatan <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="notePayment" 
              rows="4" 
              class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Masukkan catatan konfirmasi pembayaran..."
            ></textarea>
          </div>

          <p v-if="errorPayment" class="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
            {{ errorPayment }}
          </p>
        </div>

        <div class="flex justify-end space-x-3 mt-8">
          <button 
            @click="showPaymentModal = false" 
            class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Batal
          </button>
          <button 
            @click="submitPayment" 
            class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Konfirmasi</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import type { AssetTempInterface } from '@/interfaces/purchase/assettemp.interface';
import type { PurchaseInterface } from '@/interfaces/purchase/purchase.interface';
import type { UpdatePurchaseStatusRequestInterface } from '@/interfaces/purchase/purchase.interface';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';

// Extended interface for the detail view
interface DetailAssetPurchaseInterface extends Omit<PurchaseInterface, 'purchaseAsset'> {
  purchaseAsset?: AssetTempInterface;
}

const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const purchaseId = ref(route.params.id as string);
const loading = computed(() => purchaseStore.loading);
const error = computed(() => purchaseStore.error);
const purchase = computed(() => purchaseStore.currentPurchase as DetailAssetPurchaseInterface);

const showUpdateModal = ref(false)
const showPaymentModal = ref(false)

const isNextStatus = ref(true)
const noteUpdate = ref('')
const notePayment = ref('')
const platNomor = ref('')
const errorUpdate = ref('')
const errorPayment = ref('')
const searchLog = ref('');

// User role for conditional rendering
const userRole = computed(() => authStore.userRole);
const currentUsername = computed(() => authStore.currentUsername);

const supplierName = ref<string>(""); 
const fetchSupplierName = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/name/${purchase.value.purchaseSupplier}`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierName.value = response.data.data;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// Format date 
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

// Format currency
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Access control - only operational staff cannot see financial details
const canViewFinancialInfo = computed(() => {
  return userRole.value !== 'Operasional';
});

// Load purchase data
const loadPurchaseData = async () => {
  if (!purchaseId.value) return;
  await purchaseStore.getPurchaseById(purchaseId.value);
};

// Status color helper
const getStatusColor = (status: string) => {
  const colors : Record<string, string> =  {
    'Diajukan': 'bg-yellow-100 text-yellow-800',
    'Disetujui': 'bg-blue-100 text-blue-800',
    'Diproses': 'bg-orange-100 text-orange-800',
    'Selesai': 'bg-green-100 text-green-800',
    'Ditolak': 'bg-red-100 text-red-800',
    'Dibatalkan': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Buka Modal Update Status
const openModal = (next: boolean) => {
  isNextStatus.value = next
  noteUpdate.value = ''
  errorUpdate.value = ''
  showUpdateModal.value = true
}

// Buka Modal Pembayaran
const openPaymentModal = () => {
  notePayment.value = ''
  platNomor.value = ''
  errorPayment.value = ''
  showPaymentModal.value = true
}

const submitUpdateStatus = async () => {
  if (!noteUpdate.value.trim()) {
    errorUpdate.value = 'Catatan wajib diisi ❗'
    return
  }

  // Plat Nomor wajib hanya kalau Next & status saat ini 'Diproses'
  if (isNextStatus.value && purchase.value?.purchaseStatus === 'Diproses') {
    if (!platNomor.value.trim()) {
      errorUpdate.value = 'Plat Nomor wajib diisi ❗'
      return
    }
  }

  const body: UpdatePurchaseStatusRequestInterface = {
    purchaseNote: noteUpdate.value,
    platNomor: isNextStatus.value && purchase.value?.purchaseStatus === 'Diproses' ? platNomor.value : undefined
  }

  await purchaseStore.updatePurchaseStatus(purchaseId.value, isNextStatus.value, body)
  showUpdateModal.value = false
  await loadPurchaseData()
}

// Submit Pembayaran
const submitPayment = async () => {
  if (!notePayment.value.trim()) {
    errorPayment.value = 'Catatan wajib diisi ❗'
    return
  }

  const body: UpdatePurchaseStatusRequestInterface = {
    purchaseNote: notePayment.value,
  }

  await purchaseStore.updatePurchaseStatusPembayaran(purchaseId.value, body)
  showPaymentModal.value = false
  await loadPurchaseData()
}

// Handle edit detail action
const handleEditDetail = () => {
  router.push(`/purchase/update-asset/${purchaseId.value}`);
};

// Add ref for image URL
const imageUrl = ref('');

// Add function to fetch image using axios
const fetchAssetImage = async () => {
  try {
    if (!purchase.value?.purchaseAsset?.id) return;
    
    const assetId = purchase.value.purchaseAsset.id;
    const response = await axios.get(`${API_URLS.PURCHASE}/purchase/asset/${assetId}/foto`, {
      responseType: 'blob' // Important: we need the response as a Blob
    });
    
    // Create a URL for the blob
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });
    
    // Free memory from any previous blob URLs
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value);
    }
    
    // Create and store new blob URL
    imageUrl.value = URL.createObjectURL(blob);
    console.log('Image loaded successfully');
  } catch (error) {
    console.error('Error fetching asset image:', error);
    imageUrl.value = '/placeholder-asset.jpg'; // Fallback image
  }
};

// Format Jam dari ISO (jam:menit)
const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

// Urutkan log terbaru ke terlama
const sortedLogs = computed(() => {
    return [...(purchase.value?.purchaseLogs || [])].sort((a, b) =>
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

// Update onMounted to also fetch the image
onMounted(() => {
  loadPurchaseData().then(() => {
    fetchAssetImage();
    fetchSupplierName();
  });
});

// Add cleanup when component is unmounted
onUnmounted(() => {
  // Free memory
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});

watch(() => purchase.value?.purchaseLogs, () => {
    currentPage.value = 1;
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Custom animations */
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
}
</style>