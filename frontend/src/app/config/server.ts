export const SERVER_URL = import.meta.env.PROD
  ? "https://werewolf-backend.onrender.com"
  : "http://localhost:10000";

let backendWakePromise: Promise<void> | null = null;

export function buildServerUrl(path: string) {
  if (path.startsWith("/")) {
    return `${SERVER_URL}${path}`;
  }

  return `${SERVER_URL}/${path}`;
}

const WAKE_RETRY_ATTEMPTS = 5;
const WAKE_RETRY_DELAY_MS = 2000;

// Render's free tier spins the backend down after inactivity, so the very first request can
// hit a server that's still cold-starting. Retry a few times so lobby creation right after
// doesn't race a backend that isn't actually ready yet.
export function wakeBackend() {
  if (!backendWakePromise) {
    backendWakePromise = (async () => {
      for (let attempt = 0; attempt < WAKE_RETRY_ATTEMPTS; attempt++) {
        const isAwake = await fetch(buildServerUrl("/lobbies"), {
          method: "GET",
          cache: "no-store",
        })
          .then((response) => response.ok)
          .catch(() => false);

        if (isAwake) {
          return;
        }

        if (attempt < WAKE_RETRY_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY_MS));
        }
      }
    })();
  }

  return backendWakePromise;
}

