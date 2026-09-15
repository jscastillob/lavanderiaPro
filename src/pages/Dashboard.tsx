import { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { getDashboardStats, getOrdenes, getClientes, generarDatosDemo } from '../data/store';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    generarDatosDemo();
    setStats(getDashboardStats());
  }, []);

  if (!stats) return null;

  const ordenes = getOrdenes().sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()).slice(0, 5);
  const clientes = getClientes();

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      recibido: 'bg-blue-100 text-blue-800',
      en_lavado: 'bg-yellow-100 text-yellow-800',
      en_secado: 'bg-orange-100 text-orange-800',
      planchado: 'bg-purple-100 text-purple-800',
      listo: 'bg-green-100 text-green-800',
      entregado: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      recibido: 'Recibido',
      en_lavado: 'En Lavado',
      en_secado: 'En Secado',
      planchado: 'Planchado',
      listo: 'Listo',
      entregado: 'Entregado',
    };
    return labels[estado] || estado;
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nombre || 'Desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Órdenes Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.ordenesHoy}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-clipboard-list text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Proceso</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.ordenesEnProceso}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-spinner text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${stats.ingresosHoy.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${stats.ingresosMes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          to="/ordenes"
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-plus text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-lg">Nueva Orden</p>
              <p className="text-blue-200 text-sm">Registrar una nueva orden de lavado</p>
            </div>
          </div>
        </Link>

        <Link
          to="/clientes"
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-plus text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-lg">Nuevo Cliente</p>
              <p className="text-emerald-200 text-sm">Registrar un nuevo cliente</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reportes"
          className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-lg">Ver Reportes</p>
              <p className="text-purple-200 text-sm">Estadísticas y análisis</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Órdenes Recientes</h3>
            <Link to="/ordenes" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todas <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordenes.map(orden => (
                <tr key={orden.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{orden.numeroOrden}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getClienteNombre(orden.clienteId)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${orden.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                      {getEstadoLabel(orden.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(orden.fechaIngreso).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Clientes</span>
              <span className="text-2xl font-bold text-gray-900">{stats.clientesTotales}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Órdenes Listas</span>
              <span className="text-2xl font-bold text-green-600">{stats.ordenesListas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Órdenes en Proceso</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.ordenesEnProceso}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Base de datos: Conectada (Local)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Servidor: Operativo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Modo: LocalStorage (Demo)</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <i className="fas fa-info-circle mr-1"></i>
                Para producción con SQL Server, configurar el backend API. Ver documentación incluida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
