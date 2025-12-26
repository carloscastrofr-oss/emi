/**
 * Pruebas unitarias para funciones helper de sesión
 */

import { hasUserAccess, applyDebugRoleOverride } from "../session-helpers";
import type { SessionData } from "@/types/session";
import type { Role } from "@/types/auth";

// Helper para crear SessionData de prueba
function createSessionData(overrides: Partial<SessionData> = {}): SessionData {
  return {
    user: {
      id: "user-123",
      email: "test@example.com",
      displayName: "Test User",
      photoUrl: null,
      role: "product_designer",
      superAdmin: false,
      preferences: null,
      emailVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
    },
    clients: [],
    defaultClient: null,
    defaultWorkspace: null,
    ...overrides,
  };
}

describe("hasUserAccess", () => {
  it("debe retornar true cuando el usuario tiene rol global", () => {
    const sessionData = createSessionData({
      user: {
        ...createSessionData().user,
        role: "product_designer",
      },
      clients: [],
    });

    expect(hasUserAccess(sessionData)).toBe(true);
  });

  it("debe retornar true cuando el usuario tiene acceso a al menos un cliente (sin rol global)", () => {
    const sessionData = createSessionData({
      user: {
        ...createSessionData().user,
        role: null, // Sin rol global
      },
      clients: [
        {
          id: "client-1",
          name: "Client 1",
          slug: "client-1",
          plan: "free",
          createdAt: new Date(),
          workspaces: [] as never[],
        },
      ],
    });

    expect(hasUserAccess(sessionData)).toBe(true);
  });

  it("debe retornar true cuando el usuario tiene rol Y clientes", () => {
    const sessionData = createSessionData({
      user: {
        ...createSessionData().user,
        role: "admin",
      },
      clients: [
        {
          id: "client-1",
          name: "Client 1",
          slug: "client-1",
          plan: "free",
          createdAt: new Date(),
          workspaces: [] as never[],
        },
      ],
    });

    expect(hasUserAccess(sessionData)).toBe(true);
  });

  it("debe retornar false cuando el usuario no tiene rol ni clientes", () => {
    const sessionData = createSessionData({
      user: {
        ...createSessionData().user,
        role: null, // Sin rol global
      },
      clients: [],
    });

    expect(hasUserAccess(sessionData)).toBe(false);
  });

  it("debe retornar true para cualquier rol válido", () => {
    const roles: Role[] = ["ux_ui_designer", "product_designer", "product_design_lead", "admin"];

    roles.forEach((role) => {
      const sessionData = createSessionData({
        user: {
          ...createSessionData().user,
          role,
        },
        clients: [],
      });

      expect(hasUserAccess(sessionData)).toBe(true);
    });
  });

  it("debe retornar true cuando el usuario es superAdmin (superAdmin === true)", () => {
    const sessionData = createSessionData({
      user: {
        ...createSessionData().user,
        role: null, // superAdmin no tiene rol específico
        superAdmin: true,
      },
      clients: [],
    });

    expect(hasUserAccess(sessionData)).toBe(true);
  });
});

describe("applyDebugRoleOverride", () => {
  const originalSessionData = createSessionData({
    user: {
      ...createSessionData().user,
      role: "product_designer",
    },
  });

  it("debe retornar los datos originales cuando no hay override activo", () => {
    const debugStorage = JSON.stringify({
      state: {
        useRoleOverride: false,
        overrideRole: null,
      },
    });

    const result = applyDebugRoleOverride(originalSessionData, debugStorage);
    expect(result.user.role).toBe("product_designer");
  });

  it("debe retornar los datos originales cuando useRoleOverride es true pero overrideRole es null", () => {
    const debugStorage = JSON.stringify({
      state: {
        useRoleOverride: true,
        overrideRole: null,
      },
    });

    const result = applyDebugRoleOverride(originalSessionData, debugStorage);
    expect(result.user.role).toBe("product_designer");
  });

  it("debe aplicar el override cuando useRoleOverride es true y overrideRole está definido", () => {
    const debugStorage = JSON.stringify({
      state: {
        useRoleOverride: true,
        overrideRole: "admin",
      },
    });

    const result = applyDebugRoleOverride(originalSessionData, debugStorage);
    expect(result.user.role).toBe("admin");
    // Verificar que otros campos no cambian
    expect(result.user.id).toBe(originalSessionData.user.id);
    expect(result.user.email).toBe(originalSessionData.user.email);
  });

  it("debe manejar errores de parsing sin fallar", () => {
    const invalidStorage = "invalid json";

    const result = applyDebugRoleOverride(originalSessionData, invalidStorage);
    expect(result.user.role).toBe("product_designer");
  });

  it("debe retornar datos originales cuando debugStorage es null", () => {
    const result = applyDebugRoleOverride(originalSessionData, null);
    expect(result.user.role).toBe("product_designer");
  });

  it("debe aplicar override para diferentes roles", () => {
    const roles: Role[] = ["ux_ui_designer", "admin", "product_designer"];

    roles.forEach((role) => {
      const debugStorage = JSON.stringify({
        state: {
          useRoleOverride: true,
          overrideRole: role,
        },
      });

      const result = applyDebugRoleOverride(originalSessionData, debugStorage);
      expect(result.user.role).toBe(role);
    });
  });
});
