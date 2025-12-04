import axios from "axios";

// Setter functions to be registered from App component
export let setGlobalSlowPopup = () => {};
export let setGlobal404 = () => {};
export const registerSlowPopupSetter = (setterFn) => {
  setGlobalSlowPopup = setterFn;
};
export const register404 = (setterFn) => {
  setGlobal404 = setterFn;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Track timer per-request
const pendingTimers = new Map();


// Add auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Start 3s slow loading timer
  const requestId = Symbol();
  config.requestId = requestId;

  const timer = setTimeout(() => {
    setGlobalSlowPopup(true); // Show popup globally
  }, 3000);

  pendingTimers.set(requestId, timer);

  return config;
});

// Clear slow timer on response
api.interceptors.response.use(
  (response) => {
    const timer = pendingTimers.get(response.config.requestId);
    if (timer) clearTimeout(timer);

    pendingTimers.delete(response.config.requestId);
    setGlobalSlowPopup(false);
    return response;
  },
  (error) => {
    // On 401, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    else if (error.response && error.response.status === 404) {
      setGlobal404(true);
    }
    const cfg = error.config ?? {};
    const timer = pendingTimers.get(cfg.requestId);
    if (timer) clearTimeout(timer);

    pendingTimers.delete(cfg.requestId);
    setGlobalSlowPopup(false);
    return Promise.reject(error);
  }
);
export default api;
export { api };
