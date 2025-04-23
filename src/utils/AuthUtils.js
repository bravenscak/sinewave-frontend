export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const isAuthenticated = () => {
    const token = getToken();
    return !!token; 
  };
  
  export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  export const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  
  export const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      ...authHeader(),
      'Content-Type': 'application/json'
    };
  
    const response = await fetch(url, {
      ...options,
      headers
    });
  
    if (response.status === 401) {
      logout();
      return Promise.reject('Session expired. Please login again.');
    }
  
    return response;
  };