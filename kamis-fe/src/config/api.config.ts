// Use one base URL from the environment (with a default for safety)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_PURCHASE_URL = import.meta.env.VITE_API_PURCHASE_URL;
export const API_RESOURCE_URL = import.meta.env.VITE_API_RESOURCE_URL;
export const API_ASSET_URL = import.meta.env.VITE_API_ASSET_URL;
export const API_PROFILE_URL = import.meta.env.VITE_API_PROFILE_URL;
export const API_PROJECT_URL = import.meta.env.VITE_API_PROJECT_URL;
export const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL;
export const API_FOTO_URL = import.meta.env.VITE_API_FOTO_URL;
export const API_FINANCE_URL = import.meta.env.VITE_API_FINANCE_URL;

// Define service URLs by appending the specific path
export const API_URLS = {
  PURCHASE: `${API_PURCHASE_URL}`,
  RESOURCE: `${API_RESOURCE_URL}`,
  ASSET: `${API_ASSET_URL}`,
  PROFILE: `${API_PROFILE_URL}`,
  PROJECT: `${API_PROJECT_URL}`,
  AUTH: `${API_AUTH_URL}`,
  FOTO: `${API_FOTO_URL}`,
  FINANCE: `${API_FINANCE_URL}`,
  // Add others as needed (e.g. asset, profile, etc.)
};

export const API_ENDPOINTS = {
  ASET: {
    GET_ALL: '/asset/all',
    GET_BY_PLATNOMOR: (platNomor: string) => `/asset/${platNomor}`,
    UPDATE: (platNomor: string) => `/asset/${platNomor}`,
    DELETE: (platNomor: string) => `/asset/${platNomor}`,
  },
  MAINTENANCE: {
    GET_BY_ASET_ID: (platNomor: string) => `/maintenance/asset/${platNomor}`,
    CREATE: `/maintenance`,
  }
};