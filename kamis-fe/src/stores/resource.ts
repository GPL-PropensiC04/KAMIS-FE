import { defineStore } from 'pinia';
import axios from 'axios';
import type { ResourceInterface, AddResourceRequestInterface, ResourceResponseInterface } from '@/interfaces/resource/resource.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import router from '@/router';
import { API_URLS } from '@/config/api.config';
export const useResourceStore = defineStore('resource', {
    state: () => ({
        resources: [] as ResourceInterface[],
        isLoading: false,
        currentPage: 0,
        totalPages: 0,
        pageSize: 10,
        allResourcesForSales: [] as ResourceInterface[],
        isLoadingAllForSales: false,
        loading: false,
        error: null as null | string,
        draftAddResource: (() => {
            const savedData = localStorage.getItem("draftAddResource");
            return savedData ? JSON.parse(savedData) : null;
        })(),
    }),
    actions: {

        setDraftAddResource(data: ResourceInterface) {
            this.draftAddResource = data;
            localStorage.setItem("draftAddResource", JSON.stringify(data)); // Simpan ke localStorage
        },

        clearDraftAddResource() {
            this.draftAddResource = null;
            localStorage.removeItem("draftAddResource"); // Hapus dari localStorage
        },
        async fetchResources() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get<CommonResponseInterface<ResourceInterface[]>>(
                    `${API_URLS.RESOURCE}/resource/viewall`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );
                this.resources = response.data.data;

            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Failed to fetch resources';
                useToast().error(error.response.data.message);
            } finally {
                this.loading = false;
            }
        },

        async addResource(body: AddResourceRequestInterface) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post<ResourceResponseInterface>(
                    `${API_URLS.RESOURCE}/resource/add`,
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    this.resources.push(response.data.data);
                    useToast().success('Resource berhasil ditambahkan!');
                    await router.push('/resource');
                }
            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan resource';
                useToast().error(error.response.data.message);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async viewAllResourcesWithPagination(page: number, size: number = 10) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(`${API_URLS.RESOURCE}/resource/viewall/paginated`, {
                    params: { page, size },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                const data = response.data.data;
                this.resources = data.content;
                this.currentPage = data.number;
                this.totalPages = data.totalPages;
                this.pageSize = data.size;
            } catch (err) {
                console.error('Error fetching paginated resources:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },


        async fetchResourceById(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get<CommonResponseInterface<ResourceInterface>>(
                    `${API_URLS.RESOURCE}/resource/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );
                return response.data.data;
            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Failed to fetch resource by ID';
                useToast().error(error.response.data.message);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateResource(id: number, body: Partial<ResourceInterface>) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put<ResourceResponseInterface>(
                    `${API_URLS.RESOURCE}/resource/update/${id}`,
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    const updated = response.data.data;
                    const index = this.resources.findIndex(res => res.id === id);
                    if (index !== -1) {
                        this.resources[index] = updated;
                    }
                    useToast().success('Resource berhasil diupdate!');
                    await router.push('/resource');
                }
            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Terjadi kesalahan saat update resource';
                useToast().error(error.response.data.message);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addResourceToDbById(id: number, stockUpdate: number) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put<ResourceResponseInterface>(
                    `${API_URLS.RESOURCE}/resource/addToDb/${id}/${stockUpdate}`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    const updatedResource = response.data.data;
                    const index = this.resources.findIndex(res => res.id === id);
                    if (index !== -1) {
                        this.resources[index] = updatedResource;
                    }
                    useToast().success('Stock resource berhasil ditambahkan ke database!');
                    return updatedResource;
                }
            } catch (error: any) {
                this.error = error instanceof Error ? error.message : 'Gagal menambahkan resource ke DB';
                useToast().error(error.response.data.message);
                throw error;
            } finally {
                this.loading = false;
            }
        },
    }
});