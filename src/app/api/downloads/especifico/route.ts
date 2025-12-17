// app/api/downloads/especifico/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("URL não informada", { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new Response("URL inválida", { status: 400 });
  }

  // ✅ Segurança SSRF — domínio do Vercel Blob
  if (
    !parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com") ||
    parsedUrl.protocol !== "https:"
  ) {
    return new Response("URL não permitida", { status: 400 });
  }

  // ✅ (Opcional) valida pasta
  const ALLOWED_FOLDERS = [
    "apresentacao",
    "compliance",
    "diario",
    "docsAdmin",
    "documentos",
    "recibosProponente"
  ];

  const folder = parsedUrl.pathname.split("/").filter(Boolean)[0];
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return new Response("Pasta não permitida", { status: 400 });
  }

  const res = await fetch(fileUrl);

  if (!res.ok) {
    return new Response("Erro ao buscar arquivo", { status: 500 });
  }

  const blob = await res.blob();

  return new Response(blob, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="arquivo"',
    },
  });
}
