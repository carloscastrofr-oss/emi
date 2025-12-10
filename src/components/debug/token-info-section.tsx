"use client";

import { Shield, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAuthCookie, isTokenExpired, getTokenTimeToExpiry } from "@/lib/auth-cookies";

/**
 * Información del token decodificada
 */
interface TokenInfo {
  uid?: string;
  email?: string;
  exp?: number;
  iat?: number;
  auth_time?: number;
  name?: string;
}

/**
 * Decodifica un token JWT en el cliente
 */
function decodeTokenInBrowser(token: string): TokenInfo | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Decodificar en browser
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Formatea tiempo en milisegundos a formato legible
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expirado";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Formatea fecha a string legible
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/**
 * Sección que muestra información del token de autenticación
 */
export function TokenInfoSection() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTokenInfo = () => {
      const token = getAuthCookie();
      if (!token) {
        setTokenInfo(null);
        setTimeRemaining(0);
        setIsExpired(true);
        return;
      }

      // Decodificar token
      const decoded = decodeTokenInBrowser(token);
      setTokenInfo(decoded);

      // Verificar expiración
      const expired = isTokenExpired(token, 0);
      setIsExpired(expired);

      // Obtener tiempo restante
      const remaining = getTokenTimeToExpiry(token);
      setTimeRemaining(remaining ?? 0);
    };

    // Actualizar inmediatamente
    updateTokenInfo();

    // Actualizar cada segundo para mostrar countdown en tiempo real
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />
          Token de Autenticación
        </Label>
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-muted-foreground">No hay token disponible</span>
        </div>
      </div>
    );
  }

  const { uid, email, exp, iat, auth_time, name } = tokenInfo;
  const expirationDate = exp ? new Date(exp * 1000) : null;
  const issuedDate = iat ? new Date(iat * 1000) : null;
  const authDate = auth_time ? new Date(auth_time * 1000) : null;

  // Calcular la duración del token (normalmente 1 hora = 3600 segundos)
  const tokenDuration = iat && exp ? exp - iat : null;

  // Determinar estado del token
  let tokenStatus: "valid" | "expiring" | "expired";
  let statusColor: string;
  let statusIcon: React.ReactNode;
  let statusText: string;

  if (isExpired || (timeRemaining !== null && timeRemaining <= 0)) {
    tokenStatus = "expired";
    statusColor = "bg-red-500/10 text-red-600 border-red-500/30";
    statusIcon = <XCircle className="h-4 w-4" />;
    statusText = "Expirado";
  } else if (timeRemaining !== null && timeRemaining < 5 * 60 * 1000) {
    // Menos de 5 minutos
    tokenStatus = "expiring";
    statusColor = "bg-amber-500/10 text-amber-600 border-amber-500/30";
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusText = "Por expirar";
  } else {
    tokenStatus = "valid";
    statusColor = "bg-green-500/10 text-green-600 border-green-500/30";
    statusIcon = <CheckCircle2 className="h-4 w-4" />;
    statusText = "Válido";
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Shield className="h-4 w-4" />
        Token de Autenticación
      </Label>

      <div className="space-y-3 p-3 rounded-md bg-muted">
        {/* Estado del token */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Estado:</span>
          <Badge variant="outline" className={statusColor}>
            <span className="flex items-center gap-1">
              {statusIcon}
              {statusText}
            </span>
          </Badge>
        </div>

        {/* Tiempo restante */}
        {tokenInfo && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Tiempo restante:
            </span>
            <span
              className={`text-xs font-mono ${
                tokenStatus === "expired"
                  ? "text-red-600"
                  : tokenStatus === "expiring"
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        )}

        {/* Fecha de expiración */}
        {expirationDate && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Expira:</span>
            <span className="text-xs font-mono text-muted-foreground">
              {formatDate(expirationDate.getTime())}
            </span>
          </div>
        )}

        {/* Información del usuario del token */}
        {uid && (
          <div className="pt-2 border-t">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">UID:</span>
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                  {uid}
                </span>
              </div>
              {email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Email:</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {email}
                  </span>
                </div>
              )}
              {name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Nombre:</span>
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        {(issuedDate || authDate) && (
          <div className="pt-2 border-t space-y-1.5">
            {authDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Inicio de sesión:</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(authDate.getTime())}
                </span>
              </div>
            )}
            {issuedDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Token emitido:</span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(issuedDate.getTime())}
                  </span>
                  {tokenDuration && (
                    <span className="text-xs text-muted-foreground/60">
                      (válido por {Math.floor(tokenDuration / 60)} minutos)
                    </span>
                  )}
                </div>
              </div>
            )}
            {authDate && issuedDate && (
              <p className="text-xs text-muted-foreground/70 mt-1.5 pt-1.5 border-t border-border/50">
                💡 Los tokens de Firebase se renuevan automáticamente cada hora. El "Token emitido"
                muestra la fecha del token actual (que puede cambiar), mientras que "Inicio de
                sesión" muestra cuándo iniciaste sesión (constante durante toda la sesión).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
