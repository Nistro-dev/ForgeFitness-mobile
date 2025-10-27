import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Monitor, 
  Database,
  ArrowRight,
  Copy
} from 'lucide-react';
import { AuditLog } from '@/api/types/audit.types';
import { toast } from 'sonner';

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-600 hover:bg-green-700';
    if (action.includes('UPDATE')) return 'bg-blue-600 hover:bg-blue-700';
    if (action.includes('DELETE')) return 'bg-red-600 hover:bg-red-700';
    if (action.includes('REVOKE')) return 'bg-orange-600 hover:bg-orange-700';
    return 'bg-slate-600 hover:bg-slate-700';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const formatJson = (obj: any) => {
    if (!obj) return 'Aucune donnée';
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-white">Détails du Log d'Audit</CardTitle>
            <CardDescription className="text-slate-400">
              ID: {log.id}
            </CardDescription>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Action et Entité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Action</h3>
              <Badge className={getActionColor(log.action)}>
                {log.action}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Entité</h3>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-slate-400" />
                <span className="text-white">{log.entity}</span>
                <span className="text-slate-400 text-sm">#{log.entityId}</span>
              </div>
            </div>
          </div>

          {/* Utilisateur */}
          <div className="space-y-2">
            <h3 className="text-slate-200 font-medium">Utilisateur</h3>
            {log.user ? (
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-white font-medium">{log.user.firstName} {log.user.lastName}</p>
                  <p className="text-slate-400 text-sm">{log.user.email}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-400">Action système</span>
              </div>
            )}
          </div>

          {/* Date et Contexte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Date</h3>
              <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">
                  {new Date(log.createdAt).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Contexte</h3>
              <div className="space-y-2">
                {log.ipAddress && (
                  <div className="flex items-center space-x-2 p-2 bg-slate-700 rounded">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">{log.ipAddress}</span>
                  </div>
                )}
                {log.userAgent && (
                  <div className="flex items-center space-x-2 p-2 bg-slate-700 rounded">
                    <Monitor className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm truncate">{log.userAgent}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ancienne et Nouvelle Valeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Ancienne Valeur</h3>
              <div className="relative">
                <pre className="bg-slate-900 p-4 rounded-lg text-slate-300 text-sm overflow-x-auto max-h-40">
                  {formatJson(log.oldValue)}
                </pre>
                <Button
                  onClick={() => copyToClipboard(formatJson(log.oldValue))}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Nouvelle Valeur</h3>
              <div className="relative">
                <pre className="bg-slate-900 p-4 rounded-lg text-slate-300 text-sm overflow-x-auto max-h-40">
                  {formatJson(log.newValue)}
                </pre>
                <Button
                  onClick={() => copyToClipboard(formatJson(log.newValue))}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Différence visuelle */}
          {log.oldValue && log.newValue && (
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">Changements</h3>
              <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <span className="text-sm">Ancien</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="text-sm">Nouveau</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
