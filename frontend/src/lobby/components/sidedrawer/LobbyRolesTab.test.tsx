import { render, screen, waitFor } from "@testing-library/react";
import { Role } from "../../../Interfaces";
import LobbyRolesTab from "./LobbyRolesTab";

jest.mock("../../../app/config/server", () => ({
  buildServerUrl: (path: string) => path,
}));

const roleCatalog: Role[] = [
  { id: "werewolf", name: "Werewolf", description: "", image: "wolf.png", team: "Werewolves", member: "Werewolf", abilities: [] },
  { id: "mason", name: "Mason", description: "", image: "mason.png", team: "Villagers", member: "Villager", abilities: [] },
  { id: "seer", name: "Seer", description: "", image: "seer.png", team: "Villagers", member: "Villager", abilities: [] },
  { id: "villager", name: "Villager", description: "", image: "villager.png", team: "Villagers", member: "Villager", abilities: [] },
];

describe("LobbyRolesTab", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ["werewolf", "werewolf", "seer", "villager"],
    });
  });

  it("lists the lobby's selected roles and duplicate counts", () => {
    render(<LobbyRolesTab roleCatalog={roleCatalog} selectedRoleIds={["werewolf", "werewolf", "mason"]} playerCount={3} />);

    expect(screen.getByText("Selected for this lobby")).toBeInTheDocument();
    expect(screen.getByText("Werewolf")).toBeInTheDocument();
    expect(screen.getByText("Mason")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.queryByText("Villager")).not.toBeInTheDocument();
  });

  it("shows the recommended role pool for the current lobby size", async () => {
    render(<LobbyRolesTab roleCatalog={roleCatalog} selectedRoleIds={[]} playerCount={3} />);

    expect(screen.getByText("Recommended roles for 3 players")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(3));
    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.queryByText("Mason")).not.toBeInTheDocument();
  });
});