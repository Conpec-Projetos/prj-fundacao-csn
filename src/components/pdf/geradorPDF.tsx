import React, { useState, RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaFilePdf } from "react-icons/fa6";

interface GeradorPDFProps {
  refConteudo: RefObject<HTMLDivElement>; 
  nomeArquivo: string;
}

const GeradorPDF: React.FC<GeradorPDFProps> = ({ refConteudo, nomeArquivo }) => {
  const [isCarregando, setIsCarregando] = useState(false);

  const lidarDownloadPDF = async () => {
    const elementoDeCaptura = refConteudo.current;

    // Esta verificação já torna o código seguro contra refs nulas
    if (!elementoDeCaptura) {
      console.error("Erro: A referência ao conteúdo para gerar o PDF não foi encontrada.");
      return;
    }

    setIsCarregando(true);

    try {
      const tela = await html2canvas(elementoDeCaptura, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1920,
        width: 1920,
      });

      const imgWidth = tela.width;
      const imgHeight = tela.height;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'px',
        format: [imgWidth, imgHeight],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(tela.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${nomeArquivo}.pdf`);

    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    } finally {
      setIsCarregando(false);
    }
  };

  return (
    <button
      onClick={lidarDownloadPDF}
      disabled={isCarregando}
      className="flex items-center gap-2 text-white-off bg-red-500 hover:bg-red-600 rounded-xl text-lg font-bold px-5 py-3 cursor-pointer transition-colors"
      title="Baixar a página como PDF"
    >
      <FaFilePdf />
      {isCarregando ? 'Gerando...' : 'Exportar PDF'}
    </button>
  );
};

export default GeradorPDF;