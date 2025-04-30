<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSupplierStore } from "@/stores/supplier";
import { useResourceStore } from "@/stores/resource";
import VButton from "@/components/VButton.vue";
import VDropDownInput from "@/components/VDropDownInput.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { useToast } from "vue-toastification";
import type { UpdateSupplierRequestInterface } from "@/interfaces/profile/supplier.interface";

const router = useRouter();
const route = useRoute();
const supplierStore = useSupplierStore();
const resourceStore = useResourceStore();
const toast = useToast();

const supplierId = route.params.id as string;

// Form State
const nameSupplier = ref("");
const noTelpSupplier = ref("");
const emailSupplier = ref("");
const addressSupplier = ref("");

// Dropdown state
const selectedResourceName = ref("");
const selectedResourceId = ref<number | null>(null);
const selectedResourcePrice = ref<number | null>(null);

// Assigned resources
const assignedResources = ref<{ id: number; resourceName: string; resourcePrice: number }[]>([]);

// Fetch data on mount
onMounted(async () => {
  await supplierStore.getSupplierDetail(supplierId);
  await resourceStore.fetchResources();

  if (supplierStore.supplierDetail) {
    const detail = supplierStore.supplierDetail;
    nameSupplier.value = detail.supplierName;
    noTelpSupplier.value = detail.supplierPhone;
    emailSupplier.value = detail.supplierEmail;
    addressSupplier.value = detail.supplierAddress;
    assignedResources.value = detail.resources || [];
  } else {
    toast.error("Gagal memuat data supplier");
    router.back();
  }
});

// Computed options
const resourceOptions = computed(() => resourceStore.resources.map(res => res.resourceName));

// Handler saat pilih resource
function handleSelectResource(name: string) {
  const selected = resourceStore.resources.find(r => r.resourceName === name);
  if (selected) {
    selectedResourceId.value = selected.id ?? null;
    selectedResourcePrice.value = selected.resourcePrice;
    selectedResourceName.value = selected.resourceName;
  } else {
    selectedResourceId.value = null;
    selectedResourcePrice.value = null;
  }
}

// Tambahkan resource
function addResource() {
  if (!selectedResourceId.value) {
    toast.error("Silahkan pilih barang terlebih dahulu!");
    return;
  }

  const exists = assignedResources.value.some(r => r.id === selectedResourceId.value);
  if (exists) {
    toast.error("Barang sudah ditambahkan!");
    return;
  }

  assignedResources.value.push({
    id: selectedResourceId.value,
    resourceName: selectedResourceName.value,
    resourcePrice: selectedResourcePrice.value!,
  });

  selectedResourceName.value = "";
  selectedResourcePrice.value = null;
  selectedResourceId.value = null;
}

// Hapus resource
function removeResource(resourceId: number) {
  assignedResources.value = assignedResources.value.filter(r => r.id !== resourceId);
}

// Email validation
function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Submit update
async function handleUpdate() {
  if (!nameSupplier.value || !noTelpSupplier.value || !emailSupplier.value || !addressSupplier.value) {
    toast.error("Semua field harus diisi!");
    return;
  }
  if (!/^\d+$/.test(noTelpSupplier.value)) {
    toast.error("Nomor telepon hanya boleh angka!");
    return;
  }
  if (!isValidEmail(emailSupplier.value)) {
    toast.error("Format email tidak valid!");
    return;
  }

  const body: UpdateSupplierRequestInterface = {
    id: supplierId,
    nameSupplier: nameSupplier.value,
    noTelpSupplier: noTelpSupplier.value,
    emailSupplier: emailSupplier.value,
    addressSupplier: addressSupplier.value,
    resourceIds: assignedResources.value.map(res => res.id),
  };

  await supplierStore.updateSupplier(body);
}
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Tombol Kembali -->
      <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>

      <div class="flex justify-end mb-4">
        <VButton label="Update" @click="handleUpdate" />
      </div>

      <!-- Form Input -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block font-semibold mb-1">Nama PIC</label>
          <input v-model="nameSupplier" class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]" />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-400">Nama Perusahaan</label>
          <input 
            :value="supplierStore.supplierDetail?.supplierCompany || '-'" 
            disabled
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-gray-200 cursor-not-allowed" 
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
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
          <input v-model="emailSupplier" class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Alamat Perusahaan</label>
        <textarea v-model="addressSupplier" rows="3" class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]"></textarea>
      </div>

      <!-- Dropdown tambah resource -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block font-semibold mb-1">Nama Barang yang Dijual</label>
          <VDropDownInput v-model="selectedResourceName" :options="resourceOptions" @update:modelValue="handleSelectResource" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Harga Barang</label>
          <input
            :value="selectedResourcePrice !== null ? selectedResourcePrice.toLocaleString('id-ID') : ''"
            disabled
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-gray-200 cursor-not-allowed"
          />
        </div>
      </div>

      <div class="text-right mb-4">
        <VButton label="Tambah" @click="addResource" />
      </div>

      <!-- Tabel Resource -->
      <div class="overflow-x-auto">
        <table class="custom-table w-full">
          <thead class="bg-[#1E3A5F] text-white">
            <tr>
              <th class="px-4 py-2">Nama Barang</th>
              <th class="px-4 py-2">Harga Barang</th>
              <th class="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in assignedResources" :key="item.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-center">{{ item.resourceName }}</td>
              <td class="px-4 py-2 text-center">Rp{{ item.resourcePrice.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-2 text-center">
                <button @click="removeResource(item.id)" class="text-red-600 font-bold">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-table th, .custom-table td {
  text-align: center;
  padding: 12px;
}
</style>
