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

export const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'ADMIN';
};

export const logout = async () => {
    try {
        await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.warn('Logout request failed:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const refreshAccessToken = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data.token;
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        throw error;
    }
};

export const fetchWithAuth = async (url, options = {}) => {
    const initialHeaders = {
        ...options.headers, 
        ...authHeader(),   
    };

    if (!(options.body instanceof FormData) && !initialHeaders['Content-Type']) {
        initialHeaders['Content-Type'] = 'application/json';
    }

    try {
        let response = await fetch(url, {
            ...options,
            headers: initialHeaders, 
            credentials: 'include'
        });

        const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/refresh');

        if (response.status === 401 && !isAuthEndpoint) {
            try {
                console.log("Token expired or invalid, attempting to refresh...");
                await refreshAccessToken(); 

                const retryHeaders = {
                    ...options.headers,
                    ...authHeader(),
                };
                if (!(options.body instanceof FormData) && !retryHeaders['Content-Type']) {
                    retryHeaders['Content-Type'] = 'application/json';
                }

                console.log("Retrying original request with new token...");
                response = await fetch(url, {
                    ...options,
                    headers: retryHeaders,
                    credentials: 'include'
                });

                if (response.status === 401) { 
                    console.error("Still unauthorized after token refresh. Logging out.");
                    logout();
                    return Promise.reject(new Error('Session expired. Please login again.'));
                }

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                logout(); 
                return Promise.reject(new Error('Session refresh failed. Please login again.'));
            }
        }
        return response;

    } catch (error) {
        console.error('Fetch error:', error.message, 'URL:', url);
        throw error; 
    }
};