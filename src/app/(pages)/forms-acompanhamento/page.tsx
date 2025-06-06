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
import { formsAcompanhamentoDados, odsList } from "@/firebase/schema/entities";
import { toast } from "sonner";


export default function forms_acompanhamento(){
    const [instituicao, setInstituicao] = useState<string>("");
    const [descricao, setDescricao] = useState<string>("");
    const [segmento, setSegmento] = useState<number>(-1);
    const [lei, setLei] = useState<number>(-1);
    const [positivos, setPositivos] = useState<string>("");
    const [negativos, setNegativos] = useState<string>("");
    const [atencao, setAtencao] = useState<string>("");
    const [ambito, setAmbito] = useState<number>(-1);
    const [estados, setEstados] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);
    const [especificacoes, setEspecificacoes] = useState<string>("");
    const [dataComeco, setDataComeco] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [contrapartidas, setContrapartidas] = useState<string>("");
    const [beneficiarios, setBeneficiarios] = useState<number[]>([0, 0]);
    const [diversidade, setDiversidade] = useState<boolean>(false);
    const [etnias, setEtnias] = useState<number[]>(new Array(12).fill(0));
    const [ODS, setODS] = useState<boolean[]>(new Array(odsList.length).fill(false));
    const [relato, setRelato] = useState<string>("");
    const [fotos, setFotos] = useState<File[]>([]);
    const [website, setWebsite] = useState<string>("");
    const [links, setLinks] = useState<string>("");
    const [executadas, setExecutadas] = useState<string>("");

    const projetoID = "some-projeto-id"; // Tem que dar um jeito para como pegar o id do projeto do qual o usuário está respondendo o forms
    const usuarioID = "some-user-id"; // Trocar para o ID do usuário quando a parte de autenticação estiver pronta

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast.loading("Enviando formulário...");

        try {

            const fotoURLs: string[] = [];
            for (const file of fotos) {
                const storageRef = ref(storage, `forms-acompanhamento-fotos/${projetoID}/${file.name}-${Date.now()}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                fotoURLs.push(downloadURL);
            }
            const getOdsIds = (selectedOds: boolean[]): number[] => {
                const ids: number[] = [];
                selectedOds.forEach((isSelected, index) => {
                    if (isSelected) {
                        ids.push(odsList[index].id);
                    }
                });
                return ids;
            };

            const uploadFirestore: formsAcompanhamentoDados = {
                projetoID: projetoID,
                dataResposta: new Date().toISOString().split('T')[0],
                usuarioID: usuarioID,
                instituicao: instituicao,
                descricao: descricao,
                segmento: segmento,
                lei: lei,
                pontosPositivos: positivos || "",
                pontosNegativos: negativos || "",
                pontosAtencao: atencao || "",
                ambito: ambito,
                qtdEstados: estados.length,
                estados: estados,
                qtdMunicipios: cidades.length,
                municipios: cidades,
                especificacoes: especificacoes,
                dataInicial: dataComeco,
                dataFinal: dataFim,
                contrapartidasProjeto: contrapartidas,
                beneficiariosDiretos: beneficiarios[0],
                beneficiariosIndiretos: beneficiarios[1],
                diversidade: diversidade,
                qtdAmarelas: etnias[0],
                qtdBrancas: etnias[1],
                qtdIndigenas: etnias[2],
                qtdPardas: etnias[3],
                qtdPretas: etnias[4],
                qtdMulherCis: etnias[5],
                qtdMulherTrans: etnias[6],
                qtdHomemCis: etnias[7],
                qtdHomemTrans: etnias[8],
                qtdNaoBinarios: etnias[9],
                qtdPCD: etnias[10],
                qtdLGBT: etnias[11],
                ods: getOdsIds(ODS),
                relato: relato || "",
                fotos: fotoURLs,
                website: website,
                links: links,
                contrapartidasExecutadas: executadas || "",
            };

            const docRef = await addDoc(collection(db, "forms-acompanhamento"), uploadFirestore);
            toast.success(`Formulário enviado com sucesso! ID: ${docRef.id}`);
            
            // Reseta os valores dos campos do forms
            setInstituicao("");
            setDescricao("");
            setSegmento(-1);
            setLei(-1);
            setPositivos("");
            setNegativos("");
            setAtencao("");
            setAmbito(-1);
            setEstados([]);
            setCidades([]);
            setEspecificacoes("");
            setDataComeco("");
            setDataFim("");
            setContrapartidas("");
            setBeneficiarios([0, 0]);
            setDiversidade(false);
            setEtnias(new Array(12).fill(0));
            setODS(new Array(odsList.length).fill(false));
            setRelato("");
            setFotos([]);
            setWebsite("");
            setLinks("");
            setExecutadas("");

        } catch (error) {
            console.error("Erro ao enviar formulário: ", error);
            toast.error("Erro ao enviar formulário. Tente novamente.");
        }
    };


    return(
        <main
            className="flex flex-col justify-between items-center w-[screen] h-[dvh] overflow-hidden no-scrollbar">
            
            
            <div className="flex flex-col items-center justify-center w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh] text-blue-fcsn dark:text-white-off text-7xl font-bold"
            >
                <h1 className="text-center w-[90dvw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
                ">Acompanhamento de projetos</h1>
            </div>
            
            <form 
                className="flex flex-col justify-center items-center w-[90svw] sm:w-[80dvw] md:w-[80dvw] xl:w-[70dvw] h-90/100 mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-sm shadow-md shadow-black overflow-hidden no-scrollbar"
                onSubmit={(event) => handleSubmit(event)}>
                

                <div className="flex flex-col justify-around w-11/12 h-23/24 py-10">
                {/* Nome da instituição */}
                    <NormalInput
                        text="Nome da instituição:"
                        attribute={ instituicao }
                        setAttribute={ setInstituicao }
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
                        attribute={ diversidade }
                        setAttribute={ setDiversidade }
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
                    
                <div className="flex flex-grow items-start w-full">
                    <button 
                        type="submit"
                        className="w-[110px] md:w-[150px] h-[60px] md:h-[75px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-xl md:text-3xl font-bold text-white  ease-in-out cursor-pointer ml-[3dvw] mb-10"
                    >Enviar</button>
                </div>
            </form>
            <Toaster richColors /> {/* Ensure Toaster is rendered */}
            <Footer></Footer>
        </main>
    );
}