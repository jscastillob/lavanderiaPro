import { useState, useEffect } from 'react';
import { Orden, EstadoOrden } from '../types';
import { getOrdenes, saveOrden, updateOrden, deleteOrden, getClientes, getServicios } from '../data/store';

const ESTADOS: { value: EstadoOrden; label: string; color: string }[] = [
  { value: 'recibido', label: 'Recibido', color: 'bg-blue-100 text-blue-800' },
  { value: 'en_lavado', label: 'En Lavado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_secado', label: 'En Secado', color: 'bg-orange-100 text-orange-800' },
  { value: 'planchado', label: 'Planchado', color: 'bg-purple-100 text-purple-800' },
  { value: 'listo', label: 'Listo', color: 'bg-green-100 text-green-800' },
  { value: 'entregado', label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
];

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    clienteId: '',
    servicios: [{ servicioId: '', cantidad: 1 }],
    estado: 'recibido' as EstadoOrden,
    fechaEstimadaEntrega: '',
    notas: '',
    pagado: false,
  });

  const clientes = getClientes();
  const servicios = getServicios();

  useEffect(() => {
    setOrdenes(getOrdenes().sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()));
  }, []);

  const filtered = ordenes.filter(o => {
    const matchEstado = filterEstado === 'todos' || o.estado === filterEstado;
    const cliente = clientes.find(c => c.id === o.clienteId);
    const matchSearch = o.numeroOrden.toLowerCase().includes(search.toLowerCase()) ||
      (cliente?.nombre || '').toLowerCase().includes(search.toLowerCase());
    return matchEstado && matchSearch;
  });

  const calcularTotal = (serviciosSel: { servicioId: string; cantidad: number }[]) => {
    return serviciosSel.reduce((total, s) => {
      const servicio = servicios.find(sv => sv.id === s.servicioId);
      return total + (servicio?.precio || 0) * s.cantidad;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calcularTotal(form.servicios);

    if (editingId) {
      updateOrden(editingId, { ...form, total });
    } else {
      const fechaEntrega = new Date();
      fechaEntrega.setHours(fechaEntrega.getHours() + 48);
      saveOrden({
        ...form,
        total,
        fechaIngreso: new Date().toISOString(),
        fechaEstimadaEntrega: form.fechaEstimadaEntrega || fechaEntrega.toISOString(),
      });
    }
    setOrdenes(getOrdenes().sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()));
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      clienteId: '',
      servicios: [{ servicioId: '', cantidad: 1 }],
      estado: 'recibido',
      fechaEstimadaEntrega: '',
      notas: '',
      pagado: false,
    });
  };

  const handleEdit = (orden: Orden) => {
    setForm({
      clienteId: orden.clienteId,
      servicios: orden.servicios,
      estado: orden.estado,
      fechaEstimadaEntrega: orden.fechaEstimadaEntrega.split('T')[0],
      notas: orden.notas,
      pagado: orden.pagado,
    });
    setEditingId(orden.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta orden?')) {
      deleteOrden(id);
      setOrdenes(getOrdenes().sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()));
    }
  };

  const handleEstadoChange = (id: string, nuevoEstado: EstadoOrden) => {
    const data: Partial<Orden> = { estado: nuevoEstado };
    if (nuevoEstado === 'entregado') {
      data.fechaEntrega = new Date().toISOString();
      data.pagado = true;
    }
    updateOrden(id, data);
    setOrdenes(getOrdenes().sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()));
  };

  const addServicio = () => {
    setForm({ ...form, servicios: [...form.servicios, { servicioId: '', cantidad: 1 }] });
  };

  const removeServicio = (index: number) => {
    const nuevos = form.servicios.filter((_, i) => i !== index);
    setForm({ ...form, servicios: nuevos.length > 0 ? nuevos : [{ servicioId: '', cantidad: 1 }] });
  };

  const getClienteNombre = (clienteId: string) => {
    return clientes.find(c => c.id === clienteId)?.nombre || 'Desconocido';
  };

  const getServicioNombre = (servicioId: string) => {
    return servicios.find(s => s.id === servicioId)?.nombre || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Gestión de Órdenes</h3>
          <p className="text-sm text-gray-500">{ordenes.length} órdenes registradas</p>
        </div>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Nueva Orden
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por orden o cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(orden => {
                const estadoInfo = ESTADOS.find(e => e.value === orden.estado);
                return (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">{orden.numeroOrden}</span>
                      {orden.pagado && <i className="fas fa-check-circle text-green-500 ml-2" title="Pagado"></i>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getClienteNombre(orden.clienteId)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {orden.servicios.map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {getServicioNombre(s.servicioId)} x{s.cantidad}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${orden.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={orden.estado}
                        onChange={e => handleEstadoChange(orden.id, e.target.value as EstadoOrden)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${estadoInfo?.color || ''}`}
                      >
                        {ESTADOS.map(e => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(orden.fechaIngreso).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(orden)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(orden.id)} className="text-red-600 hover:text-red-800">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3 block"></i>
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingId ? 'Editar Orden' : 'Nueva Orden'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={form.clienteId}
                    onChange={e => setForm({ ...form, clienteId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value as EstadoOrden })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ESTADOS.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Servicios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicios</label>
                <div className="space-y-2">
                  {form.servicios.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={s.servicioId}
                        onChange={e => {
                          const nuevos = [...form.servicios];
                          nuevos[i].servicioId = e.target.value;
                          setForm({ ...form, servicios: nuevos });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar servicio</option>
                        {servicios.filter(sv => sv.activo).map(sv => (
                          <option key={sv.id} value={sv.id}>{sv.nombre} - ${sv.precio}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={s.cantidad}
                        onChange={e => {
                          const nuevos = [...form.servicios];
                          nuevos[i].cantidad = parseInt(e.target.value) || 1;
                          setForm({ ...form, servicios: nuevos });
                        }}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cant."
                      />
                      <button type="button" onClick={() => removeServicio(i)} className="text-red-500 hover:text-red-700 p-2">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addServicio} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <i className="fas fa-plus mr-1"></i> Agregar servicio
                </button>
              </div>

              {/* Total Preview */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Total estimado:</span>
                  <span className="text-2xl font-bold text-blue-800">${calcularTotal(form.servicios).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    value={form.fechaEstimadaEntrega}
                    onChange={e => setForm({ ...form, fechaEstimadaEntrega: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pagado}
                      onChange={e => setForm({ ...form, pagado: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pagado</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Instrucciones especiales, observaciones..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingId ? 'Actualizar' : 'Crear Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
