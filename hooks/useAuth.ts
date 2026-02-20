// hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/customerApiClient'; // This stays as is

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) =>
      customerApi.auth.login(login, password),
    onSuccess: () => {
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] });
      // No automatic redirect, handled in component
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    customerApi.auth.logout();
    queryClient.clear(); // Clear all React Query cache
    router.push('/login');
  };
};