const API_URL = 'http://localhost:5001/api';

interface RequestOptions {
    method?: string;
    body?: any;
    token?: string;
}

export async function fetchApi(endpoint: string, options: RequestOptions = {}) {
    const { method = 'GET', body, token } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['x-auth-token'] = token;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.msg || 'Bir hata oluştu');
    }

    return data;
}
