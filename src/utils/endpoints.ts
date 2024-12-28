export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string | number) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',
  },

  // Posts endpoints
  POSTS: {
    BASE: '/posts',
    BY_ID: (id: string | number) => `/posts/${id}`,
    COMMENTS: (postId: string | number) => `/posts/${postId}/comments`,
    LIKES: (postId: string | number) => `/posts/${postId}/likes`,
  },

  // Comments endpoints
  COMMENTS: {
    BASE: '/comments',
    BY_ID: (id: string | number) => `/comments/${id}`,
    REPLIES: (commentId: string | number) => `/comments/${commentId}/replies`,
  },

  // Centrala endpoints
  CENTRALA: {
    BASE: 'https://centrala.ag3nts.org',
    REPORT: '/report',
  },
} as const;

// Add type for the Centrala report payload
export interface CentralaReportPayload {
  task: string;
  apikey: string;
  answer: unknown; // Using unknown to allow for different answer types
}

// Example usage with ApiUtils:
/*
import { ApiUtils } from './index';
import { API_BASE_URL, ENDPOINTS } from './endpoints';

const api = new ApiUtils(API_BASE_URL);

interface User {
  id: number;
  name: string;
  email: string;
}

// Get user profile
const profile = await api.get<User>(ENDPOINTS.USERS.PROFILE);

// Get specific user
const userId = 123;
const user = await api.get<User>(ENDPOINTS.USERS.BY_ID(userId));

// Get post comments
const postId = 456;
const comments = await api.get(ENDPOINTS.POSTS.COMMENTS(postId));
*/
