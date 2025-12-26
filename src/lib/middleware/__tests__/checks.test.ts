/**
 * Pruebas unitarias para funciones de checks del middleware
 */

import { checkAuthToken, checkRole, checkPublicRoute, checkRouteAccess } from "../checks";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "../config";
import type { Role } from "@/types/auth";

// Mock para RequestCookie
type MockRequestCookie = {
  value: string;
  name: string;
};

// Helper para crear cookies mock
function createMockCookies(cookies: Record<string, string>) {
  return {
    get: (name: string): MockRequestCookie | undefined => {
      const value = cookies[name];
      if (!value) return undefined;
      return { value, name };
    },
  };
}

describe("checkAuthToken", () => {
  it("debe retornar true cuando existe cookie de autenticación con valor", () => {
    const cookies = createMockCookies({
      [AUTH_COOKIE_NAME]: "valid-token-123",
    });

    expect(checkAuthToken(cookies)).toBe(true);
  });

  it("debe retornar false cuando la cookie no existe", () => {
    const cookies = createMockCookies({});

    expect(checkAuthToken(cookies)).toBe(false);
  });

  it("debe retornar false cuando la cookie existe pero está vacía", () => {
    const cookies = createMockCookies({
      [AUTH_COOKIE_NAME]: "",
    });

    expect(checkAuthToken(cookies)).toBe(false);
  });
});

describe("checkRole", () => {
  const validRoles: Role[] = ["ux_ui_designer", "product_designer", "product_design_lead", "admin"];

  it.each(validRoles)("debe retornar el rol válido %s", (role) => {
    const cookies = createMockCookies({
      [ROLE_COOKIE_NAME]: role,
    });

    expect(checkRole(cookies)).toBe(role);
  });

  it("debe retornar null cuando la cookie no existe", () => {
    const cookies = createMockCookies({});

    expect(checkRole(cookies)).toBeNull();
  });

  it("debe retornar null cuando la cookie está vacía", () => {
    const cookies = createMockCookies({
      [ROLE_COOKIE_NAME]: "",
    });

    expect(checkRole(cookies)).toBeNull();
  });

  it("debe retornar null cuando el rol es inválido", () => {
    const cookies = createMockCookies({
      [ROLE_COOKIE_NAME]: "invalid_role",
    });

    expect(checkRole(cookies)).toBeNull();
  });
});

describe("checkPublicRoute", () => {
  it("debe retornar true para rutas públicas", () => {
    expect(checkPublicRoute("/login")).toBe(true);
    expect(checkPublicRoute("/forbidden")).toBe(true);
    expect(checkPublicRoute("/no-access")).toBe(true);
  });

  it("debe retornar true para rutas que empiezan con /_next", () => {
    expect(checkPublicRoute("/_next/static/chunk.js")).toBe(true);
    expect(checkPublicRoute("/_next/image")).toBe(true);
  });

  it("debe retornar true para rutas que empiezan con /api", () => {
    expect(checkPublicRoute("/api/sesion")).toBe(true);
    expect(checkPublicRoute("/api/health")).toBe(true);
  });

  it("debe retornar true para rutas que empiezan con /favicon", () => {
    expect(checkPublicRoute("/favicon.ico")).toBe(true);
  });

  it("debe retornar false para rutas protegidas", () => {
    expect(checkPublicRoute("/dashboard")).toBe(false);
    expect(checkPublicRoute("/kit")).toBe(false);
    expect(checkPublicRoute("/ai-writing")).toBe(false);
  });
});

describe("checkRouteAccess", () => {
  it("debe permitir acceso a rutas no mapeadas (desconocidas)", () => {
    expect(checkRouteAccess("product_designer", "/unknown-route")).toBe(true);
    expect(checkRouteAccess("ux_ui_designer", "/random-path")).toBe(true);
  });

  describe("ux_ui_designer", () => {
    const role: Role = "ux_ui_designer";

    it("debe permitir acceso a rutas permitidas", () => {
      expect(checkRouteAccess(role, "/kit")).toBe(true);
      expect(checkRouteAccess(role, "/ai-writing")).toBe(true);
      expect(checkRouteAccess(role, "/ai-flow")).toBe(true);
      expect(checkRouteAccess(role, "/workbench")).toBe(true);
      expect(checkRouteAccess(role, "/strategy")).toBe(true);
    });

    it("debe denegar acceso a rutas no permitidas", () => {
      expect(checkRouteAccess(role, "/dashboard")).toBe(false);
      expect(checkRouteAccess(role, "/observer")).toBe(false);
      expect(checkRouteAccess(role, "/risk")).toBe(false);
    });
  });

  describe("product_designer", () => {
    const role: Role = "product_designer";

    it("debe permitir acceso a rutas permitidas", () => {
      expect(checkRouteAccess(role, "/kit")).toBe(true);
      expect(checkRouteAccess(role, "/ai-writing")).toBe(true);
    });

    it("debe denegar acceso a rutas no permitidas", () => {
      expect(checkRouteAccess(role, "/dashboard")).toBe(false);
      expect(checkRouteAccess(role, "/observer")).toBe(false);
    });
  });

  describe("admin", () => {
    const role: Role = "admin";

    it("debe permitir acceso a todas las rutas protegidas", () => {
      expect(checkRouteAccess(role, "/dashboard")).toBe(true);
      expect(checkRouteAccess(role, "/kit")).toBe(true);
      expect(checkRouteAccess(role, "/observer")).toBe(true);
      expect(checkRouteAccess(role, "/risk")).toBe(true);
    });
  });

  describe("superAdmin (role null)", () => {
    // Nota: superAdmin ya no es un rol, es un atributo booleano
    // Si role es null, checkRouteAccess debe retornar true (acceso total)
    it("debe permitir acceso a todas las rutas protegidas cuando role es null", () => {
      expect(checkRouteAccess(null, "/dashboard")).toBe(true);
      expect(checkRouteAccess(null, "/kit")).toBe(true);
      expect(checkRouteAccess(null, "/observer")).toBe(true);
      expect(checkRouteAccess(null, "/risk")).toBe(true);
    });
  });

  it("debe manejar subrutas correctamente (extrae la ruta base)", () => {
    expect(checkRouteAccess("product_designer", "/kit/subroute/123")).toBe(true);
    expect(checkRouteAccess("product_designer", "/dashboard/settings")).toBe(false);
  });
});
