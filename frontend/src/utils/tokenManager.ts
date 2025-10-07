const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The token, or null if it doesn't exist.
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Stores the authentication token in localStorage.
 * @param {string} token - The token to store.
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
