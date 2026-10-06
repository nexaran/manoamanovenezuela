import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  RotateCcw, 
  ExternalLink,
  LogOut,
  Sparkles,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  Home,
  HeartHandshake,
  FileText
} from 'lucide-react';
import {
  validateBusinessName,
  validatePersonName,
  validateFiscalDocument,
  validateVenezuelanPhone,
  validateEmailAddress,
  validatePhysicalAddress,
  evaluatePasswordSecurity,
  checkPasswordRotationStatus,
  generateOtpChallenge,
  verifyOtpCode,
  generateArithmeticChallenge,
  checkAndAcquireClickLock,
  generateIdempotencyToken,
  getActiveUserSession,
  saveUserSession,
  destroyUserSession,
  saveRegisteredUser,
  getStoredUsers,
  UserSessionData,
  OtpChallenge,
  ArithmeticChallenge,
  OTP_RESEND_COOLDOWN_SEC,
  SESSION_DURATION_MS,
  hashPasswordSha256
} from '../lib/security';
import { LegalTabType } from './LegalDocumentsModal';
import { trackAnalyticsEvent } from '../lib/analyticsService';

export type AuthTabType = 'registro' | 'login' | 'otp' | 'rotacion' | 'perfil';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTabType;
  onOpenLegalTab?: (tab: LegalTabType) => void;
  initialValues?: {
    fullName?: string;
    cedula?: string;
    phone?: string;
    email?: string;
    address?: string;
    role?: 'empresa' | 'donante' | 'voluntario' | 'victima';
    caseId?: string;
  };
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'registro',
  onOpenLegalTab,
  initialValues
}) => {
  const [activeTab, setActiveTab] = useState<AuthTabType>(initialTab);
  const [currentSession, setCurrentSession] = useState<UserSessionData | null>(null);

  // Registro form fields
  const [businessName, setBusinessName] = useState('');
  const [representative, setRepresentative] = useState('');
  const [fiscalDoc, setFiscalDoc] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'empresa' | 'donante' | 'voluntario' | 'victima'>('empresa');
  const [caseId, setCaseId] = useState('');
  
  // Checks obligatorios
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Captcha aritmético
  const [captchaChallenge, setCaptchaChallenge] = useState<ArithmeticChallenge>(() => generateArithmeticChallenge());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // OTP State
  const [otpChallenge, setOtpChallenge] = useState<OtpChallenge | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [pendingUserSession, setPendingUserSession] = useState<UserSessionData | null>(null);

  // Rotación de contraseña
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmNewPwdInput, setConfirmNewPwdInput] = useState('');
  const [rotationMsg, setRotationMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Mensajes de error por campo en registro
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Inicializar o verificar sesión activa
  useEffect(() => {
    if (isOpen) {
      const session = getActiveUserSession();
      setCurrentSession(session);
      if (session) {
        // Verificar si la contraseña requiere rotación
        const rotStatus = checkPasswordRotationStatus(session.passwordChangedAt);
        if (rotStatus.isExpired) {
          setActiveTab('rotacion');
        } else {
          setActiveTab('perfil');
        }
      } else if (initialTab) {
        setActiveTab(initialTab);
      }

      // Pre-cargar valores iniciales si vienen del caso reenviado o registrado
      if (initialValues) {
        if (initialValues.fullName) {
          setBusinessName(initialValues.fullName);
          setRepresentative(initialValues.fullName);
        }
        if (initialValues.cedula) setFiscalDoc(initialValues.cedula);
        if (initialValues.phone) setPhone(initialValues.phone);
        if (initialValues.email) setEmail(initialValues.email);
        if (initialValues.address) setAddress(initialValues.address);
        if (initialValues.role) setRole(initialValues.role);
        if (initialValues.caseId) setCaseId(initialValues.caseId);
      }

      setCaptchaChallenge(generateArithmeticChallenge());
      setCaptchaInput('');
      setGlobalError(null);
      setGlobalSuccess(null);
    }
  }, [isOpen, initialTab, initialValues]);

  // Manejo de temporizador para el cooldown de reenvío de OTP (45 segundos)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setTimeout(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  if (!isOpen) return null;

  // Evaluador de contraseña reactivo
  const pwdEvaluation = evaluatePasswordSecurity(password);
  const newPwdEvaluation = evaluatePasswordSecurity(newPwdInput);

  // Manejar refresco de Captcha
  const handleRefreshCaptcha = () => {
    setCaptchaChallenge(generateArithmeticChallenge());
    setCaptchaInput('');
    setCaptchaError('');
  };

  // ==========================================
  // MANEJADOR DE REGISTRO CON REGLAS ESTRICTAS
  // ==========================================
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    // 1. Bloqueo de doble clic (4 segundos en memoria)
    if (!checkAndAcquireClickLock('user_register')) {
      setGlobalError('Acción en proceso. Espere un momento antes de volver a presionar el botón.');
      return;
    }

    // 2. Validaciones estrictas de campos
    const errors: Record<string, string> = {};

    const bNameRes = validateBusinessName(businessName);
    if (!bNameRes.valid) errors.businessName = bNameRes.message!;

    const effectiveRep = role === 'victima' ? (businessName.trim()) : representative;
    const repRes = validatePersonName(effectiveRep);
    if (!repRes.valid && role !== 'victima') errors.representative = repRes.message!;

    const fiscalRes = validateFiscalDocument(fiscalDoc);
    if (!fiscalRes.valid) errors.fiscalDoc = fiscalRes.message!;

    const phoneRes = validateVenezuelanPhone(phone);
    if (!phoneRes.valid) errors.phone = phoneRes.message!;

    const emailRes = validateEmailAddress(email);
    if (!emailRes.valid) errors.email = emailRes.message!;

    const addrRes = validatePhysicalAddress(address);
    if (!addrRes.valid) errors.address = addrRes.message!;

    if (!pwdEvaluation.valid) {
      errors.password = pwdEvaluation.errors.join(' ');
    }

    // Validar mayoría de edad (+18)
    if (!acceptedAge) {
      errors.acceptedAge = 'Debe declarar bajo fe de juramento ser mayor de edad (+18) para continuar.';
    }

    // Validar términos legales
    if (!acceptedTerms) {
      errors.acceptedTerms = 'Debe aceptar los Términos y Condiciones, Privacidad y Cookies de la plataforma.';
    }

    // Validar captcha aritmético
    const userAns = parseInt(captchaInput.trim(), 10);
    if (isNaN(userAns) || userAns !== captchaChallenge.expectedAnswer) {
      errors.captcha = 'Respuesta anti-robot incorrecta. Por favor resuelva la operación matemática.';
      handleRefreshCaptcha();
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGlobalError('Por favor corrija los campos marcados antes de continuar.');
      return;
    }

    // Datos validados y formateados
    const formattedFiscal = fiscalRes.formattedValue || fiscalDoc;
    const formattedPhone = phoneRes.formattedValue || phone;
    const cleanEmail = emailRes.formattedValue || email.toLowerCase().trim();

    // Hashear contraseña con SHA-256 antes de persistir
    hashPasswordSha256(password).then(hashedPwd => {
      // Crear objeto de usuario provisional
      const idempotency = generateIdempotencyToken('usr');
      const newUser: UserSessionData = {
        userId: idempotency,
        businessName: bNameRes.formattedValue || businessName,
        representative: role === 'victima' ? (businessName.trim()) : (repRes.formattedValue || representative),
        fiscalDoc: formattedFiscal,
        email: cleanEmail,
        phone: formattedPhone,
        address: addrRes.formattedValue || address,
        role,
        caseId: role === 'victima' ? (caseId.trim() || undefined) : undefined,
        passwordHash: hashedPwd, // Almacenado de forma segura con hash SHA-256
        passwordChangedAt: Date.now(),
        sessionToken: generateIdempotencyToken('tok'),
        loginTimestamp: Date.now(),
        lastActiveTimestamp: Date.now(),
        acceptedAgeDeclaration: true,
        acceptedLegalTerms: true
      };

      // Despachar Desafío 2FA / OTP (6 dígitos numéricos)
      const challenge = generateOtpChallenge(cleanEmail);
      setOtpChallenge(challenge);
      setPendingUserSession(newUser);
      setOtpCooldown(OTP_RESEND_COOLDOWN_SEC);
      setOtpInput('');
      setOtpMessage({
        type: 'info',
        text: `Se ha emitido un código OTP de 6 dígitos numéricos. Verifique la bandeja de ${cleanEmail}.`
      });

      // Guardar usuario en la base registrada local
      saveRegisteredUser(newUser);

      // Telemetría de nuevo registro para control y auditoría
      trackAnalyticsEvent('user_register', 'Registro de Usuario en Plataforma', 'Usuarios', formattedFiscal, {
        rol: role,
        email: cleanEmail
      });

      // Cambiar a la pestaña de verificación 2FA
      setActiveTab('otp');
    });
  };

  // ==========================================
  // MANEJADOR DE INICIO DE SESIÓN
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!checkAndAcquireClickLock('user_login')) {
      setGlobalError('Intento en proceso. Espere unos segundos.');
      return;
    }

    const cleanId = loginIdentifier.trim().toLowerCase();
    const storedUsers = getStoredUsers();

    // Acceso directo de administración con clave maestra autorizada: Abelxti100%
    if (
      (cleanId === 'admin' ||
       cleanId === 'administrador' ||
       cleanId === 'coordinador' ||
       cleanId === 'manomanovzla@gmail.com' ||
       cleanId === 'nexarankpai@gmail.com') &&
      loginPassword.trim() === 'Abelxti100%'
    ) {
      const adminHash = await hashPasswordSha256('Abelxti100%');
      let adminUser = storedUsers.find(
        u => u.email.toLowerCase() === cleanId || u.fiscalDoc.toLowerCase() === cleanId
      );
      if (!adminUser) {
        adminUser = {
          userId: 'usr-admin-master',
          businessName: 'Directiva Mano a Mano & Brigada 99HDD',
          representative: 'Coordinador General',
          fiscalDoc: 'J-50392817-4',
          email: cleanId.includes('@') ? cleanId : 'manomanovzla@gmail.com',
          phone: '+58 412-020-8842',
          address: 'La Guaira, Venezuela',
          role: 'coordinador',
          passwordHash: adminHash,
          passwordChangedAt: Date.now(),
          sessionToken: 'token-admin-' + Date.now(),
          loginTimestamp: Date.now(),
          lastActiveTimestamp: Date.now(),
          acceptedAgeDeclaration: true,
          acceptedLegalTerms: true
        };
        saveRegisteredUser(adminUser);
      } else {
        adminUser.passwordHash = adminHash;
        saveRegisteredUser(adminUser);
      }

      saveUserSession(adminUser);
      setCurrentSession(adminUser);
      setActiveTab('perfil');
      setGlobalSuccess('✓ Bienvenido(a) al Panel de Coordinación y Administración.');
      return;
    }

    // Buscar por correo o por documento fiscal
    const userFound = storedUsers.find(
      u => u.email.toLowerCase() === cleanId || u.fiscalDoc.toLowerCase() === cleanId
    );

    if (!userFound) {
      setGlobalError('Credenciales incorrectas. Verifique el correo / RIF y la contraseña suministrada.');
      return;
    }

    // Verificar contraseña (tanto con hash SHA-256 como con valor anterior para retrocompatibilidad)
    const inputHashed = await hashPasswordSha256(loginPassword);
    const isPasswordValid = userFound.passwordHash === inputHashed || userFound.passwordHash === loginPassword;

    if (!isPasswordValid) {
      setGlobalError('Credenciales incorrectas. Verifique el correo / RIF y la contraseña suministrada.');
      return;
    }

    // Si aún tenía contraseña sin hash, migrarla a SHA-256
    if (userFound.passwordHash === loginPassword) {
      userFound.passwordHash = inputHashed;
      saveRegisteredUser(userFound);
    }

    // Iniciar desafío 2FA para nueva sesión
    const challenge = generateOtpChallenge(userFound.email);
    setOtpChallenge(challenge);
    setPendingUserSession({
      ...userFound,
      lastActiveTimestamp: Date.now()
    });
    setOtpCooldown(OTP_RESEND_COOLDOWN_SEC);
    setOtpInput('');
    setOtpMessage({
      type: 'info',
      text: `Doble Factor Requerido: Ingrese el código OTP enviado a ${userFound.email}.`
    });

    setActiveTab('otp');
  };

  // ==========================================
  // MANEJADOR DE VERIFICACIÓN 2FA / OTP
  // ==========================================
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpChallenge || !pendingUserSession) {
      setOtpMessage({ type: 'error', text: 'No hay un desafío OTP activo. Vuelva a iniciar sesión.' });
      return;
    }

    const result = verifyOtpCode(otpInput, otpChallenge);

    if (!result.success) {
      setOtpMessage({ type: 'error', text: result.message });
      return;
    }

    // Éxito en 2FA: Activar sesión de 2 horas
    saveUserSession(pendingUserSession);
    setCurrentSession(pendingUserSession);
    setOtpMessage({ type: 'success', text: 'Autenticación multifactor completada con éxito.' });

    // Telemetría de inicio de sesión exitoso
    trackAnalyticsEvent('user_login', 'Inicio de Sesión Exitoso (2FA)', 'Usuarios', pendingUserSession.fiscalDoc, {
      rol: pendingUserSession.role,
      email: pendingUserSession.email
    });

    // Comprobar si requiere rotación de contraseña
    const rot = checkPasswordRotationStatus(pendingUserSession.passwordChangedAt);
    if (rot.isExpired) {
      setTimeout(() => {
        setActiveTab('rotacion');
      }, 800);
    } else {
      setTimeout(() => {
        setActiveTab('perfil');
      }, 800);
    }
  };

  // Reenviar OTP
  const handleResendOtp = () => {
    if (otpCooldown > 0 || !pendingUserSession) return;
    const challenge = generateOtpChallenge(pendingUserSession.email);
    setOtpChallenge(challenge);
    setOtpCooldown(OTP_RESEND_COOLDOWN_SEC);
    setOtpInput('');
    setOtpMessage({
      type: 'info',
      text: `Nuevo código OTP de 6 dígitos emitido para ${pendingUserSession.email}.`
    });
  };

  // ==========================================
  // MANEJADOR DE ROTACIÓN DE CONTRASEÑA (90 DÍAS)
  // ==========================================
  const handleRotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRotationMsg(null);

    if (!currentSession) {
      setRotationMsg({ type: 'error', text: 'No hay una sesión activa.' });
      return;
    }

    const currentHashed = await hashPasswordSha256(currentPwdInput);
    if (currentSession.passwordHash && currentSession.passwordHash !== currentHashed && currentSession.passwordHash !== currentPwdInput) {
      setRotationMsg({ type: 'error', text: 'La contraseña actual ingresada es incorrecta.' });
      return;
    }

    if (!newPwdEvaluation.valid) {
      setRotationMsg({ type: 'error', text: newPwdEvaluation.errors.join(' ') });
      return;
    }

    if (newPwdInput !== confirmNewPwdInput) {
      setRotationMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    if (newPwdInput === currentPwdInput) {
      setRotationMsg({ type: 'error', text: 'La nueva contraseña debe ser distinta a la clave anterior.' });
      return;
    }

    const newHashed = await hashPasswordSha256(newPwdInput);

    // Actualizar usuario
    const updated: UserSessionData = {
      ...currentSession,
      passwordHash: newHashed,
      passwordChangedAt: Date.now(),
      lastActiveTimestamp: Date.now()
    };

    saveUserSession(updated);
    saveRegisteredUser(updated);
    setCurrentSession(updated);
    setCurrentPwdInput('');
    setNewPwdInput('');
    setConfirmNewPwdInput('');

    setRotationMsg({
      type: 'success',
      text: '¡Contraseña actualizada exitosamente! Próxima rotación en 90 días.'
    });

    setTimeout(() => {
      setActiveTab('perfil');
    }, 1200);
  };

  // Cerrar sesión seguro
  const handleLogout = () => {
    destroyUserSession();
    setCurrentSession(null);
    setActiveTab('login');
    setGlobalSuccess('Sesión cerrada de forma segura. El token de sesión fue destruido.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-brand-dark via-[#1a233a] to-brand-dark text-white p-5 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal de autenticación"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Suite de Seguridad & Autenticación Multifactor (2FA)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-0.5">
            Plataforma Segura Mano a Mano Venezuela
          </h2>
          <p className="text-white/80 text-xs sm:text-sm font-light">
            Gobernanza técnica, rotación a 90 días y sesión con caducidad estricta de 2 horas.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 pt-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {!currentSession && (
            <>
              <button
                onClick={() => setActiveTab('registro')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'registro'
                    ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
                }`}
              >
                <UserCheck size={14} />
                <span>Registro Estricto</span>
              </button>

              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
                }`}
              >
                <Lock size={14} />
                <span>Acceso Seguro</span>
              </button>
            </>
          )}

          {otpChallenge && (
            <button
              onClick={() => setActiveTab('otp')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'otp'
                  ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
              }`}
            >
              <KeyRound size={14} className="text-amber-600" />
              <span>Verificación 2FA</span>
            </button>
          )}

          {currentSession && (
            <>
              <button
                onClick={() => setActiveTab('perfil')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'perfil'
                    ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
                }`}
              >
                <UserCheck size={14} />
                <span>Mi Sesión Activa</span>
              </button>

              <button
                onClick={() => setActiveTab('rotacion')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'rotacion'
                    ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
                }`}
              >
                <RotateCcw size={14} />
                <span>Rotación (90 Días)</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-stone-800 text-xs sm:text-sm leading-relaxed space-y-4">
          
          {/* Mensajes globales */}
          {globalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{globalError}</span>
            </div>
          )}

          {globalSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{globalSuccess}</span>
            </div>
          )}

          {/* TAB 1: REGISTRO ESTRICTO */}
          {activeTab === 'registro' && !currentSession && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <span className="font-bold text-stone-800 block">Validación Oficial y Anti-Fraude:</span>
                <p>Todos los registros pasan por filtros en tiempo real de identidad fiscal venezolana, sanitización anti-XSS y validación de mayoría de edad.</p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Modalidad de Usuario</span>
                  <span className="text-[10px] text-stone-500">Selecciona tu perfil en la plataforma</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['victima', 'donante', 'voluntario', 'empresa'] as const).map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                        role === r 
                          ? 'bg-brand-ocean text-white border-brand-ocean shadow-xs ring-2 ring-brand-ocean/30' 
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200/70'
                      }`}
                    >
                      <span className="font-bold text-xs">
                        {r === 'victima' && '🏠 Víctima / Afectado'}
                        {r === 'donante' && '🤝 Padrino / Donante'}
                        {r === 'voluntario' && '👷 Voluntario 99HDD'}
                        {r === 'empresa' && '🏢 Empresa / RIF'}
                      </span>
                      <span className={`text-[10px] ${role === r ? 'text-teal-100' : 'text-stone-500'}`}>
                        {r === 'victima' && 'Seguimiento de Caso'}
                        {r === 'donante' && 'Aportes directos'}
                        {r === 'voluntario' && 'Ficha de campo'}
                        {r === 'empresa' && 'RSE institucional'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Razón Social y Representante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {role === 'victima' ? 'Nombre Completo del Solicitante / Titular *' : role === 'empresa' ? 'Razón Social / Nombre Comercial *' : 'Nombre Completo / Razón Social *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={role === 'victima' ? 'Ej. Carmen Rodríguez' : 'Ej. Distribuidora Central C.A.'}
                    className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                      fieldErrors.businessName ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  {fieldErrors.businessName && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.businessName}</span>
                  )}
                </div>

                {role === 'victima' ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span>Código de Expediente Humanitario</span>
                      <span className="text-[10px] text-brand-ocean bg-brand-ocean/10 px-1.5 py-0.5 rounded font-mono font-bold">Seguimiento</span>
                    </label>
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      placeholder="Ej. CASO-LG-2026-XXXX"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Código que recibiste en tu comprobante o correo para dar seguimiento.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Persona de Contacto / Representante *
                    </label>
                    <input
                      type="text"
                      required
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      placeholder="Ej. Carlos Eduardo Pérez"
                      className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                        fieldErrors.representative ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                      }`}
                    />
                    {fieldErrors.representative && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.representative}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Documento Fiscal y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Documento Fiscal (RIF / Cédula / Pasaporte) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fiscalDoc}
                    onChange={(e) => setFiscalDoc(e.target.value)}
                    placeholder="Ej. J-12345678-0 o V-12345678"
                    className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                      fieldErrors.fiscalDoc ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Prefijos: J-, G-, C-, V-, E- o PAS-</span>
                  {fieldErrors.fiscalDoc && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.fiscalDoc}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Teléfono de Contacto (Venezuela) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 0412-1234567 o 0212-..."
                    className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                      fieldErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">10-14 dígitos (0412, 0414, 0424, 0416, 0426, 0212...)</span>
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.phone}</span>
                  )}
                </div>
              </div>

              {/* Correo y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Correo Electrónico Corporativo / Personal *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@dominio.com"
                    className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dirección Física Confirmable en Venezuela *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, avenida, sector, local o galpón"
                    className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-ocean ${
                      fieldErrors.address ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  {fieldErrors.address && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.address}</span>
                  )}
                </div>
              </div>

              {/* Contraseña con Medidor de 4 Niveles */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    Contraseña de Acceso Seguro (Mínimo 8 caracteres) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Combinación de letras y números..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />

                {/* Barra medidora visual de 4 niveles */}
                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Nivel de Fortaleza:</span>
                      <span className={`font-bold ${
                        pwdEvaluation.level === 'muy_corta' ? 'text-rose-600' :
                        pwdEvaluation.level === 'debil' ? 'text-amber-600' :
                        pwdEvaluation.level === 'media' ? 'text-blue-600' :
                        'text-emerald-600'
                      }`}>
                        {pwdEvaluation.label}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 rounded-full ${pwdEvaluation.score >= 1 ? (pwdEvaluation.level === 'muy_corta' ? 'bg-rose-500' : 'bg-amber-500') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwdEvaluation.score >= 2 ? (pwdEvaluation.score === 2 ? 'bg-amber-500' : 'bg-blue-500') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwdEvaluation.score >= 3 ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwdEvaluation.score >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>

                    {pwdEvaluation.errors.length > 0 && (
                      <p className="text-[11px] text-amber-700 leading-snug">
                        {pwdEvaluation.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Desafío Anti-Robot Ligero (Captcha Aritmético) */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <ShieldCheck size={14} className="text-brand-ocean" />
                    <span>{captchaChallenge.questionText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                    title="Generar nueva operación"
                  >
                    <RefreshCw size={12} />
                    <span>Cambiar</span>
                  </button>
                </div>

                <input
                  type="number"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Ingrese el resultado numérico"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
                {fieldErrors.captcha && (
                  <span className="text-[11px] text-rose-600 block">{fieldErrors.captcha}</span>
                )}
              </div>

              {/* Casillas Legales Obligatorias */}
              <div className="space-y-3 pt-1">
                {/* Checkbox 1: Mayoría de Edad (+18) */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={acceptedAge}
                    onChange={(e) => setAcceptedAge(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-brand-ocean focus:ring-brand-ocean w-4 h-4"
                  />
                  <span className="leading-snug">
                    <strong>Declaro bajo fe de juramento ser mayor de edad (+18 años)</strong> conforme a la legislación venezolana y contar con plena capacidad civil y jurídica para obligarme comercialmente en esta plataforma.
                  </span>
                </label>
                {fieldErrors.acceptedAge && (
                  <span className="text-[11px] text-rose-600 block pl-6">{fieldErrors.acceptedAge}</span>
                )}

                {/* Checkbox 2: Términos y Normativas */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-brand-ocean focus:ring-brand-ocean w-4 h-4"
                  />
                  <span className="leading-snug">
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalTab?.('terminos')}
                      className="text-brand-ocean underline hover:text-brand-accent cursor-pointer"
                    >
                      Términos y Condiciones
                    </button>
                    , la{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalTab?.('privacidad')}
                      className="text-brand-ocean underline hover:text-brand-accent cursor-pointer"
                    >
                      Política de Privacidad
                    </button>
                    , la{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalTab?.('cookies')}
                      className="text-brand-ocean underline hover:text-brand-accent cursor-pointer"
                    >
                      Política de Cookies
                    </button>{' '}
                    y las Normas de Compraventa de Mano a Mano Venezuela.
                  </span>
                </label>
                {fieldErrors.acceptedTerms && (
                  <span className="text-[11px] text-rose-600 block pl-6">{fieldErrors.acceptedTerms}</span>
                )}
              </div>

              {/* Botón de Envío con Desafío 2FA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!acceptedAge || !acceptedTerms}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    acceptedAge && acceptedTerms
                      ? 'bg-brand-dark hover:bg-stone-800 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <KeyRound size={15} />
                  <span>Completar Registro y Emitir Código 2FA</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACCESO SEGURO / LOGIN */}
          {activeTab === 'login' && !currentSession && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in py-2">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block text-xs">Acceso con Token y Doble Factor:</span>
                <p className="text-xs text-stone-600">
                  Al ingresar sus credenciales, se generará automáticamente un código OTP de 6 dígitos numéricos para verificar la autenticidad del dispositivo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correo Electrónico o Documento Fiscal (RIF / Cédula)
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="usuario@dominio.com o J-12345678-0"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Su contraseña establecida"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={15} />
                <span>Continuar a Validación 2FA (OTP)</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('registro')}
                  className="text-xs text-stone-500 hover:text-brand-ocean underline cursor-pointer"
                >
                  ¿No tienes cuenta registrada? Regístrate aquí
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: VERIFICACIÓN 2FA / OTP */}
          {activeTab === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-4 animate-fade-in py-2">
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <KeyRound size={16} className="text-amber-700" />
                  <span>Doble Factor de Autenticación Requerido</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Para resguardar la identidad y mitigar ataques de fuerza bruta, hemos emitido un código numérico aleatorio de 6 dígitos con validez de <strong>10 minutos</strong>.
                </p>
                {pendingUserSession && (
                  <p className="text-[11px] text-amber-900 font-mono bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                    Destino: {pendingUserSession.email}
                  </p>
                )}
              </div>

              {otpMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  otpMessage.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' :
                  otpMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                  'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  <Info size={15} className="shrink-0 mt-0.5" />
                  <span>{otpMessage.text}</span>
                </div>
              )}

              {/* Visualización de prueba / código para confirmación fluida */}
              {otpChallenge && !otpChallenge.isLocked && (
                <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                  <span>Código de validación (Bandeja / Dispatcher):</span>
                  <span className="font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded border border-stone-300 tracking-wider">
                    {otpChallenge.code}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                  Ingrese el Código OTP de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono tracking-widest bg-stone-50 border border-stone-300 rounded-2xl py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>

              <button
                type="submit"
                disabled={otpChallenge?.isLocked || otpInput.length < 6}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  otpInput.length === 6 && !otpChallenge?.isLocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>Verificar y Abrir Sesión Segura</span>
              </button>

              {/* Cooldown de Reenvío (45 segundos) */}
              <div className="text-center pt-2">
                {otpCooldown > 0 ? (
                  <span className="text-xs text-stone-500 flex items-center justify-center gap-1.5">
                    <Clock size={13} />
                    <span>Reenvío disponible en {otpCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs text-brand-ocean hover:underline font-semibold cursor-pointer"
                  >
                    Reenviar nuevo código OTP (45s cooldown)
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: ROTACIÓN PREVENTIVA DE CONTRASEÑA (90 DÍAS) */}
          {activeTab === 'rotacion' && currentSession && (
            <form onSubmit={handleRotationSubmit} className="space-y-4 animate-fade-in py-2">
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <RotateCcw size={15} className="text-amber-700" />
                  <span>Política de Rotación Preventiva cada 90 Días</span>
                </div>
                {(() => {
                  const rot = checkPasswordRotationStatus(currentSession.passwordChangedAt);
                  return (
                    <p className="text-xs text-amber-800">
                      {rot.isExpired 
                        ? 'Su contraseña ha superado el ciclo de 90 días. Por normativa de seguridad, debe actualizarla para continuar.' 
                        : `Le restan ${rot.daysRemaining} días antes del vencimiento preventivo de su clave.`}
                    </p>
                  );
                })()}
              </div>

              {rotationMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  rotationMsg.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <Info size={15} className="shrink-0 mt-0.5" />
                  <span>{rotationMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  required
                  value={currentPwdInput}
                  onChange={(e) => setCurrentPwdInput(e.target.value)}
                  placeholder="Ingrese su contraseña actual para verificar"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nueva Contraseña Segura (Mínimo 8 caracteres) *
                </label>
                <input
                  type="password"
                  required
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="Nueva combinación de letras y números"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />

                {newPwdInput && (
                  <div className="text-[11px] mt-1 space-y-1">
                    <span className="font-semibold text-stone-600">Fortaleza: {newPwdEvaluation.label}</span>
                    {newPwdEvaluation.errors.length > 0 && (
                      <p className="text-rose-600">{newPwdEvaluation.errors[0]}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPwdInput}
                  onChange={(e) => setConfirmNewPwdInput(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-ocean"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Guardar Nueva Contraseña y Reiniciar Ciclo de 90 Días</span>
              </button>
            </form>
          )}

          {/* TAB 5: MI SESIÓN ACTIVA / PERFIL */}
          {activeTab === 'perfil' && currentSession && (
            <div className="space-y-4 animate-fade-in py-1">
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>Sesión Segura Activa (Token Válido)</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Caducidad automática tras <strong>2 horas de inactividad</strong> (Gobernanza de Sesiones).
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-1 rounded border border-emerald-200 text-emerald-900 shrink-0">
                  2H INACTIVIDAD
                </span>
              </div>

              {/* Ficha del usuario */}
              {currentSession.role === 'victima' && (
                <div className="bg-brand-ocean/10 border-2 border-brand-ocean/30 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-ocean/20">
                    <div className="flex items-center gap-2">
                      <Home className="text-brand-ocean shrink-0" size={18} />
                      <h4 className="font-bold text-sm text-stone-900">Seguimiento de tu Caso Humanitario</h4>
                    </div>
                    <span className="font-mono font-bold text-xs bg-brand-ocean text-white px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      {currentSession.caseId || 'EXPEDIENTE ASOCIADO'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    Tu caso está resguardado ante la <strong>Brigada 99HDD</strong> y la directiva de <strong>Mano a Mano Venezuela</strong>. Con tu usuario activo puedes verificar el estado de la visita técnica de corroboración.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-3 bg-white rounded-xl border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">Titular Registrado:</span>
                      <strong className="text-stone-900">{currentSession.businessName}</strong>
                      <span className="text-stone-500 block text-[11px] font-mono mt-0.5">C.I. {currentSession.fiscalDoc}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">Estatus Operativo:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] mt-0.5">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Recibido • En Programación de Visita</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:manomanovzla@gmail.com?subject=${encodeURIComponent(`[SEGUIMIENTO DE EXPEDIENTE] ${currentSession.caseId || ''} - ${currentSession.businessName} (C.I. ${currentSession.fiscalDoc})`)}&body=${encodeURIComponent(`Estimada directiva de Mano a Mano Venezuela y coordinación de la Brigada 99HDD:\n\nDeseo consultar el estatus y actualización de mi expediente humanitario:\n\n- Código de Expediente: ${currentSession.caseId || 'N/A'}\n- Titular del Caso: ${currentSession.businessName}\n- Cédula de Identidad: ${currentSession.fiscalDoc}\n- Teléfono registrado: ${currentSession.phone}\n- Dirección / Parroquia: ${currentSession.address}\n\nAgradezco información sobre la visita técnica o canalización de ayuda.\n\nAtentamente,\n${currentSession.businessName}`)}`}
                      className="px-4 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Mail size={14} />
                      <span>Consultar Estatus por Correo Electrónico Oficial</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-stone-500 italic">
                    ℹ️ Por política institucional de seguridad, resguardo de datos y control formal de expedientes, toda comunicación y seguimiento se canaliza exclusivamente a través del correo oficial <code>manomanovzla@gmail.com</code>.
                  </p>
                </div>
              )}

              {/* Ficha del usuario */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Razón Social:</span>
                  <span className="font-bold text-stone-900">{currentSession.businessName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Documento Fiscal:</span>
                  <span className="font-mono font-bold text-stone-900">{currentSession.fiscalDoc}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Representante:</span>
                  <span className="font-medium text-stone-800">{currentSession.representative}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Correo Registrado:</span>
                  <span className="font-mono text-stone-800">{currentSession.email}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Teléfono:</span>
                  <span className="font-mono text-stone-800">{currentSession.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Dirección:</span>
                  <span className="font-medium text-stone-800 text-right">{currentSession.address}</span>
                </div>
              </div>

              {/* Acciones de Privacidad y Cierre de Sesión */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenLegalTab?.('privacidad')}
                  className="text-xs text-brand-ocean hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Info size={13} />
                  <span>Ejercer Derechos ARCO (Protección de Datos)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión Segura</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encriptación en tránsito y almacenamiento local protegido.</span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 bg-stone-300/70 hover:bg-stone-400/80 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
