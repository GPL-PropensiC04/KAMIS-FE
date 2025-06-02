<template>
  <Breadcrumb/>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-full mx-auto px-6 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <router-link to="/project" class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </router-link>
              <div>
                <h1 class="text-2xl font-bold text-white">Buat Aktivitas Penjualan</h1>
                <p class="text-blue-100 mt-1">Lengkapi informasi untuk membuat aktivitas penjualan baru</p>
              </div>
            </div>

            <button 
              @click="submitForm" 
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <span>Selanjutnya</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Informasi Aktivitas</h2>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Nama Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span>Nama Aktivitas</span>
                  <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="formData.projectName"
                  type="text" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan nama aktivitas penjualan"
                />
              </div>

              <!-- Klien -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                  <span>Klien</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select 
                    v-model="formData.projectClientId"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="" disabled>Pilih klien tujuan penjualan</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.name }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Alamat Pengiriman -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>Alamat Pengiriman</span>
                </label>
                <input 
                  v-model="formData.projectDeliveryAddress"
                  type="text" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan alamat pengiriman"
                />
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Jenis Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  <span>Jenis Aktivitas</span>
                </label>
                <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-medium">
                  Penjualan
                </div>
              </div>

              <!-- Tanggal Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                  <span>Tanggal Aktivitas</span>
                  <span class="text-red-500">*</span>
                </label>
                <input 
                  :value="formData.projectStartDate"
                  @input="handleDateInput($event)"
                  type="date" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h2 class="text-xl font-bold text-white">Barang Yang Dijual</h2>
          </div>
        </div>

        <div class="p-8">
          <!-- Product Selection Form -->
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Nama Barang -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Barang</label>
                <div class="relative">
                  <select 
                    v-model="selectedProduct"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-sm"
                  >
                    <option value="" disabled>Pilih Barang</option>
                    <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Jumlah -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
                <div class="relative">
                  <select 
                    v-model="selectedQuantity"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-sm"
                  >
                    <option value="" disabled>Pilih Jumlah</option>
                    <option v-for="num in (availableProducts.find(p => p.id === selectedProduct)?.stock || 0)" :key="num" :value="num">{{ num }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Harga Jual -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Harga Jual</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">Rp</span>
                  </div>
                  <input 
                    v-model.number="selectedPrice"
                    type="number"
                    min="0"
                    class="w-full pl-10 pr-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-sm"
                    readonly
                  />
                </div>
              </div>
              
              <!-- Add Button -->
              <div class="flex items-end">
                <button 
                  @click="addProduct"
                  class="w-full px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152c49] text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#1E3A5F] text-white">
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <span>Nama Barang</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        <span>Jumlah</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center justify-end space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <span>Harga Jual</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
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
                  <tr v-for="(product, index) in productList" :key="index" class="hover:bg-blue-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ product.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="text-sm font-medium text-gray-900">{{ product.quantity }}</span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <span class="text-sm font-bold text-gray-900">{{ formatCurrency(product.price) }}</span>
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <button 
                        @click="removeProduct(index)"
                        class="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Hapus produk"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="productList.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center space-y-3">
                        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        <div class="text-center">
                          <h3 class="text-sm font-medium text-gray-700 mb-1">Belum ada barang yang ditambahkan</h3>
                          <p class="text-xs text-gray-500">Pilih barang dari dropdown untuk menambahkan ke daftar penjualan</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="productList.length > 0" class="bg-gray-50">
                  <tr>
                    <td colspan="2" class="px-6 py-4 text-right font-semibold text-gray-700">Total Pemasukan:</td>
                    <td class="px-6 py-4 text-right font-bold text-lg text-gray-900">{{ formatCurrency(totalRevenue) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Ringkasan Penjualan</h3>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Total Items -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-700">Total Barang</p>
                  <p class="text-xs text-blue-600">{{ productList.length }} jenis barang</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-blue-800">{{ productList.reduce((sum, product) => sum + product.quantity, 0) }} item</p>
            </div>

            <!-- Total Revenue -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-green-700">Total Pemasukan</p>
                  <p class="text-xs text-green-600">Dari penjualan barang</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-green-800">{{ formatCurrency(totalRevenue) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';

// Router & Toast
const router = useRouter();
const toast = useToast();

// Form data
const formData = ref({
  projectName: '',
  projectClientId: '',
  projectType: false, // False for Sales
  projectStartDate: '',
  projectEndDate: '',
  projectDeliveryAddress: '',
  projectTotalPemasukkan: 0,
  projectUseResource: [] as Array<{ 
    resourceId: string,
    resourceStockUsed: number,
    sellPrice: number
  }>
});

// Client data
interface Client {
  id: string;
  name: string;
}

const clients = ref<Client[]>([]);

// Product data
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const availableProducts = ref<Product[]>([]);
const productList = ref<CartProduct[]>([]);
const selectedProduct = ref('');
const selectedQuantity = ref<number | null>(null);
const selectedPrice = ref(0);

// Computed values
const totalRevenue = computed(() => {
  return productList.value.reduce((sum, product) => sum + (product.price * product.quantity), 0);
});

// Watch selected product to update price
watch(selectedProduct, (newValue) => {
  if (newValue) {
    const product = availableProducts.value.find(p => p.id === newValue);
    if (product) {
      selectedPrice.value = product.price;
    } else {
      selectedPrice.value = 0;
    }
  } else {
    selectedPrice.value = 0;
  }
});

// Fetch clients from API
const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_URLS.PROFILE}/client/all`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    clients.value = response.data.data.map((client: {id: string; nameClient: string}) => ({
      id: client.id,
      name: client.nameClient
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error('Gagal mengambil data klien');
  }
};

// Fetch products (resources) from API
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URLS.RESOURCE}/resource/viewall`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Define interface for resource response
    interface ResourceResponse {
      id: string;
      resourceName: string;
      resourcePrice?: number;
      resourceStock?: number;
    }
    
    // Assuming the API returns resources with this structure
    availableProducts.value = response.data.data.map((resource: ResourceResponse) => ({
      id: resource.id,
      name: resource.resourceName,
      price: resource.resourcePrice, 
      stock: resource.resourceStock 
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Gagal mengambil data produk');

  }
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Add product to cart
const addProduct = () => {
  if (!selectedProduct.value || !selectedQuantity.value) {
    toast.error('Pilih nama barang dan jumlah terlebih dahulu');
    return;
  }
  
  const product = availableProducts.value.find(p => p.id === selectedProduct.value);
  
  if (!product) {
    toast.error('Barang tidak ditemukan');
    return;
  }
  
  if (selectedQuantity.value <= 0) {
    toast.error('Jumlah harus lebih dari 0');
    return;
  }
  
  if (selectedQuantity.value > product.stock) {
    toast.error(`Stok barang tidak cukup. Sisa stok: ${product.stock}`);
    return;
  }
  
  // Check if product already exists in cart
  const existingIndex = productList.value.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    // Update existing product
    const newQuantity = productList.value[existingIndex].quantity + selectedQuantity.value;
    
    if (newQuantity > product.stock) {
      toast.error(`Stok barang tidak cukup. Sisa stok: ${product.stock}`);
      return;
    }
    
    productList.value[existingIndex].quantity = newQuantity;
  } else {
    // Add new product
    productList.value.push({
      id: product.id,
      name: product.name,
      quantity: selectedQuantity.value,
      price: product.price
    });
  }
  
  // Update total in form data
  updateFormData();
  
  // Reset selection
  selectedProduct.value = '';
  selectedQuantity.value = null;
  selectedPrice.value = 0;
};

// Remove product from cart
const removeProduct = (index: number) => {
  productList.value.splice(index, 1);
  updateFormData();
};

// Update form data with current product list
const updateFormData = () => {
  formData.value.projectTotalPemasukkan = totalRevenue.value;
  formData.value.projectUseResource = productList.value.map(product => ({
    resourceId: product.id,
    resourceStockUsed: product.quantity,
    sellPrice: product.price
  }));
  
  // Store form data in localStorage for summary page
  localStorage.setItem('salesFormData', JSON.stringify(formData.value));
  localStorage.setItem('salesProductList', JSON.stringify(productList.value));
  localStorage.setItem('clientList', JSON.stringify(clients.value));
};

// Custom date input handler
const handleDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value.projectStartDate = target.value;
  }
};

// Form submission
const submitForm = async () => {
  // Basic validation
  if (!formData.value.projectName) {
    toast.error('Nama aktivitas harus diisi');
    return;
  }
  
  if (!formData.value.projectClientId) {
    toast.error('Klien harus dipilih');
    return;
  }
  
  if (!formData.value.projectStartDate) {
    toast.error('Tanggal mulai harus diisi');
    return;
  }
  
  if (productList.value.length === 0) {
    toast.error('Minimal satu barang harus ditambahkan');
    return;
  }
  
  // Ensure end date is same as start date for sales projects
  formData.value.projectEndDate = formData.value.projectStartDate;
  
  // Adjust dates to avoid timezone issues
  if (formData.value.projectStartDate) {
    // Add 'T12:00:00' to ensure it's noon and won't shift days due to timezone
    if (!formData.value.projectStartDate.includes('T')) {
      formData.value.projectStartDate = `${formData.value.projectStartDate}T12:00:00`;
    }
  }
  if (formData.value.projectEndDate) {
    // Add 'T12:00:00' to ensure it's noon and won't shift days due to timezone
    if (!formData.value.projectEndDate.includes('T')) {
      formData.value.projectEndDate = `${formData.value.projectEndDate}T12:00:00`;
    }
  }
  
  if (formData.value.projectEndDate && formData.value.projectStartDate && formData.value.projectEndDate < formData.value.projectStartDate) {
    console.log(formData.value.projectEndDate, formData.value.projectStartDate);
    toast.error('Tanggal akhir harus lebih dari tanggal mulai');
    return;
  }

  
  // Update form data before submitting
  updateFormData();
  
  try {
    // Navigate to summary page instead of submitting directly
    router.push('/project/add/sales-summary');
  } catch (error) {
    console.error('Error navigating to summary page:', error);
    toast.error('Terjadi kesalahan. Silahkan coba lagi.');
  }
};

// Load data on component mount
onMounted(() => {
  fetchClients();
  fetchProducts();
  
  // Check for saved form data
  const savedData = localStorage.getItem('salesFormData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      formData.value = { ...formData.value, ...parsedData };
      
      // Restore product list if available
      if (parsedData.projectUseResource && Array.isArray(parsedData.projectUseResource)) {
        // We'd need to fetch full product details to reconstruct the product list
        // This is simplified for now
      }
    } catch (error) {
      console.error('Error parsing saved form data:', error);
    }
  }
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
button, input, textarea, select {
    transition: all 0.2s ease;
}

/* Input focus effects */
input:focus, select:focus, textarea:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

/* Responsive design */
@media (max-width: 1024px) {
    .grid-cols-1.lg\\:grid-cols-2 {
        grid-template-columns: 1fr;
    }
    
    .grid-cols-1.lg\\:grid-cols-4 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .grid-cols-1.md\\:grid-cols-2,
    .grid-cols-1.md\\:grid-cols-4 {
        grid-template-columns: 1fr;
    }
    
    .px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .py-8 {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    
    .space-x-4 > * + * {
        margin-left: 0;
        margin-top: 1rem;
    }
    
    .flex-col {
        flex-direction: column;
    }
}

@media (max-width: 640px) {
    .text-2xl {
        font-size: 1.25rem;
        line-height: 1.75rem;
    }
    
    .text-xl {
        font-size: 1.125rem;
        line-height: 1.75rem;
    }
    
    .px-6 {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }
    
    .py-6 {
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
}

/* Modern gradient overlays */
.bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Focus ring improvements */
.focus\\:ring-2:focus {
    ring-width: 2px;
    ring-color: rgb(59 130 246 / 0.5);
}

/* Modern shadow effects */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>