/**
 * Sistema de Protección Perimetral, Anti-Flood y Rate Limiting
 * Protege contra spam, clicks excesivos, bots y peticiones infinitas de donación.
 */

interface RateLimitConfig {
  maxRequests: number;      // Máximo de acciones permitidas
  windowMs: number;         // Ventana de tiempo en milisegundos
  cooldownMs: number;       // Tiempo de bloqueo si excede el límite
}

interface RateLimitState {
  count: number;
  firstTimestamp: number;
  blockedUntil?: number;
}

const STORAGE_PREFIX = 'mmv_security_limiter_';

export class AntiAbuseGuard {
  /**
   * Verifica si una acción está permitida bajo la política de rate limit.
   * @param actionType Clave única para la acción (ej: 'donation_submit', 'preregistro')
   * @param config Configuración de límite
   * @returns { allowed: boolean, remainingMs: number, message?: string }
   */
  static checkLimit(
    actionType: string, 
    config: RateLimitConfig = { maxRequests: 5, windowMs: 60000, cooldownMs: 30000 }
  ): { allowed: boolean; remainingMs: number; message?: string } {
    if (typeof window === 'undefined') return { allowed: true, remainingMs: 0 };

    const key = `${STORAGE_PREFIX}${actionType}`;
    const now = Date.now();
    let state: RateLimitState = { count: 0, firstTimestamp: now };

    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch {
      // Ignorar fallback
    }

    // Verificar si está en período de enfriamiento
    if (state.blockedUntil && now < state.blockedUntil) {
      const remainingMs = state.blockedUntil - now;
      const seconds = Math.ceil(remainingMs / 1000);
      return {
        allowed: false,
        remainingMs,
        message: `Por motivos de seguridad y protección contra peticiones continuas, debes esperar ${seconds} segundo(s) antes de intentar nuevamente.`
      };
    }

    // Si la ventana expiró, reiniciar contador
    if (now - state.firstTimestamp > config.windowMs) {
      state.count = 1;
      state.firstTimestamp = now;
      state.blockedUntil = undefined;
    } else {
      state.count += 1;
    }

    // Verificar si excedió el umbral
    if (state.count > config.maxRequests) {
      state.blockedUntil = now + config.cooldownMs;
      sessionStorage.setItem(key, JSON.stringify(state));
      const seconds = Math.ceil(config.cooldownMs / 1000);
      return {
        allowed: false,
        remainingMs: config.cooldownMs,
        message: `Actividad inusualmente alta detectada. Sistema temporalmente en pausa durante ${seconds} segundos para resguardar la plataforma.`
      };
    }

    sessionStorage.setItem(key, JSON.stringify(state));
    return { allowed: true, remainingMs: 0 };
  }

  /**
   * Resetea el contador de seguridad tras una operación exitosa legítima
   */
  static reset(actionType: string) {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${actionType}`);
    } catch {}
  }

  /**
   * Valida integridad básica de entrada de donación (anti-payload / anti-caracteres maliciosos)
   */
  static sanitizeInput(str: string): string {
    return str
      .replace(/[<>]/g, '') // Eliminar tags HTML
      .trim();
  }

  /**
   * Detecta si el número de comprobante o referencia parece falso o repetido
   */
  static isValidReference(ref: string): boolean {
    const clean = ref.trim();
    if (clean.length < 3) return false;
    // Evitar secuencias obvias de prueba como "00000", "12345", "asdf"
    if (/^(0+|1+|12345+|test|asdf|prueba)$/i.test(clean)) return false;
    return true;
  }
}
