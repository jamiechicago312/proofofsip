import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ map: vi.fn(), marker: vi.fn(), tileLayer: vi.fn(), divIcon: vi.fn() }));
vi.mock("leaflet", () => mocks);
import { CafeLocationMap } from "../src/components/cafe-location-map";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("centers a single pin on the cafe's coordinates, switches themes, and cleans up", async () => {
  const theme = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", () => theme);
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect = disconnect;
  });
  const map = { setView: vi.fn(), remove: vi.fn() };
  map.setView.mockReturnValue(map);
  mocks.map.mockReturnValue(map);
  const layer = { addTo: vi.fn(), on: vi.fn(), setUrl: vi.fn() };
  layer.addTo.mockReturnValue(layer);
  mocks.tileLayer.mockReturnValue(layer);
  const marker = { addTo: vi.fn() };
  marker.addTo.mockReturnValue(marker);
  mocks.marker.mockReturnValue(marker);

  const { unmount } = render(<CafeLocationMap name="Cero Coffee Co." lat={41.9095} lng={-87.6712} />);

  await waitFor(() => expect(mocks.marker).toHaveBeenCalledOnce());
  expect(mocks.marker).toHaveBeenCalledWith([41.9095, -87.6712], expect.objectContaining({ title: "Cero Coffee Co." }));
  expect(map.setView).toHaveBeenCalledWith([41.9095, -87.6712], 15);

  theme.addEventListener.mock.calls[0][1]();
  expect(layer.setUrl).toHaveBeenCalled();

  unmount();
  expect(map.remove).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(theme.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
});

it("shows a status message if the map tiles fail to load", async () => {
  const theme = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", () => theme);
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
  mocks.map.mockImplementation(() => {
    throw new Error("boom");
  });

  const { findByRole } = render(<CafeLocationMap name="Cero Coffee Co." lat={41.9095} lng={-87.6712} />);

  expect(await findByRole("status")).toHaveTextContent("Map tiles could not load");
});
