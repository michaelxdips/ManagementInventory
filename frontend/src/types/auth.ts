export type Role = 'admin' | 'user' | 'superadmin' | 'viewer';

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

export type LoginPayload = {
  username: string;
  password: string;
  remember?: boolean;
  role?: Role;
};
