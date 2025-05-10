import { API_URLS } from "@/config/api.config";
import type { AddClientRequestInterface, ClientInterface, ClientListResponseInterface, ClientDetailInterface, UpdateClientInterface, PageResponseInterface } from "@/interfaces/profile/client.interface";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import router from "@/router";
import axios from "axios";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [] as ClientInterface[],
        clientList: [] as ClientListResponseInterface[],
        clientDetail: null as ClientDetailInterface | null,
        loading: false,
        error: null as null | string,
        pagination: {
            currentPage: 0,
            pageSize: 10,
            totalPages: 0,
            totalElements: 0,
            isLastPage: false
        }
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

        async viewAllClient(filters = {}, page = 0, size = 10) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get<CommonResponseInterface<PageResponseInterface<ClientListResponseInterface>>>(
                    `${API_URLS.PROFILE}/client/all`,
                    { 
                        params: { 
                            ...filters,
                            page,
                            size
                        } 
                    }
                );
                
                // Update client list with paginated data
                this.clientList = response.data.data.content;
                
                // Update pagination state
                this.pagination = {
                    currentPage: response.data.data.pageNumber,
                    pageSize: response.data.data.pageSize,
                    totalPages: response.data.data.totalPages,
                    totalElements: response.data.data.totalElements,
                    isLastPage: response.data.data.last
                };
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

        async updateClient(body: UpdateClientInterface, id: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put<CommonResponseInterface<ClientInterface>>(
                    `${API_URLS.PROFILE}/client/update/${id}`,
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
                if (response.data.status === 200) {
                    this.clients.push(response.data.data)
                    useToast().success('Sukses mengedit klien!');
                    await router.push(`/client`)
                };
            } catch (err: unknown) {
                this.error = `Gagal mengedit klien ${err instanceof Error ? err.message : `Unknown Error`}`;
                useToast().error(this.error);
            } finally {
                this.loading = false;
            }
        },
    }
});