import { useLocation } from "wouter";
import { useState } from "react";
import { wakeBackend } from "../app/config/server";
import { createLobbyRequest } from "../lobby/helpers/createLobbyRequest";

const images = [
  {
    src: "https://static.wikia.nocookie.net/werewolf-online/images/5/58/Villager.png",
    alt: "Villager avatar",
  },
  {
    src: "https://static.wikia.nocookie.net/werewolf-online/images/3/3c/Regular_Werewolf.png",
    alt: "Werewolf avatar",
  },
  {
    src: "https://static.wikia.nocookie.net/werewolf-online/images/e/ee/Seer.png",
    alt: "Seer avatar",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  return (
    <main className="flex items-center justify-center">
      <div className="hero py-10 rounded-3xl bg-base-100">
        <div className="hero-content text-center max-w-4xl">
          <div className="space-y-8">
            <div className="flex gap-12 justify-center items-center">
              {images.map((image) => {
                return (
                    <img src={image.src} alt={image.alt} className="w-34 h-34 md:w-36 md:h-36 object-contain" />
                
                );
              })}
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-primary">
                One Night Werewolf
              </h1>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
                A social deduction game full of bluffing, accusations, and never
                truly knowing whose on your side until it's too late!
              </p>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                  <p className="text-lg font-semibold text-base-content/80">
                    Setting up your lobby...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    className="btn btn-primary btn-lg px-12 py-4 text-lg font-semibold"
                    onClick={async (e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      setCreateError(null);
                      try {
                        if (!(await wakeBackend())) {
                          throw new Error("The game server did not become ready. Please try again.");
                        }
                        const lobby = await createLobbyRequest("Classic", []);
                        setLocation(`/lobbies/${lobby.id}`);
                      } catch (error) {
                        console.error("Error creating lobby:", error);
                        setCreateError(error instanceof Error ? error.message : "Unable to create a lobby. Please try again.");
                        setIsLoading(false);
                      }
                    }}
                  >
                    Create Lobby
                  </button>
                </div>
              )}
              {createError && (
                <p role="alert" className="mx-auto max-w-md text-sm text-error">
                  {createError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
