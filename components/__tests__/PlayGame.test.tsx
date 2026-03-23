import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PlayGame } from "../PlayGame";
import * as huntContracts from "@/lib/contracts/hunt";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div data-testid="next-image" aria-label={alt} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("../icons/Share", () => ({
  default: () => <span>Share</span>,
}));

vi.mock("../icons/Replay", () => ({
  default: () => <span>Replay</span>,
}));

vi.mock("../HuntCards", () => ({
  HuntCards: ({
    hunts,
    isLoading,
  }: {
    hunts: Array<{ title: string } | undefined>;
    isLoading?: boolean;
  }) => (
    <div data-testid="hunt-cards">
      {isLoading ? "Loading" : hunts[0]?.title ?? "No Hunt"}
    </div>
  ),
}));

vi.mock("@/components/PlayerProgressPanel", () => ({
  PlayerProgressPanel: ({
    cluesSolved,
    totalClues,
    totalPoints,
  }: {
    cluesSolved: number;
    totalClues: number;
    totalPoints: number;
  }) => (
    <div data-testid="player-progress">
      {cluesSolved}/{totalClues}/{totalPoints}
    </div>
  ),
}));

vi.mock("@/lib/contracts/hunt", () => ({
  get_hunt: vi.fn(),
  get_clue_info: vi.fn(),
}));

describe("PlayGame", () => {
  const defaultProps = {
    hunts: [
      {
        id: 1,
        title: "First clue",
        description: "Clue description",
        link: "",
        code: "",
      },
    ],
    gameName: "Test Hunt",
    onExit: vi.fn(),
    onGameComplete: vi.fn(),
    gameCompleteModal: null,
    huntId: 7,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the fetch error before exiting the play screen", async () => {
    vi.mocked(huntContracts.get_hunt).mockRejectedValue(new Error("Failed to fetch clues"));

    const user = userEvent.setup();

    render(<PlayGame {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch clues")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Go Back" }));

    expect(defaultProps.onExit).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText("Failed to fetch clues")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Play Test Hunt")).toBeInTheDocument();
  });
});
