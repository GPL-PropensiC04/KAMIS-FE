import { defineStore } from 'pinia';
import axios from 'axios';
import type { ResourceInterface, AddResourceRequestInterface, ResourceResponseInterface } from '@/interfaces/resource.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import router from '@/router';

export const useResourceStore = defineStore('resource', {
    state: () => ({
        resources: [] as ResourceInterface[],
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async fetchResources() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await axios.get<CommonResponseInterface<ResourceInterface[]>>(
                    'http://localhost:8085/api/resource/all',
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );
                this.resources = response.data.data;
                
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Failed to fetch resources';
                useToast().error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async addResource(body: AddResourceRequestInterface) {
            this.loading = true;
            this.error = null;
          
            try {
                const response = await axios.post<ResourceResponseInterface>(
                    'http://localhost:8085/api/resource/add', 
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
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan resource';
                useToast().error(this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
