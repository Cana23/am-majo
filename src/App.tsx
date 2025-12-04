import { useEffect, useState } from "react";
import PokemonCard from "./components/PokemonCard";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function App() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("✅ Usuario aceptó instalar la app");
    } else {
      console.log("❌ Usuario rechazó instalar la app");
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">PokeAPI AM</h1>

        {canInstall && (
          <button
            onClick={handleInstall}
            className="bg-white text-blue-500 px-4 py-2 rounded font-bold hover:bg-gray-200 transition"
          >
            Instalar App
          </button>
        )}
      </div>
      <PokemonCard />
    </div>
  );
}

export default App;
