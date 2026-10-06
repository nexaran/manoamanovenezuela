import React, { useState, useEffect } from 'react';
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
  Car,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { LeyMensajesDatosModal } from './LeyMensajesDatosModal';
import { 
  VEHICLE_TYPE_LABELS, 
  SKILLS_AREA_LABELS, 
  AVAILABILITY_LABELS, 
  VoluntarioEntry 
} from '../lib/casesTypes';
import { submitVoluntario } from '../lib/preRegistroService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';
import { 
  validatePersonName, 
  validateVenezuelanPhone, 
  validateFiscalDocument, 
  validateEmailAddress, 
  checkAndAcquireClickLock,
  sanitizeInput 
} from '../lib/security';
import { requestEmailVerificationCode, verifyEmailCode } from '../lib/emailVerificationService';

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
  const [step, setStep] = useState<'form' | 'email_verification' | 'submitting' | 'success'>('form');
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
  const [acceptedAgeVoluntario, setAcceptedAgeVoluntario] = useState(false);
  const [acceptedTermsVoluntario, setAcceptedTermsVoluntario] = useState(false);
  const [showLeyModal, setShowLeyModal] = useState(false);

  // Verificación de Correo Electrónico (OTP 6 dígitos)
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [emailOtpBackupCode, setEmailOtpBackupCode] = useState<string | null>(null);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);

  // Temporizador para el código de verificación
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailOtpCooldown > 0) {
      timer = setTimeout(() => {
        setEmailOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [emailOtpCooldown]);

  if (!isOpen) return null;

  // Paso 1: Validar formulario y solicitar código OTP
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Por favor indica tu nombre completo y número de teléfono para convocatorias.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('El correo electrónico es indispensable para verificar tu identidad y enviarte las convocatorias.');
      return;
    }

    if (!acceptedAgeVoluntario) {
      setErrorMsg('Debe declarar bajo fe de juramento ser mayor de edad (+18) conforme a la legislación venezolana para unirse a la brigada de terreno.');
      return;
    }

    if (!acceptedTermsVoluntario) {
      setErrorMsg('Debe consentir el resguardo confidencial de sus datos bajo la Ley sobre Mensajes de Datos para coordinar operaciones de rescate.');
      return;
    }

    const nameVal = validatePersonName(fullName);
    if (!nameVal.valid) {
      setErrorMsg(nameVal.message || 'Nombre inválido.');
      return;
    }

    const phoneVal = validateVenezuelanPhone(phone);
    if (!phoneVal.valid) {
      setErrorMsg(phoneVal.message || 'Teléfono inválido.');
      return;
    }

    const emailVal = validateEmailAddress(email);
    if (!emailVal.valid) {
      setErrorMsg(emailVal.message || 'Por favor ingresa una dirección de correo válida.');
      return;
    }

    // Validación obligatoria de Cédula de Identidad para brigadistas
    const cleanCedulaInput = cedula.trim();
    if (!cleanCedulaInput) {
      setErrorMsg('La Cédula de Identidad es obligatoria para formar parte de la Brigada 99HDD y expedir tu credencial.');
      return;
    }
    const cedVal = validateFiscalDocument(cleanCedulaInput);
    if (!cedVal.valid) {
      setErrorMsg(cedVal.message || 'Cédula de Identidad inválida. Indica formato válido (ej. V-12345678).');
      return;
    }
    const cleanCedula = cedVal.formattedValue || cleanCedulaInput;

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
    setEmailOtpSending(true);

    try {
      const cleanEmail = email.toLowerCase().trim();
      const otpRes = await requestEmailVerificationCode(cleanEmail, 'voluntario_99hdd', fullName);
      setEmailOtpBackupCode(otpRes.backupCode);
      setEmailOtpCooldown(45);
      setEmailOtpInput('');
      setEmailOtpError(null);
      setStep('email_verification');
    } catch (err) {
      setErrorMsg('No se pudo despachar el código de verificación por correo. Por favor intenta nuevamente.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailOtpCooldown > 0 || emailOtpSending || !email.trim()) return;
    setEmailOtpSending(true);
    setEmailOtpError(null);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const otpRes = await requestEmailVerificationCode(cleanEmail, 'voluntario_99hdd', fullName);
      setEmailOtpBackupCode(otpRes.backupCode);
      setEmailOtpCooldown(45);
      setEmailOtpInput('');
    } catch (err) {
      setEmailOtpError('Error al reenviar el código. Inténtalo de nuevo.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  // Paso 2: Validar código OTP y registrar voluntario
  const handleVerifyEmailAndSubmit = async () => {
    if (emailOtpInput.trim().length !== 6) {
      setEmailOtpError('Por favor introduce el código completo de 6 dígitos numéricos.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const verification = verifyEmailCode(cleanEmail, emailOtpInput);
    if (!verification.success) {
      setEmailOtpError(verification.message);
      return;
    }

    if (!checkAndAcquireClickLock('voluntario_submit_lock')) {
      setEmailOtpError('Envío en proceso. Por favor espera.');
      return;
    }

    setEmailOtpError(null);
    setStep('submitting');

    const nameVal = validatePersonName(fullName);
    const phoneVal = validateVenezuelanPhone(phone);
    let cleanCedula = cedula.trim();
    if (!cleanCedula) {
      setErrorMsg('La Cédula de Identidad es obligatoria para formar parte de la Brigada 99HDD.');
      setStep('form');
      return;
    }
    const cedVal = validateFiscalDocument(cleanCedula);
    cleanCedula = cedVal.formattedValue || cleanCedula;

    try {
      const res = await submitVoluntario({
        fullName: nameVal.formattedValue || sanitizeInput(fullName),
        cedula: sanitizeInput(cleanCedula),
        phone: phoneVal.formattedValue || sanitizeInput(phone),
        email: cleanEmail,
        emailVerified: true,
        parroquia,
        hasVehicle: hasVehicle as any,
        vehicleDetails: vehicleDetails.trim() ? sanitizeInput(vehicleDetails) : undefined,
        skillsArea: skillsArea as any,
        availability: availability as any,
        message: message.trim() ? sanitizeInput(message) : undefined
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
    setEmailOtpInput('');
    setEmailOtpError(null);
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
            Atendemos ininterrumpidamente más de 16 albergues y 13 comunidades en La Guaira. Validamos tu correo y datos para coordinar las brigadas con personas reales y seguras.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {step === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
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
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Cédula de Identidad (Obligatoria) *</span>
                    <span className="text-[10px] text-brand-ocean bg-brand-ocean/10 px-2 py-0.5 rounded font-mono font-bold">V- / E-</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. V-18.450.920"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Documento oficial obligatorio para emisión del carnet y credencial de brigadista 99HDD.
                  </p>
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
                    Correo Electrónico (Verificación Obligatoria) *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Te enviaremos un código de seguridad de 6 dígitos numéricos para verificar que es tu correo real.
                  </p>
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
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean resize-none"
                />
              </div>

              {/* Declaraciones Legales Obligatorias */}
              <div className="space-y-3 bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <ShieldCheck size={16} className="text-brand-ocean" />
                  <span>Declaración Legal y Mayoría de Edad (+18)</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedAgeVoluntario}
                    onChange={(e) => setAcceptedAgeVoluntario(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900">
                    <strong>Declaro bajo fe de juramento ser mayor de edad (+18 años)</strong> conforme al Código Civil y leyes de la República Bolivariana de Venezuela para integrarme a la labor voluntaria de campo. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group pt-1 border-t border-stone-200/60">
                  <input
                    type="checkbox"
                    checked={acceptedTermsVoluntario}
                    onChange={(e) => setAcceptedTermsVoluntario(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-stone-600 leading-relaxed group-hover:text-stone-900">
                    Consiento el resguardo confidencial de mis datos bajo la{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowLeyModal(true);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-brand-ocean hover:text-[#0a6670] underline decoration-brand-ocean underline-offset-2 bg-brand-ocean/10 hover:bg-brand-ocean/20 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                      title="Clic para leer el texto completo de la ley y tus derechos antes de dar tu consentimiento"
                    >
                      <BookOpen size={12} className="inline text-brand-ocean shrink-0" />
                      <span>Ley sobre Mensajes de Datos y Firmas Electrónicas</span>
                      <ExternalLink size={10} className="inline text-brand-ocean shrink-0 ml-0.5" />
                    </button>{' '}
                    para coordinación de campo de la Brigada 99HDD. *
                  </span>
                </label>
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
                  disabled={!acceptedAgeVoluntario || !acceptedTermsVoluntario || emailOtpSending}
                  className="px-7 py-3 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailOtpSending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Generando código...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Continuar y Validar Correo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO: Verificación Obligatoria de Correo para Voluntarios */}
          {step === 'email_verification' && (
            <div className="space-y-6 py-2 animate-fade-in max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-ocean/10 text-brand-ocean rounded-2xl flex items-center justify-center mx-auto border border-brand-ocean/20">
                  <KeyRound size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Valida tu Correo de Voluntario
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Para asegurar que cada postulante sea una persona y correo reales en nuestro registro de brigadistas, hemos generado un código de <strong>6 dígitos</strong> para:
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800">
                  <Mail size={14} className="text-brand-ocean" />
                  <span>{email}</span>
                </div>
              </div>

              {emailOtpError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{emailOtpError}</span>
                </div>
              )}

              {/* Input OTP */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 text-center">
                  Introduce el Código de 6 Dígitos
                </label>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    value={emailOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setEmailOtpInput(val);
                      if (emailOtpError) setEmailOtpError(null);
                    }}
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl sm:text-3xl font-bold py-3 px-4 bg-white border-2 border-stone-300 rounded-xl text-stone-900 focus:border-brand-ocean focus:outline-none focus:ring-2 focus:ring-brand-ocean/30 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  Validez: 10 minutos. Revisa tu buzón de entrada o la carpeta de spam.
                </p>

                {emailOtpBackupCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span><strong>Asistencia de Conectividad:</strong> Si tu conexión presenta lentitud, tu código generado es </span>
                      <code className="px-1.5 py-0.5 bg-amber-200/80 text-amber-950 font-mono font-bold rounded">
                        {emailOtpBackupCode}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyEmailAndSubmit}
                  disabled={emailOtpInput.trim().length !== 6}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={18} />
                  <span>Verificar Correo y Completar Postulación</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Regresar y modificar datos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendEmailOtp}
                    disabled={emailOtpCooldown > 0 || emailOtpSending}
                    className="text-xs text-brand-ocean hover:text-[#0a6670] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} className={emailOtpSending ? 'animate-spin' : ''} />
                    <span>
                      {emailOtpCooldown > 0 
                        ? `Reenviar nuevo código en ${emailOtpCooldown}s` 
                        : 'Reenviar código de verificación'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-ocean/30 border-t-brand-ocean rounded-full animate-spin mx-auto"></div>
              <h4 className="text-lg font-bold text-stone-800">Registrando credencial de brigada...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Incorporando tus datos verificados a la base de despliegue logístico de la Brigada 99HDD.
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
                  ¡Postulación Registrada y Verificada!
                </h4>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Agradecemos profundamente tu vocación de servicio. Tu correo <strong>{createdEntry.email}</strong> ha sido verificado con éxito y se generó tu ficha oficial de voluntario.
                </p>

                {/* Badge de correo verificado */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Persona y Correo Real Verificado con Código OTP</span>
                </div>

                {/* Nota informativa de validación técnica */}
                <div className="p-3.5 bg-brand-cream border border-brand-ocean/30 rounded-xl text-left max-w-md mx-auto text-xs text-stone-700 leading-relaxed flex items-start gap-2.5 shadow-2xs mt-2">
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

      {/* Modal de Lectura Previa de la Ley sobre Mensajes de Datos y Firmas Electrónicas */}
      <LeyMensajesDatosModal
        isOpen={showLeyModal}
        onClose={() => setShowLeyModal(false)}
        onAcceptAndClose={() => {
          setAcceptedTermsVoluntario(true);
          setShowLeyModal(false);
        }}
      />
    </div>
  );
};
