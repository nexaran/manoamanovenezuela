import React, { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  Info,
  FileText,
  UserCheck,
  Check,
  ChevronRight,
  X
} from 'lucide-react';
import { VerifiedCase, INITIAL_VERIFIED_CASES } from '../lib/casesTypes';

interface VerifiedCasesSectionProps {
  onApadrinarCase: (caseItem: VerifiedCase) => void;
  onOpenPreRegistro: () => void;
}

export const VerifiedCasesSection: React.FC<VerifiedCasesSectionProps> = ({
  onApadrinarCase,
  onOpenPreRegistro
}) => {
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<VerifiedCase | null>(null);

  return (
    <section id="apadrina-familias" className="py-20 md:py-28 bg-stone-50 relative overflow-hidden border-t border-stone-200">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Heart size={14} fill="currentColor" />
            Portal Oficial de Apadrinamiento
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight">
            Apadrina a una Familia
          </h2>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-light">
            Casos censados, visitados y <strong>verificados en terreno por la Brigada 99HDD</strong> en las parroquias más afectadas de La Guaira. Tu ayuda llega directamente a la necesidad puntual de cada hogar.
          </p>
        </div>

        {/* Informative Banner connecting Pre-registro with Verified Cases */}
        <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-ocean/10 text-brand-ocean rounded-2xl shrink-0 mt-1">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
                ¿Cómo llega una familia a este portal?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                Cada ficha mostrada proviene de un <strong>Pre-registro inicial</strong>. Nuestro equipo de trabajo social y logística va presencialmente al albergue o sector, corrobora la situación, toma testimonios reales y calcula la meta exacta de reconstrucción o insumos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onOpenPreRegistro}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <FileText size={15} />
              <span>¿Eres afectado? Cuéntanos tu caso</span>
            </button>
          </div>
        </div>

        {/* 4 Generic Verified Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {INITIAL_VERIFIED_CASES.map((caso) => {
            const percent = Math.min(100, Math.round((caso.raisedAmount / caso.targetAmount) * 100));
            return (
              <div 
                key={caso.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Photo & Status Header */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-100">
                  <img 
                    src={caso.imageUrl} 
                    alt={caso.familyName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Verification Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-brand-dark shadow-sm border border-stone-200">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {caso.code} • Verificado en Terreno
                    </span>
                  </div>

                  {/* Parish Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-semibold text-white/90 border border-white/20">
                      <MapPin size={12} className="text-brand-accent" />
                      {caso.parroquia}
                    </span>
                  </div>

                  {/* Family Title on Photo */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 drop-shadow-md">
                      {caso.familyName}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm flex items-center gap-1.5 drop-shadow-xs">
                      <MapPin size={13} className="shrink-0 text-white/70" />
                      <span>{caso.location}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Family Composition Metrics */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mb-4 pb-4 border-b border-stone-100">
                      <span className="flex items-center gap-1.5 font-medium bg-stone-100 px-3 py-1 rounded-full">
                        <Users size={14} className="text-brand-ocean" />
                        {caso.membersCount} Integrantes
                      </span>
                      {caso.childrenCount > 0 && (
                        <span className="font-medium bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-full">
                          {caso.childrenCount} {caso.childrenCount === 1 ? 'Menor' : 'Menores'} de edad
                        </span>
                      )}
                      {caso.elderlyCount > 0 && (
                        <span className="font-medium bg-blue-50 text-blue-900 border border-blue-200/60 px-2.5 py-1 rounded-full">
                          {caso.elderlyCount} Adulto mayor
                        </span>
                      )}
                    </div>

                    {/* Situation Title & Quote */}
                    <h4 className="text-base sm:text-lg font-bold text-stone-900 mb-2 leading-snug">
                      {caso.title}
                    </h4>

                    <blockquote className="italic text-xs sm:text-sm text-stone-600 bg-stone-50 p-3.5 rounded-2xl border-l-3 border-brand-accent mb-4 leading-relaxed">
                      "{caso.quote}"
                    </blockquote>

                    {/* Needed Items List */}
                    <div className="mb-4">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400 mb-2">
                        Necesidades Clave a Cubrir:
                      </div>
                      <ul className="space-y-1.5">
                        {caso.neededItems.map((item, i) => (
                          <li key={i} className="text-xs text-stone-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Progress & Apadrinar Button */}
                  <div className="pt-4 border-t border-stone-100 space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-stone-700">
                          Recaudado: <strong className="text-brand-dark font-extrabold">${caso.raisedAmount} USD</strong>
                        </span>
                        <span className="text-stone-500 font-medium">
                          Meta: ${caso.targetAmount} USD ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-ocean to-brand-accent rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        onClick={() => setSelectedCaseForModal(caso)}
                        className="flex-1 py-3 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer"
                      >
                        Ver Ficha Completa
                      </button>

                      <button
                        onClick={() => onApadrinarCase(caso)}
                        className="flex-1 py-3 px-4 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <Heart size={14} fill="currentColor" />
                        <span>Apadrinar Familia</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCaseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-56 sm:h-64 w-full shrink-0">
              <img 
                src={selectedCaseForModal.imageUrl} 
                alt={selectedCaseForModal.familyName}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              <button
                onClick={() => setSelectedCaseForModal(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider inline-block mb-1.5">
                  Ficha Oficial {selectedCaseForModal.code}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold">{selectedCaseForModal.familyName}</h3>
                <p className="text-white/80 text-xs sm:text-sm">{selectedCaseForModal.location} • {selectedCaseForModal.parroquia}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Relato del Caso y Contexto</h4>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">{selectedCaseForModal.narrative}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Testimonio Directo</h4>
                <blockquote className="italic text-stone-800 text-sm leading-relaxed">
                  "{selectedCaseForModal.quote}"
                </blockquote>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">Insumos y Materiales Requeridos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCaseForModal.neededItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-stone-100 rounded-xl text-xs font-medium text-stone-800 flex items-center gap-2">
                      <Check size={14} className="text-brand-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <UserCheck size={15} className="text-emerald-700" />
                  <span>Validado por: {selectedCaseForModal.verifiedBy}</span>
                </div>
                <div className="text-emerald-800">
                  Fecha de verificación en terreno: {selectedCaseForModal.verifiedDate}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedCaseForModal(null)}
                className="px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cerrar Ficha
              </button>

              <button
                onClick={() => {
                  const c = selectedCaseForModal;
                  setSelectedCaseForModal(null);
                  onApadrinarCase(c);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Heart size={14} fill="currentColor" />
                <span>Apadrinar este Caso (${selectedCaseForModal.targetAmount - selectedCaseForModal.raisedAmount} USD restantes)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
