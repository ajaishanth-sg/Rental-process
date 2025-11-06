// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  CRM: {
    BASE: `${API_BASE_URL}/api/crm`,
    LEADS: `${API_BASE_URL}/api/crm/leads`,
    LEADS_ASSIGNED: `${API_BASE_URL}/api/crm/leads/assigned`,
    LEADS_PUBLIC: `${API_BASE_URL}/api/crm/leads/public`,
  },
  SALES: {
    BASE: `${API_BASE_URL}/api/sales`,
    ENQUIRIES: `${API_BASE_URL}/api/sales/enquiries`,
    QUOTATIONS: `${API_BASE_URL}/api/sales/quotations`,
    ORDERS: `${API_BASE_URL}/api/sales/orders`,
    DASHBOARD: `${API_BASE_URL}/api/sales/dashboard`,
  },
  ADMIN: {
    BASE: `${API_BASE_URL}/api/admin`,
    ENQUIRIES: `${API_BASE_URL}/api/admin/enquiries`,
    USERS: `${API_BASE_URL}/api/admin/users`,
  },
  WAREHOUSE: {
    BASE: `${API_BASE_URL}/api/warehouse`,
    DASHBOARD: `${API_BASE_URL}/api/warehouse/dashboard`,
    DISPATCH: `${API_BASE_URL}/api/warehouse/dispatch`,
  },
  EQUIPMENT: {
    BASE: `${API_BASE_URL}/api/equipment`,
  },
  RENTALS: {
    BASE: `${API_BASE_URL}/api/rentals`,
  },
  CUSTOMERS: {
    BASE: `${API_BASE_URL}/api/customers`,
  },
  INVOICES: {
    BASE: `${API_BASE_URL}/api/invoices`,
  },
  FINANCE: {
    BASE: `${API_BASE_URL}/api/finance`,
  },
};

export default API_CONFIG;

