import React, { createContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import { queryKeys } from '../api/queryKeys';
import { logEvent } from '../utils/logger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), { user: data.user });
      logEvent('LOGIN', { email: data.user?.email });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      logEvent('REGISTER', { email: data.userId });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.auth.me(), () => undefined);
      queryClient.clear();
    },
  });

  const login = async (email, password) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (email, password) => {
    return registerMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    const res = await logoutMutation.mutateAsync();
    logEvent('LOGOUT', {});
    return res;
  };

  const user = meQuery.data?.user ?? null;

  return (
    <AuthContext.Provider value={{ user, loading: meQuery.isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};