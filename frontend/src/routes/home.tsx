import { useLocation } from "wouter";
import { getRoleNames } from "../lobby/helpers/getRolesFromTeam";
import { useState } from "react";
import { buildServerUrl, wakeBackend } from "../app/config/server";

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
                      try {
                        await wakeBackend();
                        const response = await fetch(
                          buildServerUrl("/lobbies"),
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              roles: getRoleNames(),
                              gamemode: "Classic",
                            }),
                          },
                        );

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
                    Create Lobby
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
