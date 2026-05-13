import { userMockApi } from '../../api/mockApi';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
}

export const fetchUsers = async () => {
  const response = await userMockApi.get<User[]>('/users');
  return response.data;
};

export const registerUser = async (user: Omit<User, 'id'>) => {
  const response = await userMockApi.post<User>('/users', user);
  return response.data;
};

export const loginUser = async (credentials: Pick<User, 'username' | 'password'>) => {
  const users = await fetchUsers();
  const user = users.find(
    (u) => u.username === credentials.username && u.password === credentials.password
  );
  if (!user) throw new Error('Invalid username or password');
  return user;
};
