import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { db, initializeAppState } from "@/lib/db";

async function seedKids() {
  await db.kids.bulkAdd([
    { id: "kid-1", name: "Alice", createdAt: 1 },
    { id: "kid-2", name: "Beau", createdAt: 2 },
    { id: "kid-3", name: "Casey", createdAt: 3 },
  ]);
}

async function seedTwoKids() {
  await db.kids.bulkAdd([
    { id: "kid-1", name: "Alice", createdAt: 1 },
    { id: "kid-2", name: "Beau", createdAt: 2 },
  ]);
}

describe("Home lucky flow", () => {
  it("shows the lucky button for the second kid before it has been used", async () => {
    await initializeAppState();
    await seedKids();

    render(<Home />);

    expect(
      await screen.findByRole("button", { name: "I'm feeling lucky for Beau" }),
    ).toBeInTheDocument();
  });

  it("uses the lucky action to reshuffle the order and persist the state", async () => {
    await initializeAppState();
    await seedKids();
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<Home />);

    const luckyButton = await screen.findByRole("button", {
      name: "I'm feeling lucky for Beau",
    });

    await userEvent.click(luckyButton);

    await waitFor(async () => {
      expect(await db.state.get("singleton")).toMatchObject({
        currentOrder: ["kid-2", "kid-3", "kid-1"],
        currentLuckyUsed: true,
        currentLuckyByKidId: "kid-2",
      });
    });

    expect(
      screen.queryByRole("button", { name: "I'm feeling lucky for Casey" }),
    ).not.toBeInTheDocument();
  });

  it("changes the order even when there are only two kids", async () => {
    await initializeAppState();
    await seedTwoKids();
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    render(<Home />);

    await userEvent.click(
      await screen.findByRole("button", { name: "I'm feeling lucky for Beau" }),
    );

    await waitFor(async () => {
      expect(await db.state.get("singleton")).toMatchObject({
        currentOrder: ["kid-2", "kid-1"],
        currentLuckyUsed: true,
        currentLuckyByKidId: "kid-2",
      });
    });

    expect(await screen.findByRole("heading", { name: "Beau" })).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });
});
