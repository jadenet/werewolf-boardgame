import { getPhaseAnnouncement, getPhaseDisplay, setBrowserTabIcon } from "./getPhaseDisplay";

describe("phase display helpers", () => {
  it.each([
    ["PreGame", "Waiting for Players", "text-base-content"],
    ["Discussion", "Discussion Phase", "text-primary"],
    ["Voting", "Voting Phase", "text-secondary"],
    ["Night", "Night Phase", "text-accent"],
    ["End", "End", "text-base-content"],
  ] as const)("displays %s with the expected label and color", (phase, text, color) => {
    const result = getPhaseDisplay(phase);

    expect(result.text).toBe(text);
    expect(result.color).toBe(color);
    expect(result.icon).toBeTruthy();
  });

  it("announces every game phase and returns null for unknown phases", () => {
    expect(getPhaseAnnouncement("PreGame")).toContain("Roles have been dealt");
    expect(getPhaseAnnouncement("Discussion")).toContain("Discuss");
    expect(getPhaseAnnouncement("Voting")).toContain("vote");
    expect(getPhaseAnnouncement("Night")).toContain("close your eyes");
    expect(getPhaseAnnouncement("End")).toBe("The round is over.");
  });

  it("creates or updates the browser favicon", () => {
    setBrowserTabIcon("🌙");
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');

    expect(favicon).not.toBeNull();
    expect(favicon?.type).toBe("image/svg+xml");
    expect(favicon?.href).toContain("data:image/svg+xml,");

    setBrowserTabIcon("☀️");
    expect(document.querySelectorAll('link[rel~="icon"]')).toHaveLength(1);
  });
});