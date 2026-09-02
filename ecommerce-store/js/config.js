/**
 * ApexStore Global Configuration
 * Set your live Render backend URL here for production deployments.
 */
window.APEX_CONFIG = {
  // Production Render URL (or fallback to local / relative)
  API_BASE_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "" 
    : "https://apexstore-backend.onrender.com"
};

function getApiUrl(endpoint) {
  const base = window.APEX_CONFIG.API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  return base ? `${base}${path}` : path;
}
