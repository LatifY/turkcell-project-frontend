const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiService {
  getAuthToken() {
    return localStorage.getItem('turkcell_token');
  }

  isTokenExpired() {
    const expiresAt = localStorage.getItem('turkcell_token_expires');
    if (!expiresAt) return true;
    
    const now = new Date().getTime();
    return now >= parseInt(expiresAt);
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    if (token && !this.isTokenExpired()) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(), // Automatically add auth headers
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('turkcell_user');
          localStorage.removeItem('turkcell_token');
          localStorage.removeItem('turkcell_token_expires');
          
          window.location.href = '/login';
          throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password
      }),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Don't include auth headers for login
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });
  }

  async getUserProfile() {
    return this.makeRequest('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getCatalog() {
    return this.makeRequest('/catalog');
  }

  async getRoamingPackages() {
    return this.makeRequest('/roaming/packages');
  }

  async simulateRoaming(simulationData) {
    console.log(simulationData);
    return this.makeRequest('/simulate', {
      method: 'POST',
      body: JSON.stringify(simulationData),
    });
  }

  async refreshToken() {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
  }
}

export default new ApiService();
