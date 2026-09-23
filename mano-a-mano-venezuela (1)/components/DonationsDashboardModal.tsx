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
  HeartHandshake
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

export const DonationsDashboardModal: React.FC<DonationsDashboardModalProps> = ({
  isOpen,
  onClose,
  onRecordsUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);

  const [donations, setDonations] = useState<MicroDonationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);

  const [appsScriptUrl, setAppsScriptUrlState] = useState('');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);

  // States for Delete / Correct Confirmation
  const [itemToDelete, setItemToDelete] = useState<MicroDonationRecord | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  // States for Edit / Correct Donation
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

  useEffect(() => {
    if (isOpen) {
      loadData();
      const savedUrl = getAppsScriptUrl();
      if (savedUrl) setAppsScriptUrlState(savedUrl);
    }
  }, [isOpen]);

  const loadData = () => {
    const list = getDonationRecords();
    setDonations(list);
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    if (cleanPass === 'manoamano2026' || cleanPass === 'manomanovzla' || cleanPass === '99hdd') {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleLockPanel = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleSaveAppsScriptUrl = () => {
    if (!appsScriptUrl.trim()) return;
    saveAppsScriptUrl(appsScriptUrl.trim());
    setUrlSavedSuccess(true);
    setSyncStatusMessage('✓ URL de Google Apps Script guardada y enlazada correctamente.');
    setTimeout(() => {
      setUrlSavedSuccess(false);
      setSyncStatusMessage(null);
    }, 4000);
  };

  const downloadCSV = () => {
    const csvContent = generateDonationsSpreadsheetCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Donaciones_Oficial_ManoAMano_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyGoogleDocsArchive = () => {
    const markdown = generateGoogleDocsDonationsArchive();
    navigator.clipboard.writeText(markdown);
    setCopiedTextType('docs');
    setTimeout(() => setCopiedTextType(null), 3000);
  };

  // Calculations
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
    const edited = updatedList.find(d => d.id === editingItem.id);
    if (edited) {
      sendPayloadToGoogleDrive('donacion', edited).catch(console.warn);
    }
    setEditingItem(null);
    setDeleteSuccessToast(`✏️ Registro ${editingItem.receiptNumber} corregido y actualizado en Drive.`);
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
    setSyncStatusMessage('⏳ Transmitiendo donaciones a Google Drive...');

    try {
      const res = await syncAllDonationsToGoogleDrive();
      if (res.sent > 0 || res.total === 0) {
        setSyncStatusMessage(`✅ ¡Sincronización exitosa! ${res.sent} donaciones enviadas a la hoja oficial de Google Drive.`);
      } else {
        setSyncStatusMessage(`⚠️ Enviados con advertencias: ${res.sent} enviados, ${res.errors} pendientes.`);
      }
    } catch (err: any) {
      setSyncStatusMessage(`❌ Error de sincronización: ${err.message || 'Error de red'}`);
    } finally {
      setIsSyncingDrive(false);
      setTimeout(() => setSyncStatusMessage(null), 7000);
    }
  };

  // Action: Send Single Donation to Drive
  const handleSendSingleToDrive = async (donation: MicroDonationRecord) => {
    if (!appsScriptUrl) {
      alert('Configura primero la URL de Google Apps Script en la barra superior.');
      return;
    }
    setDeleteSuccessToast(`⏳ Enviando ${donation.receiptNumber} a Google Drive...`);
    const res = await sendPayloadToGoogleDrive('donacion', donation);
    if (res.success) {
      setDeleteSuccessToast(`✅ Donación ${donation.receiptNumber} enviada a Google Drive.`);
    } else {
      setDeleteSuccessToast(`⚠️ Advertencia al enviar: ${res.error || 'Revisa permisos'}`);
    }
    setTimeout(() => setDeleteSuccessToast(null), 4000);
  };

  if (!isOpen) return null;

  // =========================================================================
  // SCREEN 1: PASSWORD GATE (manoamano2026) - ESTÉTICA MANO A MANO
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
        <div 
          className="relative w-full max-w-md bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="w-14 h-14 bg-brand-dark/10 border border-brand-dark/20 text-brand-dark rounded-2xl flex items-center justify-center mb-5">
            <Lock size={26} className="text-brand-dark" />
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={13} />
              Acceso Restringido &bull; Mano a Mano
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-brand-dark mb-1.5">
              Auditoría y Control de Donativos
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
              Introduce la clave de coordinación autorizada para conciliar pagos, corregir montos y enlazar con Google Drive.
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
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
                  className="w-full bg-stone-50 border border-stone-300 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                <span>Contraseña incorrecta. Acceso restringido a coordinadores de Mano a Mano.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand-ocean hover:bg-[#0a6670] text-white text-sm rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock size={16} />
              <span>Desbloquear Panel de Control</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500 text-center font-medium">
            Mano a Mano Venezuela &bull; Brigada 99HDD &bull; manomanovzla@gmail.com
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: AUTHENTICATED AUDIT & DONATION CORRECTOR DASHBOARD
  // ESTÉTICA Y COLORES OFICIALES MANO A MANO VENEZUELA
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-6xl bg-stone-50 text-stone-900 rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Institucional Mano a Mano */}
        <div className="bg-gradient-to-r from-brand-dark via-[#430080] to-brand-dark text-white p-5 sm:p-7 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent border border-brand-accent/40 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake size={13} />
                Auditoría y Control Mano a Mano
              </span>
              <span className="text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <Check size={13} /> Sesión Coordinadora Activa
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLockPanel}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Bloquear panel por seguridad"
              >
                <Lock size={13} />
                <span className="hidden sm:inline">Bloquear</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Conciliación, Corrector y Control de Donativos</span>
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5 max-w-2xl font-light">
                Verifica transferencias bancarias, elimina registros de prueba, corrige montos y sincroniza en vivo con Google Drive (<span className="text-cyan-300 font-medium">manomanovzla@gmail.com</span>).
              </p>
            </div>

            {/* Metric KPI cards con colores Mano a Mano */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-right min-w-[130px]">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Total Auditado</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-white/70">USD</span>
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-right min-w-[95px]">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Registros</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  {totalCount}
                </span>
              </div>
              <div className="bg-amber-500/20 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-amber-400/30 text-right min-w-[110px]">
                <span className="text-[10px] text-amber-200 uppercase font-bold tracking-wider block">En Verificación</span>
                <span className="text-lg sm:text-xl font-bold text-amber-300">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {deleteSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs px-6 py-2.5 flex items-center justify-between animate-fade-in shrink-0">
            <span className="font-medium">{deleteSuccessToast}</span>
            <button onClick={() => setDeleteSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <X size={15} />
            </button>
          </div>
        )}

        {/* DRIVE BANNER & DIRECT ACCESS */}
        <div className="bg-white border-b border-stone-200 p-4 sm:px-6 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HardDrive size={18} className="text-brand-ocean shrink-0" />
              <div className="text-xs text-stone-700">
                <strong>Enlace a Google Drive:</strong> {appsScriptUrl ? (
                  <span className="text-emerald-700 font-bold ml-1">🟢 Webhook Activo</span>
                ) : (
                  <span className="text-amber-700 font-medium ml-1">⚪ Requiere ingresar la URL de Apps Script abajo</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://drive.google.com/drive/u/0/my-drive"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink size={13} />
                <span>Abrir Google Drive (Mi unidad)</span>
              </a>

              <a
                href="https://drive.google.com/drive/u/0/search?q=Mano%20a%20Mano%20-%20Operaciones%2099HDD"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search size={13} />
                <span>Buscar Carpeta en Drive</span>
              </a>

              <button
                onClick={handleSyncAllToGoogleDrive}
                disabled={isSyncingDrive || donations.length === 0}
                className="px-3.5 py-2 bg-brand-accent hover:bg-[#a00f42] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncingDrive ? 'animate-spin' : ''} />
                <span>{isSyncingDrive ? 'Sincronizando...' : '🚀 Sincronizar Todo a Sheets'}</span>
              </button>

              <button
                onClick={() => setShowDriveGuide(!showDriveGuide)}
                className="px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                {showDriveGuide ? 'Ocultar Guía' : '¿Por qué no la ves en Drive?'}
              </button>
            </div>
          </div>

          {/* Guía Explicativa */}
          {showDriveGuide && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-2 animate-fade-in">
              <div className="font-bold text-sky-900 flex items-center gap-1.5">
                <Sparkles size={15} className="text-sky-600" />
                <span>Explicación sobre tu pantalla de Google Drive:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-sky-900 text-xs leading-relaxed">
                <li>
                  En tu pantalla estabas en la pestaña <strong>"Página principal"</strong> de Drive. Google Drive solo muestra allí sugerencias automáticas y no carpetas recién creadas por script.
                </li>
                <li>
                  Para ver la carpeta creada, haz clic en el menú izquierdo de Drive en <strong>"Mi unidad"</strong> (o haz clic en el botón azul "Abrir Google Drive (Mi unidad)" que te colocamos arriba).
                </li>
                <li>
                  El archivo que apareció en tu pantalla llamado <strong>"Proyecto sin título"</strong> es tu proyecto de Google Apps Script. Al implementarlo como Web App y guardar la URL aquí, cada donación entra de inmediato a la hoja <code>Consolidado_Oficial_ManoAMano</code>.
                </li>
              </ol>
            </div>
          )}

          {/* Apps Script Webhook URL Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-stone-600 shrink-0">URL Apps Script:</span>
            <input
              type="text"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrlState(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-stone-50 border border-stone-300 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-ocean"
            />
            <button
              onClick={handleSaveAppsScriptUrl}
              className="w-full sm:w-auto px-4 py-2 bg-brand-dark hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              {urlSavedSuccess ? '✓ Guardada' : 'Guardar URL'}
            </button>
          </div>

          {syncStatusMessage && (
            <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700">
              {syncStatusMessage}
            </div>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-stone-100/90 border-b border-stone-200 p-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por donante, C.I., ref o recibo..."
                className="w-full bg-white border border-stone-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-ocean"
              />
            </div>

            {/* Filter Method */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-brand-ocean cursor-pointer"
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
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-brand-ocean cursor-pointer"
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
              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recargar datos"
            >
              <RefreshCw size={13} />
              <span>Recargar</span>
            </button>

            <button
              onClick={handleCopyGoogleDocsArchive}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar texto para Google Docs"
            >
              {copiedTextType === 'docs' ? <Check size={13} className="text-emerald-600" /> : <FileText size={13} />}
              <span>{copiedTextType === 'docs' ? '¡Copiado Docs!' : 'Acta Docs'}</span>
            </button>

            <button
              onClick={downloadCSV}
              disabled={donations.length === 0}
              className="px-3.5 py-1.5 bg-brand-ocean hover:bg-[#0a6670] disabled:bg-stone-300 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Descargar archivo Excel / CSV"
            >
              <FileSpreadsheet size={13} />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* DONATION LIST / CORRECTOR TABLE */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-stone-50">
          {filteredDonations.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <DollarSign size={44} className="mx-auto mb-3 opacity-30 text-stone-400" />
              <p className="text-base font-bold text-stone-600">No hay donaciones registradas con ese criterio</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-sans">
                Los aportes registrados en la web aparecerán aquí con su recibo oficial, referencia bancaria y opciones de auditoría.
              </p>
            </div>
          ) : (
            filteredDonations.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl hover:border-brand-ocean/40 p-4 sm:p-5 transition-all shadow-xs hover:shadow-sm"
              >
                {/* Header of donation card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-brand-dark px-2.5 py-0.5 rounded-lg">
                        {item.receiptNumber}
                      </span>
                      <span className="text-xs text-stone-500">
                        {new Date(item.timestamp).toLocaleString('es-VE')}
                      </span>
                      {item.status === 'en_verificacion' ? (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock size={11} className="animate-spin text-amber-600" />
                          En Verificación Manual
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck size={11} className="text-emerald-600" />
                          Conciliado / Real
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-stone-900 mt-2 flex items-center gap-2">
                      <User size={16} className="text-brand-ocean" />
                      <span>{item.donorName}</span>
                      {item.donorDocument && item.donorDocument !== 'N/A' && (
                        <span className="text-xs text-stone-500 font-normal">
                          (C.I. / RIF: {item.donorDocument})
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Amount Badge */}
                  <div className="text-right bg-brand-ocean/10 border border-brand-ocean/20 px-4 py-2 rounded-2xl shrink-0">
                    <span className="text-[10px] text-brand-ocean font-bold uppercase tracking-wider block">Monto Aporte</span>
                    <span className="text-xl font-bold text-brand-ocean">
                      ${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">USD</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Contacto Donante:</span>
                    <p className="text-stone-800 flex items-center gap-1 font-medium">
                      <Phone size={13} className="text-stone-400" />
                      <span>{item.donorPhone || 'No indicado'}</span>
                    </p>
                    <p className="text-stone-600 flex items-center gap-1 text-xs truncate mt-0.5">
                      <Mail size={13} className="text-stone-400" />
                      <span>{item.donorEmail || 'Sin correo'}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Canal y Referencia:</span>
                    <p className="text-stone-800 font-medium flex items-center gap-1">
                      <CreditCard size={13} className="text-stone-400" />
                      <span>{item.paymentMethod}</span>
                    </p>
                    <p className="text-brand-ocean font-mono text-xs font-bold mt-0.5">
                      Ref: {item.paymentReference || 'Sin referencia'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Destino / Causa:</span>
                    <p className="text-stone-700 text-xs line-clamp-2">
                      {item.itemsDirectedTo?.join(', ') || item.motivation || 'Aporte General Operativo'}
                    </p>
                  </div>
                </div>

                {/* Motivation quote */}
                {item.motivation && (
                  <div className="mt-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs text-stone-600 italic">
                    "{item.motivation}"
                  </div>
                )}

                {/* CORRECTOR ACTIONS */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Botón Cambiar Estado */}
                    {item.status === 'en_verificacion' ? (
                      <button
                        onClick={() => {
                          const updated = updateDonationStatus(item.id, 'confirmado');
                          setDonations(updated);
                          const itm = updated.find(d => d.id === item.id);
                          if (itm) sendPayloadToGoogleDrive('donacion', itm).catch(console.warn);
                          if (onRecordsUpdated) onRecordsUpdated();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Marcar como confirmado y real"
                      >
                        <Check size={13} />
                        <span>Aprobar / Conciliar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const updated = updateDonationStatus(item.id, 'en_verificacion');
                          setDonations(updated);
                          const itm = updated.find(d => d.id === item.id);
                          if (itm) sendPayloadToGoogleDrive('donacion', itm).catch(console.warn);
                          if (onRecordsUpdated) onRecordsUpdated();
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Reabrir a verificación manual"
                      >
                        <Clock size={13} />
                        <span>Reabrir Verificación</span>
                      </button>
                    )}

                    {/* Botón Reenviar a Drive */}
                    <button
                      onClick={() => handleSendSingleToDrive(item)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer border border-stone-200"
                      title="Despachar a Google Apps Script"
                    >
                      <Send size={12} />
                      <span className="hidden sm:inline">Despachar a Drive</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* BOTÓN EDITAR / CORREGIR */}
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl border border-sky-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Corregir monto, nombre o referencia"
                    >
                      <Edit size={13} />
                      <span>Corregir Datos</span>
                    </button>

                    {/* BOTÓN ELIMINAR (Falsa / Error) */}
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Eliminar donación por ser falsa o error"
                    >
                      <Trash2 size={13} />
                      <span>Borrar Donación</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-stone-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-ocean" />
            <span>Panel Protegido con Contraseña &bull; Toda modificación audita la base de datos local y Google Drive</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Cerrar Corrector
          </button>
        </div>

        {/* =========================================================================
            MODAL DE CONFIRMACIÓN DE BORRADO DE DONACIÓN (CORRECTOR)
           ========================================================================= */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-900">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900">¿Eliminar Donación?</h4>
                  <span className="text-xs text-stone-500">Acción del Auditor de Registros</span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl my-4 text-xs space-y-1.5">
                <div><span className="text-stone-500">Recibo:</span> <strong className="text-brand-dark font-mono">{itemToDelete.receiptNumber}</strong></div>
                <div><span className="text-stone-500">Monto:</span> <strong className="text-emerald-700">${itemToDelete.amount} USD</strong></div>
                <div><span className="text-stone-500">Donante:</span> <span className="text-stone-800 font-medium">{itemToDelete.donorName}</span></div>
                <div><span className="text-stone-500">Referencia:</span> <span className="text-stone-800 font-mono">{itemToDelete.paymentReference || 'N/A'}</span></div>
              </div>

              <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                Esta acción eliminará el registro permanentemente de la base de datos y restará los <strong>${itemToDelete.amount} USD</strong> del total acumulado. Úsalo para depurar donaciones falsas o pruebas erróneas.
              </p>

              <div className="flex items-center justify-end gap-2.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-stone-900">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-ocean/10 text-brand-ocean rounded-xl">
                    <Edit size={18} />
                  </div>
                  <h4 className="font-bold text-base text-stone-900">
                    Corregir Donación: {editingItem.receiptNumber}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Monto en USD ($):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 font-bold focus:outline-none focus:border-brand-ocean"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Referencia Bancaria:</label>
                    <input
                      type="text"
                      value={editFormData.paymentReference}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentReference: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 font-mono focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Nombre del Donante:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.donorName}
                    onChange={(e) => setEditFormData({ ...editFormData, donorName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-brand-ocean font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Cédula / RIF:</label>
                    <input
                      type="text"
                      value={editFormData.donorDocument}
                      onChange={(e) => setEditFormData({ ...editFormData, donorDocument: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-brand-ocean"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={editFormData.donorPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, donorPhone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={editFormData.donorEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, donorEmail: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Nota / Declaratoria:</label>
                  <textarea
                    rows={2}
                    value={editFormData.motivation}
                    onChange={(e) => setEditFormData({ ...editFormData, motivation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-brand-ocean resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Check size={14} />
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
