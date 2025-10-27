import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories, useUpdateCategory, useDeleteCategory } from '@/hooks/api/useCategories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  Tag, 
  Calendar, 
  Hash, 
  Edit, 
  Save, 
  X, 
  Trash2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    slug: '',
    displayOrder: 0,
    active: true,
  });

  const category = categories?.find(c => c.id === id);

  React.useEffect(() => {
    if (category) {
      setEditData({
        name: category.name,
        slug: category.slug,
        displayOrder: category.displayOrder,
        active: category.active,
      });
    }
  }, [category]);

  if (isLoading) return <LoadingSpinner />;
  if (!category) return <div className="text-red-500">Catégorie non trouvée</div>;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        updatedCategory: editData,
      });
      toast.success('Catégorie mise à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success('Catégorie supprimée avec succès');
      navigate('/mobile/categories');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const generateSlug = (inputName: string) => {
    return inputName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditData(prev => ({
      ...prev,
      name: newName,
      slug: generateSlug(newName),
    }));
  };

  const tabs = [
    {
      id: 'info',
      label: 'Informations',
      icon: <Tag className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Informations de la catégorie
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
              <div className="space-y-2">
                <Label className="text-slate-200">Nom</Label>
                <Input
                  value={editData.name}
                  onChange={handleNameChange}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Slug</Label>
                <Input
                  value={editData.slug}
                  onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={editData.displayOrder}
                  onChange={(e) => setEditData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editData.active}
                  onCheckedChange={(checked) => setEditData(prev => ({ ...prev, active: checked }))}
                  disabled={!isEditing}
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                />
                <Label className="text-slate-200">Catégorie active</Label>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Statut</Label>
                <div className="flex items-center space-x-2">
                  <Badge className={category.active ? "bg-green-600 hover:bg-green-700" : "bg-slate-600 hover:bg-slate-700"}>
                    <span className="flex items-center">
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
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Créée le</Label>
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  {new Date(category.createdAt).toLocaleDateString('fr-FR', {
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
                    disabled={updateCategory.isPending}
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
          {/* Suppression */}
          <Card className="bg-slate-800 border-slate-700 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer une Catégorie
              </CardTitle>
              <CardDescription className="text-slate-400">
                Supprimer définitivement cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setDeleteModal(true)}
                variant="outline"
                className="border-red-600 text-red-400 bg-red-900/20 hover:bg-red-800 hover:text-red-200 hover:border-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer la catégorie
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
          onClick={() => navigate('/mobile/categories')}
          className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {category.name}
          </h1>
          <p className="text-slate-300 mt-2">Gestion de la catégorie</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="info" />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
};
