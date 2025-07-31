// Configuración de API para diferentes entornos
export const API_CONFIG = {
  // En producción (Firebase App Hosting), la API está en el mismo dominio
  // En desarrollo local, usar localhost:3001
  baseURL: import.meta.env.MODE === 'production'
    ? '' // Producción: mismo dominio
    : 'http://localhost:3001' // Desarrollo: localhost
};

// Helper para construir URLs de API
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
