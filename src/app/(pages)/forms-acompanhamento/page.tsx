'use client';
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
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
        <main className="
            flex flex-col justify-between items-center
            w-screen
            h-[600vh]
            overflow-scroll">
            
            <Header></Header>
            
            <div className="
                flex flex-col justify-center items-center
                w-full
                h-[10vh]
                text-blue-fcsn text-7xl font-bold"
            >
                <h1 className="
                    w-4/5
                ">Acompanhamento de projetos</h1>
            </div>
            
            <form 
                className="
                    flex flex-col justify-center items-center
                    w-4/7
                    h-11/12
                    bg-white-off
                    rounded-sm
                    shadow-md shadow-black"
                onSubmit={(event) => handleSubmit(event)}>
                

                <div className="
                    flex flex-col justify-around
                    w-9/10
                    h-23/24">
                {/* Nome da instituição */}
                    <NormalInput
                        text="Nome da instituição:"
                        attribute={ nome }
                        setAttribute={ setNome }
                    ></NormalInput>

                {/* Breve descrição do prj */}
                    <LongInput
                        text="Breve descrição do projeto:"
                        attribute={ descricao }
                        setAttribute={ setDescricao }
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
                    ></HorizontalSelects>

                {/* Lei de incentivo do prj*/}
                    <LeiSelect
                        text="Lei de incentivo do projeto:"
                        list={[
                            "Lei de Incentivo à Cultura",
                            "PROAC – Programa de Ação Cultural",
                            "FIA - Lei Fundo para a Infância e Adolescência", 
                            "LIE - Lei de Incentivo ao Esporte", 
                            "Lei da Pessoa Idosa", 
                            "Pronas – Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência", 
                            "Pronon - Programa Nacional de Apoio à Atenção Oncológica", 
                            "Promac – Programa de Incentivo à Cultura do Município de São Paulo", 
                            "ICMS – MG Imposto sobre Circulação de Mercadoria e Serviços", 
                            "ICMS – RJ Imposto sobre Circulação de Mercadoria e Serviços", 
                            "PIE - Lei Paulista de Incentivo ao Esporte"
                        ]}
                        attribute={ lei }
                        setAttribute={ setLei }
                    ></LeiSelect>
                        
                {/* Pontos positivos do prj */}
                    <LongInput
                        text="Pontos positivos do projeto:"
                        attribute={ positivos }
                        setAttribute={ setPositivos }
                    ></LongInput>

                {/* Pontos negtivos do prj */}
                    <LongInput
                        text="Pontos negativos do projeto:" 
                        attribute={ negativos }
                        setAttribute={ setNegativos }
                    ></LongInput>

                {/* Pontos de atenção do prj */}
                    <LongInput
                        text="Pontos de atenção do projeto:"
                        attribute={ atencao }
                        setAttribute={ setAtencao }
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
                    ></HorizontalSelects>

                {/* Estados onde ele atua: */}
                    <EstadoInput
                        text="Estados onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                    ></EstadoInput>

                {/* Municipios onde ele atua: */}
                    <CidadeInput
                        text="Municípios onde o projeto atua:"
                        estados={ estados }
                        setEstados={ setEstados }
                        cidades={ cidades }
                        setCidades={ setCidades }
                    ></CidadeInput>

                {/* Especificações do territorio de atuação do prj: */}
                    <LongInput
                        text="Especificações do territorio de atuação do projeto:"
                        attribute={ especificacoes }
                        setAttribute={ setEspecificacoes }
                    ></LongInput>

                {/* Periodo de execução do prj: */}
                    <DateInputs
                        text="Período de execução do projeto:" 
                        firstAttribute={ dataComeco } 
                        setFirstAttribute={ setDataComeco } 
                        secondAttribute={ dataFim } 
                        setSecondAttribute={ setDataFim }
                    ></DateInputs>

                {/* Contrapartidas do projeto: */}
                    <LongInput 
                        text="Contrapartidas do projeto:" 
                        attribute={ contrapartidas } 
                        setAttribute={ setContrapartidas }
                    ></LongInput>

                {/* Numero total de beneficiários diretos: */}
                    <NumberInput 
                        text="Número total de beneficiários diretos no projeto:" 
                        index={0}
                        attribute={ beneficiarios }
                        setAttribute={ setBeneficiarios }
                    ></NumberInput>
                
                {/* Numero total de beneficiários indiretos: */}
                    <NumberInput 
                        text="Número total de beneficiários indiretos no projeto:" 
                        index={1}
                        attribute={ beneficiarios }
                        setAttribute={ setBeneficiarios }
                    ></NumberInput>

                {/* Adota politicas de diversidade?: */}
                    <YesNoInput 
                        text="Sua instituição adota políticas de diversidade?" 
                        list={["Sim", "Não"]}
                        attribute={ dei }
                        setAttribute={ setDei }
                    ></YesNoInput>

                {/* Amarelas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Amarelas na sua instituição:" 
                        index={0}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Brancas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Brancas na sua instituição:" 
                        index={1}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Indígenas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Indígenas na sua instituição:" 
                        index={2}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Pardas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Pardas na sua instituição:" 
                        index={3}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Pretas: */}
                    <NumberInput 
                        text="Quantidade de pessoas Pretas na sua instituição:" 
                        index={4}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Mulher cis: */}
                    <NumberInput 
                        text="Quantidade de Mulheres Cisgênero na sua instituição:" 
                        index={5}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Mulher trans: */}
                    <NumberInput 
                        text="Quantidade de Mulheres Transgênero na sua instituição:" 
                        index={6}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Homem cis: */}
                    <NumberInput 
                        text="Quantidade de Homens Cisgênero na sua instituição:" 
                        index={7}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* Homem trans: */}
                    <NumberInput 
                        text="Quantidade de Homens Transgênero na sua instituição:" 
                        index={8}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* NBs: */}
                    <NumberInput 
                        text="Quantidade de pessoas Não-Binárias na sua instituição:" 
                        index={9}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* PCDs: */}
                    <NumberInput 
                        text="Quantidade de Pessoas Com Deficiência (PCD) na sua instituição:" 
                        index={10}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* LGBTs: */}
                    <NumberInput 
                        text="Quantidade de pessoas da comunidade LGBTQIA+ na sua instituição:" 
                        index={11}
                        attribute={ etnias }
                        setAttribute={ setEtnias }
                    ></NumberInput>

                {/* ODSs: */}
                    <VerticalSelects 
                        text="Objetivos de Desenvolvimento Sustentável (ODS) contemplados pelo projeto:"
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
                    ></VerticalSelects>

                {/* Relato de um beneficiário: */}
                    <LongInput 
                        text="Breve relato de um beneficiário do projeto:" 
                        attribute={ relato } 
                        setAttribute={ setRelato }
                    ></LongInput>

                {/* Cinco fotos: */}
                    <FileInput 
                        text={"Cinco fotos das atividades do projeto:"}
                        files={fotos}
                        setFiles={setFotos}
                    ></FileInput>

                {/* Links para as website: */}
                    <NormalInput 
                        text="Link para website:" 
                        attribute={ website } 
                        setAttribute={ setWebsite }
                    ></NormalInput>

                {/* Links para as redes sociais */}
                    <LongInput 
                        text="Links para as redes sociais:" 
                        attribute={ links } 
                        setAttribute={ setLinks }
                    ></LongInput>

                {/* Contrapartidas apresentadas e executadas: */}
                    <LongInput 
                        text="Contrapartidas apresentadas e contrapartidas executadas:" 
                        attribute={ executadas } 
                        setAttribute={ setExecutadas }
                    ></LongInput>
                    
                </div>
                    
                <div className="
                    h-1/50
                    w-full">
                    <button 
                        className="
                            w-1/4 
                            h-3/4 
                            bg-blue-fcsn 
                            rounded-lg 
                            text-3xl font-bold text-white 
                            cursor-pointer 
                            mx-13"
                    >Enviar</button>
                </div>
            </form>

            <Footer></Footer>
        </main>
    );
}