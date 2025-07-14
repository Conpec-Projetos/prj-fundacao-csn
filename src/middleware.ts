import { authAdmin } from "@/firebase/firebase-admin-config";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/login"];
const internoRoutes = ["/dashboard"];
const admRoutes = ["/", "/todos-projetos"]; // mesmo '/dashboard' sendo uma rota do adm tbm só podemos colocar em um dos arrays
const externoRoutes = ["/inicio-externo"];


export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  console.log("Cookie recebido:", sessionCookie);
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);
  const isInternoRoute = internoRoutes.includes(path);
  const isAdmRoute = admRoutes.includes(path);
  const isExternoRoute = externoRoutes.includes(path);

  if (!sessionCookie) {
    if (isPublicRoute) return NextResponse.next();

    if (url.pathname !== "/login") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next(); // já está no login, não faz nada
  }

  try {
    const decoded = await authAdmin.verifySessionCookie(sessionCookie);
    console.log("Usuário autenticado:", decoded);
    const isAdmin = decoded.userIntAdmin === true;
    const isUserExt = decoded.userExt === true;
    const emailVerified = decoded.email_verified;

    if (!emailVerified) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirecionamento de rotas públicas (já está logado)
    if (isPublicRoute) {
      if (isAdmin) 
        url.pathname = "/";
      else if (isUserExt) 
        url.pathname = "/inicio-externo";
      else 
        url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isExternoRoute && !isUserExt) {
      url.pathname = isAdmin ? "/" : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isInternoRoute && isUserExt) {
      url.pathname = "/inicio-externo";
      return NextResponse.redirect(url);
    }

    if (isAdmRoute && (!isAdmin || isUserExt)) {
      url.pathname = isUserExt ? "/inicio-externo" : "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Session cookie inválido:", error);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!api/_|_next/static|_next/image|favicon.ico).*)", // Ignora rotas específicas
    "/", "/login", "/signin", "/dashboard", "/inicio-externo", "/todos-projetos"
  ],
};
