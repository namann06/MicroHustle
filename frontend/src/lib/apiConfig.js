const isBrowser = typeof window !== "undefined";
const isHostedOnRender = isBrowser && window.location.hostname.endsWith("onrender.com");

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  (isHostedOnRender ? "https://microhustle-api.onrender.com" : "http://localhost:8080");

export function buildApiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}
