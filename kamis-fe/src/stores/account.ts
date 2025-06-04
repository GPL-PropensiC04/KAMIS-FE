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
    const currentPage = ref(0);
    const totalPages = ref(0);
    const pageSize = ref(5);

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


    async function getAllAccountsWithPagination(page: number, size: number, searchParams?: {
        email?: string;
        username?: string;
        userType?: string;
    }) {
        loading.value = true;
        error.value = null;
    
        const params: any = { 
            page, 
            size
        };
        console.log('Search Params:', searchParams);
        // Add search parameters if provided
        if (searchParams?.email && searchParams.email.trim() !== '') {
            params.email = searchParams.email.trim();
            console.log('Adding email filter:', params.email);
        }
        if (searchParams?.username && searchParams.username.trim() !== '') {
            params.username = searchParams.username.trim();
            console.log('Adding username filter:', params.username);
        }
        if (searchParams?.userType && searchParams.userType.trim() !== '' && searchParams.userType !== 'Semua') {
            params.userType = searchParams.userType.trim();
            console.log('Adding userType filter:', params.userType);
        }
        
        
        console.log('Fetching accounts with params:', params);
        try {
            const response = await axios.get<CommonResponseInterface<any>>(
                `${API_URLS.PROFILE}/profile/all/paginated`,
                {
                    params,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                }
            );
    
            const data = response.data.data;
            accounts.value = data.content;
            currentPage.value = data.number;
            totalPages.value = data.totalPages;
            pageSize.value = data.size;
    
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
            await getAllAccountsWithPagination(currentPage.value, pageSize.value);
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

            await getAllAccountsWithPagination(currentPage.value, pageSize.value);
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
        currentPage,
        totalPages,
        pageSize,
        getAllAccounts,
        getAllAccountsWithPagination,
        addAccount,
        updateAccount
    };
}
)