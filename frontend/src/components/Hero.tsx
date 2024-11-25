import { useLocation } from "wouter";
import { getRoleNames } from "../functions/getRolesFromTeam";

const serverUrl =
  process.env.NODE_ENV === "production"
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
    src: "/images/roles/Serial_Killer.png",
    alt: "Serial Killer avatar",
  },
];

export default function Hero() {
  const [, setLocation] = useLocation();

  return (
    <div className="hero h-[90vh] bg-base-200">
      <div className="hero-content text-center">
        <div>
          <div className="flex gap-8 justify-center">
            {images.map((image) => {
              return (
                <img
                  src={image.src}
                  alt={image.alt}
                  key={image.alt}
                  className="w-52 aspect-square object-contain"
                />
              );
            })}
          </div>
          <h1 className="text-4xl font-bold py-12">Whose side are you on?</h1>
          <button
            className="btn btn-primary px-12 pt-6 pb-10"
            onClick={async (e) => {
              e.preventDefault();
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
            }}
          >
            Create a lobby
          </button>
        </div>
      </div>
    </div>
  );
}
