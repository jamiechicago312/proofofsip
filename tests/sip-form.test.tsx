import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ saveSip: vi.fn() }));
vi.mock("../src/app/admin/sips/actions", () => ({ saveSip: mocks.saveSip }));

import { SipForm } from "../src/app/admin/sips/sip-form";

describe("sip form", () => {
  it("submits numeric ratings and retains writing after a failed save", async () => {
    mocks.saveSip.mockResolvedValue({ error: "Could not save your sip." });
    const user = userEvent.setup();
    render(<SipForm cafes={[{ id: "cafe-1", name: "Cafe" }]} />);
    await user.type(screen.getByLabelText("Title"), "Keep my title");
    await user.type(screen.getByLabelText(/Journal entry/), "Keep my writing");
    const form = screen.getByRole("button", { name: "Save sip" }).closest("form")!;
    const data = new FormData(form);
    expect(data.get("taste")).toBe("0");
    expect(data.get("foam")).toBe("0");
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not save"));
    expect(screen.getByLabelText("Title")).toHaveValue("Keep my title");
    expect(screen.getByLabelText(/Journal entry/)).toHaveValue("Keep my writing");
    expect(screen.getByRole("button", { name: "Save sip" })).toBeEnabled();
  });

  // Issue #29: a cafe's address/coordinates could only ever be entered once,
  // at creation, with no way to add or fix them afterward. Selecting an
  // existing cafe now pre-fills its current location for editing.
  it("pre-fills the selected cafe's address and coordinates, and swaps them when switching cafes", async () => {
    const user = userEvent.setup();
    render(
      <SipForm
        cafes={[
          { id: "cafe-1", name: "Cero", neighborhood: "Wicker Park", address: "1543 N Milwaukee Ave", lat: 41.9095, lng: -87.6712 },
          { id: "cafe-2", name: "Unmapped Cafe", neighborhood: null, address: "900 W Randolph St", lat: null, lng: null },
        ]}
      />,
    );

    expect(screen.getByLabelText("Neighborhood")).toHaveValue("Wicker Park");
    expect(screen.getByLabelText("Address")).toHaveValue("1543 N Milwaukee Ave");
    expect((screen.getByLabelText("Latitude") as HTMLInputElement).value).toBe("41.9095");
    expect((screen.getByLabelText("Longitude") as HTMLInputElement).value).toBe("-87.6712");

    await user.selectOptions(screen.getByLabelText("Cafe"), "cafe-2");

    expect(screen.getByLabelText("Address")).toHaveValue("900 W Randolph St");
    expect((screen.getByLabelText("Latitude") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Longitude") as HTMLInputElement).value).toBe("");
  });
});
