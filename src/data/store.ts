import { Cliente, Servicio, Orden, DashboardStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// CAPA DE DATOS - Simulación con localStorage
// Para producción con SQL Server, reemplazar estas funciones
// con llamadas a un API REST (ver /api/README.md)
// ============================================================

const STORAGE_KEYS = {
  clientes: 'lavanderia_clientes',
  servicios: 'lavanderia_servicios',
  ordenes: 'lavanderia_ordenes',
  counter: 'lavanderia_counter',
};

// --- UTILIDADES ---
function getFromStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getNextOrderNumber(): string {
  const counter = getFromStorage<number>(STORAGE_KEYS.counter, 0) + 1;
  saveToStorage(STORAGE_KEYS.counter, counter);
  const date = new Date();
  return `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(counter).padStart(4, '0')}`;
}

// --- CLIENTES ---
export const getClientes = (): Cliente[] => {
  return getFromStorage<Cliente[]>(STORAGE_KEYS.clientes, []);
};

export const getClienteById = (id: string): Cliente | undefined => {
  return getClientes().find(c => c.id === id);
};

export const saveCliente = (cliente: Omit<Cliente, 'id' | 'fechaRegistro'>): Cliente => {
  const clientes = getClientes();
  const nuevo: Cliente = {
    ...cliente,
    id: uuidv4(),
    fechaRegistro: new Date().toISOString(),
  };
  clientes.push(nuevo);
  saveToStorage(STORAGE_KEYS.clientes, clientes);
  return nuevo;
};

export const updateCliente = (id: string, data: Partial<Cliente>): Cliente | undefined => {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  clientes[index] = { ...clientes[index], ...data };
  saveToStorage(STORAGE_KEYS.clientes, clientes);
  return clientes[index];
};

export const deleteCliente = (id: string): boolean => {
  const clientes = getClientes();
  const filtered = clientes.filter(c => c.id !== id);
  if (filtered.length === clientes.length) return false;
  saveToStorage(STORAGE_KEYS.clientes, filtered);
  return true;
};

// --- SERVICIOS ---
export const getServicios = (): Servicio[] => {
  const servicios = getFromStorage<Servicio[]>(STORAGE_KEYS.servicios, []);
  if (servicios.length === 0) {
    // Datos iniciales
    const iniciales: Servicio[] = [
      { id: uuidv4(), nombre: 'Lavado Básico', descripcion: 'Lavado y secado estándar', precio: 50, tiempoEstimado: 24, activo: true },
      { id: uuidv4(), nombre: 'Lavado Premium', descripcion: 'Lavado con suavizante especial', precio: 80, tiempoEstimado: 24, activo: true },
      { id: uuidv4(), nombre: 'Planchado', descripcion: 'Planchado profesional', precio: 40, tiempoEstimado: 12, activo: true },
      { id: uuidv4(), nombre: 'Lavado en Seco', descripcion: 'Para prendas delicadas', precio: 120, tiempoEstimado: 48, activo: true },
      { id: uuidv4(), nombre: 'Edredones', descripcion: 'Lavado de edredones y cobijas', precio: 150, tiempoEstimado: 48, activo: true },
      { id: uuidv4(), nombre: 'Cortinas', descripcion: 'Lavado de cortinas', precio: 100, tiempoEstimado: 48, activo: true },
    ];
    saveToStorage(STORAGE_KEYS.servicios, iniciales);
    return iniciales;
  }
  return servicios;
};

export const saveServicio = (servicio: Omit<Servicio, 'id'>): Servicio => {
  const servicios = getServicios();
  const nuevo: Servicio = { ...servicio, id: uuidv4() };
  servicios.push(nuevo);
  saveToStorage(STORAGE_KEYS.servicios, servicios);
  return nuevo;
};

export const updateServicio = (id: string, data: Partial<Servicio>): Servicio | undefined => {
  const servicios = getServicios();
  const index = servicios.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  servicios[index] = { ...servicios[index], ...data };
  saveToStorage(STORAGE_KEYS.servicios, servicios);
  return servicios[index];
};

export const deleteServicio = (id: string): boolean => {
  const servicios = getServicios();
  const filtered = servicios.filter(s => s.id !== id);
  if (filtered.length === servicios.length) return false;
  saveToStorage(STORAGE_KEYS.servicios, filtered);
  return true;
};

// --- ÓRDENES ---
export const getOrdenes = (): Orden[] => {
  return getFromStorage<Orden[]>(STORAGE_KEYS.ordenes, []);
};

export const getOrdenById = (id: string): Orden | undefined => {
  return getOrdenes().find(o => o.id === id);
};

export const saveOrden = (orden: Omit<Orden, 'id' | 'numeroOrden'>): Orden => {
  const ordenes = getOrdenes();
  const nueva: Orden = {
    ...orden,
    id: uuidv4(),
    numeroOrden: getNextOrderNumber(),
  };
  ordenes.push(nueva);
  saveToStorage(STORAGE_KEYS.ordenes, ordenes);
  return nueva;
};

export const updateOrden = (id: string, data: Partial<Orden>): Orden | undefined => {
  const ordenes = getOrdenes();
  const index = ordenes.findIndex(o => o.id === id);
  if (index === -1) return undefined;
  ordenes[index] = { ...ordenes[index], ...data };
  saveToStorage(STORAGE_KEYS.ordenes, ordenes);
  return ordenes[index];
};

export const deleteOrden = (id: string): boolean => {
  const ordenes = getOrdenes();
  const filtered = ordenes.filter(o => o.id !== id);
  if (filtered.length === ordenes.length) return false;
  saveToStorage(STORAGE_KEYS.ordenes, filtered);
  return true;
};

// --- ESTADÍSTICAS ---
export const getDashboardStats = (): DashboardStats => {
  const ordenes = getOrdenes();
  const clientes = getClientes();
  const hoy = new Date().toDateString();

  const ordenesHoy = ordenes.filter(o => new Date(o.fechaIngreso).toDateString() === hoy).length;
  const ordenesEnProceso = ordenes.filter(o => !['listo', 'entregado'].includes(o.estado)).length;
  const ordenesListas = ordenes.filter(o => o.estado === 'listo').length;
  
  const ingresosHoy = ordenes
    .filter(o => new Date(o.fechaIngreso).toDateString() === hoy)
    .reduce((sum, o) => sum + o.total, 0);

  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  const ingresosMes = ordenes
    .filter(o => {
      const d = new Date(o.fechaIngreso);
      return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    })
    .reduce((sum, o) => sum + o.total, 0);

  return {
    ordenesHoy,
    ordenesEnProceso,
    ordenesListas,
    ingresosHoy,
    ingresosMes,
    clientesTotales: clientes.length,
  };
};

export const getReporteIngresos = () => {
  const ordenes = getOrdenes();
  const hoy = new Date();
  const dias: { fecha: string; ingresos: number; ordenes: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toISOString().split('T')[0];
    const ordenesDia = ordenes.filter(o => o.fechaIngreso.split('T')[0] === fechaStr);
    dias.push({
      fecha: fechaStr,
      ingresos: ordenesDia.reduce((sum, o) => sum + o.total, 0),
      ordenes: ordenesDia.length,
    });
  }
  return dias;
};

export const getReporteServicios = () => {
  const ordenes = getOrdenes();
  const servicios = getServicios();
  const conteo: Record<string, number> = {};

  ordenes.forEach(orden => {
    orden.servicios.forEach(s => {
      const servicio = servicios.find(sv => sv.id === s.servicioId);
      const nombre = servicio?.nombre || 'Desconocido';
      conteo[nombre] = (conteo[nombre] || 0) + s.cantidad;
    });
  });

  return Object.entries(conteo).map(([nombre, cantidad]) => ({ nombre, cantidad }));
};

// --- DATOS DE DEMO ---
export const generarDatosDemo = () => {
  const clientes = getClientes();
  if (clientes.length > 0) return; // Ya hay datos

  const nombres = ['María García', 'Juan Pérez', 'Ana López', 'Carlos Ruiz', 'Laura Martínez', 'Pedro Sánchez', 'Sofia Torres', 'Miguel Hernández'];
  const telefonos = ['555-0101', '555-0102', '555-0103', '555-0104', '555-0105', '555-0106', '555-0107', '555-0108'];

  nombres.forEach((nombre, i) => {
    saveCliente({
      nombre,
      telefono: telefonos[i],
      email: `${nombre.split(' ')[0].toLowerCase()}@email.com`,
      direccion: `Calle ${i + 1} #${(i + 1) * 100}`,
      notas: '',
    });
  });

  const servicios = getServicios();
  const clientesGuardados = getClientes();

  // Generar órdenes de los últimos 30 días
  for (let i = 0; i < 25; i++) {
    const diasAtras = Math.floor(Math.random() * 30);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);

    const cliente = clientesGuardados[Math.floor(Math.random() * clientesGuardados.length)];
    const numServicios = Math.floor(Math.random() * 3) + 1;
    const serviciosSeleccionados: { servicioId: string; cantidad: number }[] = [];
    let total = 0;

    for (let j = 0; j < numServicios; j++) {
      const servicio = servicios[Math.floor(Math.random() * servicios.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1;
      serviciosSeleccionados.push({ servicioId: servicio.id, cantidad });
      total += servicio.precio * cantidad;
    }

    const estados: Array<'recibido' | 'en_lavado' | 'en_secado' | 'planchado' | 'listo' | 'entregado'> = 
      ['recibido', 'en_lavado', 'en_secado', 'planchado', 'listo', 'entregado'];
    const estado = diasAtras === 0 ? estados[Math.floor(Math.random() * 3)] : estados[Math.floor(Math.random() * 6)];

    const fechaEntrega = new Date(fecha);
    fechaEntrega.setHours(fechaEntrega.getHours() + 48);

    saveOrden({
      clienteId: cliente.id,
      servicios: serviciosSeleccionados,
      estado,
      fechaIngreso: fecha.toISOString(),
      fechaEstimadaEntrega: fechaEntrega.toISOString(),
      fechaEntrega: estado === 'entregado' ? new Date(fecha.getTime() + 86400000 * 2).toISOString() : undefined,
      total,
      notas: '',
      pagado: estado === 'entregado',
    });
  }
};
