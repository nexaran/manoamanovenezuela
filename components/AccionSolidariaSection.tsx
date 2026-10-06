import React from 'react';
import { 
  Heart, 
  FileText, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Lock
} from 'lucide-react';

interface AccionSolidariaSectionProps {
  onOpenPreRegistro: () => void;
  onOpenPadrinoModal: () => void;
  onOpenVoluntarioModal: () => void;
}

export const AccionSolidariaSection: React.FC<AccionSolidariaSectionProps> = ({
  onOpenPreRegistro,
  onOpenPadrinoModal,
  onOpenVoluntarioModal
}) => {
  return (
    <section id="apadrina-familias" className="py-20 md:py-28 bg-stone-50 relative overflow-hidden border-t border-stone-200 scroll-mt-20">
      {/* Anchor alias */}
      <div id="participar" className="scroll-mt-20"></div>

      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-ocean/10 border border-brand-ocean/20 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            Red de Solidaridad y Participación Activa
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight">
            ¿Cómo Deseas Participar o Solicitar Apoyo?
          </h2>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-light">
            Conectamos con respeto, ética y eficiencia. Para <strong>proteger la dignidad de las familias damnificadas</strong>, no exponemos expedientes vulnerables de forma pública en la web; gestionamos cada caso confidencialmente y canalizamos la ayuda de manera directa.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          
          {/* Card 1: Cuéntanos tu Caso (Afectados) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-9 border border-stone-200/90 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-ocean to-teal-400"></div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={26} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-ocean/10 text-brand-ocean border border-brand-ocean/20">
                  Familias Afectadas
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3 group-hover:text-brand-ocean transition-colors">
                Cuéntanos tu Caso
              </h3>

              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-light">
                Si tu hogar o sector en La Guaira sufrió daños por la emergencia sísmica, relátanos tu testimonio. Levantamos expedientes de forma confidencial para coordinar la evaluación presencial de nuestro equipo.
              </p>

              <div className="space-y-3 mb-8 pt-4 border-t border-stone-100 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-ocean shrink-0 mt-0.5" />
                  <span><strong>Sin fotos pesadas:</strong> Redacción ágil y empática de tu situación real.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-ocean shrink-0 mt-0.5" />
                  <span><strong>Código de Caso Oficial:</strong> Registro seguro para seguimiento directo.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-ocean shrink-0 mt-0.5" />
                  <span><strong>Inspección física:</strong> Visita de campo por la Brigada 99HDD en tu comunidad.</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPreRegistro}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer group-hover:-translate-y-0.5"
            >
              <span>Redactar mi Caso</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Apadrina una Familia (Donantes / Padrinos) */}
          <div className="bg-brand-dark text-white rounded-3xl p-6 sm:p-8 md:p-9 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-accent to-pink-500"></div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-brand-accent/20 text-brand-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart size={26} fill="currentColor" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                  Donantes & Fundaciones
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                Apadrina a una Familia
              </h3>

              <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                Conviértete en el respaldo directo de un hogar vulnerable. Nuestro equipo directivo te presentará en privado los expedientes verificados en terreno para canalizar tu apadrinamiento de forma auditada.
              </p>

              <div className="space-y-3 mb-8 pt-4 border-t border-white/10 text-xs sm:text-sm text-stone-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-accent shrink-0 mt-0.5" />
                  <span><strong>Privacidad protegida:</strong> Dossier confidencial de uso interno.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-accent shrink-0 mt-0.5" />
                  <span><strong>Apoyo a medida:</strong> Mensual, insumos puntuales o techos/vivienda.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-accent shrink-0 mt-0.5" />
                  <span><strong>Canal directo:</strong> Enlace inmediato por Correo o Instagram oficial.</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPadrinoModal}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-accent hover:bg-[#a00e40] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg cursor-pointer group-hover:-translate-y-0.5"
            >
              <span>Quiero ser Padrino</span>
              <Heart size={16} fill="currentColor" />
            </button>
          </div>

          {/* Card 3: Súmate como Voluntario (Brigada 99HDD) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-9 border border-stone-200/90 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-dark to-slate-600"></div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-stone-100 text-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck size={26} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  Brigada 99HDD
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3 group-hover:text-brand-ocean transition-colors">
                Súmate como Voluntario
              </h3>

              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-light">
                Atendemos diariamente más de 16 albergues y 13 comunidades en La Guaira. Súmate con tu vehículo (4x4, moto, camioneta), tus manos o tus conocimientos para fortalecer las rutas de auxilio.
              </p>

              <div className="space-y-3 mb-8 pt-4 border-t border-stone-100 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-stone-700 shrink-0 mt-0.5" />
                  <span><strong>Capacidad vehicular:</strong> Convocatoria de rústicos 4x4, motos y pickups.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-stone-700 shrink-0 mt-0.5" />
                  <span><strong>Múltiples áreas:</strong> Logística, salud, cocinas comunitarias y acopio.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-stone-700 shrink-0 mt-0.5" />
                  <span><strong>Acción continua:</strong> Convocatorias según tu parroquia y disponibilidad.</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenVoluntarioModal}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-dark hover:bg-stone-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer group-hover:-translate-y-0.5"
            >
              <span>Registrarme como Voluntario</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Informative Disclaimer Banner at Bottom */}
        <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-stone-700 text-xs sm:text-sm">
            <div className="p-2.5 bg-stone-100 text-brand-dark rounded-xl shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <strong className="text-stone-900 block sm:inline">Política de Protección de Datos & Fichas Internas: </strong>
              Los relatos y datos recolectados se gestionan bajo estricta confidencialidad en los repositorios oficiales de <code>manomanovzla@gmail.com</code>.
            </div>
          </div>
          <a
            href="mailto:manomanovzla@gmail.com"
            className="text-xs font-semibold text-brand-ocean hover:underline shrink-0 flex items-center gap-1"
          >
            Contacto de Coordinación &rarr;
          </a>
        </div>

      </div>
    </section>
  );
};
