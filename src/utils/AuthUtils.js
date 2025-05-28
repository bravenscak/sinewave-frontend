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
    const headers = {
        ...options.headers,
        ...authHeader(),
        'Content-Type': 'application/json'
    };

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    if (response.status === 401) {
        try {
            await refreshAccessToken();
            
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.status === 401) {
                logout();
                return Promise.reject('Session expired. Please login again.');
            }
        } catch (error) {
            logout();
            return Promise.reject('Session expired. Please login again.');
        }
    }

    return response;
};