import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '@/hooks/api/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Steps } from '@/components/ui/steps';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  UserCheck, 
  UserX, 
  UserMinus, 
  CheckCircle,
  ArrowRight,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'COACH',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED' | 'BANNED',
  });

  const steps = [
    {
      id: 'info',
      title: 'Informations personnelles',
      description: 'Nom, prénom et email',
      icon: <User className="h-4 w-4" />,
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Mot de passe et rôle',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: 'review',
      title: 'Validation',
      description: 'Vérification et création',
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
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
      await createUser.mutateAsync({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password || undefined,
        role: formData.role,
        status: formData.status,
      });
      toast.success('Utilisateur créé avec succès !');
      navigate('/users');
    } catch (error: any) {
      toast.error(`Erreur lors de la création : ${error.message}`);
    }
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
      case 1:
        return true; // Le mot de passe est optionnel
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
                <User className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
              <CardDescription className="text-slate-400">
                Saisissez les informations de base de l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-200">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Prénom de l'utilisateur"
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-200">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Nom de l'utilisateur"
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemple.com"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  required
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Sécurité et permissions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurez le mot de passe et les permissions de l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Laissez vide pour générer un code d'activation"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Si aucun mot de passe n'est défini, l'utilisateur devra utiliser un code d'activation
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-200">Rôle</Label>
                  <Select value={formData.role} onValueChange={(value: 'USER' | 'ADMIN' | 'COACH') => handleInputChange('role', value)}>
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
                <div className="space-y-2">
                  <Label className="text-slate-200">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'DISABLED' | 'BANNED') => handleInputChange('status', value)}>
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
                Vérifiez les informations avant de créer l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Récapitulatif</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-400 text-sm">Nom complet</Label>
                      <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Email</Label>
                      <p className="text-white font-medium">{formData.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-400 text-sm">Rôle</Label>
                      <p className="text-white font-medium">{formData.role}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Statut</Label>
                      <p className="text-white font-medium">{formData.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <Label className="text-slate-400 text-sm">Authentification</Label>
                  <p className="text-white font-medium">
                    {formData.password ? 'Mot de passe défini' : 'Code d\'activation requis'}
                  </p>
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
          onClick={() => navigate('/users')}
          className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Nouvel utilisateur</h1>
          <p className="text-slate-300 mt-2">Créez un nouvel utilisateur en quelques étapes</p>
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
              disabled={!canProceed || createUser.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {createUser.isPending ? 'Création...' : 'Créer l\'utilisateur'}
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
