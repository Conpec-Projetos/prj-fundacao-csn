// app/api/downloads/download/route.ts
import { storageAdmin } from "@/firebase/firebase-admin-config";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("filePath"); // Extrai o parâmetro filePath da URL da requisição. Esse parâmetro indica o caminho do arquivo dentro do Firebase Storage.

    if (!filePath) {
      return NextResponse.json({ error: "filePath obrigatório" }, { status: 400 });
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
