import React, { useState } from 'react';
import { useCategories, useDeleteCategory } from '@/hooks/api/useCategories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { toast } from 'sonner';

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: any }>({
    isOpen: false,
    category: null,
  });

  const handleDeleteClick = (category: any) => {
    setDeleteModal({ isOpen: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;
    
    try {
      await deleteCategory.mutateAsync(deleteModal.category.id);
      toast.success('Catégorie supprimée avec succès');
      setDeleteModal({ isOpen: false, category: null });
    } catch (error) {
      toast.error('Erreur lors de la suppression de la catégorie');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erreur lors du chargement des catégories</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Catégories</h1>
          <p className="text-slate-300 mt-2">Gérez les catégories de produits</p>
        </div>
        <Button
          onClick={() => navigate('/mobile/categories/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Slug</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Ordre</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Créée le</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
                     <tbody className="divide-y divide-slate-700">
                       {categories.map((category) => (
                         <tr 
                           key={category.id} 
                           className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                           onClick={() => navigate(`/mobile/categories/${category.id}`)}
                         >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-400 font-mono text-sm">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-300">
                        <Hash className="h-4 w-4 mr-1 text-slate-400" />
                        {category.displayOrder}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={category.active ? "default" : "secondary"}
                        className={category.active ? "bg-green-600 hover:bg-green-700" : "bg-slate-600 hover:bg-slate-700"}
                      >
                        {category.active ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                           <td className="px-6 py-4">
                             <div className="flex justify-end gap-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/mobile/categories/${category.id}`);
                                 }}
                                 className="text-slate-300 hover:text-white hover:bg-slate-600"
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteClick(category);
                                 }}
                                 className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                 disabled={deleteCategory.isPending}
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
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">Aucune catégorie trouvée</p>
            <p className="text-sm">Créez votre première catégorie pour commencer</p>
          </div>
          <Button
            onClick={() => navigate('/mobile/categories/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une catégorie
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModal.category?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
};
