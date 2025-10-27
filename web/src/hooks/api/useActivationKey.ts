import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth';
import { IssueKeyDto } from '@/api/types/auth.types';
import { toast } from 'sonner';

export const useIssueActivationKey = () => {
  return useMutation({
    mutationFn: (userData: IssueKeyDto) => authApi.issueKey(userData),
    onSuccess: () => {
      toast.success('Code d\'activation généré avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la génération du code : ${error.message}`);
    },
  });
};
