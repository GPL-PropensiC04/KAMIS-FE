<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useSupplierStore } from "@/stores/supplier.ts";
import { useResourceStore } from "@/stores/resource.ts";
import VButton from "@/components/VButton.vue";
import VDropDownInput from "@/components/VDropDownInput.vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/Breadcrumb.vue";

const router = useRouter();
const supplierStore = useSupplierStore();
const resourceStore = useResourceStore();
const toast = useToast();

// Form State
const nameSupplier = ref("");
const companySupplier = ref("");
const noTelpSupplier = ref("");
const emailSupplier = ref("");
const addressSupplier = ref("");

// Resource selection
const selectedResourceName = ref(""); 
const selectedResourcePrice = ref<number | null>(null);
const selectedResourceId = ref<number | null>(null);

const resources = ref<{ id: number; resourceName: string; resourcePrice: number }[]>([]);

// Fetch resources saat mounted
onMounted(async () => {
  await resourceStore.fetchResources();
});

// Build options dari resourceStore
const resourceOptions = computed(() => {
  return resourceStore.resources.map((resource) => resource.resourceName);
});

// Saat pilih barang
const handleSelectResource = (name: string) => {
  const selected = resourceStore.resources.find((r) => r.resourceName === name);
  if (selected) {
    selectedResourceId.value = selected.id;
    selectedResourcePrice.value = selected.resourcePrice;
    selectedResourceName.value = selected.resourceName;
  }
};

// Tambahkan barang ke tabel
const addResource = () => {
  if (selectedResourceId.value === null || selectedResourcePrice.value === null) {
    toast.error("Pilih barang dan pastikan harga valid!");
    return;
  }

  const exists = resources.value.some((r) => r.id === selectedResourceId.value);
  if (exists) {
    toast.error("Barang sudah ditambahkan!");
    return;
  }

  resources.value.push({
    id: selectedResourceId.value,
    resourceName: selectedResourceName.value,
    resourcePrice: selectedResourcePrice.value,
  });

  selectedResourceName.value = "";
  selectedResourcePrice.value = null;
  selectedResourceId.value = null;
};

// Hapus barang
const removeResource = (index: number) => {
  resources.value.splice(index, 1);
};

// Validasi Email
const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Submit form
const handleSubmit = async () => {
  if (!nameSupplier.value || !noTelpSupplier.value || !emailSupplier.value || !addressSupplier.value || !companySupplier.value) {
    toast.error("Harap isi semua field dengan benar!");
    return;
  }

  if (!/^\d+$/.test(noTelpSupplier.value)) {
    toast.error("Nomor telepon hanya boleh berisi angka!");
    return;
  }

  if (!isValidEmail(emailSupplier.value)) {
    toast.error("Format email tidak valid!");
    return;
  }

  const body = {
    nameSupplier: nameSupplier.value,
    noTelpSupplier: noTelpSupplier.value,
    emailSupplier: emailSupplier.value,
    companySupplier: companySupplier.value,
    addressSupplier: addressSupplier.value,
    resourceIds: resources.value.map((r) => r.id),
  };

  await supplierStore.addSupplier(body);
};
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Tombol Back -->
      <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>

      <h1 class="text-2xl font-bold mb-6">Menambahkan Supplier</h1>

      <!-- Form Input Supplier -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block font-semibold mb-1">Nama PIC</label>
          <input 
            v-model="nameSupplier" 
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Nama Perusahaan</label>
          <input 
            v-model="companySupplier" 
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Nomor Telepon</label>
          <input 
            v-model="noTelpSupplier" 
            inputmode="numeric"
            pattern="[0-9]*"
            @input="noTelpSupplier = noTelpSupplier.replace(/\D/g, '')"
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Email</label>
          <input 
            v-model="emailSupplier" 
            type="email"
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]"
          />
        </div>
      </div>

      <!-- Alamat Perusahaan -->
      <div class="mb-6">
        <label class="block font-semibold mb-1">Alamat Perusahaan</label>
        <textarea 
          v-model="addressSupplier"
          rows="4"
          class="w-full border border-[#1E3A5F] p-2 rounded-md bg-[#E5EAF2]"
        ></textarea>
      </div>

      <!-- Section Tambah Barang -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block font-semibold mb-1">Nama Barang yang Dijual</label>
          <VDropDownInput 
            v-model="selectedResourceName"
            :options="resourceOptions"
            @update:modelValue="handleSelectResource"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Harga Barang</label>
          <input 
            :value="selectedResourcePrice !== null ? selectedResourcePrice.toLocaleString('id-ID') : ''"
            disabled
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-gray-200"
          />
        </div>
      </div>

      <div class="text-right mb-6">
        <VButton label="Tambah Barang" @click="addResource" />
      </div>

      <!-- Tabel Barang yang Ditambahkan -->
      <div class="overflow-x-auto mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-[#1E3A5F] text-white">
              <th class="py-2 px-4 border">Nama Barang</th>
              <th class="py-2 px-4 border">Harga Barang</th>
              <th class="py-2 px-4 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(resource, index) in resources" :key="index" class="text-center">
              <td class="py-2 px-4 border">{{ resource.resourceName }}</td>
              <td class="py-2 px-4 border">Rp{{ resource.resourcePrice.toLocaleString('id-ID') }}</td>
              <td class="py-2 px-4 border">
                <button @click="removeResource(index)" class="text-red-500 hover:underline">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tombol Submit -->
      <div class="text-center">
        <VButton label="Tambah Supplier" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}
</style>
