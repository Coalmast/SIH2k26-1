import { useAuthStore } from '../stores/authStore';

const getApiUrl = () => (global as any).DEV_API_URL || process.env.EXPO_PUBLIC_API_URL;

async function getAuthHeaders() {
  const token = useAuthStore.getState().session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  },
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    console.log("Checking health for:", getApiUrl());
    const response = await fetch(`${getApiUrl()}/`, {
      signal: controller.signal,
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
      }
    });

    clearTimeout(timeoutId);
    console.log("Health check response status:", response.status);
    return true;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};
