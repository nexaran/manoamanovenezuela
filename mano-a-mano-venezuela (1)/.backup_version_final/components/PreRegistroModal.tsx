import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  HeartHandshake, 
  AlertCircle, 
  MapPin, 
  Phone, 
  User, 
  Users, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  Printer
} from 'lucide-react';
import { PreRegistroEntry, PRIORITY_NEEDS_LABELS } from '../lib/casesTypes';
import { submitPreRegistro } from '../lib/preRegistroService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';

interface PreRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleDriveSetup?: () => void;
}

const PARROQUIAS_LA_GUAIRA = [
  'Carlos Soublette (Maiquetía)',
  'Maiquetía',
  'La Guaira (Centro / Punta de Mulatos)',
  'Macuto',
  'Caraballeda',
  'Naiguatá',
  'Catia La Mar',
  'Urimare',
  'Carayaca',
  'La Costa (Caruao / Chuspa)'
];

export const PreRegistroModal: React.FC<PreRegistroModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleDriveSetup
}) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<PreRegistroEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [parroquia, setParroquia] = useState(PARROQUIAS_LA_GUAIRA[0]);
  const [location, setLocation] = useState('');
  const [familyMembers, setFamilyMembers] = useState(3);
  const [childrenCount, setChildrenCount] = useState(1);
  const [elderlyOrDisabled, setElderlyOrDisabled] = useState(false);
  const [priorityNeed, setPriorityNeed] = useState<string>('techo_materiales');
  const [narrative, setNarrative] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !location.trim() || !narrative.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos para poder procesar tu caso.');
      return;
    }

    if (narrative.trim().length < 30) {
      setErrorMsg('Por favor relátanos un poco más sobre lo sucedido (al menos 30 caracteres) para que nuestro equipo pueda evaluar la situación.');
      return;
    }

    // Blindaje contra ataques de spam y peticiones continuas
    const rateCheck = AntiAbuseGuard.checkLimit('preregistro_submission', {
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
      const res = await submitPreRegistro({
        fullName: AntiAbuseGuard.sanitizeInput(fullName),
        cedula: AntiAbuseGuard.sanitizeInput(cedula),
        phone: AntiAbuseGuard.sanitizeInput(phone),
        location: AntiAbuseGuard.sanitizeInput(location),
        parroquia,
        familyMembers: Number(familyMembers),
        childrenCount: Number(childrenCount),
        elderlyOrDisabled,
        priorityNeed,
        narrative: AntiAbuseGuard.sanitizeInput(narrative)
      });

      if (res.success && res.entry) {
        setCreatedEntry(res.entry);
        setStep('success');
      } else {
        throw new Error('No se pudo completar el pre-registro');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el pre-registro');
      setStep('form');
    }
  };

  const handleCopyCode = () => {
    if (!createdEntry?.caseId) return;
    navigator.clipboard.writeText(createdEntry.caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setFullName('');
    setCedula('');
    setPhone('');
    setLocation('');
    setNarrative('');
    setCreatedEntry(null);
    setStep('form');
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-dark via-[#1a233a] to-brand-dark text-white p-6 sm:p-8 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2.5">
            <span className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake size={13} />
              Mano a Mano Venezuela & Brigada 99HDD
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 text-white/80 rounded-full text-[11px] font-medium hidden sm:inline-block">
              Estado La Guaira
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Cuéntanos tu Caso
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
            Pre-registro para familias y comunidades afectadas por la emergencia. Tu historia será atendida con dignidad y respeto por nuestro equipo de voluntarios.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert notice about no media needed */}
              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <span className="font-bold">Formulario 100% ligero para zonas con baja señal:</span> Solo requerimos tu narración escrita. No es necesario adjuntar imágenes ni videos. Las fotos de verificación las tomarán los brigadistas directamente en la visita presencial.
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Seccion 1: Datos de Contacto y Familia */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <User size={14} className="text-brand-ocean" /> 1. Datos del Jefe(a) de Familia y Contacto
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nombre y Apellido completo *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Carmen Elena Rodríguez"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Teléfono de contacto *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 0412-1234567"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Cédula de Identidad (Opcional)
                    </label>
                    <input
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Ej. V-15.340.210"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Parroquia *
                    </label>
                    <select
                      value={parroquia}
                      onChange={(e) => setParroquia(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    >
                      {PARROQUIAS_LA_GUAIRA.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ubicación exacta (Sector, Calle, Casa o Albergue) *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej. Sector Carlos Soublette, Callejón San José, Casa N° 12 (frente a la bodega)"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seccion 2: Composición familiar y necesidad */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Users size={14} className="text-brand-ocean" /> 2. Composición Familiar y Vulnerabilidad
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Total de familiares en el hogar
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={familyMembers}
                      onChange={(e) => setFamilyMembers(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Niños o menores de edad
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Necesidad más prioritaria *
                    </label>
                    <select
                      value={priorityNeed}
                      onChange={(e) => setPriorityNeed(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    >
                      {Object.entries(PRIORITY_NEEDS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer bg-stone-50 p-3 rounded-xl border border-stone-200/80 hover:bg-stone-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={elderlyOrDisabled}
                    onChange={(e) => setElderlyOrDisabled(e.target.checked)}
                    className="w-4 h-4 text-brand-accent rounded border-stone-300 focus:ring-brand-accent"
                  />
                  <span className="text-xs sm:text-sm text-stone-700 font-medium">
                    Hay personas de la tercera edad (abuelos) o personas con discapacidad o condición médica crónica en el hogar
                  </span>
                </label>
              </div>

              {/* Seccion 3: Narrativa del Caso */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <FileText size={14} className="text-brand-ocean" /> 3. Relato de tu Caso (Escrito) *
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    {narrative.length} caracteres
                  </span>
                </div>
                
                <p className="text-xs text-stone-500 mb-2 leading-relaxed">
                  Cuéntanos con tus propias palabras qué ocurrió con tu vivienda o familia, cuál es la urgencia más grande que enfrentan hoy y cómo podemos ubicarte.
                </p>

                <textarea
                  required
                  rows={5}
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Escribe aquí tu relato de forma clara y sincera... (Ej. Vivimos en el sector Carlos Soublette. Con la emergencia del doblete sísmico cedió el talud posterior y perdimos el techo de la habitación...)"
                  className="w-full p-4 bg-stone-50 border border-stone-300 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock size={15} className="text-stone-400" />
                  <span>Respuesta y confirmación inmediata en pantalla</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-1/3 sm:w-auto px-5 py-3 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Enviar mi Caso</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-xl font-bold text-stone-900">
                Registrando tu caso y generando expediente...
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
                Estamos procesando tu historia para asignarle un código oficial y generar las pautas de revisión para nuestro equipo de terreno.
              </p>
            </div>
          )}

          {step === 'success' && createdEntry && (
            <div className="space-y-6 animate-fade-in">
              {/* Success Badge */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      ¡Tu caso ha sido pre-registrado exitosamente!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Quedó asignado formalmente en el sistema de atención de Mano a Mano Venezuela.
                    </p>
                  </div>
                </div>

                {/* Tracking Code Chip */}
                <div className="bg-white px-4 py-2 rounded-xl border border-emerald-300 flex items-center gap-2 shadow-xs self-stretch sm:self-auto justify-between sm:justify-start">
                  <div>
                    <div className="text-[10px] text-stone-500 font-semibold uppercase">Código de Expediente</div>
                    <div className="font-mono text-sm font-bold text-stone-900">{createdEntry.caseId}</div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Copiar código de caso"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Empathetic AI Response Card */}
              {createdEntry.aiResponse && (
                <div className="bg-gradient-to-br from-brand-dark/5 via-stone-50 to-brand-ocean/5 p-6 rounded-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2 text-brand-dark font-bold text-sm">
                    <Sparkles size={18} className="text-brand-accent" />
                    <span>Mensaje de Atención Humana y Aliento:</span>
                  </div>

                  <blockquote className="italic text-stone-800 text-sm sm:text-base leading-relaxed bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
                    "{createdEntry.aiResponse.empatheticMessage}"
                  </blockquote>

                  {/* Visual Next Steps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2.5">
                      Próximos pasos del proceso:
                    </h4>
                    <div className="space-y-2">
                      {createdEntry.aiResponse.nextSteps.map((stepItem, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 bg-white/70 px-3.5 py-2 rounded-xl border border-stone-200/60">
                          <span className="w-5 h-5 rounded-full bg-brand-ocean/15 text-brand-ocean font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{stepItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Drive & Verification Information */}
              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-brand-ocean" />
                  <span>Sincronización de Datos y Transparencia:</span>
                </div>
                <p className="leading-relaxed">
                  Los datos fueron archivados de manera ordenada y segura para la cuenta oficial <span className="font-mono font-semibold text-stone-800">manomanovzla@gmail.com</span> en la carpeta de <strong>Pre-registro</strong>. El equipo coordinador contactará a <span className="font-semibold text-stone-800">{createdEntry.phone}</span> para coordinar la visita de corroboración en sitio antes de publicar una ficha en el portal de apadrinamiento.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Imprimir / Guardar Ficha</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={resetForm}
                    className="w-1/2 sm:w-auto px-4 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Registrar otro caso
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-1/2 sm:w-auto px-6 py-2.5 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Entendido, Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
