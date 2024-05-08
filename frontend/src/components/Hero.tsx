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
          <div className="flex flex-col max-w-lg mx-auto lg:flex-row">
            <a
              className="btn font-semibold text-lg btn-primary grid flex-grow h-16 rounded-box"
              href="/servers"
            >
              Join a lobby
            </a>
            <div className="divider lg:divider-horizontal">OR</div>
            <a
              className="btn font-semibold text-lg btn-secondary grid flex-grow h-16 rounded-box"
              href="/createlobby"
            >
              Create your own
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
