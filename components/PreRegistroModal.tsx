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
  Printer,
  Mail,
  Lock,
  RotateCcw,
  RefreshCw,
  HardDrive,
  ArrowLeft,
  KeyRound,
  BookOpen
} from 'lucide-react';
import { LeyMensajesDatosModal } from './LeyMensajesDatosModal';
import { PreRegistroEntry, PRIORITY_NEEDS_LABELS } from '../lib/casesTypes';
import { 
  submitPreRegistro, 
  getLatestLocalStoredCase, 
  resendStoredCase,
  getCaseResendCooldownRemaining
} from '../lib/preRegistroService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';
import { 
  sanitizeInput, 
  validatePersonName, 
  validateVenezuelanPhone, 
  validateFiscalDocument, 
  validateEmailAddress,
  checkAndAcquireClickLock 
} from '../lib/security';
import { trackAnalyticsEvent } from '../lib/analyticsService';
import { requestEmailVerificationCode, verifyEmailCode } from '../lib/emailVerificationService';

interface PreRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleDriveSetup?: () => void;
  onOpenRegisterAccount?: (prefill: {
    fullName: string;
    cedula?: string;
    phone: string;
    email?: string;
    address: string;
    role?: 'empresa' | 'donante' | 'voluntario' | 'victima';
    caseId?: string;
  }) => void;
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
  onOpenGoogleDriveSetup,
  onOpenRegisterAccount
}) => {
  const [step, setStep] = useState<'form' | 'email_verification' | 'submitting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<PreRegistroEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parroquia, setParroquia] = useState(PARROQUIAS_LA_GUAIRA[0]);
  const [location, setLocation] = useState('');
  const [familyMembers, setFamilyMembers] = useState(3);
  const [childrenCount, setChildrenCount] = useState(1);
  const [elderlyOrDisabled, setElderlyOrDisabled] = useState(false);
  const [priorityNeed, setPriorityNeed] = useState<string>('techo_materiales');
  const [narrative, setNarrative] = useState('');

  // Verificación de Correo Electrónico (OTP 6 dígitos)
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [emailOtpBackupCode, setEmailOtpBackupCode] = useState<string | null>(null);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);

  // Consentimiento y Mayoría de Edad (+18)
  const [acceptedAgeCase, setAcceptedAgeCase] = useState(false);
  const [acceptedTermsCase, setAcceptedTermsCase] = useState(false);
  const [showLeyModal, setShowLeyModal] = useState(false);

  // Detección de Caso Almacenado en la Memoria del Dispositivo
  const [storedCase, setStoredCase] = useState<PreRegistroEntry | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const [showResendConfirmModal, setShowResendConfirmModal] = useState(false);
  const [confirmAgeResend, setConfirmAgeResend] = useState(false);
  const [isFromResend, setIsFromResend] = useState(false);
  const [showPostResendExitConfirm, setShowPostResendExitConfirm] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const prevCase = getLatestLocalStoredCase();
      setStoredCase(prevCase);
      if (prevCase) {
        const remainingMs = getCaseResendCooldownRemaining(prevCase.caseId);
        setResendCooldownSec(Math.ceil(remainingMs / 1000));
      }
    }
  }, [isOpen]);

  // Temporizador de cuenta regresiva para el periodo seguro (anti-spam / anti-saturación)
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldownSec > 0) {
      timer = setTimeout(() => {
        setResendCooldownSec(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldownSec]);

  // Temporizador para el código de verificación al correo
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailOtpCooldown > 0) {
      timer = setTimeout(() => {
        setEmailOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [emailOtpCooldown]);

  const handleOpenResendConfirm = () => {
    if (!storedCase) return;
    const remainingMs = getCaseResendCooldownRemaining(storedCase.caseId);
    if (remainingMs > 0) {
      setResendCooldownSec(Math.ceil(remainingMs / 1000));
      return;
    }
    setConfirmAgeResend(false);
    setShowResendConfirmModal(true);
  };

  const handleExecuteResend = async () => {
    if (!storedCase) return;
    if (!confirmAgeResend) {
      setErrorMsg('Debe confirmar bajo fe de juramento la mayoría de edad (+18 años) para autorizar el reenvío.');
      return;
    }

    setShowResendConfirmModal(false);
    setIsResending(true);
    setErrorMsg(null);
    try {
      const res = await resendStoredCase(storedCase);
      if (res.success) {
        setCreatedEntry(storedCase);
        setResendCooldownSec(300); // 5 minutos de periodo seguro
        setIsFromResend(true);
        setStep('success');
        trackAnalyticsEvent('case_resend', 'Reenvío de Caso Guardado', 'Casos', storedCase.caseId, { parroquia: storedCase.parroquia });
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reenviar el caso.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLoadStoredCaseIntoForm = () => {
    if (!storedCase) return;
    setFullName(storedCase.fullName);
    setCedula(storedCase.cedula || '');
    setPhone(storedCase.phone);
    if (storedCase.email) setEmail(storedCase.email);
    setParroquia(storedCase.parroquia);
    setLocation(storedCase.location);
    setFamilyMembers(storedCase.familyMembers);
    setChildrenCount(storedCase.childrenCount);
    setElderlyOrDisabled(storedCase.elderlyOrDisabled);
    setPriorityNeed(storedCase.priorityNeed);
    setNarrative(storedCase.narrative);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !location.trim() || !narrative.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos para poder procesar tu caso.');
      return;
    }

    // Validación obligatoria de correo electrónico para verificación de identidad
    if (!email.trim()) {
      setErrorMsg('Por favor indica tu correo electrónico para validar tu identidad con un código de seguridad.');
      return;
    }

    const emailVal = validateEmailAddress(email);
    if (!emailVal.valid) {
      setErrorMsg(emailVal.message || 'Dirección de correo electrónico no válida.');
      return;
    }

    // Validación obligatoria de mayoría de edad (+18)
    if (!acceptedAgeCase) {
      setErrorMsg('Debe declarar bajo fe de juramento ser mayor de edad (+18 años) conforme a la legislación venezolana para registrar este caso.');
      return;
    }

    // Validación obligatoria de consentimiento legal y tratamiento confidencial
    if (!acceptedTermsCase) {
      setErrorMsg('Debe consentir el tratamiento confidencial de los datos suministrados para que la brigada pueda procesar la solicitud.');
      return;
    }

    // Doble clic lock (4 segundos)
    if (!checkAndAcquireClickLock('case_registration')) {
      setErrorMsg('Envío en proceso. Por favor espera un momento.');
      return;
    }

    // Validación estricta de nombre de persona
    const nameValidation = validatePersonName(fullName);
    if (!nameValidation.valid) {
      setErrorMsg(nameValidation.message || 'Nombre de la persona inválido.');
      return;
    }

    // Validación estricta de teléfono venezolano
    const phoneValidation = validateVenezuelanPhone(phone);
    if (!phoneValidation.valid) {
      setErrorMsg(phoneValidation.message || 'Número de teléfono inválido.');
      return;
    }

    // Validación estricta y obligatoria de Cédula de Identidad venezolana (V- / E-)
    const cleanCedulaInput = cedula.trim();
    if (!cleanCedulaInput) {
      setErrorMsg('La Cédula de Identidad es obligatoria para certificar formalmente el expediente familiar.');
      return;
    }
    const fiscalVal = validateFiscalDocument(cleanCedulaInput);
    if (!fiscalVal.valid) {
      setErrorMsg(fiscalVal.message || 'Cédula de Identidad inválida. Debe incluir formato V- o E- (ej. V-15.340.210).');
      return;
    }
    const cleanCedula = fiscalVal.formattedValue || cleanCedulaInput;

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
    setEmailOtpSending(true);

    // Enviar código de verificación de 6 dígitos al correo electrónico del solicitante
    try {
      const otpRes = await requestEmailVerificationCode(email, 'pre_registro_caso', fullName);
      setEmailOtpBackupCode(otpRes.backupCode);
      setEmailOtpCooldown(45);
      setEmailOtpInput('');
      setEmailOtpError(null);
      setStep('email_verification');
    } catch (err: any) {
      setErrorMsg('No se pudo emitir el código de verificación. Por favor intenta de nuevo.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailOtpCooldown > 0 || emailOtpSending || !email.trim()) return;
    setEmailOtpSending(true);
    setEmailOtpError(null);
    try {
      const otpRes = await requestEmailVerificationCode(email, 'pre_registro_caso', fullName);
      setEmailOtpBackupCode(otpRes.backupCode);
      setEmailOtpCooldown(45);
      setEmailOtpInput('');
    } catch (err: any) {
      setEmailOtpError('Error al reenviar el código. Inténtalo de nuevo.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailAndSubmitCase = async () => {
    if (emailOtpInput.trim().length !== 6) {
      setEmailOtpError('Por favor introduce el código completo de 6 dígitos numéricos.');
      return;
    }

    const verification = verifyEmailCode(email, emailOtpInput);
    if (!verification.success) {
      setEmailOtpError(verification.message);
      return;
    }

    setEmailOtpError(null);
    setStep('submitting');

    const nameValidation = validatePersonName(fullName);
    const phoneValidation = validateVenezuelanPhone(phone);
    let cleanCedula = cedula.trim();
    if (cleanCedula) {
      const fiscalVal = validateFiscalDocument(cleanCedula);
      cleanCedula = fiscalVal.formattedValue || cleanCedula;
    }

    try {
      const res = await submitPreRegistro({
        fullName: nameValidation.formattedValue || sanitizeInput(fullName),
        cedula: cleanCedula,
        phone: phoneValidation.formattedValue || sanitizeInput(phone),
        email: email.toLowerCase().trim(),
        emailVerified: true,
        location: sanitizeInput(location),
        parroquia,
        familyMembers: Number(familyMembers),
        childrenCount: Number(childrenCount),
        elderlyOrDisabled,
        priorityNeed,
        narrative: sanitizeInput(narrative)
      });

      if (res.success && res.entry) {
        setCreatedEntry(res.entry);
        setStep('success');
        trackAnalyticsEvent('case_submit', 'Nuevo Caso Pre-registrado', 'Casos', res.entry.caseId, { parroquia: res.entry.parroquia });
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
    setEmail('');
    setLocation('');
    setNarrative('');
    setCreatedEntry(null);
    setIsFromResend(false);
    setShowPostResendExitConfirm(false);
    setEmailOtpInput('');
    setEmailOtpCooldown(0);
    setEmailOtpBackupCode(null);
    setEmailOtpError(null);
    setStep('form');
    setErrorMsg(null);
  };

  const handleClose = () => {
    // Si acaba de reenviar el caso y está en pantalla de éxito, sugerir crear su usuario para auditoría
    if (step === 'success' && isFromResend && onOpenRegisterAccount) {
      setShowPostResendExitConfirm(true);
      return;
    }
    resetForm();
    onClose();
  };

  const handleForceClose = () => {
    setShowPostResendExitConfirm(false);
    resetForm();
    onClose();
  };

  const handleProceedToRegister = () => {
    if (createdEntry && onOpenRegisterAccount) {
      onOpenRegisterAccount({
        fullName: createdEntry.fullName,
        cedula: createdEntry.cedula,
        phone: createdEntry.phone,
        email: createdEntry.email || email,
        address: `${createdEntry.parroquia}, ${createdEntry.location}`,
        role: 'victima',
        caseId: createdEntry.caseId
      });
    }
    setShowPostResendExitConfirm(false);
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
              {/* Banner de Caso Almacenado en Memoria del Dispositivo / Teléfono */}
              {storedCase && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-ocean/15 via-brand-ocean/5 to-white border-2 border-brand-ocean/40 rounded-2xl space-y-3 animate-fade-in shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-ocean/20">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-brand-ocean text-white rounded-lg shadow-2xs">
                        <HardDrive size={16} />
                      </span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-stone-900 block leading-tight">
                          Detectamos un caso guardado en este dispositivo
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Titular: <strong>{storedCase.fullName}</strong> ({storedCase.parroquia})
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold bg-brand-dark text-white px-2.5 py-1 rounded-md self-start sm:self-auto">
                      {storedCase.caseId}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    Si ya registraste tu caso anteriormente, <strong>no tienes que reescribirlo</strong>. Puedes reenviarlo con 1 clic para asegurar que llegue al correo oficial <span className="font-mono font-semibold">manomanovzla@gmail.com</span> y quede respaldado en Google Drive.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {resendCooldownSec > 0 ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold">
                        <Clock size={14} className="text-amber-600 animate-pulse" />
                        <span>
                          Periodo seguro activo: Podrá reenviar nuevamente en {Math.floor(resendCooldownSec / 60) > 0 ? `${Math.floor(resendCooldownSec / 60)}m ` : ''}{resendCooldownSec % 60}s
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isResending}
                        onClick={handleOpenResendConfirm}
                        className="px-4 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {isResending ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        <span>{isResending ? 'Reenviando al Correo & Drive...' : 'Reenviar mi Caso Guardado a la Brigada'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLoadStoredCaseIntoForm}
                      className="px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cargar en formulario para editar
                    </button>
                  </div>
                </div>
              )}

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
                      Correo Electrónico (para validar tu identidad) *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ej. carmen.rodriguez@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Te enviaremos un código de seguridad de 6 dígitos para comprobar que eres una persona real.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Cédula de Identidad (Obligatoria) *
                    </label>
                    <input
                      type="text"
                      required
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Ej. V-15.340.210"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Documento oficial obligatorio para emisión del expediente humanitario.
                    </p>
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

              {/* Seccion 4: Declaración de Mayoría de Edad (+18) y Consentimiento Legal */}
              <div className="space-y-3 bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <ShieldCheck size={16} className="text-brand-ocean" />
                  <span>Declaración Legal Obligatoria y Consentimiento Informado</span>
                </div>

                {/* Casilla 1: Mayoría de Edad (+18) */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedAgeCase}
                    onChange={(e) => setAcceptedAgeCase(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brand-accent rounded border-stone-300 focus:ring-brand-accent shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900 transition-colors">
                    <strong>Declaro bajo fe de juramento ser mayor de edad (+18 años)</strong> conforme a la legislación de la República Bolivariana de Venezuela y contar con plena capacidad civil y jurídica para remitir los datos de este caso o actuar en representación del grupo familiar. *
                  </span>
                </label>

                {/* Casilla 2: Aceptación de Normativas Legales */}
                <label className="flex items-start gap-3 cursor-pointer group pt-1 border-t border-stone-200/60">
                  <input
                    type="checkbox"
                    checked={acceptedTermsCase}
                    onChange={(e) => setAcceptedTermsCase(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-stone-600 leading-relaxed group-hover:text-stone-900 transition-colors">
                    He leído y consiento el tratamiento confidencial de los datos suministrados bajo amparo de la{' '}
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
                    de Venezuela para la canalización exclusiva de ayuda humanitaria y verificación en terreno. *
                  </span>
                </label>
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
                    disabled={!acceptedAgeCase || !acceptedTermsCase}
                    className="w-2/3 sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send size={15} />
                    <span>Enviar mi Caso</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PASO: Verificación Obligatoria de Correo Electrónico (OTP 6 dígitos) */}
          {step === 'email_verification' && (
            <div className="space-y-6 py-2 animate-fade-in max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-ocean/10 text-brand-ocean rounded-2xl flex items-center justify-center mx-auto border border-brand-ocean/20">
                  <KeyRound size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Verificación de Correo Electrónico
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Para garantizar la veracidad de los casos y proteger a las familias ante solicitudes fraudulentas, hemos generado un código de seguridad de <strong>6 dígitos</strong> para:
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

              {/* Input de Código OTP */}
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
                  Validez del código: 10 minutos. Revisa tu buzón de entrada o la carpeta de spam.
                </p>

                {/* Respaldo de Código visible por latencia de conectividad */}
                {emailOtpBackupCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span><strong>Asistencia de Conectividad (Guaireña):</strong> Si tu señal o el servidor de correo tiene demora, tu código activo es </span>
                      <code className="px-1.5 py-0.5 bg-amber-200/80 text-amber-950 font-mono font-bold rounded">
                        {emailOtpBackupCode}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyEmailAndSubmitCase}
                  disabled={emailOtpInput.trim().length !== 6}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={18} />
                  <span>Verificar Correo y Enviar Caso</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Regresar y modificar datos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendEmailOtp}
                    disabled={emailOtpCooldown > 0 || emailOtpSending}
                    className="text-xs text-brand-ocean hover:text-[#0a6670] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {isFromResend ? '¡Tu caso ha sido reenviado exitosamente!' : '¡Tu caso ha sido pre-registrado exitosamente!'}
                    </h3>
                    <p className="text-xs text-emerald-800">
                      {isFromResend 
                        ? 'Fue transmitido formalmente a manomanovzla@gmail.com y respaldado en Google Drive. Ahora completa tu registro de usuario a continuación.'
                        : 'Quedó asignado formalmente en el sistema de atención de Mano a Mano Venezuela.'}
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
                  Los datos fueron despachados directamente hacia el correo oficial <span className="font-mono font-semibold text-stone-800">manomanovzla@gmail.com</span>. El equipo coordinador contactará al número <span className="font-semibold text-stone-800">{createdEntry.phone}</span> para corroborar en sitio y canalizar la ayuda.
                </p>
                
                {/* Botones de Respaldo Directo y Email Oficial Exclusivo */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? '¡Código Copiado al Portapapeles!' : `Copiar Código de Expediente (${createdEntry.caseId})`}</span>
                  </button>

                  <a
                    href={`mailto:manomanovzla@gmail.com?subject=${encodeURIComponent(`[EXPEDIENTE ${createdEntry.caseId}] - ${createdEntry.fullName}`)}&body=${encodeURIComponent(
                      `Expediente: ${createdEntry.caseId}\nNombre: ${createdEntry.fullName}\nCédula: ${createdEntry.cedula || 'N/A'}\nTeléfono: ${createdEntry.phone}\nParroquia: ${createdEntry.parroquia}\nUbicación: ${createdEntry.location}\n\nRelato:\n${createdEntry.narrative}`
                    )}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-semibold transition-all border border-stone-300"
                  >
                    <Mail size={14} className="text-stone-600" />
                    <span>Constancia al Correo Oficial</span>
                  </a>
                </div>
              </div>

              {/* Registro Obligatorio / Recomendado de Usuario para Control de Acceso y Seguimiento */}
              <div className={`p-5 rounded-2xl space-y-3 shadow-xs border-2 ${
                isFromResend 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20' 
                  : 'bg-gradient-to-r from-brand-ocean/10 via-brand-ocean/5 to-white border-brand-ocean/40'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl shadow-xs text-white ${isFromResend ? 'bg-amber-600' : 'bg-brand-ocean'}`}>
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">
                        {isFromResend ? 'Paso Siguiente: Registra tu Usuario en la Plataforma' : 'Crea tu Cuenta de Usuario en la Plataforma'}
                      </h4>
                      <p className="text-xs text-stone-600">
                        {isFromResend 
                          ? 'Para tener control formal de quién ingresa a la plataforma y dar seguimiento a tu caso reenviado.'
                          : 'Para tener control del estatus de tu caso, ingresar de forma segura con 2FA y verificar las ayudas asignadas.'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                    isFromResend ? 'bg-amber-200 text-amber-900 font-extrabold' : 'bg-brand-ocean/15 text-brand-ocean'
                  }`}>
                    {isFromResend ? 'Requerido para Control' : 'Control de Acceso'}
                  </span>
                </div>

                <div className="text-xs text-stone-700 bg-white/90 p-3 rounded-xl border border-stone-200 leading-relaxed">
                  {isFromResend ? (
                    <span>
                      Para que la directiva de la brigada tenga control y registro de todas las personas que ingresan y utilizan la plataforma, <strong>ahora debes registrar tu cuenta de usuario</strong>. Tus datos del expediente <strong>{createdEntry.caseId}</strong> ya han sido precargados en el formulario.
                    </span>
                  ) : (
                    <span>
                      Registrar tu usuario te permitirá consultar el expediente <strong>{createdEntry.caseId}</strong> en cualquier momento, actualizar tus datos de contacto y recibir notificaciones de visitas de la brigada.
                    </span>
                  )}
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleProceedToRegister}
                    className="px-5 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <ShieldCheck size={15} />
                    <span>Registrarme en la Plataforma Ahora</span>
                  </button>

                  <span className="text-[11px] text-stone-500">
                    Tus datos del caso se precargarán automáticamente.
                  </span>
                </div>
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

      {/* Modal de Confirmación y Consentimiento de Mayoría de Edad para Reenvío de Caso */}
      {showResendConfirmModal && storedCase && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Reenviar Expediente Guardado
                  </h3>
                  <p className="text-xs text-stone-500">
                    Código: <span className="font-mono font-semibold text-stone-800">{storedCase.caseId}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResendConfirmModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2 text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Titular del Caso:</span>
                <span className="font-bold text-stone-900">{storedCase.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Parroquia:</span>
                <span className="font-medium text-stone-800">{storedCase.parroquia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Teléfono registrado:</span>
                <span className="font-medium text-stone-800">{storedCase.phone}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 text-stone-600 leading-relaxed">
                Este reenvío despachará inmediatamente los datos al buzón oficial <span className="font-semibold text-stone-900">manomanovzla@gmail.com</span> y a la base de datos de Google Drive.
              </div>
            </div>

            {/* Política Anti-Spam / Periodo Seguro */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Periodo Seguro Anti-Saturación:</strong> Solo se permite 1 reenvío cada 5 minutos por caso para resguardar la estabilidad de los canales de atención y prevenir vulnerabilidades de denegación de servicio.
              </span>
            </div>

            {/* Consentimiento Legal y Mayoría de Edad (+18) */}
            <label className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmAgeResend}
                onChange={(e) => setConfirmAgeResend(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
              />
              <span className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900">
                <strong>Declaro bajo fe de juramento ser mayor de edad (+18 años)</strong> conforme a la legislación de Venezuela y autorizo expresamente el reenvío de este caso a la coordinación de la Brigada 99HDD. *
              </span>
            </label>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResendConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!confirmAgeResend || isResending}
                onClick={handleExecuteResend}
                className="px-5 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                <span>{isResending ? 'Reenviando...' : 'Confirmar y Reenviar Caso'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Advertencia al Salir sin Registrar Usuario tras Reenvío */}
      {showPostResendExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-base">
                  ¿Deseas registrarte antes de salir?
                </h4>
                <p className="text-xs text-stone-500">
                  Control y Registro de Usuarios de la Plataforma
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
              Has reenviado tu caso con éxito. Para que nuestro equipo pueda verificar quién ingresa y dar seguimiento al expediente <strong>{createdEntry?.caseId}</strong>, te recomendamos registrar tu cuenta con contraseña y verificación 2FA.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleProceedToRegister}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Completar Registro Ahora
              </button>
              <button
                type="button"
                onClick={handleForceClose}
                className="w-full sm:w-auto px-4 py-2.5 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Salir sin Registrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Lectura Previa de la Ley sobre Mensajes de Datos y Firmas Electrónicas */}
      <LeyMensajesDatosModal
        isOpen={showLeyModal}
        onClose={() => setShowLeyModal(false)}
        onAcceptAndClose={() => {
          setAcceptedTermsCase(true);
          setShowLeyModal(false);
        }}
      />
    </div>
  );
};
