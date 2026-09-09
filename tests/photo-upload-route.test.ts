import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), handleUpload: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@vercel/blob/client", () => ({ handleUpload: mocks.handleUpload }));
import { POST } from "../src/app/api/photos/upload/route";

describe("photo upload authorization", () => {
  afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });
  const request = () => new Request("http://localhost/api/photos/upload", { method: "POST", body: "{}" });

  it("reports unconfigured storage", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect((await POST(request())).status).toBe(503);
    expect(mocks.handleUpload).not.toHaveBeenCalled();
  });
  it("denies unauthenticated token generation", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test");
    mocks.auth.mockResolvedValue(null);
    mocks.handleUpload.mockImplementation(async (options) => options.onBeforeGenerateToken("sips/test.jpg"));
    expect((await POST(request())).status).toBe(400);
  });
  it("restricts signed upload tokens to images and 8 MB", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test");
    mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
    mocks.handleUpload.mockImplementation(async (options) => options.onBeforeGenerateToken("sips/test.jpg"));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ maximumSizeInBytes: 8388608, allowedContentTypes: ["image/jpeg", "image/png", "image/webp"], allowOverwrite: false });
  });
  it("rejects arbitrary upload paths", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test");
    mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
    mocks.handleUpload.mockImplementation(async (options) => options.onBeforeGenerateToken("other/file.svg"));
    expect((await POST(request())).status).toBe(400);
  });
});
