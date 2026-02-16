import { API_BASE_URL } from "./apiConfig";

/**
 * Get the JWT token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Save JWT token to localStorage
 */
export function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem("authToken");
}

/**
 * Build full URL from a path
 */
export function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

/**
 * Build full URL for uploaded file assets
 */
export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Normalize: remove leading /uploads/ and re-add for consistency
  const clean = path.replace(/^\/?(uploads\/)?/, "uploads/");
  return `${API_BASE_URL}/${clean}`;
}

/**
 * Wrapper around fetch that automatically:
 * - Prepends API_BASE_URL
 * - Attaches Authorization: Bearer <token> header
 * - Sets Content-Type for JSON bodies
 *
 * Usage:
 *   const res = await apiFetch("/api/tasks");
 *   const res = await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(data) });
 *   const res = await apiFetch("/api/files/upload", { method: "POST", body: formData }); // no Content-Type for FormData
 */
export async function apiFetch(path, options = {}) {
  const url = buildUrl(path);
  const token = getAuthToken();

  const headers = { ...(options.headers || {}) };

  // Attach JWT token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set Content-Type to JSON if body is a string (JSON) and not already set
  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
