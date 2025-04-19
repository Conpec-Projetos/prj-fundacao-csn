// ❌ DO NOT add "use client" here — it's a server component
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import BarChart from "@/components/chart/barchartClient";
import PieChart from "@/components/chart/piechartClient";
import BrazilMap from "@/components/map/mapBrazil";
import { useState } from "react";

export default function DashboardPage() {
    // Sample data for charts
  const segmentData = {
    labels: ["Cultura", "Esporte", "Pessoa Idosa", "Criança e Adolescente", "Saúde"],
    values: [250, 180, 120, 150, 100]
  };
    // Sample Lei de Incentivo data
  const incentiveData = {
    labels: [
      "Lei de Incentivo à Cultura",
      "PROAC",
      "FIA",
      "LIE",
      "Lei da Pessoa Idosa",
      "Pronas",
      "Pronon",
      "Promac",
      "ICMS"
    ],
    values: [200, 150, 120, 100, 80, 60, 40, 30, 20]
  };
  // ODS Sample Data
  const odsData = {
    labels: [
      'ODS 1: Erradicação da Pobreza',
      'ODS 2: Fome Zero',
      'ODS 3: Saúde e Bem-Estar',
      'ODS 4: Educação de Qualidade',
      'ODS 5: Igualdade de Gênero',
      'ODS 6: Água Potável e Saneamento',
      'ODS 7: Energia Limpa e Acessível',
      'ODS 8: Trabalho Decente e Crescimento Econômico',
      'ODS 9: Indústria, Inovação e Infraestrutura',
      'ODS 10: Redução das Desigualdades',
      'ODS 11: Cidades e Comunidades Sustentáveis',
      'ODS 12: Consumo e Produção Responsáveis',
      'ODS 13: Ação Contra a Mudança Global do Clima',
      'ODS 14: Vida na Água',
      'ODS 15: Vida Terrestre',
      'ODS 16: Paz, Justiça e Instituições Eficazes',
      'ODS 17: Parcerias e Meios de Implementação'
    ],
    data: [120, 150, 180, 90, 110, 70, 130, 160, 140, 100, 85, 95, 75, 65, 115, 105, 125],
    colors: [
      '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2', 
      '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
      '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
    ]
  };
    // Sample Estados de Atuação data
    const estadosData = {
        labels: ["BA", "SP", "MG", "TO", "CE", "AM", "RO", "GO", "PB", "AL", "MS", "RR", "MA", "PA", "PR", "SC"],
        values: [95, 120, 105, 75, 60, 45, 30, 55, 40, 35, 25, 15, 20, 10, 5, 50]
    };

    //começo do código em si
    return (
        <div className="flex flex-col min-h-screen bg-white text-blue-fcsn">
            <Header />
            <main className="flex flex-col gap-8 p-10 mx-12 md:mx-40">
                <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>  
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right"> 
                    <div className="bg-white-off rounded-xl shadow-sm p-5">
                        <div className="mb-2">
                            <h1 className="text-xl text-blue-fcsn font-light">Valor total investido em projetos</h1>  
                        </div>
                        <h1 className="text-3xl text-blue-fcsn font-bold">R$9.173.461.815,00</h1>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-4">
                        <div className="mb-2">
                            <h1 className="text-xl text-blue-fcsn font-light">Maior Aporte</h1>  
                        </div>
                        <h1 className= "text-3xl text-blue-fcsn font-bold">R$530.000,00</h1>
                        <h1 className="text-base text-blue-fcsn font-light">Investido em Projeto X</h1>   
                    </div>
                </section>       

                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">800</p>
                        <h2 className="text-lg">Projetos no total</h2>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">7000</p>                       
                        <h2 className="text-lg">Beneficiários diretos</h2>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">15000</p>
                        <h2 className="text-lg">Beneficiários indiretos</h2>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">750</p>
                        <h2 className="text-lg">Organizações envolvidas</h2>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">13</p>
                        <h2 className="text-lg">Estados atendidos</h2>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-3">
                        <p className="text-2xl font-bold">714</p>
                        <h2 className="text-lg">Municípios atendidos</h2>
                    </div>
                </section>
                <section className="bg-white-off rounded-xl shadow-sm p-4">
                    <h2 className="text-2xl font-bold mb-5">Objetivos de Desenvolvimento Sustentável</h2>
                    <div className="h-100 w-full">
                    <BarChart
                        title=""
                        data={estadosData.values} 
                        labels={estadosData.labels} 
                        colors={['#b37b97']}
                        horizontal={false}
                        useIcons={true}
                        />

                    </div>
                </section>

                <section className=" h-210 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white-off rounded-xl shadow-sm p-5">
                    <div className="h-200 w-full lg:w-[100%] bg-white rounded-lg shadow-md p-3">
                        <BrazilMap data={estadosData} />                  
                    </div>
                    <div className="h-200 w-full p-3">
                        <h2 className="text-2xl font-bold mb-4">Estados de atuação</h2>
                        <BarChart
                            title=""
                            data={estadosData.values}
                            labels={estadosData.labels}
                            colors={['#b37b97']}
                            horizontal={true}
                            useIcons={false}
                        />
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
                    <div className="bg-white-off rounded-xl shadow-sm p-10">
                        <h2 className="text-2xl font-bold mb-4">Segmento do projeto</h2>
                        <div className="h-120">
                        <PieChart 
                        data={segmentData.values} 
                        labels={segmentData.labels} 
                        colors={['#e74c3c','#8e44ad','#39c2e0','#2ecc40','#f1c40f']}
                    />
                        </div>
                    </div>
                    <div className="bg-white-off rounded-xl shadow-sm p-5 h-full flex flex-col">
                        <h2 className="text-2xl font-bold mb-4">Lei de Incentivo</h2>
                        <div className="flex-grow w-full">
                        <BarChart 
                            title=""
                            colors={['#b37b97']}
                            data={incentiveData.values} 
                            labels={incentiveData.labels} 
                            horizontal={true}
                            useIcons={false}

                        />
                        </div> 
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
