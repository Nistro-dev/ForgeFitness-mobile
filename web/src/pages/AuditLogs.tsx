import React, { useState } from 'react';
import { useAuditLogs, useAuditStats } from '@/hooks/api/useAudit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuditLogDetailModal } from '@/components/common/AuditLogDetailModal';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  User, 
  Activity, 
  Database,
  Eye,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react';
import { AuditLogFilters, AuditLog } from '@/api/types/audit.types';

export const AuditLogs: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: logs, isLoading, error, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditStats();

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 50 });
    setSearchTerm('');
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLog(null);
  };

  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity.toLowerCase().includes(searchLower) ||
      log.entityId.toLowerCase().includes(searchLower) ||
      log.user?.email.toLowerCase().includes(searchLower) ||
      log.user?.firstName.toLowerCase().includes(searchLower) ||
      log.user?.lastName.toLowerCase().includes(searchLower)
    );
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-600 hover:bg-green-700';
    if (action.includes('UPDATE')) return 'bg-blue-600 hover:bg-blue-700';
    if (action.includes('DELETE')) return 'bg-red-600 hover:bg-red-700';
    if (action.includes('REVOKE')) return 'bg-orange-600 hover:bg-orange-700';
    return 'bg-slate-600 hover:bg-slate-700';
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'User': return <User className="h-4 w-4" />;
      case 'Product': return <Database className="h-4 w-4" />;
      case 'Category': return <Database className="h-4 w-4" />;
      case 'Order': return <Activity className="h-4 w-4" />;
      case 'Session': return <Monitor className="h-4 w-4" />;
      case 'Device': return <Monitor className="h-4 w-4" />;
      case 'ActivationKey': return <Activity className="h-4 w-4" />;
      case 'StockMovement': return <Activity className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erreur lors du chargement des logs</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Logs d'Audit</h1>
          <p className="text-slate-300 mt-2">Historique de toutes les actions du système</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Logs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
                </div>
                <Database className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Entités</p>
                  <p className="text-2xl font-bold text-white">{Object.keys(stats.logsByEntity).length}</p>
                </div>
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Actions</p>
                  <p className="text-2xl font-bold text-white">{Object.keys(stats.logsByAction).length}</p>
                </div>
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Activité Récente</p>
                  <p className="text-2xl font-bold text-white">{stats.recentActivity.length}</p>
                </div>
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Entité</Label>
              <Select value={filters.entity || 'all'} onValueChange={(value) => handleFilterChange('entity', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue placeholder="Toutes les entités" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-200 hover:bg-slate-700">Toutes</SelectItem>
                  <SelectItem value="User" className="text-slate-200 hover:bg-slate-700">Utilisateurs</SelectItem>
                  <SelectItem value="Product" className="text-slate-200 hover:bg-slate-700">Produits</SelectItem>
                  <SelectItem value="Category" className="text-slate-200 hover:bg-slate-700">Catégories</SelectItem>
                  <SelectItem value="Order" className="text-slate-200 hover:bg-slate-700">Commandes</SelectItem>
                  <SelectItem value="Session" className="text-slate-200 hover:bg-slate-700">Sessions</SelectItem>
                  <SelectItem value="Device" className="text-slate-200 hover:bg-slate-700">Appareils</SelectItem>
                  <SelectItem value="ActivationKey" className="text-slate-200 hover:bg-slate-700">Clés d'activation</SelectItem>
                  <SelectItem value="StockMovement" className="text-slate-200 hover:bg-slate-700">Mouvements de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Action</Label>
              <Select value={filters.action || 'all'} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-200 hover:bg-slate-700">Toutes</SelectItem>
                  <SelectItem value="CREATE" className="text-slate-200 hover:bg-slate-700">Création</SelectItem>
                  <SelectItem value="UPDATE" className="text-slate-200 hover:bg-slate-700">Modification</SelectItem>
                  <SelectItem value="DELETE" className="text-slate-200 hover:bg-slate-700">Suppression</SelectItem>
                  <SelectItem value="REVOKE" className="text-slate-200 hover:bg-slate-700">Révocation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Limite</Label>
              <Select value={filters.limit?.toString() || '50'} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="25" className="text-slate-200 hover:bg-slate-700">25</SelectItem>
                  <SelectItem value="50" className="text-slate-200 hover:bg-slate-700">50</SelectItem>
                  <SelectItem value="100" className="text-slate-200 hover:bg-slate-700">100</SelectItem>
                  <SelectItem value="200" className="text-slate-200 hover:bg-slate-700">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white"
            >
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Logs d'Audit</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredLogs?.length || 0} logs trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs && filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Entité</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Contexte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewLog(log)}
                    >
                      <td className="px-4 py-3">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(log.entity)}
                          <span className="text-white font-medium">{log.entity}</span>
                          <span className="text-slate-400 text-sm">#{log.entityId.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-white text-sm">{log.user.firstName} {log.user.lastName}</p>
                              <p className="text-slate-400 text-xs">{log.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">Système</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {log.ipAddress && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-400 text-xs">{log.ipAddress}</span>
                            </div>
                          )}
                          {log.userAgent && (
                            <div className="flex items-center space-x-1">
                              <Monitor className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-400 text-xs truncate max-w-32">
                                {log.userAgent.split(' ')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <p className="text-slate-400 text-lg">Aucun log trouvé</p>
              <p className="text-slate-500 text-sm">Ajustez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <AuditLogDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
