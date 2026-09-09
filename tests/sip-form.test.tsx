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
});
