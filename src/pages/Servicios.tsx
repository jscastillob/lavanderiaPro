import { useState, useEffect } from 'react';
import { Servicio } from '../types';
import { getServicios, saveServicio, updateServicio, deleteServicio } from '../data/store';

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: 0, tiempoEstimado: 24, activo: true });

  useEffect(() => {
    setServicios(getServicios());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateServicio(editingId, form);
    } else {
      saveServicio(form);
    }
    setServicios(getServicios());
    setShowModal(false);
    setEditingId(null);
    setForm({ nombre: '', descripcion: '', precio: 0, tiempoEstimado: 24, activo: true });
  };

  const handleEdit = (servicio: Servicio) => {
    setForm({ nombre: servicio.nombre, descripcion: servicio.descripcion, precio: servicio.precio, tiempoEstimado: servicio.tiempoEstimado, activo: servicio.activo });
    setEditingId(servicio.id);
    setShowModal(true);
  };

  const handleToggle = (id: string, activo: boolean) => {
    updateServicio(id, { activo: !activo });
    setServicios(getServicios());
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este servicio?')) {
      deleteServicio(id);
      setServicios(getServicios());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Gestión de Servicios</h3>
          <p className="text-sm text-gray-500">{servicios.length} servicios configurados</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ nombre: '', descripcion: '', precio: 0, tiempoEstimado: 24, activo: true }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Nuevo Servicio
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map(servicio => (
          <div key={servicio.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md ${!servicio.activo ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tshirt text-blue-600"></i>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(servicio.id, servicio.activo)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${servicio.activo ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${servicio.activo ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{servicio.nombre}</h4>
            <p className="text-sm text-gray-500 mb-4">{servicio.descripcion}</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-blue-600">${servicio.precio}</span>
                <span className="text-sm text-gray-500 ml-1">/prenda</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                <i className="fas fa-clock mr-1"></i>{servicio.tiempoEstimado}h
              </span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => handleEdit(servicio)} className="flex-1 text-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <i className="fas fa-edit mr-1"></i> Editar
              </button>
              <button onClick={() => handleDelete(servicio.id)} className="flex-1 text-center py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i className="fas fa-trash mr-1"></i> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Lavado Premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Descripción del servicio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo (horas)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.tiempoEstimado}
                    onChange={e => setForm({ ...form, tiempoEstimado: parseInt(e.target.value) || 24 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Servicio activo</span>
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
