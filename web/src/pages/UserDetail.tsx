import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers, useUpdateUser, useDeleteUser, useUpdatePassword, useUpdateRole, useUpdateStatus } from '@/hooks/api/useUsers';
import { useIssueActivationKey } from '@/hooks/api/useActivationKey';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX, 
  UserMinus, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Key, 
  Trash2,
  Settings,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updatePassword = useUpdatePassword();
  const updateRole = useUpdateRole();
  const updateStatus = useUpdateStatus();
  const issueActivationKey = useIssueActivationKey();

  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'COACH'>('USER');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'DISABLED' | 'BANNED'>('ACTIVE');

  const user = users?.find(u => u.id === id);

  React.useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      setNewRole(user.role);
      setNewStatus(user.status);
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <div className="text-red-500">Utilisateur non trouvé</div>;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        ...editData,
      });
      toast.success('Informations mises à jour');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setIsEditing(false);
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword.trim()) {
      toast.error('Veuillez saisir un nouveau mot de passe');
      return;
    }
    try {
      await updatePassword.mutateAsync({ id: user.id, password: newPassword });
      toast.success('Mot de passe mis à jour');
      setNewPassword('');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  const handleRoleUpdate = async () => {
    try {
      await updateRole.mutateAsync({ id: user.id, role: newRole });
      toast.success('Rôle mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateStatus.mutateAsync({ id: user.id, status: newStatus });
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleIssueActivationKey = async () => {
    try {
      await issueActivationKey.mutateAsync({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error: any) {
      toast.error(`Erreur lors de la génération du code : ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('Utilisateur supprimé');
      navigate('/users');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      case 'COACH': return <UserCheck className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600 hover:bg-red-700';
      case 'COACH': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-600 hover:bg-green-700';
      case 'DISABLED': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'BANNED': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const tabs = [
    {
      id: 'info',
      label: 'Informations',
      icon: <User className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </span>
                {!isEditing && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Prénom</Label>
                  <Input
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Nom</Label>
                  <Input
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Email</Label>
                <Input
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Rôle</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role)}>
                      <span className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Statut</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(user.status)}>
                      <span className="flex items-center">
                        {user.status === 'ACTIVE' && <UserCheck className="h-3 w-3 mr-1" />}
                        {user.status === 'DISABLED' && <UserMinus className="h-3 w-3 mr-1" />}
                        {user.status === 'BANNED' && <UserX className="h-3 w-3 mr-1" />}
                        <span>{user.status}</span>
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Créé le</Label>
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateUser.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      icon: <Settings className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Génération de code d'activation */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Code d'activation
              </CardTitle>
              <CardDescription className="text-slate-400">
                Générer un nouveau code d'activation pour cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleIssueActivationKey}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={issueActivationKey.isPending}
              >
                <Key className="h-4 w-4 mr-2" />
                {issueActivationKey.isPending ? 'Génération...' : 'Générer un code'}
              </Button>
            </CardContent>
          </Card>

          {/* Modification du mot de passe */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Mot de passe
              </CardTitle>
              <CardDescription className="text-slate-400">
                Modifier le mot de passe de cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Saisissez le nouveau mot de passe"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                />
              </div>
              <Button
                onClick={handlePasswordUpdate}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={updatePassword.isPending || !newPassword.trim()}
              >
                <Lock className="h-4 w-4 mr-2" />
                {updatePassword.isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </CardContent>
          </Card>

          {/* Modification du rôle */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Rôle
              </CardTitle>
              <CardDescription className="text-slate-400">
                Modifier le rôle de cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Rôle</Label>
                <Select value={newRole} onValueChange={(value: 'USER' | 'ADMIN' | 'COACH') => setNewRole(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="USER" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Utilisateur
                      </div>
                    </SelectItem>
                    <SelectItem value="COACH" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Coach
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Administrateur
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleRoleUpdate}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={updateRole.isPending || newRole === user.role}
              >
                <Shield className="h-4 w-4 mr-2" />
                {updateRole.isPending ? 'Mise à jour...' : 'Mettre à jour le rôle'}
              </Button>
            </CardContent>
          </Card>

          {/* Modification du statut */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Statut
              </CardTitle>
              <CardDescription className="text-slate-400">
                Modifier le statut de cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Statut</Label>
                <Select value={newStatus} onValueChange={(value: 'ACTIVE' | 'DISABLED' | 'BANNED') => setNewStatus(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="ACTIVE" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                        Actif
                      </div>
                    </SelectItem>
                    <SelectItem value="DISABLED" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <UserMinus className="h-4 w-4 mr-2 text-yellow-500" />
                        Désactivé
                      </div>
                    </SelectItem>
                    <SelectItem value="BANNED" className="text-slate-200 hover:bg-slate-700">
                      <div className="flex items-center">
                        <UserX className="h-4 w-4 mr-2 text-red-500" />
                        Banni
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStatusUpdate}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={updateStatus.isPending || newStatus === user.status}
              >
                <Activity className="h-4 w-4 mr-2" />
                {updateStatus.isPending ? 'Mise à jour...' : 'Mettre à jour le statut'}
              </Button>
            </CardContent>
          </Card>

          {/* Suppression */}
          <Card className="bg-slate-800 border-slate-700 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer un Utilisateur
              </CardTitle>
              <CardDescription className="text-slate-400">
                Supprimer définitivement cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setDeleteModal(true)}
                variant="outline"
                className="border-red-600 text-red-400 bg-red-900/20 hover:bg-red-800 hover:text-red-200 hover:border-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer l'utilisateur
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/users')}
          className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-slate-300 mt-2">Gestion de l'utilisateur</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="info" />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.firstName} ${user.lastName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};
