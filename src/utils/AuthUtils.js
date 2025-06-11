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

// Use an environment variable for the API base URL.
// Fallback to localhost for local development if the env var isn't set.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const logout = async () => {
    try {
        // Ensure full URL is used for logout endpoint
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader() // Include auth header for logout if your backend requires it
            }
        });
    } catch (error) {
        console.warn('Logout request to backend failed or was skipped:', error);
        // Proceed with client-side logout regardless of backend call success
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Instead of direct href, consider using react-router's navigation for SPA behavior
    // but for a full redirect after logout, window.location.href is common.
    window.location.href = '/login';
};

export const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const refreshAccessToken = async () => {
    try {
        // Ensure full URL is used for refresh endpoint
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Token refresh failed with status: ' + response.status }));
            console.error('Token refresh API call failed:', errorData.message || response.statusText);
            throw new Error(errorData.message || 'Token refresh failed');
        }

        const data = await response.json();

        if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log("Token refreshed successfully.");
            return data.token;
        } else {
            console.error('Token refresh response did not contain token or user data.');
            throw new Error('Invalid response from token refresh');
        }
    } catch (error) {
        console.error('Error during token refresh process:', error);
        // Don't logout immediately here, let the caller (fetchWithAuth) handle it
        // if the subsequent retry also fails.
        throw error; // Re-throw to be caught by fetchWithAuth
    }
};

export const fetchWithAuth = async (url, options = {}) => {
    // Construct the full URL by prepending API_BASE_URL if 'url' is relative
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

    const initialHeaders = {
        ...options.headers,
        ...authHeader(),
    };

    // Set Content-Type to application/json by default if not FormData and not already set
    if (!(options.body instanceof FormData) && !initialHeaders['Content-Type']) {
        initialHeaders['Content-Type'] = 'application/json';
    }

    try {
        let response = await fetch(fullUrl, {
            ...options,
            headers: initialHeaders,
            credentials: 'include' // Important for sending/receiving cookies like refreshToken
        });

        // Do not attempt to refresh token for login or refresh endpoints themselves
        const isAuthEndpoint = fullUrl.includes('/api/auth/login') || fullUrl.includes('/api/auth/refresh');

        if (response.status === 401 && !isAuthEndpoint) {
            console.log(`Token expired or invalid for ${fullUrl}, attempting to refresh...`);
            try {
                await refreshAccessToken(); // Attempt to refresh the token

                // Construct headers for the retry, ensuring the new token is used
                const retryHeaders = {
                    ...options.headers,
                    ...authHeader(), // This will now pick up the new token
                };
                if (!(options.body instanceof FormData) && !retryHeaders['Content-Type']) {
                    retryHeaders['Content-Type'] = 'application/json';
                }

                console.log(`Retrying original request to ${fullUrl} with new token...`);
                response = await fetch(fullUrl, { // Retry the original request
                    ...options,
                    headers: retryHeaders,
                    credentials: 'include'
                });

                if (response.status === 401) {
                    // If still unauthorized after refresh, then logout
                    console.error("Still unauthorized after token refresh. Logging out.");
                    logout(); // This will redirect to login
                    // Return a promise that rejects to prevent further processing in the calling component
                    return Promise.reject(new Error('Session expired. Please login again.'));
                }

            } catch (refreshError) {
                // If refreshAccessToken itself throws (e.g., refresh token invalid), logout
                console.error("Token refresh process failed:", refreshError.message, ". Logging out.");
                logout(); // This will redirect to login
                return Promise.reject(new Error('Session refresh failed. Please login again.'));
            }
        }
        return response;

    } catch (error) {
        // Catch network errors or other unexpected issues with the fetch itself
        console.error('Fetch error:', error.message, 'URL:', fullUrl);
        // You might want to throw a more specific error or handle based on error type
        throw error;
    }
};