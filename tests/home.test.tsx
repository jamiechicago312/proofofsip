import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getHomeJournal: vi.fn() }));
vi.mock("@/lib/home", () => mocks);
import Home from "../src/app/page";

it("handles an empty journal without displaying a fabricated rating", async () => {
  mocks.getHomeJournal.mockResolvedValue({ recent: [], cafesVisited: 0, sipCount: 0, average: null });
  render(await Home());
  expect(screen.getByText(/journal is just getting started/)).toBeInTheDocument();
  expect(screen.getByText("—")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Explore the map/ })).toHaveAttribute("href", "/cafes?view=map");
});

it("links recent sips directly to their journal entries and preserves photo descriptions", async () => {
  mocks.getHomeJournal.mockResolvedValue({ cafesVisited: 1, sipCount: 1, average: 1, recent: [{ id: "sip-1", slug: "coffee", title: "Morning visit", cafeName: "Coffee", neighborhood: null, visitDate: new Date("2026-09-09T12:00:00Z"), overall: 1, photos: [{ url: "https://example.com/coffee.jpg", alt: "A cappuccino" }] }] });
  render(await Home());
  expect(screen.getByRole("heading", { name: "Morning visit" }).closest("a")).toHaveAttribute("href", "/cafes/coffee#sip-sip-1");
  expect(screen.getByRole("img", { name: "A cappuccino" })).toBeInTheDocument();
});
