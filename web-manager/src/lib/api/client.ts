import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url as string | undefined;
    const isLoginRequest = typeof requestUrl === "string" && requestUrl.includes("/users/login");

    if (status === 401 && !isLoginRequest) {
      store.dispatch(logout());
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
