import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const contactService = {
  getContacts: (page = 1, limit = 20, search = '') =>
    api.get(`/contacts?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  getContact: (id) => api.get(`/contacts/${id}`),

  createContact: (data) => api.post('/contacts', data),

  updateContact: (id, data) => api.put(`/contacts/${id}`, data),

  deleteContact: (id) => api.delete(`/contacts/${id}`),
};

export const tagService = {
  getTags: () => api.get('/tags'),

  createTag: (name) => api.post('/tags', { name }),
};

export const agentService = {
  scan: () => api.post('/agent/scan'),
  getProposals: () => api.get('/agent/proposals'),
  getProposal: (id) => api.get(`/agent/proposals/${id}`),
  approveProposal: (id) => api.post(`/agent/proposals/${id}/approve`),
  rejectProposal: (id) => api.post(`/agent/proposals/${id}/reject`),
};

export default api;
