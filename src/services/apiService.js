// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  // KYC endpoints
  async uploadKycDocument(formData) {
    const url = `${API_BASE_URL}/kyc/upload`;
    const config = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  async getKycDocuments() {
    return this.request('/kyc/documents');
  }

  async getKycStatus() {
    return this.request('/kyc/status');
  }

  // AI endpoints
  async sendAiMessage(messages) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async generateProjectDescription(projectData) {
    return this.request('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async updateWalletBalance(balanceData) {
    return this.request('/wallet/balance', {
      method: 'PUT',
      body: JSON.stringify(balanceData),
    });
  }

  async deposit(amount, currency) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async withdraw(amount, currency, address) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, address }),
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getUsers(page = 1, limit = 10) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`);
  }

  async getPendingProjects() {
    return this.request('/admin/projects/pending');
  }

  async approveProject(id) {
    return this.request(`/admin/projects/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectProject(id, reason) {
    return this.request(`/admin/projects/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getComplianceData() {
    return this.request('/admin/compliance');
  }

  async updateUserKyc(userId, kycStatus) {
    return this.request(`/admin/users/${userId}/kyc`, {
      method: 'PUT',
      body: JSON.stringify({ kycStatus }),
    });
  }

  async getAnalytics() {
    return this.request('/admin/analytics');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
