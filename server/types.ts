export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  tokenVersion?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
