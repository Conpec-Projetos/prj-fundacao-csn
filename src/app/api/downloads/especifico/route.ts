// app/api/downloads/especifico/route.ts

const BLOB_HOST = "https://dcnpruvgeemnaxr5.public.blob.vercel-storage.com";

const ALLOWED_FOLDERS = [
  "apresentacao",
  "compliance",
  "diario",
  "docsAdmin",
  "documentos",
  "recibosProponente",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path não informado", { status: 400 });
  }

  // 🔐 Normaliza e valida path
  const decodedPath = decodeURIComponent(path).normalize("NFKC");

  //
  if (
    decodedPath.includes("..") ||
    decodedPath.includes("//") ||
    decodedPath.startsWith("/")
  ) {
    return new Response("Path inválido", { status: 400 });
  }

  // ✅ valida pasta
  const folder = decodedPath.split("/")[0];
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return new Response("Pasta não permitida", { status: 400 });
  }

  /**
   * Usamos a API URL() para montar a URL
   * CodeQL entende que isso não é SSRF
   */
  const safeUrl = new URL(decodedPath, BLOB_HOST);

  // codeql[js/request-forgery]: URL construída a partir de base fixa e path validado por allow-list
  const res = await fetch(safeUrl.toString());

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
