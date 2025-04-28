import { defineStore } from 'pinia';
import axios from 'axios';
import type { 
    ProjectInterface, 
    ListProjectResponseInterface, 
    AddProjectRequestDTO, 
    DistributionFormData,
    SalesFormData,
    AssetUsageDTO,
    ResourceUsageDTO
} from '@/interfaces/project/project.interface';
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
                const response = await axios.put<CommonResponseInterface<ProjectInterface>>(
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
                        this.projects[index] = updated;
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

        async addDistributionProject(formData: DistributionFormData) {
            this.loading = true;
            this.error = null;

            try {
                // Map form data to request DTO
                const assetUsage: AssetUsageDTO[] = formData.projectUseAsset.map(asset => {
                    // Get the asset from form data
                    return {
                        platNomor: asset.platNomor,
                        // Add any additional fields if they exist in the form data
                        assetUseCost: 'assetUseCost' in asset ? asset.assetUseCost : 0,
                        assetFuelCost: 'assetFuelCost' in asset ? asset.assetFuelCost : 0
                    }
                });

                const requestData: AddProjectRequestDTO = {
                    projectType: true, // Distribution project
                    projectName: formData.projectName,
                    projectClientId: formData.projectClientId,
                    projectDeliveryAddress: formData.projectDeliveryAddress,
                    projectPickupAddress: formData.projectPickupAddress,
                    projectPHLCount: formData.projectPHLCount,
                    projectPHLPay: formData.projectPHLPay,
                    projectStartDate: formData.projectStartDate,
                    projectEndDate: formData.projectEndDate,
                    projectTotalPemasukkan: formData.projectTotalPemasukkan,
                    projectTotalPengeluaran: formData.projectTotalPengeluaran,
                    projectUseAsset: assetUsage
                };

                const response = await axios.post<CommonResponseInterface<ProjectInterface>>(
                    `${API_URLS.PROJECT}/project/add`,
                    requestData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    useToast().success('Proyek distribusi berhasil dibuat!');
                    return response.data.data;
                }
            } catch (error: unknown) {
                const err = error as Error | { response?: { data?: { message?: string } } };
                this.error = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat proyek distribusi';
                const errorMessage = 'response' in err && err.response?.data?.message 
                    ? err.response.data.message 
                    : 'Terjadi kesalahan saat membuat proyek distribusi';
                useToast().error(errorMessage);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addSalesProject(formData: SalesFormData) {
            this.loading = true;
            this.error = null;

            try {
                // Map form data to request DTO
                const resourceUsage: ResourceUsageDTO[] = formData.projectUseResource.map(resource => {
                    // Map to the required format
                    return {
                        resourceId: resource.resourceId,
                        sellPrice: resource.sellPrice,
                        resourceStockUsed: resource.resourceStockUsed
                    }
                });

                const requestData: AddProjectRequestDTO = {
                    projectType: false, // Sales project
                    projectName: formData.projectName,
                    projectClientId: formData.projectClientId,
                    projectDeliveryAddress: formData.projectDeliveryAddress,
                    projectStartDate: formData.projectStartDate,
                    projectEndDate: formData.projectEndDate,
                    projectTotalPemasukkan: formData.projectTotalPemasukkan,
                    projectUseResource: resourceUsage
                };

                const response = await axios.post<CommonResponseInterface<ProjectInterface>>(
                    `${API_URLS.PROJECT}/project/add`,
                    requestData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    useToast().success('Proyek penjualan berhasil dibuat!');
                    return response.data.data;
                }
            } catch (error: unknown) {
                const err = error as Error | { response?: { data?: { message?: string } } };
                this.error = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat proyek penjualan';
                const errorMessage = 'response' in err && err.response?.data?.message 
                    ? err.response.data.message 
                    : 'Terjadi kesalahan saat membuat proyek penjualan';
                useToast().error(errorMessage);
                throw error;
            } finally {
                this.loading = false;
            }
        }
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
