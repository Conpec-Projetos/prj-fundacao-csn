"use client";

import { useEffect, useState } from "react";

interface GreetingsProps {
    userName: string;
}

const Greetings: React.FC<GreetingsProps> = ({ userName }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Atualizar data e hora
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long" as const,
        year: "numeric" as const,
        month: "long" as const,
        day: "numeric" as const,
        hour: "2-digit" as const,
        minute: "2-digit" as const,
      };
      setCurrentTime(now.toLocaleDateString("pt-BR", options));

      // Definir saudação com base na hora do dia
      const hour = now.getHours();
      if (hour < 12) setGreeting("Bom dia");
      else if (hour < 18) setGreeting("Boa tarde");
      else setGreeting("Boa noite");
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          {greeting}, {userName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-300">{currentTime}</p>
      </div>
    </div>
  );
};

export default Greetings;
