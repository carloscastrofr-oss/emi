/**
 * Pruebas unitarias para funciones de configuración del middleware
 */

import { getFirstAllowedRoute, isIgnoredRoute, PUBLIC_ROUTES } from "../config";
import type { Role } from "@/types/auth";

describe("isIgnoredRoute", () => {
  it("debe retornar true para rutas públicas", () => {
    PUBLIC_ROUTES.forEach((route) => {
      expect(isIgnoredRoute(route)).toBe(true);
    });
  });

  it("debe retornar true para rutas que empiezan con /_next", () => {
    expect(isIgnoredRoute("/_next/static/chunk.js")).toBe(true);
    expect(isIgnoredRoute("/_next/image/abc.jpg")).toBe(true);
    expect(isIgnoredRoute("/_next/data/page.json")).toBe(true);
  });

  it("debe retornar true para rutas que empiezan con /api", () => {
    expect(isIgnoredRoute("/api/sesion")).toBe(true);
    expect(isIgnoredRoute("/api/health")).toBe(true);
    expect(isIgnoredRoute("/api/users/123")).toBe(true);
  });

  it("debe retornar true para rutas que empiezan con /favicon", () => {
    expect(isIgnoredRoute("/favicon.ico")).toBe(true);
    expect(isIgnoredRoute("/favicon.png")).toBe(true);
  });

  it("debe retornar false para rutas protegidas", () => {
    expect(isIgnoredRoute("/dashboard")).toBe(false);
    expect(isIgnoredRoute("/kit")).toBe(false);
    expect(isIgnoredRoute("/ai-writing")).toBe(false);
    expect(isIgnoredRoute("/")).toBe(false);
  });
});

describe("getFirstAllowedRoute", () => {
  it("debe retornar /kit para ux_ui_designer (primer tab permitido)", () => {
    const role: Role = "ux_ui_designer";
    expect(getFirstAllowedRoute(role)).toBe("/kit");
  });

  it("debe retornar /kit para product_designer (primer tab permitido)", () => {
    const role: Role = "product_designer";
    expect(getFirstAllowedRoute(role)).toBe("/kit");
  });

  it("debe retornar /kit para product_design_lead (primer tab permitido)", () => {
    const role: Role = "product_design_lead";
    expect(getFirstAllowedRoute(role)).toBe("/kit");
  });

  it("debe retornar /dashboard para admin (primer tab permitido)", () => {
    const role: Role = "admin";
    expect(getFirstAllowedRoute(role)).toBe("/dashboard");
  });

  it("debe retornar /dashboard para superAdmin (role null)", () => {
    // Nota: superAdmin ya no es un rol, es un atributo booleano
    // Cuando role es null (superAdmin), debe retornar /dashboard
    expect(getFirstAllowedRoute(null)).toBe("/dashboard");
  });

  it("debe retornar una ruta válida para todos los roles", () => {
    const roles: Role[] = ["ux_ui_designer", "product_designer", "product_design_lead", "admin"];

    roles.forEach((role) => {
      const route = getFirstAllowedRoute(role);
      expect(route).toBeTruthy();
      expect(typeof route).toBe("string");
      expect(route.startsWith("/")).toBe(true);
    });
  });
});
