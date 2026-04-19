export const GATEWAY_URL = 'http://localhost:8080';
const REFRESH_API_URL = "http://localhost:8080/auth/refresh"; 

let isRefreshing = false;
let refreshPromise = null;

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
};

export const handleTokenRefresh = async () => {
    if (isRefreshing) return refreshPromise;

    isRefreshing = true;
    refreshPromise = (async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            logout();
            throw new Error("No refresh token");
        }

        try {
            const response = await fetch(REFRESH_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.status === 401 || response.status === 403) {
                console.error("Refresh token expired or invalid");
                logout();
                throw new Error("Session expired");
            }

            if (!response.ok) {
                throw new Error("Server error during refresh");
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;

        } catch (error) {
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

export const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${GATEWAY_URL}${endpoint}`;

    const getOptions = (token) => {
        const headers = { ...options.headers };
        // Если мы шлем файлы (FormData), браузер сам поставит Content-Type с boundary
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return { ...options, headers };
    };

    try {
        let response = await fetch(url, getOptions(localStorage.getItem('accessToken')));

        if (response.status === 401) {
            try {
                const newToken = await handleTokenRefresh();
                response = await fetch(url, getOptions(newToken));
            } catch (err) {
                throw err;
            }
        }

        // Передаем параметр isBlob в обработчик ответа
        return await handleResponse(response, options.isBlob);
    } catch (error) {
        throw error;
    }
};

async function handleResponse(response, isBlob = false) {
    if (!response.ok) {
        const error = new Error(`API Error: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) return null;

    // --- ИЗМЕНЕНИЕ ТУТ ---
    // Если в опциях запроса указано isBlob: true, возвращаем бинарные данные
    if (isBlob) {
        return await response.blob();
    }

    // Иначе пытаемся прочитать как JSON
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') return null;
    
    return response.json();
}