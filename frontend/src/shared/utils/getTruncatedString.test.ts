import getTruncatedString from "./getTruncatedString";

describe("getTruncatedString", () => {
  it("appends an ellipsis when the string exceeds the maximum", () => {
    expect(getTruncatedString("Werewolf", 4)).toBe("Were...");
  });

  it("leaves strings at or below the maximum unchanged", () => {
    expect(getTruncatedString("wolf", 4)).toBe("wolf");
    expect(getTruncatedString("owl", 4)).toBe("owl");
  });
});