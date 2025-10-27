import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/endpoints/user';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, UpdateRoleDto, UpdateStatusDto } from '@/api/types/user.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.list,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (newUser: CreateUserDto) => userApi.create(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé avec succès !');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ id, updatedUser }: { id: string; updatedUser: UpdateUserDto }) =>
      userApi.update(id, updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Utilisateur mis à jour avec succès !');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès !');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      userApi.updatePassword(id, { password }),
    onSuccess: () => {
      toast.success('Mot de passe mis à jour avec succès !');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour du mot de passe: ${error.message}`);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' | 'COACH' }) =>
      userApi.updateRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Rôle mis à jour avec succès !');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour du rôle: ${error.message}`);
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' | 'BANNED' }) =>
      userApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Statut mis à jour avec succès !');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    },
  });
};
