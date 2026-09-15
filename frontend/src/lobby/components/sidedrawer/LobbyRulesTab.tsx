export default function LobbyRulesTab() {
  return (
    <div className="mx-2 my-4 space-y-4 pb-4">
      <section className="rounded-2xl border border-base-300 bg-base-100/50 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          How To Play
        </p>
        <p className="text-center text-sm leading-relaxed text-base-content/80">
          Every player has a hidden role. Use what happens at night and what people say during discussion to figure
          out who the Werewolf is.
        </p>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100/50 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Roles</p>
        <ul className="space-y-2 text-sm">
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">Villager</span> A regular player with no special abilities.
          </li>
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">Werewolf</span> See the other werewolves at night. If you're the only
            werewolf left, you get to peek at one other player's role instead.
          </li>
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">Seer</span> At night, see the role of one other player.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100/50 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Round Flow</p>
        <ul className="space-y-2 text-sm">
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">1. Pregame:</span> Everyone gets their secret role.
          </li>
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">2. Night:</span> Special roles perform abilities.
          </li>
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">3. Discussion:</span> Talk, bluff, and compare claims.
          </li>
          <li className="rounded-xl border border-base-300 bg-base-200/70 px-3 py-2 text-base-content">
            <span className="font-semibold">4. Voting:</span> Eliminate who you think is the Werewolf.
          </li>
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-success">
            Villager Win
          </p>
          <p className="text-center text-sm text-base-content/80">Vote out at least one Werewolf.</p>
        </div>
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-error">
            Werewolf Win
          </p>
          <p className="text-center text-sm text-base-content/80">Survive the vote or mislead the village.</p>
        </div>
      </section>
    </div>
  );
}
