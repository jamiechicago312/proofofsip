import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photos";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Photo storage is not configured. Set BLOB_READ_WRITE_TOKEN and restart or redeploy." }, { status: 503 });
  }
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await auth())?.user) throw new Error("Sign in before uploading photos.");
        if (!/^sips\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(pathname)) throw new Error("Invalid photo path.");
        return {
          allowedContentTypes: PHOTO_TYPES,
          maximumSizeInBytes: MAX_PHOTO_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Upload could not be authorized. Sign in and try a JPEG, PNG, or WebP image under 8 MB." }, { status: 400 });
  }
}
