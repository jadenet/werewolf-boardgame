export default function handleAbilities(lobby, roles, phase) {
    if (phase === "Voting") {
    } else if (phase === "Night") {
    }
    lobby.players
      .filter((player) => player.status === "Alive")
      .map((player) => {
        const playerRole = roles.find((role) => {
          return role.name === player.role;
        });

        player.abilities.map((ability: any, index: any) => {
          if (
            (ability.phase === phase ||
              (ability.phase === "Day" &&
                ["Discussion", "Voting"].includes(phase))) &&
            (!ability.useLimit || ability.useLimit > 0)
          ) {
            lobby.players[
              lobby.players.findIndex((a) => a === player)
            ].abilities[index].enabled = true;
            // check other ability conditions
            // playerRole.abilities[index].useLimit -= 1;
          } else {
            lobby.players[
              lobby.players.findIndex((a) => a === player)
            ].abilities[index].enabled = false;
            // lock out ability
          }
        });
      });
  }