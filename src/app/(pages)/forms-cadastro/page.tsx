'use client';
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { Dispatch, SetStateAction, useState } from "react";
import {
    NormalInput,
    ShortInput,
    LongInput,
    NumberInput,
    HorizontalSelects,
    VerticalSelects,
    DateInputs,
    EstadoInput,
    LeiSelect,
    YesNoInput,
    FileInput,
    CidadeInput,
    GrowInput,
    FileInputBlank
    } from "@/components/inputs/inputs";
import { Toaster } from "sonner";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, updateDoc, addDoc, arrayUnion } from "firebase/firestore";
import { db, storage } from "@/firebase/firebase-config";
import { formsAcompanhamentoData } from "@/firebase/schema/entities";
import { set } from "zod";
enum Publico {
    Crianças = "Crianças",
    Adolescentes = "Adolescentes",
    Jovens = "Jovens",
    Adultos = "Adultos",
    Idosos = "Idosos",
    Outros= ""
}

interface VerticalProps{
    text: string;
    subtext: string;
    list: string[];
    attribute: string[];
    setAttribute: Dispatch<SetStateAction<string[]>>;
}

export default function forms_acompanhamento(){

    const [nome,setNome] = useState<string>("");
    const [cnpj,setCnpj] = useState<string>("");
    const [representante_legal,setRepresentanteLegal] = useState<string>("");
    const [telefone,setTelefone] = useState<string>("");
    const [email_replegal,setEmailRepLegal] = useState<string>("");
    const [email_responsavel,setEmailResponsavel] = useState<string>("");
    const [cep,setCep] = useState<string>("");
    const [endereco,setEndereco] = useState<string>("");
    const [numero,setNumero] = useState<string>("");
    const [complemento,setComplemento] = useState<string>("");
    const [cidade,setCidade] = useState<string>("");
    const [estado,setEstado] = useState<string>("");
    const [nome_projeto,setNomeProjeto] = useState<string>("");
    const [link,setLink] = useState<string>("");
    const [valor_aprovado,setValorAprovado] = useState<string>("");
    const [valor_apto,setValorApto] = useState<string>("");
    const [dataComeco,setDataComeco] = useState<string>("");
    const [dataFim,setDataFim] = useState<string>("");
    const [diario_oficial,setDiarioOficial] = useState<File[]>([]);
    const [banco,setBanco] = useState<string>("");
    const [agencia,setAgencia] = useState<string>("");
    const [conta_corrente,setContaCorrente] = useState<string>("");
    const [area_atuacao,setAreaAtuacao] = useState<string>("");
    const [publico, setPublico] = useState<string[]>([]);
    const [ODS, setODS] = useState<string[]>([]);
    const [descricao,setDescricao] = useState<string>("");
    const [apresentacao,setApresentacao] = useState<File[]>([]);
    const [num_publico,setNumPublico] = useState<string>("");
    const [estados, setEstados] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);
    const [qtde_estados,setQtdeEstados] = useState<string>("");
    const [qtde_municipios,setQtdeMunicipios] = useState<string>("");
    const [lei,setLei] = useState<number>(0);
    const [numero_aprovacao,setNumeroAprovacao] = useState<string>("");
    const [contrapartidas,setContrapartidas] = useState<string>("");
    const [observacoes,setObservacoes] = useState<string>("");
    

    const uploadFiles = async (files: FileList) => {
        const fileURLs = [];
        for(const file of files){
            const fileRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileURL = await getDownloadURL(fileRef);
            fileURLs.push(fileURL);
        }
        return fileURLs;
    };
    // fotos tem que ser feitas primeiro, então salvamos os links das imagens e subimos com o forms

    const prepareData = async (fileURLs: string[], userID: string, projectID: string) => {
        return{
            projectID: projectID,
            userID: userID,
            nome,
            descricao,
            positivos,
            negativos,
            atencao,
            especificacoes,
            contrapartidas,
            website,
            links,
            executadas,
            relato,
            ambito,
            segmento,
            lei,
            dataComeco,
            dataFim,
            beneficiarios: arrayUnion(...beneficiarios),
            dei,
            etnias: arrayUnion(...etnias),
            ODS: arrayUnion(...ODS),
            estados: arrayUnion(...estados),
            cidades: arrayUnion(...cidades),
            fotos: arrayUnion(...fileURLs)
        }
    }

    const saveData = async (data: formsAcompanhamentoData) => {
        const docRef = doc(db, "forms");
        await setDoc(docRef, data);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const fileUrls = await uploadFiles(fotos);
            const data = prepareData(fileUrls);
            await saveData(data);
            alert("Data uploaded successfully!");
          } catch (error) {
            console.error("Error uploading data: ", error);
            alert("Failed to upload data.");
          }
    }


    return(
        <main className="'
            flex flex-col justify-between items-center
            w-[screen]
            h-[dvh]
            overflow-hidden
            no-scrollbar">
            
            
            <div className="
                flex flex-col items-center justify-center
                w-full
                h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh]
                text-blue-fcsn dark:text-white-off text-7xl font-bold"
            >
                <h1 className="
                    text-center
                    w-[90dvw]
                    text-wrap
                    text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
                    transition-all duration-500 ease-in-out
                ">Inscrição de Projeto</h1>
            </div>
            
            <form 
                className="
                    flex flex-col justify-center items-center 
                    w-[90svw] sm:w-[80dvw] md:w-[80dvw] xl:w-[70dvw]
                    h-90/100
                    mb-20
                    bg-white-off dark:bg-blue-fcsn2
                    rounded-sm 
                    shadow-md shadow-black
                    overflow-hidden
                    no-scrollbar
                    transition-all duration-500 ease-in-out"
                onSubmit={(event) => handleSubmit(event)}>
                

                <div className="
                    flex flex-col justify-around
                    w-11/12
                    h-23/24
                    my-10">
                {/* Nome da instituição */}
                    <NormalInput
                        text="Nome da instituição:"
                        attribute={ nome }
                        setAttribute={ setNome }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* CNPJ */}
                    <NormalInput
                        text="CNPJ:"
                        attribute={ cnpj }
                        setAttribute={ setCnpj }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Representante legal */}
                    <NormalInput
                        text="Representante legal:"
                        attribute={ representante_legal }
                        setAttribute={ setRepresentanteLegal }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Telefone do representante legal */}
                    <NormalInput
                        text="Telefone do representante legal:"
                        attribute={ telefone }
                        setAttribute={ setTelefone }
                        isNotMandatory={false}
                    ></NormalInput>
                        
                {/* Email do representante legal */}
                    <NormalInput
                        text="E-mail do representante legal:"
                        attribute={ email_replegal }
                        setAttribute={ setEmailRepLegal }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Email do responsável */}
                    <NormalInput
                        text="E-mail da pessoa responsável por passar informações para a Fundação:"
                        attribute={ email_responsavel }
                        setAttribute={ setEmailResponsavel }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* CEP */}
                    <NormalInput
                        text="CEP:"
                        attribute={ cep }
                        setAttribute={ setCep }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Endereço */}
                    <NormalInput
                        text="Endereço:"
                        attribute={ endereco }
                        setAttribute={ setEndereco }
                        isNotMandatory={false}
                    ></NormalInput>

                <div className="flex flex-row h-full w-full justify-between items-center gap-5">
                    {/* Número */}
                    <ShortInput
                            text="Número:"
                            attribute={ numero }
                            setAttribute={ setNumero }
                            isNotMandatory={false}
                        ></ShortInput>

                    {/* Complemento */}
                    <GrowInput
                            text="Complemento:"
                            attribute={ complemento }
                            setAttribute={ setComplemento }
                            isNotMandatory={true}
                        ></GrowInput>
                </div>
                
                <div className="flex flex-row h-full w-full justify-between items-center gap-5">
                    {/* Cidade */}
                    <GrowInput
                            text="Cidade:"
                            attribute={ cidade }
                            setAttribute={ setCidade }
                            isNotMandatory={false}
                        ></GrowInput>

                    {/* Estado */}
                    <ShortInput
                            text="Estado:"
                            attribute={ estado }
                            setAttribute={ setEstado}
                            isNotMandatory={false}
                        ></ShortInput>
                </div>

                {/* Nome do Projeto */}
                    <NormalInput
                        text="Nome do Projeto:"
                        attribute={ nome_projeto }
                        setAttribute={ setNomeProjeto }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Link para website */}
                    <NormalInput
                        text="Link para website:"
                        attribute={ link }
                        setAttribute={ setLink }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Valor Aprovado */}
                    <NumberInput
                        text="Valor aprovado:"
                        attribute={ valor_aprovado }
                        setAttribute={ setValorAprovado }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Valor Apto a Captar */}
                    <NumberInput
                        text="Valor apto a captar:"
                        attribute={ valor_apto }
                        setAttribute={ setValorApto }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Período de Captação */}
                    <DateInputs
                        text="Período de captação:" 
                        firstAttribute={ dataComeco } 
                        setFirstAttribute={ setDataComeco } 
                        secondAttribute={ dataFim } 
                        setSecondAttribute={ setDataFim }
                        isNotMandatory={false}
                    ></DateInputs>

                {/* Diário Oficial */}
                    <FileInputBlank 
                        text={"Diário Oficial:"}
                        files={diario_oficial}
                        setFiles={setDiarioOficial}
                        isNotMandatory={false}
                    ></FileInputBlank>

                <h1 className="mt-5
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
                >Dados Bancários</h1>
                
                <div className="flex flex-col ml-7 mr-7">
                    {/* Banco */}
                        <NormalInput
                            text="Banco:"
                            attribute={ banco }
                            setAttribute={ setBanco }
                            isNotMandatory={false}
                        ></NormalInput>

                    <div className="flex flex-row h-full w-full justify-between items-center">
                        {/* Agência */}
                        <NormalInput
                                text="Agência"
                                attribute={ agencia }
                                setAttribute={ setAgencia }
                                isNotMandatory={false}
                            ></NormalInput>

                        {/* Conta Corrente */}
                        <NormalInput
                                text="Conta Corrente:"
                                attribute={ conta_corrente }
                                setAttribute={ setContaCorrente }
                                isNotMandatory={false}
                            ></NormalInput>
                    </div>
                </div>
                

                {/* Área de atuação */}
                    <HorizontalSelects
                        text="Área de atuação:"
                        list={[
                            "Cultura", 
                            "Esporte", 
                            "Pessoa Idosa", 
                            "Criança e Adolescente", 
                            "Saúde"
                        ]}
                        attribute={ area_atuacao }
                        setAttribute={ setAreaAtuacao }
                    ></HorizontalSelects>

                {/* Breve descrição do projeto */}
                    <LongInput
                        text="Breve descrição do projeto:"
                        attribute={ descricao }
                        setAttribute={ setDescricao }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Apresentação do projeto */}
                    <FileInputBlank 
                        text={"Apresentação do projeto:"}
                        files={apresentacao}
                        setFiles={setApresentacao}
                        isNotMandatory={false}
                    ></FileInputBlank>

                {/* Público beneficiado */}
                <div className="
                    flex flex-col justify-between items-start
                    py-3
                    gap-y-2">
                        
                    <h1 className="
                    w-full
                    text-xl md:text-xl lg:lg
                    text-blue-fcsn dark:text-white-off font-bold"
                    >Público beneficiado: <span className="text-[#B15265]">*</span></h1>
                    
                    <div className="flex flex-col gap-y-2 text-xl">

                            <div className="flex flex-row gap-1 items-center">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <p>Crianças</p>
                            </div>

                            <div className="flex flex-row gap-1 items-center">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <p>Adolescentes</p>
                            </div> 

                            <div className="flex flex-row gap-1 items-center">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <p>Jovens</p>
                            </div> 

                            <div className="flex flex-row gap-1 items-center">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <p>Adultos</p>
                            </div> 

                            <div className="flex flex-row gap-1 items-center">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <p>Idosos</p>
                            </div>

                            <div className="flex flex-row gap-1 items-center w-96
                            ">  
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                                <div className=" flex flex-row gap-3 items-center">
                                    <p>Outro:</p>
                                    <input type="text" className="bg-white dark:bg-blue-fcsn3 w-3/4 h-[4dvh] rounded-[7px] border-1 border-blue-fcsn transition-all duration-300 focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3"/>
                                </div>
                            </div> 
                    
                    </div>
                </div>

                {/* ODSs: */}
                    <VerticalSelects 
                        text="Objetivos de Desenvolvimento Sustentável (ODS) contemplados pelo projeto:"
                        subtext="Selecione até 3 opções."
                        list={[
                            "Erradicação da Pobreza",
                            "Fome Zero e Agricultura Sustentável",
                            "Saúde e Bem-estar",
                            "Educação de qualidade",
                            "Igualdade de Gênero",
                            "Agua potável e Saneamento",
                            "Energia Acessível e Limpa",
                            "Trabalho decente e Crescimento Econômico",
                            "Indústria, Inovação e Infraestrutura",
                            "Redução das Desigualdades",
                            "Cidades e Comunidades Sustentáveis",
                            "Consumo e Produção Responsáveis",
                            "Ação contra a Mudança Global do Clima",
                            "Vida na Água",
                            "Vida Terrestre",
                            "Paz, Justiça e Instituições Eficazes",
                            "Parcerias e Meios de Implementação"
                        ]}
                        attribute={ ODS }
                        setAttribute={ setODS }
                        isNotMandatory={false}
                        maxSelect={3}
                    ></VerticalSelects>

                {/* Número de público direto que será impactado */}
                    <NumberInput
                        text="Número de público direto que será impactado:"
                        attribute={ num_publico }
                        setAttribute={ setNumPublico }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Quantidade de estados onde o projeto atua */}
                    <NumberInput
                        text="Quantidade de estados onde o projeto atua:"
                        attribute={ qtde_estados }
                        setAttribute={ setQtdeEstados }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Estados onde o projeto atua */}
                    <EstadoInput
                        text="Estados onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                        isNotMandatory={false}
                    ></EstadoInput>

                {/* Quantidade de municípios onde o projeto atua */}
                    <NumberInput
                        text="Quantidade de municípios onde o projeto atua:"
                        attribute={ qtde_municipios }
                        setAttribute={ setQtdeMunicipios }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Municípios onde o projeto atua */}
                    <CidadeInput
                        text="Municípios onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                        isNotMandatory={false}
                    ></CidadeInput>

                {/* Lei de incentivo do projeto */}
                    <LeiSelect
                        text="Lei de incentivo do projeto:"
                        list={[
                            "Lei de Incentivo à Cultura",
                            "PROAC - Programa de Ação Cultural",
                            "FIA - Lei Fundo para a Infância e Adolescência", 
                            "LIE - Lei de Incentivo ao Esporte", 
                            "Lei da Pessoa Idosa", 
                            "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência", 
                            "Pronon - Programa Nacional de Apoio à Atenção Oncológica", 
                            "Promac - Programa de Incentivo à Cultura do Município de São Paulo", 
                            "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços", 
                            "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços", 
                            "PIE - Lei Paulista de Incentivo ao Esporte"
                        ]}
                        attribute={ lei }
                        setAttribute={ setLei }
                        isNotMandatory={false}
                    ></LeiSelect>

                {/* Número de aprovação do projeto por lei */}
                    <NormalInput
                        text="Número de aprovação do projeto por lei:"
                        attribute={ numero_aprovacao }
                        setAttribute={ setNumeroAprovacao }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Contrapartida */}
                    <LongInput
                        text="Contrapartidas:"
                        attribute={ contrapartidas }
                        setAttribute={ setContrapartidas }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Observações */}
                    <LongInput
                        text="Observações:"
                        attribute={ observacoes }
                        setAttribute={ setObservacoes }
                        isNotMandatory={false}
                    ></LongInput>
                    

                <div className="flex flex-row gap-2 items-center">
                    <input type="checkbox" className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"/>
                    <p className="text-xl">Eu declaro ter lido e concordado com os termos de uso e a política de privacidade<span className="text-[#B15265]"> *</span></p>
                </div>
                
                </div>

                
                    
                <div className="
                    flex items-start
                    w-full">
                    <button 
                        className="
                            w-[15dvw] min-w-[150px] max-w-[290px]
                            h-[9dvh] min-h-[50px] max-h-[75px]
                            bg-blue-fcsn dark:bg-blue-fcsn3
                            hover:bg-blue-fcsn2 dark:hover:bg-[#4A4A5E]
                            rounded-[7px]
                            text-3xl lg:text-4xl font-bold
                            text-white
                            transition-all duration-500 ease-in-out
                            cursor-pointer
                            ml-[3dvw] mb-10"
                    >Enviar</button>
                </div>
            </form>

            <Footer></Footer>
        </main>
    );
}