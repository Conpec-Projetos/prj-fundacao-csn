'use client';

import Footer from "@/components/footer/footer";
import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaCheckCircle, FaFilter, FaMoneyBillAlt, FaSearch, FaTimesCircle } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import Botao from "../../../components/botoes_todos-proj/Botao";

// Interface (base) para cada projeto
interface ProjectProps {
  id: number;
  name: string;
  status: 'aprovado' | 'pendente' | 'reprovado';
  value: number;
  incentiveLaw: string;
  description: string;
  ODS: { id: number, numberODS: number, src: string }[];
}

// Componente Project
const Project: React.FC<ProjectProps> = ({ id, name, status, value, incentiveLaw, description, ODS}) => (
  <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0 md:1/2 sm:1/4">
    <section className="flex flex-col col-span-2 mr-2">
        <div className="flex flex-row gap-3 mb-2">
            <div className="text-2xl font-bold">{name}</div>
            <div className="mt-1">
            {status === 'aprovado' && (
              <FaCheckCircle className="text-green-600 dark:text-green-500" size={22}  />
            )}
            {status === 'pendente' && (
              <FaClockRotateLeft color="darkOrange" size={22} />
            )}
            {status === 'reprovado' && (
              <FaTimesCircle color="red" size={22}/>
            )}
            </div>
            <div className="ml-8"> <Botao/> </div>
        </div>
        <p className="mb-2 text-lg"> {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <div className=" bg-pink-fcsn dark:bg-pink-light2 rounded-2xl px-4 py-2 size-fit text-base text-center mb-2 text-white ">{incentiveLaw}</div>
        <p className="mr-2 mt-3 text-base text-justify">{description}</p>
    </section>

    <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 col-span-1">
    {ODS.map((img) => (
        <img key={img.id} src={img.src} alt={`ODS ${id}`} className="w-28 h-28" />
      ))}
    </section>
  </div>
);

// Interface (base) que utilizei para os filtros
interface Filters {
  status: {situation: string, state: boolean}[];
  value: {initialValue: number, finalValue: number | undefined, state: boolean}[];
  incentiveLaw: {law: string, state: boolean}[];
  ODS: {numberODS: number, state: boolean}[];
}

export default function TodosProjetos(){
    // Array de todos os projetos (usado como exemplo "dados fake")
    // AllProjects é do tipo ProjectProps
    const AllProjects: ProjectProps[] =
    [
        {id: 1, name: "Cultura", status: 'aprovado', value: 999.99, incentiveLaw: "CULTURA", description: "popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, comes from a line in section 1.10.32.The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.", ODS: [{id: 1, numberODS:1, src: "/ods/ods1.png"}, {id: 2, numberODS:2, src: "/ods/ods2.png"}, {id: 3, numberODS:3, src: "/ods/ods3.png"}]},
        {id: 2, name: "Esporte", status: 'reprovado', value:  10990.99, incentiveLaw: "IDOSO", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, neque accusamus? Fugit ipsum error nihil maiores dolorem numquam assumenda provident eos suscipit quia debitis libero, exercitationem reprehenderit repudiandae voluptas consequuntur." , ODS: [{id: 4, numberODS:1, src: "/ods/ods1.png"}, {id: 5, numberODS:12, src: "/ods/ods12.png"}, {id: 6, numberODS:13, src: "/ods/ods13.png"}]},
        {id: 3, name: "Saúde", status: 'pendente', value: 100000.01, incentiveLaw: "PROAC", description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).", ODS: [{id: 7, numberODS:14, src: "/ods/ods14.png"}, {id: 8, numberODS:16, src: "/ods/ods16.png"}, {id: 9, numberODS:17, src: "/ods/ods17.png"}]},
        {id: 4, name: "Educação", status: 'reprovado', value:  100000.00, incentiveLaw: "ICMS-MG", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, neque accusamus? Fugit ipsum error nihil maiores dolorem numquam assumenda provident eos suscipit quia debitis libero, exercitationem reprehenderit repudiandae voluptas consequuntur." , ODS: [{id: 10, numberODS:11, src: "/ods/ods11.png"}, {id: 11, numberODS:11 , src: "/ods/ods11.png"}, {id: 12, numberODS:13, src: "/ods/ods13.png"}]},
        {id: 5, name: "Adolescente", status: 'pendente', value: 1000000.01, incentiveLaw: "FIA", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, neque accusamus? Fugit ipsum error nihil maiores dolorem numquam assumenda provident eos suscipit quia debitis libero, exercitationem reprehenderit repudiandae voluptas consequuntur." , ODS: [{id: 13, numberODS:11, src: "/ods/ods11.png"}, {id: 14, numberODS:12, src: "/ods/ods12.png"}]},
        {id: 6, name: "Projeto F", status: 'aprovado', value: 2000000.00, incentiveLaw: "PIE", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, neque accusamus? Fugit ipsum error nihil maiores dolorem numquam assumenda provident eos suscipit quia debitis libero, exercitationem reprehenderit repudiandae voluptas consequuntur." , ODS: [{id: 15, numberODS:11, src: "/ods/ods11.png"}]}
    
    ]
    // useState para controlar a pesquisa. Inicialmente estará vazio, mudará a cada inserção de caracter
    const [search, setSearch]= useState("");
    // Apenas os projetos que seu nome coincide com o termo inserido na barra de pesquisa serão armazenados em resSearch
    // Guardaremos em resSearch apenas os projetos que, pelo menos comecem, com o que foi digitado na barra de pesquisa
    const resSearch = AllProjects.filter(project => project.name.toLowerCase().startsWith(search.toLowerCase()))

    // Filtros

    // Usei esse estado para controlar o dropdown dos filtros
    const [isOpen, setIsOpen] = useState(false);
    // caixaRef é a referencia de um elemento html, no caso nosso dropdown
    const caixaRef = useRef<HTMLDivElement>(null);

    //Usamos isso para fechar o dropdown quando clicarmos fora da caixa
    useEffect(() => {
      if (!isOpen) return;
    
      function handleCliqueFora(event: MouseEvent) {
        if (
          caixaRef.current &&
          event.target instanceof Node &&
          // Aqui verificaremos se o evento foi fora da nossa caixa de referencia 
          !caixaRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }
    
      document.addEventListener('mousedown', handleCliqueFora);
      return () => {
        document.removeEventListener('mousedown', handleCliqueFora);
      };
    }, [isOpen]); 

    // Usarei esse array para guardar apenas os projetos que passarem pelos filtros
    const [filteredProjects, setFilteredProjects] = useState<ProjectProps[]>([]);
    // Boolean para controlar se foi aplicado algum filtro (Para saber se será exibido algum projeto com filtro)
    const [ctrl, setCtrl] = useState(false);
    // Armazenar os filtros que o usuário quer usar
    const [filters, setFilters] = useState<Filters>({
      status: [
        {situation: 'aprovado', state: false},
        {situation: 'pendente', state: false},
        {situation: 'reprovado', state: false}
      ],
      value: [
        {initialValue: 0, finalValue: 1000, state: false},
        {initialValue: 1000.01, finalValue: 100000, state: false},
        {initialValue: 100000.01, finalValue: 1000000, state: false},
        {initialValue: 1000000.01, finalValue: undefined, state: false}
      ],
      incentiveLaw: [
        {law: 'CULTURA', state: false},
        {law: 'PROAC', state: false},
        {law: 'FIA', state: false},
        {law: 'LIE', state: false},
        {law: 'IDOSO', state: false},
        {law: 'PRONAS', state: false},
        {law: 'PRONON', state: false},
        {law: 'PROMAC', state: false},
        {law: 'ICMS-MG', state: false},
        {law: 'ICMS-RJ', state: false},
        {law: 'PIE', state: false}
      ],
      ODS: [
        {numberODS: 1, state: false},
        {numberODS: 2, state: false},
        {numberODS: 3, state: false},
        {numberODS: 4, state: false},
        {numberODS: 5, state: false},
        {numberODS: 6, state: false},
        {numberODS: 7, state: false},
        {numberODS: 8, state: false},
        {numberODS: 9, state: false},
        {numberODS: 10, state: false},
        {numberODS: 11, state: false},
        {numberODS: 12, state: false},
        {numberODS: 13, state: false},
        {numberODS: 14, state: false},
        {numberODS: 15, state: false},
        {numberODS: 16, state: false},
        {numberODS: 17, state: false}
      ]
    });

    {/* Função para mudar o state dos filtros da seção Situação */}
    function situationFilters(situacao: string){
      setFilters(prevFilters => ({
        ...prevFilters,
        status: prevFilters.status.map(item =>
          item.situation === situacao
            ? { ...item, state: !item.state }
            : item
        )
      }));
    }

    {/* Função para mudar o state dos filtros da seção Valor */}
    function valueFilters(value1: number, value2: number | undefined){
      setFilters(prevFilters => ({
        ...prevFilters,
        value: prevFilters.value.map(item =>
          item.initialValue === value1 && item.finalValue === value2
            ? { ...item, state: !item.state }
            : item
        )
      }));
    }

    {/* Função para mudar o state dos filtros da seção Lei de incentivo */}
    function incentiveLawFilters(law: string){
      setFilters(prevFilters => ({
        ...prevFilters,
        incentiveLaw: prevFilters.incentiveLaw.map(item =>
          item.law === law
            ? { ...item, state: !item.state }
            : item
        )
      }));
    }

    {/* Função para mudar o state dos filtros da seção ODS */}
    function ODSFilters(number: number){
      setFilters(prevFilters => ({
        ...prevFilters,
        ODS: prevFilters.ODS.map(item =>
          item.numberODS === number
            ? { ...item, state: !item.state }
            : item
        )
      }));
    }

    {/* Função para aplicar os filtros
      1- Verificamos no array filters se o usuario selecionou algum filtro de cada seção
      2- Guadamos em filtered todos os projetos que passarem por pelo menos um dos filtros aplicados
      3- Atualizamos o array filteredProjects (usando setFilteredProjects) com todos os projetos filtrados
      4- Mudamos para true o ctrl para sabermos que foi aplicado algum filtro e queremos renderizar os projetos com base neles
      5- Mudamos search (com setSearch) para apagar qualquer caracter digitado na barra de pesquisa e apenas filtrarmos
    */}
    function applyFilters() {
      const activeStatus = filters.status.filter(f => f.state).map(f => f.situation);
      const activeValues = filters.value.filter(f => f.state);
      const activeLaws = filters.incentiveLaw.filter(f => f.state).map(f => f.law);
      const activeODS = filters.ODS.filter(f => f.state).map(f => f.numberODS);
    
      const filtered = AllProjects.filter(project => {
        const matchStatus =
          activeStatus.length === 0 || activeStatus.includes(project.status);
    
        const matchValue =
          activeValues.length === 0 ||
          activeValues.some(
            range =>
              project.value >= range.initialValue &&
              (range.finalValue === undefined || project.value <= range.finalValue)
          );
    
        const matchLaw =
          activeLaws.length === 0 || activeLaws.includes(project.incentiveLaw);
    
        const matchODS =
          activeODS.length === 0 ||
          project.ODS.some(ods => activeODS.includes(ods.numberODS));
    
        return matchStatus && matchValue && matchLaw && matchODS;
      });

      setFilteredProjects(filtered);
      setCtrl(true);
      if (filtered.length > 0) {
        setSearch("");
      }
    }

    {/* Função para limpar todos os filtros aplicados
      1- Mudamos todos os state para false
      2- Mudamos para vazio o array filteredProjects
      3- Mudamos para false o ctrl pois nao ha mais filtros aplicados (assim podemos fazer uma busca por exemplo)
    */}
    function clearFilters() {
      setFilters(prevFilters => ({
        status: prevFilters.status.map(item => ({ ...item, state: false })),
        value: prevFilters.value.map(item => ({ ...item, state: false })),
        incentiveLaw: prevFilters.incentiveLaw.map(item => ({ ...item, state: false })),
        ODS: prevFilters.ODS.map(item => ({ ...item, state: false })),
      }));
      setFilteredProjects([]);
      setCtrl(false);
    }

    return(
    <div className="flex flex-col min-h-[180vh]">
      <main className="flex flex-1 flex-col px-4 sm:px-8 md:px-20 lg:px-32 py-4 gap-y-10 ">
        {/* Cabeçalho */}
        <section>
          <h1 className="text-xl md:text-3xl font-bold text-blue-fcsn dark:text-white mt-3">Projetos</h1>

          {/* Barra de pesquisa*/}
          <div  className="flex flex-row gap-x-4 mt-3">
            <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
              <FaSearch size={24}/>
            </div>      
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-white-off dark:bg-blue-fcsn2 px-3 flex-1 rounded-lg shadow-md"
              value={search}
              // A cada mudança (inserção de caracter mudaremos nossa variavel)
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtros*/}
          <div className="flex flex-row gap-x-4 mt-3">
            <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
              <FaFilter size={24} />
            </div>

          <div
          // O dropdown será exibido enquanto estivermos com o mouse em cima dele
            onMouseEnter={() => setIsOpen(true)}
            className="relative z-10"
            >
            {/* seção para passarmos o mouse e aparecer o dropdown */}
            
            <div className="bg-white-off dark:bg-blue-fcsn2 p-2 px-4 rounded-lg shadow-md text-lg cursor-pointer flex items-center gap-2"> Aplicar filtros <FaCaretDown /> </div>
              {/* Dropdown */}
              {isOpen && (
                // Caixa de referencia para controlarmos se o click foi fora desta caixa
                <div ref={caixaRef} className="absolute top-full left-0 w-[90vw] md:w-[700px] lg:w-[768px] xl:w-[768px]  bg-white dark:bg-blue-fcsn2 p-2 pl-4 rounded shadow-md z-10">
                  <p className="text-2xl text-blue-fcsn dark:text-white-off font-bold">Filtros</p>

                  <p className="py-2 text-xl">Situação</p>
                   
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.find(f => f.situation === 'aprovado')?.state || false}
                        onChange={() => situationFilters('aprovado')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Aprovado</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.find(f => f.situation === 'pendente')?.state || false}
                        onChange={() => situationFilters('pendente')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Pendente</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.find(f => f.situation === 'reprovado')?.state || false}
                        onChange={() => situationFilters('reprovado')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Reprovado</span>
                    </label>
                

                  
                  <p className="py-2 text-xl">Valor</p>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.value.find(f => f. initialValue === 0 && f.finalValue === 1000)?.state || false}
                        onChange={() => valueFilters(0, 1000)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>De R$ 0,00 a R$ 1.000,00</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => valueFilters(1000.01, 100000)}
                        checked={filters.value.find(f => f. initialValue === 1000.01 && f.finalValue === 100000)?.state || false}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>De R$ 1.000,01 a R$ 100.000,00</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.value.find(f => f. initialValue === 100000.01 && f.finalValue === 1000000)?.state || false}
                        onChange={() => valueFilters(100000.01, 1000000)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                        <span>De R$ 100.000,01 a R$ 1.000.000,00</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.value.find(f => f. initialValue === 1000000.01 && f.finalValue === undefined)?.state || false}
                        onChange={() => valueFilters(1000000.01, undefined)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                        <span>Acima de R$ 1.000.000,01</span>
                    </label>
                 
                  <p className="py-2 text-xl">Lei de incentivo</p>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'CULTURA')?.state || false}
                        onChange={() => incentiveLawFilters('CULTURA')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Lei de Incentivo à Cultura</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => incentiveLawFilters('PROAC')}
                        checked={filters.incentiveLaw.find(f => f.law === 'PROAC')?.state || false}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>PROAC – Programa de Ação Cultural</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'FIA')?.state || false}
                        onChange={() => incentiveLawFilters('FIA')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                        <span>FIA - Lei Fundo para a Infância e Adolescência</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'LIE')?.state || false}
                        onChange={() => incentiveLawFilters('LIE')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>LIE - Lei de Incentivo ao Esporte</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => incentiveLawFilters('IDOSO')}
                        checked={filters.incentiveLaw.find(f => f.law === 'IDOSO')?.state || false}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Lei da Pessoa Idosa</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'PRONAS')?.state || false}
                        onChange={() => incentiveLawFilters('PRONAS')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Pronas – Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'PRONON')?.state || false}
                        onChange={() => incentiveLawFilters('PRONON')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Pronon -Programa Nacional de Apoio à Atenção Oncológica</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'PROMAC')?.state || false}
                        onChange={() => incentiveLawFilters('PROMAC')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>Promac – Programa de Incentivo à Cultura do Município de São Paulo</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => incentiveLawFilters('ICMS-MG')}
                        checked={filters.incentiveLaw.find(f => f.law === 'ICMS-MG')?.state || false}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ICMS – MG Imposto sobre Circulação de Mercadoria e Serviços</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'ICMS-RJ')?.state || false}
                        onChange={() => incentiveLawFilters('ICMS-RJ')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ICMS – RJ Imposto sobre Circulação de Mercadoria e Serviços</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.incentiveLaw.find(f => f.law === 'PIE')?.state || false}
                        onChange={() => incentiveLawFilters('PIE')}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>PIE - Lei Paulista de Incentivo ao Esporte</span>
                    </label>

                  <p className="py-2 text-xl">Objetivos de Desenvolvimento Sustentável (ODS)</p>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 1)?.state || false}
                        onChange={() => ODSFilters(1)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 1: Erradicação da Pobreza</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 2)?.state || false}
                        onChange={() => ODSFilters(2)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 2: Fome Zero e Agricultura Sustentável</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 3)?.state || false}
                        onChange={() => ODSFilters(3)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 3: Saúde e Bem-estar</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 4)?.state || false}
                        onChange={() => ODSFilters(4)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 4: Educação de qualidade</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 5)?.state || false}
                        onChange={() => ODSFilters(5)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 5: Igualdade de Gênero</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 6)?.state || false}
                        onChange={() => ODSFilters(6)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 6: Agua potável e Saneamento</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 7)?.state || false}
                        onChange={() => ODSFilters(7)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 7: Energia Acessível e Limpa</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 8)?.state || false}
                        onChange={() => ODSFilters(8)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 8: Trabalho decente e Crescimento Econômico</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 9)?.state || false}
                        onChange={() => ODSFilters(9)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 9: Indústria, Inovação e Infraestrutura</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 10)?.state || false}
                        onChange={() => ODSFilters(10)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 10: Redução das Desigualdades</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 11)?.state || false}
                        onChange={() => ODSFilters(11)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 11: Cidades e Comunidades Sustentáveis</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 12)?.state || false}
                        onChange={() => ODSFilters(12)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 12: Consumo e Produção Responsáveis</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 13)?.state || false}
                        onChange={() => ODSFilters(13)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 13: Ação contra a Mudança Global do Clima</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 14)?.state || false}
                        onChange={() => ODSFilters(14)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 14: Vida na Água</span>
                    </label>
                  
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 15)?.state || false}
                        onChange={() => ODSFilters(15)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 15: Vida Terrestre</span>
                    </label>
            
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 16)?.state || false}
                        onChange={() => ODSFilters(16)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 16: Paz, Justiça e Instituições Eficazes</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ODS.find(f => f.numberODS === 17)?.state || false}
                        onChange={() => ODSFilters(17)}
                        className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                      />
                      <span>ODS 17: Parcerias e Meios de Implementação</span>
                    </label>

                  <button className="bg-blue-fcsn dark:bg-blue-fcsn3 rounded-lg p-2 text-white mt-8 mb-3 ml-2 cursor-pointer" onClick={() => applyFilters()}>Aplicar filtros</button>
                  <button className="bg-blue-fcsn dark:bg-blue-fcsn3 rounded-lg p-2 text-white mt-8 ml-4 mb-3 cursor-pointer" onClick={() => clearFilters()}>Limpar filtros</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          {/* Essa section é onde renderizamos os projetos com base na busca, filtros, ou nenhum
            1- Se search conter algo, significa que devemos pesquisar (logo encontraremos projetos ou nao com base na busca)
            2- Se não, verificamos se ctrl é true, significa que foi aplicado algum filtro (logo encontraremos projetos ou nao com base nos filtros aplicados)
            3- Se nao, renderizamos todos os projetos na pagina
          */}
          {search ? (
            resSearch.length > 0 ? (
              resSearch.map(project => (
                <Project key={project.id} {...project} />
              ))
            ) : (
              <p className="text-blue-fcsn dark:text-white-off text-xl" >Nenhum projeto encontrado com esse nome.</p>
            )
          ) : ctrl === true ? (
            filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <Project key={project.id} {...project} />
              ))
            ) : (
              <p className="text-blue-fcsn dark:text-white-off text-xl">Nenhum projeto encontrado com esse(s) filtro(s).</p>
            )
          ) : (
            AllProjects.map(project => (
              <Project key={project.id} {...project} />
            ))
          )}
        </section>
      </main>
    <Footer />
  </div>
  );
}