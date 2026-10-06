import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { hasAcceptedCookies, acceptCookiesPolicy } from '../lib/security';

interface CookieBannerProps {
  onOpenCookiesPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenCookiesPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya fue aceptado
    if (!hasAcceptedCookies()) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    acceptCookiesPolicy();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-fade-in">
      <div className="bg-stone-900/95 backdrop-blur-md text-white border border-stone-700 p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-brand-accent font-bold text-xs sm:text-sm">
            <Cookie size={18} className="animate-pulse" />
            <span>Cookies Técnicas y Cero Rastreo Publicitario</span>
          </div>
          <button 
            onClick={handleAccept}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar banner de cookies"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Este sitio solo utiliza <strong>cookies técnicas estrictas</strong> para mantener tu sesión segura durante 2 horas y preservar borradores de formularios. <strong>Cero venta o cesión de datos a redes publicitarias externas</strong>.
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenCookiesPolicy}
            className="text-[11px] text-stone-400 hover:text-brand-accent underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Política Técnica</span>
            <ArrowRight size={11} />
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
