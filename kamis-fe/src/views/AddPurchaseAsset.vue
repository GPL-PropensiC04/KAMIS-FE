<script setup lang="ts">
import VUploadPhoto from '../components/VUploadPhoto.vue'
import VTextBox from '../components/VTextBox.vue'
import VTextArea from '../components/VTextArea.vue'
import VPriceInput from '../components/VPriceInput.vue'
import VDropDownInput from '../components/VDropDownInput.vue'
import VSuccessButton from '../components/VSuccessButton.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetTempStore } from '@/stores/assetTemp'
import { useToast } from 'vue-toastification'

const assetName = ref('');
const assetDescription = ref('');
const assetType = ref('');
const assetPrice = ref(0);
const foto = ref<File | null>(null);
const toast = useToast();

const router = useRouter();
const assetTempStore = useAssetTempStore();

const isFormValid = computed(() => {
  return assetName.value.trim() !== '' && 
         assetDescription.value.trim() !== '' && 
         assetType.value !== '' && 
         assetPrice.value > 0 && 
         foto.value !== null;
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Harap isi semua field sebelum submit!');
    return;
  }

  try {
    assetTempStore.setDraftAssetTemp({
      ...assetTempStore.draftAssetTemp,
      assetName: assetName.value,
      assetDescription: assetDescription.value,
      assetType: assetType.value,
      assetPrice: assetPrice.value
    });
    
    console.log('Draft asset stored, navigating to summary');
    router.push('/purchase/add/asset-summary');
  } catch (error) {
    console.error('Error submitting asset:', error);
  }
};

// Add a file change handler function
const handleFileChange = (file: File) => {
  console.log('File received:', file);
  foto.value = file;
  
  // Generate preview using FileReader
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    
    // Store only metadata in localStorage, not the image itself
    assetTempStore.setDraftAssetTemp({
      ...assetTempStore.draftAssetTemp,
      fileName: foto.value?.name,
      fileSize: foto.value?.size,
      contentType: foto.value?.type,
      // Don't store imageBase64 in localStorage - it's too large
      hasImage: true // Just a flag to indicate an image exists
    });
    
    // Store the actual image data only in sessionStorage
    sessionStorage.setItem('tempFileData', base64String);
    console.log(`Image stored in sessionStorage (${Math.round((base64String.length * 0.75) / 1024)} KB)`);
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="p-6">
    <div class="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div class="grid grid-cols-2 gap-4">
        <!-- Upload Foto Aset Besar dan Centered -->
        <div class="col-span-2 flex justify-center">
          <div class="w-full max-w-md">
            <VUploadPhoto class="w-full h-48" @file-change="handleFileChange" />
          </div>
        </div>

        <!-- Debugging info -->
        <div v-if="foto" class="col-span-2 text-xs text-gray-500">
          File selected: {{ foto.name }} ({{ Math.round(foto.size / 1024) }} KB)
        </div>

        <!-- Nama Aset -->
        <div>
          <label class="block mb-1 font-medium text-gray-700">Nama Aset</label>
          <VTextBox v-model="assetName" placeholder="Nama Aset" class="w-full" />
        </div>

        <!-- Deskripsi Aset -->
        <div>
          <label class="block mb-1 font-medium text-gray-700">Deskripsi Aset</label>
          <VTextArea v-model="assetDescription" placeholder="Deskripsi Aset" class="w-full h-32" />
        </div>

        <!-- Jenis Aset -->
        <div>
          <label class="block mb-1 font-medium text-gray-700">Jenis Aset</label>
          <VDropDownInput 
            v-model="assetType" 
            :options="['Truk', 'Mobil', 'Pickup']" 
            placeholder="Pilih Jenis Aset" 
            class="w-full"
          />
        </div>

        <!-- Nilai Perolehan -->
        <div>
          <label class="block mb-1 font-medium text-gray-700">Nilai Perolehan</label>
          <VPriceInput v-model="assetPrice" placeholder="Rp0,00" class="w-full" />
        </div>

        <!-- Tombol Submit -->
        <div class="col-span-2 flex justify-center mt-4">
          <VSuccessButton label="Tambah" @click="handleSubmit" />
        </div>
      </div>
    </div>
  </div>
</template>