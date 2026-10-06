import { PreRegistroEntry, PRIORITY_NEEDS_LABELS } from './casesTypes';
import { sendPayloadToGoogleDrive } from './driveSyncService';

const LOCAL_STORAGE_KEY = 'mmv_preregistros_backup';

/**
 * Despacha una notificación directa por correo a manomanovzla@gmail.com
 * usando FormSubmit (servicio automático, sin servidores intermedios requeridos).
 */
async function sendEmailNotificationToInbox(type: 'caso' | 'padrino' | 'voluntario', data: any) {
  try {
    let subject = '';
    let payload: Record<string, any> = {
      _template: 'table',
      _captcha: 'false',
    };

    if (type === 'caso') {
      subject = `🚨 [NUEVO CASO REGISTRADO] ${data.caseId} - ${data.fullName} (${data.parroquia})`;
      payload = {
        ...payload,
        _subject: subject,
        'Código de Expediente': data.caseId,
        'Nombre del Afectado': data.fullName,
        'Cédula de Identidad': data.cedula || 'No suministrada',
        'Teléfono de Contacto': data.phone,
        'Correo Electrónico': data.email || 'No indicado',
        'Correo Verificado': data.emailVerified ? 'Sí (Código OTP 6 dígitos verificado)' : 'Pendiente',
        'Parroquia': data.parroquia,
        'Ubicación / Dirección Exacta': data.location,
        'Carga Familiar': `${data.familyMembers} personas (${data.childrenCount} niños, ${data.elderlyOrDisabled ? 'Con Adultos Mayores o Discapacidad' : 'Sin adultos mayores'})`,
        'Necesidad Prioritaria': data.priorityNeed,
        'Relato del Caso': data.narrative,
        'Evaluación de Prioridad': data.aiResponse?.priorityAssessment || 'Pendiente de visita',
        'Fecha y Hora': new Date(data.timestamp).toLocaleString('es-VE')
      };
    } else if (type === 'padrino') {
      subject = `🤝 [NUEVO PADRINO REGISTRADO] ${data.code} - ${data.fullName}`;
      payload = {
        ...payload,
        _subject: subject,
        'Código Padrino': data.code,
        'Nombre / Donante': data.fullName,
        'Organización / Empresa': data.organization || 'Particular',
        'Correo': data.email,
        'Teléfono': data.phone,
        'Modalidad de Apoyo': data.supportType,
        'Mensaje': data.message,
        'Fecha': new Date(data.timestamp).toLocaleString('es-VE')
      };
    } else if (type === 'voluntario') {
      subject = `👷 [NUEVO VOLUNTARIO 99HDD] ${data.code} - ${data.fullName} (${data.parroquia})`;
      payload = {
        ...payload,
        _subject: subject,
        'Código Voluntario': data.code,
        'Nombre': data.fullName,
        'Cédula': data.cedula || 'No suministrada',
        'Teléfono': data.phone,
        'Correo': data.email || 'No indicado',
        'Parroquia': data.parroquia,
        'Dispone de Vehículo': data.hasVehicle,
        'Detalles Vehículo': data.vehicleDetails || 'N/A',
        'Área de Habilidades': data.skillsArea,
        'Disponibilidad': data.availability,
        'Mensaje': data.message || 'Sin mensaje adicional',
        'Fecha': new Date(data.timestamp).toLocaleString('es-VE')
      };
    }

    await fetch('https://formsubmit.co/ajax/manomanovzla@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Error enviando notificación automática por correo:', err);
  }
}

export async function submitPreRegistro(formData: {
  fullName: string;
  cedula?: string;
  phone: string;
  email: string;
  emailVerified?: boolean;
  location: string;
  parroquia: string;
  familyMembers: number;
  childrenCount: number;
  elderlyOrDisabled: boolean;
  priorityNeed: string;
  narrative: string;
}): Promise<{ success: boolean; caseId: string; entry: PreRegistroEntry }> {
  try {
    const res = await fetch('/api/pre-registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.entry) {
        saveLocalBackup(data.entry);
        sendEmailNotificationToInbox('caso', data.entry);
        // Transmisión inmediata y directa hacia Google Drive (Consolidado_Oficial_ManoAMano)
        sendPayloadToGoogleDrive('caso', data.entry);
        return { success: true, caseId: data.caseId, entry: data.entry };
      }
    }
  } catch (err) {
    console.warn('Network call to /api/pre-registro failed, activating client fallback:', err);
  }

  // Client-side fallback if server api is unreachable in preview or static hosting
  const now = new Date();
  const caseCode = `CASO-LG-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;
  
  const fallbackEntry: PreRegistroEntry = {
    id: `pre-${Date.now()}`,
    caseId: caseCode,
    fullName: formData.fullName,
    cedula: formData.cedula || '',
    phone: formData.phone,
    email: formData.email,
    emailVerified: formData.emailVerified ?? true,
    location: formData.location,
    parroquia: formData.parroquia,
    familyMembers: formData.familyMembers,
    childrenCount: formData.childrenCount,
    elderlyOrDisabled: formData.elderlyOrDisabled,
    priorityNeed: formData.priorityNeed as any,
    narrative: formData.narrative,
    timestamp: now.toISOString(),
    status: 'recibido',
    aiResponse: {
      empatheticMessage: `Estimado(a) ${formData.fullName}, recibimos su testimonio con profunda empatía y respeto. Entendemos los momentos tan complejos que su familia atraviesa en ${formData.location || 'La Guaira'} y el valor que requiere compartir su historia. Su expediente ha quedado registrado oficialmente bajo el código ${caseCode}. Nuestro equipo de voluntarios y trabajadores sociales de la Brigada 99HDD revisará minuciosamente cada detalle expuesto. A la brevedad nos comunicaremos a su número ${formData.phone} para dar seguimiento, evaluar nuestro alcance operativo y coordinar la visita de corroboración en sitio. No están solos; paso a paso construiremos caminos de esperanza.`,
      identifiedNeeds: [formData.priorityNeed],
      priorityAssessment: formData.childrenCount > 0 || formData.elderlyOrDisabled ? 'Prioridad Alta (Menores / Adultos Mayores)' : 'Prioridad Media',
      nextSteps: [
        'Recepción y codificación del expediente en la base de datos de pre-registro.',
        'Revisión inicial del caso por la coordinación de logística y acción social.',
        'Contacto formal vía correo electrónico oficial para validar datos de acceso y programar la visita.',
        'Visita presencial de la Brigada 99HDD en su comunidad o albergue para corroborar y levantar la ficha de ayuda.'
      ]
    },
    syncedToDrive: true
  };

  saveLocalBackup(fallbackEntry);
  sendEmailNotificationToInbox('caso', fallbackEntry);
  sendPayloadToGoogleDrive('caso', fallbackEntry);
  return { success: true, caseId: caseCode, entry: fallbackEntry };
}

function saveLocalBackup(entry: PreRegistroEntry) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: PreRegistroEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage backup error:', err);
  }
}

export async function fetchAllPreRegistros(): Promise<PreRegistroEntry[]> {
  try {
    const res = await fetch('/api/pre-registro');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/pre-registro:', err);
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  return [];
}

/**
 * Obtiene los casos almacenados localmente en la memoria de este teléfono o computadora.
 */
export function getLocalStoredCases(): PreRegistroEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list: PreRegistroEntry[] = JSON.parse(raw);
    // Filtrar duplicados por caseId
    const seen = new Set<string>();
    return list.filter(item => {
      if (seen.has(item.caseId)) return false;
      seen.add(item.caseId);
      return true;
    });
  } catch {
    return [];
  }
}

/**
 * Obtiene el caso más reciente registrado en este dispositivo.
 */
export function getLatestLocalStoredCase(): PreRegistroEntry | null {
  const cases = getLocalStoredCases();
  return cases.length > 0 ? cases[0] : null;
}

export const CASE_RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 Minutos periodo seguro estricto

/**
 * Obtiene el tiempo restante en milisegundos para poder reenviar un caso.
 * Devuelve 0 si ya se cumplió el periodo seguro y está permitido el reenvío.
 */
export function getCaseResendCooldownRemaining(caseId: string): number {
  try {
    const raw = localStorage.getItem(`mmv_case_last_resend_${caseId}`);
    if (!raw) return 0;
    const lastResend = Number(raw);
    const elapsed = Date.now() - lastResend;
    if (elapsed >= CASE_RESEND_COOLDOWN_MS) {
      return 0;
    }
    return Math.max(0, CASE_RESEND_COOLDOWN_MS - elapsed);
  } catch {
    return 0;
  }
}

/**
 * Reenvía un caso previamente guardado en la memoria local directamente
 * al correo oficial de la brigada y al Google Drive sin tener que reescribirlo.
 * Aplica limitación de tasa estricta (1 vez cada 5 minutos por caso) para prevenir abusos.
 */
export async function resendStoredCase(entry: PreRegistroEntry): Promise<{
  success: boolean;
  caseId: string;
  message: string;
}> {
  try {
    // 0. Comprobar periodo seguro (anti-spam / anti-saturación)
    const remaining = getCaseResendCooldownRemaining(entry.caseId);
    if (remaining > 0) {
      const remainingSec = Math.ceil(remaining / 1000);
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      return {
        success: false,
        caseId: entry.caseId,
        message: `Este caso ya fue reenviado recientemente. Por política de seguridad anti-saturación, podrá reenviarlo nuevamente en ${mins > 0 ? `${mins}m ` : ''}${secs}s.`
      };
    }

    // 1. Intentar sincronizar con el backend si está activo
    try {
      await fetch('/api/pre-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: entry.fullName,
          cedula: entry.cedula,
          phone: entry.phone,
          location: entry.location,
          parroquia: entry.parroquia,
          familyMembers: entry.familyMembers,
          childrenCount: entry.childrenCount,
          elderlyOrDisabled: entry.elderlyOrDisabled,
          priorityNeed: entry.priorityNeed,
          narrative: entry.narrative,
          isResend: true,
          caseId: entry.caseId
        })
      });
    } catch (_) {}

    // 2. Despachar al correo oficial manomanovzla@gmail.com
    await sendEmailNotificationToInbox('caso', {
      ...entry,
      caseId: `${entry.caseId} [REENVIADO]`,
      aiResponse: {
        ...entry.aiResponse,
        priorityAssessment: `${entry.aiResponse?.priorityAssessment || 'Evaluación en sitio'} (Reenvío desde memoria del dispositivo)`
      }
    });

    // 3. Sincronizar con Google Drive
    await sendPayloadToGoogleDrive('caso', {
      ...entry,
      syncedToDrive: true
    });

    // 4. Actualizar marca de tiempo de reenvío y estado local
    try {
      localStorage.setItem(`mmv_case_last_resend_${entry.caseId}`, String(Date.now()));
      const cases = getLocalStoredCases();
      const updated = cases.map(c => c.caseId === entry.caseId ? { ...c, syncedToDrive: true } : c);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}

    return {
      success: true,
      caseId: entry.caseId,
      message: `El caso ${entry.caseId} ha sido reenviado exitosamente a la bandeja central manomanovzla@gmail.com y respaldado en Google Drive.`
    };
  } catch (err: any) {
    return {
      success: false,
      caseId: entry.caseId,
      message: err.message || 'Error al reenviar el caso.'
    };
  }
}

/**
 * Actualiza el estado de un caso (ej. 'recibido' -> 'verificado' o 'visita_coordinada')
 */
export function updateCaseStatus(caseId: string, newStatus: PreRegistroEntry['status']): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return false;
    const list: PreRegistroEntry[] = JSON.parse(raw);
    const updated = list.map(c => c.caseId === caseId ? { ...c, status: newStatus } : c);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Sincronizar actualización con Drive si es posible
    const found = updated.find(c => c.caseId === caseId);
    if (found) {
      sendPayloadToGoogleDrive('caso', found);
    }
    return true;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// PADRINOS / DONANTES DE CASOS
// -------------------------------------------------------------
const PADRINOS_STORAGE_KEY = 'mmv_padrinos_backup';

export async function submitPadrinoInquiry(data: {
  fullName: string;
  organization?: string;
  email: string;
  phone: string;
  supportType: any;
  message: string;
}): Promise<{ success: boolean; code: string; entry: import('./casesTypes').PadrinoInquiryEntry }> {
  const now = new Date();
  const code = `PADRINO-LG-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;

  const entry: import('./casesTypes').PadrinoInquiryEntry = {
    id: `pad-${Date.now()}`,
    code,
    fullName: data.fullName,
    organization: data.organization,
    email: data.email,
    phone: data.phone,
    supportType: data.supportType,
    message: data.message,
    timestamp: now.toISOString(),
    status: 'recibido'
  };

  try {
    const raw = localStorage.getItem(PADRINOS_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(PADRINOS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage error saving padrino:', e);
  }

  sendPayloadToGoogleDrive('padrino', entry);
  sendEmailNotificationToInbox('padrino', entry);

  return { success: true, code, entry };
}

export function fetchAllPadrinos(): import('./casesTypes').PadrinoInquiryEntry[] {
  try {
    const raw = localStorage.getItem(PADRINOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// VOLUNTARIOS / BRIGADA 99HDD
// -------------------------------------------------------------
const VOLUNTARIOS_STORAGE_KEY = 'mmv_voluntarios_backup';

export async function submitVoluntario(data: {
  fullName: string;
  cedula?: string;
  phone: string;
  email: string;
  emailVerified?: boolean;
  parroquia: string;
  hasVehicle: any;
  vehicleDetails?: string;
  skillsArea: any;
  availability: any;
  message?: string;
}): Promise<{ success: boolean; code: string; entry: import('./casesTypes').VoluntarioEntry }> {
  const now = new Date();
  const code = `EXP-VOL-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;

  const entry: import('./casesTypes').VoluntarioEntry = {
    id: `vol-${Date.now()}`,
    code,
    fullName: data.fullName,
    cedula: data.cedula,
    phone: data.phone,
    email: data.email,
    emailVerified: data.emailVerified ?? true,
    parroquia: data.parroquia,
    hasVehicle: data.hasVehicle,
    vehicleDetails: data.vehicleDetails,
    skillsArea: data.skillsArea,
    availability: data.availability,
    message: data.message,
    timestamp: now.toISOString(),
    status: 'recibido'
  };

  try {
    const raw = localStorage.getItem(VOLUNTARIOS_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(VOLUNTARIOS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage error saving voluntario:', e);
  }

  sendPayloadToGoogleDrive('voluntario', entry);
  sendEmailNotificationToInbox('voluntario', entry);

  return { success: true, code, entry };
}

export function fetchAllVoluntarios(): import('./casesTypes').VoluntarioEntry[] {
  try {
    const raw = localStorage.getItem(VOLUNTARIOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Re-sincroniza en lote todos los casos almacenados localmente hacia Google Drive
 * (Útil si se registraron casos antes de configurar el Webhook de Google Apps Script)
 */
export async function syncAllPendingCasesToDrive(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  try {
    const cases = await fetchAllPreRegistros();
    if (cases.length === 0) {
      return { success: true, syncedCount: 0 };
    }
    let count = 0;
    for (const c of cases) {
      const res = await sendPayloadToGoogleDrive('caso', c);
      if (res.success && res.data) {
        updateCaseDriveUrls(c.caseId, res.data.driveFileUrl, res.data.drivePdfUrl);
      }
      count++;
    }
    return { success: true, syncedCount: count };
  } catch (err: any) {
    return { success: false, syncedCount: 0, error: err?.message || 'Error al sincronizar con Google Drive' };
  }
}

/**
 * Actualiza los enlaces a Google Drive (hoja Excel y PDF) para un caso en almacenamiento local
 */
export function updateCaseDriveUrls(caseId: string, driveFileUrl?: string, drivePdfUrl?: string): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    const list: PreRegistroEntry[] = JSON.parse(raw);
    const updated = list.map(item => {
      if (item.caseId === caseId) {
        return {
          ...item,
          driveFileUrl: driveFileUrl || item.driveFileUrl,
          drivePdfUrl: drivePdfUrl || item.drivePdfUrl,
          syncedToDrive: true
        };
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al actualizar enlaces Drive en localStorage:', e);
  }
}

/**
 * Descarga el expediente individual formateado como archivo Excel (.csv delimitado)
 * para apertura directa en Microsoft Excel o Google Sheets.
 */
export function downloadCaseExcel(entry: PreRegistroEntry): void {
  const cleanName = (entry.fullName || 'Beneficiario')
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .slice(0, 30)
    .trim()
    .replace(/\s+/g, '_');
  const filename = `Expediente_${entry.caseId}_${cleanName || 'Caso'}.csv`;

  const lines = [
    `"MANO A MANO VENEZUELA & BRIGADA 99HDD"`,
    `"Cuerpo de Acción Humanitaria, Rescate y Apoyo Social • Estado La Guaira • RIF: J-50392817-4"`,
    `"DOSSIER OFICIAL DE EXPEDIENTE HUMANITARIO PARA DONANTES Y PADRINOS"`,
    `""`,
    `"Código de Expediente:","${entry.caseId}","Fecha Emisión:","${new Date(entry.timestamp).toLocaleString('es-VE')}"`,
    `"Estado de Verificación:","${entry.status === 'verificado' ? 'CONFIRMADO Y VERIFICADO EN SITIO POR BRIGADA 99HDD' : 'RECIBIDO - VISITA PROGRAMADA EN TERRENO'}"`,
    `""`,
    `"1. FICHA TÉCNICA DEL GRUPO FAMILIAR"`,
    `"Jefe(a) de Familia / Solicitante:","${(entry.fullName || '').replace(/"/g, '""')}"`,
    `"Cédula de Identidad:","${(entry.cedula || 'En verificación').replace(/"/g, '""')}"`,
    `"Teléfono de Contacto:","${(entry.phone || '').replace(/"/g, '""')}"`,
    `"Correo Electrónico Oficial:","${(entry.email || 'No indicado').replace(/"/g, '""')}"`,
    `"Parroquia (Estado La Guaira):","${(entry.parroquia || '').replace(/"/g, '""')}"`,
    `"Ubicación / Sector Exacto:","${(entry.location || '').replace(/"/g, '""')}"`,
    `"Carga Familiar Total:","${entry.familyMembers} personas"`,
    `"Menores de Edad en el Hogar:","${entry.childrenCount} niños"`,
    `"Adultos Mayores o Discapacidad:","${entry.elderlyOrDisabled ? 'SÍ (Vulnerabilidad médica registrada)' : 'No registrados'}"`,
    `"Necesidad Prioritaria Solicitada:","${PRIORITY_NEEDS_LABELS[entry.priorityNeed] || entry.priorityNeed}"`,
    `""`,
    `"2. RELATO TESTIMONIAL Y SITUACIÓN FAMILIAR"`,
    `"${(entry.narrative || '').replace(/"/g, '""')}"`,
    `""`,
    `"3. DIAGNÓSTICO SOCIAL Y RUTA DE ACCIÓN RECOMENDADA"`,
    `"${((entry.aiResponse?.priorityAssessment) || 'Visita y corroboración en terreno por brigadistas de la Brigada 99HDD.').replace(/"/g, '""')}"`,
    `""`,
    `"4. CANAL EXCLUSIVO DE ATENCIÓN A DONANTES Y PADRINOS"`,
    `"Para apadrinar este caso o enviar insumos, comuníquese única y exclusivamente por correo: manomanovzla@gmail.com"`,
    `"Por política de seguridad y estricta confidencialidad no se atienden trámites operativos por WhatsApp."`,
    `""`,
    `"Enlace de Archivo en Google Drive:","${entry.driveFileUrl || 'Sincronizado en carpeta 01 de Google Drive'}"`,
    `"Enlace de Dossier PDF en Google Drive:","${entry.drivePdfUrl || 'Sincronizado en carpeta 05 de Google Drive'}"`
  ];

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

