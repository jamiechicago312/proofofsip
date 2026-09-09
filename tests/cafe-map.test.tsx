import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ map: vi.fn(), marker: vi.fn(), tileLayer: vi.fn(), divIcon: vi.fn() }));
vi.mock("leaflet", () => mocks);
import { CafeMap } from "../src/components/cafe-map";

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("maps valid locations, escapes cafe names, switches themes, and cleans up", async () => {
  const theme = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", () => theme);
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
  const map = { setView: vi.fn(), fitBounds: vi.fn(), remove: vi.fn() };
  map.setView.mockReturnValue(map);
  mocks.map.mockReturnValue(map);
  const layer = { addTo: vi.fn(), on: vi.fn(), setUrl: vi.fn() };
  layer.addTo.mockReturnValue(layer);
  mocks.tileLayer.mockReturnValue(layer);
  const marker = { addTo: vi.fn(), bindPopup: vi.fn() };
  marker.addTo.mockReturnValue(marker);
  mocks.marker.mockReturnValue(marker);
  const { unmount } = render(<CafeMap cafes={[
    { name: "<img src=x>", slug: "cafe", lat: 0, lng: 0, averageRating: 1 },
    { name: "Unmapped", slug: "missing", lat: null, lng: null, averageRating: null },
  ]} />);
  await waitFor(() => expect(mocks.marker).toHaveBeenCalledOnce());
  const popup = marker.bindPopup.mock.calls[0][0] as HTMLElement;
  expect(popup.querySelector("img")).toBeNull();
  expect(popup.textContent).toContain("<img src=x>");
  expect(map.fitBounds).toHaveBeenCalled();
  theme.addEventListener.mock.calls[0][1]();
  expect(layer.setUrl).toHaveBeenCalled();
  unmount();
  expect(map.remove).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(theme.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
});
