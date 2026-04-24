/**
 * Helper to get the full URL for an asset (image, PDF, etc.)
 * @param {string} path - The relative path from the server root (e.g., /uploads/...)
 * @returns {string} - The full URL
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
