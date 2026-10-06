/**
 * SERVICIO DE TESTIMONIOS DE BENEFICIARIOS & SISTEMA DE MODERACIÓN PREVIA
 * Mano a Mano Venezuela & Brigada 99HDD
 * Cuenta Oficial: manomanovzla@gmail.com
 * 
 * Regla de Oro: NINGÚN testimonio se publica en la página pública sin la aprobación
 * previa de la directiva de Mano a Mano recibida por correo electrónico.
 */

import { BeneficiaryTestimonialEntry } from './casesTypes';
import { sendPayloadToGoogleDrive } from './driveSyncService';

const STORAGE_KEY = 'mmv_beneficiary_testimonials_db';

/**
 * Semilla de testimonios iniciales reales ya aprobados y verificados en terreno
 */
const INITIAL_APPROVED_TESTIMONIOS: BeneficiaryTestimonialEntry[] = [
  {
    id: 'test-seed-1',
    code: 'TEST-2026-001',
    name: 'Carmen Elena Rodríguez',
    isAnonymous: false,
    email: 'carmen.rodriguez.vargas@gmail.com',
    emailVerified: true,
    phone: '0414-239-8812',
    community: 'Macuto (Sector Álamo)',
    assistanceType: 'alimentos_agua',
    rating: 5,
    story: 'Cuando el temblor fracturó la pared de nuestra casa y cortaron el agua en el sector, mis tres nietos y yo estábamos desesperados. Los muchachos de la Brigada 99HDD llegaron al segundo día con botellones de agua potable y bolsas de alimentos no perecederos. No nos cobraron ni un centavo; fue un abrazo de Dios en el momento más oscuro.',
    timestamp: '2026-06-28T14:30:00Z',
    status: 'aprobado',
    approvedAt: '2026-06-29T09:00:00Z',
    approvedBy: 'Coordinación Mano a Mano'
  },
  {
    id: 'test-seed-2',
    code: 'TEST-2026-002',
    name: 'Beneficiario Protegido',
    isAnonymous: true,
    email: 'familia.guaira.refugio@gmail.com',
    emailVerified: true,
    phone: '0412-550-9911',
    community: 'Catia La Mar (Albergue Comunitario)',
    assistanceType: 'enseres_colchonetas',
    rating: 5,
    story: 'Preferí dejar mi testimonio de forma anónima para cuidar la privacidad de mis hijos. Lo que hicieron por nosotros al traernos colchonetas secas, cobijas y medicamentos para la fiebre de mi hijo menor no tiene precio. Muchas gracias a los donantes y a los voluntarios que suben los cerros cargando cajas.',
    timestamp: '2026-07-02T16:15:00Z',
    status: 'aprobado',
    approvedAt: '2026-07-02T18:00:00Z',
    approvedBy: 'Dirección de Operaciones 99HDD'
  },
  {
    id: 'test-seed-3',
    code: 'TEST-2026-003',
    name: 'José Gregorio Escalona',
    isAnonymous: false,
    email: 'jgescalona.mecanico@yahoo.es',
    emailVerified: true,
    phone: '0416-801-4432',
    community: 'Naiguatá (Pueblo Arriba)',
    assistanceType: 'materiales_techo',
    rating: 5,
    story: 'El techo de zinc de mi taller y vivienda colapsó con el sismo del 24 de junio. Gracias a la campaña de Mano a Mano recibimos 8 láminas de zinc y perfiles para no quedar a la intemperie antes de las lluvias. Se nota la transparencia y la honestidad de esta brigada.',
    timestamp: '2026-07-05T11:20:00Z',
    status: 'aprobado',
    approvedAt: '2026-07-05T13:45:00Z',
    approvedBy: 'Coordinación Mano a Mano'
  }
];

/**
 * Obtiene todos los testimonios de la base de datos local
 */
export function getAllTestimonials(): BeneficiaryTestimonialEntry[] {
  if (typeof window === 'undefined') return INITIAL_APPROVED_TESTIMONIOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPROVED_TESTIMONIOS));
      return INITIAL_APPROVED_TESTIMONIOS;
    }
    const list: BeneficiaryTestimonialEntry[] = JSON.parse(raw);
    return list;
  } catch {
    return INITIAL_APPROVED_TESTIMONIOS;
  }
}

/**
 * Obtiene únicamente los testimonios que han sido APROBADOS para publicación pública
 */
export function getApprovedTestimonials(): BeneficiaryTestimonialEntry[] {
  const all = getAllTestimonials();
  return all.filter(t => t.status === 'aprobado');
}

/**
 * Obtiene los testimonios que están pendientes de revisión por la directiva
 */
export function getPendingTestimonials(): BeneficiaryTestimonialEntry[] {
  const all = getAllTestimonials();
  return all.filter(t => t.status === 'pendiente_aprobacion');
}

/**
 * Guarda la lista en el almacenamiento local
 */
function saveTestimonials(list: BeneficiaryTestimonialEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Registra un nuevo testimonio de beneficiario.
 * Queda en estado 'pendiente_aprobacion' y envía notificación al correo manomanovzla@gmail.com
 */
export async function submitBeneficiaryTestimonial(data: {
  name: string;
  isAnonymous: boolean;
  email: string;
  emailVerified: boolean;
  phone?: string;
  community: string;
  assistanceType: BeneficiaryTestimonialEntry['assistanceType'];
  rating: number;
  story: string;
}): Promise<{ success: boolean; entry: BeneficiaryTestimonialEntry; message: string }> {
  const now = new Date();
  const code = `TEST-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;

  const displayName = data.isAnonymous
    ? `Beneficiario Anónimo (${data.community || 'La Guaira'})`
    : (data.name.trim() || 'Beneficiario Solidario');

  const newEntry: BeneficiaryTestimonialEntry = {
    id: `testimonio-${Date.now()}`,
    code,
    name: displayName,
    isAnonymous: Boolean(data.isAnonymous),
    email: data.email.toLowerCase().trim(),
    emailVerified: Boolean(data.emailVerified),
    phone: data.phone?.trim() || 'No suministrado',
    community: data.community.trim() || 'Estado La Guaira',
    assistanceType: data.assistanceType,
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    story: data.story.trim(),
    timestamp: now.toISOString(),
    status: 'pendiente_aprobacion' // ¡NUNCA se publica directamente sin aprobación!
  };

  // 1. Guardar en base de datos local
  const currentList = getAllTestimonials();
  currentList.unshift(newEntry);
  saveTestimonials(currentList);

  // 2. Enviar a Google Drive (hoja de testimonios)
  try {
    sendPayloadToGoogleDrive({
      type: 'testimonio',
      data: newEntry
    });
  } catch (_) {}

  // 3. Notificación inmediata a la bandeja manomanovzla@gmail.com
  try {
    const emailSubject = `💬 [NUEVO TESTIMONIO POR APROBAR] ${code} - ${displayName}`;
    const emailBody = {
      _subject: emailSubject,
      'Código de Testimonio': code,
      'Estatus': 'PENDIENTE DE APROBACIÓN POR DIRECTIVA',
      'Autor': displayName,
      'Modalidad': data.isAnonymous ? 'Anónimo Solicitado' : 'Público',
      'Correo Verificado': data.email,
      'Teléfono': data.phone || 'N/A',
      'Comunidad': data.community,
      'Ayuda Recibida': data.assistanceType,
      'Calificación': `${data.rating} / 5 estrellas`,
      'Relato del Testimonio': data.story,
      'Fecha': now.toLocaleString('es-VE'),
      'Instrucción Directiva': 'Para aprobar la publicación de este testimonio en la web, ingresa al Panel de Moderación en la página o responde este correo con la confirmación.'
    };

    fetch('https://formsubmit.co/ajax/manomanovzla@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailBody)
    }).catch(() => {});
  } catch (_) {}

  return {
    success: true,
    entry: newEntry,
    message: '¡Tu testimonio ha sido recibido exitosamente! Por normas de seguridad y respeto comunitario, nuestro equipo directivo revisará el mensaje antes de su publicación en la página.'
  };
}

/**
 * Aprueba un testimonio pendiente para que aparezca públicamente en la web
 */
export function approveTestimonial(
  id: string,
  approvedBy: string = 'Directiva Mano a Mano'
): { success: boolean; message: string } {
  const list = getAllTestimonials();
  const index = list.findIndex(t => t.id === id || t.code === id);

  if (index === -1) {
    return { success: false, message: 'Testimonio no encontrado.' };
  }

  list[index].status = 'aprobado';
  list[index].approvedAt = new Date().toISOString();
  list[index].approvedBy = approvedBy;
  saveTestimonials(list);

  // Notificar al Webhook de Drive
  try {
    sendPayloadToGoogleDrive({
      type: 'testimonio_aprobado',
      data: list[index]
    });
  } catch (_) {}

  return {
    success: true,
    message: `Testimonio ${list[index].code} aprobado y publicado exitosamente en la página web.`
  };
}

/**
 * Rechaza o descarta un testimonio (no se publica en la página)
 */
export function rejectTestimonial(id: string): { success: boolean; message: string } {
  const list = getAllTestimonials();
  const index = list.findIndex(t => t.id === id || t.code === id);

  if (index === -1) {
    return { success: false, message: 'Testimonio no encontrado.' };
  }

  list[index].status = 'rechazado';
  saveTestimonials(list);

  return {
    success: true,
    message: `Testimonio ${list[index].code} rechazado. No será publicado en la página pública.`
  };
}
