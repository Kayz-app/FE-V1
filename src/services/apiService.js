const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
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
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Projects endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Portfolio endpoints
  async getMyPortfolio() {
    return this.request('/portfolios/me');
  }

  async getPortfolioByUser(userId) {
    return this.request(`/portfolios/user/${userId}`);
  }

  async updatePortfolio(portfolioData) {
    return this.request('/portfolios/me', {
      method: 'PUT',
      body: JSON.stringify(portfolioData)
    });
  }

  async addTokenToPortfolio(tokenData) {
    return this.request('/portfolios/me/tokens', {
      method: 'POST',
      body: JSON.stringify(tokenData)
    });
  }

  async removeTokenFromPortfolio(tokenId) {
    return this.request(`/portfolios/me/tokens/${tokenId}`, {
      method: 'DELETE'
    });
  }

  // Market endpoints
  async getMarketListings() {
    return this.request('/market');
  }

  async getMarketListing(id) {
    return this.request(`/market/${id}`);
  }

  async createMarketListing(listingData) {
    return this.request('/market', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  }

  async updateMarketListing(id, listingData) {
    return this.request(`/market/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData)
    });
  }

  async buyTokenFromMarket(id, amount) {
    return this.request(`/market/${id}/buy`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  async deleteMarketListing(id) {
    return this.request(`/market/${id}`, {
      method: 'DELETE'
    });
  }

  async getMyMarketListings() {
    return this.request('/market/user/me');
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // KYC endpoints
  async uploadKycDocument(formData) {
    const url = `${API_BASE_URL}/kyc/upload`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
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

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async depositFunds(amount, currency) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }

  async withdrawFunds(amount, currency) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;