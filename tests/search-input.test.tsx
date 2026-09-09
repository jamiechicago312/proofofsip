import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => mocks }));
import { SearchInput } from "../src/app/cafes/search-input";

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

it("debounces searches and preserves the other form controls", () => {
  vi.useFakeTimers();
  render(<form><input type="hidden" name="tag" value="oat milk" /><SearchInput query="" /></form>);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "co" } });
  act(() => vi.advanceTimersByTime(200));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "coffee" } });
  act(() => vi.advanceTimersByTime(349));
  expect(mocks.replace).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/cafes?tag=oat+milk&q=coffee", { scroll: false });
});

it("cancels a pending search when another control submits the form", () => {
  vi.useFakeTimers();
  render(<form onSubmit={(event) => event.preventDefault()}><SearchInput query="" /></form>);
  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "coffee" } });
  fireEvent.submit(input.closest("form")!);
  act(() => vi.advanceTimersByTime(400));
  expect(mocks.replace).not.toHaveBeenCalled();
});
