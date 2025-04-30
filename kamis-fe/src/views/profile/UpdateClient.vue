<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClientStore } from "@/stores/client";
import VButton from "@/components/VButton.vue";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/Breadcrumb.vue";

const router = useRouter();
const route = useRoute();
const clientStore = useClientStore();
const toast = useToast();

const id = route.params.id as string;

// Form State
const nameClient = ref("");
const noTelpClient = ref("");
const emailClient = ref("");
const addressClient = ref("");

// Fetch client data on mount
onMounted(async () => {
  const detail = await clientStore.getClientDetail(id);
  if (detail) {
    nameClient.value = detail.nameClient;
    noTelpClient.value = detail.noTelpClient;
    emailClient.value = detail.emailClient;
    addressClient.value = detail.addressClient;
  } else {
    toast.error("Gagal mengambil data klien!");
    router.back();
  }
});

// Validasi Email Format
const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Submit Handler
const handleSubmit = async () => {
  if (!nameClient.value || !noTelpClient.value || !emailClient.value || !addressClient.value) {
    toast.error("Harap isi semua field dengan benar!");
    return;
  }

  if (!/^\d+$/.test(noTelpClient.value)) {
    toast.error("Nomor telepon hanya boleh berisi angka!");
    return;
  }

  if (!isValidEmail(emailClient.value)) {
    toast.error("Format email tidak valid!");
    return;
  }

  const body = {
    nameClient: nameClient.value,
    noTelpClient: noTelpClient.value,
    emailClient: emailClient.value,
    addressClient: addressClient.value,
  };

  await clientStore.updateClient(body, id);
};
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Tombol Back -->
      <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>

      <!-- Form Input -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block font-semibold mb-1">Nama Klien</label>
          <input 
            v-model="nameClient" 
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]" 
          />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-400">Perusahaan Asal</label>
          <input 
            :value="clientStore.clientDetail?.companyClient || '-'" 
            disabled
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-gray-200 cursor-not-allowed" 
          />
        </div>
      </div>

      <!-- Baris sejajar untuk 3 field -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block font-semibold mb-1">Nomor Telepon</label>
          <input 
            v-model="noTelpClient" 
            inputmode="numeric"
            pattern="[0-9]*"
            @input="noTelpClient = noTelpClient.replace(/\D/g, '')"
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]" 
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Email</label>
          <input 
            v-model="emailClient" 
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-[#E5EAF2]" 
          />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-400">Tipe Klien</label>
          <input 
            :value="clientStore.clientDetail?.typeClient === 'true' ? 'Perusahaan' : 'Perorangan'" 
            disabled
            class="w-full p-2 border border-[#1E3A5F] rounded-md bg-gray-200 cursor-not-allowed" 
          />
        </div>
      </div>

      <!-- Alamat -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">Alamat Perusahaan/Klien</label>
        <textarea 
          v-model="addressClient"
          rows="4"
          class="w-full border border-[#1E3A5F] p-2 rounded-md bg-[#E5EAF2]"
        ></textarea>
      </div>

      <!-- Tombol Submit -->
      <div class="text-center">
        <VButton label="Simpan Perubahan" @click="handleSubmit" />
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