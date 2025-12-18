// app/api/downloads/especifico/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path"); // passando apenas a pasta e o arquivo

  if (!path) {
    return new Response("Path não informado", { status: 400 });
  }

  // Proteções básicas de path 
  if (
    path.includes("..") ||
    path.startsWith("/") ||
    path.includes("//")
  ) {
    return new Response("Path inválido", { status: 400 });
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

  const folder = path.split("/")[0];

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return new Response("Pasta não permitida", { status: 400 });
  }

  // DOMÍNIO FIXO 
  const BLOB_HOST = "https://dcnpruvgeemnaxr5.public.blob.vercel-storage.com";

  // URL FINAL SEGURA
  const safeUrl = `${BLOB_HOST}/${path}`;

  const res = await fetch(safeUrl);

  if (!res.ok) {
    return new Response("Erro ao buscar arquivo", { status: 500 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="arquivo"',
    },
  });
}
