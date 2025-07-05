// components/pdf/geradorPDF.tsx
import React, { useState, RefObject, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaFilePdf } from "react-icons/fa6";
import { useTheme } from '@/context/themeContext';
import { usePDF } from '@/context/pdfContext'; // Importe o hook

interface GeradorPDFProps {
  refConteudo: RefObject<HTMLDivElement>; 
  nomeArquivo: string;
}

const GeradorPDF: React.FC<GeradorPDFProps> = ({ refConteudo, nomeArquivo }) => {
  const [isCarregando, setIsCarregando] = useState(false);
  const { darkMode } = useTheme();
  const { isPdfMode, setIsPdfMode } = usePDF(); // Use o contexto


  useEffect(() => {
    if (isPdfMode) {
      const gerarPDF = async () => {
        const elementoDeCaptura = refConteudo.current;
        if (!elementoDeCaptura) return;

        // Rolar para o topo é sempre uma boa prática
        window.scrollTo(0, 0);

        // Um pequeno atraso para garantir que tudo (especialmente imagens) tenha sido renderizado
        await new Promise(resolve => setTimeout(resolve, 500)); 

        try {
          const tela = await html2canvas(elementoDeCaptura, {
            scale: 2,
            useCORS: true,
            backgroundColor: darkMode ? '#292944' : '#ffffff',
            width: elementoDeCaptura.scrollWidth,
            height: elementoDeCaptura.scrollHeight + 50,
            windowWidth: elementoDeCaptura.scrollWidth,
            windowHeight: elementoDeCaptura.scrollHeight,
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
          // Desativa o modo PDF e o estado de carregamento, independentemente do resultado
          setIsCarregando(false);
          setIsPdfMode(false);
        }
      };

      gerarPDF();
    }
  }, [isPdfMode, refConteudo, nomeArquivo, darkMode, setIsPdfMode]);

  const lidarDownloadPDF = () => {
    if (!isCarregando) {
      setIsCarregando(true);
      setIsPdfMode(true); // Apenas ativa o modo PDF. O useEffect fará o resto.
    }
  };

  return (
    <button
      onClick={lidarDownloadPDF}
      disabled={isCarregando}
      className={`flex items-center gap-2 text-white-off bg-red-500 hover:bg-red-600 rounded-xl text-lg font-bold px-5 py-3 cursor-pointer transition-colors ${isPdfMode ? 'hidden' : ''}`}
      title="Baixar a página como PDF"
    >
      <FaFilePdf />
      {isCarregando ? 'Gerando...' : 'Exportar PDF'}
    </button>
  );
};

export default GeradorPDF;