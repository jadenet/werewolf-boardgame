import { useEffect } from "react";
import { getPhaseDisplay, setBrowserTabIcon } from "../helpers/getPhaseDisplay";
import { Round } from "../../Interfaces";

// Updates the browser tab favicon/title to reflect the current game phase.
export default function useBrowserTabPhaseIcon(currentPhase: Round["status"]) {
  useEffect(() => {
    const phaseInfo = getPhaseDisplay(currentPhase);
    setBrowserTabIcon(phaseInfo.icon);
    document.title = "Werewolf";

    return () => {
      document.title = "Werewolf";
    };
  }, [currentPhase]);
}
