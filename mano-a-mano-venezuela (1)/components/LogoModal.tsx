import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Loader2, 
  RotateCcw, 
  Image as ImageIcon, 
  Sliders, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  loadLogoConfig, 
  saveCustomLogo, 
  saveCustomEmblemLogo,
  saveLogoHeight, 
  resetCustomLogos, 
  processLogoFile,
  LogoConfig 
} from '../lib/logoStorage';
import { syncCurrentContentToProject } from '../lib/syncService';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdated?: () => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose, onLogoUpdated }) => {
  const [config, setConfig] = useState<LogoConfig>({
    primaryUrl: null,
    footerUrl: null,
    emblemUrl: null,
    heightPx: 52
  });
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // 'primary' | 'footer' | 'emblem' | null
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useSameForFooter, setUseSameForFooter] = useState(true);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);
  const emblemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadLogoConfig().then(cfg => {
        setConfig(cfg);
        setUseSameForFooter(!cfg.footerUrl || cfg.footerUrl === cfg.primaryUrl);
      });
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File, type: 'primary' | 'footer' | 'emblem') => {
    try {
      setErrorMsg(null);
      setIsProcessing(type);
      const dataUrl = await processLogoFile(file);

      if (type === 'emblem') {
        await saveCustomEmblemLogo(dataUrl);
      } else {
        await saveCustomLogo(type, dataUrl);
        
        // If user has set to use same for footer and uploaded primary
        if (type === 'primary' && useSameForFooter) {
          await saveCustomLogo('footer', dataUrl);
        }
      }

      const updatedCfg = await loadLogoConfig();
      setConfig(updatedCfg);
      syncCurrentContentToProject().catch(() => {});
      const label = type === 'primary' ? 'principal' : type === 'footer' ? 'secundario' : 'emblema oficial';
      setSuccessMsg(`¡Logo ${label} actualizado correctamente!`);
      if (onLogoUpdated) onLogoUpdated();

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setErrorMsg(err.message || 'No se pudo procesar la imagen del logo. Intenta con un formato PNG o JPG.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setConfig(prev => ({ ...prev, heightPx: val }));
    saveLogoHeight(val);
    syncCurrentContentToProject().catch(() => {});
    if (onLogoUpdated) onLogoUpdated();
  };

  const handleReset = async () => {
    if (confirm('¿Deseas restablecer los logos a su diseño original?')) {
      await resetCustomLogos();
      const resetCfg = await loadLogoConfig();
      setConfig(resetCfg);
      syncCurrentContentToProject().catch(() => {});
      setSuccessMsg('Logos restablecidos a los valores originales.');
      if (onLogoUpdated) onLogoUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white text-stone-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-dark to-[#4a0885] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-ocean border border-white/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Personalizar Logos Oficiales</h3>
              <p className="text-xs text-white/80">Sube tus archivos de logo (PNG, SVG, JPG, WebP o iPhone HEIC)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Primary Logo (Navbar) */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <ImageIcon size={16} className="text-brand-accent" />
                  Logo Principal (Barra de Navegación)
                </h4>
                <p className="text-xs text-stone-500">Se muestra en el encabezado superior y en la web.</p>
              </div>
              {config.primaryUrl && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  Personalizado
                </span>
              )}
            </div>

            {/* Live Preview Box */}
            <div className="bg-white border border-dashed border-stone-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden group">
              {config.primaryUrl ? (
                <img 
                  src={config.primaryUrl} 
                  alt="Logo Principal" 
                  style={{ height: `${config.heightPx}px` }}
                  className="w-auto object-contain max-w-full transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 text-stone-700">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-bold text-xs">
                    99
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-brand-dark leading-none">BRIGADA 99HDD</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Mano a Mano (Original)</p>
                  </div>
                </div>
              )}

              {/* Quick action button inside preview */}
              <button 
                onClick={() => primaryInputRef.current?.click()}
                disabled={isProcessing !== null}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-accent hover:bg-[#a00e40] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isProcessing === 'primary' ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>{config.primaryUrl ? 'Cambiar por otro logo' : 'Subir logo principal'}</span>
                  </>
                )}
              </button>
              <input 
                ref={primaryInputRef}
                type="file" 
                accept="image/png,image/svg+xml,image/jpeg,image/webp,.heic,.heif,.HEIC,.HEIF"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'primary');
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Recomendado: Formato PNG transparente o SVG vectorial para un acabado profesional.
            </p>
          </div>

          {/* Section 2: Logo Size Slider */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-brand-dark flex items-center gap-2">
                <Sliders size={14} className="text-brand-ocean" />
                Tamaño del Logo en la Barra de Navegación:
              </label>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700">
                {config.heightPx} px
              </span>
            </div>
            <input 
              type="range" 
              min={32} 
              max={84} 
              value={config.heightPx}
              onChange={handleHeightChange}
              className="w-full accent-brand-accent cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-medium">
              <span>Pequeño (32px)</span>
              <span>Predeterminado (52px)</span>
              <span>Grande (84px)</span>
            </div>
          </div>

          {/* Section 3: Secondary / Footer Logo */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <ImageIcon size={16} className="text-brand-ocean" />
                  Logo para Pie de Página (Footer)
                </h4>
                <p className="text-xs text-stone-500">Logo a utilizar en la sección inferior de contacto.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 my-2.5 cursor-pointer text-xs font-medium text-stone-700">
              <input 
                type="checkbox"
                checked={useSameForFooter}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseSameForFooter(checked);
                  if (checked && config.primaryUrl) {
                    saveCustomLogo('footer', config.primaryUrl);
                    setConfig(prev => ({ ...prev, footerUrl: prev.primaryUrl }));
                  }
                }}
                className="rounded text-brand-accent focus:ring-brand-accent w-4 h-4"
              />
              <span>Usar el mismo logo principal también en el pie de página</span>
            </label>

            {!useSameForFooter && (
              <div className="mt-3 bg-white border border-dashed border-stone-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[90px]">
                {config.footerUrl ? (
                  <img 
                    src={config.footerUrl} 
                    alt="Logo Footer" 
                    style={{ height: `${Math.round(config.heightPx * 0.9)}px` }}
                    className="w-auto object-contain max-w-full mb-2"
                  />
                ) : (
                  <p className="text-xs text-stone-400 mb-2">Sin logo secundario independiente (usa el predeterminado)</p>
                )}
                <button 
                  onClick={() => footerInputRef.current?.click()}
                  disabled={isProcessing !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {isProcessing === 'footer' ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>Subir logo especial para pie de página</span>
                    </>
                  )}
                </button>
                <input 
                  ref={footerInputRef}
                  type="file" 
                  accept="image/png,image/svg+xml,image/jpeg,image/webp,.heic,.heif,.HEIC,.HEIF"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'footer');
                    e.target.value = '';
                  }}
                />
              </div>
            )}
          </div>

          {/* Section 4: Emblema Oficial Circular */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-accent" />
                  Emblema Oficial Circular (Pie de página)
                </h4>
                <p className="text-xs text-stone-500">
                  Logo oficial "ORGANIZACIÓN SIN FINES DE LUCRO - De Guaireños para Guaireños (M 18:20)".
                </p>
              </div>
              {config.emblemUrl && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  Archivo personalizado
                </span>
              )}
            </div>

            <div className="mt-3 bg-white border border-dashed border-stone-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px]">
              <div className="w-28 h-28 rounded-full border border-stone-200 p-1 mb-3 overflow-hidden bg-white flex items-center justify-center shadow-sm">
                <img 
                  src={config.emblemUrl || "/ORGANIZACIÓN SIN FINES DE LUCRO-01.png"} 
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.dataset.fallback) {
                      t.dataset.fallback = '1';
                      t.src = '/organizacion-sin-fines-de-lucro.svg';
                    }
                  }}
                  alt="Emblema Oficial" 
                  className="w-full h-full object-contain"
                />
              </div>

              <button 
                onClick={() => emblemInputRef.current?.click()}
                disabled={isProcessing !== null}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-ocean hover:bg-sky-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isProcessing === 'emblem' ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Subir archivo PNG original exacto</span>
                  </>
                )}
              </button>
              <input 
                ref={emblemInputRef}
                type="file" 
                accept="image/png,image/svg+xml,image/jpeg,image/webp,.heic,.heif,.HEIC,.HEIF"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'emblem');
                  e.target.value = '';
                }}
              />
              <p className="text-[11px] text-stone-400 text-center mt-2">
                Selecciona tu archivo original <strong className="text-stone-600 font-medium">ORGANIZACIÓN SIN FINES DE LUCRO-01.png</strong> sin ninguna compresión ni alteración.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button 
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-rose-600 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Restablecer logos originales</span>
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-brand-dark hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
