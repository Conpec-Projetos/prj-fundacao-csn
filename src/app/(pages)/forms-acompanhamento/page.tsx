'use client';
import Footer from "@/components/footer/footer";
import { useState } from "react";
import {
    NormalInput, 
    LongInput,
    NumberInput,
    HorizontalSelects,
    VerticalSelects,
    DateInputs,
    EstadoInput,
    LeiSelect,
    YesNoInput,
    FileInput,
    CidadeInput
    } from "@/components/inputs/inputs";
import { Toaster } from "sonner";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, updateDoc, addDoc, arrayUnion } from "firebase/firestore";
import { db, storage } from "@/firebase/firebase-config";
import { formsAcompanhamentoData } from "@/firebase/schema/entities";


export default function forms_acompanhamento(){

    const [nome,setNome] = useState<string>("");
    const [descricao,setDescricao] = useState<string>("");
    const [positivos,setPositivos] = useState<string>("");
    const [negativos,setNegativos] = useState<string>("");
    const [atencao,setAtencao] = useState<string>("");
    const [especificacoes,setEspecificacoes] = useState<string>("");
    const [contrapartidas,setContrapartidas] = useState<string>("");
    const [website,setWebsite] = useState<string>("");
    const [links,setLinks] = useState<string>("");
    const [executadas,setExecutadas] = useState<string>("");
    const [relato,setRelato] = useState<string>("");
    const [ambito,setAmbito] = useState<number>(0);
    const [segmento,setSegmento] = useState<number>(0);
    const [lei,setLei] = useState<number>(0);
    const [dataComeco,setDataComeco] = useState<string>("");
    const [dataFim,setDataFim] = useState<string>("");
    const [beneficiarios,setBeneficiarios] = useState<number[]>(Array(2).fill(0));
    const [dei,setDei] = useState<boolean>(false);
    const [etnias, setEtnias] = useState<number[]>(Array(12).fill(0));
    const [ODS,setODS] = useState<boolean[]>(Array(17).fill(false));
    const [estados, setEstados] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);
    const [fotos,setFotos] = useState<File[]>([]);

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
        <main
            className="flex flex-col justify-between items-center w-[screen] h-[dvh] overflow-hidden no-scrollbar">
            
            
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
                ">Acompanhamento de projetos</h1>
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
                

                <div className="flex flex-col justify-around w-11/12 h-23/24 py-10">
                {/* Nome da instituição */}
                    <NormalInput
                        text="Nome da instituição:"
                        attribute={ nome }
                        setAttribute={ setNome }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Breve descrição do prj */}
                    <LongInput
                        text="Breve descrição do projeto:"
                        attribute={ descricao }
                        setAttribute={ setDescricao }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Seg do Projeto */}
                    <HorizontalSelects
                        text="Segmento do projeto:"
                        list={[
                            "Cultura", 
                            "Esporte", 
                            "Pessoa Idosa", 
                            "Criança e Adolescente", 
                            "Saúde"
                        ]}
                        attribute={ segmento }
                        setAttribute={ setSegmento }
                        isNotMandatory={false}
                    ></HorizontalSelects>

                {/* Lei de incentivo do prj*/}
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
                        
                {/* Pontos positivos do prj */}
                    <LongInput
                        text="Pontos positivos do projeto:"
                        attribute={ positivos }
                        setAttribute={ setPositivos }
                        isNotMandatory={true}
                    ></LongInput>

                {/* Pontos negtivos do prj */}
                    <LongInput
                        text="Pontos negativos do projeto:" 
                        attribute={ negativos }
                        setAttribute={ setNegativos }
                        isNotMandatory={true}
                    ></LongInput>

                {/* Pontos de atenção do prj */}
                    <LongInput
                        text="Pontos de atenção do projeto:"
                        attribute={ atencao }
                        setAttribute={ setAtencao }
                        isNotMandatory={true}
                    ></LongInput>
                
                {/* Ambito de desenvolvimento do prj */}
                    <HorizontalSelects
                        text="Âmbito de desenvolvimento do projeto:"
                        list={[
                            "Nacional",
                            "Estadual",
                            "Municipal"
                        ]}
                        attribute={ ambito }
                        setAttribute={ setAmbito }
                        isNotMandatory={false}
                    ></HorizontalSelects>

                {/* Estados onde ele atua: */}
                    <EstadoInput
                        text="Estados onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                        isNotMandatory={false}
                    ></EstadoInput>

                {/* Municipios onde ele atua: */}
                    <CidadeInput
                        text="Municípios onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                        isNotMandatory={false}
                    ></CidadeInput>

                {/* Especificações do territorio de atuação do prj: */}
                    <LongInput
                        text="Especificações do territorio de atuação do projeto:"
                        attribute={ especificacoes }
                        setAttribute={ setEspecificacoes }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Periodo de execução do prj: */}
                    <DateInputs
                        text="Período de execução do projeto:" 
                        firstAttribute={ dataComeco } 
                        setFirstAttribute={ setDataComeco } 
                        secondAttribute={ dataFim } 
                        setSecondAttribute={ setDataFim }
                        isNotMandatory={false}
                    ></DateInputs>

                {/* Contrapartidas do projeto: */}
                    <LongInput 
                        text="Contrapartidas do projeto:" 
                        attribute={ contrapartidas } 
                        setAttribute={ setContrapartidas }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Numero total de beneficiários diretos: */}
                    <NumberInput 
                        text="Número total de beneficiários diretos no projeto:" 
                        index={0}
                        attribute={ beneficiarios }
                        setAttribute={ setBeneficiarios }
                        isNotMandatory={false}
                    ></NumberInput>
                
                {/* Numero total de beneficiários indiretos: */}
                    <NumberInput 
                        text="Número total de beneficiários indiretos no projeto:" 
                        index={1}
                        attribute={ beneficiarios }
                        setAttribute={ setBeneficiarios }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Adota politicas de diversidade?: */}
                    <YesNoInput 
                        text="Sua instituição adota políticas de diversidade?" 
                        list={["Sim", "Não"]}
                        attribute={ dei }
                        setAttribute={ setDei }
                        isNotMandatory={false}
                    ></YesNoInput>

                {/* Amarelas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Amarelas na sua instituição:" 
                        index={0}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Brancas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Brancas na sua instituição:" 
                        index={1}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Indígenas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Indígenas na sua instituição:" 
                        index={2}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Pardas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Pardas na sua instituição:" 
                        index={3}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Pretas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Pretas na sua instituição:" 
                        index={4}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Mulher cis: */}
                    <NumberInput 
                        text="Quantidade de Mulheres Cisgênero na sua instituição:" 
                        index={5}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Mulher trans: */}
                    <NumberInput 
                        text="Quantidade de Mulheres Transgênero na sua instituição:" 
                        index={6}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Homem cis: */}
                    <NumberInput 
                        text="Quantidade de Homens Cisgênero na sua instituição:" 
                        index={7}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* Homem trans: */}
                    <NumberInput 
                        text="Quantidade de Homens Transgênero na sua instituição:" 
                        index={8}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* NBs: */}
                    <NumberInput 
                        text="Quantidade de pessoas Não-Binárias na sua instituição:" 
                        index={9}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* PCDs: */}
                    <NumberInput 
                        text="Quantidade de Pessoas Com Deficiência (PCD) na sua instituição:" 
                        index={10}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

                {/* LGBTs: */}
                    <NumberInput 
                        text="Quantidade de pessoas da comunidade LGBTQIA+ na sua instituição:" 
                        index={11}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                        isNotMandatory={false}
                    ></NumberInput>

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
                    ></VerticalSelects>

                {/* Relato de um beneficiário: */}
                    <LongInput 
                        text="Breve relato de um beneficiário do projeto:" 
                        attribute={ relato } 
                        setAttribute={ setRelato }
                        isNotMandatory={true}
                    ></LongInput>

                {/* Cinco fotos: */}
                    <FileInput 
                        text={"Cinco fotos das atividades do projeto:"}
                        files={fotos}
                        setFiles={setFotos}
                        isNotMandatory={false}
                    ></FileInput>

                {/* Links para as website: */}
                    <NormalInput 
                        text="Link para website:" 
                        attribute={ website } 
                        setAttribute={ setWebsite }
                        isNotMandatory={false}
                    ></NormalInput>

                {/* Links para as redes sociais */}
                    <LongInput 
                        text="Links para as redes sociais:" 
                        attribute={ links } 
                        setAttribute={ setLinks }
                        isNotMandatory={false}
                    ></LongInput>

                {/* Contrapartidas apresentadas e executadas: */}
                    <LongInput 
                        text="Contrapartidas apresentadas e contrapartidas executadas:" 
                        attribute={ executadas } 
                        setAttribute={ setExecutadas }
                        isNotMandatory={true}
                    ></LongInput>
                    
                </div>
                    
                <div className="flex items-start w-full">
                    <button 
                        className="
                            w-[15dvw] min-w-[150px] max-w-[290px]
                            h-[9dvh] min-h-[50px] max-h-[75px]
                            bg-blue-fcsn
                            hover:bg-blue-fcsn3
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