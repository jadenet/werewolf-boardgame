import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "./home";
import { createLobbyRequest } from "../lobby/helpers/createLobbyRequest";
import { wakeBackend } from "../app/config/server";

const mockSetLocation = jest.fn();

jest.mock("wouter", () => ({
  useLocation: () => [mockSetLocation],
}));

jest.mock("../lobby/helpers/createLobbyRequest", () => ({
  createLobbyRequest: jest.fn(),
}));

jest.mock("../app/config/server", () => ({
  wakeBackend: jest.fn(),
}));

describe("Home lobby creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for a user create action and navigates only after the lobby is created", async () => {
    jest.mocked(wakeBackend).mockResolvedValue(true);
    jest.mocked(createLobbyRequest).mockResolvedValue({ status: "success", id: "lobby-1" });
    render(<Home />);

    expect(wakeBackend).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Create Lobby" }));

    await waitFor(() => expect(mockSetLocation).toHaveBeenCalledWith("/lobbies/lobby-1"));
    expect(wakeBackend).toHaveBeenCalledTimes(1);
  });

  it("does not redirect when the backend cannot be woken", async () => {
    jest.mocked(wakeBackend).mockResolvedValue(false);
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Create Lobby" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("did not become ready");
    expect(createLobbyRequest).not.toHaveBeenCalled();
    expect(mockSetLocation).not.toHaveBeenCalled();
  });
});