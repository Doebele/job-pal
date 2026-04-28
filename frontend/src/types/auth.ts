export interface LoginReq {
  email: string;
  password: string;
}

export interface RegisterReq {
  email: string;
  password: string;
  role: 'student' | 'employer';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
}
