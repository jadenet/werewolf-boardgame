import { useEffect, useState } from "react";
import { AbilityResult, Player, Round } from "../../Interfaces";
import { getWinnerAnnouncement } from "../helpers/getWinnerAnnouncement";

export type AlertTone = "info" | "success" | "warning" | "error";

export type UiAlert = {
  tone: AlertTone;
  title: string;
  message?: string;
};

const ABILITY_RESULT_ALERT_DURATION_MS = 6000;

export default function useLobbyAlerts(
  currentPlayerId: Player["id"] | null,
  socketConnected: boolean,
  winner: Round["teamWinner"],
  latestAbilityResult: AbilityResult | null,
  dismissAbilityResult: () => void
) {
  const [uiAlert, setUiAlert] = useState<UiAlert | null>(null);

  useEffect(() => {
    if (!currentPlayerId) {
      setUiAlert(null);
      return;
    }

    if (!socketConnected) {
      setUiAlert({
        tone: "warning",
        title: "Reconnecting to lobby",
        message: "Trying to restore your connection to the server.",
      });
      return;
    }

    if (winner && winner.length > 0) {
      setUiAlert({
        tone: "success",
        title: "Game over",
        message: getWinnerAnnouncement(winner) ?? undefined,
      });
      return;
    }

    setUiAlert((currentAlert) => (currentAlert?.tone === "error" ? currentAlert : null));
  }, [currentPlayerId, socketConnected, winner]);

  useEffect(() => {
    if (!latestAbilityResult) {
      return;
    }

    setUiAlert({
      tone: latestAbilityResult.tone,
      title: latestAbilityResult.title,
      message: latestAbilityResult.message,
    });

    const timeoutId = window.setTimeout(() => {
      dismissAbilityResult();
      setUiAlert((currentAlert) => {
        if (
          currentAlert?.title === latestAbilityResult.title &&
          currentAlert?.message === latestAbilityResult.message
        ) {
          return null;
        }

        return currentAlert;
      });
    }, ABILITY_RESULT_ALERT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dismissAbilityResult, latestAbilityResult]);

  return [uiAlert, setUiAlert] as const;
}
