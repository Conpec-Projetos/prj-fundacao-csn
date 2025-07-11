import Image from "next/image";
import Botao_Logout from "../botoes/Botao_Logout";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { Moon, Sun } from "lucide-react";

export default function HeaderSecundario() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="fixed top-0 z-50 w-full bg-blue-fcsn2 dark:bg-blue-fcsn2 px-4 py-6 md:px-20 flex justify-between items-center shadow-lg">
      <Image
        src={darkLogo}
        alt="csn-logo"
        width={250}
        className=""
        priority
      />
      <div className="flex items-center gap-6">
        <button
          className="cursor-pointer transition-all duration-300"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <Moon size={20} className="text-white" />
          ) : (
            <Sun size={20} className="text-white" />
          )}
        </button>
          <div><Botao_Logout /></div>
      </div>
    </header>
  );
}
