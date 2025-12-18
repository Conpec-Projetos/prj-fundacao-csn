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

  // Segurança SSRF — domínio e protocolo
  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com")
  ) {
    return new Response("URL não permitida", { status: 400 });
  }

  // Allow-list de pastas
  const ALLOWED_FOLDERS = [
    "apresentacao",
    "compliance",
    "diario",
    "docsAdmin",
    "documentos",
    "recibosProponente",
  ];

  const pathnameParts = parsedUrl.pathname.split("/").filter(Boolean);
  const folder = pathnameParts[0];

  if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
    return new Response("Pasta não permitida", { status: 400 });
  }


  // Reconstrução da URL SOMENTE com partes validadas.

  const safeUrl = `https://${parsedUrl.hostname}${parsedUrl.pathname}`;

  const res = await fetch(safeUrl);

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
