import AdminHomeClient from "@/components/homeAdmin/homeClient";
import { IsADM } from "@/lib/isAdm";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
    // Somente usuarios internos e admins  chegam aqui
    return <AdminHomeClient />;
}