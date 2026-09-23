import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  CheckCircle2, 
  Mail, 
  Instagram, 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  FileCheck2
} from 'lucide-react';
import { SUPPORT_TYPE_LABELS, PadrinoInquiryEntry } from '../lib/casesTypes';
import { submitPadrinoInquiry } from '../lib/preRegistroService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';

interface PadrinoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PadrinoModal: React.FC<PadrinoModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<PadrinoInquiryEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [supportType, setSupportType] = useState<string>('apadrinamiento_familiar');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre, correo y número de contacto.');
      return;
    }

    const rateCheck = AntiAbuseGuard.checkLimit('padrino_submission', {
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 60000
    });

    if (!rateCheck.allowed) {
      setErrorMsg(rateCheck.message || 'Demasiadas solicitudes continuas detectadas. Por favor espera un momento.');
      return;
    }

    setErrorMsg(null);
    setStep('submitting');

    try {
      const res = await submitPadrinoInquiry({
        fullName: AntiAbuseGuard.sanitizeInput(fullName),
        organization: organization.trim() ? AntiAbuseGuard.sanitizeInput(organization) : undefined,
        email: AntiAbuseGuard.sanitizeInput(email),
        phone: AntiAbuseGuard.sanitizeInput(phone),
        supportType: supportType as any,
        message: AntiAbuseGuard.sanitizeInput(message.trim() || 'Deseo recibir el dossier confidencial de casos activos para coordinar apoyo directo.')
      });

      setCreatedEntry(res.entry);
      setStep('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Hubo un inconveniente guardando el registro. Intenta de nuevo.');
      setStep('form');
    }
  };

  const handleCopyCode = () => {
    if (!createdEntry?.code) return;
    navigator.clipboard.writeText(createdEntry.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setStep('form');
    setFullName('');
    setOrganization('');
    setEmail('');
    setPhone('');
    setMessage('');
    setCreatedEntry(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-brand-dark via-[#1e2746] to-brand-dark text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Heart size={14} fill="currentColor" />
            Canal Oficial de Padrinos y Donantes
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
            Apadrina a una Familia o Sector
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
            Para salvaguardar la dignidad y privacidad de las familias damnificadas, no publicamos expedientes sensibles en internet. Regístrate para recibir nuestro <strong>dossier verificado de uso interno</strong> y canalizar tu ayuda de forma transparente.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Notice Box */}
              <div className="bg-brand-ocean/5 border border-brand-ocean/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="p-2 bg-brand-ocean/10 text-brand-ocean rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <strong className="font-semibold text-stone-900">Mano a Mano & Brigada 99HDD:</strong> Cada caso es censado en terreno, validado con visita técnica y clasificado por urgencia para que tu donativo llegue sin intermediarios.
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Empresa u Organización (Opcional)
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Fundación, empresa o particular"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="tunombre@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Teléfono de Contacto *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+58 412... / +1..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  ¿Cómo te gustaría brindar tu apoyo? *
                </label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer"
                >
                  {Object.entries(SUPPORT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mensaje o Especificaciones (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Cuéntanos si tienes preferencia por alguna zona (Maiquetía, Naiguatá, Macuto...), tipo de insumo o periodicidad..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean resize-none"
                ></textarea>
              </div>

              {/* Direct Quick Contact Info */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
                <span>También puedes escribirnos de forma inmediata a:</span>
                <div className="flex items-center gap-3 font-semibold text-stone-700">
                  <a href="mailto:manomanovzla@gmail.com" className="flex items-center gap-1 hover:text-brand-ocean transition-colors">
                    <Mail size={14} /> manomanovzla@gmail.com
                  </a>
                  <span>•</span>
                  <a href="https://instagram.com/jesusblancogarcia_" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-ocean transition-colors">
                    <Instagram size={14} /> @jesusblancogarcia_
                  </a>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>Registrar Interés de Apadrinamiento</span>
                </button>
              </div>
            </form>
          )}

          {step === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto"></div>
              <h4 className="text-lg font-bold text-stone-800">Generando tu código de Padrino...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Registrando tu solicitud en la base segura de la coordinación de Mano a Mano Venezuela.
              </p>
            </div>
          )}

          {step === 'success' && createdEntry && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-2xl font-bold text-stone-900">¡Gracias por tu Corazón Solidario!</h4>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Hemos registrado con éxito tu intención de apoyo. Tu expediente de padrino ha sido emitido bajo el siguiente código oficial:
                </p>
              </div>

              {/* Code Box */}
              <div className="bg-stone-50 border-2 border-dashed border-brand-ocean/40 rounded-2xl p-5 text-center relative group">
                <span className="text-[11px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                  Código de Registro de Padrino
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-brand-dark tracking-wider mb-2">
                  {createdEntry.code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? '¡Código Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              {/* Next Steps Guide */}
              <div className="bg-brand-dark text-white rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-brand-accent font-bold text-sm">
                  <FileCheck2 size={18} />
                  <span>Siguientes Pasos para Recibir los Expedientes</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Para coordinar la entrega privada del dossier de casos verificados correspondientes a tu preferencia (<strong>{SUPPORT_TYPE_LABELS[createdEntry.supportType]}</strong>), puedes contactar a nuestro equipo directivo indicando tu código:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={`mailto:manomanovzla@gmail.com?subject=Solicitud%20de%20Expedientes%20Padrino%20${encodeURIComponent(createdEntry.code)}&body=Hola%20equipo%20Mano%20a%20Mano,%20mi%20nombre%20es%20${encodeURIComponent(createdEntry.fullName)}%20y%20he%20registrado%20mi%20código%20${encodeURIComponent(createdEntry.code)}%20para%20solicitar%20el%20dossier%20interno%20de%20casos%20a%20apadrinar.`}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors text-center"
                  >
                    <Mail size={16} />
                    <span>Escribir por Correo</span>
                  </a>

                  <a
                    href="https://instagram.com/jesusblancogarcia_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-center"
                  >
                    <Instagram size={16} />
                    <span>Contactar por Instagram</span>
                  </a>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Finalizar y Volver al Sitio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
