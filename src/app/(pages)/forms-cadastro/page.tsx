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
    FileInput,
    CidadeInput,
    GrowInput,
    PublicoBeneficiadoInput,
    SingleEstadoInput
    } from "@/components/inputs/inputs";
import { Toaster, toast } from "sonner";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formsCadastroDados, odsList, leiList, segmentoList, formsCadastroDocumentos, Projetos } from "@/firebase/schema/entities";
import { getFileUrl, getOdsIds, getPublicoNomes, getItemNome } from "@/lib/utils";


export default function FormsCadastro(){

    const [currentPage, setCurrentPage] = useState(1);
    const [instituicao, setInstituicao] = useState<string>("");
    const [cnpj, setCnpj] = useState<string>("");
    const [representanteLegal, setRepresentanteLegal] = useState<string>("");
    const [telefone, setTelefone] = useState<string>("");
    const [emailRepLegal, setEmailRepLegal] = useState<string>("");
    const [emailResponsavel, setEmailResponsavel] = useState<string>("");
    const [cep, setCep] = useState<string>("");
    const [endereco, setEndereco] = useState<string>("");
    const [numero, setNumero] = useState<number[]>([0]);
    const [complemento, setComplemento] = useState<string>("");
    const [cidade, setCidade] = useState<string>("");
    const [estado, setEstado] = useState<string>("");
    const [nomeProjeto, setNomeProjeto] = useState<string>("");
    const [website, setWebsite] = useState<string>("");
    const [valores, setValores] = useState<number[]>([0,0]);
    const [dataComeco, setDataComeco] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [diario, setDiario] = useState<File[]>([]);
    const [banco, setBanco] = useState<string>("");
    const [agencia, setAgencia] = useState<string>("");
    const [conta, setConta] = useState<string>("");
    const [segmento, setSegmento] = useState<number>(-1);
    const [descricao, setDescricao] = useState<string>("");
    const [apresentacao, setApresentacao] = useState<File[]>([]);
    const [publico, setPublico] = useState<boolean[]>([]);
    const [outroPublico, setOutroPublico] = useState<string>("");
    const [ODS, setODS] = useState<boolean[]>(new Array(odsList.length).fill(false));
    const [numPublico, setNumPublico] = useState<number[]>([0]);
    const [estados, setEstados] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);
    const [lei, setLei] = useState<number>(-1);
    const [numeroLei, setNumeroLei] = useState<string>("");
    const [contrapartidas, setContrapartidas] = useState<string>("");
    const [observacoes, setObservacoes] = useState<string>("");
    const [termosPrivacidade, setTermosPrivacidade] = useState<boolean>(false);

    const [compliance, setCompliance] = useState<File[]>([]);
    const [documentos, setDocumentos] = useState<File[]>([]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const loadingToastId = toast.loading("Enviando formulário...");

        try {
            const uploadFirestore: formsCadastroDados = {
                dataPreenchido: new Date().toISOString().split('T')[0],
                instituicao: instituicao,
                cnpj: cnpj,
                representante: representanteLegal,
                telefone: telefone,
                emailLegal: emailRepLegal,
                emailResponsavel: emailResponsavel,
                cep: cep,
                endereco: endereco,
                numeroEndereco: numero[0],
                complemento: complemento || "",
                cidade: cidade,
                estado: estado,
                nomeProjeto: nomeProjeto,
                website: website,
                valorAprovado: valores[0],
                valorApto: valores[1],
                dataInicial: dataComeco,
                dataFinal: dataFim,
                banco: banco,
                agencia: agencia,
                conta: conta,
                segmento: getItemNome(segmento, segmentoList),
                descricao: descricao,
                publico: getPublicoNomes(publico, outroPublico),
                ods: getOdsIds(ODS),
                beneficiariosDiretos: numPublico[0],
                qtdEstados: estados.length,
                estados: estados,
                qtdMunicipios: cidades.length,
                municipios: cidades,
                lei: getItemNome(lei, leiList),
                numeroLei: numeroLei,
                contrapartidasProjeto: contrapartidas,
                observacoes: observacoes,
                termosPrivacidade: termosPrivacidade,
            };

            const docRef = await addDoc(collection(db, "forms-cadastro"), uploadFirestore);

            const createProjeto: Projetos = {
                nome: nomeProjeto,
                municipios: cidades,
                status: "pendente",
                ativo: false,
                compliance: "pendente", // De início, o projeto não tem nenhum dos trës aprovados
                empresas: [""],
                indicacao: "",
                ultimoFormulario: docRef.id, // Armazena o ID do forms de cadastro que acabou de ser enviado
                valorAportadoReal: 0
            }

            const docProjetoRef = await addDoc(collection(db, "projetos"), createProjeto);
            const projetoID = docProjetoRef.id;

            // Agora, vamos dar update no projeto que acabamos de criar com os links dos documentos enviados:

            const diarioUrl = await getFileUrl(diario, projetoID, "diario");
            const apresentacaoUrl = await getFileUrl(apresentacao, projetoID, "apresentacao");
            const complianceUrl = await getFileUrl(compliance, projetoID, "compliance");
            const documentosUrl = await getFileUrl(documentos, projetoID);

            const updateDocumentos : formsCadastroDocumentos = {
                projetoID: docProjetoRef.id,
                diario: diarioUrl,
                apresentacao: apresentacaoUrl,
                compliance: complianceUrl,
                documentos: documentosUrl,
            };

            await updateDoc(doc(db, "forms-cadastro", docRef.id), { ...updateDocumentos });

            toast.dismiss(loadingToastId);
            toast.success(`Formulário enviado com sucesso!`);
            

        } catch (error) {
            console.error("Erro ao enviar formulário: ", error);
            toast.dismiss(loadingToastId);
            toast.error("Erro ao enviar formulário. Tente novamente.");
        }
    };

    return(
        <main className="flex flex-col justify-between items-center w-[screen] h-[dvh] overflow-hidden no-scrollbar">
            
            <div className="flex flex-col items-center justify-center w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh] text-blue-fcsn dark:text-white-off text-7xl font-bold"
            >
                <h1 className="text-center w-[90dvw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
                 >Inscrição de Projeto</h1>
            </div>
            
            <form 
                className="flex flex-col justify-center items-center w-[90svw] sm:w-[80dvw] md:w-[80dvw] xl:w-[70dvw] h-90/100 mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-sm  shadow-md shadow-gray-400 dark:shadow-gray-900 overflow-hidden no-scrollbar"
                onSubmit={(event) => handleSubmit(event)}>
                    
                {currentPage === 1 && (
                <>
                    <div className="flex flex-col justify-around w-11/12 h-23/24 my-10">

                    {/* Nome da instituição */}
                        <NormalInput
                            text="Nome da instituição:"
                            attribute={ instituicao }
                            setAttribute={ setInstituicao }
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
                            attribute={ representanteLegal }
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
                            attribute={ emailRepLegal }
                            setAttribute={ setEmailRepLegal }
                            isNotMandatory={false}
                        ></NormalInput>

                    {/* Email do responsável */}
                        <NormalInput
                            text="E-mail do responsável:"
                            attribute={ emailResponsavel }
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
                        <NumberInput
                                text="Número:"
                                index={0}
                                attribute={ numero }
                                setAttribute={ setNumero }
                                isNotMandatory={false}
                            ></NumberInput>

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
                        <SingleEstadoInput
                                text="Estado:"
                                attribute={ estado }
                                setAttribute={ setEstado}
                                isNotMandatory={false}
                            ></SingleEstadoInput>
                    </div>

                    {/* Nome do Projeto */}
                        <NormalInput
                            text="Nome do Projeto:"
                            attribute={ nomeProjeto }
                            setAttribute={ setNomeProjeto }
                            isNotMandatory={false}
                        ></NormalInput>

                    {/* Link para website */}
                        <NormalInput
                            text="Link para website:"
                            attribute={ website }
                            setAttribute={ setWebsite }
                            isNotMandatory={false}
                        ></NormalInput>

                    {/* Valor Aprovado */}
                        <NumberInput
                            text="Valor aprovado:"
                            index={0}
                            attribute={ valores }
                            setAttribute={ setValores }
                            isNotMandatory={false}
                        ></NumberInput>

                    {/* Valor Apto a Captar */}
                        <NumberInput
                            text="Valor apto a captar:"
                            index={1}
                            attribute={ valores }
                            setAttribute={ setValores }
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
                        <FileInput 
                            text={"Diário Oficial:"}
                            files={diario}
                            setFiles={setDiario}
                            isNotMandatory={false}
                        ></FileInput>

                    <h1 className="mt-5 text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
                    >Dados Bancários</h1>
                    
                    <div className="flex flex-col mx-7">
                        {/* Banco */}
                            <NormalInput
                                text="Banco:"
                                attribute={ banco }
                                setAttribute={ setBanco }
                                isNotMandatory={false}
                            ></NormalInput>

                        <div className="flex flex-row h-full w-full justify-between items-center gap-x-4">
                            {/* Agência */}
                            <NormalInput
                                    text="Agência"
                                    attribute={ agencia }
                                    setAttribute={ setAgencia }
                                    isNotMandatory={false}
                                ></NormalInput>

                            {/* Conta Corrente */}
                            <GrowInput
                                    text="Conta Corrente:"
                                    attribute={ conta }
                                    setAttribute={ setConta }
                                    isNotMandatory={false}
                                ></GrowInput>
                        </div>
                    </div>
                    

                    {/* Segmento do projeto */}
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

                    {/* Breve descrição do projeto */}
                        <LongInput
                            text="Breve descrição do projeto:"
                            attribute={ descricao }
                            setAttribute={ setDescricao }
                            isNotMandatory={false}
                        ></LongInput>

                    {/* Apresentação do projeto */}
                        <FileInput
                            text={"Apresentação do projeto:"}
                            files={apresentacao}
                            setFiles={setApresentacao}
                            isNotMandatory={false}
                        ></FileInput>

                    {/* Público beneficiado */}
                        <PublicoBeneficiadoInput 
                            text="Publico beneficiado:"
                            list={[
                                "Crianças",
                                "Adolescentes",
                                "Jovens",
                                "Adultos",
                                "Idosos",
                                "Outro:"
                            ]}
                            attribute={ publico }
                            setAttribute={ setPublico }
                            outroAttribute= { outroPublico }
                            setOutroAttribute= { setOutroPublico }
                            isNotMandatory={false}
                        ></PublicoBeneficiadoInput>

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

                    {/* Número de público direto que será impactado */}
                        <NumberInput
                            text="Número de público direto que será impactado:"
                            index={0}
                            attribute={ numPublico }
                            setAttribute={ setNumPublico }
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
                            attribute={ numeroLei }
                            setAttribute={ setNumeroLei }
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
                    
                    </div>

                    <div className="flex items-start w-full">
                        <button 
                            type="submit"
                            className="w-[110px] md:w-[150px] h-[59px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md ml-[3dvw] mb-10"
                            onClick={() => setCurrentPage(2)}
                        >Próxima página</button>
                    </div>
                </>
                )}
                {currentPage === 2 && (
                    <div className="flex flex-col w-full items-center gap-8 mt-10">
                        <div className="w-11/12">
                            <FileInput
                                text={"Formulário de compliance:"}
                                files={compliance}
                                setFiles={setCompliance}
                                isNotMandatory={false}
                            />
                            <FileInput
                                text={"Documentos adicionais:"}
                                files={documentos}
                                setFiles={setDocumentos}
                                isNotMandatory={true}
                            />
                            <div className="flex flex-row gap-x-2 items-center pt-7">
                                <input 
                                type="checkbox" 
                                className="w-[20px] h-[20px] focus:ring focus:ring-blue-fcsn accent-blue-fcsn cursor-pointer"
                                onChange={(select) => setTermosPrivacidade(select.target.checked)}/>
                                <p className="text-xl">Eu declaro ter lido e concordado com os termos de uso e a política de privacidade<span className="text-[#B15265]"> *</span></p>
                            </div>
                        </div>
                        <div className="flex flex-row w-11/12 justify-between gap-4">
                            <button
                                type="button"
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-gray-100 hover:bg-white rounded-[7px] text-md md:text-lg font-bold text-blue-fcsn cursor-pointer shadow-md mb-10"
                                onClick={() => setCurrentPage(1)}
                            >Página anterior</button>
                            <button
                                type="submit"
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10"
                            >Enviar</button>
                        </div>
                    </div>
                )}
            </form>
            <Toaster richColors />
            <Footer></Footer>
        </main>
    );
}