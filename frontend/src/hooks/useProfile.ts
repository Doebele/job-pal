import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useProfileStore } from '../stores/profile-store';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data.profile;
    },
    enabled: !!localStorage.getItem('job-pal-token'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const resetDraft = useProfileStore((s) => s.resetDraft);

  return useMutation({
    mutationFn: (draft: any) => api.put('/profile', draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      resetDraft();
    },
  });
}
