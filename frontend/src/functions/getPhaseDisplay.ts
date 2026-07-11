import { Round } from "../Interfaces";

export function getPhaseDisplay(currentPhase: Round["status"]) {
  switch (currentPhase) {
    case "PreGame":
      return { text: "Waiting for Players", icon: "⏳", color: "text-base-content" };
    case "Discussion":
      return { text: "Discussion Phase", icon: "💬", color: "text-primary" };
    case "Voting":
      return { text: "Voting Phase", icon: "🗳️", color: "text-secondary" };
    case "Night":
      return { text: "Night Phase", icon: "🌙", color: "text-accent" };
    default:
      return { text: currentPhase || "Loading...", icon: "🎭", color: "text-base-content" };
  }
}

export function setBrowserTabIcon(icon: string) {
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="50" font-size="48">${icon}</text></svg>`;
  const faviconHref = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

  let faviconLink = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null;
  if (!faviconLink) {
    faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    document.head.appendChild(faviconLink);
  }

  faviconLink.type = "image/svg+xml";
  faviconLink.href = faviconHref;
}