import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { db } from "@/lib/db";

beforeEach(async () => {
  await db.open();
  await db.transaction("rw", db.kids, db.sessions, db.state, async () => {
    await Promise.all([db.kids.clear(), db.sessions.clear(), db.state.clear()]);
  });

  vi.restoreAllMocks();
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
});

afterEach(async () => {
  cleanup();
  await db.transaction("rw", db.kids, db.sessions, db.state, async () => {
    await Promise.all([db.kids.clear(), db.sessions.clear(), db.state.clear()]);
  });
});
