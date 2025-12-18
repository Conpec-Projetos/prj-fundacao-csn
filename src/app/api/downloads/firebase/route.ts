// app/api/downloads/download/route.ts
import { storageAdmin } from "@/firebase/firebase-admin-config";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPath = searchParams.get("filePath"); // Extrai o parâmetro filePath da URL da requisição. Esse parâmetro indica o caminho do arquivo dentro do Firebase Storage.
    console.log("file path: ", rawPath)
    if (!rawPath) {
      return NextResponse.json({ error: "filePath obrigatório" }, { status: 400 });
    }

    let filePath = rawPath;

    // Se vier uma URL do Firebase, extrai o path real
    if (filePath.startsWith("http")) {
    try {
        const url = new URL(filePath);
        const encodedPath = url.pathname.split("/o/")[1];
        if (!encodedPath) {
        throw new Error("Path inválido");
        }

        filePath = decodeURIComponent(encodedPath);
    } catch {
        return NextResponse.json({ error: "URL do Firebase inválida" }, { status: 400 });
    }
    }

    const bucket = storageAdmin.bucket();
    const file = bucket.file(filePath); // Cria uma referência ao arquivo com base no filePath.

    const [exists] = await file.exists();
    if (!exists) { // Verifica se o arquivo realmente existe no Storage.
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const [buffer] = await file.download(); // Faz o download do conteúdo do arquivo como um Buffer (objeto binário do Node.js).
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";

    // Converte Buffer do Node.js para Uint8Array
    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
  } catch (err) {
    console.error("Erro no download backend:", err);
    return NextResponse.json({ error: "Erro ao baixar arquivo" }, { status: 500 });
  }
}