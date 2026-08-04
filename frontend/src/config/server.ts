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

export function wakeBackend() {
  if (!backendWakePromise) {
    backendWakePromise = fetch(buildServerUrl("/lobbies"), {
      method: "GET",
      cache: "no-store",
    })
      .then(() => undefined)
      .catch(() => undefined);
  }

  return backendWakePromise;
}
