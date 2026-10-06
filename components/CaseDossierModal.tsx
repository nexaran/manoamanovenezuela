import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  Copy, 
  Check, 
  ShieldCheck, 
  HeartHandshake, 
  MapPin, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Building2,
  ExternalLink,
  Award,
  FileSpreadsheet,
  Download,
  HardDrive,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { PreRegistroEntry, PRIORITY_NEEDS_LABELS } from '../lib/casesTypes';
import { trackAnalyticsEvent } from '../lib/analyticsService';
import { downloadCaseExcel, updateCaseDriveUrls } from '../lib/preRegistroService';
import { generateIndividualCaseInDrive } from '../lib/driveSyncService';

interface CaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseEntry: PreRegistroEntry | null;
  onStatusChanged?: (caseId: string, newStatus: PreRegistroEntry['status']) => void;
}

export const CaseDossierModal: React.FC<CaseDossierModalProps> = ({
  isOpen,
  onClose,
  caseEntry,
  onStatusChanged
}) => {
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [generatingDrive, setGeneratingDrive] = useState(false);
  const [driveResultMsg, setDriveResultMsg] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<PreRegistroEntry | null>(caseEntry);

  React.useEffect(() => {
    setCurrentEntry(caseEntry);
    setDriveResultMsg(null);
  }, [caseEntry]);

  React.useEffect(() => {
    if (isOpen && currentEntry) {
      trackAnalyticsEvent('dossier_pdf_view', 'Apertura de Dossier Oficial PDF', 'Casos', currentEntry.caseId, {
        parroquia: currentEntry.parroquia,
        status: currentEntry.status
      });
    }
  }, [isOpen, currentEntry]);

  if (!isOpen || !currentEntry) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    downloadCaseExcel(currentEntry);
  };

  const handleGenerateInDrive = async () => {
    setGeneratingDrive(true);
    setDriveResultMsg(null);
    try {
      const res = await generateIndividualCaseInDrive(currentEntry);
      if (res.success) {
        if (res.driveFileUrl || res.drivePdfUrl) {
          updateCaseDriveUrls(currentEntry.caseId, res.driveFileUrl, res.drivePdfUrl);
          setCurrentEntry(prev => prev ? {
            ...prev,
            driveFileUrl: res.driveFileUrl || prev.driveFileUrl,
            drivePdfUrl: res.drivePdfUrl || prev.drivePdfUrl
          } : null);
        }
        setDriveResultMsg('✅ Archivo Excel individual y Dossier PDF creados con éxito en Google Drive.');
      } else {
        setDriveResultMsg(`⚠️ ${res.error || 'Asegúrate de configurar la URL del Web App de Apps Script'}`);
      }
    } catch (err: any) {
      setDriveResultMsg(`⚠️ Error de conexión: ${err?.message || 'Error con Google Apps Script'}`);
    } finally {
      setGeneratingDrive(false);
    }
  };

  const dossierSummaryText = `📄 *DOSSIER OFICIAL DE CASO CONFIRMADO - MANO A MANO VENEZUELA*
════════════════════════════════════════
📋 *Código de Expediente:* ${currentEntry.caseId}
👤 *Jefe(a) de Familia:* ${currentEntry.fullName}
📍 *Ubicación:* ${currentEntry.location} (Parroquia ${currentEntry.parroquia}, Estado La Guaira)
👨‍👩‍👧‍👦 *Carga Familiar:* ${currentEntry.familyMembers} personas (${currentEntry.childrenCount} niños${currentEntry.elderlyOrDisabled ? ', con adultos mayores o discapacidad' : ''})
⚠️ *Necesidad Prioritaria:* ${PRIORITY_NEEDS_LABELS[currentEntry.priorityNeed] || currentEntry.priorityNeed}
✅ *Estado:* Verificado y confirmado por Brigada 99HDD en sitio

📝 *Relato y Diagnóstico Social:*
"${currentEntry.narrative}"

🤝 *Diagnóstico de Campo:*
${currentEntry.aiResponse?.priorityAssessment || 'Caso prioritario para canalización inmediata de donantes.'}
${currentEntry.driveFileUrl ? `\n📊 *Archivo de Expediente en Drive:* ${currentEntry.driveFileUrl}` : ''}
${currentEntry.drivePdfUrl ? `\n📄 *Dossier PDF en Drive:* ${currentEntry.drivePdfUrl}` : ''}

📧 *Para apadrinar o consultar este caso:*
Contacta a la coordinación oficial exclusivamente por correo: manomanovzla@gmail.com (Canal oficial único de consultas y apadrinamiento)
Sitio Web Oficial: https://ais-pre-lcj4hqbhk2ul5veogjbw6r-421897357196.us-west1.run.app`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(dossierSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmailToDonor = () => {
    const subject = encodeURIComponent(`[DOSSIER CONFIDENCIAL DE CASO ${currentEntry.caseId}] - ${currentEntry.fullName} (${currentEntry.parroquia})`);
    const body = encodeURIComponent(
      `Estimado Donante / Padrino Solidario:\n\n` +
      `Adjuntamos para su evaluación el dossier oficial correspondiente al caso verificado en sitio por el equipo de la Brigada 99HDD y Mano a Mano Venezuela:\n\n` +
      `----------------------------------------\n` +
      `CÓDIGO DE EXPEDIENTE: ${currentEntry.caseId}\n` +
      `JEFE(A) DE FAMILIA: ${currentEntry.fullName}\n` +
      `PARROQUIA: ${currentEntry.parroquia}\n` +
      `UBICACIÓN / SECTOR: ${currentEntry.location}\n` +
      `CARGA FAMILIAR: ${currentEntry.familyMembers} integrantes (${currentEntry.childrenCount} niños${currentEntry.elderlyOrDisabled ? ', adultos mayores o discapacidad' : ''})\n` +
      `NECESIDAD PRIORITARIA: ${PRIORITY_NEEDS_LABELS[currentEntry.priorityNeed] || currentEntry.priorityNeed}\n` +
      `ESTADO: Confirmado y verificado en sitio por voluntarios de la Brigada 99HDD\n\n` +
      `RELATO DEL CASO:\n"${currentEntry.narrative}"\n\n` +
      `EVALUACIÓN Y PASOS SIGUIENTES:\n${currentEntry.aiResponse?.priorityAssessment || 'Visita y diagnóstico levantado en albergue / comunidad.'}\n` +
      (currentEntry.driveFileUrl ? `\nARCHIVO DE EXPEDIENTE (EXCEL EN DRIVE):\n${currentEntry.driveFileUrl}\n` : '') +
      (currentEntry.drivePdfUrl ? `\nDOSSIER OFICIAL PDF (GOOGLE DRIVE):\n${currentEntry.drivePdfUrl}\n` : '') +
      `----------------------------------------\n\n` +
      `Si desea apadrinar este caso directamente o coordinar la entrega de insumos, por favor responda a este correo o comuníquese a nuestra dirección oficial manomanovzla@gmail.com.\n\n` +
      `Atentamente,\n` +
      `Equipo de Coordinación Social\n` +
      `Mano a Mano Venezuela & Brigada 99HDD\n` +
      `manomanovzla@gmail.com`
    );

    const mailtoUrl = recipientEmail 
      ? `mailto:${encodeURIComponent(recipientEmail)}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
    setShowEmailPrompt(false);
  };

  const isConfirmed = currentEntry.status === 'verificado';

  const toggleConfirmStatus = () => {
    const nextStatus: PreRegistroEntry['status'] = isConfirmed ? 'recibido' : 'verificado';
    if (onStatusChanged) {
      onStatusChanged(currentEntry.caseId, nextStatus);
    }
    setCurrentEntry(prev => prev ? { ...prev, status: nextStatus } : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header no imprimible para controles */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Award size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Dossier de Caso para Donantes
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                Expediente: {currentEntry.caseId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de Confirmación */}
            <button
              onClick={toggleConfirmStatus}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isConfirmed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>{isConfirmed ? 'Caso Confirmado' : 'Marcar como Confirmado'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar dossier"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Acciones de Google Drive y Excel (no imprimible) */}
        <div className="bg-stone-800 text-stone-200 px-4 py-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-stone-700 shrink-0 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-400 flex items-center gap-1 text-[11px]">
              <HardDrive size={13} className="text-teal-400" />
              <span>Google Drive:</span>
            </span>

            {currentEntry.driveFileUrl ? (
              <a
                href={currentEntry.driveFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileSpreadsheet size={13} />
                <span>Abrir Excel en Drive</span>
                <ExternalLink size={11} />
              </a>
            ) : null}

            {currentEntry.drivePdfUrl ? (
              <a
                href={currentEntry.drivePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileText size={13} />
                <span>Abrir PDF en Drive</span>
                <ExternalLink size={11} />
              </a>
            ) : null}

            <button
              type="button"
              onClick={handleGenerateInDrive}
              disabled={generatingDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Generar o actualizar el Excel individual y PDF de este caso en Google Drive"
            >
              <RefreshCw size={12} className={generatingDrive ? 'animate-spin' : ''} />
              <span>{generatingDrive ? 'Generando en Drive...' : (currentEntry.driveFileUrl ? 'Actualizar en Drive' : 'Crear Excel & PDF en Drive')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Descargar archivo Excel / CSV directo de este caso"
            >
              <Download size={12} />
              <span>Descargar Excel</span>
            </button>
          </div>

          <span className="text-[10px] text-stone-400 font-mono">
            {currentEntry.driveFileUrl ? '🟢 Sincronizado en Drive' : '⚪ Pendiente sincronizar'}
          </span>
        </div>

        {driveResultMsg && (
          <div className="bg-stone-950 text-teal-300 px-4 py-2 text-xs flex items-center justify-between border-b border-teal-900/50 print:hidden animate-fade-in">
            <span>{driveResultMsg}</span>
            <button
              onClick={() => setDriveResultMsg(null)}
              className="text-stone-400 hover:text-white text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* CONTENIDO DEL DOSSIER (Optimizado para Impresión / Guardar en PDF) */}
        <div id="printable-dossier-area" className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-stone-800 print:p-8 print:overflow-visible">
          
          {/* Cabecera Oficial Institucional del PDF */}
          <div className="border-b-2 border-stone-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-dark text-white flex items-center justify-center font-black text-xl shrink-0">
                <HeartHandshake size={28} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase font-serif">
                  Mano a Mano Venezuela
                </h1>
                <p className="text-xs font-bold text-brand-ocean tracking-wider uppercase">
                  Brigada 99HDD • Cuerpo de Ayuda Social y Rescate
                </p>
                <p className="text-[11px] text-stone-500">
                  Estado La Guaira • RIF: J-50392817-4
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-stone-900 text-white font-mono font-bold text-xs rounded-lg print:border print:border-black">
                {caseEntry.caseId}
              </span>
              <p className="text-xs text-stone-500 flex items-center sm:justify-end gap-1">
                <Calendar size={12} />
                <span>Emitido: {new Date(caseEntry.timestamp).toLocaleDateString('es-VE')}</span>
              </p>
            </div>
          </div>

          {/* Sello de Verificación en Sitio */}
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
            isConfirmed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${isConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  {isConfirmed
                    ? 'ESTADO: EXPEDIENTE CONFIRMADO Y VERIFICADO EN SITIO'
                    : 'ESTADO: EXPEDIENTE RECIBIDO - PENDIENTE DE VISITA EN SITIO'}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {isConfirmed
                    ? 'La situación familiar y habitacional ha sido corroborada presencialmente por el equipo en terreno de la Brigada 99HDD en La Guaira.'
                    : 'Expediente registrado en plataforma central. Visita de corroboración programada por el equipo de enlace.'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border border-stone-300 shrink-0 hidden sm:inline-block">
              Aval 99HDD
            </span>
          </div>

          {/* Ficha Familiar & Datos Técnicos */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-brand-ocean" />
              1. Ficha del Grupo Familiar
            </h2>

            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Jefe(a) de Familia / Solicitante:</span>
                <span className="font-bold text-stone-900 text-sm">{caseEntry.fullName}</span>
              </div>

              <div>
                <span className="text-stone-500 block">Cédula de Identidad:</span>
                <span className="font-mono font-semibold text-stone-900 text-sm">
                  {caseEntry.cedula || 'En trámite de verificación'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Parroquia (La Guaira):</span>
                <span className="font-bold text-stone-900">{caseEntry.parroquia}</span>
              </div>

              <div>
                <span className="text-stone-500 block">Sector / Dirección Referencial:</span>
                <span className="font-medium text-stone-900">{caseEntry.location}</span>
              </div>

              <div>
                <span className="text-stone-500 block">Composición del Hogar:</span>
                <span className="font-bold text-stone-900">
                  {caseEntry.familyMembers} personas en total ({caseEntry.childrenCount} menores de edad)
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Adultos Mayores o Discapacidad:</span>
                <span className={`font-semibold ${caseEntry.elderlyOrDisabled ? 'text-rose-700' : 'text-stone-700'}`}>
                  {caseEntry.elderlyOrDisabled ? 'Sí, incluye personas con vulnerabilidad médica' : 'No registrados'}
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-stone-200">
                <span className="text-stone-500 block mb-1">Necesidad Prioritaria Diagnosticada:</span>
                <span className="inline-block px-3 py-1 bg-brand-dark text-white font-bold rounded-xl text-xs">
                  {PRIORITY_NEEDS_LABELS[caseEntry.priorityNeed] || caseEntry.priorityNeed}
                </span>
              </div>
            </div>
          </div>

          {/* Testimonio y Relato Social */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-brand-ocean" />
              2. Relato Testimonial de la Familia
            </h2>
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed italic">
              "{caseEntry.narrative}"
            </div>
          </div>

          {/* Diagnóstico de Campo y Próximos Pasos */}
          {caseEntry.aiResponse && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-brand-ocean" />
                3. Evaluación Social y Logística
              </h2>
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-2.5 text-xs text-stone-700">
                <div>
                  <strong className="text-stone-900 block mb-0.5">Diagnóstico de Prioridad:</strong>
                  <p>{caseEntry.aiResponse.priorityAssessment}</p>
                </div>

                {caseEntry.aiResponse.nextSteps && caseEntry.aiResponse.nextSteps.length > 0 && (
                  <div className="pt-2 border-t border-stone-200">
                    <strong className="text-stone-900 block mb-1">Ruta de Acción Recomendada:</strong>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {caseEntry.aiResponse.nextSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Canal para el Donante o Padrino */}
          <div className="bg-brand-ocean/5 rounded-2xl p-4 sm:p-5 border border-brand-ocean/20 text-xs text-stone-700 space-y-2">
            <div className="font-bold text-brand-ocean flex items-center gap-1.5 text-xs sm:text-sm">
              <HeartHandshake size={16} />
              <span>¿Cómo puede un donante apadrinar o apoyar este caso?</span>
            </div>
            <p className="leading-relaxed">
              Mano a Mano Venezuela coordina la entrega directa de insumos en manos de la familia con constancia fotográfica y acta de entrega. Puede aportar en insumos materiales o mediante donación asignada al código <strong className="font-mono text-stone-900">{currentEntry.caseId}</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px] text-stone-800 font-bold">
              <span>📧 manomanovzla@gmail.com (Canal Oficial Único de Consultas y Donaciones)</span>
              <span>📍 Centros de Acopio Caracas & La Guaira</span>
            </div>
          </div>

          {/* Pie Institucional del Dossier */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span>Dossier emitido bajo estrictos estándares de protección de la identidad familiar.</span>
            <span className="font-mono">Pág. 1 de 1 • Brigada 99HDD</span>
          </div>

        </div>

        {/* Footer no imprimible con botones de acción */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Descargar este caso en formato Excel individual (.csv)"
            >
              <Download size={14} className="text-teal-600" />
              <span>Descargar Excel</span>
            </button>

            {currentEntry.drivePdfUrl && (
              <a
                href={currentEntry.drivePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink size={13} />
                <span>PDF en Drive</span>
              </a>
            )}

            <button
              onClick={handleCopySummary}
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? '¡Copiado!' : 'Copiar Ficha'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {showEmailPrompt ? (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="correo@donante.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
                <button
                  type="button"
                  onClick={handleSendEmailToDonor}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPrompt(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmailPrompt(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Mail size={15} />
                <span>Hacer llegar a Donante Interesado</span>
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
