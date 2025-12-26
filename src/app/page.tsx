/**
 * Página raíz
 * El middleware se encarga de redirigir "/" al primer tab permitido según el rol
 * o a /auth-loading si la cookie de rol no está lista.
 * Esta página no debería verse nunca; solo existe como fallback vacío.
 */
export default function Home() {
  return null;
}
