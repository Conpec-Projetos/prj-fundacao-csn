import { authAdmin, dbAdmin } from "@/firebase/firebase-admin-config";
import type { HandleUploadBody } from "@vercel/blob/client";
import { handleUpload } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

// This route acts as the secure authorization endpoint used by the
// @vercel/blob client upload flow. It must run in a Node runtime so the
// firebase-admin SDK can verify ID tokens and write to Firestore.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // Verify firebase id token if provided in Authorization header.
        const authHeader = req.headers.get("authorization") || "";
        const match = authHeader.match(/^Bearer\s+(.*)$/i);

        let decodedToken: { uid?: string } | null = null;
        if (match) {
            try {
                decodedToken = await authAdmin.verifyIdToken(match[1]);
            } catch {
                console.error("Invalid Firebase token on upload auth");
                return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
            }
        }

        // Delegate to handleUpload which understands the client upload protocol.
        // Read the incoming body (handleUpload expects the parsed body) and
        // forward it to the helper along with the request.
        const body = (await req.json()) as HandleUploadBody;

        const result = await handleUpload({
            request: req as unknown as Request,
            body,
            onBeforeGenerateToken: async (pathname: string, clientPayload: string | null, _multipart: boolean) => {
                void _multipart;
                let parsed: { size?: number; type?: string } | null = null;
                try {
                    parsed = clientPayload ? JSON.parse(clientPayload) : null;
                } catch {
                    parsed = null;
                }

                const AUTH_MAX = 200 * 1024 * 1024; // 200MB
                const UNAUTH_MAX = 10 * 1024 * 1024; // 10MB
                const maximumSizeInBytes = decodedToken ? AUTH_MAX : UNAUTH_MAX;

                if (parsed?.size && parsed.size > maximumSizeInBytes) {
                    throw new Error(`File too large. Max ${maximumSizeInBytes} bytes.`);
                }

                // Determine callback URL (prefer explicit env var; fall back to Vercel-provided URL)
                const callbackUrl =
                    process.env.VERCEL_BLOB_CALLBACK_URL ??
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/upload` : undefined);

                return {
                    allowedContentTypes: parsed?.type ? [parsed.type] : undefined,
                    maximumSizeInBytes,
                    addRandomSuffix: true,
                    tokenPayload: clientPayload ?? null,
                    callbackUrl, // <-- ensure this is present
                };
            },
            onUploadCompleted: async (payload: {
                blob?: { url?: string; downloadUrl?: string; pathname?: string; size?: number; contentType?: string };
                tokenPayload?: string | null;
            }) => {
                try {
                    const p = payload;
                    const blob = p.blob;
                    const url = blob?.url ?? blob?.downloadUrl ?? null;
                    await dbAdmin.collection("blob-uploads").add({
                        uid: decodedToken?.uid ?? null,
                        pathname: blob?.pathname ?? null,
                        url,
                        size: blob?.size ?? null,
                        contentType: blob?.contentType ?? null,
                        createdAt: new Date(),
                        tokenPayload: p.tokenPayload ?? null,
                    });
                } catch (err) {
                    console.error("Error recording upload completion:", err);
                }
            },
        });

        // handleUpload returns either a token-generation response or an upload
        // confirmation response. We forward it directly to the client.
        return NextResponse.json(result);
    } catch (err) {
        console.error("Upload route error:", err);
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid"); // opcional: para buscar apenas os arquivos do usuário

    let query = dbAdmin.collection("blob-uploads").orderBy("createdAt", "desc");

    if (uid) {
      query = query.where("uid", "==", uid); // pegamos pelo id
    }

    const snapshot = await query.get();

    const files = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(files);
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 });
  }
}
