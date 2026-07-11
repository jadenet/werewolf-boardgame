export const SERVER_URL = import.meta.env.PROD
  ? "https://werewolf-backend.onrender.com"
  : "http://localhost:10000";

export function buildServerUrl(path: string) {
  if (path.startsWith("/")) {
    return `${SERVER_URL}${path}`;
  }

  return `${SERVER_URL}/${path}`;
}