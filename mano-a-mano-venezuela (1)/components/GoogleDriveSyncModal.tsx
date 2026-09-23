import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Code,
  ShieldAlert,
  ChevronRight,
  Heart,
  Truck,
  FileText,
  Building2,
  Car
} from 'lucide-react';
import { 
  PreRegistroEntry, 
  PRIORITY_NEEDS_LABELS,
  PadrinoInquiryEntry,
  SUPPORT_TYPE_LABELS,
  VoluntarioEntry,
  VEHICLE_TYPE_LABELS,
  SKILLS_AREA_LABELS,
  AVAILABILITY_LABELS
} from '../lib/casesTypes';
import { 
  fetchAllPreRegistros, 
  fetchAllPadrinos, 
  fetchAllVoluntarios 
} from '../lib/preRegistroService';
import { 
  getDonationRecords, 
  MicroDonationRecord, 
  generateDonationsSpreadsheetCSV 
} from '../lib/donationReportService';
import { 
  getAppsScriptUrl, 
  saveAppsScriptUrl, 
  OFFICIAL_APPS_SCRIPT_CODE, 
  triggerDriveInitialization 
} from '../lib/driveSyncService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose
}) => {
  const [entries, setEntries] = useState<PreRegistroEntry[]>([]);
  const [padrinos, setPadrinos] = useState<PadrinoInquiryEntry[]>([]);
  const [voluntarios, setVoluntarios] = useState<VoluntarioEntry[]>([]);
  const [donaciones, setDonaciones] = useState<MicroDonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'casos' | 'padrinos' | 'voluntarios' | 'donaciones' | 'driveScript'>('driveScript');
  const [appsScriptUrl, setAppsScriptUrlState] = useState(getAppsScriptUrl());
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);
  const [initDriveLoading, setInitDriveLoading] = useState(false);
  const [initDriveMessage, setInitDriveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const dataCasos = await fetchAllPreRegistros();
      setEntries(dataCasos);
      setPadrinos(fetchAllPadrinos());
      setVoluntarios(fetchAllVoluntarios());
      setDonaciones(getDonationRecords());
    } catch (err) {
      console.warn('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const exportCasosCSV = () => {
    if (entries.length === 0) return;
    const headers = [
      'Código de Caso', 'Fecha', 'Nombre Completo', 'Cédula', 'Teléfono',
      'Parroquia', 'Ubicación Exacta', 'Total Familiares', 'Niños',
      'Adultos Mayores / Discapacidad', 'Necesidad Prioritaria', 'Narrativa', 'Evaluación IA'
    ];
    const rows = entries.map(e => [
      `"${e.caseId}"`,
      `"${new Date(e.timestamp).toLocaleString()}"`,
      `"${e.fullName.replace(/"/g, '""')}"`,
      `"${e.cedula || ''}"`,
      `"${e.phone}"`,
      `"${e.parroquia}"`,
      `"${e.location.replace(/"/g, '""')}"`,
      e.familyMembers,
      e.childrenCount,
      e.elderlyOrDisabled ? 'Sí' : 'No',
      `"${PRIORITY_NEEDS_LABELS[e.priorityNeed] || e.priorityNeed}"`,
      `"${e.narrative.replace(/"/g, '""')}"`,
      `"${(e.aiResponse?.priorityAssessment || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `Casos_Afectados_ManoAMano_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exportPadrinosCSV = () => {
    if (padrinos.length === 0) return;
    const headers = [
      'Código Padrino', 'Fecha', 'Nombre / Organización', 'Organización', 'Correo',
      'Teléfono', 'Modalidad de Apoyo', 'Mensaje'
    ];
    const rows = padrinos.map(p => [
      `"${p.code}"`,
      `"${new Date(p.timestamp).toLocaleString()}"`,
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${(p.organization || '').replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${SUPPORT_TYPE_LABELS[p.supportType] || p.supportType}"`,
      `"${(p.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `Padrinos_Registrados_ManoAMano_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exportVoluntariosCSV = () => {
    if (voluntarios.length === 0) return;
    const headers = [
      'Código Voluntario', 'Fecha', 'Nombre', 'Cédula', 'Teléfono',
      'Correo', 'Parroquia', 'Vehículo', 'Detalles Vehículo', 'Área de Apoyo', 'Disponibilidad', 'Comentarios'
    ];
    const rows = voluntarios.map(v => [
      `"${v.code}"`,
      `"${new Date(v.timestamp).toLocaleString()}"`,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${v.cedula || ''}"`,
      `"${v.phone}"`,
      `"${v.email || ''}"`,
      `"${v.parroquia}"`,
      `"${VEHICLE_TYPE_LABELS[v.hasVehicle] || v.hasVehicle}"`,
      `"${(v.vehicleDetails || '').replace(/"/g, '""')}"`,
      `"${SKILLS_AREA_LABELS[v.skillsArea] || v.skillsArea}"`,
      `"${AVAILABILITY_LABELS[v.availability] || v.availability}"`,
      `"${(v.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `Voluntarios_Brigada99HDD_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDonacionesCSV = () => {
    if (donaciones.length === 0) return;
    const csvContent = '\uFEFF' + generateDonationsSpreadsheetCSV();
    downloadFile(csvContent, `Donaciones_Recibidas_ManoAMano_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleTriggerDriveInit = async () => {
    if (!appsScriptUrl) {
      setInitDriveMessage('Primero introduce y guarda la URL de tu Web App de Apps Script.');
      return;
    }
    setInitDriveLoading(true);
    setInitDriveMessage(null);
    try {
      const res = await triggerDriveInitialization();
      if (res.success) {
        setInitDriveMessage('🚀 ¡Señal enviada a Google Apps Script! Si ya autorizaste el script en Google, revisa tu Google Drive (manomanovzla@gmail.com).');
      } else {
        setInitDriveMessage(`⚠️ Aviso: ${res.error || 'No se pudo contactar el endpoint'}`);
      }
    } catch (err: any) {
      setInitDriveMessage(`Error: ${err?.message || 'Error de conexión'}`);
    } finally {
      setInitDriveLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(OFFICIAL_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-brand-ocean/20 text-brand-ocean border border-brand-ocean/30 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive size={13} />
              Gestión Interna & Google Drive
            </span>
            <span className="text-white/60 text-xs font-mono">
              manomanovzla@gmail.com
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            Bandeja Central de Operaciones
          </h2>
          <p className="text-white/70 text-xs sm:text-sm font-light">
            Consulta los registros recibidos en los 3 canales: historias de familias, solicitudes de padrinos y voluntarios para la Brigada 99HDD.
          </p>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('casos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'casos'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <FileText size={14} />
              <span>Casos Afectados ({entries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('padrinos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'padrinos'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Heart size={14} className="text-brand-accent" fill="currentColor" />
              <span>Padrinos / Donantes ({padrinos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('voluntarios')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'voluntarios'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Truck size={14} />
              <span>Voluntarios 99HDD ({voluntarios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('donaciones')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'donaciones'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Building2 size={14} className="text-cyan-400" />
              <span>Donaciones Recibidas ({donaciones.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('driveScript')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'driveScript'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Code size={14} />
              <span>Script Google Drive</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* TAB 1: CASOS AFECTADOS */}
          {activeTab === 'casos' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="text-xs text-stone-600">
                  Total de casos recibidos (Storytelling): <strong className="text-stone-900">{entries.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Actualizar"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Recargar</span>
                  </button>
                  <button
                    onClick={exportCasosCSV}
                    disabled={entries.length === 0}
                    className="px-3.5 py-2 bg-brand-ocean hover:bg-[#0a6670] disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Descargar CSV</span>
                  </button>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-semibold">No hay casos registrados aún.</p>
                  <p className="text-xs text-stone-500 mt-1">Los testimonios enviados a través de "Cuéntanos tu Caso" aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-brand-dark text-white px-2 py-0.5 rounded-md">
                            {entry.caseId}
                          </span>
                          <span className="font-bold text-sm text-stone-900">{entry.fullName}</span>
                          <span className="text-xs text-stone-500">• {entry.phone}</span>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600">
                        <strong>Ubicación:</strong> {entry.parroquia} - {entry.location} | <strong>Carga familiar:</strong> {entry.familyMembers} personas ({entry.childrenCount} niños)
                      </div>
                      <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-150 italic leading-relaxed">
                        "{entry.narrative}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PADRINOS / DONANTES */}
          {activeTab === 'padrinos' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="text-xs text-stone-600">
                  Padrinos / Donantes en espera de expediente: <strong className="text-stone-900">{padrinos.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Recargar</span>
                  </button>
                  <button
                    onClick={exportPadrinosCSV}
                    disabled={padrinos.length === 0}
                    className="px-3.5 py-2 bg-brand-accent hover:bg-[#a00e40] disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Descargar CSV Padrinos</span>
                  </button>
                </div>
              </div>

              {padrinos.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Heart size={40} className="mx-auto mb-3 opacity-40 text-brand-accent" />
                  <p className="text-sm font-semibold">No hay registros de padrinos aún.</p>
                  <p className="text-xs text-stone-500 mt-1">Cuando un donante complete el formulario de "Apadrina a una Familia", su solicitud aparecerá aquí.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {padrinos.map((padrino) => (
                    <div key={padrino.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-brand-accent text-white px-2 py-0.5 rounded-md">
                            {padrino.code}
                          </span>
                          <span className="font-bold text-sm text-stone-900">{padrino.fullName}</span>
                          {padrino.organization && (
                            <span className="text-xs text-stone-500 font-medium">({padrino.organization})</span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(padrino.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 flex flex-wrap gap-4">
                        <span><strong>Correo:</strong> {padrino.email}</span>
                        <span><strong>Teléfono:</strong> {padrino.phone}</span>
                        <span><strong>Interés:</strong> {SUPPORT_TYPE_LABELS[padrino.supportType] || padrino.supportType}</span>
                      </div>
                      {padrino.message && (
                        <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-150 leading-relaxed">
                          "{padrino.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VOLUNTARIOS */}
          {activeTab === 'voluntarios' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="text-xs text-stone-600">
                  Voluntarios registrados para la Brigada 99HDD: <strong className="text-stone-900">{voluntarios.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Recargar</span>
                  </button>
                  <button
                    onClick={exportVoluntariosCSV}
                    disabled={voluntarios.length === 0}
                    className="px-3.5 py-2 bg-brand-ocean hover:bg-[#0a6670] disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Descargar CSV Voluntarios</span>
                  </button>
                </div>
              </div>

              {voluntarios.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Truck size={40} className="mx-auto mb-3 opacity-40 text-brand-dark" />
                  <p className="text-sm font-semibold">No hay voluntarios registrados aún.</p>
                  <p className="text-xs text-stone-500 mt-1">Los postulados a través de "Súmate como Voluntario" se listarán aquí para convocatoria.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {voluntarios.map((vol) => (
                    <div key={vol.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-stone-800 text-white px-2 py-0.5 rounded-md">
                            {vol.code}
                          </span>
                          <span className="font-bold text-sm text-stone-900">{vol.fullName}</span>
                          {vol.cedula && <span className="text-xs text-stone-400">({vol.cedula})</span>}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(vol.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>Teléfono:</strong> {vol.phone}</span>
                        <span><strong>Zona:</strong> {vol.parroquia}</span>
                        <span><strong>Vehículo:</strong> {VEHICLE_TYPE_LABELS[vol.hasVehicle] || vol.hasVehicle} {vol.vehicleDetails && `(${vol.vehicleDetails})`}</span>
                        <span><strong>Área:</strong> {SKILLS_AREA_LABELS[vol.skillsArea] || vol.skillsArea}</span>
                        <span><strong>Disponibilidad:</strong> {AVAILABILITY_LABELS[vol.availability] || vol.availability}</span>
                      </div>
                      {vol.message && (
                        <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-150 leading-relaxed">
                          "{vol.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DONACIONES REGISTRADAS */}
          {activeTab === 'donaciones' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="text-xs text-stone-600">
                  Total de donaciones registradas: <strong className="text-stone-900">{donaciones.length}</strong> (Acumulado: <strong className="text-brand-ocean">${donaciones.reduce((a, b) => a + (b.amount || 0), 0)} USD</strong>)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Actualizar"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Recargar</span>
                  </button>
                  <button
                    onClick={exportDonacionesCSV}
                    disabled={donaciones.length === 0}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Descargar CSV Drive</span>
                  </button>
                </div>
              </div>

              {donaciones.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Building2 size={40} className="mx-auto mb-3 opacity-40 text-stone-400" />
                  <p className="text-sm font-semibold">No hay donaciones registradas aún.</p>
                  <p className="text-xs text-stone-500 mt-1">Los aportes confirmados se sincronizan aquí de inmediato con su referencia y datos de contacto.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donaciones.map((d) => (
                    <div key={d.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-brand-dark text-white px-2 py-0.5 rounded-md">
                            {d.receiptNumber}
                          </span>
                          <span className="font-bold text-sm text-stone-900">{d.donorName}</span>
                          {d.donorDocument && (
                            <span className="text-xs text-stone-500">({d.donorDocument})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                            ${d.amount} USD
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(d.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>Teléfono:</strong> {d.donorPhone}</span>
                        <span><strong>Correo:</strong> {d.donorEmail}</span>
                        <span><strong>Método:</strong> {d.paymentMethod}</span>
                        <span><strong>Referencia:</strong> <code className="text-emerald-700 font-bold">{d.paymentReference || 'N/A'}</code></span>
                      </div>

                      {d.motivation && (
                        <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-150 leading-relaxed italic">
                          "{d.motivation}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SCRIPT GOOGLE DRIVE & WEBHOOK CONEXIÓN DIRECTA */}
          {activeTab === 'driveScript' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <HardDrive size={22} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong>Dashboard y Excels Privados en tu Google Drive:</strong> Todas las bases de datos consolidadas y el <strong>Dashboard Ejecutivo</strong> residen directamente dentro de tu cuenta <code>manomanovzla@gmail.com</code>. No están expuestos a los visitantes de la web, garantizando confidencialidad absoluta.
                </div>
              </div>

              {/* Explicación de por qué no aparecían las carpetas y cómo activarlas */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2 text-xs text-sky-950">
                <div className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Sparkles size={16} className="text-sky-600" />
                  <span>¿Cómo ver las carpetas y el Dashboard en tu Google Drive de inmediato?</span>
                </div>
                <p className="leading-relaxed">
                  En Google Apps Script, el código no crea archivos hasta que se ejecuta por primera vez con permisos de Drive. Para generarlo en 3 segundos:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 font-medium text-sky-900">
                  <li>Copia el código maestro que está abajo y pégalo en tu proyecto de <a href="https://script.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-sky-800">script.google.com</a>.</li>
                  <li>En la barra superior de Apps Script, en el selector de funciones (junto a "Depurar"), selecciona <strong>inicializarSistemaDrive</strong>.</li>
                  <li>Haz clic en el botón <strong>"▶ Ejecutar"</strong> (Run). Google te pedirá autorizar los permisos una sola vez.</li>
                  <li>¡Listo! Abre tu Google Drive: verás la carpeta <code>Mano a Mano - Operaciones 99HDD</code> con las 4 subcarpetas y el archivo <code>Consolidado_Oficial_ManoAMano</code> que incluye la pestaña <strong>"📊 Dashboard Ejecutivo"</strong> con fórmulas y tarjetas de métricas en vivo.</li>
                </ol>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href="https://drive.google.com/drive/u/0/home"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Abrir mi Google Drive</span>
                  </a>
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-300 hover:bg-sky-100 text-sky-900 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Code size={13} />
                    <span>Ir a script.google.com</span>
                  </a>
                </div>
              </div>

              {/* Input para guardar la URL del Web App de Apps Script */}
              <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  URL del Web App de Google Apps Script (para recepción en tiempo real):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={appsScriptUrl}
                    onChange={(e) => {
                      setAppsScriptUrlState(e.target.value);
                      setUrlSavedSuccess(false);
                    }}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-brand-ocean"
                  />
                  <button
                    onClick={() => {
                      saveAppsScriptUrl(appsScriptUrl);
                      setUrlSavedSuccess(true);
                      setTimeout(() => setUrlSavedSuccess(false), 3000);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {urlSavedSuccess ? '✓ Guardado y Enlazado' : 'Guardar y Enlazar'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
                  <span>Estado: {appsScriptUrl ? '🟢 Enlace activo a Google Drive' : '⚪ Esperando URL de Apps Script'}</span>
                  {appsScriptUrl && (
                    <button
                      onClick={handleTriggerDriveInit}
                      disabled={initDriveLoading}
                      className="px-3 py-1 bg-brand-ocean/10 hover:bg-brand-ocean/20 text-brand-ocean font-bold rounded-lg border border-brand-ocean/30 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {initDriveLoading ? 'Enviando...' : '🚀 Enviar señal para crear/verificar carpetas en Drive'}
                    </button>
                  )}
                </div>

                {initDriveMessage && (
                  <div className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 animate-fade-in">
                    {initDriveMessage}
                  </div>
                )}
              </div>

              {/* Código Maestro de Apps Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Code size={15} className="text-brand-ocean" />
                    Código Maestro para Google Apps Script:
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="px-3 py-1.5 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedScript ? '¡Código Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
                    {OFFICIAL_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
