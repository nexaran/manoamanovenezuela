export interface CentroAcopio {
  id: string;
  name: string;
  city: 'Caracas' | 'La Guaira';
  badge: string;
  address: string;
  reference: string;
  hours: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  priorityItems: string[];
  googleMapsUrl: string;
  coordinates: { x: number; y: number }; // Relative percentage on topographical visual map
}

export const CENTROS_ACOPIO: CentroAcopio[] = [
  {
    id: 'chacao',
    name: 'Chacao (SushiDelivery)',
    city: 'Caracas',
    badge: 'Sede Principal CCS',
    address: 'SushiDelivery Chacao, Municipio Chacao, Caracas',
    reference: 'Ubicado en SushiDelivery Chacao, punto de entrega y recepción directa para donaciones.',
    hours: 'Lunes a Viernes: 8:00 a.m. – 5:00 p.m. (previa coordinación)',
    contactName: 'Coordinación Brigada Caracas',
    contactPhone: '+58 412-555-0192',
    contactEmail: 'manomanovzla@gmail.com',
    priorityItems: [
      'Medicamentos e insumos de primeros auxilios',
      'Alimentos no perecederos',
      'Fórmulas lácteas y pañales',
      'Agua potable embotellada'
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=SushiDelivery+Chacao+Caracas+Venezuela',
    coordinates: { x: 38, y: 76 }
  },
  {
    id: 'chuao',
    name: 'Chuao (Oficinas Disfuncional Studios)',
    city: 'Caracas',
    badge: 'Punto Logístico CCS',
    address: 'Oficinas de Disfuncional Studios, Chuao, Municipio Baruta, Caracas',
    reference: 'Oficinas de Disfuncional Studios en Chuao. Punto de recepción de insumos y equipos técnicos.',
    hours: 'Lunes a Viernes: 8:00 a.m. – 5:00 p.m.',
    contactName: 'Recepción Disfuncional Studios',
    contactPhone: '+58 424-331-8840',
    contactEmail: 'manomanovzla@gmail.com',
    priorityItems: [
      'Herramientas de rescate y palas',
      'Linternas y baterías',
      'Bidones para almacenamiento de agua',
      'Kits de bioseguridad'
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Disfuncional+Studios+Chuao+Caracas+Venezuela',
    coordinates: { x: 52, y: 80 }
  },
  {
    id: 'los-naranjos',
    name: 'Los Naranjos (Terrazas de Los Naranjos)',
    city: 'Caracas',
    badge: 'Punto Sureste CCS',
    address: 'Terrazas de Los Naranjos, Municipio El Hatillo, Caracas',
    reference: 'Terrazas de Los Naranjos, zona accesible para descarga de bultos, ropa y donaciones familiares.',
    hours: 'Lunes a Viernes: 8:30 a.m. – 4:30 p.m. (previa coordinación)',
    contactName: 'Equipo de Acopio Terrazas de Los Naranjos',
    contactPhone: '+58 414-998-1120',
    contactEmail: 'manomanovzla@gmail.com',
    priorityItems: [
      'Cobijas, sábanas y ropa en excelente estado',
      'Artículos de higiene personal',
      'Alimentos secos y granos',
      'Velas y fósforos'
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Terrazas+de+Los+Naranjos+El+Hatillo+Caracas+Venezuela',
    coordinates: { x: 76, y: 86 }
  },
  {
    id: 'macuto-quince-letras',
    name: 'Macuto / Las Quince Letras (1 cuadra arriba del Club Canarias)',
    city: 'La Guaira',
    badge: 'Centro Operativo Central',
    address: '1 cuadra arriba del Club Social Canarias, Macuto / Las Quince Letras, Edo. La Guaira',
    reference: 'Misma ubicación central de acopio y despacho: a exactamente 1 cuadra subiendo desde el Club Social Canarias en Macuto / Las Quince Letras.',
    hours: 'Lunes a Domingo: 7:30 a.m. – 6:30 p.m. (Operativo diario)',
    contactName: 'Brigada 99HDD Operaciones La Guaira',
    contactPhone: '+58 412-701-4433',
    contactEmail: 'manomanovzla@gmail.com',
    priorityItems: [
      'Acopio masivo de agua potable',
      'Ollas comunitarias y gas',
      'Comida caliente y raciones secas',
      'Medicinas de urgencia, gasas y sueros',
      'Insumos pediátricos y mosquiteros'
    ],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Club+Social+Canarias+Macuto+La+Guaira+Venezuela',
    coordinates: { x: 50, y: 18 }
  }
];
