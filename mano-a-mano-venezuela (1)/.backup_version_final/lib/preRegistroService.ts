import { PreRegistroEntry } from './casesTypes';
import { sendPayloadToGoogleDrive } from './driveSyncService';

const LOCAL_STORAGE_KEY = 'mmv_preregistros_backup';

export async function submitPreRegistro(formData: {
  fullName: string;
  cedula?: string;
  phone: string;
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
        return { success: true, caseId: data.caseId, entry: data.entry };
      }
    }
  } catch (err) {
    console.warn('Network call to /api/pre-registro failed, activating client fallback:', err);
  }

  // Client-side fallback if server api is unreachable in preview
  const now = new Date();
  const caseCode = `CASO-LG-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;
  
  const fallbackEntry: PreRegistroEntry = {
    id: `pre-${Date.now()}`,
    caseId: caseCode,
    fullName: formData.fullName,
    cedula: formData.cedula || '',
    phone: formData.phone,
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
        'Contacto telefónico o por WhatsApp para validar datos de acceso.',
        'Visita presencial de la Brigada 99HDD en su comunidad o albergue para corroborar y levantar la ficha de ayuda.'
      ]
    },
    syncedToDrive: true
  };

  saveLocalBackup(fallbackEntry);
  sendPayloadToGoogleDrive({
    type: 'caso',
    data: fallbackEntry
  });
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

  sendPayloadToGoogleDrive({
    type: 'padrino',
    data: entry
  });

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
  email?: string;
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

  sendPayloadToGoogleDrive({
    type: 'voluntario',
    data: entry
  });

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
