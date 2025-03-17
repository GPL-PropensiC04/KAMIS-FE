<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VOptionInput from "@/components/VOptionInput.vue";
import VButton from "@/components/VButton.vue";

const router = useRouter();
const purchaseStore = usePurchaseStore();

// Data form
const supplierOptions = ["Supplier A", "Supplier B", "Supplier C"];
const selectedSupplier = ref("");
const selectedType = ref("Aset");

// Fungsi untuk menangani tombol "Selanjutnya"
const handleNext = () => {
  if (!selectedSupplier.value) {
    alert("Silakan pilih Supplier terlebih dahulu!");
    return;
  }

  const purchaseType = selectedType.value === "Resource"; // Resource = true, Aset = false

  // Simpan data sementara di store sebelum berpindah halaman
  purchaseStore.$patch({
    draftPurchase: {
      purchaseSupplier: selectedSupplier.value,
      purchaseType,
    },
  });

  // Arahkan ke halaman berikutnya
  router.push("/add-purchase-resource");
};
</script>

<template>
  <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
    <div class="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
      <!-- Tombol Back -->
      <button @click="router.back()" class="hover:underline flex items-center mb-4 text-[28px]">
        ←
      </button>

      <div class="grid grid-cols-2 gap-4">
        <!-- Dropdown Supplier -->
        <div>
          <label class="block mb-1 font-lato font-bold">
            Supplier
          </label>
          <VDropDownInput v-model="selectedSupplier" :options="supplierOptions" />
        </div>

        <!-- Pilihan Tipe Barang -->
        <div>
          <label class="block mb-1 font-lato font-bold">
            Tipe Barang
          </label>
          <VOptionInput :options="['Aset', 'Resource']" v-model="selectedType" />
        </div>
      </div>

      <!-- Tombol Selanjutnya -->
      <div class="flex justify-center mt-6">
        <VButton label="Selanjutnya" @click="handleNext" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Menggunakan font Lato */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

.font-lato {
  font-family: 'Lato', sans-serif;
}
</style>
