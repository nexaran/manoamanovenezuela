import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  ProjectLogo, 
  loadProjectLogos, 
  saveProjectLogos, 
  addLogoToProjectCard, 
  removeLogoFromProjectCard, 
  resetProjectCardLogos 
} from '../lib/projectLogosStorage';
import { syncCurrentContentToProject } from '../lib/syncService';

interface ProjectLogosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: 'card1' | 'card2' | null;
  cardTitle: string;
}

export const ProjectLogosModal: React.FC<ProjectLogosModalProps> = ({
  isOpen,
  onClose,
  cardId,
  cardTitle
}) => {
  const [logos, setLogos] = useState<ProjectLogo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && cardId) {
      loadProjectLogos(cardId).then(setLogos);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, cardId]);

  if (!isOpen || !cardId) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);
      const updated = await addLogoToProjectCard(cardId, file);
      setLogos(updated);
      syncCurrentContentToProject().catch(() => {});
      setSuccessMsg('¡Logo añadido con éxito!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error adding project logo:', err);
      setErrorMsg(err.message || 'No se pudo procesar la imagen del logo. Prueba con formato PNG o JPG.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (logoId: string) => {
    try {
      const updated = await removeLogoFromProjectCard(cardId, logoId);
      setLogos(updated);
      syncCurrentContentToProject().catch(() => {});
      setSuccessMsg('Logo eliminado.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error removing logo:', err);
      setErrorMsg('No se pudo eliminar el logo.');
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetProjectCardLogos(cardId);
      setLogos(defaults);
      syncCurrentContentToProject().catch(() => {});
      setSuccessMsg('Restablecido a los logos originales.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error resetting logos:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-stone-200 text-stone-800 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-brand-dark">
              Logos: {cardTitle}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Agrega, sustituye o elimina los logos que aparecerán en esta tarjeta
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <Check size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Logos List */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
            Logos activos en esta tarjeta ({logos.length})
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {logos.map((logo, index) => (
              <div 
                key={logo.id} 
                className="relative group p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-brand-accent/40 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-white border border-stone-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img 
                      src={logo.url} 
                      alt={logo.name || `Logo ${index + 1}`}
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {logo.name || `Logo ${index + 1}`}
                    </p>
                    <span className="text-[10px] text-stone-500">
                      {index === 0 ? 'Logo principal' : 'Logo adicional'}
                    </span>
                  </div>
                </div>

                {/* Remove button (if more than 1 logo or custom) */}
                <button
                  type="button"
                  onClick={() => handleRemove(logo.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Eliminar este logo"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action: Add New Logo */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 hover:bg-stone-50 text-center mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/heic"
            className="hidden"
            id={`project-logo-upload-${cardId}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`project-logo-upload-${cardId}`}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-brand-ocean hover:bg-[#0077b6] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Procesando imagen...</span>
              </>
            ) : (
              <>
                <Plus size={15} />
                <span>Agregar nuevo logo</span>
              </>
            )}
          </label>
          <p className="text-[11px] text-stone-500 mt-2">
            Formatos recomendados: PNG con fondo transparente o SVG.
          </p>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
            title="Volver a los logos predeterminados"
          >
            <RotateCcw size={13} />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
