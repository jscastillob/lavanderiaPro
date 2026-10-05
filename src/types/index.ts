export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaRegistro: string;
  notas: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tiempoEstimado: number; // en horas
  activo: boolean;
}

export type EstadoOrden = 'recibido' | 'en_lavado' | 'en_secado' | 'planchado' | 'listo' | 'entregado';

export interface Orden {
  id: string;
  numeroOrden: string;
  clienteId: string;
  servicios: { servicioId: string; cantidad: number }[];
  estado: EstadoOrden;
  fechaIngreso: string;
  fechaEstimadaEntrega: string;
  fechaEntrega?: string;
  total: number;
  notas: string;
  pagado: boolean;
}

export interface DashboardStats {
  ordenesHoy: number;
  ordenesEnProceso: number;
  ordenesListas: number;
  ingresosHoy: number;
  ingresosMes: number;
  clientesTotales: number;
}
