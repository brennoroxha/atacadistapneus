import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const setConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem("cookie-consent", value);
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-industrial-blue text-white p-4 sm:p-5 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed flex-1 text-center sm:text-left">
            Usamos cookies para melhorar sua experiência, em conformidade com a LGPD.{" "}
            <Link to="/privacy" className="text-safety-orange underline font-semibold">
              Saiba mais
            </Link>
            .
          </p>
          <Button
            onClick={() => setConsent("accepted")}
            className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange/90 text-white font-bold tracking-wide px-6"
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}

