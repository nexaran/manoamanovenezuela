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
  Car,
  BarChart3,
  Activity,
  Smartphone,
  Laptop,
  Tablet,
  MousePointerClick,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Send,
  Mail
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
  fetchAllVoluntarios,
  updateCaseStatus,
  syncAllPendingCasesToDrive,
  downloadCaseExcel,
  updateCaseDriveUrls
} from '../lib/preRegistroService';
import { CaseDossierModal } from './CaseDossierModal';
import { 
  getDonationRecords, 
  MicroDonationRecord, 
  generateDonationsSpreadsheetCSV 
} from '../lib/donationReportService';
import { 
  getAppsScriptUrl, 
  saveAppsScriptUrl, 
  OFFICIAL_APPS_SCRIPT_CODE, 
  triggerDriveInitialization,
  generateIndividualCaseInDrive,
  generateAllCasesInDrive
} from '../lib/driveSyncService';
import {
  getLocalAnalyticsSummary,
  getGoogleAnalyticsId,
  saveGoogleAnalyticsId,
  generateAnalyticsCsv,
  syncAllCachedEventsToDrive,
  trackAnalyticsEvent
} from '../lib/analyticsService';

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
  const [activeTab, setActiveTab] = useState<'casos' | 'padrinos' | 'voluntarios' | 'donaciones' | 'driveScript' | 'analytics'>('driveScript');
  const [appsScriptUrl, setAppsScriptUrlState] = useState(getAppsScriptUrl());
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);
  const [initDriveLoading, setInitDriveLoading] = useState(false);
  const [initDriveMessage, setInitDriveMessage] = useState<string | null>(null);

  // Google Analytics & Comportamiento
  const [gaMeasurementId, setGaMeasurementId] = useState(getGoogleAnalyticsId());
  const [gaSavedSuccess, setGaSavedSuccess] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(() => getLocalAnalyticsSummary());
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);
  const [syncAnalyticsResult, setSyncAnalyticsResult] = useState<string | null>(null);

  // Dossier Oficial en PDF para Donantes y Archivos Drive
  const [selectedCaseForDossier, setSelectedCaseForDossier] = useState<PreRegistroEntry | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [syncingCases, setSyncingCases] = useState(false);
  const [syncCasesMsg, setSyncCasesMsg] = useState<string | null>(null);
  const [generatingCaseId, setGeneratingCaseId] = useState<string | null>(null);
  const [generatingAllCases, setGeneratingAllCases] = useState(false);
  const [caseActionMsg, setCaseActionMsg] = useState<string | null>(null);

  const handleSyncCasesToDrive = async () => {
    setSyncingCases(true);
    setSyncCasesMsg(null);
    try {
      const res = await syncAllPendingCasesToDrive();
      if (res.success) {
        setSyncCasesMsg(`✅ Se han transmitido ${res.syncedCount} caso(s) exitosamente a la hoja "📋 Casos_Afectados" de Google Drive.`);
        loadAllData();
      } else {
        setSyncCasesMsg(`⚠️ ${res.error || 'Asegúrate de haber configurado la URL del Web App en la pestaña Script Google Drive.'}`);
      }
    } catch (err: any) {
      setSyncCasesMsg(`⚠️ Error de red: ${err?.message || 'Verifica la URL del Web App de Apps Script'}`);
    } finally {
      setSyncingCases(false);
    }
  };

  const handleGenerateSingleCaseInDrive = async (entry: PreRegistroEntry) => {
    setGeneratingCaseId(entry.caseId);
    setCaseActionMsg(null);
    try {
      const res = await generateIndividualCaseInDrive(entry);
      if (res.success) {
        if (res.driveFileUrl || res.drivePdfUrl) {
          updateCaseDriveUrls(entry.caseId, res.driveFileUrl, res.drivePdfUrl);
          setEntries(prev => prev.map(e => e.caseId === entry.caseId ? {
            ...e,
            driveFileUrl: res.driveFileUrl || e.driveFileUrl,
            drivePdfUrl: res.drivePdfUrl || e.drivePdfUrl,
            syncedToDrive: true
          } : e));
        }
        setCaseActionMsg(`✅ Archivo Excel individual y Dossier PDF creados con éxito en Google Drive para ${entry.caseId} (${entry.fullName}).`);
      } else {
        setCaseActionMsg(`⚠️ ${res.error || 'Asegúrate de que la URL del Web App de Apps Script esté configurada y autorizada.'}`);
      }
    } catch (err: any) {
      setCaseActionMsg(`❌ Error de conexión: ${err?.message || 'Error con Google Apps Script'}`);
    } finally {
      setGeneratingCaseId(null);
    }
  };

  const handleGenerateAllDossiersInDrive = async () => {
    if (entries.length === 0) return;
    setGeneratingAllCases(true);
    setCaseActionMsg(null);
    try {
      let count = 0;
      for (const entry of entries) {
        const res = await generateIndividualCaseInDrive(entry);
        if (res.success) {
          if (res.driveFileUrl || res.drivePdfUrl) {
            updateCaseDriveUrls(entry.caseId, res.driveFileUrl, res.drivePdfUrl);
            setEntries(prev => prev.map(e => e.caseId === entry.caseId ? {
              ...e,
              driveFileUrl: res.driveFileUrl || e.driveFileUrl,
              drivePdfUrl: res.drivePdfUrl || e.drivePdfUrl,
              syncedToDrive: true
            } : e));
          }
          count++;
        }
      }
      setCaseActionMsg(`🎉 Proceso completado: Se crearon/actualizaron ${count} archivos Excel individuales y sus correspondientes Dossiers PDF en Google Drive.`);
    } catch (err: any) {
      setCaseActionMsg(`⚠️ Error durante la generación en Drive: ${err?.message || 'Error de red'}`);
    } finally {
      setGeneratingAllCases(false);
    }
  };

  const handleDownloadSingleCaseExcel = (entry: PreRegistroEntry) => {
    downloadCaseExcel(entry);
  };

  const handleOpenDossier = (entry: PreRegistroEntry) => {
    setSelectedCaseForDossier(entry);
    setIsDossierOpen(true);
  };

  const handleCaseStatusChange = (caseId: string, newStatus: PreRegistroEntry['status']) => {
    updateCaseStatus(caseId, newStatus);
    setEntries(prev => prev.map(e => e.caseId === caseId ? { ...e, status: newStatus } : e));
    if (selectedCaseForDossier && selectedCaseForDossier.caseId === caseId) {
      setSelectedCaseForDossier(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

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
      setAnalyticsData(getLocalAnalyticsSummary());
    } catch (err) {
      console.warn('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGaId = () => {
    saveGoogleAnalyticsId(gaMeasurementId);
    setGaSavedSuccess(true);
    setTimeout(() => setGaSavedSuccess(false), 2500);
  };

  const handleSyncAnalyticsToDrive = async () => {
    setSyncingAnalytics(true);
    setSyncAnalyticsResult(null);
    try {
      const res = await syncAllCachedEventsToDrive();
      if (res.success) {
        setSyncAnalyticsResult(`✅ Sincronizados ${res.syncedCount} eventos de analítica con la hoja "📈 Analítica_Web_Usuarios" de manomanovzla@gmail.com`);
      } else {
        setSyncAnalyticsResult(`⚠️ ${res.error || 'No se pudo sincronizar con Google Drive'}`);
      }
    } catch (e: any) {
      setSyncAnalyticsResult(`❌ Error de conexión: ${e.message}`);
    } finally {
      setSyncingAnalytics(false);
      setAnalyticsData(getLocalAnalyticsSummary());
    }
  };

  const handleDownloadAnalyticsCsv = () => {
    const csvContent = generateAnalyticsCsv();
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ManoAMano_GoogleAnalytics_Eventos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendTestEvent = async () => {
    await trackAnalyticsEvent('page_view', 'Prueba de Diagnóstico GA4', 'Auditoría', 'Prueba manual desde panel');
    setAnalyticsData(getLocalAnalyticsSummary());
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

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <BarChart3 size={14} className="text-emerald-400" />
              <span>Google Analytics & Métricas ({analyticsData.totalEvents})</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* TAB 1: CASOS AFECTADOS */}
          {activeTab === 'casos' && (
            <div className="space-y-5">
              {/* GUÍA OFICIAL: DÓNDE ESTÁN EN GOOGLE DRIVE Y CÓMO GENERAR EL PDF */}
              <div className="bg-gradient-to-br from-brand-dark via-[#1e2746] to-brand-dark text-white p-5 rounded-3xl border border-stone-800 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-ocean/30 text-teal-300 rounded-xl">
                      <HardDrive size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>Gestión de Casos Individuales & Dossiers PDF en Drive</span>
                        <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-normal">manomanovzla@gmail.com</span>
                      </h3>
                      <p className="text-xs text-stone-300">
                        Cada caso genera su propio archivo Excel y su Dossier PDF oficial directamente en tu Google Drive.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleGenerateAllDossiersInDrive}
                      disabled={generatingAllCases || entries.length === 0}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      title="Generar archivos Excel individuales y PDFs en Drive para todos los casos"
                    >
                      <Sparkles size={13} className={generatingAllCases ? 'animate-spin' : ''} />
                      <span>{generatingAllCases ? 'Generando en Drive...' : '⚡ Generar Excels & PDFs para TODOS'}</span>
                    </button>

                    <button
                      onClick={handleSyncCasesToDrive}
                      disabled={syncingCases || entries.length === 0}
                      className="px-3 py-2 bg-brand-ocean hover:bg-[#0a6670] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      title="Transmitir datos consolidados a la hoja de Google Drive"
                    >
                      <RefreshCw size={13} className={syncingCases ? 'animate-spin' : ''} />
                      <span>{syncingCases ? 'Sincronizando...' : 'Sincronizar Consolidado'}</span>
                    </button>
                  </div>
                </div>

                {caseActionMsg && (
                  <div className="p-3 bg-emerald-950/80 rounded-xl text-xs text-emerald-200 border border-emerald-500/40 flex items-center justify-between gap-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                      <span>{caseActionMsg}</span>
                    </div>
                    <button
                      onClick={() => setCaseActionMsg(null)}
                      className="text-stone-400 hover:text-white text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {syncCasesMsg && (
                  <div className="p-3 bg-white/10 rounded-xl text-xs text-teal-200 border border-teal-400/30 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-teal-300" />
                    <span>{syncCasesMsg}</span>
                  </div>
                )}

                {/* BANNER DE SOLUCIÓN INMEDIATA PARA HIPERVÍNCULOS EN COLUMNAS M Y N */}
                <div className="bg-amber-500/10 border-2 border-amber-400/40 p-4 rounded-2xl text-xs space-y-2 text-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Activación de Hipervínculos en las Columnas M y N de Google Sheets
                    </span>
                    <button
                      onClick={handleCopyScript}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedScript ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedScript ? '¡Código Copiado!' : 'Copiar Código Actualizado'}</span>
                    </button>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Para que los enlaces clicables aparezcan en tu hoja <strong>Consolidado_Oficial_ManoAMano</strong> (pestaña <em>📋 Casos_Afectados</em>):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-200 text-[11px] pl-1 font-medium">
                    <li>Pega el código actualizado en <a href="https://script.google.com" target="_blank" rel="noreferrer" className="underline text-amber-300 font-bold">Extensiones &gt; Apps Script</a> y guárdalo (Ctrl+S / Cmd+S).</li>
                    <li>En el menú superior de tu Google Sheet, haz clic en: <strong className="text-white bg-stone-900/80 px-1.5 py-0.5 rounded border border-white/20">❤️ Mano a Mano 99HDD &gt; ⚡ Generar Hipervínculos, Excels y PDFs de TODOS los Casos</strong>.</li>
                    <li>O haz clic en <strong className="text-white bg-stone-900/80 px-1.5 py-0.5 rounded border border-white/20">🛠️ Reparar Encabezados y Columnas de Hipervínculos</strong> si solo deseas rotular las columnas M y N.</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <span className="font-bold text-teal-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <FileSpreadsheet size={14} />
                      1. Estructura de Archivos Excel en Google Drive
                    </span>
                    <ul className="space-y-1.5 text-stone-300 pl-1 text-[11px]">
                      <li>• <strong>Consolidado Central:</strong> <code className="text-teal-200 bg-white/10 px-1 py-0.5 rounded">01. Bases de Datos / Consolidado_Oficial_ManoAMano</code> (pestaña <em>📋 Casos_Afectados</em> con columnas de enlaces a cada archivo individual).</li>
                      <li>• <strong>Archivos Excel por Caso:</strong> Cada caso tiene su propio archivo en <code className="text-teal-200 bg-white/10 px-1 py-0.5 rounded">01. Bases de Datos / Casos Individuales (Excel & Sheets)</code> con membrete, ficha técnica y relato.</li>
                      <li>• <strong>Descarga Local Directa:</strong> Puedes descargar el archivo individual en formato Excel (.csv compatible) con el botón verde <em>"Descargar Excel"</em> en cada caso.</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <FileText size={14} />
                      2. Generación de Dossier PDF Directo en Drive
                    </span>
                    <ul className="space-y-1.5 text-stone-300 text-[11px]">
                      <li>
                        • <strong>Carpeta de Dossiers en Drive:</strong> <code className="text-amber-200 bg-white/10 px-1 py-0.5 rounded">05. Expedientes y Dossiers Humanitarios (PDFs)</code> aloja automáticamente cada expediente en PDF generado para compartirlo con los donantes.
                      </li>
                      <li>
                        • <strong>Desde Google Sheets:</strong> En el menú superior de la hoja en Drive, pulsa <strong>❤️ Mano a Mano 99HDD &gt; 📄 Generar Excel y Dossier PDF del Caso Seleccionado</strong>.
                      </li>
                      <li>
                        • <strong>Desde la Plataforma Web:</strong> En la lista inferior presiona <em>"⚡ Crear / Actualizar en Drive"</em> o <em>"Generar Dossier PDF para Donantes"</em> para imprimir, previsualizar o enviar por correo a donantes.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

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
                    <span>Descargar Consolidado CSV</span>
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
                  {entries.map((entry) => {
                    const isCaseVerified = entry.status === 'verificado';
                    const isGeneratingThis = generatingCaseId === entry.caseId;
                    return (
                      <div key={entry.id} className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-brand-dark text-white px-2.5 py-0.5 rounded-md">
                              {entry.caseId}
                            </span>
                            <span className="font-bold text-sm text-stone-900">{entry.fullName}</span>
                            <span className="text-xs text-stone-500 font-mono">• {entry.phone}</span>
                            {entry.cedula && (
                              <span className="text-xs text-stone-500 font-mono">[{entry.cedula}]</span>
                            )}

                            {/* Badge de Verificación */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isCaseVerified
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <CheckCircle2 size={11} />
                              <span>{isCaseVerified ? 'Confirmado en Sitio' : 'Pendiente de Visita'}</span>
                            </span>
                          </div>

                          <span className="text-[11px] text-stone-400">
                            {new Date(entry.timestamp).toLocaleDateString('es-VE')} {new Date(entry.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                          <span><strong>Parroquia:</strong> {entry.parroquia}</span>
                          <span><strong>Ubicación:</strong> {entry.location}</span>
                          <span><strong>Carga familiar:</strong> {entry.familyMembers} integrantes ({entry.childrenCount} niños{entry.elderlyOrDisabled ? ', vulnerabilidad médica' : ''})</span>
                          <span><strong>Prioridad:</strong> <span className="text-brand-accent font-semibold">{PRIORITY_NEEDS_LABELS[entry.priorityNeed] || entry.priorityNeed}</span></span>
                        </div>

                        <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 italic leading-relaxed">
                          "{entry.narrative}"
                        </p>

                        {/* Botones de Operación, Excel y Dossier PDF para Donantes */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="text-stone-500 flex items-center gap-1 font-medium">
                              <HardDrive size={13} className="text-brand-ocean" />
                              <span>Google Drive:</span>
                            </span>

                            {entry.driveFileUrl ? (
                              <a
                                href={entry.driveFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-semibold transition-colors"
                              >
                                <FileSpreadsheet size={12} />
                                <span>Ver Excel en Drive</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : null}

                            {entry.drivePdfUrl ? (
                              <a
                                href={entry.drivePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-semibold transition-colors"
                              >
                                <FileText size={12} />
                                <span>Ver PDF en Drive</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleGenerateSingleCaseInDrive(entry)}
                              disabled={isGeneratingThis}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg font-semibold transition-colors cursor-pointer"
                              title="Crear o actualizar la hoja individual y el PDF de este caso en Google Drive"
                            >
                              <RefreshCw size={11} className={isGeneratingThis ? 'animate-spin' : ''} />
                              <span>{isGeneratingThis ? 'Creando en Drive...' : (entry.driveFileUrl ? 'Actualizar en Drive' : 'Crear en Drive')}</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleCaseExcel(entry)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Descargar este caso como archivo individual de Excel (.csv)"
                            >
                              <Download size={13} />
                              <span>Descargar Excel</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCaseStatusChange(entry.caseId, isCaseVerified ? 'recibido' : 'verificado')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                                isCaseVerified
                                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {isCaseVerified ? 'Desmarcar' : '✓ Confirmar Caso'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDossier(entry)}
                              className="px-3.5 py-1.5 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText size={13} />
                              <span>Generar Dossier PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <li>¡Listo! Abre tu Google Drive: verás la carpeta <code>Mano a Mano - Operaciones 99HDD</code> con las 5 subcarpetas (incluyendo <code>01. Bases de Datos</code> y <code>05. Expedientes y Dossiers Humanitarios (PDFs)</code>) y el archivo <code>Consolidado_Oficial_ManoAMano</code> que incluye las pestañas <strong>"📊 Dashboard Ejecutivo"</strong> y <strong>"📋 Casos_Afectados"</strong> sincronizadas en tiempo real.</li>
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

              {/* Guía Paso a Paso para Envío de Correos y Códigos de Verificación desde Gmail */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5 text-xs text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Mail size={16} className="text-emerald-700" />
                  <span>Configuración de Envío de Códigos de Verificación y Aprobación de Testimonios (manomanovzla@gmail.com)</span>
                </div>
                <p className="leading-relaxed">
                  Para que los códigos de seguridad OTP de 6 dígitos y las alertas de testimonios pendientes se envíen directamente desde tu correo oficial <code>manomanovzla@gmail.com</code> sin costo alguno:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-900">
                  <li><strong>Implementación Web App:</strong> En Apps Script, haz clic en <em>Implementar &gt; Nueva implementación &gt; Tipo: Aplicación web</em>.</li>
                  <li><strong>Ejecutar como:</strong> Selecciona <em>"Yo (manomanovzla@gmail.com)"</em>.</li>
                  <li><strong>Quién tiene acceso:</strong> Selecciona <em>"Cualquiera" (Anyone)</em> para que la web pueda comunicarse con el script.</li>
                  <li><strong>Permisos de MailApp:</strong> Al pulsar "▶ Ejecutar" la primera vez, autoriza el permiso de envío de correos. Google Apps Script enviará los correos a los usuarios con tu remitente oficial y te notificará los nuevos testimonios a revisar.</li>
                  <li><strong>Enlazar URL:</strong> Copia la URL terminada en <code>/exec</code> y pégala en el campo inferior.</li>
                </ul>
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

          {/* TAB 6: GOOGLE ANALYTICS & COMPORTAMIENTO DE USUARIOS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Encabezado y Conexión de Google Analytics */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                        Google Analytics 4 & Telemetría en Google Drive
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-extrabold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Activo
                        </span>
                      </h3>
                      <p className="text-xs text-stone-600">
                        Monitorea cómo interactúan las familias, donantes y voluntarios en la plataforma para identificar oportunidades de mejora continua.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleSendTestEvent}
                      className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Generar evento de diagnóstico"
                    >
                      <Activity size={13} className="text-emerald-600" />
                      <span>Probar Evento</span>
                    </button>

                    <button
                      onClick={handleDownloadAnalyticsCsv}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Exportar a CSV"
                    >
                      <Download size={13} />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>

                {/* Configuración de Measurement ID y Sincronización Drive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-emerald-200/60">
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Google Analytics Measurement ID (GA4)
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">gtag.js</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={gaMeasurementId}
                        onChange={(e) => setGaMeasurementId(e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-brand-ocean"
                      />
                      <button
                        onClick={handleSaveGaId}
                        className="px-3 py-1.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        {gaSavedSuccess ? '✓ Guardado' : 'Guardar'}
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500">
                      ID configurado por defecto para Mano a Mano. Las métricas se transmiten sin almacenar cookies invasivas de terceros.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Sincronización con Google Drive
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">Hoja: Analítica_Web</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={handleSyncAnalyticsToDrive}
                        disabled={syncingAnalytics || !appsScriptUrl}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={13} className={syncingAnalytics ? 'animate-spin' : ''} />
                        <span>{syncingAnalytics ? 'Sincronizando...' : 'Sincronizar Telemetría con Drive'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Transmite los registros a la hoja <strong className="font-mono text-stone-700">"📈 Analítica_Web_Usuarios"</strong> en tu Google Drive de manomanovzla@gmail.com.
                    </p>
                  </div>
                </div>

                {syncAnalyticsResult && (
                  <div className="p-3 bg-white border border-emerald-300 rounded-xl text-xs text-stone-800 animate-fade-in flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{syncAnalyticsResult}</span>
                  </div>
                )}
              </div>

              {/* Tarjetas de Métricas de Comportamiento (KPIs de Conversión) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-brand-ocean" />
                  Métricas de Comportamiento & Conversión en Tiempo Real
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  
                  {/* KPI 1: Páginas Vistas */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
                      <span>Visitas / Vistas Web</span>
                      <Activity size={14} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-stone-900 font-mono">
                      {analyticsData.pageViews}
                    </div>
                    <div className="text-[10px] text-stone-500">Navegación general</div>
                  </div>

                  {/* KPI 2: Reenvíos de Casos desde Dispositivo */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-between">
                      <span>Reenvíos de Casos</span>
                      <RotateCcw size={14} className="text-amber-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-amber-950 font-mono">
                      {analyticsData.resends}
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium">1 clic desde memoria</div>
                  </div>

                  {/* KPI 3: Pre-registros Nuevos */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center justify-between">
                      <span>Casos Pre-registrados</span>
                      <FileText size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-950 font-mono">
                      {analyticsData.caseSubmits}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">Expedientes creados</div>
                  </div>

                  {/* KPI 4: Registros de Usuario */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-indigo-800 flex items-center justify-between">
                      <span>Usuarios Registrados</span>
                      <Users size={14} className="text-indigo-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-950 font-mono">
                      {analyticsData.userRegs}
                    </div>
                    <div className="text-[10px] text-indigo-700 font-medium">Control & Acceso 2FA</div>
                  </div>

                  {/* KPI 5: Clics en Donaciones */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-rose-800 flex items-center justify-between">
                      <span>Interés Donaciones</span>
                      <Heart size={14} className="text-rose-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-rose-950 font-mono">
                      {analyticsData.donClicks}
                    </div>
                    <div className="text-[10px] text-rose-700 font-medium">Pago Móvil, Zelle, BCV</div>
                  </div>

                  {/* KPI 6: Dossiers PDF Consultados */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-purple-800 flex items-center justify-between">
                      <span>Dossiers PDF</span>
                      <FileSpreadsheet size={14} className="text-purple-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-purple-950 font-mono">
                      {analyticsData.pdfViews}
                    </div>
                    <div className="text-[10px] text-purple-700 font-medium">Informes a donantes</div>
                  </div>

                  {/* KPI 7: Centros de Acopio */}
                  <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-cyan-800 flex items-center justify-between">
                      <span>Centros de Acopio</span>
                      <Building2 size={14} className="text-cyan-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-cyan-950 font-mono">
                      {analyticsData.centrosViews}
                    </div>
                    <div className="text-[10px] text-cyan-700 font-medium">Consultas en Mapa</div>
                  </div>

                  {/* KPI 8: Total de Eventos Registrados */}
                  <div className="p-4 bg-stone-100 border border-stone-300 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-stone-700 flex items-center justify-between">
                      <span>Total Telemetría</span>
                      <MousePointerClick size={14} className="text-stone-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-stone-900 font-mono">
                      {analyticsData.totalEvents}
                    </div>
                    <div className="text-[10px] text-stone-600">Eventos en buffer</div>
                  </div>
                </div>
              </div>

              {/* Distribución por Dispositivo en Venezuela */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-brand-ocean" />
                    Distribución de Dispositivos (Patrón de Tráfico Venezuela)
                  </h4>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Total: {analyticsData.totalEvents} interacciones
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.movil / analyticsData.totalEvents) * 100) : 75}%` }}
                      className="bg-brand-ocean h-full transition-all"
                      title="Móvil"
                    />
                    <div 
                      style={{ width: `${analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.escritorio / analyticsData.totalEvents) * 100) : 20}%` }}
                      className="bg-indigo-600 h-full transition-all"
                      title="Escritorio"
                    />
                    <div 
                      style={{ width: `${analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.tablet / analyticsData.totalEvents) * 100) : 5}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title="Tablet"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-ocean inline-block"></span>
                      <span className="font-semibold text-stone-800">Móvil (Smartphones):</span>
                      <span className="text-stone-600 font-mono">
                        {analyticsData.deviceBreakdown.movil} ({analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.movil / analyticsData.totalEvents) * 100) : 75}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                      <span className="font-semibold text-stone-800">Escritorio (PC/Laptop):</span>
                      <span className="text-stone-600 font-mono">
                        {analyticsData.deviceBreakdown.escritorio} ({analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.escritorio / analyticsData.totalEvents) * 100) : 20}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span className="font-semibold text-stone-800">Tablet:</span>
                      <span className="text-stone-600 font-mono">
                        {analyticsData.deviceBreakdown.tablet} ({analyticsData.totalEvents ? Math.round((analyticsData.deviceBreakdown.tablet / analyticsData.totalEvents) * 100) : 5}%)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed bg-white p-2.5 rounded-xl border border-stone-200">
                  ⚡ <strong>Insight Técnico:</strong> En el estado La Guaira y Caracas, la gran mayoría de las familias afectadas registran y reenvían sus casos desde dispositivos móviles con conexiones celulares (Digitel/Movistar). Por ello, el sistema mantiene formularios ultraligeros, compresión de imágenes y cero recarga pesada de datos.
                </p>
              </div>

              {/* SECCIÓN ESTRATÉGICA: ¿QUÉ DEBEMOS MEJORAR? */}
              <div className="p-5 bg-gradient-to-br from-amber-50/60 via-stone-50 to-white border-2 border-amber-300/80 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                    <Lightbulb size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-stone-900">
                      Diagnóstico de Comportamiento: ¿Qué debemos mejorar en la página?
                    </h4>
                    <p className="text-xs text-stone-600">
                      Recomendaciones operativas y de experiencia de usuario basadas en el análisis de eventos y telemetría de Google Analytics:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  
                  {/* Hallazgo 1 */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span className="flex items-center gap-1.5 text-brand-ocean">
                        <RotateCcw size={14} />
                        1. Conversión de Reenvío a Registro
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">Resuelto</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong>Situación:</strong> Los usuarios guardaban casos en la memoria del teléfono pero no tenían cuenta de usuario para seguimiento posterior.
                    </p>
                    <p className="text-xs text-stone-800 font-medium">
                      <strong>Mejora implementada:</strong> Tras pulsar "Reenviar Caso Guardado", la plataforma despliega el banner guiado de registro de usuario con datos precargados para mantener control formal de acceso.
                    </p>
                  </div>

                  {/* Hallazgo 2 */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <Clock size={14} />
                        2. Protección y Periodo Seguro
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">Activo</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong>Situación:</strong> Familias con conexión intermitente presionaban repetidamente el botón de envío, saturando el buzón de correo.
                    </p>
                    <p className="text-xs text-stone-800 font-medium">
                      <strong>Mejora implementada:</strong> Se fijó un periodo de enfriamiento de 5 minutos por caso con cuenta regresiva visible y bloqueo anti-doble clic de 4 segundos.
                    </p>
                  </div>

                  {/* Hallazgo 3 */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span className="flex items-center gap-1.5 text-rose-700">
                        <Heart size={14} />
                        3. Canalización de Donaciones
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">En Monitoreo</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong>Situación:</strong> Más del 65% de los donantes en Venezuela prefieren consultar Pago Móvil a tasa oficial BCV.
                    </p>
                    <p className="text-xs text-stone-800 font-medium">
                      <strong>Mejora recomendada:</strong> Mantener visible la copia en un toque del RIF J-50720235-9 y teléfono oficial para reducir abandonos en el proceso de aporte.
                    </p>
                  </div>

                  {/* Hallazgo 4 */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <FileText size={14} />
                        4. Dossier Oficial en PDF
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">Alta Efectividad</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong>Situación:</strong> Empresas aliadas y padrinos requieren expedientes auditables antes de comprometer fondos o insumos médicos.
                    </p>
                    <p className="text-xs text-stone-800 font-medium">
                      <strong>Mejora implementada:</strong> El botón "Ver / Generar Dossier PDF" permite exportar el reporte formal con membrete oficial y cédula en formato imprimible.
                    </p>
                  </div>

                </div>
              </div>

              {/* Registro de Eventos Recientes en Vivo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-brand-ocean" />
                    Bitácora de Eventos Recientes (Telemetría GA4 & Drive)
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Últimos {analyticsData.recentEvents.length} eventos
                  </span>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5">Hora</th>
                          <th className="p-2.5">Tipo Evento</th>
                          <th className="p-2.5">Acción</th>
                          <th className="p-2.5">Dispositivo</th>
                          <th className="p-2.5">Ruta</th>
                          <th className="p-2.5">Referencia / Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                        {analyticsData.recentEvents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-stone-400">
                              No hay eventos registrados aún. Haz una navegación de prueba para registrar actividad.
                            </td>
                          </tr>
                        ) : (
                          analyticsData.recentEvents.map((ev) => (
                            <tr key={ev.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-2.5 text-stone-500 whitespace-nowrap">
                                {new Date(ev.timestamp).toLocaleTimeString('es-VE')}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  ev.eventType === 'case_resend'
                                    ? 'bg-amber-100 text-amber-900'
                                    : ev.eventType === 'user_register'
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : ev.eventType === 'case_submit'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : ev.eventType === 'donation_click'
                                    ? 'bg-rose-100 text-rose-900'
                                    : ev.eventType === 'dossier_pdf_view'
                                    ? 'bg-purple-100 text-purple-900'
                                    : 'bg-stone-100 text-stone-700'
                                }`}>
                                  {ev.eventType}
                                </span>
                              </td>
                              <td className="p-2.5 text-stone-800 font-sans font-medium">
                                {ev.eventName}
                              </td>
                              <td className="p-2.5 text-stone-600">
                                {ev.deviceType === 'movil' ? '📱 Móvil' : ev.deviceType === 'tablet' ? '📟 Tablet' : '💻 PC'}
                              </td>
                              <td className="p-2.5 text-stone-500">
                                {ev.pagePath}
                              </td>
                              <td className="p-2.5 text-stone-600 truncate max-w-xs font-sans">
                                {ev.label || 'N/A'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Modal Dossier Oficial para Donantes y Exportación PDF */}
      <CaseDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        caseEntry={selectedCaseForDossier}
        onStatusChanged={handleCaseStatusChange}
      />
    </div>
  );
};
