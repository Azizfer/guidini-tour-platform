import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
  exp: number;
  [key: string]: any;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  // Check if token exists and is not expired
  const token = localStorage.getItem('token');
  return !!token && !isTokenExpired(token);
};

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};
