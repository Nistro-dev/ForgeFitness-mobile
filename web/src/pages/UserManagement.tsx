import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser, useIssueActivationKey } from '@/hooks/api/useUsers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Mail, Calendar, Shield, UserCheck, UserX, UserMinus, Search, Filter, ChevronLeft, ChevronRight, Key, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { toast } from 'sonner';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();
  const issueActivationKey = useIssueActivationKey();

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: any }>({
    isOpen: false,
    user: null,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'COACH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'BANNED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const handleDeleteClick = (user: any) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    
    try {
      await deleteUser.mutateAsync(deleteModal.user.id);
      toast.success('Utilisateur supprimé avec succès');
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleIssueActivationKey = async (user: any) => {
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

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erreur lors du chargement des utilisateurs</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Utilisateurs</h1>
          <p className="text-slate-300 mt-2">Gérez les utilisateurs du système</p>
        </div>
        <Button
          onClick={() => navigate('/users/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Recherche et filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Recherche
              </Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, prénom ou email..."
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
              />
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Rôle
              </Label>
              <Select value={roleFilter} onValueChange={(value: 'ALL' | 'USER' | 'ADMIN' | 'COACH') => setRoleFilter(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ALL" className="text-slate-200 hover:bg-slate-700">Tous les rôles</SelectItem>
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

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Statut</Label>
              <Select value={statusFilter} onValueChange={(value: 'ALL' | 'ACTIVE' | 'DISABLED' | 'BANNED') => setStatusFilter(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ALL" className="text-slate-200 hover:bg-slate-700">Tous les statuts</SelectItem>
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

            {/* Reset Filters */}
            <div className="space-y-2">
              <Label className="text-slate-200">Actions</Label>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
              {filteredUsers.length !== users?.length && ` sur ${users?.length || 0} total`}
            </p>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length > 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Créé le</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-300">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getRoleColor(user.role)}>
                        <span className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(user.status)}>
                        <span className="flex items-center">
                          {user.status === 'ACTIVE' && <UserCheck className="h-3 w-3 mr-1" />}
                          {user.status === 'DISABLED' && <UserMinus className="h-3 w-3 mr-1" />}
                          {user.status === 'BANNED' && <UserX className="h-3 w-3 mr-1" />}
                          <span>{user.status}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIssueActivationKey(user);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          disabled={issueActivationKey.isPending}
                          title="Générer un code d'activation"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(user);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          disabled={deleteUser.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-900 border-t border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">
              {users && users.length === 0 
                ? "Aucun utilisateur trouvé" 
                : "Aucun utilisateur ne correspond aux filtres"
              }
            </p>
            <p className="text-sm">
              {users && users.length === 0 
                ? "Créez votre premier utilisateur pour commencer"
                : "Essayez de modifier vos critères de recherche"
              }
            </p>
          </div>
          <div className="flex justify-center space-x-3">
            {users && users.length === 0 ? (
              <Button
                onClick={() => navigate('/users/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un utilisateur
              </Button>
            ) : (
              <>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
                >
                  Réinitialiser les filtres
                </Button>
                <Button
                  onClick={() => navigate('/users/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un utilisateur
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${deleteModal.user?.firstName} ${deleteModal.user?.lastName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};