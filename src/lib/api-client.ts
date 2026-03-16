export const minimizigFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s para redes 3G/4G

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error: any) {
        // Tratamento de erro granular para logs do Antigravity
        if (error.name === 'AbortError') {
            console.error(`[Minimizing Error] Timeout em ${endpoint}. Verifique a rede.`);
        } else {
            console.error(`[Minimizing Error] em ${endpoint}:`, error.message);
        }
        throw error;
    }
};
