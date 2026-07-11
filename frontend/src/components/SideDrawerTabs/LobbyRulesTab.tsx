export default function LobbyRulesTab() {
  return (
    <div className="mx-2 my-6 space-y-4 pb-4">
      <section className="rounded-2xl border border-base-300 bg-base-100/70 p-4 shadow-md backdrop-blur-sm">
        <h5 className="mb-3 text-center font-semibold">How To Play</h5>
        <p className="text-sm text-center leading-relaxed text-base-content/80">
          Every player has a hidden role. Use what happens at night and what people say during discussion to figure
          out who the Werewolf is.
        </p>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100/70 p-4 shadow-md backdrop-blur-sm">
        <h5 className="mb-3 text-center font-semibold">Roles</h5>
        <ul className="space-y-2 text-sm">
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">Villager</span> A regular player with no special abilities.
          </li>
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">Werewolf</span> See other werewolves. Don't get voted out.
          </li>
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">Seer</span> At night, see the role of one player.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100/70 p-4 shadow-md backdrop-blur-sm">
        <h5 className="mb-3 text-center font-semibold">Round Flow</h5>
        <ul className="space-y-2 text-sm">
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">1. Pregame:</span> Everyone gets their secret role.
          </li>
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">2. Night:</span> Special roles perform abilities.
          </li>
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">3. Discussion:</span> Talk, bluff, and compare claims.
          </li>
          <li className="rounded-lg bg-base-200/70 px-3 py-2">
            <span className="font-semibold">4. Voting:</span> Eliminate who you think is the Werewolf.
          </li>
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 shadow-md">
          <h5 className="mb-2 text-center font-semibold text-success-content">Villager Win</h5>
          <p className="text-sm text-center">Vote out at least one Werewolf.</p>
        </div>
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 shadow-md">
          <h5 className="mb-2 text-center font-semibold text-error-content">Werewolf Win</h5>
          <p className="text-sm text-center">Survive the vote or mislead the village.</p>
        </div>
      </section>
    </div>
  );
}
