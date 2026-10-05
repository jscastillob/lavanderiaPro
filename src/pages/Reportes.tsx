import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { getReporteIngresos, getReporteServicios, getOrdenes, getServicios, getClientes } from '../data/store';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function Reportes() {
  const [ingresosData, setIngresosData] = useState<{ fecha: string; ingresos: number; ordenes: number }[]>([]);
  const [serviciosData, setServiciosData] = useState<{ nombre: string; cantidad: number }[]>([]);
  const [estadoData, setEstadoData] = useState<{ name: string; value: number }[]>([]);
  const [periodo, setPeriodo] = useState<'7' | '15' | '30'>('30');

  useEffect(() => {
    setIngresosData(getReporteIngresos());
    setServiciosData(getReporteServicios());

    // Estado de órdenes
    const ordenes = getOrdenes();
    const conteo: Record<string, number> = {
      'Recibido': 0, 'En Lavado': 0, 'En Secado': 0, 'Planchado': 0, 'Listo': 0, 'Entregado': 0
    };
    const labels: Record<string, string> = {
      recibido: 'Recibido', en_lavado: 'En Lavado', en_secado: 'En Secado', planchado: 'Planchado', listo: 'Listo', entregado: 'Entregado'
    };
    ordenes.forEach(o => {
      const label = labels[o.estado];
      if (label) conteo[label]++;
    });
    setEstadoData(Object.entries(conteo).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })));
  }, []);

  const filteredIngresos = ingresosData.slice(-parseInt(periodo));
  const totalIngresos = filteredIngresos.reduce((sum, d) => sum + d.ingresos, 0);
  const totalOrdenes = filteredIngresos.reduce((sum, d) => sum + d.ordenes, 0);
  const promedioDiario = filteredIngresos.length > 0 ? totalIngresos / filteredIngresos.length : 0;

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Reportes y Estadísticas</h3>
          <p className="text-sm text-gray-500">Análisis del rendimiento del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Período:</span>
          {(['7', '15', '30'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p} días
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Ingresos Totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalIngresos.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1"><i className="fas fa-arrow-up"></i> Últimos {periodo} días</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Órdenes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrdenes}</p>
          <p className="text-xs text-blue-600 mt-1"><i className="fas fa-clipboard-list"></i> Últimos {periodo} días</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Promedio Diario</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${Math.round(promedioDiario).toLocaleString()}</p>
          <p className="text-xs text-purple-600 mt-1"><i className="fas fa-chart-bar"></i> Por día</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Ticket Promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${totalOrdenes > 0 ? Math.round(totalIngresos / totalOrdenes).toLocaleString() : 0}
          </p>
          <p className="text-xs text-orange-600 mt-1"><i className="fas fa-receipt"></i> Por orden</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingresos Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Ingresos por Día</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredIngresos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tickFormatter={formatFecha} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString('es-ES')}`}
              />
              <Line type="monotone" dataKey="ingresos" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estado Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Órdenes por Estado</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {estadoData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes por día */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Órdenes por Día</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredIngresos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tickFormatter={formatFecha} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Órdenes']}
                labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString('es-ES')}`}
              />
              <Bar dataKey="ordenes" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Servicios más solicitados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Servicios Más Solicitados</h4>
          {serviciosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={serviciosData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value: number) => [value, 'Cantidad']} />
                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                  {serviciosData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              <p>No hay datos de servicios</p>
            </div>
          )}
        </div>
      </div>

      {/* SQL Server Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">
          <i className="fas fa-database text-blue-600 mr-2"></i>
          Configuración para SQL Server + IIS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Backend API (C# / ASP.NET)</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Crear proyecto ASP.NET Web API</li>
              <li>• Configurar Entity Framework con SQL Server</li>
              <li>• Crear endpoints REST para cada entidad</li>
              <li>• Publicar en IIS con el módulo de ASP.NET</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h5 className="font-medium text-green-800 mb-2">Base de Datos (SQL Server)</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tablas: Clientes, Servicios, Ordenes, DetalleOrden</li>
              <li>• Relaciones con Foreign Keys</li>
              <li>• Índices para búsqueda rápida</li>
              <li>• Stored Procedures para reportes</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-700 mb-2">Estructura SQL sugerida:</h5>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`CREATE TABLE Clientes (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Nombre NVARCHAR(100) NOT NULL,
  Telefono NVARCHAR(20),
  Email NVARCHAR(100),
  Direccion NVARCHAR(200),
  Notas NVARCHAR(500),
  FechaRegistro DATETIME DEFAULT GETDATE()
);

CREATE TABLE Servicios (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Nombre NVARCHAR(100) NOT NULL,
  Descripcion NVARCHAR(300),
  Precio DECIMAL(10,2) NOT NULL,
  TiempoEstimado INT NOT NULL,
  Activo BIT DEFAULT 1
);

CREATE TABLE Ordenes (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  NumeroOrden NVARCHAR(20) UNIQUE NOT NULL,
  ClienteId UNIQUEIDENTIFIER REFERENCES Clientes(Id),
  Estado NVARCHAR(20) DEFAULT 'recibido',
  FechaIngreso DATETIME DEFAULT GETDATE(),
  FechaEstimadaEntrega DATETIME,
  FechaEntrega DATETIME,
  Total DECIMAL(10,2),
  Pagado BIT DEFAULT 0,
  Notas NVARCHAR(500)
);

CREATE TABLE DetalleOrden (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  OrdenId UNIQUEIDENTIFIER REFERENCES Ordenes(Id),
  ServicioId UNIQUEIDENTIFIER REFERENCES Servicios(Id),
  Cantidad INT NOT NULL
);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
