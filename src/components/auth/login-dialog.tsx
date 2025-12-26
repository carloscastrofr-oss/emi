"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
  getIdToken,
} from "firebase/auth";
import { auth, isAuthAvailable } from "@/lib/firebase";
import { setAuthCookie } from "@/lib/auth-cookies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthAvailable() || !auth) {
      toast({
        title: "Error",
        description:
          "Firebase Auth no está configurado. Por favor, verifica las variables de entorno.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Obtener el ID token y guardarlo en la cookie
      // NOTA: NO establecer cookie de rol aquí - se establecerá después desde session-store
      const idToken = await getIdToken(userCredential.user, false);
      setAuthCookie(idToken);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });

      // Cerrar el diálogo primero
      onOpenChange(false);
      setEmail("");
      setPassword("");

      // Llamar onSuccess callback si existe
      if (onSuccess) {
        onSuccess();
      }

      // Redirigir a "/" inmediatamente
      // El middleware redirigirá a /auth-loading si la cookie de rol no está lista
      // La página /auth-loading esperará y redirigirá a la ruta correcta
      console.log("[Login Dialog] 🚀 Login exitoso, redirigiendo a /");
      window.location.href = "/";
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Error al iniciar sesión";

      // Mapeo de códigos de error de Firebase Auth a mensajes en español
      const errorMessages: Record<string, string> = {
        "auth/user-not-found": "Usuario no encontrado. Verifica el email o crea una cuenta nueva.",
        "auth/wrong-password": "Contraseña incorrecta. Intenta nuevamente.",
        "auth/invalid-email": "Email inválido. Verifica el formato del email.",
        "auth/user-disabled": "Esta cuenta ha sido deshabilitada. Contacta al administrador.",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
        "auth/invalid-credential":
          "Credenciales inválidas. El usuario no existe o la contraseña es incorrecta. Si no tienes cuenta, créala en Firebase Console o usa Google Sign-In.",
        "auth/operation-not-allowed":
          "El método de autenticación no está habilitado. Contacta al administrador.",
        "auth/weak-password": "La contraseña es muy débil. Usa una contraseña más segura.",
        "auth/email-already-in-use": "Este email ya está registrado.",
        "auth/network-request-failed": "Error de conexión. Verifica tu internet.",
      };

      if (authError.code && errorMessages[authError.code]) {
        errorMessage = errorMessages[authError.code]!;
      } else if (authError.code) {
        // Si es un error conocido pero no está en nuestro mapeo, mostrar el código
        errorMessage = `Error: ${authError.code}. ${authError.message || ""}`;
      } else {
        // Si no hay código, mostrar el mensaje del error
        errorMessage = authError.message ?? "Error desconocido al iniciar sesión";
      }

      console.error("Error de autenticación:", authError);

      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isAuthAvailable() || !auth) {
      toast({
        title: "Error",
        description:
          "Firebase Auth no está configurado. Por favor, verifica las variables de entorno.",
        variant: "destructive",
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Obtener el ID token y guardarlo en la cookie
      // NOTA: NO establecer cookie de rol aquí - se establecerá después desde session-store
      const idToken = await getIdToken(result.user, false);
      setAuthCookie(idToken);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });

      // Cerrar el diálogo primero
      onOpenChange(false);

      // Llamar onSuccess callback si existe
      if (onSuccess) {
        onSuccess();
      }

      // Redirigir a "/" inmediatamente
      // El middleware redirigirá a /auth-loading si la cookie de rol no está lista
      // La página /auth-loading esperará y redirigirá a la ruta correcta
      console.log("[Login Dialog] 🚀 Login exitoso (Google), redirigiendo a /");
      window.location.href = "/";
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Error al iniciar sesión con Google";
      if (authError.code === "auth/popup-closed-by-user") {
        errorMessage = "Ventana de autenticación cerrada";
      } else if (authError.code === "auth/popup-blocked") {
        errorMessage = "Ventana emergente bloqueada. Permite popups para este sitio";
      } else if (authError.code === "auth/cancelled-popup-request") {
        errorMessage = "Solo se puede abrir una ventana de autenticación a la vez";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>Ingresa tus credenciales para acceder a tu cuenta</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Formulario de email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión
            </Button>
          </form>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          {/* Botón de Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar con Google
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
