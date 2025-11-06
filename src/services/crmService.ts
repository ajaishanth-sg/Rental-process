// CRM API Service
const API_BASE_URL = 'http://localhost:8000/api/crm';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json',
});

// Leads
export const getLeads = async () => {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch leads');
  return response.json();
};

export const getLead = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch lead');
  return response.json();
};

export const createLead = async (leadData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  if (!response.ok) throw new Error('Failed to create lead');
  return response.json();
};

export const updateLead = async (leadId: string, leadData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  if (!response.ok) throw new Error('Failed to update lead');
  return response.json();
};

export const updateLeadStatus = async (leadId: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status?status=${status}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to update lead status');
  return response.json();
};

export const deleteLead = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete lead');
  return response.json();
};

// Emails
export const getLeadEmails = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/emails`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
};

export const sendEmail = async (emailData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${emailData.leadId}/emails`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(emailData),
  });
  if (!response.ok) throw new Error('Failed to send email');
  return response.json();
};

// Calls
export const getLeadCalls = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/calls`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch calls');
  return response.json();
};

export const logCall = async (callData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${callData.leadId}/calls`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(callData),
  });
  if (!response.ok) throw new Error('Failed to log call');
  return response.json();
};

// Tasks
export const getLeadTasks = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/tasks`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (taskData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${taskData.leadId}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (taskId: string, taskData: any) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

// Notes
export const getLeadNotes = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
};

export const createNote = async (noteData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${noteData.leadId}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(noteData),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
};

// Convert to Deal
export const convertToDeal = async (convertData: any) => {
  const response = await fetch(`${API_BASE_URL}/leads/${convertData.leadId}/convert-to-deal`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(convertData),
  });
  if (!response.ok) throw new Error('Failed to convert to deal');
  return response.json();
};

// Customers
export const getCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
};

export const getCustomerDetails = async (customerId: string) => {
  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch customer details');
  return response.json();
};

export const updateCustomer = async (customerId: string, customerData: any) => {
  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(customerData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update customer' }));
    throw new Error(error.detail || 'Failed to update customer');
  }
  return response.json();
};

