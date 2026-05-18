export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
}

export const isAdminUser = (user?: User | null): boolean =>
  !!user && (user.isAdmin === true || user.username === 'admin');
