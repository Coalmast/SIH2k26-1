import axios from "axios";
import { supabase } from "./supabase";
import { DEMO_MODE } from "./demo-mode";
import { getMockApiResponse } from "./mock-data";

// Create an Axios instance for the FastAPI backend
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for attaching auth tokens
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

if (DEMO_MODE) {
  apiClient.interceptors.request.use((config) => {
    const mockData = getMockApiResponse(config.method || 'GET', config.url || '');
    return Promise.reject({ 
      __isMock: true, 
      data: mockData,
      status: 200,
      config 
    });
  });
  
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.__isMock) {
        return Promise.resolve({ data: err.data, status: 200 });
      }
      return Promise.reject(err);
    }
  );
}
