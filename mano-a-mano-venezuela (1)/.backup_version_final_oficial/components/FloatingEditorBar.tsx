import React, { useState } from 'react';
import { 
  Edit3, 
  Eye, 
  Sparkles, 
  Image as ImageIcon, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  EyeOff,
  HelpCircle,
  X,
  UploadCloud,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useEditMode } from '../lib/editModeContext';
import { syncCurrentContentToProject } from '../lib/syncService';
import { HardDrive, TrendingUp } from 'lucide-react';

interface FloatingEditorBarProps {
  onOpenDriveSync?: () => void;
  onOpenDonationsDashboard?: () => void;
}

export const FloatingEditorBar: React.FC<FloatingEditorBarProps> = ({ onOpenDriveSync, onOpenDonationsDashboard }) => {
  const { 
    isEditorUnlocked, 
    isEditMode, 
    toggleEditMode, 
    lockAndHideEditor, 
    openLogoModal, 
    openPhotoModal,
    openPhotoTextsModal
  } = useEditMode();

  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // If editor is not unlocked (e.g., standard public visitor), render NOTHING in the DOM
  if (!isEditorUnlocked) {
    return null;
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSyncToProject = async () => {
    try {
      setIsSyncing(true);
      const res = await syncCurrentContentToProject();
      if (res.success) {
        triggerToast('🚀 ¡Excelente! Tus logos y fotos actuales han sido fijados en los archivos del proyecto. Al pulsar «Publicar» en AI Studio, la versión pública mostrará exactamente tus fotos y logos.');
      } else {
        triggerToast(`⚠️ Nota: ${res.error || 'No se pudo contactar el servidor local'}`);
      }
    } catch (err: any) {
      triggerToast(`⚠️ Error al sincronizar: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggle = () => {
    toggleEditMode();
    const willBeEdit = !isEditMode;
    triggerToast(
      willBeEdit 
        ? '✏️ Modo Edición: Botones de subida de fotos y logos visibles en la página.' 
        : '👁️ Vista Previa Limpia: Botones de subida ocultos en la página.'
    );
  };

  const handleLockAndHide = () => {
    lockAndHideEditor();
    triggerToast('🔒 Editor bloqueado y 100% oculto. Para volver a activarlo, presiona Ctrl+Shift+E o abre con ?edit=1');
  };

  return (
    <>
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[120] bg-stone-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-medium backdrop-blur-md flex items-center gap-3 animate-fade-in max-w-sm">
          <div className="w-2 h-2 rounded-full bg-brand-accent animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Publishing & Privacy Explanation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 text-white border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Privacidad y Publicación</h4>
                <p className="text-xs text-stone-400">¿Cómo ven la página los visitantes públicos?</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <strong className="text-white block mb-1">1. Los visitantes NO ven ningún botón</strong>
                Cualquier persona que entre a la web pública verá la página limpia: sin botones de «Subir logo», sin opciones de cambiar fotos y sin esta barra flotante.
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <strong className="text-white block mb-1">2. Solo tú puedes activarlo</strong>
                Para que el editor aparezca en cualquier computadora o navegador, debes:
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-stone-400">
                  <li>Presionar el atajo secreto: <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">Ctrl + Shift + E</code></li>
                  <li>O abrir el enlace añadiendo al final: <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">?edit=1</code></li>
                </ul>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <strong className="text-white block mb-1">3. Botón «Ocultar para Publicar»</strong>
                Al hacer clic en <span className="text-stone-100 font-semibold">«Ocultar Todo»</span>, la barra desaparece completamente del navegador para que puedas verificar la experiencia exacta de un visitante común.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Editor Dock */}
      <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 z-[90] flex flex-col items-end gap-2 select-none print:hidden">
        {isEditMode ? (
          /* EXPANDED BAR IN EDIT MODE */
          <div className="bg-stone-900/95 text-white rounded-2xl shadow-2xl border border-white/15 backdrop-blur-md overflow-hidden transition-all duration-300 w-full sm:w-auto max-w-full sm:max-w-xl">
            {/* Top Toolbar Header */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-stone-200">
                  Capa de Edición
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/60">
                  Privada
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                  title="¿Cómo funciona la privacidad en la página publicada?"
                >
                  <HelpCircle size={13} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                  title={isMinimized ? "Expandir barra de edición" : "Minimizar barra"}
                >
                  {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Content Actions */}
            {!isMinimized && (
              <div className="p-2 sm:p-3 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-1.5 sm:gap-2">
                {/* Grupo 1: Herramientas de Contenido */}
                <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={openLogoModal}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Subir o cambiar los logos de cabecera y pie de página"
                  >
                    <Camera size={13} className="text-brand-ocean shrink-0" />
                    <span>Logos</span>
                  </button>

                  <button
                    onClick={() => openPhotoModal('images')}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Gestionar y sustituir las fotos de la galería"
                  >
                    <ImageIcon size={13} className="text-brand-accent shrink-0" />
                    <span>Fotos</span>
                  </button>

                  <button
                    onClick={() => openPhotoTextsModal()}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Modificar títulos, mensajes reflexivos y ubicaciones de las fotos"
                  >
                    <Edit3 size={13} className="text-brand-ocean shrink-0" />
                    <span>Textos</span>
                  </button>

                  {onOpenDriveSync && (
                    <button
                      onClick={onOpenDriveSync}
                      className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Ver expedientes de casos recibidos y conectar con Google Drive"
                    >
                      <HardDrive size={13} className="text-amber-400 shrink-0" />
                      <span>Drive</span>
                    </button>
                  )}

                  {onOpenDonationsDashboard && (
                    <button
                      onClick={onOpenDonationsDashboard}
                      className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Ver Dashboard Interno de donaciones y conciliar aportes"
                    >
                      <TrendingUp size={13} className="text-[#00f0ff] shrink-0" />
                      <span>Donaciones</span>
                    </button>
                  )}
                </div>

                {/* Separador adaptativo */}
                <div className="hidden sm:block h-4 w-px bg-white/20 mx-0.5" />
                <div className="sm:hidden h-px bg-white/10 w-full" />

                {/* Grupo 2: Publicación y Vista */}
                <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleSyncToProject}
                    disabled={isSyncing}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    title="Fijar fotos y logos actuales en los archivos del proyecto antes de pulsar 'Publicar' en AI Studio"
                  >
                    {isSyncing ? (
                      <Loader2 size={12} className="animate-spin shrink-0" />
                    ) : (
                      <UploadCloud size={12} className="shrink-0" />
                    )}
                    <span className="sm:inline hidden">Fijar para Publicar</span>
                    <span className="sm:hidden inline">Fijar</span>
                  </button>

                  <button
                    onClick={handleToggle}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white rounded-xl text-[11px] sm:text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Ocultar botones en la página para previsualizar como visitante"
                  >
                    <Eye size={12} className="shrink-0" />
                    <span className="sm:inline hidden">Vista Previa</span>
                    <span className="sm:hidden inline">Previa</span>
                  </button>

                  <button
                    onClick={handleLockAndHide}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Ocultar barra completamente para publicación (Se reactiva con Ctrl+Shift+E o ?edit=1)"
                  >
                    <Lock size={11} className="shrink-0" />
                    <span className="sm:inline hidden">Ocultar Todo</span>
                    <span className="sm:hidden inline">Ocultar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* COLLAPSED VISITOR PREVIEW PILL */
          <div className="flex items-center gap-1.5 bg-stone-900/90 text-white p-1 sm:p-1.5 rounded-full shadow-xl border border-white/20 backdrop-blur-md">
            <button
              onClick={handleSyncToProject}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all text-[11px] sm:text-xs font-bold cursor-pointer disabled:opacity-50 shadow-sm"
              title="Fijar fotos y logos actuales en los archivos del proyecto"
            >
              {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
              <span className="sm:inline hidden">Fijar para Publicar</span>
              <span className="sm:hidden inline">Fijar</span>
            </button>

            <button
              onClick={handleToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-xs font-semibold cursor-pointer"
              title="Volver a activar los controles de edición de fotos y logos"
            >
              <Edit3 size={12} />
              <span>Editar</span>
            </button>

            <button
              onClick={handleLockAndHide}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Ocultar barra completamente para publicación (reactivar con Ctrl+Shift+E o ?edit=1)"
            >
              <EyeOff size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
