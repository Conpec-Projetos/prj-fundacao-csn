// ❌ DO NOT add "use client" here — it's a server component
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import BarChart from "@/components/chart/barchartClient";
import PieChart from "@/components/chart/piechartClient";  
import BrazilMap from "@/components/map/brazilMap";  

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
    values: [120, 150, 180, 90, 110, 70, 130, 160, 140, 100, 85, 95, 75, 65, 115, 105, 125],
    colors: [
      '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2', 
      '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
      '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
    ]
    };
    // Sample Estados de Atuação data
    const estadosData = {
        labels: ["BA","SP","MG","TO","CE","RO","GO","PB","AL","MS","RN","MA", "PA", "PR", "SC", "RJ", "RR", "AC", "DF", "ES", "MT", "SE", "PI", "PE", "RS", "AP"],
        values: [95,   90, 45, 75,  60,  45,  30,  55,  40,  35,  25,  15,  20,   10,    5,   50,   10,   30,   40,   40,   40,   10, 10, 20, 60, 10]
    };
    // Sample data for the map
    const mapData = {
        SP: 90,
        RJ: 50,
        MG: 45,
        BA: 95,
        TO: 75,
        CE: 60,
        AM: 39,
        RO: 45,
        GO: 30,
        PB: 55,   
        AL: 40,
        MS: 35,
        RR: 10,
        MA: 15,
        PA: 20,
        PR: 10,
        SC: 5,    
        AC: 30,
        DF: 40,
        ES: 40,
        MT: 40,
        RN: 25,
        SE: 10,
        PI: 10,
        PE: 60,
        RS: 30,
        AP: 45,   
    };
    
    //começo do código em si
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-blue-fcsn text-blue-fcsn dark:text-white-off">
            <main className="flex flex-col gap-5 p-4 sm:p-6 md:p-10">
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>  
                
                {/* Section 1: Summary Cards */}
                <section className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-right"> 
                    <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
                        <div className="mb-2">
                            <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                                Valor total investido em projetos</h1>  
                        </div>
                        <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
                            R$9.173.461.815,00</h1>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
                        <div className="mb-2">
                            <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">Maior Aporte</h1>  
                        </div>
                        <h1 className= "text-2xl text-blue-fcsn dark:text-white-off font-bold">R$530.000,00</h1>
                        <h1 className="text-base text-blue-fcsn dark:text-white-off font-light">Investido em Projeto X</h1>   
                    </div>
                </section>       

                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-3">
                        <p className="text-xl font-bold">800</p>
                        <h2 className="text-lg mb-2">Projetos no total</h2>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-5">
                        <p className="text-xl font-bold">7000</p>                       
                        <h2 className="text-lg">Beneficiários diretos</h2>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-3">
                        <p className="text-xl font-bold">15000</p>
                        <h2 className="text-lg">Beneficiários indiretos</h2>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-3">
                        <p className="text-xl font-bold">750</p>
                        <h2 className="text-lg">Organizações envolvidas</h2>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-3">
                        <p className="text-xl font-bold">13</p>
                        <h2 className="text-lg">Estados atendidos</h2>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn2 rounded-xl shadow-sm p-3">
                        <p className="text-xl font-bold">714</p>
                        <h2 className="text-lg">Municípios atendidos</h2>
                    </div>
                </section>
                {/* Section 2: ODS Chart */}
                <section className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
                    <h2 className="text-2xl font-bold mb-5">Objetivos de Desenvolvimento Sustentável</h2>
                    <div className="w-full sm:overflow-x-auto md:overflow-x-hidden">
                        <div className="h-96 min-w-[600]px md:min-w-0">
                            <BarChart
                                title=""
                                data={odsData.values} 
                                labels={odsData.labels} 
                                colors={['#b37b97']}
                                horizontal={false}
                                useIcons={true}
                            />
                        </div>
                    </div>
                </section>
                {/* Section 3: Map and Chart */}
                <section className="grid grid-cols-2 gap-4 bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
                    <div className="flex flex-col sm:overflow-x-auto md:overflow-x-hidden">
                        <h2 className="text-2xl font-bold mb-4">Estados de atuação</h2>
                            <div className="lg:h-120 md:h-100 sm:h-80 w-full p-3">
                                <BrazilMap data={mapData} />
                            </div>
                    </div>
                    <div className="flex flex-col">
                        {/* box for the bar chart */}
                        <div className="lg:h-170 md:h-120 sm:h-96 w-full">
                            <BarChart
                                title=""
                                data={estadosData.values}
                                labels={estadosData.labels}
                                colors={['#b37b97']}
                                horizontal={true}
                                useIcons={false}
                            />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
                    <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-10">
                        <h2 className="text-2xl font-bold mb-4">Segmento do projeto</h2>
                        <div className="h-120">
                            <PieChart 
                            data={segmentData.values} 
                            labels={segmentData.labels} 
                            colors={['#e74c3c','#8e44ad','#39c2e0','#2ecc40','#f1c40f']}
                            />
                        </div>
                    </div>
                    <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full flex flex-col">
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
