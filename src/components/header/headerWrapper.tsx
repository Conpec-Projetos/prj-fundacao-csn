"use client";
// Importing necessary modules and components
import Header from "@/components/header/header";
import { usePathname } from "next/navigation";

// This component wraps the Header component and conditionally renders it based on the current route 
// (é para fazer com que determinadas páginas nn tenham header)
export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const noHeaderRoutes = ["/login", "/signin", "/inicio-externo", "/forms-cadastro", "/forms-acompanhamento"];
    const hasHeader = !noHeaderRoutes.includes(pathname); // Check if the header should be rendered

    return (
    <>
        {/* Render the Header only if hasHeader is true */}
        {hasHeader && <Header />}
        {/* Add padding only if the Header is rendered */}
        <div className={hasHeader ? "pt-[10vh]" : ""}>
        {children}
        </div>
    </>
    );
}