import { defineStore } from 'pinia';
import axios from 'axios';
import type { ProjectInterface, ListProjectResponseInterface, UpdateProjectStatusInterface, UpdateProjectPaymentStatusInterface } from '@/interfaces/project/project.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import { API_URLS } from '@/config/api.config';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: [] as ProjectInterface[],
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async fetchProjects(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get<ListProjectResponseInterface>(
                    `${API_URLS.PROJECT}/project/all`,
                    { 
                        params: filters,
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );
                this.projects = response.data.data || [];

            } catch (error: unknown) {
                const err = error as Error | { response?: { data?: { message?: string }, status?: number } };
                
                // Handle 404 Not Found as an empty result rather than an error
                if ('response' in err && err.response?.status === 404) {
                    this.projects = [];
                    return;
                }
                
                // For other errors, show error message
                this.error = err instanceof Error ? err.message : 'Failed to fetch projects';
                const errorMessage = 'response' in err && err.response?.data?.message 
                    ? err.response.data.message 
                    : 'Failed to fetch projects';
                useToast().error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async fetchProjectById(id: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get<CommonResponseInterface<ProjectInterface>>(
                    `${API_URLS.PROJECT}/project/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );
                return response.data.data;
            } catch (error: unknown) {
                const err = error as Error | { response?: { data?: { message?: string } } };
                this.error = err instanceof Error ? err.message : 'Failed to fetch project by ID';
                const errorMessage = 'response' in err && err.response?.data?.message 
                    ? err.response.data.message 
                    : 'Failed to fetch project by ID';
                useToast().error(errorMessage);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProjectStatus(id: string, projectStatus: number) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put<CommonResponseInterface<UpdateProjectStatusInterface>>(
                    `${API_URLS.PROJECT}/project/update-status/${id}`,
                    { projectStatus },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    const updated = response.data.data;
                    // Update project in state
                    const index = this.projects.findIndex(proj => proj.id === id);
                    if (index !== -1) {
                        this.projects[index] = { ...this.projects[index], ...updated };
                    }
                    useToast().success('Status proyek berhasil diperbarui!');
                    return updated;
                }
            } catch (error: unknown) {
                const err = error as Error | { response?: { data?: { message?: string } } };
                this.error = err instanceof Error ? err.message : 'Terjadi kesalahan saat update status proyek';
                const errorMessage = 'response' in err && err.response?.data?.message 
                    ? err.response.data.message 
                    : 'Terjadi kesalahan saat update status proyek';
                useToast().error(errorMessage);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateProjectPayment(id: string, projectPaymentStatus: number) {
            this.loading = true;
            this.error = null;
            
            try {
              const response = await axios.put<CommonResponseInterface<UpdateProjectPaymentStatusInterface>>(
                `${API_URLS.PROJECT}/project/update-payment/${id}`,
                { projectPaymentStatus },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                }
              );
          
              if (response.data.status === 200) {
                const updated = response.data.data;
                // Update project in state if it exists
                const index = this.projects.findIndex(proj => proj.id === id);
                if (index !== -1) {
                    this.projects[index] = { ...this.projects[index], ...updated };
                }
                useToast().success('Status pembayaran berhasil diperbarui!');
                return updated;
              }
            } catch (error: unknown) {
              const err = error as Error | { response?: { data?: { message?: string } } };
              this.error = err instanceof Error ? err.message : 'Terjadi kesalahan saat update status pembayaran';
              const errorMessage = 'response' in err && err.response?.data?.message 
                ? err.response.data.message 
                : 'Terjadi kesalahan saat update status pembayaran';
              useToast().error(errorMessage);
              throw error;
            } finally {
              this.loading = false;
            }
          },
    },
    getters: {
        getProjectById: (state) => (id: string) => {
            return state.projects.find(project => project.id === id);
        },
        getPenjualanProjects: (state) => {
            return state.projects.filter(project => project.projectType === false);
        },
        getPengirimanProjects: (state) => {
            return state.projects.filter(project => project.projectType === true);
        }
    }
});
