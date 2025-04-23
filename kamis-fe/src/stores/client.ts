import { API_URLS } from "@/config/api.config";
<<<<<<< HEAD
import type { AddClientRequestInterface, ClientInterface, ClientListResponseInterface, ClientDetailInterface } from "@/interfaces/client.interface";
=======
import type { AddClientRequestInterface, ClientInterface, ClientListResponseInterface } from "@/interfaces/client.interface";
>>>>>>> a1332d7e74fec308ab94fedef1cc9f1517d7d789
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import router from "@/router";
import axios from "axios";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [] as ClientInterface[],
        clientList : [] as ClientListResponseInterface[],
<<<<<<< HEAD
        clientDetail : null as ClientDetailInterface | null,
=======
>>>>>>> a1332d7e74fec308ab94fedef1cc9f1517d7d789
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
        },

        async viewAllClient(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get<CommonResponseInterface<ClientListResponseInterface[]>>(
                    `${API_URLS.PROFILE}/client/all`,
                    { params: filters }
                );
                this.clientList = response.data.data;
            } catch (err: unknown) {
                this.error = `Gagal mengambil data client ${err instanceof Error ? err.message : "Unknown error"}`;
                useToast().error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async getClientDetail(id: string) {
            this.loading = true;
            this.error = null;
            this.clientDetail = null;
            try {
                const response = await axios.get<CommonResponseInterface<ClientDetailInterface>>(
                    `${API_URLS.PROFILE}/client/${id}`
                );
                this.clientDetail = response.data.data;
                return this.clientDetail;
            } catch (err: unknown) {
                this.error = `Gagal mengambil detail client ${err instanceof Error ? err.message : "Unknown error"}`;
                useToast().error(this.error);
                return null;
            } finally {
                this.loading = false;
            }
        },
    }
});