import puppeteer from "puppeteer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let navegador;
  try {
    navegador = await puppeteer.launch({
      headless: false, // Pode voltar para 'new' (invisível)
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const pagina = await navegador.newPage();
    await pagina.setViewport({ width: 1280, height: 800 });

    // --- FLUXO DE LOGIN ---
    const urlLogin = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
    await pagina.goto(urlLogin, { waitUntil: 'networkidle0' });

    // Substitua pelos seus seletores e credenciais reais
    await pagina.type('#email-input', 'marcos.boson@conpec.com.br');
    await pagina.type('#password-input', 'Marcos26042007');

    await Promise.all([
        pagina.waitForNavigation({ waitUntil: 'networkidle0' }),
        pagina.click('#login-button'),
    ]);
    console.log("Login bem-sucedido. Redirecionado para a página Home.");

    // --- ✅ PASSO EXTRA E FINAL: NAVEGAR DA HOME PARA O DASHBOARD ---
    // IMPORTANTE: Ajuste a URL se o seu dashboard não estiver em '/dashboard'
    const urlDashboard = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;
    console.log(`Navegando para a página do dashboard em ${urlDashboard}...`);
    await pagina.goto(urlDashboard, { waitUntil: 'networkidle0' });

    // --- GERAÇÃO DO PDF ---
    // Agora, na página correta, esperamos pelo seletor
    console.log("Aguardando o seletor #grafico-final na página do dashboard...");
    await pagina.waitForSelector('#grafico-final', { timeout: 30000 });
    console.log("Dashboard totalmente renderizado e pronto para o PDF.");

    await pagina.addStyleTag({ content: '.no-print { display: none !important; }' });
    const altura = await pagina.evaluate(() => document.body.scrollHeight);
    
    const pdfBuffer = await pagina.pdf({
      width: "1280px",
      height: `${altura}px`,
      printBackground: true,
      pageRanges: '1',
    });
    
    await navegador.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="dashboard_relatorio.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro detalhado ao gerar PDF com Puppeteer:", error);
    if (navegador) {
      await navegador.close();
    }
    return new NextResponse(`Falha ao gerar o PDF: ${error.message}`, { status: 500 });
  }
}