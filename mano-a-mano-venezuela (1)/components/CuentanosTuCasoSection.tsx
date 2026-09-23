import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  HeartHandshake, 
  Search, 
  Clock,
  Sparkles
} from 'lucide-react';

interface CuentanosTuCasoSectionProps {
  onOpenPreRegistro: () => void;
}

export const CuentanosTuCasoSection: React.FC<CuentanosTuCasoSectionProps> = ({
  onOpenPreRegistro
}) => {
  return (
    <section 
      id="cuentanos-tu-caso" 
      className="py-20 md:py-28 bg-gradient-to-b from-stone-50 via-white to-stone-50/80 relative overflow-hidden border-t border-stone-200/80 scroll-mt-24"
    >
      {/* Anchors para compatibilidad de navegación */}
      <div id="apadrina-familias" className="scroll-mt-24"></div>
      <div id="casos" className="scroll-mt-24"></div>

      {/* Elementos decorativos sutiles de fondo */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        
        {/* Encabezado Principal del Segmento */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-ocean/10 border border-brand-ocean/20 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-4">
            <HeartHandshake size={14} />
            Puente Solidario con La Guaira
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-5 tracking-tight">
            Cuéntanos tu Caso
          </h2>

          <p className="text-stone-700 text-base md:text-lg leading-relaxed font-normal">
            Nuestra finalidad es <strong>conectar a personas y familias afectadas con donantes solidarios</strong>. Recibimos tu solicitud, verificamos cada situación mediante visitas presenciales en el sitio, evaluamos las necesidades reales y gestionamos padrinos que puedan brindar apoyo directo, siempre bajo la más <strong>estricta discreción y respeto a la información sensible</strong>.
          </p>
        </div>

        {/* Ficha de Garantías y Proceso de Trabajo (4 Pasos) */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft p-6 sm:p-8 md:p-10 lg:p-12 mb-10 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                Protocolo Ético y de Verificación
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                ¿Cómo atendemos y procesamos cada caso recibido?
              </h3>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold shrink-0">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Protección y confidencialidad asegurada</span>
            </div>
          </div>

          {/* 4 Pasos del Proceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            
            {/* Paso 1: Recepción */}
            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/60 hover:bg-stone-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-stone-900 text-base mb-2">Recepción y Escucha</h4>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                  Relata tu testimonio o necesidad de forma sencilla. No te exigimos fotos pesadas iniciales; redactas la situación con tus propias palabras.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-brand-ocean font-semibold">
                <FileText size={13} />
                <span>Registro ágil</span>
              </div>
            </div>

            {/* Paso 2: Visita en Sitio */}
            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/60 hover:bg-stone-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-stone-900 text-base mb-2">Visita y Verificación</h4>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                  La Brigada 99HDD acude físicamente al albergue o comunidad en La Guaira para constatar los daños, condiciones de salud y necesidades prioritarias.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-brand-accent font-semibold">
                <MapPin size={13} />
                <span>Presencia en terreno</span>
              </div>
            </div>

            {/* Paso 3: Discreción y Respeto */}
            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/60 hover:bg-stone-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-stone-900 text-base mb-2">Máxima Discreción</h4>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                  Tratamos la información sensible con absoluto respeto. <strong>Nunca exponemos públicamente</strong> en la web ni en redes los expedientes de las familias.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-stone-700 font-semibold">
                <Lock size={13} />
                <span>Dignidad protegida</span>
              </div>
            </div>

            {/* Paso 4: Conexión con Donantes */}
            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/60 hover:bg-stone-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="font-bold text-stone-900 text-base mb-2">Conexión Solidaria</h4>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                  Presentamos el expediente técnico en privado a donantes o padrinos comprometidos para canalizar la ayuda y solución concreta.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-brand-ocean font-semibold">
                <HeartHandshake size={13} />
                <span>Canal auditado</span>
              </div>
            </div>

          </div>

          {/* Banner de Acción: Botón para Registrar el Caso */}
          <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-5 bg-stone-50 p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center gap-3.5 text-stone-700 text-xs sm:text-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-ocean text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={20} />
              </div>
              <div>
                <span className="font-bold text-stone-900 block text-sm sm:text-base">
                  ¿Tú o tu comunidad necesitan apoyo tras la emergencia?
                </span>
                <span className="text-stone-500 text-xs">
                  Tu mensaje será recibido por la directiva de la Fundación Mano a Mano y la Brigada 99HDD.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPreRegistro}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer shrink-0"
              id="btn-abrir-cuentanos-caso"
            >
              <span>Relatar mi Caso / Solicitar Apoyo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
