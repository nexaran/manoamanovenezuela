import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive, 
  TrendingUp, 
  Clock, 
  User, 
  CreditCard, 
  Building2, 
  Phone, 
  Mail, 
  ExternalLink,
  Search,
  Filter,
  Lock,
  Unlock,
  Trash2,
  Edit,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  getDonationRecords, 
  MicroDonationRecord, 
  generateDonationsSpreadsheetCSV, 
  generateGoogleDocsDonationsArchive,
  updateDonationStatus,
  deleteDonationRecord,
  updateDonationRecord,
  syncAllDonationsToGoogleDrive
} from '../lib/donationReportService';
import { 
  getAppsScriptUrl, 
  saveAppsScriptUrl, 
  sendPayloadToGoogleDrive 
} from '../lib/driveSyncService';

interface DonationsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordsUpdated?: () => void;
}

const MASTER_PASSWORD = 'manoamano2026';

export const DonationsDashboardModal: React.FC<DonationsDashboardModalProps> = ({
  isOpen,
  onClose,
  onRecordsUpdated
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mmv_admin_audit_unlocked') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Data & Filter State
  const [donations, setDonations] = useState<MicroDonationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);

  // Google Drive & Webhook State
  const [appsScriptUrl, setAppsScriptUrlState] = useState(getAppsScriptUrl());
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);

  // Deletion Confirmation Dialog State
  const [itemToDelete, setItemToDelete] = useState<MicroDonationRecord | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  // Edit Donation Modal State
  const [editingItem, setEditingItem] = useState<MicroDonationRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    donorName: '',
    donorDocument: '',
    donorPhone: '',
    donorEmail: '',
    paymentReference: '',
    motivation: ''
  });

  const loadData = () => {
    const records = getDonationRecords();
    setDonations(records);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setAppsScriptUrlState(getAppsScriptUrl());
      setSyncStatusMessage(null);
      setDeleteSuccessToast(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Password Unlock
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
      try {
        sessionStorage.setItem('mmv_admin_audit_unlocked', 'true');
      } catch {}
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleLockPanel = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('mmv_admin_audit_unlocked');
    } catch {}
  };

  const totalUSD = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalCount = donations.length;
  const verifiedCount = donations.filter(d => d.status === 'confirmado').length;
  const pendingCount = donations.filter(d => d.status === 'en_verificacion').length;

  const filteredDonations = donations.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (d.donorName || '').toLowerCase().includes(term) ||
      (d.donorDocument || '').toLowerCase().includes(term) ||
      (d.donorPhone || '').toLowerCase().includes(term) ||
      (d.donorEmail || '').toLowerCase().includes(term) ||
      (d.paymentReference || '').toLowerCase().includes(term) ||
      (d.receiptNumber || '').toLowerCase().includes(term);

    const matchesMethod = filterMethod === 'todos' || (d.paymentMethod || '').toLowerCase().includes(filterMethod.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || d.status === filterStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Action: Delete Donation (Falsa / Error)
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = deleteDonationRecord(itemToDelete.id);
    setDonations(updated);
    setItemToDelete(null);
    setDeleteSuccessToast(`✅ Donación ${itemToDelete.receiptNumber} de $${itemToDelete.amount} USD eliminada con éxito.`);
    setTimeout(() => setDeleteSuccessToast(null), 4000);
    if (onRecordsUpdated) onRecordsUpdated();
  };

  // Action: Open Edit Form
  const handleStartEdit = (item: MicroDonationRecord) => {
    setEditingItem(item);
    setEditFormData({
      amount: String(item.amount),
      donorName: item.donorName || '',
      donorDocument: item.donorDocument || '',
      donorPhone: item.donorPhone || '',
      donorEmail: item.donorEmail || '',
      paymentReference: item.paymentReference || '',
      motivation: item.motivation || ''
    });
  };

  // Action: Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedAmount = parseFloat(editFormData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor introduce un monto numérico válido mayor a 0');
      return;
    }

    const updatedList = updateDonationRecord(editingItem.id, {
      amount: parsedAmount,
      donorName: editFormData.donorName.trim() || 'Donante Solidario',
      donorDocument: editFormData.donorDocument.trim() || 'N/A',
      donorPhone: editFormData.donorPhone.trim() || 'N/A',
      donorEmail: editFormData.donorEmail.trim() || 'N/A',
      paymentReference: editFormData.paymentReference.trim() || 'N/A',
      motivation: editFormData.motivation.trim() || 'Aporte General'
    });

    setDonations(updatedList);
    setEditingItem(null);
    setDeleteSuccessToast(`✏️ Registro ${editingItem.receiptNumber} corregido y actualizado.`);
    setTimeout(() => setDeleteSuccessToast(null), 4000);
    if (onRecordsUpdated) onRecordsUpdated();
  };

  // Action: Sync All to Google Drive
  const handleSyncAllToGoogleDrive = async () => {
    if (!appsScriptUrl) {
      setSyncStatusMessage('⚠️ Introduce primero la URL de tu Web App de Apps Script para conectar.');
      return;
    }
    setIsSyncingDrive(true);
    setSyncStatusMessage(null);
    try {
      const res = await syncAllDonationsToGoogleDrive();
      setSyncStatusMessage(`🚀 ¡Sincronización enviada! ${res.sent} donaciones despachadas a tu Google Sheets en Drive.`);
    } catch (err: any) {
      setSyncStatusMessage(`Error de envío: ${err?.message || 'Revisa la URL de Apps Script'}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Action: Re-send Single Donation to Google Drive
  const handleSendSingleToDrive = async (item: MicroDonationRecord) => {
    try {
      const res = await sendPayloadToGoogleDrive('donacion', item);
      if (res.success) {
        setDeleteSuccessToast(`🚀 Donación ${item.receiptNumber} enviada a Google Drive.`);
      } else {
        setDeleteSuccessToast(`⚠️ Aviso: ${res.error || 'No se pudo contactar Apps Script'}`);
      }
      setTimeout(() => setDeleteSuccessToast(null), 4000);
    } catch {
      setDeleteSuccessToast('Error al conectar con Google Apps Script.');
      setTimeout(() => setDeleteSuccessToast(null), 4000);
    }
  };

  const handleSaveAppsScriptUrl = () => {
    saveAppsScriptUrl(appsScriptUrl);
    setUrlSavedSuccess(true);
    setTimeout(() => setUrlSavedSuccess(false), 3000);
  };

  const downloadCSV = () => {
    const csvData = '\uFEFF' + generateDonationsSpreadsheetCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Donaciones_Recibidas_ManoAMano_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyGoogleDocsArchive = () => {
    const markdown = generateGoogleDocsDonationsArchive();
    navigator.clipboard?.writeText(markdown);
    setCopiedTextType('docs');
    setTimeout(() => setCopiedTextType(null), 3000);
  };

  // =========================================================================
  // SCREEN 1: PASSWORD GATE (manoamano2026)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
        <div 
          className="relative w-full max-w-md bg-[#0a0e1c] text-white rounded-none border border-cyan-500/40 shadow-2xl p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/40 text-[#00f0ff] flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>

          <div className="mb-6">
            <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-wider block mb-1">
              ACCESO RESTRINGIDO &bull; AUDITORÍA
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white mb-1.5">
              Corrector y Auditor de Donativos
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Introduce la contraseña de coordinación autorizada para gestionar, borrar registros falsos, corregir montos y enlazar con Google Drive.
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-300 uppercase mb-1.5">
                Contraseña de Seguridad:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full bg-[#131a2e] border border-cyan-500/30 text-white rounded-none px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#00f0ff] placeholder-stone-600 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <span>Contraseña incorrecta. Acceso denegado.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4a5d23] hover:bg-[#5b722c] text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer border border-[#4a5d23] flex items-center justify-center gap-2"
            >
              <Unlock size={14} />
              <span>Desbloquear Auditor & Corrector</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-500 font-mono text-center">
            Mano a Mano Venezuela &bull; Brigada 99HDD &bull; manomanovzla@gmail.com
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: AUTHENTICATED AUDIT & DONATION CORRECTOR DASHBOARD
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-6xl bg-stone-900 text-stone-100 rounded-none border border-cyan-500/40 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a0e1c] text-white p-5 sm:p-6 border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/50 text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} />
                Auditor & Corrector Activo
              </span>
              <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                <Check size={12} /> Sesión Autorizada
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLockPanel}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded-none border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Bloquear panel por seguridad"
              >
                <Lock size={12} />
                <span className="hidden sm:inline">Bloquear</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                <span>Auditoría, Corrector y Control de Donativos</span>
              </h2>
              <p className="text-stone-400 text-xs font-sans mt-0.5">
                Revisa aportes, elimina registros de prueba o falsos, corrige montos y sincroniza con Google Drive (<span className="text-[#00f0ff]">manomanovzla@gmail.com</span>).
              </p>
            </div>

            {/* Metric KPI cards */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="bg-[#131a2e] px-3.5 py-2 border border-cyan-500/30 text-right min-w-[130px]">
                <span className="text-[10px] text-stone-400 font-mono uppercase block">Total Auditado</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-[#00f0ff]">
                  ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px] text-stone-400">USD</span>
                </span>
              </div>
              <div className="bg-[#131a2e] px-3.5 py-2 border border-stone-700 text-right min-w-[100px]">
                <span className="text-[10px] text-stone-400 font-mono uppercase block">Registros</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white">
                  {totalCount}
                </span>
              </div>
              <div className="bg-[#131a2e] px-3.5 py-2 border border-amber-600/30 text-right min-w-[110px]">
                <span className="text-[10px] text-amber-400 font-mono uppercase block">En Verificación</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {deleteSuccessToast && (
          <div className="bg-emerald-950/80 border-b border-emerald-500 text-emerald-200 text-xs font-mono px-6 py-2.5 flex items-center justify-between animate-fade-in shrink-0">
            <span>{deleteSuccessToast}</span>
            <button onClick={() => setDeleteSuccessToast(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* DRIVE BANNER & DIRECT ACCESS */}
        <div className="bg-[#0d1326] border-b border-cyan-500/20 p-4 sm:px-6 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HardDrive size={18} className="text-[#00f0ff] shrink-0" />
              <div className="text-xs text-stone-300">
                <strong>Enlace a Google Drive:</strong> {appsScriptUrl ? (
                  <span className="text-emerald-400 font-mono font-bold">🟢 Webhook Activo</span>
                ) : (
                  <span className="text-amber-400 font-mono">⚪ Requiere pegar la URL de Apps Script abajo</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://drive.google.com/drive/u/0/my-drive"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#4a5d23] hover:bg-[#5b722c] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#4a5d23]"
              >
                <ExternalLink size={13} />
                <span>Abrir Google Drive (Mi unidad)</span>
              </a>

              <a
                href="https://drive.google.com/drive/u/0/search?q=Mano%20a%20Mano%20-%20Operaciones%2099HDD"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-stone-700 text-stone-200 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-600"
              >
                <Search size={13} />
                <span>Buscar Carpeta en Drive</span>
              </a>

              <button
                onClick={handleSyncAllToGoogleDrive}
                disabled={isSyncingDrive || donations.length === 0}
                className="px-3 py-1.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncingDrive ? 'animate-spin' : ''} />
                <span>{isSyncingDrive ? 'Sincronizando...' : '🚀 Sincronizar Todo a Sheets'}</span>
              </button>

              <button
                onClick={() => setShowDriveGuide(!showDriveGuide)}
                className="px-2.5 py-1.5 text-xs font-mono text-stone-400 hover:text-white underline cursor-pointer"
              >
                {showDriveGuide ? 'Ocultar Guía Drive' : '¿Por qué no la ves en Drive?'}
              </button>
            </div>
          </div>

          {/* Guía Explicativa Basada en la Captura */}
          {showDriveGuide && (
            <div className="p-3.5 bg-[#131a2e] border border-cyan-500/30 text-xs text-stone-300 font-sans space-y-2 animate-fade-in">
              <div className="font-bold text-[#00f0ff] font-mono flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Explicación de tu captura de pantalla de Google Drive:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-300 text-[11px] leading-relaxed">
                <li>
                  En tu pantalla estabas en la pestaña <strong>"Página principal"</strong> de Drive. Google Drive solo muestra allí sugerencias automáticas y no carpetas recién creadas por script.
                </li>
                <li>
                  Para ver la carpeta creada, haz clic en el menú izquierdo de Drive en <strong>"Mi unidad"</strong> (o haz clic en el botón verde "Abrir Google Drive (Mi unidad)" que te colocamos arriba).
                </li>
                <li>
                  El archivo que apareció en tu pantalla llamado <strong>"Proyecto sin título"</strong> es tu proyecto de Google Apps Script. Al implementarlo como Web App y guardar la URL aquí, cada donación (incluida tu prueba de $1) entra de inmediato a la hoja <code>Consolidado_Oficial_ManoAMano</code>.
                </li>
              </ol>
            </div>
          )}

          {/* Apps Script Webhook URL Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-stone-400 shrink-0">URL Apps Script:</span>
            <input
              type="text"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrlState(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-[#131a2e] border border-stone-700 text-stone-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
            />
            <button
              onClick={handleSaveAppsScriptUrl}
              className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-stone-700 text-white font-mono text-xs font-bold border border-stone-600 transition-colors shrink-0 cursor-pointer"
            >
              {urlSavedSuccess ? '✓ Guardada' : 'Guardar URL'}
            </button>
          </div>

          {syncStatusMessage && (
            <div className="p-2 bg-stone-800 border border-stone-700 text-xs font-mono text-stone-200">
              {syncStatusMessage}
            </div>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-[#131a2e] border-b border-stone-800 p-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por donante, C.I., ref o recibo..."
                className="w-full bg-[#0a0e1c] border border-stone-700 pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            {/* Filter Method */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="bg-[#0a0e1c] border border-stone-700 px-2.5 py-1.5 text-xs font-mono text-stone-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="todos">Todos los Métodos</option>
              <option value="binance">Binance Pay</option>
              <option value="zelle">Zelle</option>
              <option value="paypal">PayPal</option>
              <option value="swift">SWIFT / ACH</option>
              <option value="bizum">Bizum</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0a0e1c] border border-stone-700 px-2.5 py-1.5 text-xs font-mono text-stone-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="en_verificacion">En Verificación</option>
              <option value="confirmado">Conciliado</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={loadData}
              className="px-2.5 py-1.5 bg-[#0a0e1c] hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recargar datos"
            >
              <RefreshCw size={12} />
              <span>Recargar</span>
            </button>

            <button
              onClick={handleCopyGoogleDocsArchive}
              className="px-3 py-1.5 bg-[#0a0e1c] hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar texto para Google Docs"
            >
              {copiedTextType === 'docs' ? <Check size={12} className="text-emerald-400" /> : <FileText size={12} />}
              <span>{copiedTextType === 'docs' ? '¡Copiado Docs!' : 'Acta Docs'}</span>
            </button>

            <button
              onClick={downloadCSV}
              disabled={donations.length === 0}
              className="px-3 py-1.5 bg-[#4a5d23] hover:bg-[#5b722c] disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar archivo Excel / CSV"
            >
              <FileSpreadsheet size={12} />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* DONATION LIST / CORRECTOR TABLE */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-[#0a0e1c]">
          {filteredDonations.length === 0 ? (
            <div className="text-center py-16 text-stone-500 font-mono">
              <DollarSign size={40} className="mx-auto mb-3 opacity-25 text-stone-500" />
              <p className="text-sm font-bold text-stone-400">No hay donaciones registradas en el sistema</p>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 font-sans">
                Los aportes registrados en la web aparecerán aquí con su recibo, referencia bancaria y opciones para borrar errores o corregir datos.
              </p>
            </div>
          ) : (
            filteredDonations.map((item) => (
              <div 
                key={item.id}
                className="bg-[#131a2e] border border-stone-800 hover:border-cyan-500/50 p-4 transition-all"
              >
                {/* Header of donation card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-[#0a0e1c] px-2 py-0.5 border border-stone-700">
                        {item.receiptNumber}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(item.timestamp).toLocaleString('es-VE')}
                      </span>
                      {item.status === 'en_verificacion' ? (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-amber-950/60 text-amber-400 border border-amber-600/40 flex items-center gap-1">
                          <Clock size={10} className="animate-spin text-amber-400" />
                          En Verificación Manual
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                          <ShieldCheck size={10} className="text-emerald-400" />
                          Conciliado / Real
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mt-1.5 flex items-center gap-2 font-mono">
                      <User size={15} className="text-[#00f0ff]" />
                      <span>{item.donorName}</span>
                      {item.donorDocument && item.donorDocument !== 'N/A' && (
                        <span className="text-xs text-stone-400 font-normal">
                          (C.I. / RIF: {item.donorDocument})
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Amount Badge */}
                  <div className="text-right bg-[#0a0e1c] px-3.5 py-1.5 border border-cyan-500/40 shrink-0">
                    <span className="text-[10px] text-stone-400 font-mono uppercase block">Monto Aporte</span>
                    <span className="text-xl font-bold font-mono text-[#00f0ff]">
                      ${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-stone-400">USD</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-stone-500 font-mono uppercase block mb-0.5">Contacto Donante:</span>
                    <p className="text-stone-300 flex items-center gap-1">
                      <Phone size={12} className="text-stone-500" />
                      <strong>{item.donorPhone || 'No indicado'}</strong>
                    </p>
                    <p className="text-stone-400 flex items-center gap-1 text-[11px] truncate">
                      <Mail size={12} className="text-stone-500" />
                      {item.donorEmail || 'Sin correo'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 font-mono uppercase block mb-0.5">Canal y Referencia:</span>
                    <p className="text-stone-200 font-medium flex items-center gap-1">
                      <CreditCard size={12} className="text-stone-500" />
                      {item.paymentMethod}
                    </p>
                    <p className="text-[#00f0ff] font-mono text-[11px] font-bold">
                      Ref: {item.paymentReference || 'Sin referencia'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 font-mono uppercase block mb-0.5">Destino / Causa:</span>
                    <p className="text-stone-300 text-[11px] line-clamp-2">
                      {item.itemsDirectedTo?.join(', ') || item.motivation || 'Aporte General Operativo'}
                    </p>
                  </div>
                </div>

                {/* Motivation quote */}
                {item.motivation && (
                  <div className="mt-2.5 bg-[#0a0e1c] p-2 border border-stone-800 text-xs text-stone-400 italic">
                    "{item.motivation}"
                  </div>
                )}

                {/* CORRECTOR ACTIONS (Eliminar, Corregir, Cambiar Estado, Despachar) */}
                <div className="mt-3 pt-2.5 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Botón Cambiar Estado */}
                    {item.status === 'en_verificacion' ? (
                      <button
                        onClick={() => {
                          const updated = updateDonationStatus(item.id, 'confirmado');
                          setDonations(updated);
                          if (onRecordsUpdated) onRecordsUpdated();
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Marcar como confirmado y real"
                      >
                        <Check size={12} />
                        <span>Aprobar / Conciliar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const updated = updateDonationStatus(item.id, 'en_verificacion');
                          setDonations(updated);
                          if (onRecordsUpdated) onRecordsUpdated();
                        }}
                        className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reabrir a verificación manual"
                      >
                        <Clock size={12} />
                        <span>Reabrir Verificación</span>
                      </button>
                    )}

                    {/* Botón Reenviar a Drive */}
                    <button
                      onClick={() => handleSendSingleToDrive(item)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-stone-700"
                      title="Despachar a Google Apps Script"
                    >
                      <Send size={11} />
                      <span className="hidden sm:inline">Despachar a Drive</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* BOTÓN EDITAR / CORREGIR */}
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="px-3 py-1 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600/40 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Corregir monto, nombre o referencia"
                    >
                      <Edit size={12} />
                      <span>Corregir Datos</span>
                    </button>

                    {/* BOTÓN ELIMINAR (Falsa / Error) */}
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Eliminar donación por ser falsa o error"
                    >
                      <Trash2 size={12} />
                      <span>Borrar Donación</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0a0e1c] border-t border-cyan-500/30 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00f0ff]" />
            <span>Panel Protegido con Contraseña &bull; Toda modificación audita la base de datos local y Google Drive</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer border border-stone-600"
          >
            Cerrar Corrector
          </button>
        </div>

        {/* =========================================================================
            MODAL DE CONFIRMACIÓN DE BORRADO DE DONACIÓN (CORRECTOR)
           ========================================================================= */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#131a2e] border border-red-500 max-w-md w-full p-6 shadow-2xl text-white">
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <div className="p-2 bg-red-950 border border-red-500/40">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-base text-white">¿Eliminar Donación?</h4>
                  <span className="text-xs text-red-300 font-mono">Acción del Corrector de Registros</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#0a0e1c] border border-stone-800 my-4 text-xs font-mono space-y-1.5">
                <div><span className="text-stone-500">Recibo:</span> <strong className="text-[#00f0ff]">{itemToDelete.receiptNumber}</strong></div>
                <div><span className="text-stone-500">Monto:</span> <strong className="text-white">${itemToDelete.amount} USD</strong></div>
                <div><span className="text-stone-500">Donante:</span> <span className="text-stone-300">{itemToDelete.donorName}</span></div>
                <div><span className="text-stone-500">Referencia:</span> <span className="text-stone-300">{itemToDelete.paymentReference || 'N/A'}</span></div>
              </div>

              <p className="text-xs text-stone-300 font-sans mb-5 leading-relaxed">
                Esta acción eliminará el registro permanentemente de la base de datos y restará los <strong className="text-white">${itemToDelete.amount} USD</strong> del total acumulado. Úsalo para depurar donaciones falsas o pruebas erróneas.
              </p>

              <div className="flex items-center justify-end gap-2.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Sí, Borrar Donación</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE EDICIÓN / CORRECCIÓN DE DONACIÓN
           ========================================================================= */}
        {editingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#131a2e] border border-[#00f0ff]/50 max-w-lg w-full p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <Edit size={18} className="text-[#00f0ff]" />
                  <h4 className="font-mono font-bold text-base text-white">
                    Corregir Donación: {editingItem.receiptNumber}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-stone-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Monto en USD ($):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-cyan-500/40 px-3 py-2 text-white font-bold focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Referencia Bancaria:</label>
                    <input
                      type="text"
                      value={editFormData.paymentReference}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentReference: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Nombre del Donante:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.donorName}
                    onChange={(e) => setEditFormData({ ...editFormData, donorName: e.target.value })}
                    className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Cédula / RIF:</label>
                    <input
                      type="text"
                      value={editFormData.donorDocument}
                      onChange={(e) => setEditFormData({ ...editFormData, donorDocument: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={editFormData.donorPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, donorPhone: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={editFormData.donorEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, donorEmail: e.target.value })}
                    className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Nota / Declaratoria:</label>
                  <textarea
                    rows={2}
                    value={editFormData.motivation}
                    onChange={(e) => setEditFormData({ ...editFormData, motivation: e.target.value })}
                    className="w-full bg-[#0a0e1c] border border-stone-700 px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4a5d23] hover:bg-[#5b722c] text-white font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={13} />
                    <span>Guardar Corrección</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
