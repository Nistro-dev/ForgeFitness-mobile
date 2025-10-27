import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCategory } from '@/hooks/api/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    displayOrder: 0,
    active: true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Le slug est requis');
      return;
    }

    try {
      await createCategory.mutateAsync(formData);
      toast.success('Catégorie créée avec succès');
      navigate('/mobile/categories');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la catégorie');
    }
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold text-white">Nouvelle catégorie</h1>
          <p className="text-slate-300 mt-2">Créez une nouvelle catégorie de produits</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-white">Informations de la catégorie</CardTitle>
          <CardDescription className="text-slate-400">
            Remplissez les informations pour créer une nouvelle catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Nom de la catégorie *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Vêtements de sport"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-200">Slug *</Label>
              <Input
                id="slug"
                type="text"
                placeholder="Ex: vetements-sport"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Le slug est généré automatiquement à partir du nom. Il doit contenir uniquement des lettres minuscules, chiffres et tirets.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder" className="text-slate-200">Ordre d'affichage</Label>
              <Input
                id="displayOrder"
                type="number"
                placeholder="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Plus le nombre est petit, plus la catégorie apparaîtra en haut de la liste.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active" className="text-slate-200">Catégorie active</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createCategory.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createCategory.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer la catégorie
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/mobile/categories')}
                className="border-red-600 text-red-400 bg-red-900/20 hover:bg-red-800 hover:text-red-200 hover:border-red-500"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};
