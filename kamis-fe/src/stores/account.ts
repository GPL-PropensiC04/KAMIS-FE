import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import { API_URLS } from '@/config/api.config';
import type { AccountInterface, AddAccountInterface, UpdateAccountInterface } from '@/interfaces/profile/account.interface';


export const useAccountStore = defineStore('account', () => {
    const toast = useToast();
    const loading = ref(false);
    const error = ref<string | null>(null);
    const accounts = ref<AccountInterface[]>([]);
    const currentUser = ref<AccountInterface | null>(null);

    async function getAllAccounts() {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await axios.get<CommonResponseInterface<AccountInterface[]>>(
                `${API_URLS.PROFILE}/profile/all`
            );
            
            accounts.value = response.data.data || [];
            return accounts.value;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch accounts';
            toast.error(error.value);
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function addAccount(accountData: AddAccountInterface) {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await axios.post<CommonResponseInterface<AddAccountInterface>>(
                `${API_URLS.PROFILE}/profile/add`,
                accountData
            );
            
            toast.success('Account added successfully');
            await getAllAccounts();
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to add account';
            toast.error(error.value);
            throw error.value;
        } finally {
            loading.value = false;
        }
    }
    
        // Update an account
        async function updateAccount(accountEmail: string, accountData: UpdateAccountInterface) {
            loading.value = true;
            error.value = null;
            
            try {
                const response = await axios.put<CommonResponseInterface<AccountInterface>>(
                    `${API_URLS.PROFILE}/profile/${accountEmail}`,
                    accountData
                );
                
                toast.success('Account updated successfully');
                
                // If current user is updating their own profile, update local state
                if (currentUser.value && currentUser.value.email === accountEmail) {
                    currentUser.value = {
                        ...currentUser.value,
                        ...accountData
                    };
                }
                
                await getAllAccounts();
                return response.data;
            } catch (err: any) {
                error.value = err.response?.data?.message || 'Failed to update account';
                toast.error(error.value);
                throw error.value;
            } finally {
                loading.value = false;
            }
        }
        
        return {
            loading,
            error,
            accounts,
            currentUser,
            getAllAccounts,
            addAccount,
            updateAccount
        };
    }
)