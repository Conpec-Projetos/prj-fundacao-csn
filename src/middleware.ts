import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/login"];
const internoRoutes = ["/dashboard"];
const admRoutes = ["/", "/todos-projetos", "/detalhes-projeto"]; // mesmo '/dashboard' sendo uma rota do adm tbm só podemos colocar em um dos arrays
const externoRoutes = ["/inicio-externo"];

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  const url = request.nextUrl.clone();

  const path = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);
  const isInternoRoute = internoRoutes.includes(path);
  const isAdmRoute = admRoutes.includes(path);
  const isExternoRoute = externoRoutes.includes(path);

  if (!sessionCookie) { // Se o cookie nao existe apenas pode acessar rotas publicas
    if (isPublicRoute) 
      return NextResponse.next();
    // Se nao for uma rota publica e o cookie nao estiver definido redirecionamos para o login. Acho q sera util quando expirar
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const payload = JSON.parse(atob(sessionCookie.split(".")[1])); // Aqui pegamos dados uteis do token como o email e se o email foi verificado
    
    const emailVerified = payload.email_verified;
    const isAdmin = payload.userIntAdmin === true;
    const isUserExt = payload.userExt === true;

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
  // Apenas essas rotas são verificadas pelo middleware
  matcher: ["/", "/login", "/signin", "/dashboard", "/inicio-externo", "/todos-projetos", "/detalhes-projeto"]
};