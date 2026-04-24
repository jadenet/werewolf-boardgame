import { useLocation } from "wouter";
import { getRoleNames } from "../functions/getRolesFromTeam";
import { useState } from "react";

const serverUrl =
  import.meta.env.PROD
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";

const images = [
  {
    src: "/images/roles/Villager.png",
    alt: "Villager avatar",
  },
  {
    src: "/images/roles/Werewolf.png",
    alt: "Werewolf avatar",
  },
  {
    src: "/images/roles/Doppelganger.png",
    alt: "Doppelganger avatar",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <main className="min-h-[84vh] flex items-center justify-center p-4">
      <div className="hero min-h-[80vh] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl shadow-2xl backdrop-blur-sm border border-base-300/50">
        <div className="hero-content text-center max-w-4xl">
          <div className="space-y-8">
            <div className="flex gap-8 justify-center animate-bounce">
              {images.map((image, index) => {
                return (
                  <div
                    key={image.alt}
                    className="avatar"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-lg hover:scale-110 transition-transform duration-300">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                One Night Werewolf
              </h1>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
                Experience the thrilling social deduction game where villagers and werewolves battle under the cover of night.
                Trust no one, suspect everyone!
              </p>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                  <p className="text-lg font-semibold text-base-content/80">
                    Creating your mystical lobby...
                  </p>
                  <p className="text-sm text-base-content/60">
                    This may take up to 30 seconds
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    className="btn btn-primary btn-lg px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={async (e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      try {
                        const response = await fetch(serverUrl + "/lobbies", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            roles: getRoleNames(),
                            gamemode: "Classic",
                          }),
                        });

                        const responseJson = await response.json();

                        if (responseJson.status === "success") {
                          setLocation(`/lobbies/${responseJson.id}`);
                        }
                      } catch (error) {
                        console.error("Error creating lobby:", error);
                        setIsLoading(false);
                      }
                    }}
                  >
                    🏰 Create Lobby
                  </button>
                  <p className="text-sm text-base-content/50">
                    Or join an existing game with a lobby code
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
