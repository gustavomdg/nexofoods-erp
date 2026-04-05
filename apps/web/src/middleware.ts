import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Rotas que NÃO precisam de autenticação.
 * Tudo fora desta lista é protegido automaticamente.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  // Protege todas as outras rotas — redireciona para sign-in se não autenticado
  await auth.protect();

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclui arquivos estáticos e internos do Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre executa em API routes
    "/(api|trpc)(.*)",
  ],
};
