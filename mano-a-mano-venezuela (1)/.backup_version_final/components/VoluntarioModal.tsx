import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Send, 
  CheckCircle2, 
  Phone, 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles,
  Wrench,
  Clock,
  Car
} from 'lucide-react';
import { 
  VEHICLE_TYPE_LABELS, 
  SKILLS_AREA_LABELS, 
  AVAILABILITY_LABELS, 
  VoluntarioEntry 
} from '../lib/casesTypes';
import { submitVoluntario } from '../lib/preRegistroService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';

interface VoluntarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PARROQUIAS_LIST = [
  'Carlos Soublette (Maiquetía)',
  'Maiquetía',
  'La Guaira (Centro / Casco Histórico)',
  'Macuto',
  'Caraballeda',
  'Naiguatá',
  'Catia La Mar',
  'Urimare',
  'Carayaca',
  'La Costa (Caruao / Todasana / Chuspa)',
  'Caracas (Sede / Enlace logístico)',
  'Otra zona'
];

export const VoluntarioModal: React.FC<VoluntarioModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<VoluntarioEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parroquia, setParroquia] = useState(PARROQUIAS_LIST[0]);
  const [hasVehicle, setHasVehicle] = useState<string>('no');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [skillsArea, setSkillsArea] = useState<string>('logistica_terreno');
  const [availability, setAvailability] = useState<string>('emergencias_contingencia');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Por favor indica tu nombre completo y número de teléfono para convocatorias.');
      return;
    }

    const rateCheck = AntiAbuseGuard.checkLimit('voluntario_submission', {
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
      const res = await submitVoluntario({
        fullName: AntiAbuseGuard.sanitizeInput(fullName),
        cedula: cedula.trim() ? AntiAbuseGuard.sanitizeInput(cedula) : undefined,
        phone: AntiAbuseGuard.sanitizeInput(phone),
        email: email.trim() ? AntiAbuseGuard.sanitizeInput(email) : undefined,
        parroquia,
        hasVehicle: hasVehicle as any,
        vehicleDetails: vehicleDetails.trim() ? AntiAbuseGuard.sanitizeInput(vehicleDetails) : undefined,
        skillsArea: skillsArea as any,
        availability: availability as any,
        message: message.trim() ? AntiAbuseGuard.sanitizeInput(message) : undefined
      });

      setCreatedEntry(res.entry);
      setStep('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al registrar el voluntariado. Por favor intenta de nuevo.');
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
    setCedula('');
    setPhone('');
    setEmail('');
    setVehicleDetails('');
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
        <div className="bg-gradient-to-r from-[#172033] via-brand-dark to-[#172033] text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-ocean/20 border border-brand-ocean/40 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-3">
            <Truck size={14} />
            La Brigada 99HDD & Mano a Mano
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
            Súmate a la Red de Voluntarios
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
            Atendemos ininterrumpidamente más de 16 albergues y 13 comunidades en La Guaira. Ya sea con tu vehículo, tus manos o tus conocimientos en salud, tu aporte es invaluable.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Personal Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nombre y Apellido *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Andrés Salazar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Cédula de Identidad (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="V-..."
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Teléfono Móvil (Convocatorias) *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+58 414... / +58 412..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Parroquia o Zona de Residencia *
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={parroquia}
                    onChange={(e) => setParroquia(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer"
                  >
                    {PARROQUIAS_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logistics & Vehicle Section */}
              <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Car size={18} className="text-brand-ocean" />
                  <span>Capacidad Logística y Movilidad</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    ¿Posees vehículo propio para apoyar traslados o emergencias? *
                  </label>
                  <select
                    value={hasVehicle}
                    onChange={(e) => setHasVehicle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer font-medium"
                  >
                    {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasVehicle !== 'no' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Detalle del Vehículo (Modelo / Capacidad aproximada)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Toyota Land Cruiser / Capacidad 6 personas o 500kg de insumos"
                      value={vehicleDetails}
                      onChange={(e) => setVehicleDetails(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                )}
              </div>

              {/* Skills and Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Área Principal donde Deseas Apoyar *
                  </label>
                  <select
                    value={skillsArea}
                    onChange={(e) => setSkillsArea(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer text-xs sm:text-sm"
                  >
                    {Object.entries(SKILLS_AREA_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Disponibilidad Habitual *
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer text-xs sm:text-sm"
                  >
                    {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Experiencia Previa o Comentarios (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Experiencia previa en voluntariado, primeros auxilios, oficios mecánicos, etc..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean resize-none"
                ></textarea>
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
                  className="px-7 py-3 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>Completar Registro de Voluntario</span>
                </button>
              </div>
            </form>
          )}

          {step === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-ocean/30 border-t-brand-ocean rounded-full animate-spin mx-auto"></div>
              <h4 className="text-lg font-bold text-stone-800">Registrando credencial de brigada...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Incorporando tus datos a la base de despliegue logístico de la Brigada 99HDD.
              </p>
            </div>
          )}

          {step === 'success' && createdEntry && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-brand-ocean/10 text-brand-ocean rounded-full flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-2xl font-bold text-stone-900">
                  ¡Postulación Registrada Exitosamente!
                </h4>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Agradecemos profundamente tu vocación de servicio y el querer ser parte de este esfuerzo por La Guaira. Hemos generado tu expediente de voluntariado.
                </p>

                {/* Nota informativa de validación técnica */}
                <div className="p-3.5 bg-brand-cream border border-brand-ocean/30 rounded-xl text-left max-w-md mx-auto text-xs text-stone-700 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                  <Clock size={16} className="text-brand-ocean shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-brand-dark block mb-0.5">Validación de ingreso y próximas jornadas:</span>
                    <span>
                      Nuestro equipo técnico y de coordinación logística se pondrá en contacto contigo para verificar tus datos, formalizar tu ingreso oficial y coordinar tu convocatoria para las próximas jornadas de asistencia y despliegue en terreno.
                    </span>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div className="bg-stone-50 border-2 border-dashed border-brand-ocean/40 rounded-2xl p-5 text-center relative group">
                <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500 block mb-1">
                  Código de Expediente de Voluntario
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-brand-dark tracking-wider mb-1.5">
                  {createdEntry.code}
                </div>
                <p className="text-[11px] text-stone-500 mb-3">
                  Conserva este código para el seguimiento de tu postulación y confirmación técnica.
                </p>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? '¡Código Copiado!' : 'Copiar Código de Expediente'}</span>
                </button>
              </div>

              {/* Logistics Summary */}
              <div className="bg-brand-dark text-white rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between text-brand-ocean font-bold text-sm border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>Resumen de tu Ficha de Voluntariado</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-ocean/30 text-teal-200 border border-brand-ocean/50">
                    En Proceso de Validación
                  </span>
                </div>
                <ul className="text-xs sm:text-sm text-stone-300 space-y-2">
                  <li><strong>Zona / Parroquia:</strong> {createdEntry.parroquia}</li>
                  <li><strong>Área de servicio:</strong> {SKILLS_AREA_LABELS[createdEntry.skillsArea]}</li>
                  <li><strong>Movilidad:</strong> {VEHICLE_TYPE_LABELS[createdEntry.hasVehicle]} {createdEntry.vehicleDetails && `(${createdEntry.vehicleDetails})`}</li>
                  <li><strong>Disponibilidad:</strong> {AVAILABILITY_LABELS[createdEntry.availability]}</li>
                </ul>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-brand-ocean text-white hover:bg-[#0a6670] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Entendido y Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
