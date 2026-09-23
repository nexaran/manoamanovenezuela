export interface VerifiedCase {
  id: string;
  code: string;
  familyName: string;
  contactPerson: string;
  location: string;
  parroquia: string;
  membersCount: number;
  childrenCount: number;
  elderlyCount: number;
  title: string;
  quote: string;
  narrative: string;
  neededItems: string[];
  targetAmount: number;
  raisedAmount: number;
  imageUrl: string;
  status: 'activo' | 'apadrinado' | 'en_progreso';
  verifiedDate: string;
  verifiedBy: string;
}

export interface PreRegistroEntry {
  id: string;
  caseId: string;
  fullName: string;
  cedula?: string;
  phone: string;
  location: string;
  parroquia: string;
  familyMembers: number;
  childrenCount: number;
  elderlyOrDisabled: boolean;
  priorityNeed: 'techo_materiales' | 'alimentos_agua' | 'medicinas_salud' | 'enseres_ropa' | 'otro';
  narrative: string;
  timestamp: string;
  status: 'recibido' | 'en_revision' | 'visita_coordinada' | 'verificado' | 'no_alcanzable';
  aiResponse?: {
    empatheticMessage: string;
    identifiedNeeds: string[];
    priorityAssessment: string;
    nextSteps: string[];
  };
  syncedToDrive?: boolean;
}

export const PRIORITY_NEEDS_LABELS: Record<string, string> = {
  techo_materiales: 'Reconstrucción / Techo / Materiales',
  alimentos_agua: 'Alimentos no perecederos y Agua potable',
  medicinas_salud: 'Atención Médica y Medicamentos',
  enseres_ropa: 'Colchonetas, Enseres y Ropa',
  otro: 'Otra necesidad urgente'
};

export interface PadrinoInquiryEntry {
  id: string;
  code: string;
  fullName: string;
  organization?: string;
  email: string;
  phone: string;
  supportType: 'apadrinamiento_familiar' | 'insumos_recurrentes' | 'financiero_reconstruccion' | 'organizacion_empresa' | 'otro';
  message: string;
  timestamp: string;
  status: 'recibido' | 'contactado' | 'expediente_enviado';
}

export const SUPPORT_TYPE_LABELS: Record<string, string> = {
  apadrinamiento_familiar: 'Apadrinamiento Directo de una Familia Afectada',
  insumos_recurrentes: 'Donación Periódica de Alimentos, Agua o Medicinas',
  financiero_reconstruccion: 'Aporte Financiero para Materiales de Techo / Reconstrucción',
  organizacion_empresa: 'Alianza Institucional / Empresa / Fundación',
  otro: 'Otra modalidad de apoyo'
};

export interface VoluntarioEntry {
  id: string;
  code: string;
  fullName: string;
  cedula?: string;
  phone: string;
  email?: string;
  parroquia: string;
  hasVehicle: 'no' | '4x4_rustico' | 'moto' | 'camioneta_pickup' | 'automovil' | 'otro';
  vehicleDetails?: string;
  skillsArea: 'logistica_terreno' | 'primeros_auxilios_salud' | 'cocina_alimentos' | 'mecanica_tecnico' | 'coordinacion_acopio' | 'otro';
  availability: 'fines_de_semana' | 'dias_de_semana' | 'emergencias_contingencia' | 'tiempo_completo';
  message?: string;
  timestamp: string;
  status: 'recibido' | 'convocado' | 'activo';
}

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  no: 'No poseo vehículo (Apoyo a pie / Centros de acopio)',
  '4x4_rustico': 'Vehículo Rústico 4x4 (Acceso a zonas difíciles / montaña)',
  moto: 'Motocicleta (Movilización rápida y mensajería)',
  camioneta_pickup: 'Camioneta / Pickup (Carga y transporte de bultos)',
  automovil: 'Automóvil particular (Traslado de personal / insumos medianos)',
  otro: 'Otro tipo de transporte'
};

export const SKILLS_AREA_LABELS: Record<string, string> = {
  logistica_terreno: 'Logística y Distribución en Terreno (Rutas y Albergues)',
  primeros_auxilios_salud: 'Primeros Auxilios / Atención Médica / Enfermería',
  cocina_alimentos: 'Cocina Comunitaria y Preparación de Raciones',
  mecanica_tecnico: 'Mecánica / Despeje de Vías / Apoyo Técnico',
  coordinacion_acopio: 'Clasificación, Embalaje e Inventario en Acopio',
  otro: 'Apoyo General y Mano de Obra'
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  fines_de_semana: 'Fines de Semana',
  dias_de_semana: 'Días de Semana (Lunes a Viernes)',
  emergencias_contingencia: 'Convocatorias de Contingencia y Emergencia Inmediata',
  tiempo_completo: 'Disponibilidad Amplia / Tiempo Completo'
};

export const INITIAL_VERIFIED_CASES: VerifiedCase[] = [
  {
    id: 'caso-01',
    code: 'CASO-LG-001',
    familyName: 'Familia Morales Rivas',
    contactPerson: 'Elena Morales',
    location: 'Sector Carlos Soublette, Calle El Progreso',
    parroquia: 'Maiquetía',
    membersCount: 4,
    childrenCount: 2,
    elderlyCount: 0,
    title: 'Reconstrucción de techo y cuarto infantil tras deslizamiento',
    quote: 'Agradecemos a los muchachos de la 99HDD que fueron los primeros en llegar con agua potable cuando todo colapsó. Soñamos con volver a techar el cuarto de los niños.',
    narrative: 'La vivienda de la señora Elena sufrió la caída parcial de la techumbre de zinc y el colapso de una pared medianera. Actualmente duermen en el área de la sala para proteger a sus dos hijos (de 5 y 8 años). El equipo de la Brigada 99HDD realizó la inspección física y corroboró la habitabilidad de la estructura principal con necesidad urgente de reposición de láminas y refuerzo.',
    neededItems: ['12 láminas de zinc calibre 26', '6 vigas de soporte', 'Kit de alimentos no perecederos para 1 mes'],
    targetAmount: 480,
    raisedAmount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    status: 'en_progreso',
    verifiedDate: '28 de Junio, 2026',
    verifiedBy: 'Brigada 99HDD - Equipo Alpha de Terreno'
  },
  {
    id: 'caso-02',
    code: 'CASO-LG-002',
    familyName: 'Hogar Doña Carmen y Nietos',
    contactPerson: 'Carmen Rosa Mendoza (68 años)',
    location: 'Sector Punta de Mulatos, Vereda 3',
    parroquia: 'La Guaira',
    membersCount: 4,
    childrenCount: 3,
    elderlyCount: 1,
    title: 'Reposición de enseres básicos y cocina comunitaria',
    quote: 'Mis tres nietos perdieron sus cuadernos y nuestra cocinita quedó bajo el lodo. Lo poco que tenemos hoy es gracias al comedor y el apoyo de los voluntarios.',
    narrative: 'Doña Carmen es el pilar de sus tres nietos en edad escolar. El lodo ingresó a la parte baja de su vivienda dañando la cocina a gas, colchonetas y uniformes escolares. La vivienda fue despejada por los vecinos y la brigada; requiere insumos puntuales de sustento y cocina para retomar la normalidad.',
    neededItems: ['Cocina a gas de 2 hornillas y manguera', '2 colchonetas individuales impermeables', 'Kits de útiles escolares y ropa de niños'],
    targetAmount: 320,
    raisedAmount: 220,
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    status: 'en_progreso',
    verifiedDate: '29 de Junio, 2026',
    verifiedBy: 'Mano a Mano Vzla - Trabajo Social'
  },
  {
    id: 'caso-03',
    code: 'CASO-LG-003',
    familyName: 'Familia González Parra',
    contactPerson: 'José González',
    location: 'Sector Mare Abajo, Calle Los Baños',
    parroquia: 'Urimare',
    membersCount: 5,
    childrenCount: 1,
    elderlyCount: 2,
    title: 'Asistencia para paciente con movilidad reducida y agua potable',
    quote: 'Mi padre no puede caminar con facilidad y el suministro de agua limpia es lo más difícil. La ayuda médica y el filtro nos devuelven la tranquilidad.',
    narrative: 'Hogar con dos adultos mayores, uno de ellos con secuelas de ACV que requiere medicamentos antihipertensivos fijos y pañales para adultos. El sector presenta cortes prolongados de agua de tubería, obligando a acarrear bidones desde puntos lejanos. La brigada verificó el informe médico y las condiciones del hogar.',
    neededItems: ['Filtro purificador de agua por gravedad', 'Lote de medicamentos antihipertensivos', 'Pañales para adulto mayor talla G y kit de higiene'],
    targetAmount: 250,
    raisedAmount: 195,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    status: 'en_progreso',
    verifiedDate: '01 de Julio, 2026',
    verifiedBy: 'Brigada 99HDD - Salud y Logística'
  },
  {
    id: 'caso-04',
    code: 'CASO-LG-004',
    familyName: 'Familia Díaz Salazar (Refugio Temporal)',
    contactPerson: 'Yulimar Salazar',
    location: 'Refugio Escuela República de Panamá',
    parroquia: 'Caraballeda',
    membersCount: 3,
    childrenCount: 1,
    elderlyCount: 0,
    title: 'Apoyo nutricional y cuidados para lactante de 6 meses',
    quote: 'Estar en un albergue con una bebé tan pequeña es muy duro, pero saber que hay manos solidarias pendientes de su leche y pañales nos da fuerzas cada día.',
    narrative: 'Madre joven y su pareja con una bebé de seis meses de nacida, reubicados temporalmente en el centro de asistencia tras anegación de su vivienda en el sector El Cojo. El caso fue censado y validado en el albergue número 4 atendido por la Brigada 99HDD.',
    neededItems: ['Fórmula láctea etapa 2 y compotas', 'Pañales desechables etapa 3', 'Cuna corral portátil y mosquitero para albergue'],
    targetAmount: 180,
    raisedAmount: 155,
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    status: 'en_progreso',
    verifiedDate: '02 de Julio, 2026',
    verifiedBy: 'Brigada 99HDD - Censo de Albergues'
  }
];
