"use client";

import Header from "@/components/header/header";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase-config";

// This component wraps the Header component and conditionally renders it based on the current route 
// (é para fazer com que determinadas páginas nn tenham header)
export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const noHeaderRoutes = ["/login", "/signin"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Define o estado como true apenas se houver um usuário e o email for verificado
            setIsLoggedIn(!!user && !!user.emailVerified);
            setAuthChecked(true); // Marca que a verificação de auth foi feita
        });

        return () => unsubscribe();
    }, []);

    let showHeader = false;

    if (authChecked) {
        if (pathname.startsWith('/forms-cadastro')) {
            // No forms de cadastro o header só aparece se o usuário estiver logado
            showHeader = isLoggedIn;
        } else {
            showHeader = !noHeaderRoutes.some(route => pathname.startsWith(route));
        }
    }

    return (
    <>
        {/* Render the Header only if hasHeader is true */}
        {showHeader && <Header/>}
        {/* Add padding only if the Header is rendered */}
        <div className={showHeader ? "pt-[10vh]" : ""}>
        {children}
        </div>
    </>
    );
}