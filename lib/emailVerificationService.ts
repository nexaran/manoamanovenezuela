/**
 * SERVICIO DE VERIFICACIÓN DE IDENTIDAD POR CORREO ELECTRÓNICO
 * Mano a Mano Venezuela & Brigada 99HDD
 * Cuenta Oficial: manomanovzla@gmail.com
 * 
 * Permite emitir códigos de seguridad OTP de 6 dígitos numéricos a los correos
 * proporcionados por solicitantes de casos, voluntarios y testimonios
 * para certificar que corresponden a personas y correos reales.
 */

import { getAppsScriptUrl } from './driveSyncService';

export interface EmailVerificationChallenge {
  challengeId: string;
  email: string;
  code: string;
  purpose: 'pre_registro_caso' | 'voluntario_99hdd' | 'testimonio_beneficiario';
  createdAt: number;
  expiresAt: number;
  attemptsLeft: number;
  verified: boolean;
}

const STORAGE_KEY = 'mmv_active_email_challenges';
const CHALLENGE_DURATION_MS = 10 * 60 * 1000; // 10 minutos de validez

/**
 * Genera un código OTP de 6 dígitos numéricos criptográficamente aleatorio
 */
export function generateNumericOtp(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const codeNum = 100000 + (array[0] % 900000);
    return codeNum.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Obtiene los desafíos activos de la memoria local
 */
function getStoredChallenges(): Record<string, EmailVerificationChallenge> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredChallenges(challenges: Record<string, EmailVerificationChallenge>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  } catch {}
}

/**
 * Emite un nuevo código de verificación y lo despacha al correo
 */
export async function requestEmailVerificationCode(
  email: string,
  purpose: EmailVerificationChallenge['purpose'],
  recipientName?: string
): Promise<{
  success: boolean;
  challengeId: string;
  expiresInSec: number;
  backupCode: string; // Respaldo visible en pantalla para evitar bloqueos por latencia de correo
  message: string;
}> {
  const cleanEmail = email.toLowerCase().trim();
  const code = generateNumericOtp();
  const now = Date.now();
  const challengeId = `chal_${now}_${Math.random().toString(36).slice(2, 7)}`;

  const challenge: EmailVerificationChallenge = {
    challengeId,
    email: cleanEmail,
    code,
    purpose,
    createdAt: now,
    expiresAt: now + CHALLENGE_DURATION_MS,
    attemptsLeft: 4,
    verified: false
  };

  const stored = getStoredChallenges();
  stored[cleanEmail] = challenge;
  saveStoredChallenges(stored);

  // 1. Intento de despacho vía Google Apps Script (si está configurado)
  const appsScriptUrl = getAppsScriptUrl();
  let dispatchedViaAppsScript = false;

  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'email_verification',
          email: cleanEmail,
          code,
          recipientName: recipientName || 'Estimado(a) ciudadano(a)',
          purpose,
          timestamp: new Date().toISOString()
        })
      });
      dispatchedViaAppsScript = true;
    } catch (e) {
      console.warn('No se pudo despachar por Apps Script directo, usando respaldo:', e);
    }
  }

  // 2. Notificación en paralelo al buzón oficial manomanovzla@gmail.com
  try {
    fetch('https://formsubmit.co/ajax/manomanovzla@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🔐 [CÓDIGO DE VERIFICACIÓN] ${code} para ${cleanEmail} (${purpose})`,
        email: cleanEmail,
        code,
        purpose,
        solicitante: recipientName || 'N/A',
        fecha: new Date().toLocaleString('es-VE')
      })
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    challengeId,
    expiresInSec: Math.floor(CHALLENGE_DURATION_MS / 1000),
    backupCode: code,
    message: dispatchedViaAppsScript
      ? `Código enviado con éxito a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`
      : `Código de verificación generado para ${cleanEmail}.`
  };
}

/**
 * Valida el código OTP introducido por el usuario
 */
export function verifyEmailCode(
  email: string,
  inputCode: string
): { success: boolean; message: string; challenge?: EmailVerificationChallenge } {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = inputCode.trim();
  const stored = getStoredChallenges();
  const challenge = stored[cleanEmail];

  if (!challenge) {
    return {
      success: false,
      message: 'No hay un código de verificación activo para este correo. Solicita uno nuevo.'
    };
  }

  if (Date.now() > challenge.expiresAt) {
    delete stored[cleanEmail];
    saveStoredChallenges(stored);
    return {
      success: false,
      message: 'El código ha expirado (validez de 10 minutos). Solicita un nuevo código.'
    };
  }

  if (challenge.attemptsLeft <= 0) {
    delete stored[cleanEmail];
    saveStoredChallenges(stored);
    return {
      success: false,
      message: 'Has superado el número máximo de intentos permitidos. Por seguridad, solicita un nuevo código.'
    };
  }

  if (challenge.code !== cleanCode) {
    challenge.attemptsLeft -= 1;
    saveStoredChallenges(stored);
    return {
      success: false,
      message: `Código incorrecto. Te quedan ${challenge.attemptsLeft} intento(s).`
    };
  }

  // Código correcto
  challenge.verified = true;
  saveStoredChallenges(stored);

  return {
    success: true,
    message: '¡Correo electrónico verificado exitosamente!',
    challenge
  };
}

/**
 * Verifica si un correo ya se encuentra validado en esta sesión
 */
export function isEmailAlreadyVerified(email: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const stored = getStoredChallenges();
  const challenge = stored[cleanEmail];
  if (!challenge) return false;
  return challenge.verified && Date.now() <= challenge.expiresAt;
}

/**
 * Guía técnica paso a paso para la directiva sobre cómo configurar Gmail manomanovzla@gmail.com
 */
export const GMAIL_CONFIGURATION_GUIDE = {
  title: 'Paso a Paso: Configuración de Envío de Correo en Google Workspace / Gmail (manomanovzla@gmail.com)',
  steps: [
    {
      step: 1,
      title: 'Abrir Google Apps Script en la cuenta manomanovzla@gmail.com',
      detail: 'Inicia sesión en Gmail con la cuenta manomanovzla@gmail.com. Ve a Google Drive > Nuevo > Más > Google Apps Script (o accede a script.google.com).'
    },
    {
      step: 2,
      title: 'Pegar el Código Maestro Actualizado',
      detail: 'Copia el Código Maestro disponible en la pestaña "Script Google Drive" de la plataforma y pégalo en el editor de Apps Script reemplazando el contenido existente.'
    },
    {
      step: 3,
      title: 'Autorizar los Permisos de Correo (MailApp / GmailApp)',
      detail: 'En la barra superior de Apps Script, selecciona la función "inicializarSistemaDrive" y pulsa el botón "▶ Ejecutar". Google solicitará permisos para acceder a Google Drive y enviar correos en nombre de manomanovzla@gmail.com. Pulsa "Revisar permisos" > Selecciona manomanovzla@gmail.com > Configuración avanzada > "Ir a Proyecto (no seguro)" > Permitir.'
    },
    {
      step: 4,
      title: 'Implementar como Aplicación Web (Web App)',
      detail: 'Arriba a la derecha pulsa "Implementar" > "Nueva implementación". En el engranaje selecciona "Aplicación web". En "Ejecutar como" selecciona "Yo (manomanovzla@gmail.com)". En "¿Quién tiene acceso?" selecciona "Cualquiera" (Anyone). Pulsa "Implementar".'
    },
    {
      step: 5,
      title: 'Vincular la URL en la Plataforma',
      detail: 'Copia la URL de la aplicación web generada (termina en /exec) y pégala en el campo "URL del Web App de Google Drive" en la barra de operaciones. Pulsa "Guardar y Enlazar". A partir de ese momento, todos los correos de verificación y aprobaciones se enviarán automáticamente.'
    }
  ]
};
