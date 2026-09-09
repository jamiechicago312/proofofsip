import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import type { Photo } from "../src/lib/schema";

const mocks = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ upload: mocks.upload }));
import { PhotoUpload } from "../src/app/admin/sips/photo-upload";

function Harness() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  return <PhotoUpload photos={photos} onChange={setPhotos} onBusyChange={setBusy} disabled={busy} />;
}

beforeEach(() => vi.resetAllMocks());

it("retains completed uploads after a later failure and supports descriptions/removal", async () => {
  mocks.upload.mockResolvedValueOnce({ url: "https://example.public.blob.vercel-storage.com/sips/a.jpg" }).mockRejectedValueOnce(new Error("offline"));
  const user = userEvent.setup();
  const { container } = render(<Harness />);
  await user.upload(screen.getByLabelText(/Choose photos/), [new File(["a"], "a.jpg", { type: "image/jpeg" }), new File(["b"], "b.jpg", { type: "image/jpeg" })]);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Photo upload failed"));
  expect(screen.getByLabelText(/Choose photos/)).toBeEnabled();
  await user.type(screen.getByLabelText("Description for photo 1"), "Cappuccino");
  const hidden = container.querySelector<HTMLInputElement>('input[name="photos"]')!;
  expect(JSON.parse(hidden.value)[0].alt).toBe("Cappuccino");
  await user.click(screen.getByRole("button", { name: "Remove photo 1" }));
  expect(hidden.value).toBe("[]");
});
