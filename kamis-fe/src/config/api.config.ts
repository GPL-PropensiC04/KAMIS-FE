export const API_BASE_URL = import.meta.env.VITE_ASSET_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
  ASET: {
    GET_ALL: '/api/asset/all',
    GET_BY_PLATNOMOR: (platNomor: string) => `/api/asset/${platNomor}`,
    UPDATE: (platNomor: string) => `/api/asset/${platNomor}`,
    DELETE: (platNomor: string) => `/api/asset/${platNomor}`,
  },
  MAINTENANCE: {
    GET_BY_ASET_ID: (platNomor: string) => `/api/maintenance/asset/${platNomor}`,
    CREATE: `/api/maintenance`,
  }
};