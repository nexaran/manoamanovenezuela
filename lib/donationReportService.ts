import { sendPayloadToGoogleDrive } from './driveSyncService';

// Servicio de almacenamiento en Base de Datos y Reporte Inmediato de Donaciones
// Mano a Mano - Brigada 99HHDD

export interface MicroDonationRecord {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorDocument: string; // Cédula o RIF
  donorPhone: string; // Obligatorio
  donorEmail: string;
  amount: number;
  currency: string;
  motivation: string;
  itemsDirectedTo: string[];
  paymentMethod: string;
  paymentReference?: string;
  timestamp: string;
  reportedViaEmail: boolean;
  status: 'confirmado' | 'en_verificacion';
}

export interface PaymentChannelDetails {
  id: string;
  name: string;
  badge: string;
  iconName?: string;
  fields: { label: string; value: string; canCopy?: boolean }[];
  instructions: string;
}

export const OFFICIAL_PAYMENT_METHODS: PaymentChannelDetails[] = [
  {
    id: 'binance',
    name: 'Binance Pay / USDT',
    badge: 'Criptoactivos',
    fields: [
      { label: 'Binance ID (Pay)', value: '128853309', canCopy: true },
      { label: 'Correo Registrado', value: 'Disfuncionalcuentas@gmail.com', canCopy: true }
    ],
    instructions: 'Envía tu aporte en USDT o cualquier criptomoneda vía Binance Pay sin comisiones usando el ID o el Correo.'
  },
  {
    id: 'zelle',
    name: 'Zelle (Dólares USD)',
    badge: 'Banca EE.UU.',
    fields: [
      { label: 'Banco', value: 'Regions Bank' },
      { label: 'Correo Zelle', value: 'dfblanco2026@gmail.com', canCopy: true },
      { label: 'Titular', value: 'Daniel Blanco' }
    ],
    instructions: 'Realiza la transferencia desde tu app bancaria a través de Zelle indicando el correo del titular.'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    badge: 'Internacional',
    fields: [
      { label: 'Titular', value: 'Villadoral Blanco Family' },
      { label: 'Correo PayPal', value: 'elandinito.laguaira@gmail.com', canCopy: true }
    ],
    instructions: 'Envía los fondos a través de PayPal como transferencia entre amigos/familiares o donación directa.'
  },
  {
    id: 'ach',
    name: 'Transferencia Internacional / ACH',
    badge: 'Cable / Wire',
    fields: [
      { label: 'Banco', value: 'Regions Bank' },
      { label: 'N° Cuenta', value: '0378775353', canCopy: true },
      { label: 'Routing (ABA)', value: '063104668', canCopy: true },
      { label: 'SWIFT Code', value: 'UPNBUS44', canCopy: true },
      { label: 'Dirección Registrada', value: '10775 NW 83RD TERRACE, UNIT 3, DORAL, FL 33178-0000' }
    ],
    instructions: 'Ideal para personas o empresas que transfieren desde cuentas bancarias de Estados Unidos o vía SWIFT internacional.'
  },
  {
    id: 'bizum',
    name: 'Bizum (España / Unión Europea)',
    badge: 'Euro',
    fields: [
      { label: 'Modalidad', value: 'Previa coordinación mediante formulario de contacto' }
    ],
    instructions: 'Al registrar tu donación, nuestro equipo te remitirá las coordenadas telefónicas activas para Bizum.'
  }
];

const STORAGE_KEY = 'mmv_micro_donations_database';

export function getDonationRecords(): MicroDonationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading donation database from localStorage:', err);
    return [];
  }
}

export function saveDonationToDatabase(record: Omit<MicroDonationRecord, 'id' | 'receiptNumber' | 'timestamp' | 'reportedViaEmail'>): MicroDonationRecord {
  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const receiptNumber = `DON-${year}-${randomSuffix}`;
  
  const newEntry: MicroDonationRecord = {
    ...record,
    id: `micro-don-${Date.now()}`,
    receiptNumber,
    timestamp: now.toISOString(),
    reportedViaEmail: true,
  };

  try {
    const existing = getDonationRecords();
    const updated = [newEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error persisting donation record to localStorage:', err);
  }

  // Despacho automático hacia Google Drive / Sheets vía Web App
  try {
    sendPayloadToGoogleDrive('donacion', newEntry).catch((err) => {
      console.warn('Webhook Google Drive deferred:', err);
    });
  } catch (err) {
    console.warn('Silent fallback on Google Drive sync:', err);
  }

  // Despacho de reporte vía webhook o API si estuviese disponible
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/report-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      }).catch(() => {
        // Fallback silencioso en entorno preview estático
      });
    }
  } catch {
    // Ignorar si no hay servidor activo
  }

  return newEntry;
}

export function generateDonorThankYouMessage(donorName: string, amount: number, motivation: string, receiptNumber: string): string {
  const name = donorName.trim() || 'Amigo(a) Donante';
  return `Estimado(a) ${name},\n\nDe parte de toda la cuadrilla de voluntarios de la Brigada 99HHDD y el movimiento Mano a Mano, queremos expresarte nuestro más sincero agradecimiento por tu valioso aporte de $${amount} USD (Recibo: ${receiptNumber}).\n\nTu motivo: "${motivation || 'Apoyo directo a las comunidades afectadas en La Guaira'}" nos llena de energía y compromiso para continuar en el terreno.\n\nCada centavo de tu donación se traduce inmediatamente en botellones de agua potable, combustible para nuestros traslados y raciones de alimentos para las familias que hoy más lo necesitan.\n\n¡Gracias por ser luz y esperanza en los momentos más difíciles!`;
}

export function generateAdminEmailReport(record: MicroDonationRecord): { subject: string; body: string } {
  const subject = `[NUEVA DONACIÓN RECIBIDA] $${record.amount} USD de ${record.donorName || 'Anónimo'} (Recibo ${record.receiptNumber})`;
  const body = `REPORTE OFICIAL DE DONACIÓN - MANO A MANO / 99HHDD
------------------------------------------------------
Recibo: ${record.receiptNumber}
Fecha: ${new Date(record.timestamp).toLocaleString('es-VE')}
Monto: $${record.amount} USD
Donante / Razón Social: ${record.donorName}
Cédula / RIF: ${record.donorDocument}
Correo: ${record.donorEmail}
Teléfono: ${record.donorPhone}

Motivo / Declaratoria:
"${record.motivation || 'Sin motivo especificado'}"

Destino de los fondos:
- ${record.itemsDirectedTo.join('\n- ')}

Canal de Pago Oficial: ${record.paymentMethod}
Número de Referencia de la Operación: ${record.paymentReference || 'En validación'}

Estado: Registrado en Base de Datos de Donaciones (ID: ${record.id})
------------------------------------------------------`;
  return { subject, body };
}

// Generador de formato auditable para Google Docs / Google Drive / Google Sheets
export function generateDonationsSpreadsheetCSV(): string {
  const records = getDonationRecords();
  const headers = ['Recibo', 'Fecha y Hora', 'Monto USD', 'Donante / Empresa', 'Cédula / RIF', 'Teléfono', 'Correo', 'Método de Pago', 'Referencia Bancaria', 'Motivo / Declaratoria', 'Estado'];
  
  const rows = records.map(r => [
    `"${r.receiptNumber}"`,
    `"${new Date(r.timestamp).toLocaleString('es-VE')}"`,
    r.amount,
    `"${(r.donorName || '').replace(/"/g, '""')}"`,
    `"${(r.donorDocument || '').replace(/"/g, '""')}"`,
    `"${(r.donorPhone || '').replace(/"/g, '""')}"`,
    `"${(r.donorEmail || '').replace(/"/g, '""')}"`,
    `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(r.paymentReference || '').replace(/"/g, '""')}"`,
    `"${(r.motivation || '').replace(/"/g, '""')}"`,
    `"${r.status}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Actualización de estado manual por administración
export function updateDonationStatus(id: string, newStatus: 'confirmado' | 'en_verificacion'): MicroDonationRecord[] {
  try {
    const existing = getDonationRecords();
    const updated = existing.map(rec => (rec.id === id || rec.receiptNumber === id) ? { ...rec, status: newStatus } : rec);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error updating status in localStorage:', err);
    return [];
  }
}

// Borrar / Eliminar donación (para depurar errores o registros falsos)
export function deleteDonationRecord(id: string): MicroDonationRecord[] {
  try {
    const existing = getDonationRecords();
    const updated = existing.filter(rec => rec.id !== id && rec.receiptNumber !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error deleting donation in localStorage:', err);
    return [];
  }
}

// Editar / Corregir datos de una donación existente
export function updateDonationRecord(id: string, updates: Partial<MicroDonationRecord>): MicroDonationRecord[] {
  try {
    const existing = getDonationRecords();
    const updated = existing.map(rec => {
      if (rec.id === id || rec.receiptNumber === id) {
        return { ...rec, ...updates };
      }
      return rec;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error updating donation in localStorage:', err);
    return [];
  }
}

// Sincronizar todas las donaciones locales hacia Google Drive / Sheets
export async function syncAllDonationsToGoogleDrive(): Promise<{ total: number; sent: number; errors: number }> {
  const existing = getDonationRecords();
  let sent = 0;
  let errors = 0;

  for (const record of existing) {
    try {
      const res = await sendPayloadToGoogleDrive('donacion', record);
      if (res.success) {
        sent++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { total: existing.length, sent, errors };
}

// Total únicamente de donaciones verificadas y confirmadas por el equipo
export function getVerifiedDonationsTotal(baseRaised: number = 2780): number {
  try {
    const records = getDonationRecords();
    const verifiedSum = records
      .filter(r => r.status === 'confirmado')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return baseRaised + verifiedSum;
  } catch {
    return baseRaised;
  }
}

// Generador de resumen Markdown / Google Docs para archivar en carpeta Drive
export function generateGoogleDocsDonationsArchive(): string {
  const records = getDonationRecords();
  const totalRaised = records.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  let doc = `# LIBRO DE ACTAS Y REGISTRO CENTRAL DE DONACIONES
**Organización:** Mano a Mano & Brigada 99HHDD - Operación La Guaira
**Fecha de Generación:** ${new Date().toLocaleDateString('es-VE')} - ${new Date().toLocaleTimeString('es-VE')}
**Total Acumulado:** $${totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
**Donaciones Registradas:** ${records.length} transacciones

---

## 1. RESUMEN DE DONANTES REGISTRADOS

`;

  records.forEach((r, idx) => {
    doc += `### ${idx + 1}. Recibo ${r.receiptNumber} - $${r.amount} USD
- **Donante:** ${r.donorName}
- **Cédula / RIF:** ${r.donorDocument || 'N/A'}
- **Teléfono:** ${r.donorPhone}
- **Correo:** ${r.donorEmail}
- **Canal de Pago:** ${r.paymentMethod}
- **Comprobante / Referencia:** \`${r.paymentReference || 'No especificada'}\`
- **Fecha:** ${new Date(r.timestamp).toLocaleString('es-VE')}
- **Declaratoria:** "${r.motivation}"

---
`;
  });

  return doc;
}
