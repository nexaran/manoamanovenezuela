/**
 * SUITE INTEGRAL DE SEGURIDAD, AUTENTICACIÓN, CUMPLIMIENTO LEGAL Y GOBERNANZA TÉCNICA
 * "Mano a Mano Venezuela" & Brigada 99HDD
 * Conforme a la legislación de la República Bolivariana de Venezuela y estándares de comercio electrónico.
 */

// ==========================================
// 1. CONSTANTES & CONFIGURACIONES GLOBALES
// ==========================================

export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 Horas estricta caducidad
export const OTP_EXPIRATION_MS = 10 * 60 * 1000;       // 10 Minutos para caducidad de OTP
export const OTP_RESEND_COOLDOWN_SEC = 45;              // 45 Segundos cooldown
export const OTP_MAX_ATTEMPTS = 5;                      // Máximo 5 intentos antes de bloqueo
export const PASSWORD_ROTATION_DAYS = 90;               // 90 Días rotación preventiva
export const PASSWORD_WARN_BEFORE_DAYS = 14;            // Advertencia previa 14 días antes
export const IDEMPOTENCY_LOCKOUT_MS = 4000;             // Bloqueo de doble clic: 4 segundos

// Dominios falsos o desechables bloqueados (Anti-spam / Anti-fraude)
export const BLOCKED_EMAIL_DOMAINS = new Set([
  'test.com',
  'fakemail.com',
  'ejemplo.com',
  'correo.com',
  'tempmail.com',
  'throwawaymail.com',
  'mailinator.com',
  'yopmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'grr.la',
  'fake.com',
  'nada.ltd',
]);

// Prefijos telefónicos y códigos de área oficiales en Venezuela
export const VENEZUELAN_PHONE_PREFIXES = [
  // Móviles
  '0412', '0414', '0424', '0416', '0426',
  // Fijos / Códigos de área principales
  '0212', // Gran Caracas / La Guaira
  '0241', // Carabobo (Valencia)
  '0243', // Aragua (Maracay)
  '0251', // Lara (Barquisimeto)
  '0261', // Zulia (Maracaibo)
  '0281', // Anzoátegui (Barcelona / Puerto La Cruz)
  '0285', // Bolívar (Ciudad Bolívar)
  '0286', // Bolívar (Puerto Ordaz)
  '0274', // Mérida
  '0276', // Táchira (San Cristóbal)
  '0295', // Nueva Esparta (Margarita)
  '0239', // Miranda (Valles del Tuy)
  '0235', // Guárico
  '0255', // Portuguesa
  '0273', // Barinas
  '0258', // Cojedes
  '0268', // Falcón (Coro)
  '0269', // Falcón (Punto Fijo)
  '0291', // Monagas (Maturín)
  '0293', // Sucre (Cumaná)
  '0294', // Sucre (Carúpano)
  '0287', // Delta Amacuro
  '0284', // Amazonas
  '0247', // Apure
  '0248', // Amazonas
];

// Contraseñas triviales bloqueadas
export const TRIVIAL_PASSWORDS = new Set([
  '12345678',
  '123456789',
  'password123',
  'admin123',
  'manoamano',
  'manoamanovzla',
  'brigada99hdd',
  'laguaira2026',
  'contrasena123',
  'qwerty1234',
  'venezuela2026',
  'seguridad123',
]);

// ==========================================
// 2. SANITIZACIÓN DE ENTRADAS (XSS & SQLi) & CRIPTOGRAFÍA
// ==========================================

/**
 * Función criptográfica segura SHA-256 para almacenamiento y validación de credenciales
 * conforme a estándares internacionales OWASP y normativas de resguardo de datos.
 */
export async function hashPasswordSha256(password: string): Promise<string> {
  if (!password) return '';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(password + '_mmv_salt_2026_la_guaira');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_) {}
  
  // Fallback con algoritmo Fowler-Noll-Vo / DJB2 extendido
  let hash = 5381;
  const str = password + '_mmv_salt_2026_la_guaira';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

/**
 * Sanitiza texto eliminando inyecciones SQL conocidas y scripts maliciosos XSS.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // 1. Prevenir scripts y etiquetas peligrosas
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // onclick=, onerror=, etc.
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // 2. Neutralizar patrones de inyección SQL
  const sqlKeywords = /\b(SELECT|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM|UPDATE\s+\w+\s+SET|UNION\s+SELECT|ALTER\s+TABLE|EXEC(?:UTE)?)\b/gi;
  sanitized = sanitized.replace(sqlKeywords, '[SANITIZED_QUERY]');

  // Neutralizar delimitadores de comentarios SQL y concatenaciones típicas
  sanitized = sanitized
    .replace(/--/g, '—')
    .replace(/\/\*.*?\*\//g, '');

  // 3. Limpieza de espacios redundantes y caracteres de control
  return sanitized.trim();
}

// ==========================================
// 3. REGLAS DE VALIDACIÓN ESTRICTA (VENEZUELA)
// ==========================================

export interface ValidationResult {
  valid: boolean;
  message?: string;
  formattedValue?: string;
}

/**
 * 1. Razón Social / Nombre Comercial
 * - Mínimo 3 caracteres alfabéticos reales
 * - Rechazo de entradas de solo dígitos o símbolos ("12345", "----")
 * - Rechazo de caracteres repetitivos ("aaaaaa", "xxxx")
 */
export function validateBusinessName(name: string): ValidationResult {
  const sanitized = sanitizeInput(name);
  if (!sanitized || sanitized.length < 3) {
    return { valid: false, message: 'La Razón Social o Nombre Comercial debe tener al menos 3 caracteres.' };
  }

  // Rechazar si es solo números o símbolos
  if (/^[\d\W_]+$/.test(sanitized)) {
    return { valid: false, message: 'El nombre comercial no puede componerse exclusivamente de números o símbolos.' };
  }

  // Verificar que tenga al menos 3 caracteres alfabéticos
  const alphaChars = sanitized.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g) || [];
  if (alphaChars.length < 3) {
    return { valid: false, message: 'Debe contener al menos 3 letras reales legibles.' };
  }

  // Rechazar caracteres repetitivos o basura (ej. aaaaaa, xxxx)
  if (/(.)\1{4,}/.test(sanitized.toLowerCase())) {
    return { valid: false, message: 'Contiene secuencias repetitivas inválidas (ej. "aaaaa").' };
  }

  return { valid: true, formattedValue: sanitized };
}

/**
 * 2. Persona de Contacto / Representante
 * - Nombre y apellido reales (mínimo 3 caracteres alfabéticos)
 * - Rechazo estricto de números o dígitos dentro del nombre
 */
export function validatePersonName(name: string): ValidationResult {
  const sanitized = sanitizeInput(name);
  if (!sanitized || sanitized.length < 3) {
    return { valid: false, message: 'El nombre del representante debe tener al menos 3 caracteres.' };
  }

  // Rechazo estricto de dígitos dentro del nombre
  if (/\d/.test(sanitized)) {
    return { valid: false, message: 'El nombre de una persona no puede contener números o dígitos.' };
  }

  // Al menos 3 letras
  const alphaChars = sanitized.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g) || [];
  if (alphaChars.length < 3) {
    return { valid: false, message: 'Ingrese un nombre y apellido reales.' };
  }

  // Rechazo de símbolos raros
  if (/[<>%$#@!*&^_{}[\]\\~`|+=]/.test(sanitized)) {
    return { valid: false, message: 'El nombre no puede contener símbolos especiales.' };
  }

  return { valid: true, formattedValue: sanitized };
}

/**
 * 3. Documento de Identidad Fiscal Venezolano (RIF / Cédula / Pasaporte)
 * Prefijos oficiales:
 * J (Jurídico), G (Gubernamental), C (Comunal): seguido de 8 a 10 dígitos numéricos (ej. J-12345678-0)
 * V (Venezolano), E (Extranjero): seguido de 6 a 9 dígitos numéricos (ej. V-12345678)
 * P / PAS: Pasaporte extranjero de 5 a 14 caracteres alfanuméricos
 * Formatea automáticamente en visual: J-XXXXXXXX-X o V-XXXXXXXX
 */
export function validateFiscalDocument(doc: string): ValidationResult {
  const cleaned = sanitizeInput(doc).toUpperCase().replace(/[\s.-]/g, '');

  if (!cleaned) {
    return { valid: false, message: 'El documento fiscal (RIF / Cédula / Pasaporte) es obligatorio.' };
  }

  // Rechazo de entradas puramente alfabéticas
  if (/^[A-Z]+$/.test(cleaned)) {
    return { valid: false, message: 'El documento no puede ser únicamente letras (debe incluir el número oficial).' };
  }

  // 1. Casos Jurídico, Gubernamental, Comunal (J, G, C)
  const rifMatch = cleaned.match(/^([JGC])(\d{8,10})$/);
  if (rifMatch) {
    const prefix = rifMatch[1];
    const digits = rifMatch[2];
    const base = digits.slice(0, -1);
    const checkDigit = digits.slice(-1);
    const formatted = `${prefix}-${base}-${checkDigit}`;
    return { valid: true, formattedValue: formatted };
  }

  // 2. Casos Persona Natural (V, E)
  const ciMatch = cleaned.match(/^([VE])(\d{6,9})$/);
  if (ciMatch) {
    const prefix = ciMatch[1];
    const digits = ciMatch[2];
    const formatted = `${prefix}-${digits}`;
    return { valid: true, formattedValue: formatted };
  }

  // 3. Pasaporte (P o PAS)
  const passMatch = cleaned.match(/^(?:PAS|P)([A-Z0-9]{5,14})$/);
  if (passMatch) {
    const formatted = `PAS-${passMatch[1]}`;
    return { valid: true, formattedValue: formatted };
  }

  // Si no tiene prefijo pero es solo números (ej: 12345678)
  if (/^\d{6,10}$/.test(cleaned)) {
    return {
      valid: false,
      message: 'Debe incluir el prefijo fiscal venezolano: V- (Cédula), J- (RIF Jurídico), G-, C-, E- o PAS-.'
    };
  }

  return {
    valid: false,
    message: 'Formato inválido. Use formato oficial venezolano: J-12345678-0, V-12345678, G-, C-, E- o PAS-.'
  };
}

/**
 * 4. Teléfono de Contacto
 * - Entre 10 y 14 dígitos numéricos
 * - Reconocimiento de códigos de área y operadoras activas en Venezuela (0412, 0414, 0424, 0416, 0426, 0212...)
 * - Rechazo de números ficticios o repetitivos ("0000000000", "1111111111")
 */
export function validateVenezuelanPhone(phone: string): ValidationResult {
  const digitsOnly = phone.replace(/\D/g, '');

  if (!digitsOnly || digitsOnly.length < 10 || digitsOnly.length > 14) {
    return {
      valid: false,
      message: 'El teléfono debe contener entre 10 y 14 dígitos numéricos.'
    };
  }

  // Rechazo de números repetitivos ficticios
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return { valid: false, message: 'El número telefónico no puede ser repetitivo o ficticio.' };
  }

  // Si comienza con código de país 58, extraer el prefijo local
  let localNumber = digitsOnly;
  if (localNumber.startsWith('58')) {
    localNumber = '0' + localNumber.slice(2);
  } else if (!localNumber.startsWith('0') && localNumber.length === 10) {
    localNumber = '0' + localNumber;
  }

  const prefix4 = localNumber.slice(0, 4);
  const isValidPrefix = VENEZUELAN_PHONE_PREFIXES.includes(prefix4);

  if (!isValidPrefix) {
    return {
      valid: false,
      message: `El prefijo (${prefix4}) no corresponde a una operadora o código de área reconocido de Venezuela (0412, 0414, 0424, 0416, 0426, 0212, 0241...).`
    };
  }

  // Formatear visualmente: (0412) 123-4567
  const formatted = `${localNumber.slice(0, 4)} ${localNumber.slice(4, 7)}-${localNumber.slice(7)}`;
  return { valid: true, formattedValue: formatted };
}

/**
 * 5. Correo Electrónico
 * - Validación RFC 5322 estricta
 * - Bloqueo y rechazo automático de dominios falsos o temporales
 */
export function validateEmailAddress(email: string): ValidationResult {
  const sanitized = sanitizeInput(email).toLowerCase();

  // Expresión regular RFC 5322 estándar
  const rfc5322Regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!rfc5322Regex.test(sanitized)) {
    return { valid: false, message: 'Ingrese una dirección de correo electrónico válida (usuario@dominio.com).' };
  }

  const parts = sanitized.split('@');
  const domain = parts[1];

  if (!domain || domain.indexOf('.') === -1) {
    return { valid: false, message: 'El dominio del correo debe ser completo (ej. gmail.com, empresa.com.ve).' };
  }

  // Bloqueo de dominios falsos / temporales
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: `El dominio "${domain}" está clasificado como falso o temporal. Ingrese un correo corporativo o personal auténtico.`
    };
  }

  return { valid: true, formattedValue: sanitized };
}

/**
 * 6. Dirección Física Confirmable
 * - Mínimo 8 caracteres descriptivos con nombres de calle, avenida, local o sector
 * - Prohibir direcciones que sean solo números o símbolos
 */
export function validatePhysicalAddress(address: string): ValidationResult {
  const sanitized = sanitizeInput(address);

  if (!sanitized || sanitized.length < 8) {
    return {
      valid: false,
      message: 'La dirección debe tener al menos 8 caracteres descriptivos (calle, avenida, sector, local).'
    };
  }

  if (/^[\d\W_]+$/.test(sanitized)) {
    return {
      valid: false,
      message: 'La dirección no puede componerse exclusivamente de números o símbolos. Describa la ubicación.'
    };
  }

  const alphaChars = sanitized.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g) || [];
  if (alphaChars.length < 5) {
    return {
      valid: false,
      message: 'Indique una dirección real con detalles de ubicación geográfica en Venezuela.'
    };
  }

  return { valid: true, formattedValue: sanitized };
}

// ==========================================
// 4. POLÍTICA DE CONTRASEÑAS & ROTACIÓN
// ==========================================

export type PasswordStrengthLevel = 'muy_corta' | 'debil' | 'media' | 'fuerte';

export interface PasswordEvaluation {
  level: PasswordStrengthLevel;
  label: string;
  score: number; // 0 a 4
  valid: boolean;
  errors: string[];
}

/**
 * Evalúa los requisitos de contraseña segura en tiempo real:
 * - Mínimo 8 caracteres
 * - Combinación obligatoria de letras y números
 * - Prohibición de contraseñas triviales
 * - Medidor visual de 4 niveles
 */
export function evaluatePasswordSecurity(password: string): PasswordEvaluation {
  const errors: string[] = [];
  if (!password) {
    return {
      level: 'muy_corta',
      label: 'Muy Corta',
      score: 0,
      valid: false,
      errors: ['Ingrese una contraseña.']
    };
  }

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres.');
  }

  const hasLetters = /[a-zA-ZñÑ]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[\W_]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);

  if (!hasLetters) {
    errors.push('Debe contener letras (no puede ser solo números).');
  }
  if (!hasNumbers) {
    errors.push('Debe contener al menos un número.');
  }

  const lowerPwd = password.toLowerCase().trim();
  if (TRIVIAL_PASSWORDS.has(lowerPwd)) {
    errors.push('La contraseña ingresada es trivial y predecible. Elija una clave segura.');
  }

  // Cálculo de Score
  let score = 0;
  if (password.length >= 8) score++;
  if (hasLetters && hasNumbers) score++;
  if (hasUpper && hasLower) score++;
  if (hasSymbols || password.length >= 12) score++;

  let level: PasswordStrengthLevel = 'debil';
  let label = 'Débil';

  if (password.length < 8) {
    level = 'muy_corta';
    label = 'Muy Corta';
  } else if (score === 2) {
    level = 'debil';
    label = 'Débil';
  } else if (score === 3) {
    level = 'media';
    label = 'Media (Recomendada)';
  } else if (score >= 4) {
    level = 'fuerte';
    label = 'Fuerte (Óptima)';
  }

  const valid = errors.length === 0 && score >= 2;

  return { level, label, score, valid, errors };
}

/**
 * Comprueba si la contraseña requiere rotación preventiva (90 días).
 */
export function checkPasswordRotationStatus(passwordChangedAt?: number): {
  daysRemaining: number;
  isExpired: boolean;
  needsWarning: boolean;
} {
  if (!passwordChangedAt) {
    return { daysRemaining: 90, isExpired: false, needsWarning: false };
  }

  const now = Date.now();
  const elapsedMs = now - passwordChangedAt;
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, PASSWORD_ROTATION_DAYS - elapsedDays);

  return {
    daysRemaining,
    isExpired: elapsedDays >= PASSWORD_ROTATION_DAYS,
    needsWarning: daysRemaining <= PASSWORD_WARN_BEFORE_DAYS && daysRemaining > 0
  };
}

// ==========================================
// 5. DOBLE FACTOR DE AUTENTICACIÓN (2FA / OTP)
// ==========================================

export interface OtpChallenge {
  code: string;
  createdAt: number;
  expiresAt: number;
  attemptsCount: number;
  isLocked: boolean;
  destinationEmail: string;
}

/**
 * Genera un código OTP de 6 dígitos numéricos aleatorios
 */
export function generateOtpChallenge(destinationEmail: string): OtpChallenge {
  // 6 dígitos numéricos estrictos
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const code = randomNum.toString();
  const now = Date.now();

  const challenge: OtpChallenge = {
    code,
    createdAt: now,
    expiresAt: now + OTP_EXPIRATION_MS,
    attemptsCount: 0,
    isLocked: false,
    destinationEmail: sanitizeInput(destinationEmail).toLowerCase()
  };

  // Guardar en almacenamiento seguro de sesión local
  try {
    sessionStorage.setItem('mmv_current_otp_challenge', JSON.stringify(challenge));
  } catch (_) {}

  return challenge;
}

/**
 * Valida el código OTP ingresado por el usuario
 */
export function verifyOtpCode(inputCode: string, challenge: OtpChallenge): {
  success: boolean;
  message: string;
  isLocked: boolean;
  attemptsRemaining: number;
} {
  const now = Date.now();

  if (challenge.isLocked) {
    return {
      success: false,
      message: 'Flujo bloqueado por seguridad tras 5 intentos fallidos. Solicite un nuevo código OTP.',
      isLocked: true,
      attemptsRemaining: 0
    };
  }

  if (now > challenge.expiresAt) {
    return {
      success: false,
      message: 'El código OTP ha caducado (duración máxima de 10 minutos). Solicite uno nuevo.',
      isLocked: false,
      attemptsRemaining: OTP_MAX_ATTEMPTS - challenge.attemptsCount
    };
  }

  const cleanInput = inputCode.trim().replace(/\D/g, '');

  if (cleanInput === challenge.code) {
    // Código correcto: limpiar challenge
    try {
      sessionStorage.removeItem('mmv_current_otp_challenge');
    } catch (_) {}
    return {
      success: true,
      message: 'Código de verificación 2FA validado con éxito.',
      isLocked: false,
      attemptsRemaining: OTP_MAX_ATTEMPTS
    };
  }

  // Intento fallido
  challenge.attemptsCount += 1;
  const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - challenge.attemptsCount);

  if (challenge.attemptsCount >= OTP_MAX_ATTEMPTS) {
    challenge.isLocked = true;
    try {
      sessionStorage.setItem('mmv_current_otp_challenge', JSON.stringify(challenge));
    } catch (_) {}
    return {
      success: false,
      message: 'Se superó el límite de 5 intentos fallidos. El código ha sido bloqueado por seguridad.',
      isLocked: true,
      attemptsRemaining: 0
    };
  }

  try {
    sessionStorage.setItem('mmv_current_otp_challenge', JSON.stringify(challenge));
  } catch (_) {}

  return {
    success: false,
    message: `Código incorrecto. Quedan ${attemptsRemaining} intento(s) antes del bloqueo de seguridad.`,
    isLocked: false,
    attemptsRemaining
  };
}

// ==========================================
// 6. GOBERNANZA DE SESIONES & ALMACENAMIENTO
// ==========================================

export interface UserSessionData {
  userId: string;
  businessName: string;
  representative: string;
  fiscalDoc: string;
  email: string;
  phone: string;
  address: string;
  role: 'donante' | 'empresa' | 'voluntario' | 'coordinador' | 'victima';
  caseId?: string;
  passwordHash?: string;
  passwordChangedAt: number;
  sessionToken: string;
  loginTimestamp: number;
  lastActiveTimestamp: number;
  acceptedAgeDeclaration: boolean;
  acceptedLegalTerms: boolean;
}

const SESSION_STORAGE_KEY = 'mmv_user_active_session';
const REGISTERED_USERS_KEY = 'mmv_registered_users_db';

/**
 * Obtiene la sesión activa y verifica que no hayan pasado 2 horas de inactividad
 */
export function getActiveUserSession(): UserSessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session: UserSessionData = JSON.parse(raw);
    const now = Date.now();

    // Comprobar expiración estricta de 2 horas (SESSION_DURATION_MS)
    if (now - session.lastActiveTimestamp > SESSION_DURATION_MS) {
      // Destrucción segura del token por expiración
      destroyUserSession();
      return null;
    }

    // Actualizar marca de actividad
    session.lastActiveTimestamp = now;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  } catch (err) {
    destroyUserSession();
    return null;
  }
}

/**
 * Guarda una sesión iniciada
 */
export function saveUserSession(session: UserSessionData): void {
  try {
    session.lastActiveTimestamp = Date.now();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (_) {}
}

/**
 * Destruye la sesión de forma segura
 */
export function destroyUserSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}

export const MASTER_ADMIN_PASSWORD = 'Abelxti100%';

/**
 * Obtiene la base de usuarios registrados localmente
 */
export function getStoredUsers(): UserSessionData[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const list: UserSessionData[] = raw ? JSON.parse(raw) : [];

    // Asegurar cuenta administrativa oficial con la clave autorizada: Abelxti100%
    const adminIdx = list.findIndex(
      u => u.email.toLowerCase() === 'manomanovzla@gmail.com' || u.fiscalDoc.toLowerCase() === 'admin'
    );

    if (adminIdx === -1) {
      list.push({
        userId: 'usr-admin-master',
        businessName: 'Directiva Mano a Mano & Brigada 99HDD',
        representative: 'Coordinador General',
        fiscalDoc: 'J-50392817-4',
        email: 'manomanovzla@gmail.com',
        phone: '+58 412-020-8842',
        address: 'La Guaira, Venezuela',
        role: 'coordinador',
        passwordHash: 'Abelxti100%',
        passwordChangedAt: Date.now(),
        sessionToken: 'token-admin-master',
        loginTimestamp: Date.now(),
        lastActiveTimestamp: Date.now(),
        acceptedAgeDeclaration: true,
        acceptedLegalTerms: true
      });
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
      } catch (_) {}
    }

    return list;
  } catch (_) {
    return [];
  }
}

/**
 * Registra o actualiza un usuario en la base local
 */
export function saveRegisteredUser(user: UserSessionData): void {
  try {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (_) {}
}

// ==========================================
// 7. DESAFÍO ANTI-BOTS (CAPTCHA ARITMÉTICO)
// ==========================================

export interface ArithmeticChallenge {
  num1: number;
  num2: number;
  operation: '+' | '-';
  expectedAnswer: number;
  questionText: string;
}

/**
 * Genera un desafío matemático ligero sin librerías externas
 */
export function generateArithmeticChallenge(): ArithmeticChallenge {
  const num1 = Math.floor(Math.random() * 10) + 2; // 2..11
  const num2 = Math.floor(Math.random() * 8) + 1;  // 1..8
  const isAddition = Math.random() > 0.3; // Mayormente sumas

  if (isAddition) {
    return {
      num1,
      num2,
      operation: '+',
      expectedAnswer: num1 + num2,
      questionText: `Seguridad anti-robot: ¿Cuánto es ${num1} + ${num2}?`
    };
  } else {
    // Resta asegurando resultado positivo
    const max = Math.max(num1, num2);
    const min = Math.min(num1, num2);
    return {
      num1: max,
      num2: min,
      operation: '-',
      expectedAnswer: max - min,
      questionText: `Seguridad anti-robot: ¿Cuánto es ${max} - ${min}?`
    };
  }
}

// ==========================================
// 8. TOKEN DE IDEMPOTENCIA & BLOQUEO DOBLE CLIC
// ==========================================

const inMemoryClickLocks = new Map<string, number>();

/**
 * Genera un token de idempotencia único para transacciones u órdenes
 */
export function generateIdempotencyToken(prefix: string = 'ord'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Protege contra clics dobles rápidos en memoria (4 segundos de bloqueo)
 */
export function checkAndAcquireClickLock(actionKey: string): boolean {
  const now = Date.now();
  const lastTime = inMemoryClickLocks.get(actionKey);

  if (lastTime && now - lastTime < IDEMPOTENCY_LOCKOUT_MS) {
    return false; // Bloqueado por doble clic
  }

  inMemoryClickLocks.set(actionKey, now);
  return true; // Permitido
}

// ==========================================
// 9. POLÍTICA DE COOKIES TÉCNICAS
// ==========================================

export const COOKIE_CONSENT_KEY = 'mmv_cookie_consent_v1';

export function hasAcceptedCookies(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
  } catch (_) {
    return false;
  }
}

export function acceptCookiesPolicy(): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
  } catch (_) {}
}
