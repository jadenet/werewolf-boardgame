import { Socket } from "socket.io-client";
import { Role, Round } from "../../Interfaces";
import { registerAbilityEvents, registerPhaseEvents } from "./socketEventHandlers";

describe("socket role reveal events", () => {
  it("keeps private role markers and applies the public final role reveal", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const socket = {
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => handlers.set(event, handler)),
    } as unknown as Socket;
    const pendingAbilityPromptAckRef = { current: jest.fn() };
    const setRevealedPlayerRoleIds = jest.fn();
    const phaseSetters = {
      setCurrentPhase: jest.fn(),
      setLynchVotes: jest.fn(),
      setPlayerStatus: jest.fn(),
      setPhaseDeadline: jest.fn(),
      setGameStarted: jest.fn(),
      setWinner: jest.fn(),
      setCurrentPlayerRole: jest.fn(),
      setDiscussionSkipStatus: jest.fn(),
      setPlayAgainStatus: jest.fn(),
      setRevealedPlayerRoleIds,
      setRevealedCenterRoles: jest.fn(),
      setLatestAbilityResult: jest.fn(),
      setActiveAbilityPrompt: jest.fn(),
      setSelectedAbilityTargets: jest.fn(),
      pendingAbilityPromptAckRef,
    } as unknown as Parameters<typeof registerPhaseEvents>[1];

    registerPhaseEvents(socket, phaseSetters);
    handlers.get("playerRolesReveal")?.([["player-one", "mason"], ["player-two", "werewolf"]]);
    expect(setRevealedPlayerRoleIds).toHaveBeenCalledWith({
      "player-one": "mason",
      "player-two": "werewolf",
    });

    const setAbilityRoleMarkers = jest.fn();
    const abilitySetters = {
      setActiveAbilityPrompt: jest.fn(),
      setSelectedAbilityTargets: jest.fn(),
      setLatestAbilityResult: jest.fn(),
      setRevealedPlayerRoleIds: setAbilityRoleMarkers,
      pendingAbilityPromptAckRef,
    } as unknown as Parameters<typeof registerAbilityEvents>[1];
    registerAbilityEvents(socket, abilitySetters);
    handlers.get("knownRoleReveal")?.({ playerIds: ["mason-one"], roleId: "mason" });

    const roleUpdate = setAbilityRoleMarkers.mock.calls[0][0] as (
      previous: Record<string, Role["id"]>
    ) => Record<string, Role["id"]>;
    expect(roleUpdate({ "wolf-one": "werewolf" })).toEqual({
      "wolf-one": "werewolf",
      "mason-one": "mason",
    });

    handlers.get("phaseChange")?.("PreGame" as Round["status"]);
    expect(phaseSetters.setRevealedPlayerRoleIds).toHaveBeenLastCalledWith({});
    expect(phaseSetters.setWinner).toHaveBeenLastCalledWith(null);
    expect(phaseSetters.setLatestAbilityResult).toHaveBeenLastCalledWith(null);
  });
});