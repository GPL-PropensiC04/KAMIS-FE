<script setup lang="ts">
    import { ref, watch } from "vue";
    import { useClientStore } from "@/stores/client";
    import VButton from "@/components/VButton.vue";
    import VDropDownInput from "@/components/VDropDownInput.vue";
    import { useRouter } from "vue-router";
    import { useToast } from "vue-toastification";
    import Breadcrumb from '@/components/Breadcrumb.vue'
    import VSuccessButton from "@/components/VSuccessButton.vue";

    const router = useRouter();
    const clientStore = useClientStore();
    const toast = useToast();

    // Form State
    const nameClient = ref("");
    const companyClient = ref("");
    const noTelpClient = ref("");
    const emailClient = ref("");
    const typeClientLabel = ref("Perusahaan");
    const addressClient = ref("");

    // Opsi Tipe Client
    const clientTypeOptions = ["Perusahaan", "Perorangan"];
    const getTypeClient = () => typeClientLabel.value === "Perusahaan";

    // Reset perusahaan jika tipe perorangan
    watch(typeClientLabel, (newVal) => {
        if (newVal === "Perorangan") {
            companyClient.value = "";
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

        if (getTypeClient() && !companyClient.value) {
            toast.error("Perusahaan asal harus diisi!");
            return;
        }

        const body = {
            nameClient: nameClient.value,
            noTelpClient: noTelpClient.value,
            emailClient: emailClient.value,
            typeClient: getTypeClient(),
            companyClient: companyClient.value,
            addressClient: addressClient.value,
        };

        await clientStore.addClient(body);
    };
</script>

<template>
    <Breadcrumb />
    <div class="min-h-screen bg-[#E5EAF2] p-6">
        <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">

            <div class="flex justify-between items-center mb-4">
                <!-- Tombol Back -->
                <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>

                <!-- Tombol Submit -->
                <div class="text-center">
                    <VSuccessButton label="Tambah" @click="handleSubmit" />
                </div>
            </div> 

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
                    <label class="block font-semibold mb-1">Perusahaan Asal</label>
                    <input 
                        v-model="companyClient" 
                        :disabled="typeClientLabel === 'Perorangan'"
                        :class="typeClientLabel === 'Perorangan' ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E5EAF2]'"
                        class="w-full p-2 border border-[#1E3A5F] rounded-md" 
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
                    <label class="block font-semibold mb-1">Tipe Klien</label>
                    <VDropDownInput 
                        v-model="typeClientLabel" 
                        :options="clientTypeOptions" 
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
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

* {
    font-family: 'Inter', sans-serif;
}
</style>
