export default function LobbyHowToPlayTab() {
  return (
    <div className="flex flex-col gap-4 mx-2 my-8">
      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h4 className="text-lg font-semibold mb-2 text-center">How To Play</h4>
        <p className="text-sm text-base-content/80 text-center">
          Work out who the Werewolf is before the game ends.
        </p>
      </div>

      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h5 className="font-semibold mb-2">Game Flow</h5>
        <ol className="list-decimal pl-5 text-sm space-y-2">
          <li><span className="font-medium">PreGame:</span> Everyone gets their secret role.</li>
          <li><span className="font-medium">Night:</span> Special roles perform abilities.</li>
          <li><span className="font-medium">Discussion:</span> Talk, bluff, and share clues.</li>
          <li><span className="font-medium">Voting:</span> Vote who to eliminate.</li>
        </ol>
      </div>

      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h5 className="font-semibold mb-2">Win Conditions</h5>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li><span className="font-medium">Villagers:</span> Eliminate all Werewolves.</li>
          <li><span className="font-medium">Werewolves:</span> Survive the vote.</li>
          <li><span className="font-medium">Solo roles:</span> Complete their personal objective.</li>
        </ul>
      </div>

      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h5 className="font-semibold mb-2">Tips</h5>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Use discussion chat to pressure suspicious players.</li>
          <li>Track claims and contradictions between phases.</li>
          <li>Check your role in the bottom status bar at any time.</li>
        </ul>
      </div>
    </div>
  );
}
