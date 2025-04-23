import { API_URLS } from "@/config/api.config";
import type { AddClientRequestInterface, ClientInterface } from "@/interfaces/client.interface";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import router from "@/router";
import axios from "axios";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [] as ClientInterface[],
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async addClient(body: AddClientRequestInterface) {
            this.loading = true;
            this.error = null;
          
            try {
                const response = await axios.post<CommonResponseInterface<ClientInterface>>(
                    `${API_URLS.PROFILE}/client/add`, 
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    this.clients.push(response.data.data);
                    useToast().success('Client berhasil ditambahkan!');
                    await router.push('/client');
                }
            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan client';
                useToast().error(error.response.data.message);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});