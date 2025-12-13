// app/api/downloads/especifico/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("URL não informada", { status: 400 });
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
