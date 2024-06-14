import { Link } from "wouter";

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
                  className="w-52 aspect-square object-contain"
                />
              );
            })}
          </div>
          <h1 className="text-4xl font-bold py-12">Whose side are you on?</h1>
          <Link
            className="btn btn-primary px-12 pt-6 pb-10"
            href="/createlobby"
          >
            Create a lobby
          </Link>
        </div>
      </div>
    </div>
  );
}
