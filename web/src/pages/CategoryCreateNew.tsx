import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCategory } from '@/hooks/api/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Steps } from '@/components/ui/steps';
import { 
  ArrowLeft, 
  Tag, 
  Settings, 
  CheckCircle,
  ArrowRight,
  Save,
  Eye,
  EyeOff,
  Hash,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export const CategoryCreateNew: React.FC = () => {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    displayOrder: 0,
    active: true,
  });

  const steps = [
    {
      id: 'info',
      title: 'Informations de base',
      description: 'Nom, slug et ordre',
      icon: <Tag className="h-4 w-4" />,
    },
    {
      id: 'settings',
      title: 'Configuration',
      description: 'Statut et paramètres',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: 'review',
      title: 'Validation',
      description: 'Vérification et création',
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await createCategory.mutateAsync(formData);
      toast.success('Catégorie créée avec succès !');
      navigate('/mobile/categories');
    } catch (error: any) {
      toast.error(`Erreur lors de la création : ${error.message}`);
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
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: generateSlug(newName),
    }));
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return formData.name.trim() && formData.slug.trim();
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Informations de base
              </CardTitle>
              <CardDescription className="text-slate-400">
                Saisissez les informations principales de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Nom de la catégorie *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ex: Suppléments, Équipements..."
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-200">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="ex: supplements, equipements"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  required
                />
                <p className="text-xs text-slate-400">
                  Le slug est généré automatiquement à partir du nom
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder" className="text-slate-200">Ordre d'affichage</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Détermine l'ordre d'affichage dans la liste (plus petit = plus haut)
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurez le statut et les paramètres de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-mode"
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange('active', checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                  />
                  <Label htmlFor="active-mode" className="text-slate-200">Catégorie active</Label>
                </div>
                <p className="text-sm text-slate-400">
                  Une catégorie active sera visible pour les utilisateurs. 
                  Une catégorie inactive sera masquée mais conservée.
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-200 mb-2">Aperçu du statut</h4>
                <div className="flex items-center space-x-2">
                  {formData.active ? (
                    <>
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-green-400 text-sm">Catégorie visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-400 text-sm">Catégorie masquée</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Validation
              </CardTitle>
              <CardDescription className="text-slate-400">
                Vérifiez les informations avant de créer la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Récapitulatif</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-400 text-sm">Nom</Label>
                      <p className="text-white font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Slug</Label>
                      <p className="text-white font-medium font-mono">{formData.slug}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-400 text-sm">Ordre d'affichage</Label>
                      <div className="flex items-center text-white font-medium">
                        <Hash className="h-4 w-4 mr-1 text-slate-400" />
                        {formData.displayOrder}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Statut</Label>
                      <div className="flex items-center">
                        {formData.active ? (
                          <>
                            <Eye className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-400 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1 text-slate-500" />
                            <span className="text-slate-400 font-medium">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <Label className="text-slate-400 text-sm">Date de création</Label>
                  <div className="flex items-center text-white font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {new Date().toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Nouvelle catégorie</h1>
          <p className="text-slate-300 mt-2">Créez une nouvelle catégorie en quelques étapes</p>
        </div>
      </div>

      {/* Steps */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <Steps steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || createCategory.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {createCategory.isPending ? 'Création...' : 'Créer la catégorie'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
